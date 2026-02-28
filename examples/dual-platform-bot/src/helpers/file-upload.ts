/**
 * Y4-6: File upload — send a file to a conversation.
 *
 * Slack: files.uploadV2() — single API call.
 * Teams: FileConsentCard flow (3-step consent) or Graph API upload.
 *   - FileConsentCard: bot sends consent card → user accepts → bot uploads.
 *   - Graph API: direct upload if the bot has Files.ReadWrite permissions.
 */

import type { ConversationContext } from "../types/index.js";
import { logger } from "../middleware/logger.js";

export interface FilePayload {
  filename: string;
  content: Buffer;
  contentType?: string;
  title?: string;
}

/**
 * Send a file to the conversation.
 *
 * @param file - File data (name, content buffer, MIME type)
 * @param context - Conversation context
 * @param slackUpload - Slack: calls files.uploadV2
 * @param teamsUpload - Teams: sends FileConsentCard or uses Graph API
 */
export async function sendFile(
  file: FilePayload,
  context: ConversationContext,
  slackUpload: (file: FilePayload, context: ConversationContext) => Promise<void>,
  teamsUpload: (file: FilePayload, context: ConversationContext) => Promise<void>
): Promise<void> {
  logger.debug("Uploading file", {
    platform: context.platform,
    filename: file.filename,
    size: file.content.length,
  });

  if (context.platform === "slack") {
    await slackUpload(file, context);
  } else {
    await teamsUpload(file, context);
  }
}
