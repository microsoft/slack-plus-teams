/**
 * Y17: Retry with exponential backoff, jitter, and Retry-After support.
 *
 * Both Slack and Teams APIs can return rate-limit errors:
 *   - Slack: HTTP 429 with Retry-After header
 *   - Teams: HTTP 429 with Retry-After header
 *
 * This helper wraps any async function with configurable retry logic.
 */

import { logger } from "../middleware/logger.js";

export interface RetryOptions {
  /** Max number of retry attempts (default: 3). */
  maxRetries?: number;
  /** Base delay in ms before first retry (default: 1000). */
  baseDelayMs?: number;
  /** Max delay cap in ms (default: 30000). */
  maxDelayMs?: number;
  /** Jitter factor 0-1 (default: 0.5). */
  jitter?: number;
  /** If the error has a retryAfter (seconds), use it instead of calculated delay. */
  respectRetryAfter?: boolean;
}

interface RetryableError extends Error {
  status?: number;
  retryAfter?: number;
  headers?: { get?: (key: string) => string | null };
}

function getRetryAfterMs(error: RetryableError): number | undefined {
  // Check for retryAfter property (some SDKs set this)
  if (error.retryAfter) return error.retryAfter * 1000;

  // Check for Retry-After header
  const header = error.headers?.get?.("retry-after");
  if (header) {
    const seconds = Number(header);
    if (!isNaN(seconds)) return seconds * 1000;
  }

  return undefined;
}

function isRetryable(error: RetryableError): boolean {
  const status = error.status;
  if (status === 429) return true;  // Rate limited
  if (status === 503) return true;  // Service unavailable
  if (status === 502) return true;  // Bad gateway
  if (status && status >= 500) return true;
  return false;
}

function calculateDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  jitter: number
): number {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxDelayMs);
  const jitterAmount = capped * jitter * Math.random();
  return capped + jitterAmount;
}

/**
 * Wrap an async function with retry logic.
 *
 * @example
 * const result = await withRetry(() => slackClient.chat.postMessage({ ... }));
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    jitter = 0.5,
    respectRetryAfter = true,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const retryableErr = lastError as RetryableError;

      if (attempt === maxRetries || !isRetryable(retryableErr)) {
        throw lastError;
      }

      let delayMs = calculateDelay(attempt, baseDelayMs, maxDelayMs, jitter);

      if (respectRetryAfter) {
        const retryAfterMs = getRetryAfterMs(retryableErr);
        if (retryAfterMs) delayMs = retryAfterMs;
      }

      logger.warn(`Retrying after ${Math.round(delayMs)}ms (attempt ${attempt + 1}/${maxRetries})`, {
        error: lastError.message,
        status: retryableErr.status,
      });

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
