# slack-modals-to-teams-dialogs-ts

## purpose

Migrating Slack modal workflows (`views.open`, `viewSubmission`, `viewsUpdate`, `viewClosed`, `blockSuggestion` in modals) to Teams task module / dialog flows using the Teams SDK v2.

## rules

1. Slack `views.open(trigger_id, view)` maps to Teams `dialog.open` handler. In Slack, the app calls `ctx.client().viewsOpen()` with a `trigger_id` from a slash command or interaction. In Teams, the dialog opens when the user clicks an `Action.Submit` with `{ msteams: { type: 'task/fetch' } }` in its data, or from a manifest command. The `dialog.open` handler returns the card form.
2. Slack `app.viewSubmission(callback_id)` maps to Teams `app.on('dialog.submit', handler)`. Slack provides form data in `view.state.values[block_id][action_id]`; Teams provides it in `activity.value.data` as a flat object keyed by Adaptive Card input `id`s.
3. Slack `viewsUpdate` (updating the current modal) maps to returning a `continue` response from `dialog.submit` with a new card. Slack's `ctx.ack({ response_action: 'update', view: newView })` becomes returning `{ status: 200, body: { task: { type: 'continue', value: { title, card } } } }`.
4. Slack `views.push` (stacking a new modal) has no Teams equivalent. Teams task modules do not support stacking. Flatten multi-modal stacks into a single multi-step dialog with step routing in `dialog.submit`, or redesign as sequential cards in the chat.
5. Slack `app.viewClosed(callback_id)` (`notify_on_close: true`) has no direct Teams equivalent. Teams does not notify the bot when a user closes/cancels a task module. If cleanup is needed, handle it via timeout or the next user interaction. For critical cleanup, consider storing pending state and reconciling on the next bot message.
6. Slack field-level validation with `ctx.ackWithErrors({ block_id: "error message" })` (which keeps the modal open and shows inline errors) has no server-side equivalent in Teams. Use Adaptive Card client-side validation (`isRequired`, `errorMessage`, `regex`, `min`, `max`) for pre-submit validation. For server-side validation that fails, return a `continue` response with the form re-rendered including error `TextBlock`s, or return a `message` response with the error text.
7. Slack `private_metadata` (arbitrary string stored on the view) maps to embedding hidden state in `Action.Submit.data` fields. Include any round-trip state (original command args, IDs, step indicators) in the card's submit action `data` object.
8. Slack `blockSuggestion` (typeahead/external data source for selects inside modals) maps to Adaptive Card `Input.ChoiceSet` with `"style": "filtered"` for client-side filtering, or `Data.Query` with dynamic data source for server-side filtering (schema 1.6+, limited Teams support). For most cases, pre-populate the choices at dialog open time instead of dynamic fetching.
9. Slack `blockAction` inside modals (responding to user interactions mid-form without submitting) has no Teams equivalent. Adaptive Card inputs do not fire events until `Action.Submit` is clicked. If the Slack modal updated dynamically based on a selection, redesign as: (a) multi-step dialog (submit step 1, return step 2 card), or (b) pre-compute all variants and include conditional data in the initial card.
10. Slack modal `title`, `submit`, and `close` labels map to task module `title` (in the `value` object) and Adaptive Card `Action.Submit` button titles. There is no separate close button label — the task module always shows a platform X button.

## patterns

### Slash command → modal → submit (full flow)

**Slack (before):**

```kotlin
// Slash command opens a modal
app.command("/meeting") { _, ctx ->
    val res = ctx.client().viewsOpen {
        it.triggerId(ctx.triggerId).viewAsString(modalJson)
    }
    if (res.isOk) ctx.ack()
    else Response.builder().statusCode(500).body(res.error).build()
}

// Handle submission
app.viewSubmission("meeting-arrangement") { req, ctx ->
    val stateValues = req.payload.view.state.values
    val agenda = stateValues["agenda"]!!["agenda-input"]!!.value
    val errors = mutableMapOf<String, String>()
    if (agenda.length <= 10) {
        errors["agenda"] = "Agenda needs to be longer than 10 characters."
    }
    if (errors.isNotEmpty()) {
        ctx.ackWithErrors(errors)
    } else {
        ctx.ack()
    }
}

// Handle close
app.viewClosed("meeting-arrangement") { _, ctx -> ctx.ack() }
```

