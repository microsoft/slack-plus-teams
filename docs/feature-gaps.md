# Feature Gap Analysis: Slack ↔ Teams

A complete inventory of every feature that does **not** have a direct equivalent on the other platform, organized by severity. Each gap includes mitigations in both directions.

## How to Read This Document

- **Slack → Teams** = you have a Slack bot and are adding Teams support
- **Teams → Slack** = you have a Teams bot and are adding Slack support
- Effort estimates are per-feature implementation hours
- Features with direct 1:1 mappings (GREEN) are not listed — see [messaging-and-commands.md](messaging-and-commands.md) and [ui-components.md](ui-components.md) for those

---

## RED Gaps — No Platform Equivalent

These features exist on one platform with **no counterpart** on the other. They require redesign, custom infrastructure, or acceptance of reduced functionality.

---

### R1. Ephemeral Messages

**Slack has it. Teams does not.**

Slack's `chat.postEphemeral()` sends a message visible only to one user in a channel. Teams has no visibility flag — all bot messages are visible to everyone.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| `refresh.userIds` on `Action.Execute` | Slack → Teams | Card shows different content per user. Covers ~80% of cases. Max 60 user IDs per card. | 4–8 hrs |
| Route to 1:1 chat | Slack → Teams | Send private content to user's personal bot chat via proactive messaging. Different UX but reliable. | 2–4 hrs |
| Build `sendEphemeral()` helper | Slack → Teams | Wrapper that auto-detects context and picks the best strategy. Worth it if many handlers use ephemeral. | 8–12 hrs |
| Drop ephemeral behavior | Slack → Teams | Show messages to everyone. Simplest but may expose private data. | 0 hrs |
| **Native `chat.postEphemeral()`** | **Teams → Slack** | **Direct API call. No gap in this direction.** | **0 hrs** |

---

### R2. Custom Emoji Reactions

**Slack has it. Teams does not.**

Slack supports unlimited custom emoji as reactions. Teams supports exactly 6 fixed reactions: like, heart, laugh, surprised, sad, angry. Bots that use reactions as workflow signals (`:white_check_mark:` = approved) cannot map to Teams.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Adaptive Card buttons | Slack → Teams | Replace reaction workflows with `Action.Submit` buttons (e.g., "Approve" / "Reject"). Better audit trail. | 4–8 hrs |
| Map to 6 fixed reactions | Slack → Teams | Map most important reactions to like/heart/laugh/surprised/sad/angry. Lossy — only works with ≤6 reactions. | 2–4 hrs |
| **Native emoji reactions** | **Teams → Slack** | **Direct mapping. Slack supports unlimited custom emoji.** | **0 hrs** |

---

### R3. Modal Cancel Notification (`viewClosed`)

**Slack has it. Teams does not.**

Slack fires `view_closed` when a user dismisses a modal (with `notify_on_close: true`). Teams sends no notification when a dialog is dismissed — the bot never knows the user cancelled.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Timeout + explicit Cancel button | Slack → Teams | Add a "Cancel" button inside the dialog. Implement 5-min TTL for cleanup of stale locks/state. | 4–8 hrs |
| Accept stale state | Slack → Teams | Drop cancel cleanup. Accept that some locks may persist until TTL. | 0 hrs |
| **Native `notify_on_close: true`** | **Teams → Slack** | **Set `notify_on_close: true` in `views.open()`. Native support.** | **0 hrs** |

---

### R4. Mid-Form Dynamic Updates

**Slack has it. Teams does not.**

Slack modals support `dispatch_action: true` on inputs, which fires `block_actions` events while the modal is open. The bot can then call `views.update()` to change the modal dynamically (e.g., show/hide fields based on a dropdown selection). Teams dialogs have no equivalent — Adaptive Card inputs don't fire events until the form is submitted.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Multi-step dialogs | Slack → Teams | Split dependent fields across dialog steps. Step 1 collects the trigger value; step 2 shows dependent fields. | 8–16 hrs |
| `Action.ToggleVisibility` | Slack → Teams | Show/hide elements client-side. Works for simple show/hide but cannot fetch server data. | 2–4 hrs |
| Web-based task module | Slack → Teams | Embed a full web form in an iframe with real-time interactivity. Full control but much more effort. | 16–24 hrs |
| **Native `block_actions` + `views.update()`** | **Teams → Slack** | **Set `dispatch_action: true` on input elements. Handle `block_actions` and call `views.update()`.** | **2–4 hrs** |

