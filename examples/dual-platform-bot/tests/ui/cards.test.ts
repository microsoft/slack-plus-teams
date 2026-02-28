import { describe, it, expect } from "vitest";
import { toAdaptiveCard } from "../../src/ui/cards.js";
import type { BotResponse } from "../../src/types/index.js";

describe("toAdaptiveCard", () => {
  it("converts a basic card response", () => {
    const response: BotResponse = {
      text: "Status update",
      card: {
        title: "System Status",
        body: "All good",
        facts: [{ label: "API", value: "Operational" }],
      },
    };

    const card = toAdaptiveCard(response) as Record<string, unknown>;
    expect(card.type).toBe("AdaptiveCard");
    expect(card.version).toBe("1.5");

    const body = card.body as object[];
    expect(body).toHaveLength(3); // title + body + factSet

    const title = body[0] as Record<string, unknown>;
    expect(title.type).toBe("TextBlock");
    expect(title.text).toBe("System Status");
    expect(title.size).toBe("Large");
    expect(title.weight).toBe("Bolder");

    const factSet = body[2] as Record<string, unknown>;
    expect(factSet.type).toBe("FactSet");
  });

  it("converts actions with style mapping", () => {
    const response: BotResponse = {
      text: "Actions",
      card: {
        title: "Test",
        body: "Test body",
        actions: [
          { label: "OK", id: "ok", style: "primary" },
          { label: "Delete", id: "delete", style: "danger" },
          { label: "Info", id: "info" },
        ],
      },
    };

    const card = toAdaptiveCard(response) as Record<string, unknown>;
    const actions = card.actions as Record<string, unknown>[];
    expect(actions).toHaveLength(3);
    expect(actions[0].style).toBe("positive");
    expect(actions[1].style).toBe("destructive");
    expect(actions[2].style).toBe("default");
  });

  it("builds Action.ShowCard for actions with confirm", () => {
    const response: BotResponse = {
      text: "Confirm test",
      card: {
        title: "Test",
        body: "Test body",
        actions: [
          {
            label: "Delete",
            id: "delete",
            style: "danger",
            confirm: {
              title: "Are you sure?",
              text: "This cannot be undone.",
              confirmLabel: "Yes, delete",
              denyLabel: "No",
            },
          },
        ],
      },
    };

    const card = toAdaptiveCard(response) as Record<string, unknown>;
    const actions = card.actions as Record<string, unknown>[];
    expect(actions[0].type).toBe("Action.ShowCard");
    expect(actions[0].title).toBe("Delete");

    const showCard = actions[0].card as Record<string, unknown>;
    expect(showCard.type).toBe("AdaptiveCard");

    const innerActions = showCard.actions as Record<string, unknown>[];
    expect(innerActions).toHaveLength(2);
    expect(innerActions[0].title).toBe("Yes, delete");
    expect((innerActions[0].data as Record<string, unknown>).confirmed).toBe(true);
  });

  it("converts mrkdwn to markdown in body", () => {
    const response: BotResponse = {
      text: "Markdown test",
      card: {
        title: "Test",
        body: "This is *bold* and ~struck~",
      },
    };

    const card = toAdaptiveCard(response) as Record<string, unknown>;
    const body = card.body as Record<string, unknown>[];
    expect(body[1].text).toBe("This is **bold** and ~~struck~~");
  });

  it("includes image when imageUrl is set", () => {
    const response: BotResponse = {
      text: "Image test",
      card: {
        title: "Photo",
        body: "Check it out",
        imageUrl: "https://example.com/img.png",
      },
    };

    const card = toAdaptiveCard(response) as Record<string, unknown>;
    const body = card.body as Record<string, unknown>[];
    const imageEl = body.find((b) => (b as Record<string, unknown>).type === "Image");
    expect(imageEl).toBeDefined();
    expect((imageEl as Record<string, unknown>).url).toBe("https://example.com/img.png");
  });
});
