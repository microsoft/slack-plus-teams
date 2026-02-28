# Bot Platform Expert System

A curated knowledge base for building conversational bots and AI agents across Slack and Microsoft Teams. These micro-experts guide AI coding assistants (Claude, Copilot, etc.) to produce correct, idiomatic code by loading only the relevant expertise for each task.

## Goals

1. **Accelerate bot development** by giving AI assistants deep, verified knowledge of both Slack and Teams SDKs — eliminating hallucinated APIs and outdated patterns.
2. **Support cross-platform scenarios** where a single team needs to ship bots on both Slack and Teams from the same codebase.
3. **Cover the full stack** from SDK initialization and webhook plumbing through AI integration, media handling, and infrastructure migration — not just "hello world" examples.
4. **Stay language-pragmatic** by focusing on TypeScript (the only language with first-class SDK support on both platforms) while providing REST-level guidance for Java, C#, Go, and other languages.

## SDK Language Matrix

| Language           | Slack Bolt | Teams SDK | Recommendation                                                |
|--------------------|-----------|-----------|---------------------------------------------------------------|
| TypeScript / JS    | Full      | Full      | Best choice for dual-platform — both SDKs are first-class     |
| Python             | Full      | Preview   | Good for AI/ML workloads; Teams SDK still maturing            |
| Java / JVM         | Full      | None      | Use REST-only patterns for Teams (see `rest-only-integration`) |
| C# / .NET          | None      | Full      | Use REST-only patterns for Slack (see `rest-only-integration`) |
| Go, Ruby, etc.     | None      | None      | REST-only for both platforms                                  |

## Scenarios

### 1. Build a Teams bot (TypeScript)

Load the **Teams** domain. 28 micro-experts cover app initialization, routing, Adaptive Cards, dialogs, message extensions, OAuth/SSO, Graph API, AI (ChatPrompt, function calling, RAG, streaming, memory), MCP, A2A, and more.

**Key experts:** `teams/runtime.app-init-ts.md`, `teams/runtime.routing-handlers-ts.md`, `teams/ui.adaptive-cards-ts.md`

### 2. Build a Slack bot (TypeScript)

Load the **Slack** domain. 7 micro-experts cover Bolt.js app setup, handler registration, ack rules, slash commands, Block Kit UI, Events API, Assistant containers, and OAuth/multi-workspace distribution.

**Key experts:** `slack/runtime.bolt-foundations-ts.md`, `slack/bolt-events-ts.md`, `slack/bolt-assistant-ts.md`

### 3. Host both bots in a single server

Load the **Bridge** domain's architecture cluster. Covers shared Express server with route separation, Socket Mode + HTTP dual receiver, platform-agnostic service layer, and identity normalization.

**Key expert:** `bridge/cross-platform-architecture-ts.md`

### 4. Integrate from Java, C#, or Go (no native SDK)

Load the **Bridge** domain's REST-only cluster. Language-agnostic pseudocode for Bot Framework REST API (Teams) and Slack Events API + Web API — manual JWT validation, HMAC signature verification, token acquisition, and message sending.

**Key expert:** `bridge/rest-only-integration-ts.md`

### 5. Bridge features between Slack and Teams

Load the **Bridge** domain. 25 micro-experts cover bidirectional mapping of every feature: Block Kit ↔ Adaptive Cards, commands, events ↔ activities, identity, modals ↔ dialogs, files, shortcuts ↔ extensions, workflows ↔ Power Automate, infrastructure (Lambda ↔ Functions, S3 ↔ Blob), and more.

**Key expert:** `bridge/cross-platform-advisor-ts.md` (orchestrates the full bridging workflow)

### 6. Deploy your bot to Azure or AWS

Load the **Deploy** domain. The router interviews you on cloud provider preference (Azure or AWS) and bot platform (Teams, Slack, or both), then loads the matching expert for a step-by-step walkthrough from CLI installation through verified deployment.

**Key experts:** `deploy/azure-bot-deploy-ts.md`, `deploy/aws-bot-deploy-ts.md`

