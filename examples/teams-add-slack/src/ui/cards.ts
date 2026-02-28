/**
 * Adaptive Card builders for Teams.
 *
 * These are the ORIGINAL Teams UI builders — unchanged when adding Slack.
 */

import type { BotResponse } from "../service/message-handler.js";

export function toAdaptiveCard(response: BotResponse): object {
  const body: object[] = [];

  if (response.card) {
    body.push({
      type: "TextBlock",
      text: response.card.title,
      size: "Large",
      weight: "Bolder",
      wrap: true,
    });

    body.push({
      type: "TextBlock",
      text: response.card.body,
      wrap: true,
    });

    if (response.card.facts) {
      body.push({
        type: "FactSet",
        facts: response.card.facts.map((f) => ({
          title: f.label,
          value: f.value,
        })),
      });
    }
  }

  const actions = response.card?.actions?.map((a) => ({
    type: "Action.Submit",
    title: a.label,
    style: a.style === "primary" ? "positive" : a.style === "danger" ? "destructive" : "default",
    data: { action: a.id, ...a.data },
  }));

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body,
    ...(actions ? { actions } : {}),
  };
}