---

### R5. Server-Side Field Validation with Inline Errors

**Slack has it. Teams does not.**

Slack's `view_submission` handler can return `response_action: "errors"` with a map of `{ block_id: "error message" }` to show inline validation errors without closing the modal. Teams dialogs close on submit — there is no way to keep the dialog open with error messages.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Re-open dialog with errors | Slack → Teams | On validation failure, return a new dialog card pre-populated with the user's data and error messages in field labels. | 4–8 hrs |
| Client-side validation only | Slack → Teams | Use Adaptive Card `isRequired`, `regex`, `maxLength`, `min`/`max`. Covers simple cases but not async checks (e.g., "username taken"). | 1–2 hrs |
| **Native `response_action: "errors"`** | **Teams → Slack** | **Return `{ response_action: "errors", errors: { block_id: "msg" } }` from `view_submission` handler.** | **0 hrs** |

---

### R6. Dialog / Modal Stacking

**Slack has it. Teams does not.**

Slack supports `views.push()` to stack up to 3 modals. The user can navigate back by dismissing the top modal. Teams dialogs do not stack — opening a new dialog replaces the current one.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Single dialog with step routing | Slack → Teams | One dialog with internal step state. Submit handler checks step number and returns the next step's card. Add a "Back" button that decrements the step. | 8–16 hrs |
| Build `StepDialog` helper | Slack → Teams | Reusable class managing step state, forward/back navigation. Worth it if 3+ wizard flows exist. | 16–24 hrs |
| Sequential separate dialogs | Slack → Teams | Close current dialog, open next. No back navigation. Degraded UX. | 4–8 hrs |
| **Native `views.push()`** | **Teams → Slack** | **Call `views.push()` from within a `view_submission` or `block_actions` handler. Up to 3 levels.** | **0 hrs** |

---

### R7. Scheduled Message API

**Slack has it. Teams does not.**

Slack provides `chat.scheduleMessage()` and `chat.deleteScheduledMessage()` as first-class APIs. Teams has no server-side scheduling — the bot must build its own.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Azure Functions timer + Cosmos DB | Slack → Teams | Store message + target time in DB. Timer function polls every minute and sends via proactive messaging. | 16–24 hrs |
| Azure Queue visibility timeout | Slack → Teams | Enqueue with `visibilityTimeout` set to the delay. Queue trigger fires at the right time. 7-day max. | 8–12 hrs |
| Azure Service Bus scheduled messages | Slack → Teams | `scheduleMessages(msg, scheduledTime)`. Exact-time delivery, native cancellation. Best for high volume. | 12–16 hrs |
| Power Automate | Slack → Teams | "Delay until" action in a flow. No code but requires license for custom connectors. | 8–12 hrs |
| In-process timer (dev only) | Slack → Teams | `setTimeout` / `node-cron`. Not durable — lost on restart. | 2–4 hrs |
| **Native `chat.scheduleMessage()`** | **Teams → Slack** | **Direct API call with `post_at` Unix timestamp. Native cancellation via `deleteScheduledMessage()`.** | **0 hrs** |

---

### R8. Channel Archive

**Slack has it. Teams does not.**

Slack's `conversations.archive()` archives a channel — it becomes read-only and hidden from the channel list. Teams can only archive an entire Team, not individual channels.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Rename with `[ARCHIVED]` prefix | Slack → Teams | Rename channel, update description to "Archived on {date}". Non-destructive. Cosmetic only. | 4–8 hrs |
| Rename + remove all members | Slack → Teams | Rename + kick everyone. Stronger enforcement but destructive and hard to undo. | 8–12 hrs |
| Team-level archive | Slack → Teams | Archive the entire Team via Graph. Only works if the channel has a dedicated Team. | 2–4 hrs |
| **Native `conversations.archive()`** | **Teams → Slack** | **Direct API call. Reversible via `conversations.unarchive()`.** | **0 hrs** |

---

### R9. Retroactive Link Unfurling

**Slack has it. Teams does not.**

Slack unfurls links in existing messages (edited to add a link, or links posted before the bot was installed). Teams only unfurls links in new messages — editing a message to add a link does not trigger unfurling.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| **Accept the limitation (Recommended)** | Slack → Teams | No workaround exists. New message unfurling works fine. | 0 hrs |
| Manual preview command | Slack → Teams | Bot command where users paste a URL to get a preview card. Niche use case. | 4–8 hrs |
| **Native retroactive unfurling** | **Teams → Slack** | **Slack unfurls retroactively by default. No issue.** | **0 hrs** |

