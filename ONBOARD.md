# Onboarding Playbook

You are an AI coding agent. This playbook has two flows — pick the one that matches the situation, then execute its steps literally. Do not skip or reorder steps.

## Which flow?

```
header: "Onboarding"
question: "What are we working with?"
options:
  - label: "New project"
    description: "Starting from scratch. No existing bot code yet."
  - label: "Existing project"
    description: "There's already a codebase — add platform support, bridge platforms, or improve what's there."
multiSelect: false
```

- **New project** → go to [Flow A: New Project](#flow-a-new-project)
- **Existing project** → go to [Flow B: Existing Project](#flow-b-existing-project)

---

## Flow A: New Project

For greenfield projects with no existing bot code.

### A1: Set project path

**STOP and ask the developer** — do not infer, assume, or auto-fill this value:

```
header: "Project Path"
question: "Where would you like to create your new bot project?"
type: "text"
placeholder: "/path/to/my-teams-bot"
```

Wait for the developer's explicit answer before proceeding. Record their response as `{projectPath}`.

### A2: Bootstrap

Copy the `experts/` directory from this repo into the target project root:

```
cp -r <path-to-slack-plus-teams>/experts/ {projectPath}/experts/
```

The target project should now have `experts/index.md` at its root. All subsequent expert paths use the `experts/` prefix relative to the target project.

> **Why copy?** Copying avoids cross-repo path resolution issues. The expert system uses relative `Read:` directives that assume experts live inside the working project. GitHub Copilot ignores dot-prefixed folders, so use `experts/` — not `.experts/`.

### A3: Scaffold the project

Ask the developer:

```
header: "Platform"
question: "Which platform(s) should this bot support?"
options:
  - label: "Slack + Teams (dual-platform)"
    description: "Build for both platforms from the start using the cross-platform architecture."
  - label: "Slack only"
    description: "Start with Slack. Can add Teams later."
  - label: "Teams only"
    description: "Start with Teams. Can add Slack later."
multiSelect: false
```

Record: `{platform}`.

### A4: Load the expert system

1. Read `experts/index.md` — this is the root router.
2. Execute the **pre-task interview** defined in `experts/index.md` § "pre-task interview (mandatory)".
3. Route based on `{platform}`:
   - **Slack + Teams** → Read `experts/bridge/index.md`. Load `experts/bridge/cross-platform-advisor-ts.md`.
   - **Slack only** → Read `experts/slack/index.md`.
   - **Teams only** → Read `experts/teams/index.md`.
4. Let the domain router and advisor take over from here.

### A5: Architecture setup

1. Read `experts/bridge/cross-platform-architecture-ts.md` (even for single-platform — it establishes patterns that make adding the second platform easier later).
2. Reference the matching example project:
   - `examples/dual-platform-bot/` — both platforms from scratch
   - `examples/slack-add-teams/` — Slack-first with Teams added
   - `examples/teams-add-slack/` — Teams-first with Slack added

### A6: Write PLAN.md

Create a `PLAN.md` file in the target project root:

```markdown
# Project Plan

## Target
- **Platform(s)**: {platform choice from A3}
- **Language**: TypeScript
- **Architecture**: {pattern from cross-platform-architecture}

## Feature Plan
{Numbered list of features to implement, from the advisor or domain router}

## Experts Loaded
{List of expert files loaded during onboarding, in order}
```

### A7: Implementation

Follow the advisor's or domain router's output. Implement feature by feature:

1. Pick the next feature from the prioritized list.
2. Load the expert(s) specified for that feature.
3. Implement using the expert's patterns and rules.
4. Verify against the expert's pitfalls section.
5. Repeat until all features are built.

---

## Flow B: Existing Project

For projects that already have code — adding platform support, bridging, or improving coverage.

### B1: Set project path

**STOP and ask the developer** — do not infer, assume, or auto-fill this value:

```
header: "Project Path"
question: "What is the path to your existing Slack bot project?"
type: "text"
placeholder: "/path/to/my-slack-bot"
```

Wait for the developer's explicit answer before proceeding. Record their response as `{projectPath}`.

### B2: Bootstrap

Copy the `experts/` directory from this repo into the target project root:

```
cp -r <path-to-slack-plus-teams>/experts/ {projectPath}/experts/
```

> **Why copy?** Copying avoids cross-repo path resolution issues. The expert system uses relative `Read:` directives that assume experts live inside the working project. GitHub Copilot ignores dot-prefixed folders, so use `experts/` — not `.experts/`.

### B3: Choose migration strategy

Ask the developer:

```
header: "Migration Strategy"
question: "You have three options depending on your timeline and requirements. Which migration strategy do you want to use?"
options:
  - label: "Dual-platform (recommended)"
    description: "Keep your Slack bot running while adding Teams support. Both platforms share a common service layer. Migrate users gradually."
  - label: "Full migration"
    description: "Rewrite the Slack bot as a Teams-only app. Simpler end state but higher risk and no fallback."
  - label: "Parallel operation"
    description: "Run independent Slack and Teams bots with shared backend services. Lower coupling but duplicated logic."
multiSelect: false
```

Record: `{migrationStrategy}`.

### B4: Analyze the project

Run these four sub-analyses **in parallel**. Store all results — they feed into every subsequent step.

#### 4a: Detect language

Scan the project root for language indicators:

| File | Language |
|---|---|
| `package.json` + `tsconfig.json` | TypeScript |
| `package.json` (no tsconfig) | JavaScript |
| `pom.xml` or `build.gradle` | Java |
| `*.csproj` or `*.sln` | C# |
| `go.mod` | Go |
| `requirements.txt` or `pyproject.toml` | Python |
| `Gemfile` | Ruby |
| `Cargo.toml` | Rust |

Record: `{language}` and `{isTypeScript: boolean}`.

#### 4b: Detect current platform

Scan dependencies and imports for platform SDK indicators:

**Slack indicators**: `@slack/bolt`, `@slack/web-api`, `@slack/oauth`, `slack-bolt`, `slack_bolt`, Bolt app patterns (`app.message`, `app.command`, `app.event`, `app.action`), `ack()` calls.

**Teams indicators**: `@microsoft/teams-ai`, `botbuilder`, `@microsoft/teams-js`, `TeamsActivityHandler`, `Application` class from teams-ai, `app.turn`, Adaptive Card patterns, Bot Framework patterns.

Record: `{platform: "slack" | "teams" | "both" | "neither"}`.

#### 4c: Detect features in use

Scan for feature patterns:

| Pattern | Feature |
|---|---|
| Slash command handlers | Commands |
| Block Kit / Adaptive Card JSON | Rich UI |
| `app.action` / card action handlers | Interactive responses |
| OAuth config, token storage | Multi-tenant auth |
| File upload/download calls | File handling |
| Scheduled messages, cron | Scheduling |
| Thread replies, `thread_ts` | Threading |
| AI/LLM API calls | AI integration |
| Proactive messages | Proactive messaging |

Record: `{features: string[]}`.

#### 4d: Detect framework and architecture

Scan for:

- **Web framework**: Express, Fastify, Hono, Koa, native HTTP
- **Hosting**: Azure App Service, Azure Functions, AWS Lambda, AWS ECS, Docker, local-only
- **Cloud provider**: Azure, AWS, GCP, none detected
- **Architecture**: Single bot, dual-bot, microservices, monolith

Record: `{framework, hosting, cloud, architecture}`.

### B5: Language gate

Classify `{language}` from B4a into one of four tiers based on SDK availability:

| Tier | Languages | Slack SDK | Teams SDK | Unified Server? |
|---|---|---|---|---|
| **1: Full SDK** | TypeScript / JavaScript | `@slack/bolt` | `@microsoft/teams-ai` v2 | Yes — full expert system |
| **2: Full SDK (adapt)** | Python | `slack_bolt` | `teams-ai` Python / M365 Agents SDK | Yes — adapt TS patterns to Python |
| **3: Split SDK** | Java, C# | Java: `slack-bolt-java` / C#: none | Java: none (archived) / C#: Teams SDK .NET | Partial — one side needs REST |
| **4: No SDK** | Go, Ruby, Rust, others | None | None | No — REST-only for both |

---

#### Tier 1: TypeScript / JavaScript → proceed to B6

The full expert system is available. JavaScript projects will get TypeScript migration guidance as part of the expert workflow.

---

#### Tier 2: Python → proceed to B6 with adaptation guidance

Both platforms have maintained Python SDKs (`slack_bolt` for Slack, `teams-ai` / M365 Agents SDK for Teams). The unified-server architecture applies — use Flask or FastAPI instead of Express.

The expert system's architecture patterns, routing logic, and feature-bridging strategies all apply conceptually. Code snippets in expert files are TypeScript, so the agent must adapt them to Python equivalents:

- Express route handlers → Flask/FastAPI route handlers
- `@slack/bolt` patterns → `slack_bolt` patterns
- `@microsoft/teams-ai` patterns → `teams-ai` Python patterns
- `async/await` → Python `async/await` (or sync equivalents)
- TypeScript interfaces → Python dataclasses / TypedDict / Pydantic models

> **Python experts available:** `experts/slack/bolt-python.md` (Slack Bolt for Python), `experts/teams/teams-python.md` (Teams SDK for Python), and `experts/bridge/python-cross-platform.md` (unified FastAPI server combining both). Load these alongside the TS architectural experts for complete Python coverage.

---

#### Tier 3: Java or C# → offer hybrid choices

Only one platform has a maintained SDK:

- **Java**: Slack SDK (`slack-bolt-java`) exists. Teams SDK does not — Bot Framework Java was archived at end of 2025 with no replacement.
- **C#**: Teams SDK (.NET) and M365 Agents SDK (.NET) exist. No official Slack SDK for C#.

```
header: "Architecture"
question: "This {language} project has SDK support for {supported_platform} but not {unsupported_platform}. How should we handle the other platform?"
options:
  - label: "SDK + REST hybrid"
    description: "Use {sdk_name} for {supported_platform}. Use REST API calls for {unsupported_platform}. Two platform handlers, one codebase."
  - label: "Dual codebase"
    description: "Keep {language} for {supported_platform}. Spin up a separate TypeScript service for {unsupported_platform} using the full expert system."
  - label: "Convert to TypeScript"
    description: "Rewrite the project in TypeScript to use the full expert system with both SDKs."
multiSelect: false
```

Where:
- **Java** → `{supported_platform}` = Slack, `{unsupported_platform}` = Teams, `{sdk_name}` = `slack-bolt-java`
- **C#** → `{supported_platform}` = Teams, `{unsupported_platform}` = Slack, `{sdk_name}` = Teams SDK / M365 Agents SDK (.NET)

Route based on choice:
- **SDK + REST hybrid** → For the SDK side, read the language-specific expert: `experts/slack/bolt-java.md` (Java Slack) or `experts/teams/teams-dotnet.md` (C# Teams). For the unsupported-platform side, read `experts/bridge/rest-only-integration-ts.md` and adapt its HTTP patterns for `{language}`. Proceed to B6.
- **Dual codebase** → The `{language}` service handles `{supported_platform}` natively — read `experts/slack/bolt-java.md` (Java) or `experts/teams/teams-dotnet.md` (C#). Create a separate TypeScript service for `{unsupported_platform}` using the full expert system. Proceed to B6 for the TypeScript service.
- **Convert to TypeScript** → Read `experts/convert/index.md`. Complete the conversion first, then restart from B6.

---

#### Tier 4: Go, Ruby, Rust, or other languages → offer REST or convert

No maintained SDK on either platform.

```
header: "Language"
question: "This project is written in {language}. No maintained Slack or Teams SDK exists for this language. How should we proceed?"
options:
  - label: "REST-only integration"
    description: "Keep {language}. Use raw HTTP calls to both Slack and Teams APIs — no SDK. Read experts/bridge/rest-only-integration-ts.md for patterns."
  - label: "Convert to TypeScript"
    description: "Rewrite the project in TypeScript first, then use the full expert system. Read experts/convert/index.md for conversion guidance."
  - label: "Skip expert system"
    description: "I'll handle the integration myself. Just give me the platform comparison docs from docs/."
multiSelect: false
```

- **REST-only** → Read `experts/bridge/rest-only-integration-ts.md`. Adapt its HTTP patterns for `{language}`. Skip remaining steps.
- **Convert to TypeScript** → Read `experts/convert/index.md`. Complete the conversion first, then restart from B6.
- **Skip** → Point the developer to `docs/README.md` and stop.

### B6: Expert coverage gap analysis

This is the critical step for existing projects. The expert system ships with Slack, Teams, and bridging knowledge — but the project may use libraries, frameworks, or patterns that no existing expert covers.

1. Read `experts/analyzer.md`.
2. Execute the analyzer's full workflow against the target project:
   - Scan manifests and lock files for the complete dependency tree.
   - Scan directory structure for framework conventions.
   - Read config files for tooling signals.
   - Catalog the full tech stack.
3. Cross-reference every detected technology against the existing `experts/` inventory:
   - Read every domain `index.md` (`experts/*/index.md`) and list all expert files.
   - Map each technology in the stack to the expert(s) that cover it.
   - Mark technologies with no expert coverage as **gaps**.
4. **Analyze the project's own code for expert-worthy patterns.** Go beyond manifests — read the actual source files:
   - Identify custom abstractions, middleware, service layers, and architectural patterns the project has built.
   - Look for internal conventions that are repeated across multiple files (error handling patterns, response formatting, logging, validation).
   - These project-specific patterns are candidates for project-scoped experts.
5. **Analyze installed packages for expert-worthy depth.** For each significant dependency without expert coverage:
   - Read the package's source code and type definitions from `node_modules/` (or equivalent).
   - Read the package's README and any docs bundled with it.
   - Determine if the package has enough surface area (8+ rules, 2+ patterns) to warrant its own expert.
   - Focus on packages the project uses heavily — the ones imported across many files.
6. Present the gap analysis to the developer using the output template from `experts/analyzer.md`:
   - Tech stack table
   - Coverage map (what's covered, what's a gap)
   - Prioritized recommendations (stubs to populate, new experts to create, project-specific experts)

### B7: Build missing experts

After the developer reviews the gap analysis:

```
header: "Experts"
question: "Which missing experts should I create? I'll analyze the project's code and installed packages to build them."
options:
  - label: "All high priority"
    description: "Create all experts marked as high priority in the gap analysis."
  - label: "Let me pick"
    description: "I'll select which ones to create."
  - label: "Skip — use existing experts only"
    description: "Don't create new experts. Proceed with what's already in the expert system."
multiSelect: false
```

For each expert to create:

1. Read `experts/builder.md`.
2. Execute the builder's workflow:
   - **Scope**: Use the gap analysis recommendation (filename, domain, purpose).
   - **Research**: Analyze the project's own usage of the technology — read the source files that import/use it, read the package's source code and types in `node_modules/`, then supplement with web search for official docs.
   - **Draft**: Write the expert following the canonical section layout. Ground rules and patterns in the project's actual usage, not just generic docs.
   - **Validate**: Run through the builder's validation checklist.
   - **Integrate**: Wire into the routing system — update domain `index.md`, add signal words to root `index.md`.
3. Repeat for each expert.

> **Source priority for building experts:** (1) The project's own code — how it actually uses the technology. (2) The installed package's source, types, and README in `node_modules/`. (3) Official docs via web search. This order ensures experts reflect real usage, not just API surface.

### B8: Load the expert system

1. Read `experts/index.md` — this is the root router.
2. Execute the **pre-task interview** defined in `experts/index.md` § "pre-task interview (mandatory)". Use the analysis results from B4 to pre-fill context:
   - Mention the detected platform (`{platform}`), features (`{features}`), and architecture (`{framework}`, `{hosting}`).
   - Skip interview questions that B4 already answered.
3. Route based on `{platform}`:
   - `"slack"` → developer wants to add Teams support. Route to **Bridge** domain.
   - `"teams"` → developer wants to add Slack support. Route to **Bridge** domain.
   - `"both"` → already cross-platform. Route based on task intent (bridge refinement, deploy, models, etc.).
   - `"neither"` → ask which platform(s) to target, then route to the appropriate domain.
4. Load `experts/bridge/cross-platform-advisor-ts.md` if bridging. Feed B4 results into the advisor's Phase 1 (it expects project analysis data — providing it avoids redundant scanning).
5. Let the advisor's routing take over.

### B9: Architecture setup

After the advisor completes its analysis phases:

1. Read `experts/bridge/cross-platform-architecture-ts.md`.
2. Apply its patterns to set up the dual-platform architecture:
   - Shared Express server with platform-specific route handlers
   - Unified service layer with platform adapters
   - Environment configuration for both platforms
3. Reference the example projects for working implementations:
   - `examples/dual-platform-bot/` — both platforms from scratch
   - `examples/slack-add-teams/` — adding Teams to existing Slack bot
   - `examples/teams-add-slack/` — adding Slack to existing Teams bot

### B10: Write PLAN.md

Create a `PLAN.md` file in the target project root:

```markdown
# Migration Plan

## Project Analysis
- **Language**: {language}
- **Current platform**: {platform}
- **Migration strategy**: {migrationStrategy from B3}
- **Detected features**: {features as bulleted list}
- **Framework**: {framework}
- **Hosting**: {hosting}
- **Cloud provider**: {cloud}
- **Architecture**: {architecture}

## Expert Coverage
- **Existing coverage**: {list of technologies covered by existing experts}
- **Gaps filled**: {list of new experts created in B7, with filenames}
- **Remaining gaps**: {any gaps the developer chose not to fill}

## Routing Decisions
- Language gate: {tier and path taken — Tier 1 full SDK, Tier 2 Python adapt, Tier 3 hybrid/dual/convert, Tier 4 REST-only/convert}
- Domain routed to: {bridge, teams, slack, etc.}
- Advisor loaded: {yes/no, which advisor}

## Feature Migration Order
{Numbered list from the advisor's Phase 4 prioritized output}

## Architecture
- Pattern: {dual-bot, single-server, etc. from cross-platform-architecture}
- Shared services: {list of services that will be platform-agnostic}
- Platform adapters: {list of platform-specific adapters needed}

## Experts Used
{List of expert files loaded during onboarding, in order}
```

Fill in every `{placeholder}` with actual values. This file is a living document — update it as implementation progresses.

### B11: Implementation

Follow the advisor's Phase 4 output. Implement feature by feature:

1. Pick the next feature from the advisor's prioritized list.
2. Load the expert(s) the advisor specifies for that feature — including any new experts created in B7.
3. Implement using the expert's patterns and rules.
4. Verify against the expert's pitfalls section.
5. Repeat until all features are bridged.

---

## Error Recovery

If at any point the expert system fails to cover a topic or produces incomplete guidance:

1. Read `experts/fallback.md`.
2. Follow its two-phase recovery:
   - **Phase 1**: Re-scan all domain routers (`experts/*/index.md`) for missed experts.
   - **Phase 2**: Web-search for any remaining knowledge gaps.
3. If a new pattern is discovered, consider creating a new expert using `experts/builder.md` per the evolution rules in `experts/index.md` § "expert evolution".
