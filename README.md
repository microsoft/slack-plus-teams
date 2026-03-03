# Slack + Teams Expert System

A knowledge base for AI coding agents that build, bridge, and deploy Slack and Teams bots. This is **not** a library or framework — it's a collection of 107 micro-expert files that teach AI agents (Claude Code, GitHub Copilot, Cursor) how to work with both platforms.

## Executive Summary

### The Problem

Organizations running both Slack and Microsoft Teams face a persistent challenge: the two platforms have fundamentally different APIs, UI systems, identity models, and deployment targets. The institutional knowledge required to bridge them is deep, scattered, and error-prone — and general-purpose AI tools lack reliable coverage of both ecosystems.

### How It Works

- **Intelligent Routing** — A root dispatcher scans the developer's request and loads only the relevant experts (Teams, Slack, Bridge, Models, Deploy, Security), keeping AI context lean and focused.
- **Cross-Platform Bridging** — 27 dedicated bridge experts cover every conversion category: UI (Block Kit vs. Adaptive Cards), events, identity/SSO, file handling, transport, and infrastructure — each with a GREEN/YELLOW/RED gap analysis.
- **Guided Interview Protocol** — Every task begins with a structured scoping interview so the AI makes the right architectural decisions before writing code.
- **Working References** — Three functional TypeScript example projects demonstrate building from scratch, adding Teams to Slack, and adding Slack to Teams.

### Key Numbers

