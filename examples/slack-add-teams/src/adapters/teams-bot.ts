/**
 * Teams adapter — NEW, added when introducing Teams support.
 *
 * Uses the Teams SDK v2 (@microsoft/teams.apps).
 *
 * Key bridging decisions (from cross-platform-advisor):
 *   - Slack app.message() → Teams app.on("message")
 *   - Slack slash commands (/weather, /poll) → Teams text commands (typed in chat)
 *   - Block Kit buttons (action_id) → Adaptive Card Action.Submit (data.action)
 *   - *bold* mrkdwn → **bold** standard Markdown
 *   - button style primary/danger → positive/destructive
 *   - Slack ack() has no equivalent — Teams handles acknowledgement automatically
 */

import { App } from "@microsoft/teams.apps";
import { ConsoleLogger } from "@microsoft/teams.common";
import { DevtoolsPlugin } from "@microsoft/teams.dev";
import {
  handleMessage,
  handlePollVote,
  handleSlashCommand,
} from "../service/message-handler.js";
import { toAdaptiveCard } from "../ui/cards.js";

export function createTeamsApp(): App {
  const app = new App({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    tenantId: process.env.TENANT_ID,
    logger: new ConsoleLogger("teams-bot", { level: "info" }),
    plugins: [new DevtoolsPlugin()],
  });

  // Handle messages — equivalent of Slack's app.message()
  app.on("message", async (ctx) => {
    const text = ctx.activity.text?.trim() ?? "";
    const userName = ctx.activity.from?.name ?? "User";

    // Slash commands don't exist in Teams — detect command-like patterns
    // and route to the same handler. E.g., "weather" or "/weather" both work.
    const commandMatch = text.match(/^\/?(\w+)\s*(.*)/);
    if (commandMatch) {
      const [, command, args] = commandMatch;
      if (command === "weather" || command === "poll") {
        const response = await handleSlashCommand(command, args, userName);
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
        return;
      }
    }

    // Regular message handling
    const response = await handleMessage(text, userName);

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

  // Handle Adaptive Card Action.Submit — equivalent of Slack's app.action()
  // In Slack these were button clicks firing app.action("poll_yes") etc.
  // In Teams they're Action.Submit with data: { action: "poll_yes" }.
  app.on("card.action", async (ctx) => {
    const data = ctx.activity.value?.action?.data as
      | { action: string }
      | undefined;

    if (!data?.action) return;

    const userName = ctx.activity.from?.name ?? "User";
    const response = await handlePollVote(data.action, userName);
    await ctx.send(response.text);
  });

  app.event("error", ({ error, log }) => {
    log.error("Teams bot error:", error);
  });

  return app;
}