---

### R10. Firewall-Friendly Transport (Socket Mode)

**Slack has it. Teams does not.**

Slack's Socket Mode uses an outbound WebSocket — no inbound ports needed. The bot can run behind any firewall. Teams requires a public HTTPS endpoint for inbound webhooks.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Deploy to Azure | Slack → Teams | Host in App Service / Functions / Container Apps. Use Dev Tunnels for local dev. Standard cloud deployment. | 4–8 hrs |
| Azure Relay | Slack → Teams | Hybrid connection for strict on-premises firewalls that cannot expose any public endpoint. Adds latency. | 8–16 hrs |
| **Native Socket Mode** | **Teams → Slack** | **Set `socketMode: true` with `appToken`. Outbound WebSocket, zero inbound ports.** | **1–2 hrs** |

---

## YELLOW Gaps — Equivalent Exists but Requires Design Decisions

These features have functional equivalents on the other platform, but the mapping is not 1:1 and requires choosing an approach.

---

### Y1. Slash Commands

**Slack has native `/command`. Teams does not.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Text pattern matching | Slack → Teams | Detect command-like text in `app.on("message")`. Accept `weather` and `/weather`. | 2–4 hrs |
| Manifest bot commands | Slack → Teams | Add `commands[]` to manifest for Teams command menu. Not `/` prefix but discoverable. | 1–2 hrs |
| Message extension | Slack → Teams | `composeExtensions` for richer command UX with search results or task modules. | 8–12 hrs |
| **Native `app.command()`** | **Teams → Slack** | **Register via `app.command("/cmd", handler)`. Add `ack()` call. Configure in Slack app dashboard.** | **2–4 hrs** |

---

### Y2. Thread Broadcast (`reply_broadcast`)

**Slack has it as a single call. Teams requires two.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Two API calls | Slack → Teams | Call `reply()` (thread) + `send()` (channel) separately. | 1–2 hrs |
| `replyWithBroadcast()` wrapper | Slack → Teams | Convenience method that calls both internally. | 2–4 hrs |
| **Native `reply_broadcast: true`** | **Teams → Slack** | **Single `say()` call with `reply_broadcast: true`.** | **0 hrs** |

---

### Y3. Thread Discovery

**Slack has `conversations.replies()`. Teams uses Graph API.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Graph API direct | Slack → Teams | `GET /teams/{teamId}/channels/{channelId}/messages/{messageId}/replies`. Requires `ChannelMessage.Read.All`. | 4–8 hrs |
| `getThreadReplies()` helper | Slack → Teams | Wrapper encapsulating Graph client setup, auth, and pagination. | 8–12 hrs |
| **Native `conversations.replies()`** | **Teams → Slack** | **Direct API call with thread `ts`.** | **0 hrs** |

---

### Y4/5/6. File Upload

**Slack: one call. Teams: 3-step consent flow.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| `sendFile()` helper | Slack → Teams | Unified wrapper: auto-detects personal/channel, routes to OneDrive/SharePoint, chunks >4 MB. | 24–40 hrs |
| Manual FileConsentCard | Slack → Teams | Implement 3-step consent flow directly. Verbose and error-prone. | 16–24 hrs |
| **Native `files.uploadV2()`** | **Teams → Slack** | **Single API call. No consent step.** | **1–2 hrs** |

---

### Y7. Link Unfurling Deadline

**Slack: 30-minute async. Teams: 5-second sync.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Cache-first with prefetch | Slack → Teams | Cache middleware wraps handler. Pre-populate for known URLs. Without this, slow unfurls silently fail. | 12–16 hrs |
| Synchronous handler only | Slack → Teams | Direct handler. Only viable for fast data sources (<5 seconds). | 4–8 hrs |
| **Native async `chat.unfurl()`** | **Teams → Slack** | **Handle `link_shared` event. Respond within 30 minutes via `chat.unfurl()`.** | **2–4 hrs** |

---

### Y8. Reminders

**Slack has `reminders.add()`. Teams does not.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Piggyback on scheduler (R7) | Slack → Teams | Reuse scheduled message infrastructure. `setReminder()` stores + sends to 1:1 chat at target time. | 4–8 hrs (if scheduler exists) |
| Power Automate + Planner | Slack → Teams | Create Planner tasks with due-date notifications. | 8–12 hrs |
| **Native `reminders.add()`** | **Teams → Slack** | **Direct API call. Platform-managed delivery.** | **0 hrs** |

