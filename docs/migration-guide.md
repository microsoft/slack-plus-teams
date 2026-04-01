# Slack to Teams: Line of Business App Migration Guide

A step-by-step guide for migrating your organization's custom Slack bots and Line of Business (LOB) applications to Microsoft Teams — or extending them to run on both platforms simultaneously.

> **Data migration vs. app migration:** This guide focuses on migrating your **custom-built apps and bots**. For migrating your organization's **data** (channels, messages, files, users), see Microsoft's official guide: [Migrate from Slack to Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/migrate-slack-to-teams).

---

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Phase 1: Plan Your Migration](#phase-1-plan-your-migration)
3. [Phase 2: Set Up Your Environment](#phase-2-set-up-your-environment)
4. [Phase 3: Bootstrap the Expert System](#phase-3-bootstrap-the-expert-system)
5. [Phase 4: Understand Your Analysis Results](#phase-4-understand-your-analysis-results)
6. [Phase 5: Architect the Dual-Platform Bot](#phase-5-architect-the-dual-platform-bot)
7. [Phase 6: Migrate Core Functionality](#phase-6-migrate-core-functionality)
8. [Phase 7: Migrate UI Components](#phase-7-migrate-ui-components)
9. [Phase 8: Migrate Identity and Auth](#phase-8-migrate-identity-and-auth)
10. [Phase 9: Migrate Infrastructure](#phase-9-migrate-infrastructure)
11. [Phase 10: Test and Deploy](#phase-10-test-and-deploy)
12. [Phase 11: Data Migration (Channels, Messages, Files)](#phase-11-data-migration-channels-messages-files)
13. [Post-Migration: Maintaining and Extending Your App](#post-migration-maintaining-and-extending-your-app)

---

## Migration Overview

Most organizations have invested significantly in custom Slack bots that automate workflows, surface data from internal systems, and integrate with Line of Business tools. Migrating these apps to Teams doesn't mean starting over — the `slack-plus-teams` expert system guides AI coding agents through every bridging decision, turning weeks of trial-and-error into a structured, repeatable process.

### What This Guide Covers

| Concern | Approach |
|---------|----------|
| **Custom bots & integrations** | Extend your Slack bot to also run on Teams (dual-platform) |
| **Slash commands** | Bridge to Teams text commands or message extensions |
| **Block Kit UI** | Convert to Adaptive Cards |
| **Modals & interactive flows** | Bridge to Task Modules / Dialogs |
| **OAuth & identity** | Map Slack OAuth to Azure AD / Microsoft SSO |
| **Infrastructure** | Bridge AWS services to Azure equivalents (or run both) |
| **Webhooks & connectors** | Migrate incoming webhooks to Teams connectors or bot endpoints |
| **Channel data & history** | Reference to Microsoft's official data migration tools |

### Migration Strategies

You have three options depending on your timeline and requirements:

1. **Dual-platform (recommended)** — Keep your Slack bot running while adding Teams support. Both platforms share a common service layer. Migrate users gradually.
2. **Full migration** — Rewrite the Slack bot as a Teams-only app. Simpler end state but higher risk and no fallback.
3. **Parallel operation** — Run independent Slack and Teams bots with shared backend services. Lower coupling but duplicated logic.

> **This guide follows the dual-platform approach**, which is recommended for LOB apps because it minimizes disruption and allows phased rollout.

![Diagram showing the three migration strategies](./assets/migration-strategies.png)

---

## Phase 1: Plan Your Migration

Before writing any code, assess what you have and what needs to move.

### 1.1 Inventory Your Slack Apps

List every custom bot, integration, and workflow in your Slack workspace:

1. Go to `<your-workspace>.slack.com/apps/manage` to see all installed apps
2. Identify which are **custom-built** (your LOB apps) vs. **third-party** (marketplace apps)
3. For each custom app, document:
   - What it does (commands, event handlers, scheduled jobs)
   - Which channels it operates in
   - What external systems it connects to
   - How many users depend on it

![Slack workspace App Management page](./assets/slack-installed-apps.png)

### 1.2 Categorize by Complexity

Use the difficulty ratings from [feature-gaps.md](feature-gaps.md) to categorize each feature your app uses:

| Rating | Meaning | Examples |
|--------|---------|----------|
| **GREEN** | Direct mapping exists — straightforward conversion | Messages, basic commands, simple cards |
| **YELLOW** | Requires design decisions — mapping exists but behavior differs | Ephemeral messages, file uploads, thread broadcasting |
| **RED** | Gap — no direct equivalent, requires redesign | Mid-form modal updates, emoji reactions as input, workflow steps |

### 1.3 Prioritize Migration Order

For organizations with multiple LOB apps, prioritize based on:

- **Business impact** — Which apps are most critical to daily operations?
- **Complexity** — Start with GREEN-heavy apps to build team confidence
- **User overlap** — Which app's users are migrating to Teams first?
- **Dependencies** — Which apps depend on other apps that need to migrate first?

![SCREENSHOT PLACEHOLDER: Example prioritization matrix showing 4-5 sample LOB apps plotted on a 2x2 grid of Business Impact (high/low) vs. Migration Complexity (low/high). Apps in the high-impact, low-complexity quadrant are marked "Migrate First."]

### 1.4 Coordinate with Data Migration

Microsoft provides a complete guide for migrating your organization's Slack data to Teams:

> **[Migrate from Slack to Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/migrate-slack-to-teams)**
>
> This covers:
> - Exporting channels, messages, and files from Slack
> - Mapping Slack users to Microsoft 365 accounts (with PowerShell scripts)
> - Planning team and channel structure in Teams
> - Copying channel history and files
> - User readiness and adoption planning

**Coordinate your app migration timeline with data migration.** Your LOB apps should be ready on Teams before (or at the same time as) users are migrated, so they don't lose access to critical workflows.

---

## Phase 2: Set Up Your Environment

### 2.1 Prerequisites

| Requirement | Details |
|-------------|---------|
| **Node.js** | v18+ (LTS recommended) |
| **TypeScript** | v5+ |
| **Slack app** | Your existing Slack bot with API credentials |
| **Azure account** | For Teams bot registration and deployment |
| **Microsoft 365 developer tenant** | For testing ([free dev program](https://developer.microsoft.com/microsoft-365/dev-program)) |
| **Microsoft 365 Agents Toolkit** | [VS Code extension or CLI](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/overview-agents-toolkit) for Teams app scaffolding |
| **AI coding agent** | Claude Code, GitHub Copilot, or Cursor |

### 2.2 Register a Teams Bot

1. Go to the [Azure Portal](https://portal.azure.com) → **Create a resource** → **Azure Bot**
2. Configure the bot with a unique handle and your Azure subscription
3. Under **Configuration**, note your **Microsoft App ID** and generate a **Client Secret**
4. Set the messaging endpoint to your app's URL (e.g., `https://your-app.azurewebsites.net/api/messages`) or a [Dev Tunnel](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started) for local testing (e.g., `https://your-tunnel.devtunnels.ms/api/messages)
![Azure Portal "Create Azure Bot" page](./assets/create-azure-bot.png)

![Azure Bot Configuration page](./assets/configure-azure-bot.png)

### 2.3 Enable Teams Channel

1. In the Azure Bot resource, go to **Channels**
2. Click **Microsoft Teams** to enable the Teams channel
3. Accept the Terms of Service

![Azure Bot Channels page](./assets/enable-teams-channel.png)

### 2.4 Scaffold a Teams App with Manifest

Use Microsoft 365 Agents Toolkit to create a scaffolded Agent:

```bash
# Using Agents Toolkit CLI (install: npm install -g @microsoft/m365agentstoolkit-cli)
atk new -c basic-custom-engine-agent -l typescript -n slack-plus-teams-bot -i false
```

Your manifest defines your app's identity, permissions, and capabilities in Teams.

![VS Code showing a newly scaffolded bot project with the manifest file open](./assets/atk-created-bot.png)

---

## Phase 3: Bootstrap the Expert System

The `slack-plus-teams` expert system is a collection of 116 micro-expert files that guide AI agents through every aspect of cross-platform bot development. Here's how to set it up.

### 3.1 Clone the Repository

Clone the `slack-plus-teams` repository from GitHub:

```bash
git clone https://github.com/microsoft/slack-plus-teams.git
```

### 3.2 Start the Onboarding Flow

Open your AI coding agent (Claude Code, GitHub Copilot, Cursor, etc.) from your Slack bot's project directory and reference the onboarding playbook:

```
Read ../slack-plus-teams/ONBOARD.md and follow the instructions. I have an existing Slack bot that I want to add Teams support to.
```

The agent will walk you through the following steps interactively:

1. **Ask for your project path** — The agent asks where your existing Slack bot lives. Provide the path (e.g., `..\bolt-js-assistant-template` or an absolute path).
2. **Bootstrap the expert system** — The agent copies the `experts/` directory from the cloned repo into your project automatically.
3. **Analyze your codebase** — The agent scans your project in parallel to detect your language, platform, features, and architecture.
4. **Present analysis results** — You'll see a summary table showing what the agent found (language, platform, framework, hosting, features, etc.).
5. **Ask for your migration strategy** — The agent presents the three migration strategies (Dual-platform, Full migration, Parallel operation) and waits for your choice.
6. **Identify missing experts** — The agent compares your tech stack against the expert system to find any gaps (see [Identifying and Building Missing Experts](#identifying-and-building-missing-experts) below).
7. **Build missing experts** — Based on the gap analysis, the agent can create new experts for technologies not yet covered.
8. **Run the cross-platform advisor** — The agent loads the bridging advisor, builds a feature inventory of your codebase, and walks you through design decisions for any YELLOW-rated features (e.g., ephemeral messages, transport mode). You can accept the recommended defaults or choose alternatives.
9. **Generate a migration plan** — The agent produces a `PLAN.md` file with your complete migration roadmap, including phased implementation steps and expert references for each task.

![AI coding agent onboarding flow — project path prompt](./assets/onboard-path-prompt.png)
![AI coding agent onboarding flow — migration strategy prompt](./assets/onboard-strategy-prompt.png)

#### Identifying and Building Missing Experts

After you choose your migration strategy, the agent compares your project's tech stack against the expert system to identify any technologies that aren't yet covered. If it finds gaps, it offers to build new expert files for you:

1. **All high priority** — Automatically create experts for the most important gaps.
2. **Let me pick** — Review the list and choose which experts to create.
3. **Skip** — Proceed with the existing experts as-is.

Built experts are saved to the appropriate domain folder (e.g., `experts/models/` or `experts/slack/`) in the same format as the existing experts. You can always build additional experts later by asking your AI agent to create one for a specific technology.

![AI coding agent onboarding flow — gap analysis results and expert building prompt](./assets/onboard-missing-experts.png)

### 3.3 Review the Generated Plan

The agent produces a `PLAN.md` file that lists:
- Every feature to bridge, with difficulty ratings
- The recommended migration order
- Which expert files to consult for each feature
- Architecture decisions (dual-bot, single-server, etc.)

Review and approve this plan before proceeding.

![Generated PLAN.md file](./assets/onboard-plan-output.png)

---

## Phase 4: Understand Your Analysis Results

The onboarding flow (Phase 3) automatically analyzes your codebase. This section explains what the analysis detects and how to interpret the results.

### 4.1 What the Analysis Detects

The expert system's cross-platform advisor (`experts/bridge/cross-platform-advisor-ts.md`) scans your codebase for platform-specific patterns:

| What It Detects | Slack Pattern | Teams Equivalent |
|-----------------|---------------|------------------|
| Message handling | `app.message()` | `app.on("message")` |
| Slash commands | `app.command()` | Text command detection |
| Block Kit UI | `blocks: [...]` | Adaptive Cards |
| Modals | `views.open()` | Task Modules / Dialogs |
| Ephemeral messages | `chat.postEphemeral` | `refresh.userIds` on cards |
| File uploads | `files.upload` | `FileConsentCard` |
| OAuth / identity | `SLACK_BOT_TOKEN` | Azure AD / SSO |
| Socket Mode | `SocketModeReceiver` | HTTPS endpoint |

### 4.2 Feature Inventory

The advisor builds a complete feature inventory categorized by bridging difficulty:

![SCREENSHOT PLACEHOLDER: Terminal output from the cross-platform advisor showing a feature inventory table — columns for Feature, Slack Pattern Found, Teams Equivalent, and Difficulty (GREEN/YELLOW/RED). Shows 8-10 detected features from a sample Slack bot.]

### 4.3 Gap Identification

Any features rated **RED** require redesign. The advisor flags these and suggests alternatives:

| RED Gap | Why It's Hard | Recommended Approach |
|---------|---------------|---------------------|
| Mid-form modal updates | Teams dialogs don't support `response_action: update` | Use multi-step dialogs or Adaptive Card `refresh` |
| Emoji reactions as input | Teams reaction events are limited | Use Adaptive Card buttons as voting mechanism |
| Thread broadcast | No `reply_broadcast` equivalent | Post to both thread and channel explicitly |
| Workflow Steps | Slack Workflow Builder has no Teams equivalent | Use Power Automate or custom orchestration |

---

## Phase 5: Architect the Dual-Platform Bot

### 5.1 Recommended Architecture: Adapter Pattern

The expert system recommends a **shared service layer** with platform-specific adapters:

```
your-app/
├── src/
│   ├── adapters/
│   │   ├── slack-bot.ts      # Slack Bolt adapter
│   │   └── teams-bot.ts      # Teams AI SDK adapter
│   ├── services/
│   │   ├── message-handler.ts  # Shared business logic
│   │   ├── command-registry.ts # Shared command handling
│   │   └── action-handler.ts   # Shared interactive responses
│   ├── ui/
│   │   ├── blocks.ts          # Block Kit builders
│   │   ├── cards.ts           # Adaptive Card builders
│   │   └── convert.ts         # Block Kit ↔ Adaptive Card conversion
│   ├── identity/
│   │   └── user-map.ts        # Cross-platform user identity mapping
│   └── index.ts               # Entry point — starts both adapters
├── experts/                    # Expert system (copied in Phase 3)
├── .env                        # Platform credentials
└── package.json
```

![SCREENSHOT PLACEHOLDER: Architecture diagram showing the adapter pattern — a central "Shared Service Layer" box connected to two adapter boxes (Slack Adapter and Teams Adapter). Each adapter connects to its respective platform. Arrows show message flow from platform → adapter → shared logic → adapter → platform.]

### 5.2 Key Dependencies

```json
{
  "dependencies": {
    "@slack/bolt": "^4.0.0",
    "@microsoft/teams-ai": "^2.0.0",
    "botbuilder": "^4.23.0"
  }
}
```

### 5.3 Entry Point Pattern

Your app starts both platform adapters from a single entry point:

```typescript
// src/index.ts
import { slackApp } from './adapters/slack-bot';
import { teamsApp } from './adapters/teams-bot';

// Start Slack (Socket Mode)
slackApp.start();
console.log('Slack bot running (Socket Mode)');

// Start Teams (HTTP on port 3978)
teamsApp.listen(3978);
console.log('Teams bot running on :3978');
```

> See the working example at `examples/slack-add-teams/` for a complete reference implementation.

---

## Phase 6: Migrate Core Functionality

Work through your feature inventory in order of difficulty: GREEN first, then YELLOW, then RED.

### 6.1 Messages

**Slack:**
```typescript
app.message('hello', async ({ message, say }) => {
  await say(`Hey there <@${message.user}>!`);
});
```

**Teams equivalent:**
```typescript
app.on('message', async (context) => {
  if (context.activity.text?.includes('hello')) {
    await context.sendActivity(`Hey there ${context.activity.from.name}!`);
  }
});
```

**Shared service approach:**
```typescript
// services/message-handler.ts
export function handleHello(userName: string): string {
  return `Hey there ${userName}!`;
}
```

> **Expert reference:** `experts/bridge/events-activities-ts.md`

### 6.2 Commands

Slack uses slash commands (`/status`). Teams doesn't have native slash commands — use text command detection or message extensions instead.

**Slack:**
```typescript
app.command('/status', async ({ command, ack, respond }) => {
  await ack();
  await respond(getStatus(command.text));
});
```

**Teams equivalent:**
```typescript
app.on('message', async (context) => {
  const text = context.activity.text?.trim();
  if (text?.startsWith('status')) {
    const args = text.replace('status', '').trim();
    await context.sendActivity(getStatus(args));
  }
});
```

> **Expert reference:** `experts/bridge/commands-slash-text-ts.md`

### 6.3 Interactive Responses

Slack and Teams handle button clicks, menu selections, and form submissions differently.

> **Expert reference:** `experts/bridge/interactive-responses-ts.md`

---

## Phase 7: Migrate UI Components

### 7.1 Block Kit to Adaptive Cards

This is the most visible part of the migration. Every Slack Block Kit layout needs an Adaptive Cards equivalent.

| Block Kit Element | Adaptive Card Equivalent |
|-------------------|-------------------------|
| `section` with `text` | `TextBlock` |
| `section` with `accessory` image | `ColumnSet` with `Image` |
| `actions` with buttons | `ActionSet` with `Action.Submit` |
| `input` block | `Input.Text` |
| `divider` | Separator (spacing) |
| `image` block | `Image` element |
| `context` block | `TextBlock` with `isSubtle: true` |
| `header` block | `TextBlock` with `size: "Large", weight: "Bolder"` |

![SCREENSHOT PLACEHOLDER: Side-by-side comparison of the same UI rendered in Slack (Block Kit) and Teams (Adaptive Card). Show a card with a title, description text, an image, and two action buttons. Left side labeled "Slack — Block Kit", right side labeled "Teams — Adaptive Card."]

### 7.2 Modals to Task Modules

Slack modals (`views.open`) map to Teams Task Modules / Dialogs:

| Slack Modal Feature | Teams Equivalent | Difficulty |
|---------------------|------------------|------------|
| Open modal | Open dialog / task module | GREEN |
| Form inputs | Adaptive Card inputs in dialog | GREEN |
| Modal submission | Dialog submit handler | GREEN |
| Push new view | Multi-step dialog (sequential) | YELLOW |
| Update current view | Close + reopen with new content | YELLOW |
| Field validation errors | Custom validation before submit | RED |
| Cancel notification | No direct equivalent | RED |

![SCREENSHOT PLACEHOLDER: Side-by-side comparison of a form modal — Slack modal on the left with text inputs and a dropdown, Teams Task Module on the right with the equivalent Adaptive Card inputs. Both showing a "Create Ticket" form with Title, Description, and Priority fields.]

> **Expert reference:** `experts/bridge/ui-modals-dialogs-ts.md`, `experts/bridge/ui-block-kit-adaptive-cards-ts.md`

---

## Phase 8: Migrate Identity and Auth

### 8.1 User Identity Mapping

Slack and Teams use different identity systems. You'll need a mapping layer:

| Slack | Teams |
|-------|-------|
| Slack User ID (`U0123ABC`) | Azure AD Object ID (GUID) |
| Workspace membership | Microsoft 365 tenant membership |
| Slack OAuth tokens | Azure AD / Microsoft SSO tokens |
| `users.info` API | Microsoft Graph API |

Build a user mapping table that associates Slack User IDs with Azure AD Object IDs. Microsoft's data migration guide includes a [PowerShell script](https://learn.microsoft.com/en-us/microsoftteams/migrate-slack-to-teams#users) for matching Slack email addresses to Microsoft Entra ID accounts.

### 8.2 OAuth and SSO

| Slack Approach | Teams Approach |
|----------------|----------------|
| OAuth 2.0 with Slack as provider | Azure AD / Microsoft SSO |
| `SLACK_CLIENT_ID` + `SLACK_CLIENT_SECRET` | `CLIENT_ID` + `CLIENT_SECRET` + `TENANT_ID` |
| Bot tokens per workspace | Bot registration per Azure subscription |
| User tokens for API calls | Delegated permissions via Graph API |

![SCREENSHOT PLACEHOLDER: Diagram comparing Slack OAuth flow (left) and Teams SSO flow (right). Show the token exchange steps for each platform, highlighting that Teams uses Azure AD as the identity provider.]

> **Expert reference:** `experts/bridge/identity-oauth-bridge-ts.md`

---

## Phase 9: Migrate Infrastructure

If your Slack bot runs on AWS, you may also need to bridge infrastructure to Azure.

### 9.1 Infrastructure Mapping

| AWS (Slack) | Azure (Teams) | Expert |
|-------------|---------------|--------|
| Lambda | Azure Functions | `bridge/infra-compute-ts.md` |
| S3 | Azure Blob Storage | `bridge/infra-storage-ts.md` |
| DynamoDB | Cosmos DB | `bridge/infra-storage-ts.md` |
| Secrets Manager | Azure Key Vault | `bridge/infra-secrets-config-ts.md` |
| CloudWatch | Application Insights | `bridge/infra-observability-ts.md` |
| API Gateway | Azure API Management | `bridge/infra-compute-ts.md` |

> **Note:** The dual-platform approach doesn't require moving off AWS. You can run both adapters from the same compute service. Infrastructure migration is optional and can happen separately.

![SCREENSHOT PLACEHOLDER: Infrastructure mapping diagram showing AWS services on the left connected by arrows to their Azure equivalents on the right. Each pair labeled with the bridging expert file name.]

### 9.2 Transport: Socket Mode to HTTPS

Slack bots commonly use Socket Mode (WebSocket). Teams bots use HTTPS endpoints exclusively.

For the dual-platform architecture, your app runs **both**:
- Socket Mode for Slack (no public URL needed)
- HTTPS endpoint on port 3978 for Teams (requires public URL or tunnel)

```bash
# For local development, use a tunnel for the Teams endpoint
# Agents Toolkit provides a built-in dev tunnel
atk preview --env local
```

---

## Phase 10: Test and Deploy

### 10.1 Local Testing

1. **Slack:** Test via Socket Mode (no tunnel needed)
2. **Teams:** Use Agents Toolkit dev tunnel (`atk preview`) or ngrok for the HTTPS endpoint
3. **Sideload** your Teams app in a test tenant

![SCREENSHOT PLACEHOLDER: Teams client showing a sideloaded bot app in the left sidebar. The chat window shows a test conversation with the bot responding to a command.]

### 10.2 Test Matrix

Verify every migrated feature on both platforms:

| Feature | Slack | Teams | Notes |
|---------|:-----:|:-----:|-------|
| Basic messages | [ ] | [ ] | |
| Commands | [ ] | [ ] | Slash vs. text |
| Cards / UI | [ ] | [ ] | Block Kit vs. Adaptive Cards |
| Modals / Dialogs | [ ] | [ ] | |
| File upload | [ ] | [ ] | |
| Auth flow | [ ] | [ ] | |
| Error handling | [ ] | [ ] | |

### 10.3 Deploy

For the dual-platform bot, deploy to a service that can run both adapters:

| Option | Best For |
|--------|----------|
| **Azure App Service** | Full control, always-on, easy scaling |
| **Azure Container Apps** | Containerized workloads |
| **Azure Functions** | Event-driven, cost-optimized |
| **AWS Lambda + Azure Functions** | Keep Slack on AWS, add Teams on Azure |

> **Expert reference:** `experts/deploy/azure-bot-deploy-ts.md`, `experts/deploy/aws-bot-deploy-ts.md`

![SCREENSHOT PLACEHOLDER: Azure Portal showing a deployed App Service running the dual-platform bot. The Overview page shows the app is running, with the URL endpoint visible.]

### 10.4 Publish to Your Organization

1. Upload your Teams app package to the **Teams Admin Center**
2. Approve the app for your organization
3. Optionally pin the app in the Teams app bar for all users

![SCREENSHOT PLACEHOLDER: Teams Admin Center "Manage apps" page showing the custom LOB app uploaded and approved, with the "Publish" status visible.]

---

## Phase 11: Data Migration (Channels, Messages, Files)

App migration and data migration are complementary efforts. While this guide focuses on apps, here's how data migration fits into the overall plan.

### Microsoft's Official Data Migration Guide

Follow [Migrate from Slack to Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/migrate-slack-to-teams) for the complete data migration process:

1. **Plan your migration**
   - Determine what can be exported based on your Slack plan
   - Assess workspace usage and scope
   - Map Slack users to Microsoft 365 accounts

2. **Export from Slack**
   - Public channel history and files (all plans)
   - Private channels and DMs (paid plans, may require DocuSign request)
   - Use Slack's export tools: `https://get.slack.help/hc/articles/204897248`

3. **Plan your Teams structure**
   - Map Slack workspaces → Teams teams
   - Map Slack channels → Teams channels
   - Use the mapping table:

     | Slack Structure | Teams Structure |
     |-----------------|-----------------|
     | 1 small workspace | 1 team |
     | 1 large workspace | Multiple teams |
     | Multiple workspaces | Multiple teams (grouped logically) |

4. **Import to Teams**
   - Copy exported files to Teams channel document libraries
   - Use tools like [ArgyleMigrator](https://github.com/rbrynteson/ArgyleMigrator) for channel history
   - Set up Microsoft 365 Connectors to replace Slack webhooks

5. **Roll out to users**
   - License users for Teams
   - Add users to the appropriate teams
   - Remove Slack access on a coordinated schedule
   - Provide training using [Microsoft's Teams adoption resources](https://adoption.microsoft.com/microsoft-teams/)

### Coordination Timeline

| Week | App Migration | Data Migration |
|------|--------------|----------------|
| 1-2 | Inventory & planning | Export Slack data, map users |
| 3-4 | Bootstrap expert system, architect | Plan Teams structure |
| 5-8 | Migrate core features, UI, auth | Import history, set up channels |
| 9-10 | Testing & deployment | Sideload apps, user testing |
| 11-12 | Publish to org | License users, cutover |

---

## Post-Migration: Maintaining and Extending Your App

Migration isn't the end — it's the beginning of building on a dual-platform (or Teams-native) foundation. The `slack-plus-teams` expert system continues to add value long after the initial migration.

### Ongoing Development with the Expert System

The expert system isn't just for migration — it's a permanent knowledge base for your AI coding agent. Keep the `experts/` directory in your project for ongoing development.

#### Adding New Features

When you need to add a new feature to your dual-platform bot:

1. **Describe the feature** to your AI agent in natural language
2. The agent **routes to the correct expert(s)** via `experts/index.md`
3. The expert provides **platform-specific patterns** for both Slack and Teams
4. The agent implements the feature using the **shared service layer** pattern

```
Example prompt:
"Add a /ticket command that creates a Jira ticket and posts a confirmation
card with a link to the ticket. It should work on both Slack and Teams."
```

The agent will:
- Consult `experts/bridge/commands-slash-text-ts.md` for command bridging
- Consult `experts/bridge/ui-block-kit-adaptive-cards-ts.md` for the confirmation card
- Implement the shared service logic once, with platform-specific adapters

![SCREENSHOT PLACEHOLDER: AI coding agent (Claude Code) terminal showing the agent routing a new feature request through the expert system — displaying which experts it's consulting and the implementation plan it generated.]

#### Keeping Up with Platform Changes

Both Slack and Teams regularly release new APIs and features. The expert system helps you adopt them:

- **New Teams AI SDK features** → Consult `experts/teams/` domain experts
- **New Slack Bolt features** → Consult `experts/slack/` domain experts
- **New bridging patterns** → Consult `experts/bridge/` domain experts
- **AI model integration** → Consult `experts/models/` for OpenAI, Anthropic, Bedrock, etc.

#### Updating the Expert System

Pull the latest expert files periodically to get updated patterns:

```bash
# Update experts from the slack-plus-teams repo
cd ./slack-plus-teams && git pull && cd ..
cp -r ./slack-plus-teams/experts/ ./experts/
```

### Maintaining Your Dual-Platform App

#### Shared Service Layer Benefits

Because your business logic lives in the shared service layer, maintenance is simplified:

| Change | Where to Edit | Platforms Affected |
|--------|--------------|-------------------|
| Business logic update | `services/` | Both (automatic) |
| New Slack-only feature | `adapters/slack-bot.ts` | Slack only |
| New Teams-only feature | `adapters/teams-bot.ts` | Teams only |
| UI update (both) | `ui/blocks.ts` + `ui/cards.ts` | Both |
| New shared command | `services/command-registry.ts` | Both (automatic) |

#### Monitoring Both Platforms

Set up observability for both platform adapters:

- **Slack:** Monitor Socket Mode connection health, API rate limits
- **Teams:** Monitor HTTPS endpoint health, bot framework errors
- **Shared:** Monitor service layer errors, external API latency

> **Expert reference:** `experts/bridge/infra-observability-ts.md`

#### Scaling Your Team's Capabilities

The expert system works with any AI coding agent. As your team grows:

- New developers can use the onboarding flow (ONBOARD.md) to get productive immediately
- The expert system provides consistent, vetted patterns regardless of which AI agent is used
- Platform comparison docs in `docs/` give human developers quick reference for bridging decisions

### Eventually Sunsetting Slack

If your organization fully migrates to Teams, you can:

1. **Remove the Slack adapter** (`adapters/slack-bot.ts`) and Slack dependencies
2. **Keep the shared service layer** — it's platform-agnostic business logic
3. **Simplify the entry point** to start only the Teams adapter
4. **Retain the expert system** — it's still valuable for Teams-specific development

The adapter pattern makes this a clean, low-risk operation.

---

## Quick Reference: Expert System Domains

| Domain | Expert Count | Use For |
|--------|-------------|---------|
| `experts/bridge/` | 27 | Cross-platform bridging (the core of migration) |
| `experts/teams/` | 36 | Teams-specific features and patterns |
| `experts/slack/` | 19 | Slack-specific features and patterns |
| `experts/convert/` | 9 | Language conversion (JS/Ruby/Java/Kotlin → TypeScript) |
| `experts/models/` | 8 | AI model provider integration |
| `experts/deploy/` | 5 | Cloud deployment (Azure + AWS) |
| `experts/security/` | 3 | Input validation and secrets management |

## Quick Reference: Key Expert Files for Migration

| Migration Task | Expert File |
|----------------|-------------|
| Overall migration strategy | `bridge/cross-platform-advisor-ts.md` |
| Architecture decisions | `bridge/cross-platform-architecture-ts.md` |
| Block Kit → Adaptive Cards | `bridge/ui-block-kit-adaptive-cards-ts.md` |
| Slash commands → text commands | `bridge/commands-slash-text-ts.md` |
| Events → Activities | `bridge/events-activities-ts.md` |
| Modals → Task Modules | `bridge/ui-modals-dialogs-ts.md` |
| OAuth → Azure AD | `bridge/identity-oauth-bridge-ts.md` |
| Middleware → Handlers | `bridge/middleware-handlers-ts.md` |
| Socket Mode → HTTPS | `bridge/transport-socketmode-https-ts.md` |
| AWS → Azure infrastructure | `bridge/infra-compute-ts.md` |

---

## Additional Resources

- **Microsoft's data migration guide:** [Migrate from Slack to Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/migrate-slack-to-teams)
- **Teams developer documentation:** [Microsoft Teams Platform](https://learn.microsoft.com/en-us/microsoftteams/platform/)
- **Slack Bolt documentation:** [Slack Bolt for JavaScript](https://slack.dev/bolt-js/)
- **Teams AI SDK:** [Teams AI Library](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/teams-conversational-ai/teams-conversation-ai-overview)
- **Working examples:** See `examples/slack-add-teams/` and `examples/dual-platform-bot/` in this repository
- **Platform differences:** See `docs/feature-gaps.md` for the complete RED/YELLOW gap inventory