**Teams (after):**

```typescript
import { App } from '@microsoft/teams.apps';
import { ConsoleLogger } from '@microsoft/teams.common';

const app = new App({
  logger: new ConsoleLogger('meeting-bot'),
});

// Step 1: Send a message with a button that triggers dialog.open
app.on('message', async ({ activity, send }) => {
  if (activity.text?.match(/\/meeting/i)) {
    await send({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.5',
          body: [{ type: 'TextBlock', text: 'Click below to arrange a meeting.' }],
          actions: [{
            type: 'Action.Submit',
            title: 'Arrange Meeting',
            data: { msteams: { type: 'task/fetch' } },
          }],
        },
      }],
    });
  }
});

// Step 2: dialog.open returns the form card (replaces views.open)
app.on('dialog.open', async () => {
  return {
    status: 200,
    body: {
      task: {
        type: 'continue',
        value: {
          title: 'Meeting Arrangement',
          width: 'medium',
          height: 'medium',
          card: {
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
              type: 'AdaptiveCard',
              version: '1.5',
              body: [
                {
                  type: 'Input.Date',
                  id: 'meetingDate',
                  label: 'Meeting Date',
                },
                {
                  type: 'Input.ChoiceSet',
                  id: 'topics',
                  label: 'Topics',
                  isMultiSelect: true,
                  style: 'filtered',
                  choices: [
                    { title: 'Schedule', value: 'schedule' },
                    { title: 'Budget', value: 'budget' },
                    { title: 'Assignment', value: 'assignment' },
                  ],
                },
                {
                  type: 'Input.Text',
                  id: 'agenda',
                  label: 'Detailed Agenda',
                  isMultiline: true,
                  isRequired: true,
                  errorMessage: 'Agenda is required',
                },
              ],
              actions: [{
                type: 'Action.Submit',
                title: 'Submit',
                data: { action: 'meeting-arrangement' },
              }],
            },
          },
        },
      },
    },
  };
});

// Step 3: dialog.submit handles form data (replaces viewSubmission)
app.on('dialog.submit', async ({ activity }) => {
  const data = activity.value.data;
  const agenda: string = data.agenda ?? '';

  // Server-side validation (replaces ctx.ackWithErrors)
  if (agenda.length <= 10) {
    // Return the form again with an error message
    return {
      status: 200,
      body: {
        task: {
          type: 'continue',
          value: {
            title: 'Meeting Arrangement',
            card: {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: {
                type: 'AdaptiveCard',
                version: '1.5',
                body: [
                  {
                    type: 'TextBlock',
                    text: 'Agenda needs to be longer than 10 characters.',
                    color: 'Attention',
                    weight: 'Bolder',
                  },
                  // ... repeat form fields with previous values pre-filled ...
                ],
                actions: [{
                  type: 'Action.Submit',
                  title: 'Submit',
                  data: { action: 'meeting-arrangement' },
                }],
              },
            },
          },
        },
      },
    };
  }

  // Success — close the dialog
  return {
    status: 200,
    body: {
      task: {
        type: 'message',
        value: `Meeting arranged! Date: ${data.meetingDate}, Topics: ${data.topics}`,
      },
    },
  };
});

// Note: No viewClosed equivalent — Teams does not notify on dialog cancel.

app.start(3978);
```

### Mapping reference table

| Slack Modal Concept | Teams Dialog Equivalent | Notes |
|---|---|---|
| `views.open(trigger_id, view)` | `dialog.open` handler returning `continue` response | Triggered by `Action.Submit` with `msteams: { type: 'task/fetch' }` |
| `viewSubmission(callback_id)` | `dialog.submit` handler | Form data in `activity.value.data` (flat object) |
| `ctx.ack()` (close modal) | Return `{ task: { type: 'message', value } }` | Message shown briefly, then dialog closes |
| `ctx.ack({ response_action: 'update', view })` | Return `{ task: { type: 'continue', value: { card } } }` | Replaces dialog content |
| `ctx.ack({ response_action: 'push', view })` | *(no equivalent)* | Flatten into multi-step dialog |
| `ctx.ackWithErrors(errors)` | Return `continue` with error TextBlocks, or use client-side validation | No native field-level error API |
| `viewClosed(callback_id)` | *(no equivalent)* | Teams does not notify on cancel |
| `private_metadata` | `Action.Submit.data` fields | Embed state in submit action |
| `view.state.values[block_id][action_id]` | `activity.value.data[inputId]` | Flat key-value vs nested structure |
| `blockSuggestion` (typeahead) | `Input.ChoiceSet` with `style: "filtered"` | Client-side only; pre-populate choices |
| `blockAction` mid-form | *(no equivalent)* | Redesign as multi-step dialog |
| Modal `title` / `submit` / `close` labels | `value.title` + `Action.Submit.title` | No custom close label |

