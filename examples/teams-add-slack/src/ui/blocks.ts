/**
 * Block Kit builders for Slack.
 *
 * NEW — added when introducing Slack support.
 * Converts the platform-agnostic BotResponse into Slack Block Kit format.
 *
 * Key conversions from Adaptive Cards → Block Kit:
 *   - TextBlock Large/Bolder → header block
 *   - FactSet → section with fields
 *   - Action.Submit → button elements (positive → primary, destructive → danger)
 *   - **bold** Markdown → *bold* mrkdwn
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

  // Title → header block (was TextBlock Large/Bolder in Adaptive Cards)
  blocks.push({
    type: "header",
    text: { type: "plain_text", text: response.card.title },
  });

  // Body → section
  blocks.push({
    type: "section",
    text: { type: "mrkdwn", text: response.card.body },
  });

  // Facts → section with fields (was FactSet in Adaptive Cards)
  if (response.card.facts) {
    blocks.push({
      type: "section",
      fields: response.card.facts.map((f) => ({
        type: "mrkdwn" as const,
        text: `*${f.label}*\n${f.value}`,
      })),
    });
  }

  // Actions → button elements (positive → primary, destructive → danger)
  if (response.card.actions) {
    blocks.push({
      type: "actions",
      elements: response.card.actions.map((a) => ({
        type: "button" as const,
        text: { type: "plain_text" as const, text: a.label },
        action_id: a.id,
        ...(a.data ? { value: JSON.stringify(a.data) } : {}),
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