| | |
|---|---|
| **Expert files** | 107 across 7 domains |
| **Bridge experts** | 27 (the core differentiator) |
| **Example projects** | 3 working TypeScript bots |
| **Supported AI providers** | 8 (OpenAI, Azure, Anthropic, Bedrock, etc.) |
| **Cloud deploy targets** | Azure & AWS (5 experts) |
| **Language tiers** | 4 (TS/JS, Python, Java/C#, REST-only) |

### Target Audience

Development teams building or maintaining bots on Slack and/or Microsoft Teams who use AI-assisted development workflows. Particularly valuable for organizations migrating a bot from one platform to the other or adding a second platform to an existing bot.

### Strategic Value

This is **structured prompt engineering at scale** — a domain-specific knowledge system that converts AI coding agents from general assistants into platform specialists. It reduces cross-platform bot development from weeks of trial-and-error into a guided, repeatable process, lowering both risk and time-to-delivery.

## What's Inside

| Directory | Contents | Count |
|---|---|---|
| `experts/` | Micro-expert Markdown files organized by domain | 107 files |
| `docs/` | Platform comparison guides (Slack vs Teams) | 10 files |
| `examples/` | Working TypeScript projects | 3 projects |
| `evals/` | Automated eval harness (routing, completeness, pattern compilation) | 354 tests |

## SDK Language Support

| Tier | Language | Slack SDK | Teams SDK | Support Level |
|---|---|---|---|---|
| **1: Full SDK** | TypeScript / JavaScript | `@slack/bolt` | `@microsoft/teams-ai` v2 | Full expert system. All experts target TS. Recommended. |
| **2: Full SDK (adapt)** | Python | `slack_bolt` | `teams-ai` Python / M365 Agents SDK | Both SDKs exist. Expert patterns apply — adapt TS snippets to Python. |
| **3: Split SDK** | Java | `slack-bolt-java` | None (Bot Framework archived EOY 2025) | Slack SDK only. Use REST for Teams, or dual codebase. |
| **3: Split SDK** | C# | None | Teams SDK .NET / M365 Agents SDK .NET | Teams SDK only. Use REST for Slack, or dual codebase. |
| **4: No SDK** | Go, Ruby, Rust, others | None | None | REST-only for both platforms. See `experts/bridge/rest-only-integration-ts.md`. |

## Quick Start

### 1. Clone alongside your project

```
your-workspace/
  your-bot-project/
  slack-plus-teams/     ← this repo
```

### 2. Tell your AI agent to read the onboarding playbook

```
Read slack-plus-teams/ONBOARD.md and follow its steps for my project.
```

The playbook will analyze your project, detect your stack, and load the right experts automatically.

### 3. Or copy the experts into your project

```bash
cp -r slack-plus-teams/experts/ your-bot-project/experts/
```

Then tell your AI agent: `Read experts/index.md and help me with my task.`

## Using with Claude Code

Claude Code can reference expert files directly. Two approaches:

**Reference from the cloned repo** — Point Claude at the repo:
```
Read ../slack-plus-teams/experts/index.md, then help me add Teams support to my Slack bot.
```

**Copy experts into your project** — Copy the `experts/` folder into your project root, then reference `experts/index.md` in your `CLAUDE.md` or prompts.

## Using with GitHub Copilot

This repo includes `.github/copilot-instructions.md` which configures Copilot code review behavior. For Copilot Chat:

1. Copy `experts/` into your project root (do **not** use a `.experts/` dot-prefix — Copilot ignores dot-prefixed folders)
2. Reference experts in Copilot Chat: `@workspace Read experts/index.md and help me migrate my Slack bot to Teams`

## Expert Domains

| Domain | Experts | What It Covers |
|---|---|---|
| **teams/** | 35 | Teams AI SDK, Adaptive Cards, Bot Framework, SSO, Graph API, Python SDK, .NET SDK, Agents Toolkit |
| **bridge/** | 26 | Cross-platform bridging, Block Kit ↔ Adaptive Cards, REST-only patterns, Python cross-platform |
| **slack/** | 18 | Slack Bolt, Block Kit, events, OAuth, assistant containers, Socket Mode, Web API, shortcuts, modals, Python SDK, Java SDK, Slack CLI |
| **convert/** | 8 | Language conversion to TypeScript (JS, Ruby, Java, Kotlin) |
| **models/** | 7 | AI model providers (OpenAI, Anthropic, Bedrock, Foundry, OSS) |
| **deploy/** | 4 | Azure and AWS deployment (App Service, Functions, Lambda, ECS) |
| **security/** | 2 | Input validation, secrets management |

Plus 7 domain index routers and 6 root-level utility files (router, fallback, template, analyzer, researcher, builder).

## Platform Comparison Docs

The `docs/` directory contains detailed Slack vs Teams comparison guides:

- [Feature Gaps](docs/feature-gaps.md) — Complete RED/YELLOW gap inventory with mitigations
- [Messaging & Commands](docs/messaging-and-commands.md) — Messages, slash commands, threading
- [UI Components](docs/ui-components.md) — Block Kit vs Adaptive Cards, modals vs dialogs
- [Interactive Responses](docs/interactive-responses.md) — Ephemeral messages, button actions
- [Identity & Auth](docs/identity-and-auth.md) — OAuth, SSO, user mapping
- [Files & Links](docs/files-and-links.md) — File uploads, link unfurling
- [Middleware & Handlers](docs/middleware-and-handlers.md) — Middleware chains, ack(), error handling
- [Advanced Features](docs/advanced-features.md) — Scheduling, workflows, shortcuts
- [Infrastructure](docs/infrastructure.md) — Transport, compute, storage, observability

## Example Projects

| Example | Description |
|---|---|
| `examples/dual-platform-bot/` | A bot that runs on both Slack and Teams from a single codebase |
| `examples/slack-add-teams/` | An existing Slack bot with Teams support added |
| `examples/teams-add-slack/` | An existing Teams bot with Slack support added |

## Eval Harness

The `evals/` directory contains an automated test harness that validates the expert system. Run it after editing experts to catch regressions.

```bash
cd evals && npm install
npm run eval:patterns    # No API key — checks all TypeScript code examples compile
npm run eval             # Full suite (needs OPENAI_API_KEY in .env)
```

Three dimensions: **routing accuracy** (do queries route to the right experts?), **expert completeness** (do experts cover required concepts?), and **pattern compilation** (do code examples parse?). See [`evals/README.md`](evals/README.md) for details.
