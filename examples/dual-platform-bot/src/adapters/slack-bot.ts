/**
 * Slack adapter — Bolt + Socket Mode.
 *
 * Socket Mode uses an outbound WebSocket so there's no HTTP endpoint,
 * avoiding port conflicts with the Teams HTTP adapter.
 *
 * Registers slash commands from the command registry and routes
 * messages/actions through the shared service layer.
 */

import { App } from "@slack/bolt";
import type { AppConfig } from "../config/env.js";
import type { ConversationContext } from "../types/index.js";
import { handleMessage } from "../services/message-handler.js";
import { handleAction } from "../services/action-handler.js";
import { getAllCommands, getCommand } from "../services/command-registry.js";
import { toBlockKit } from "../ui/blocks.js";
import { resolveUser } from "../identity/identity-map.js";
import { logger } from "../middleware/logger.js";
import { setSlackStatus } from "../health/health-router.js";

export function createSlackApp(config: AppConfig): App {
  const app = new App({
    token: config.slackBotToken,
    appToken: config.slackAppToken,
    socketMode: true,
    signingSecret: config.slackSigningSecret,
  });

  // --- Message handler ---
  app.message(async ({ message, say, client }) => {
    if (message.subtype) return;

    const text = "text" in message ? message.text ?? "" : "";
    const userId = "user" in message ? message.user ?? "" : "";
    const channelId = "channel" in message ? message.channel ?? "" : "";
    const threadTs = "thread_ts" in message ? message.thread_ts : undefined;

    const user = await resolveUser(userId, "slack", userId, async () => {
      const info = await client.users.info({ user: userId });
      return info.user?.profile?.email;
    });

    const context: ConversationContext = {
      platform: "slack",
      channelId,
      threadId: threadTs,
      user,
    };

    const response = await handleMessage(text, context);

    if (response.card) {
      await say({
        text: response.text,
        blocks: toBlockKit(response),
        ...(response.threadReply && threadTs ? { thread_ts: threadTs } : {}),
        ...(response.broadcast ? { reply_broadcast: true } : {}),
      });
    } else {
      await say({
        text: response.text,
        ...(response.threadReply && threadTs ? { thread_ts: threadTs } : {}),
        ...(response.broadcast ? { reply_broadcast: true } : {}),
      });
    }
  });

  // --- Slash commands from registry ---
  for (const cmd of getAllCommands()) {
    app.command(`/${cmd.name}`, async ({ command, ack, respond, client }) => {
      await ack();

      const user = await resolveUser(command.user_id, "slack", command.user_name, async () => {
        const info = await client.users.info({ user: command.user_id });
        return info.user?.profile?.email;
      });

      const context: ConversationContext = {
        platform: "slack",
        channelId: command.channel_id,
        user,
      };

      const response = await cmd.handler(command.text, context);

      if (response.card) {
        await respond({
          text: response.text,
          blocks: toBlockKit(response),
          response_type: response.ephemeral ? "ephemeral" : "in_channel",
        });
      } else {
        await respond({
          text: response.text,
          response_type: response.ephemeral ? "ephemeral" : "in_channel",
        });
      }
    });
  }

  // --- Action handler (button clicks) ---
  // Register a catch-all action listener that routes through the action handler
  app.action(/.*/, async ({ action, ack, respond, body, client }) => {
    await ack();

    const actionId = "action_id" in action ? action.action_id : "";
    const userId = body.user?.id ?? "";
    const userName = body.user?.name ?? "User";

    const user = await resolveUser(userId, "slack", userName);

    const context: ConversationContext = {
      platform: "slack",
      channelId: "channel" in body ? (body.channel as { id: string })?.id ?? "" : "",
      user,
    };

    const data = "value" in action ? { value: action.value } : {};
    const response = await handleAction(actionId, data as Record<string, unknown>, context);

    await respond({ text: response.text, replace_original: false });
  });

  app.error(async (error) => {
    logger.error("Slack bot error", {
      platform: "slack",
      error: error.message,
    });
  });

  return app;
}

/** Start the Slack bot and update health status. */
export async function startSlackBot(app: App): Promise<void> {
  await app.start();
  setSlackStatus("connected");
  logger.info("Slack bot running via Socket Mode", { platform: "slack" });
}
