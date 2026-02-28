/**
 * Command registry — register once, works on both platforms.
 *
 * On Slack, commands are registered as /command via Bolt.
 * On Teams, commands are matched from message text (e.g., "status" or "/status").
 * The manifest.json commandLists should mirror what's registered here.
 */

import type { BotResponse, ConversationContext } from "../types/index.js";

export type CommandHandler = (
  args: string,
  context: ConversationContext
) => Promise<BotResponse>;

export interface CommandDefinition {
  name: string;
  description: string;
  handler: CommandHandler;
}

const commands = new Map<string, CommandDefinition>();

/** Register a command available on both platforms. */
export function registerCommand(definition: CommandDefinition): void {
  commands.set(definition.name.toLowerCase(), definition);
}

/** Look up a command by name (strips leading / if present). */
export function getCommand(name: string): CommandDefinition | undefined {
  const normalized = name.toLowerCase().replace(/^\//, "");
  return commands.get(normalized);
}

/**
 * Try to match a command from raw message text.
 * Used by the Teams adapter where commands arrive as plain text.
 * Returns the command definition and remaining args, or undefined.
 */
export function matchCommand(
  text: string
): { command: CommandDefinition; args: string } | undefined {
  const trimmed = text.trim();
  const firstSpace = trimmed.indexOf(" ");
  const word = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
  const args = firstSpace === -1 ? "" : trimmed.slice(firstSpace + 1).trim();

  const cmd = getCommand(word);
  if (cmd) return { command: cmd, args };

  return undefined;
}

/** Get all registered commands (useful for generating help text). */
export function getAllCommands(): CommandDefinition[] {
  return Array.from(commands.values());
}
