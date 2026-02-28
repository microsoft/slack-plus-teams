import { describe, it, expect } from "vitest";
import { toBlockKit } from "../../src/ui/blocks.js";
import type { BotResponse } from "../../src/types/index.js";

describe("toBlockKit", () => {
  it("converts a text-only response to a section block", () => {
    const response: BotResponse = { text: "Hello world" };
    const blocks = toBlockKit(response);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("section");
  });

  it("converts a card response with title, body, and facts", () => {
    const response: BotResponse = {
      text: "Status",
      card: {
        title: "System Status",
        body: "All services running",
        facts: [
          { label: "API", value: "OK" },
          { label: "DB", value: "OK" },
        ],
      },
    };

    const blocks = toBlockKit(response);
    expect(blocks).toHaveLength(3); // header + body + facts

    expect(blocks[0].type).toBe("header");
    expect(blocks[1].type).toBe("section");
    expect(blocks[2].type).toBe("section");

    const factsBlock = blocks[2] as { fields?: { text: string }[] };
    expect(factsBlock.fields).toHaveLength(2);
    expect(factsBlock.fields![0].text).toContain("*API*");
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
        ],
      },
    };

    const blocks = toBlockKit(response);
    const actionsBlock = blocks.find((b) => b.type === "actions") as {
      elements?: { style?: string; action_id?: string }[];
    };
    expect(actionsBlock).toBeDefined();
    expect(actionsBlock.elements).toHaveLength(2);
    expect(actionsBlock.elements![0].style).toBe("primary");
    expect(actionsBlock.elements![1].style).toBe("danger");
  });

  it("adds confirm object to buttons with confirm config", () => {
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
              title: "Sure?",
              text: "Cannot undo",
              confirmLabel: "Yes",
              denyLabel: "No",
            },
          },
        ],
      },
    };

    const blocks = toBlockKit(response);
    const actionsBlock = blocks.find((b) => b.type === "actions") as {
      elements?: Record<string, unknown>[];
    };
    const btn = actionsBlock.elements![0];
    expect(btn.confirm).toBeDefined();

    const confirm = btn.confirm as Record<string, unknown>;
    const confirmBtn = confirm.confirm as Record<string, unknown>;
    expect(confirmBtn.text).toBe("Yes");
  });

  it("includes image block when imageUrl is set", () => {
    const response: BotResponse = {
      text: "Image",
      card: {
        title: "Photo",
        body: "Nice pic",
        imageUrl: "https://example.com/img.png",
      },
    };

    const blocks = toBlockKit(response);
    const imageBlock = blocks.find((b) => b.type === "image") as Record<string, unknown>;
    expect(imageBlock).toBeDefined();
    expect(imageBlock.image_url).toBe("https://example.com/img.png");
  });
});
