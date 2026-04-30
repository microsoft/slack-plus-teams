/**
 * Message-Native Workflow Bot — Daily Standup
 *
 * Demonstrates the five-pillar vision from "Unifying Workflows at the Message Layer":
 *
 *   1. TRIGGER   — /standup command, scheduled cron, card actions
 *   2. STATE     — standup records persisted to SharePoint Lists (in-memory for demo)
 *   3. LOGIC     — form submission, edit flow, aggregation
 *   4. INTELLIGENCE — natural language queries via AI function calling
 *   5. VISIBILITY — Action.Execute cards that update in-place in threads
 *
 * All five pillars converge at the message layer. No external tools needed.
 * Users never leave the channel to initiate, complete, query, or review standups.
 *
 * To run:
 *   cp .env.sample .env  (fill in credentials)
 *   npm install
 *   npm run dev
 */

import { App } from "@microsoft/teams.apps";
import { ConsoleLogger } from "@microsoft/teams.common/logging";
import { DevtoolsPlugin } from "@microsoft/teams.dev";
import { registerStandupHandlers } from "./workflows/standup-handlers.js";

async function main(): Promise<void> {
  const app = new App({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    tenantId: process.env.TENANT_ID,
    logger: new ConsoleLogger("standup-bot", { level: "info" }),
    plugins: [new DevtoolsPlugin()],
  });

  // Register the standup workflow (all handlers, triggers, and AI queries)
  registerStandupHandlers(app);

  app.event("error", ({ error, log }) => {
    log.error("Bot error:", error);
  });

  const port = Number(process.env.PORT) || 3978;
  await app.start(port);
  console.log(`Standup bot running on :${port}/api/messages`);
  console.log("Pillars active: Triggers, State, Logic, Intelligence, Visibility");
}

main().catch(console.error);
