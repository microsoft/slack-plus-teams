# Message-Native Workflow Bot — Daily Standup

A Teams bot demonstrating the "Unifying Workflows at the Message Layer" vision. Implements the FHL-recommended **Daily Standup** scenario using all five pillars — with zero new platform features required.

## The Five Pillars in Action

| Pillar | What it does | How it's built |
|--------|-------------|----------------|
| **1. Trigger** | `/standup` command, 9 AM cron schedule, card actions | `app.on("message")` + `node-cron` + `Action.Execute` |
| **2. State** | Every check-in persisted as a durable record | SharePoint Lists via Graph (in-memory for demo) |
| **3. Logic** | Form submission, edit/save flow, aggregation | Card action state machine in `card.action` handler |
| **4. Intelligence** | "Show blockers", "What did Alice work on?" | AI function calling → structured queries → NL response |
| **5. Visibility** | Records render as updatable cards in threads | `Action.Execute` returns refreshed cards in-place |

## User Flow

```
User types: standup
  → Bot posts standup prompt card with input fields
  → User fills in yesterday/today/blockers, clicks Submit
  → Card replaces itself with the completed record card (Action.Execute)
  → Record persisted to SharePoint List

User types: status
  → Bot posts summary card: response count, blocker count, respondent list

User types: show blockers
  → AI recognizes intent, calls queryBlockers function
  → Bot posts NL summary + blocker cards

User types: what did Alice work on last week?
  → AI calls queryStandups(respondent: "Alice", startDate/endDate: last week)
  → Bot posts NL summary + individual record cards
```

## Architecture

```
src/
  index.ts                     Entry point — App setup
  workflows/
    standup-handlers.ts        All handlers wired to the five pillars
  store/
    standup-store.ts           SharePoint Lists schema + in-memory implementation
  ui/
    standup-cards.ts           Adaptive Card builders (prompt, record, edit, summary)
  ai/
    query-functions.ts         AI function calling for NL queries
appPackage/
  manifest.json                Teams manifest with command list
```

## Setup

```bash
cp .env.sample .env
# Fill in Teams credentials (CLIENT_ID, CLIENT_SECRET, TENANT_ID)
# Optionally add AZURE_OPENAI_* for NL queries (falls back to keyword matching)
npm install
npm run dev
```

## What This Proves

The doc's thesis: **"Teams already has the primitives. What is missing is unification at the message layer."**

This bot unifies existing APIs into a coherent workflow without any new platform features:
- **Graph API** for SharePoint Lists (state)
- **Action.Execute** for in-place card updates (visibility)
- **Azure OpenAI function calling** for NL queries (intelligence)
- **node-cron** for scheduled triggers
- **Bot commands** for manual triggers

The entire workflow stays in the channel. Users never navigate to SharePoint, Power Automate, or any external surface.