---

### Y9. Dynamic Select Menus (Server-Side Typeahead)

**Slack has `external_data_source` + `block_suggestion`. Teams does not.**

Slack's `app.options()` handler receives keystrokes and returns filtered results from the server. Teams' `Input.ChoiceSet` is client-side only.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Pre-populated `Input.ChoiceSet` | Slack → Teams | Load all options at dialog open. Client-side filtering via `style: "filtered"`. Works up to ~500 items. | 2–4 hrs |
| Two-step dialog | Slack → Teams | Step 1: text input for search. Step 2: filtered results as `ChoiceSet`. Works for any dataset size. | 8–12 hrs |
| Web-based task module | Slack → Teams | Embed a web view with search-as-you-type. Full control. High effort. | 16–24 hrs |
| **Native `block_suggestion`** | **Teams → Slack** | **Set `external_data_source: true` on select. Handle `app.options()` for server-side filtering.** | **2–4 hrs** |

---

### Y10. App Home

**Slack has `app_home_opened` + `views.publish()`. Teams uses tabs.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| `tab.fetch` handler | Slack → Teams | Personal tab returns Adaptive Card on every open. Closest to `app_home_opened`. | 4–8 hrs |
| Welcome card on install | Slack → Teams | Send card to 1:1 chat on `install.add`. Simple but fires once. | 1–2 hrs |
| Static web tab | Slack → Teams | Full web page in iframe. Richer but needs hosting + Teams JS SDK. | 8–16 hrs |
| **Native `views.publish()`** | **Teams → Slack** | **Listen for `app_home_opened` event. Call `views.publish()` with Block Kit.** | **2–4 hrs** |

---

### Y11. View Hash (Race Condition Protection)

**Slack has `view_hash`. Teams does not.**

Slack's `views.update()` accepts a `view_hash` parameter. If the view has changed since the hash was captured, the update is rejected. This prevents race conditions. Teams has no equivalent.

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Manual `_version` field | Slack → Teams | Inject version counter into `Action.Submit.data`. Reject updates where the submitted version doesn't match the stored version. | 2–4 hrs |
| Card versioning middleware | Slack → Teams | SDK plugin auto-injecting and checking version counters on every card send/receive. | 4–8 hrs |
| **Native `view_hash`** | **Teams → Slack** | **Pass `view_hash` from the previous `views.open()` / `views.update()` response.** | **0 hrs** |

---

### Y12. Global Shortcuts

**Slack has `app.shortcut()` (global). Teams uses compose extensions.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Compose extension | Slack → Teams | `composeExtensions` with `context: ["compose", "commandBox"]`. Always opens task module. | 8–12 hrs |
| Minimal-dismiss pattern | Slack → Teams | Task module returns tiny "Done" card for fire-and-forget actions. | 4–8 hrs |
| Bot command | Slack → Teams | Replace shortcut with typed command. Simpler but less discoverable. | 2–4 hrs |
| **Native `app.shortcut()`** | **Teams → Slack** | **Register global shortcut callback. Can fire-and-forget (ack + background work).** | **2–4 hrs** |

---

### Y13. Message Shortcuts

**Slack has `message_shortcut`. Teams uses action-based message extensions.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Action message extension | Slack → Teams | `composeExtensions` command with `context: ["message"]`. Message payload in `activity.value.messagePayload`. | 4–8 hrs |
| **Native `message_shortcut`** | **Teams → Slack** | **Register `app.shortcut()` with type `message_shortcut`. Message in `shortcut.message`.** | **2–4 hrs** |

---

### Y14. Confirmation Dialogs on Buttons

**Slack has native `confirm` object. Teams does not.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| `Action.ShowCard` inline | Slack → Teams | Inline expand with "Are you sure?" + Yes/No buttons. Native Adaptive Card. | 2–4 hrs |
| Task module confirm | Slack → Teams | Small dialog popup. More prominent, closer to Slack UX. | 4–6 hrs |
| `confirmAction()` helper | Slack → Teams | Template function generating confirm cards. Reusable. | 4–8 hrs |
| **Native `confirm` object** | **Teams → Slack** | **Add `confirm` object to button element. Platform-rendered popup.** | **0 hrs** |

---

### Y15. Unfurl Domain Wildcards

