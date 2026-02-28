/**
 * Slack adapter — ORIGINAL bot handler code.
 *
 * Uses Slack Bolt (@slack/bolt). This file existed before adding Teams support.
 * The only change was extracting business logic into the shared service layer
 * (service/message-handler.ts).
 */

import { App } from "@slack/bolt";
import {
  handleMessage,
  handlePollVote,
  handleSlashCommand,
} from "../service/message-handler.js";
import { toBlockKit } from "../ui/blocks.js";

export function createSlackApp(): App {
  const app = new App({
    token: process.env.SLACK_BOT_TOKEN!,
    appToken: process.env.SLACK_APP_TOKEN!,
    socketMode: true,
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
  });

  // Handle messages
  app.message(async ({ message, say }) => {
    if (message.subtype) return;

    const text = "text" in message ? message.text ?? "" : "";
    const userId = "user" in message ? message.user ?? "" : "";
    const response = await handleMessage(text, userId);

    if (response.card) {
      await say({ text: response.text, blocks: toBlockKit(response) });
    } else {
      await say(response.text);
    }
  });

  // Slash commands
  app.command("/weather", async ({ ack, say, command }) => {
    await ack();
    const response = await handleSlashCommand(
      "/weather",
      command.text,
      command.user_name
    );
    if (response.card) {
      await say({ text: response.text, blocks: toBlockKit(response) });
    } else {
      await say(response.text);
    }
  });

  app.command("/poll", async ({ ack, say, command }) => {
    await ack();
    const response = await handleSlashCommand(
      "/poll",
      command.text,
      command.user_name
    );
    if (response.card) {
      await say({ text: response.text, blocks: toBlockKit(response) });
    } else {
      await say(response.text);
    }
  });

  // Poll vote actions (button clicks)
  for (const actionId of ["poll_yes", "poll_no", "poll_maybe"]) {
    app.action(actionId, async ({ ack, respond, body }) => {
      await ack();
      const userName = body.user?.name ?? "User";
      const response = await handlePollVote(actionId, userName);
      await respond({ text: response.text, replace_original: false });
    });
  }

  app.error(async (error) => {
    console.error("Slack bot error:", error);
  });

  return app;
}