## pitfalls

- **No modal stacking**: Slack's `views.push` stacks modals. Teams task modules cannot stack. Redesign stacked flows as multi-step forms within a single dialog (route by `data.step` in the submit handler).
- **No cancel notification**: Slack's `viewClosed` handler fires when a user clicks Cancel (with `notify_on_close: true`). Teams has no equivalent. Do not rely on cancel callbacks for critical state cleanup.
- **Validation UX is different**: Slack's `ackWithErrors` shows inline red text under specific fields and keeps the modal open. Teams has no server-side field-level error API. Use Adaptive Card `isRequired`/`errorMessage`/`regex` for client-side checks. For server-side failures, return a `continue` response with an error `TextBlock` added to the card.
- **Form data structure change**: Slack nests form data as `view.state.values[block_id][action_id].value`. Teams flattens it as `activity.value.data[inputId]`. The nesting is gone — input `id`s must be unique across the entire card.
- **Trigger mechanism change**: Slack opens modals from `trigger_id` (passed in slash command and interaction payloads). Teams opens dialogs from `Action.Submit` with `msteams: { type: 'task/fetch' }` or from manifest commands. There is no free-standing "open dialog" API call.
- **Dynamic selects**: Slack's `blockSuggestion` fires on each keystroke to fetch options server-side. Adaptive Card `Input.ChoiceSet` with `style: "filtered"` only filters pre-populated choices client-side. For truly dynamic data, pre-fetch at dialog open time or use `Data.Query` (limited support).
- **Mid-form interactions lost**: Slack modals can respond to `blockAction` events mid-form (e.g., showing/hiding fields based on a dropdown). Adaptive Cards do not fire events until submit. Redesign conditional forms as multi-step dialogs.
- **Returning nothing closes with error**: If the `dialog.submit` handler returns `undefined`, Teams shows a generic error. Always return a valid `{ status: 200, body: { task: { ... } } }` response.

## references

- https://api.slack.com/surfaces/modals — Slack modal documentation
- https://api.slack.com/surfaces/modals/using#pushing — Stacking views with views.push
- https://api.slack.com/surfaces/modals/using#closing — notify_on_close and viewClosed
- https://api.slack.com/reference/interaction-payloads/views — view_submission payload
- https://learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/task-modules/task-modules-bots — Teams task modules
- https://github.com/microsoft/teams.ts — Teams SDK v2

## instructions

Use this expert when migrating Slack modal workflows to Teams dialog/task module flows. It covers the full lifecycle: opening (views.open → dialog.open), submission (viewSubmission → dialog.submit), updating (response_action: update → continue response), stacking (views.push → multi-step redesign), closing (viewClosed → no equivalent), validation (ackWithErrors → client-side + continue), and dynamic selects (blockSuggestion → filtered ChoiceSet). Pair with `block-kit-to-adaptive-cards-ts.md` for converting modal Block Kit to Adaptive Card elements, `../teams/ui.dialogs-task-modules-ts.md` for Teams-side dialog patterns, and `../teams/ui.adaptive-cards-ts.md` for card construction.

## research

Deep Research prompt:

"Write a micro expert on migrating Slack modals (views.open, viewSubmission, viewsUpdate, viewClosed, blockSuggestion, blockAction in modals, ackWithErrors, private_metadata, notify_on_close) to Teams task modules / dialogs using Teams SDK v2. Include a comprehensive mapping table, a full worked example converting a Slack modal flow to a Teams dialog flow, and pitfalls around stacking, validation, cancel notification, and dynamic selects."
