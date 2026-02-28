# Slack Bot → Add Teams Support

This example demonstrates a **Slack bot** that adds **Teams support** as a second platform. It shows the recommended cross-platform architecture: shared business logic with platform-specific adapters.

## What Was Bridged

| Slack (Original) | Teams (Added) | Notes |
|---|---|---|
| `app.message()` | `app.on("message")` | Direct mapping |
| Slash commands (`/weather`, `/poll`) | Text commands (`weather`, `poll`) | Teams has no slash commands — detect command-like text |
| `ack()` in command/action handlers | Automatic | Teams SDK handles acknowledgement internally |
| Block Kit (header, section, fields, buttons) | Adaptive Cards (TextBlock, FactSet, Action.Submit) | See `ui/cards.ts` for conversion |
| `*bold*` mrkdwn | `**bold**` standard Markdown | Slack mrkdwn ≠ Markdown |
| `action_id` on buttons | `Action.Submit` with `data.action` | Different routing mechanism |
| `"primary"` / `"danger"` styles | `"positive"` / `"destructive"` styles | Style names differ |
| Socket Mode (WebSocket) | HTTP endpoint (`:3978/api/messages`) | Teams requires inbound HTTPS |

## Architecture

```
src/
  index.ts                  ← Starts both bots
  service/
    message-handler.ts      ← Shared business logic (no platform imports)
  adapters/
    slack-bot.ts            ← Slack Bolt handlers (original)
    teams-bot.ts            ← Teams SDK v2 handlers (new)
  ui/
    blocks.ts               ← BotResponse → Block Kit (original)
    cards.ts                ← BotResponse → Adaptive Card (new)
```

## Prerequisites

- Node.js 18+
- Slack app with Socket Mode enabled (for Slack)
- Azure Bot registration (for Teams)

## Environment Setup

1. Copy `.env.sample` to `.env`
2. Fill in Slack credentials (existing):
   - `SLACK_BOT_TOKEN` — Bot User OAuth Token (starts with `xoxb-`)
   - `SLACK_APP_TOKEN` — App-Level Token with `connections:write` scope (starts with `xapp-`)
   - `SLACK_SIGNING_SECRET` — from Slack app settings
3. Fill in Teams credentials (new):
   - `CLIENT_ID`, `CLIENT_SECRET`, `TENANT_ID` from Azure Bot registration

## Running Locally

```bash
npm install
npm run build
npm start
```

For Slack: Socket Mode connects automatically — no tunnel needed.

For Teams: use Dev Tunnels or ngrok to expose `:3978` and set the messaging endpoint in Azure Bot settings.

## TODO

- [ ] Add modal/task-module for poll creation with options
- [ ] Normalize user identity across platforms (email-based mapping)
- [ ] Add proactive messaging for poll results
- [ ] Add health check endpoint