**Slack supports `*.example.com`. Teams requires exact domain listing.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Manual enumeration | Slack → Teams | List every subdomain in manifest `domains[]`. Fine for <10. | 1–2 hrs |
| Manifest generator script | Slack → Teams | Script reads subdomain list from config and generates manifest array. | 4–8 hrs |
| **Native wildcard support** | **Teams → Slack** | **Wildcards work out of the box.** | **0 hrs** |

---

### Y16. All Channel Messages Without @Mention

**Slack gets them by default. Teams requires RSC permission.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| RSC permission | Slack → Teams | Add `ChannelMessage.Read.Group` to manifest `webApplicationInfo.applicationPermissions`. Config only. | 1–2 hrs |
| Require @mention | Slack → Teams | Change UX to require @mention. Simplifies permissions but changes behavior. | 0 hrs |
| **Default behavior** | **Teams → Slack** | **Slack bots receive all messages in channels they're added to. No config needed.** | **0 hrs** |

---

### Y17. Built-in Retry / Resilience

**Slack Bolt has `retryConfig`. Teams SDK has no built-in retry.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Build `RetryPlugin` | Slack → Teams | Plugin with exponential backoff, jitter, circuit breaker. | 12–16 hrs |
| Manual retry wrapper | Slack → Teams | Hand-roll backoff around outbound calls. Simpler but easy to get wrong. | 4–8 hrs |
| **Native Bolt `retryConfig`** | **Teams → Slack** | **Configure in `App` constructor. Built-in exponential backoff.** | **0 hrs** |

---

### Y18. Workflow Builder

**Slack has it (free). Teams uses Power Automate (licensed).**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Bot-driven orchestration | Slack → Teams | State machine + Adaptive Card buttons + persistent storage. No license dependency. | 16–40 hrs |
| Power Automate rebuild | Slack → Teams | Rebuild in Power Automate. Custom steps need Premium license. | 24–80 hrs |
| Teams Workflows app | Slack → Teams | Simplified UI for basic automations (free). Limited scenarios. | 4–8 hrs |
| Hybrid | Slack → Teams | Simple flows → Power Automate, complex → bot-driven. | Varies |
| **Native Workflow Builder** | **Teams → Slack** | **Rebuild in Slack Workflow Builder. Free, no license.** | **8–16 hrs** |

---

### Y19. App Distribution

**Both platforms have app stores, but packaging and review differ.**

| Strategy | Direction | How | Effort |
|---|---|---|---|
| Org app catalog | Slack → Teams | Publish to organization catalog via Teams Admin Center. Requires admin approval. | 2–4 hrs |
| Sideloading | Slack → Teams | ZIP manifest + icons. Upload via Teams client. May be disabled by admin. | 1–2 hrs |
| Partner Center (public) | Slack → Teams | Submit to Teams App Store. 1–2 week review. Requires Partner Network account. | 8–16 hrs |
| **Slack App Directory** | **Teams → Slack** | **Submit via api.slack.com. Hours-to-days review. Implement `InstallProvider` for OAuth install flow.** | **4–8 hrs** |

---

## Summary: Gap Asymmetry

Most RED gaps are asymmetric — they only apply in one direction. The pattern is clear:

| Direction | RED gaps to handle | Why |
|---|---|---|
| **Slack → Teams** | 10 RED gaps | Teams lacks ephemeral, custom reactions, modal stacking, cancel notifications, mid-form updates, field validation, scheduling, channel archive, retroactive unfurl, Socket Mode |
| **Teams → Slack** | 0 RED gaps | Slack has native support for everything Teams offers, plus more |

This means **adding Slack to a Teams bot is significantly easier** than adding Teams to a Slack bot. A Teams → Slack migration mostly involves mapping concepts 1:1 (Adaptive Cards → Block Kit, `app.on("message")` → `app.message()`, etc.) with few design decisions. A Slack → Teams migration requires redesigning multiple interaction patterns.

### Effort Estimates by Bot Complexity

| Profile | Slack Features Used | Slack → Teams Effort | Teams → Slack Effort |
|---|---|---|---|
| **A** — Simple | Messages, basic commands, simple cards | 8–16 hrs | 4–8 hrs |
| **B** — Moderate | A + ephemeral, threads, files, basic interactivity | 40–80 hrs | 8–16 hrs |
| **C** — Complex | B + shortcuts, App Home, unfurling, dynamic selects, modals | 80–160 hrs | 16–32 hrs |
| **D** — Full | C + workflows, scheduling, Socket Mode, stacked modals | 160–300 hrs | 32–48 hrs |
