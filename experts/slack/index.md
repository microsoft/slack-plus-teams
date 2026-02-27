# slack-router

## purpose

Route Slack app tasks to the minimal set of micro-expert files. Read only the clusters that match the user's request.

## task clusters

### Bolt Foundations
When: setting up a Slack Bolt app, `App()` constructor, listeners, middleware, event subscriptions
Read:
- `runtime.bolt-foundations-ts.md`
- `runtime.ack-rules-ts.md` (ack rules are integral to every Bolt handler)

### Ack Rules
When: `ack()` patterns, response timing, acknowledgement requirements, 3-second rule
Read:
- `runtime.ack-rules-ts.md`
Depends on: `runtime.bolt-foundations-ts.md` (ack applies within Bolt handler types)

### Slash Commands
When: slash commands, `/command`, command registration, command response
Read:
- `runtime.slash-commands-ts.md`
- `runtime.ack-rules-ts.md` (commands require ack within 3 seconds)
- `ui.block-kit-ts.md` (only if command opens a modal or sends Block Kit message)

### Block Kit UI
When: Block Kit, blocks, surfaces, modals, home tab, interactive components
Read:
- `ui.block-kit-ts.md`
- `runtime.ack-rules-ts.md` (interactive elements require ack in action/view handlers)
Depends on: `runtime.bolt-foundations-ts.md` (action/view handlers registered on the App)

### Events API
When: `app.event()`, event subscriptions, event types, `app_mention`, `reaction_added`, `team_join`, `app_home_opened`, `member_joined_channel`, retry handling, `context.retryNum`, `ignoreSelf`, `directMention`
Read:
- `bolt-events-ts.md`
- `runtime.bolt-foundations-ts.md` (handler registration context)

### Assistant Container
When: Slack Assistant, assistant panel, `threadStarted`, `userMessage`, `threadContextChanged`, `setStatus`, `setSuggestedPrompts`, `setTitle`, `getThreadContext`, `AssistantThreadContextStore`, `app.assistant()`
Read:
- `bolt-assistant-ts.md`
- `runtime.bolt-foundations-ts.md` (App setup for assistant registration)

### OAuth & Distribution
When: OAuth, multi-workspace, `InstallProvider`, `InstallationStore`, `authorize`, `clientId`, `clientSecret`, token storage, app distribution, `stateSecret`, Enterprise Grid, `tokens_revoked`, `app_uninstalled`
Read:
- `bolt-oauth-distribution-ts.md`
- `runtime.bolt-foundations-ts.md` (App constructor OAuth options)

## cross-platform bridging

If the developer wants to **add Teams support** to an existing Slack app, route to `../bridge/index.md` for cross-platform bridging experts. The bridge domain covers Slack↔Teams feature mapping, UI conversion, identity bridging, and infrastructure migration.

## combining rule

If a request spans multiple clusters (e.g., "add a slash command that opens a Block Kit modal"), read files from **every** matching cluster. Avoid duplicates.

## file inventory

`bolt-assistant-ts.md` | `bolt-events-ts.md` | `bolt-oauth-distribution-ts.md` | `runtime.ack-rules-ts.md` | `runtime.bolt-foundations-ts.md` | `runtime.slash-commands-ts.md` | `ui.block-kit-ts.md`

<!-- Updated 2026-02-27: Added bolt-assistant-ts (Assistant container), bolt-events-ts (Events API), bolt-oauth-distribution-ts (OAuth/multi-workspace) experts based on @slack/bolt v4.6.0 source -->
