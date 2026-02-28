/**
 * Platform-agnostic response types.
 *
 * Service layer returns BotResponse objects — adapters render them
 * into Block Kit (Slack) or Adaptive Cards (Teams).
 */

export interface CardFact {
  label: string;
  value: string;
}

export interface CardAction {
  label: string;
  id: string;
  style?: "primary" | "danger";
  /** When true, the adapter wraps this action with a confirmation prompt. */
  confirm?: {
    title: string;
    text: string;
    confirmLabel?: string;
    denyLabel?: string;
  };
}

export interface BotResponse {
  text: string;
  card?: {
    title: string;
    body: string;
    facts?: CardFact[];
    actions?: CardAction[];
    imageUrl?: string;
  };
  /** When true, the message is only visible to the target user. */
  ephemeral?: boolean;
  /** When true, reply inside the thread. */
  threadReply?: boolean;
  /** When true, reply in thread AND broadcast to channel. */
  broadcast?: boolean;
}
