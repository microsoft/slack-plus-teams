/**
 * BotResponse → Adaptive Card JSON (for Teams).
 *
 * Conversions:
 *   - title → TextBlock Large/Bolder
 *   - body → TextBlock (mrkdwn → Markdown converted)
 *   - facts → FactSet
 *   - actions → Action.Submit (primary → positive, danger → destructive)
 *   - confirm → Action.ShowCard with confirm/cancel buttons
 *   - imageUrl → Image element
 */

import type { BotResponse, CardAction } from "../types/index.js";
import { mrkdwnToMarkdown } from "./markdown.js";

function buildAction(a: CardAction): object {
  const base = {
    type: "Action.Submit",
    title: a.label,
    style:
      a.style === "primary"
        ? "positive"
        : a.style === "danger"
          ? "destructive"
          : "default",
    data: { action: a.id },
  };

  // Y14: Confirmation dialogs — Teams uses Action.ShowCard
  if (a.confirm) {
    return {
      type: "Action.ShowCard",
      title: a.label,
      card: {
        type: "AdaptiveCard",
        body: [
          {
            type: "TextBlock",
            text: a.confirm.title,
            weight: "Bolder",
            wrap: true,
          },
          {
            type: "TextBlock",
            text: a.confirm.text,
            wrap: true,
          },
        ],
        actions: [
          {
            type: "Action.Submit",
            title: a.confirm.confirmLabel ?? "Confirm",
            style: "destructive",
            data: { action: a.id, confirmed: true },
          },
          {
            type: "Action.Submit",
            title: a.confirm.denyLabel ?? "Cancel",
            style: "default",
            data: { action: "cancel" },
          },
        ],
      },
    };
  }

  return base;
}

/** Convert a BotResponse to an Adaptive Card JSON object. */
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
      text: mrkdwnToMarkdown(response.card.body),
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

    if (response.card.imageUrl) {
      body.push({
        type: "Image",
        url: response.card.imageUrl,
        altText: response.card.title,
      });
    }
  }

  const actions = response.card?.actions?.map(buildAction);

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body,
    ...(actions?.length ? { actions } : {}),
  };
}
