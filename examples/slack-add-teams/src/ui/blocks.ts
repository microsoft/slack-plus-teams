/**
 * Block Kit builders for Slack.
 *
 * These are the ORIGINAL Slack UI builders — unchanged when adding Teams.
 */

import type { KnownBlock } from "@slack/bolt";
import type { BotResponse } from "../service/message-handler.js";

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

  // Title → header
  blocks.push({
    type: "header",
    text: { type: "plain_text", text: response.card.title },
  });

  // Body → section
  blocks.push({
    type: "section",
    text: { type: "mrkdwn", text: response.card.body },
  });

  // Facts → section with fields
  if (response.card.facts) {
    blocks.push({
      type: "section",
      fields: response.card.facts.map((f) => ({
        type: "mrkdwn" as const,
        text: `*${f.label}*\n${f.value}`,
      })),
    });
  }

  // Image
  if (response.card.imageUrl) {
    blocks.push({
      type: "image",
      image_url: response.card.imageUrl,
      alt_text: response.card.title,
    });
  }

  // Actions → buttons
  if (response.card.actions) {
    blocks.push({
      type: "actions",
      elements: response.card.actions.map((a) => ({
        type: "button" as const,
        text: { type: "plain_text" as const, text: a.label },
        action_id: a.id,
        ...(a.style === "primary"
          ? { style: "primary" as const }
          : a.style === "danger"
            ? { style: "danger" as const }
            : {}),
      })),
    });
  }

  return blocks;
}
