/**
 * Y2: Thread broadcast — reply in thread AND post to channel.
 *
 * Slack: Single call with reply_broadcast: true.
 * Teams: Two calls — reply() to the thread + send() to the channel.
 */

import type { BotResponse, ConversationContext } from "../types/index.js";
import { logger } from "../middleware/logger.js";

/**
 * Send a reply that appears in both the thread and the main channel.
 *
 * @param response - The message to broadcast
 * @param context - Must include threadId
 * @param slackBroadcast - Slack: posts with reply_broadcast: true
 * @param teamsReplyAndSend - Teams: calls reply() then send()
 */
export async function broadcastReply(
  response: BotResponse,
  context: ConversationContext,
  slackBroadcast: (response: BotResponse, context: ConversationContext) => Promise<void>,
  teamsReplyAndSend: (response: BotResponse, context: ConversationContext) => Promise<void>
): Promise<void> {
  if (!context.threadId) {
    logger.warn("broadcastReply called without threadId, falling back to channel send", {
      platform: context.platform,
    });
  }

  logger.debug("Broadcasting reply to thread + channel", {
    platform: context.platform,
    channelId: context.channelId,
    threadId: context.threadId,
  });

  if (context.platform === "slack") {
    await slackBroadcast(response, context);
  } else {
    await teamsReplyAndSend(response, context);
  }
}
