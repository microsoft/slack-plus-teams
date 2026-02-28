# Slack vs Teams: Platform Differences & Bridging Strategies

A practical guide for developers adding cross-platform support to an existing bot. Each document covers a category of differences, explains why they matter, and provides concrete mitigation strategies with effort estimates.

## Documents

| Document | What It Covers |
|---|---|
| [**Feature Gaps**](feature-gaps.md) | **Complete inventory of every RED and YELLOW gap with mitigations in both directions** |
| [Messaging & Commands](messaging-and-commands.md) | Messages, slash commands, events, threading, @mentions |
| [UI Components](ui-components.md) | Block Kit vs Adaptive Cards, modals vs dialogs, App Home vs personal tabs |
| [Interactive Responses](interactive-responses.md) | Ephemeral messages, button actions, message updates, confirmation dialogs |
| [Identity & Auth](identity-and-auth.md) | User IDs, OAuth, signing/verification, tokens |
| [Files & Links](files-and-links.md) | File upload/download, link unfurling/previews |
| [Middleware & Handler Patterns](middleware-and-handlers.md) | Middleware chains, ack(), handler registration, error handling |
| [Advanced Features](advanced-features.md) | Scheduling, workflows, shortcuts, channel ops, reactions, distribution |
| [Infrastructure](infrastructure.md) | Transport, compute, storage, secrets, observability |

## How to Read These Docs

Each difference follows this format:

- **What's different** — the concrete behavioral gap
- **Impact** — what breaks or degrades if you ignore it
- **Mitigation** — one or more strategies ranked by effort and fidelity
- **Effort** — rough hours to implement

### Difficulty Ratings

| Rating | Meaning |
|---|---|
| GREEN | Direct mapping exists. Mechanical conversion, minimal design decisions. |
| YELLOW | Mapping exists but requires design decisions or trade-offs. |
| RED | Platform gap — no equivalent exists. Requires redesign or custom workaround. |
