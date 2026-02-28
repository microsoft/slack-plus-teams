/**
 * Dual-platform entry point — Teams bot with Slack support added.
 *
 * Architecture (from cross-platform-architecture-ts expert):
 *   - Teams: HTTP endpoint on port 3978 (app.start() serves /api/messages)
 *   - Slack: Socket Mode (WebSocket, no HTTP endpoint needed)
 *   - Both bots share the same service layer (service/message-handler.ts)
 *   - UI adapters convert BotResponse → Adaptive Cards or Block Kit
 *
 * This is the simpler dual-bot pattern because Slack Socket Mode doesn't
 * need an HTTP endpoint, avoiding Express body-parsing conflicts.
 */

import { createTeamsApp } from "./adapters/teams-bot.js";
import { createSlackApp } from "./adapters/slack-bot.js";

async function main(): Promise<void> {
  // --- Teams bot (original) ---
  const teamsApp = createTeamsApp();
  await teamsApp.start(Number(process.env.PORT) || 3978);
  console.log("Teams bot running on :3978/api/messages");

  // --- Slack bot (new) ---
  const slackApp = createSlackApp();
  await slackApp.start();
  console.log("Slack bot running via Socket Mode");

  console.log("Both bots are live.");
}

main().catch(console.error);
