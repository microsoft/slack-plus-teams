/**
 * Y14: Confirmation dialogs before destructive actions.
 *
 * Slack: Native `confirm` object on button elements.
 * Teams: Action.ShowCard with confirm/cancel Action.Submit buttons.
 *
 * This helper builds the platform-specific confirmation structure
 * from a CardAction with a `confirm` property. The UI builders
 * (cards.ts and blocks.ts) call this automatically.
 */

import type { CardAction } from "../types/index.js";

export interface ConfirmConfig {
  title: string;
  text: string;
  confirmLabel?: string;
  denyLabel?: string;
}

/** Build a Slack confirm composition object. */
export function buildSlackConfirm(config: ConfirmConfig): object {
  return {
    title: { type: "plain_text", text: config.title },
    text: { type: "mrkdwn", text: config.text },
    confirm: { type: "plain_text", text: config.confirmLabel ?? "Confirm" },
    deny: { type: "plain_text", text: config.denyLabel ?? "Cancel" },
  };
}

/** Build a Teams Action.ShowCard wrapping the original action with a confirm step. */
export function buildTeamsConfirmCard(
  action: CardAction,
  config: ConfirmConfig
): object {
  return {
    type: "Action.ShowCard",
    title: action.label,
    card: {
      type: "AdaptiveCard",
      body: [
        { type: "TextBlock", text: config.title, weight: "Bolder", wrap: true },
        { type: "TextBlock", text: config.text, wrap: true },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: config.confirmLabel ?? "Confirm",
          style: "destructive",
          data: { action: action.id, confirmed: true },
        },
        {
          type: "Action.Submit",
          title: config.denyLabel ?? "Cancel",
          style: "default",
          data: { action: "cancel" },
        },
      ],
    },
  };
}
