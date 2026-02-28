/**
 * Dual-platform entry point — Slack bot with Teams support added.
 *
 * Architecture (from cross-platform-architecture-ts expert):
 *   - Slack: Socket Mode (WebSocket, original transport — unchanged)
 *   - Teams: HTTP endpoint on port 3978 (new — app.start() serves /api/messages)
 *   - Both bots share the same service layer (service/message-handler.ts)
 *   - UI adapters convert BotResponse → Block Kit or Adaptive Cards
 *
 * Key difference from the teams-add-slack example:
 *   - There, Teams was original (HTTP) and Slack was added (Socket Mode)
 *   - Here, Slack is original (Socket Mode) and Teams is added (HTTP)
 *   - Same architecture, different starting point
 */

import { createSlackApp } from "./adapters/slack-bot.js";
import { createTeamsApp } from "./adapters/teams-bot.js";

async function main(): Promise<void> {
  // --- Slack bot (original) ---
  const slackApp = createSlackApp();
  await slackApp.start();
  console.log("Slack bot running via Socket Mode");

  // --- Teams bot (new) ---
  const teamsApp = createTeamsApp();
  await teamsApp.start(Number(process.env.PORT) || 3978);
  console.log("Teams bot running on :3978/api/messages");

  console.log("Both bots are live.");
}

main().catch(console.error);
