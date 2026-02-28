/**
 * BotResponse → Block Kit (for Slack).
 *
 * Conversions:
 *   - title → header block
 *   - body → section (mrkdwn)
 *   - facts → section with fields
 *   - actions → button elements (primary/danger styles)
 *   - confirm → native confirm object on button
 *   - imageUrl → image block
 */

import type { KnownBlock } from "@slack/bolt";
import type { BotResponse, CardAction } from "../types/index.js";

function buildButton(a: CardAction): object {
  const btn: Record<string, unknown> = {
    type: "button",
    text: { type: "plain_text", text: a.label },
    action_id: a.id,
  };

  if (a.style === "primary") btn.style = "primary";
  else if (a.style === "danger") btn.style = "danger";

  // Y14: Confirmation dialogs — Slack uses native confirm object
  if (a.confirm) {
    btn.confirm = {
      title: { type: "plain_text", text: a.confirm.title },
      text: { type: "mrkdwn", text: a.confirm.text },
      confirm: {
        type: "plain_text",
        text: a.confirm.confirmLabel ?? "Confirm",
      },
      deny: { type: "plain_text", text: a.confirm.denyLabel ?? "Cancel" },
    };
  }

  return btn;
}

/** Convert a BotResponse to Slack Block Kit blocks. */
export function toBlockKit(response: BotResponse): KnownBlock[] {
  if (!response.card) {
    return [
      {
        type: "section",
        text: { type: "mrkdwn", text: response.text },
      },
    ];
  }

  const blocks: KnownBlock[] = [];

  blocks.push({
    type: "header",
    text: { type: "plain_text", text: response.card.title },
  });

  blocks.push({
    type: "section",
    text: { type: "mrkdwn", text: response.card.body },
  });

  if (response.card.facts) {
    blocks.push({
      type: "section",
      fields: response.card.facts.map((f) => ({
        type: "mrkdwn" as const,
        text: `*${f.label}*\n${f.value}`,
      })),
    });
  }

  if (response.card.imageUrl) {
    blocks.push({
      type: "image",
      image_url: response.card.imageUrl,
      alt_text: response.card.title,
    });
  }

  if (response.card.actions) {
    blocks.push({
      type: "actions",
      elements: response.card.actions.map(buildButton),
    } as KnownBlock);
  }

  return blocks;
}
