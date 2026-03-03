/**
 * Teams adapter — ORIGINAL bot handler code.
 *
 * Uses the Teams SDK v2 (@microsoft/teams.apps). This file existed before
 * adding Slack support. The only change was extracting business logic into
 * the shared service layer (service/message-handler.ts).
 */

import { App } from "@microsoft/teams.apps";
import { ConsoleLogger } from "@microsoft/teams.common/logging";
import { DevtoolsPlugin } from "@microsoft/teams.dev";
import { handleMessage, handleTicketAction } from "../service/message-handler.js";
import { toAdaptiveCard } from "../ui/cards.js";

export function createTeamsApp(): App {
  const app = new App({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    tenantId: process.env.TENANT_ID,
    logger: new ConsoleLogger("teams-bot", { level: "info" }),
    plugins: [new DevtoolsPlugin()],
  });

  // Handle incoming messages
  app.on("message", async ({ activity, send }) => {
    const text = activity.text ?? "";
    const userName = activity.from?.name ?? "User";

    const response = await handleMessage(text, userName);

    if (response.card) {
      await send({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: toAdaptiveCard(response),
          },
        ],
      });
    } else {
      await send(response.text);
    }
  });

  // Handle Adaptive Card action submissions
  app.on("card.action", async ({ activity, send }) => {
    const data = activity.value?.action?.data as
      | { action: string; ticketId?: string }
      | undefined;

    if (!data?.action) return;

    const userName = activity.from?.name ?? "User";
    const response = await handleTicketAction(
      data.action,
      data.ticketId ?? "unknown",
      userName
    );

    await send(response.text);
  });

  app.event("error", ({ error, log }) => {
    log.error("Teams bot error:", error);
  });

  return app;
}
