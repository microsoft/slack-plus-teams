/**
 * Slack adapter — NEW, added when introducing Slack support.
 *
 * Uses Slack Bolt (@slack/bolt) in Socket Mode so it can run alongside the
 * Teams HTTP endpoint without port conflicts.
 *
 * Key bridging decisions (from cross-platform-advisor):
 *   - Socket Mode for Slack (no HTTP endpoint needed) + HTTP for Teams
 *   - Adaptive Card Action.Submit → Slack button with action_id
 *   - FactSet → section with fields in mrkdwn
 *   - card.action handler → app.action() handler
 */

import { App } from "@slack/bolt";
import { handleMessage, handleTicketAction } from "../service/message-handler.js";
import { toBlockKit } from "../ui/blocks.js";

export function createSlackApp(): App {
  const app = new App({
    token: process.env.SLACK_BOT_TOKEN!,
    appToken: process.env.SLACK_APP_TOKEN!,
    socketMode: true, // No HTTP needed — avoids port conflict with Teams
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
  });

  // Handle incoming messages (equivalent of Teams app.on("message"))
  app.message(async ({ message, say }) => {
    if (message.subtype) return; // Skip edits, deletes, bot messages

    const text = "text" in message ? message.text ?? "" : "";
    const userId = "user" in message ? message.user ?? "" : "";
    const response = await handleMessage(text, userId);

    if (response.card) {
      await say({
        text: response.text, // Fallback for notifications
        blocks: toBlockKit(response),
      });
    } else {
      await say(response.text);
    }
  });

  // Handle button actions (equivalent of Teams card.action handler)
  // In Teams these were Action.Submit with data.action — in Slack they're
  // button elements with action_id.
  app.action("assign_ticket", async ({ ack, respond, body }) => {
    await ack();
    const userName = body.user?.name ?? "User";
    const response = await handleTicketAction("assign_ticket", "unknown", userName);
    await respond({ text: response.text, replace_original: false });
  });

  app.action("close_ticket", async ({ ack, respond, body }) => {
    await ack();
    const userName = body.user?.name ?? "User";
    const response = await handleTicketAction("close_ticket", "unknown", userName);
    await respond({ text: response.text, replace_original: false });
  });

  app.error(async (error) => {
    console.error("Slack bot error:", error);
  });

  return app;
}
