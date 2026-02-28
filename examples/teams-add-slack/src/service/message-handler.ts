/**
 * Platform-agnostic business logic layer.
 *
 * This is the ORIGINAL Teams bot logic, extracted so both platforms can share it.
 * No platform imports — returns structured data that adapters render into
 * Block Kit (Slack) or Adaptive Cards (Teams).
 */

export interface CardAction {
  label: string;
  id: string;
  style?: "primary" | "danger";
}

export interface BotResponse {
  text: string;
  card?: {
    title: string;
    body: string;
    facts?: { label: string; value: string }[];
    actions?: CardAction[];
  };
}

/** Handle an incoming user message — shared across Slack and Teams. */
export async function handleMessage(
  text: string,
  userName: string
): Promise<BotResponse> {
  const lower = text.toLowerCase().trim();

  if (lower === "help") {
    return {
      text: "Here's what I can do:",
      card: {
        title: "Available Commands",
        body: "I respond to the following commands:",
        facts: [
          { label: "help", value: "Show this help card" },
          { label: "status", value: "Check system status" },
          { label: "ticket", value: "Create a support ticket" },
        ],
      },
    };
  }

  if (lower === "status") {
    return {
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
    };
  }

  return {
    text: `Got it, ${userName}. You said: "${text}"`,
  };
}

/** Handle a ticket creation request — shared across Slack and Teams. */
export async function handleCreateTicket(
  title: string,
  priority: string,
  createdBy: string
): Promise<BotResponse> {
  // In a real app, this would call a ticketing API
  const ticketId = Math.floor(Math.random() * 9000) + 1000;

  return {
    text: `Ticket #${ticketId} created.`,
    card: {
      title: `Ticket #${ticketId}`,
      body: title,
      facts: [
        { label: "Priority", value: priority },
        { label: "Created by", value: createdBy },
        { label: "Status", value: "Open" },
      ],
      actions: [
        { label: "Assign to me", id: "assign_ticket", style: "primary" },
        { label: "Close", id: "close_ticket", style: "danger" },
      ],
    },
  };
}

/** Handle a ticket action (assign, close) — shared across Slack and Teams. */
export async function handleTicketAction(
  action: string,
  ticketId: string,
  userName: string
): Promise<BotResponse> {
  if (action === "assign_ticket") {
    return { text: `Ticket ${ticketId} assigned to ${userName}.` };
  }
  if (action === "close_ticket") {
    return { text: `Ticket ${ticketId} closed by ${userName}.` };
  }
  return { text: `Unknown action: ${action}` };
}
