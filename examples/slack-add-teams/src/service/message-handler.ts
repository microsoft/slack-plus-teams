/**
 * Platform-agnostic business logic layer.
 *
 * This is the ORIGINAL Slack bot logic, extracted so both platforms can share it.
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
    imageUrl?: string;
  };
}

/** Handle an incoming user message — shared across Slack and Teams. */
export async function handleMessage(
  text: string,
  userName: string
): Promise<BotResponse> {
  const lower = text.toLowerCase().trim();

  if (lower === "help" || lower === "/help") {
    return {
      text: "Here's what I can do:",
      card: {
        title: "Available Commands",
        body: "Type any of these to get started:",
        facts: [
          { label: "help", value: "Show this help card" },
          { label: "weather", value: "Check the weather" },
          { label: "poll", value: "Create a quick poll" },
        ],
      },
    };
  }

  if (lower === "weather") {
    return {
      text: "Current weather report",
      card: {
        title: "Weather Report",
        body: "San Francisco, CA",
        facts: [
          { label: "Temperature", value: "68°F / 20°C" },
          { label: "Conditions", value: "Partly cloudy" },
          { label: "Wind", value: "12 mph NW" },
          { label: "Humidity", value: "65%" },
        ],
      },
    };
  }

  if (lower.startsWith("poll ")) {
    const question = text.slice(5).trim();
    return {
      text: `Poll: ${question}`,
      card: {
        title: "Quick Poll",
        body: question || "What do you think?",
        actions: [
          { label: "Yes", id: "poll_yes", style: "primary" },
          { label: "No", id: "poll_no", style: "danger" },
          { label: "Maybe", id: "poll_maybe" },
        ],
      },
    };
  }

  return {
    text: `Hey ${userName}, you said: "${text}"`,
  };
}

/** Handle a poll vote — shared across Slack and Teams. */
export async function handlePollVote(
  vote: string,
  userName: string
): Promise<BotResponse> {
  const voteLabel =
    vote === "poll_yes" ? "Yes" : vote === "poll_no" ? "No" : "Maybe";

  return {
    text: `${userName} voted: ${voteLabel}`,
  };
}

/** Handle a slash command — shared across Slack and Teams. */
export async function handleSlashCommand(
  command: string,
  args: string,
  userName: string
): Promise<BotResponse> {
  if (command === "/weather" || command === "weather") {
    return handleMessage("weather", userName);
  }

  if (command === "/poll" || command === "poll") {
    return handleMessage(`poll ${args}`, userName);
  }

  return { text: `Unknown command: ${command}` };
}
