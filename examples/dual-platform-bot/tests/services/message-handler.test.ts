import { describe, it, expect, beforeAll } from "vitest";
import {
  handleMessage,
  registerBuiltInCommands,
} from "../../src/services/message-handler.js";
import { registerBuiltInActions } from "../../src/services/action-handler.js";
import type { ConversationContext } from "../../src/types/index.js";

const testContext: ConversationContext = {
  platform: "slack",
  channelId: "C123",
  user: {
    platformId: "U123",
    platform: "slack",
    displayName: "Test User",
  },
};

beforeAll(() => {
  registerBuiltInCommands();
  registerBuiltInActions();
});

describe("handleMessage", () => {
  it("returns help card for 'help'", async () => {
    const response = await handleMessage("help", testContext);
    expect(response.text).toBe("Here's what I can do:");
    expect(response.card).toBeDefined();
    expect(response.card!.title).toBe("Available Commands");
    expect(response.card!.facts).toBeDefined();
    expect(response.card!.facts!.length).toBeGreaterThan(0);
  });

  it("returns help card for '/help'", async () => {
    const response = await handleMessage("/help", testContext);
    expect(response.card?.title).toBe("Available Commands");
  });

  it("returns status card for 'status'", async () => {
    const response = await handleMessage("status", testContext);
    expect(response.text).toBe("All systems operational.");
    expect(response.card?.title).toBe("System Status");
    expect(response.card?.facts).toContainEqual({
      label: "API",
      value: "Operational",
    });
  });

  it("returns ticket card for 'ticket'", async () => {
    const response = await handleMessage("ticket Fix the login bug", testContext);
    expect(response.card).toBeDefined();
    expect(response.card!.title).toMatch(/^Ticket #\d+$/);
    expect(response.card!.body).toBe("Fix the login bug");
    expect(response.card!.actions).toBeDefined();
    expect(response.card!.actions!.length).toBe(2);
  });

  it("ticket close action has confirmation", async () => {
    const response = await handleMessage("ticket test", testContext);
    const closeAction = response.card!.actions!.find(
      (a) => a.id === "close_ticket"
    );
    expect(closeAction?.confirm).toBeDefined();
    expect(closeAction?.confirm?.title).toBe("Close Ticket");
  });

  it("returns echo for unknown text", async () => {
    const response = await handleMessage("hello world", testContext);
    expect(response.text).toContain("Test User");
    expect(response.text).toContain("hello world");
    expect(response.card).toBeUndefined();
  });

  it("works with Teams context too", async () => {
    const teamsContext: ConversationContext = {
      platform: "teams",
      channelId: "19:abc",
      user: {
        platformId: "aad-123",
        platform: "teams",
        displayName: "Teams User",
      },
    };
    const response = await handleMessage("status", teamsContext);
    expect(response.card?.title).toBe("System Status");
  });
});
