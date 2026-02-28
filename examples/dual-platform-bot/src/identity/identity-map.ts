/**
 * Cross-platform identity resolution.
 *
 * Email is the shared identity key between Slack and Teams.
 * Uses lazy resolution — only looks up email when needed, then caches it.
 *
 * Slack: users.info → profile.email (requires users:read.email scope)
 * Teams: activity.from.aadObjectId → Graph API /users/{id} → mail
 */

import type { NormalizedUser, Platform } from "../types/index.js";
import { UserCache } from "./user-cache.js";
import { logger } from "../middleware/logger.js";

const cache = new UserCache<NormalizedUser>(30);

/**
 * Resolve a platform user to a NormalizedUser with email.
 * Pass platform-specific lookup functions from the adapter layer.
 */
export async function resolveUser(
  platformId: string,
  platform: Platform,
  displayName: string,
  lookupEmail?: () => Promise<string | undefined>
): Promise<NormalizedUser> {
  const cacheKey = `${platform}:${platformId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let email: string | undefined;
  if (lookupEmail) {
    try {
      email = await lookupEmail();
    } catch (err) {
      logger.warn("Email lookup failed", {
        platform,
        userId: platformId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const user: NormalizedUser = { platformId, platform, email, displayName };
  cache.set(cacheKey, user);
  return user;
}

/** Find a user by email across platforms (for cross-platform mentions, etc.). */
export function findByEmail(email: string): NormalizedUser | undefined {
  // Simple linear scan — fine for small user bases.
  // For larger deployments, maintain a reverse index.
  return undefined; // Requires iterating cache; implement as needed.
}
