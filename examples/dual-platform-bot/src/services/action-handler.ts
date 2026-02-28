/**
 * Card/button action dispatcher.
 *
 * Handles actions triggered by Adaptive Card buttons (Teams) or
 * Block Kit buttons (Slack). Platform-agnostic — returns BotResponse.
 */

import type { BotResponse, ConversationContext } from "../types/index.js";

export type ActionHandler = (
  data: Record<string, unknown>,
  context: ConversationContext
) => Promise<BotResponse>;

const actions = new Map<string, ActionHandler>();

/** Register an action handler by action ID. */
export function registerAction(actionId: string, handler: ActionHandler): void {
  actions.set(actionId, handler);
}

/** Dispatch an action by ID. Returns a response or a fallback message. */
export async function handleAction(
  actionId: string,
  data: Record<string, unknown>,
  context: ConversationContext
): Promise<BotResponse> {
  const handler = actions.get(actionId);
  if (!handler) {
    return { text: `Unknown action: ${actionId}` };
  }
  return handler(data, context);
}

/** Register built-in actions. Call once at startup. */
export function registerBuiltInActions(): void {
  registerAction("assign_ticket", async (_data, context) => ({
    text: `Ticket assigned to ${context.user.displayName}.`,
  }));

  registerAction("close_ticket", async (_data, context) => ({
    text: `Ticket closed by ${context.user.displayName}.`,
  }));
}
