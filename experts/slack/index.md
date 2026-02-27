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

## combining rule

If a request spans multiple clusters (e.g., "add a slash command that opens a Block Kit modal"), read files from **every** matching cluster. Avoid duplicates.

## file inventory

`runtime.ack-rules-ts.md` | `runtime.bolt-foundations-ts.md` | `runtime.slash-commands-ts.md` | `ui.block-kit-ts.md`
