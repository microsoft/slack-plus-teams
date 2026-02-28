/**
 * Platform-agnostic message handler.
 *
 * Receives normalized text and context — no platform SDK imports.
 * Routes to the command registry or returns a default response.
 */

import type { BotResponse, ConversationContext } from "../types/index.js";
import {
  matchCommand,
  getAllCommands,
  registerCommand,
} from "./command-registry.js";

/** Register built-in commands. Call once at startup. */
export function registerBuiltInCommands(): void {
  registerCommand({
    name: "help",
    description: "Show available commands",
    handler: async () => {
      const cmds = getAllCommands();
      return {
        text: "Here's what I can do:",
        card: {
          title: "Available Commands",
          body: "I respond to the following commands:",
          facts: cmds.map((c) => ({ label: c.name, value: c.description })),
        },
      };
    },
  });

  registerCommand({
    name: "status",
    description: "Check system status",
    handler: async () => ({
      text: "All systems operational.",
      card: {
        title: "System Status",
        body: "Current status of all services:",
        facts: [
          { label: "API", value: "Operational" },
          { label: "Database", value: "Operational" },
          { label: "Queue", value: "Operational" },
        ],
      },
    }),
  });

  registerCommand({
    name: "ticket",
    description: "Create a support ticket",
    handler: async (_args, context) => {
      const ticketId = Math.floor(Math.random() * 9000) + 1000;
      return {
        text: `Ticket #${ticketId} created.`,
        card: {
          title: `Ticket #${ticketId}`,
          body: _args || "New support ticket",
          facts: [
            { label: "Created by", value: context.user.displayName },
            { label: "Status", value: "Open" },
          ],
          actions: [
            { label: "Assign to me", id: "assign_ticket", style: "primary" },
            {
              label: "Close",
              id: "close_ticket",
              style: "danger",
              confirm: {
                title: "Close Ticket",
                text: "Are you sure you want to close this ticket?",
                confirmLabel: "Close",
                denyLabel: "Cancel",
              },
            },
          ],
        },
      };
    },
  });
}

/** Handle an incoming message — routes to commands or returns a default echo. */
export async function handleMessage(
  text: string,
  context: ConversationContext
): Promise<BotResponse> {
  const match = matchCommand(text);
  if (match) {
    return match.command.handler(match.args, context);
  }

  return {
    text: `Got it, ${context.user.displayName}. You said: "${text}"`,
  };
}
