import type { Platform } from "./platform.js";

/** A user normalized across platforms — email is the shared identity key. */
export interface NormalizedUser {
  platformId: string;
  platform: Platform;
  email?: string;
  displayName: string;
}

/** Platform-agnostic conversation context passed to the service layer. */
export interface ConversationContext {
  platform: Platform;
  channelId: string;
  threadId?: string;
  user: NormalizedUser;
}
