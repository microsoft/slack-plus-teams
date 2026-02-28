/**
 * Adaptive Card builders for Teams.
 *
 * NEW — added when introducing Teams support.
 * Converts the platform-agnostic BotResponse into Adaptive Card format.
 *
 * Key conversions from Block Kit → Adaptive Cards:
 *   - header block → TextBlock with size Large, weight Bolder
 *   - section with fields (*bold* mrkdwn) → FactSet
 *   - button (primary/danger) → Action.Submit (positive/destructive)
 *   - *bold* mrkdwn → **bold** standard Markdown
 *   - image block → Image element with altText (camelCase, not alt_text)
 */

import type { BotResponse } from "../service/message-handler.js";

export function toAdaptiveCard(response: BotResponse): object {
  const body: object[] = [];

  if (response.card) {
    // header → TextBlock Large/Bolder
    body.push({
      type: "TextBlock",
      text: response.card.title,
      size: "Large",
      weight: "Bolder",
      wrap: true,
    });

    // section → TextBlock (convert *bold* mrkdwn to **bold** Markdown)
    body.push({
      type: "TextBlock",
      text: mrkdwnToMarkdown(response.card.body),
      wrap: true,
    });

    // section fields → FactSet
    if (response.card.facts) {
      body.push({
        type: "FactSet",
        facts: response.card.facts.map((f) => ({
          title: f.label,
          value: f.value,
        })),
      });
    }

    // image → Image with altText
    if (response.card.imageUrl) {
      body.push({
        type: "Image",
        url: response.card.imageUrl,
        altText: response.card.title,
      });
    }
  }

  // buttons → Action.Submit (primary → positive, danger → destructive)
  const actions = response.card?.actions?.map((a) => ({
    type: "Action.Submit",
    title: a.label,
    style: a.style === "primary" ? "positive" : a.style === "danger" ? "destructive" : "default",
    data: { action: a.id },
  }));

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body,
    ...(actions ? { actions } : {}),
  };
}

/**
 * Convert Slack mrkdwn to standard Markdown for Adaptive Cards.
 *   *bold* → **bold**
 *   ~strike~ → ~~strike~~
 *   _italic_ stays _italic_ (same in both)
 */
function mrkdwnToMarkdown(text: string): string {
  return text
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "**$1**")
    .replace(/~([^~]+)~/g, "~~$1~~");
}
