/**
 * R1: Ephemeral messages — visible only to one user.
 *
 * Slack: chat.postEphemeral() — native support.
 * Teams: No native equivalent.
 *   - For card responses: use refresh.userIds to show a per-user card.
 *   - Fallback: send a 1:1 (personal) chat message.
 */

import type { ConversationContext, BotResponse } from "../types/index.js";
import { logger } from "../middleware/logger.js";

/**
 * Send an ephemeral message. Each adapter provides its own send function.
 *
 * @param response - The message to send ephemerally
 * @param context - Conversation context with platform info
 * @param slackSend - Slack-specific: calls chat.postEphemeral
 * @param teamsSend - Teams-specific: sends to 1:1 chat or uses refresh.userIds
 */
export async function sendEphemeral(
  response: BotResponse,
  context: ConversationContext,
  slackSend: (response: BotResponse, context: ConversationContext) => Promise<void>,
  teamsSend: (response: BotResponse, context: ConversationContext) => Promise<void>
): Promise<void> {
  logger.debug("Sending ephemeral message", {
    platform: context.platform,
    userId: context.user.platformId,
  });

  if (context.platform === "slack") {
    await slackSend(response, context);
  } else {
    await teamsSend(response, context);
  }
}

/**
 * Build an Adaptive Card with refresh.userIds for per-user visibility on Teams.
 * The card body shows different content depending on who views it.
 */
export function buildRefreshCard(
  publicCard: object,
  privateCard: object,
  targetUserId: string
): object {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.6",
    refresh: {
      action: {
        type: "Action.Execute",
        title: "Refresh",
        verb: "personalView",
      },
      userIds: [targetUserId],
    },
    body: (publicCard as { body?: object[] }).body ?? [],
  };
}
