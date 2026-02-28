# Teams Bot → Add Slack Support

This example demonstrates a **Teams bot** that adds **Slack support** as a second platform. It shows the recommended cross-platform architecture: shared business logic with platform-specific adapters.

## What Was Bridged

| Teams (Original) | Slack (Added) | Notes |
|---|---|---|
| `app.on("message")` | `app.message()` | Direct mapping |
| Adaptive Cards (TextBlock, FactSet, Action.Submit) | Block Kit (header, section with fields, buttons) | See `ui/blocks.ts` for conversion |
| `Action.Submit` with `data.action` | Button with `action_id` | Slack fires immediately on click |
| `"positive"` / `"destructive"` styles | `"primary"` / `"danger"` styles | Style names differ |
| HTTP endpoint (`:3978/api/messages`) | Socket Mode (WebSocket) | No port conflict |

## Architecture

```
src/
  index.ts                  ← Starts both bots
  service/
    message-handler.ts      ← Shared business logic (no platform imports)
  adapters/
    teams-bot.ts            ← Teams SDK v2 handlers (original)
    slack-bot.ts            ← Slack Bolt handlers (new)
  ui/
    cards.ts                ← BotResponse → Adaptive Card (original)
    blocks.ts               ← BotResponse → Block Kit (new)
```

## Prerequisites

- Node.js 18+
- Azure Bot registration (for Teams)
- Slack app with Socket Mode enabled (for Slack)

## Environment Setup

1. Copy `.env.sample` to `.env`
2. Fill in Teams credentials (`CLIENT_ID`, `CLIENT_SECRET`, `TENANT_ID`) from your Azure Bot registration
3. Fill in Slack credentials:
   - `SLACK_BOT_TOKEN` — Bot User OAuth Token (starts with `xoxb-`)
   - `SLACK_APP_TOKEN` — App-Level Token with `connections:write` scope (starts with `xapp-`)
   - `SLACK_SIGNING_SECRET` — from Slack app settings

## Running Locally

```bash
npm install
npm run build
npm start
```

For Teams: use Dev Tunnels or ngrok to expose `:3978` and set the messaging endpoint in Azure Bot settings.

For Slack: Socket Mode connects automatically — no tunnel needed.

## TODO

- [ ] Add slash command support (`/ticket` → create ticket form)
- [ ] Add modal/task-module for ticket creation form
- [ ] Normalize user identity across platforms (email-based mapping)
- [ ] Add health check endpoint
