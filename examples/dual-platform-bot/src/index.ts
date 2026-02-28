/**
 * Dual-platform bot entry point.
 *
 * Architecture:
 *   - Teams: HTTP endpoint on port 3978 (app.start() serves /api/messages)
 *   - Slack: Socket Mode (WebSocket, no HTTP endpoint needed)
 *   - Both bots share the same service layer
 *   - Health endpoint on same port as Teams
 *
 * This is the simplest dual-bot pattern: Slack Socket Mode avoids
 * Express body-parsing conflicts and port collisions.
 */

import { loadConfig } from "./config/env.js";
import { setLogLevel } from "./middleware/logger.js";
import { logger } from "./middleware/logger.js";
import { registerBuiltInCommands } from "./services/message-handler.js";
import { registerBuiltInActions } from "./services/action-handler.js";
import { createTeamsApp, startTeamsBot } from "./adapters/teams-bot.js";
import { createSlackApp, startSlackBot } from "./adapters/slack-bot.js";
import type { LogLevel } from "./middleware/logger.js";

async function main(): Promise<void> {
  // Load and validate configuration
  const config = loadConfig();
  setLogLevel(config.logLevel as LogLevel);

  // Register commands and actions (shared across both platforms)
  registerBuiltInCommands();
  registerBuiltInActions();

  // --- Teams bot (HTTP on port 3978) ---
  const teamsApp = createTeamsApp(config);
  await startTeamsBot(teamsApp, config.port);

  // --- Slack bot (Socket Mode) ---
  const slackApp = createSlackApp(config);
  await startSlackBot(slackApp);

  logger.info("Both bots are live.", {
    platforms: "slack,teams",
    teamsPort: config.port,
  });
}

main().catch((err) => {
  logger.error("Fatal startup error", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(1);
});
