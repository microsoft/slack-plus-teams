# Copilot Code Review Instructions

## Review philosophy

**Approve by default.** This is a fast-moving project with example code and knowledge-base Markdown. Only flag issues that would cause runtime failures, security vulnerabilities, or silently wrong behavior. Do NOT comment on style, naming, minor inconsistencies, missing docs, or "nice to have" improvements. If a PR works correctly, approve it.

## What qualifies as a major issue (flag these)

- **Security**: Hardcoded secrets, credentials committed to source, missing auth validation, injection vulnerabilities.
- **Runtime errors**: Code that will crash or throw at runtime — wrong API usage, missing required fields, type mismatches that bypass the compiler.
- **Silent data loss or corruption**: Button actions that lose entity context (e.g., ticket ID never reaches the handler), state that gets silently overwritten, race conditions that drop messages.
- **Platform-breaking mistakes**: Using `activity.channelId` (the channel *type*, e.g. `"msteams"`) where a conversation identifier is needed. Calling `ack()` after async work in Slack (3-second timeout). Platform SDK imports in shared/service-layer code that should be platform-agnostic.
- **Broken routing or references**: `→ Read` paths in expert files pointing to directories that don't exist (e.g., `.experts/` when the actual directory is `experts/`).

## What to ignore (do NOT flag these)

- Style, formatting, or naming preferences
- Missing or stale comments, JSDoc, or header docs
- File inventory counts being slightly off in README
- Missing error handling that would only affect dev/local scenarios
- Package.json script portability (we develop on Windows with bash)
- Unused function parameters
- "Could be improved" suggestions
- dotenv loading patterns
- Audit trail comments in expert files
