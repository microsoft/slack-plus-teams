/**
 * Teams adapter — Teams SDK v2 + HTTP on port 3978.
 *
 * Uses @microsoft/teams.apps App class. Commands arrive as plain text
 * messages and are matched via the command registry.
 *
 * Card action buttons use Action.Submit with data.action to route
 * through the shared action handler.
 */

import { App } from "@microsoft/teams.apps";
import { ConsoleLogger } from "@microsoft/teams.common";
import { DevtoolsPlugin } from "@microsoft/teams.dev";
import type { AppConfig } from "../config/env.js";
import type { ConversationContext } from "../types/index.js";
import { handleMessage } from "../services/message-handler.js";
import { handleAction } from "../services/action-handler.js";
import { matchCommand } from "../services/command-registry.js";
import { toAdaptiveCard } from "../ui/cards.js";
import { resolveUser } from "../identity/identity-map.js";
import { logger } from "../middleware/logger.js";
import { setTeamsStatus } from "../health/health-router.js";

export function createTeamsApp(config: AppConfig): App {
  const app = new App({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    tenantId: config.tenantId,
    logger: new ConsoleLogger("teams-bot", { level: "info" }),
    plugins: [new DevtoolsPlugin()],
  });

  // --- Message handler ---
  app.on("message", async (ctx) => {
    const text = ctx.activity.text ?? "";
    const userName = ctx.activity.from?.name ?? "User";
    const fromId = ctx.activity.from?.aadObjectId ?? ctx.activity.from?.id ?? "";
    const channelId = ctx.activity.conversation?.id ?? "";
    const threadId = ctx.activity.replyToId;

    const user = await resolveUser(fromId, "teams", userName);

    const context: ConversationContext = {
      platform: "teams",
      channelId,
      threadId,
      user,
    };

    const response = await handleMessage(text, context);

    if (response.card) {
      await ctx.send({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: toAdaptiveCard(response),
          },
        ],
      });
    } else {
      await ctx.send(response.text);
    }
  });

  // --- Card action handler ---
  app.on("card.action", async (ctx) => {
    const data = ctx.activity.value?.action?.data as
      | Record<string, unknown>
      | undefined;

    if (!data?.action) return;

    const actionId = String(data.action);

    // Ignore cancel actions from confirmation cards
    if (actionId === "cancel") return;

    const userName = ctx.activity.from?.name ?? "User";
    const fromId = ctx.activity.from?.aadObjectId ?? ctx.activity.from?.id ?? "";
    const conversationId = ctx.activity.conversation?.id ?? "";

    const user = await resolveUser(fromId, "teams", userName);

    const context: ConversationContext = {
      platform: "teams",
      channelId: conversationId,
      user,
    };

    const response = await handleAction(actionId, data, context);

    if (response.card) {
      await ctx.send({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: toAdaptiveCard(response),
          },
        ],
      });
    } else {
      await ctx.send(response.text);
    }
  });

  app.event("error", ({ error, log }) => {
    logger.error("Teams bot error", {
      platform: "teams",
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return app;
}

/** Start the Teams bot on HTTP and update health status. */
export async function startTeamsBot(app: App, port: number): Promise<void> {
  await app.start(port);
  setTeamsStatus("connected");
  logger.info(`Teams bot running on :${port}/api/messages`, { platform: "teams" });
}
