import { logger } from "./logger.js";
import type { ConversationContext } from "../types/index.js";

/**
 * Wraps a handler function with structured error logging.
 * Returns a fallback text message on failure so the user gets feedback.
 */
export function withErrorHandler<T extends unknown[], R>(
  handlerName: string,
  fn: (...args: T) => Promise<R>,
  fallback: R
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`Handler "${handlerName}" failed`, {
        action: handlerName,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return fallback;
    }
  };
}

/**
 * Wraps a handler that receives ConversationContext as the last argument.
 * Enriches error logs with platform and user info.
 */
export function withContextErrorHandler<T extends unknown[]>(
  handlerName: string,
  fn: (...args: [...T, ConversationContext]) => Promise<void>
): (...args: [...T, ConversationContext]) => Promise<void> {
  return async (...args): Promise<void> => {
    const ctx = args[args.length - 1] as ConversationContext;
    try {
      await fn(...(args as [...T, ConversationContext]));
    } catch (error) {
      logger.error(`Handler "${handlerName}" failed`, {
        action: handlerName,
        platform: ctx.platform,
        userId: ctx.user.platformId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };
}