### 7. Convert code from another language to TypeScript

Load the **Convert** domain. 8 micro-experts cover JS→TS, Ruby→TS, Java→TS, Kotlin→TS, type mapping, dependency mapping, JSON serialization, and bulk conversion strategy.

**Key experts:** `convert/java-to-ts-ts.md`, `convert/kotlin-to-ts-ts.md`, `convert/type-mapping-ts.md`

## Expert Inventory

### Root (6 files)
| File | Purpose |
|------|---------|
| `index.md` | Root task router — interviews developer, routes to domain |
| `fallback.md` | Recovery when no domain matches |
| `_expert-ts.md` | Template for creating new experts |
| `researcher.md` | Deep research workflow for fleshing out experts |
| `analyzer.md` | Analyze project and recommend new experts |
| `builder.md` | Build new experts from analysis recommendations |

### Slack Domain (7 files)
| File | Purpose |
|------|---------|
| `runtime.bolt-foundations-ts.md` | App constructor, handlers, middleware, event loop |
| `runtime.ack-rules-ts.md` | Ack semantics, timing, async patterns |
| `runtime.slash-commands-ts.md` | Slash command registration and response patterns |
| `ui.block-kit-ts.md` | Block Kit messages, modals, interactive elements |
| `bolt-events-ts.md` | Events API, event types, retry handling, middleware |
| `bolt-assistant-ts.md` | Assistant container, thread lifecycle, utilities |
| `bolt-oauth-distribution-ts.md` | OAuth, InstallProvider, multi-workspace distribution |

### Teams Domain (28 files)
Covers: app init, routing, manifest, proactive messaging, Adaptive Cards, dialogs, message extensions, OAuth/SSO, Graph API, state/storage, AI (ChatPrompt, model setup, function calling, RAG, streaming, citations, memory), MCP (server, client, security, expose tools), A2A (server, client, orchestrator), BotBuilder interop, debug/test, and scaffolding.

### Bridge Domain (25 files)
Covers: Block Kit ↔ Adaptive Cards, commands, events ↔ activities, identity/OAuth bridge, middleware ↔ handlers, modals ↔ dialogs, App Home ↔ personal tab, legacy attachments, transport, infrastructure (compute, storage, secrets, observability), interactive responses, files, link unfurl ↔ preview, shortcuts ↔ extensions, scheduling, channel ops, workflows ↔ automation, distribution/packaging, rate limiting, cross-platform advisor, cross-platform architecture, and REST-only integration.

### Convert Domain (8 files)
Covers: JS→TS, Ruby→TS, Java→TS, Kotlin→TS, type mapping, dependency mapping, JSON serialization, bulk conversion strategy.

### Deploy Domain (4 files)
| File | Purpose |
|------|---------|
| `azure-bot-deploy-ts.md` | End-to-end Azure deployment: CLI setup, App Registration, Bot Service, App Service/Functions, Agents Toolkit fast path |
| `aws-bot-deploy-ts.md` | End-to-end AWS deployment: CLI setup, Lambda+API Gateway/EC2/ECS, SAM templates, Teams-on-AWS pattern |
| `azure-cli-reference-ts.md` | Comprehensive Azure CLI reference for bot/agent resource CRUD |
| `aws-cli-reference-ts.md` | Comprehensive AWS CLI reference for bot/agent resource CRUD |

### Security Domain (2 files)
Covers: input validation, secrets management.

## How It Works

1. **Developer sends a task** → root `index.md` interviews for scope and preferences
2. **Signal words are scanned** → task routes to exactly one domain router
3. **Domain router matches clusters** → loads only the relevant micro-expert files
4. **Expert-level interviews** (if present) → clarify implementation decisions
5. **Implementation** → expert rules, patterns, and pitfalls guide code generation

## Adding New Experts

Use the `analyzer.md` → `builder.md` workflow:
1. Run `analyzer.md` against a codebase to identify coverage gaps
2. Hand off recommendations to `builder.md` to create expert files
3. New experts auto-wire into domain routers via the post-creation checklist in `_expert-ts.md`
