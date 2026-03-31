/**
 * Adaptive Card builders for standup workflow.
 *
 * Pillar 5: Visibility — standup records render inline as interactive,
 * updatable cards tied to backing store records.
 *
 * All cards use Action.Execute (not Action.Submit) so the bot can return
 * a refreshed card in-place via the adaptiveCard/action invoke response.
 */

import type { StandupRecord, StandupSummary } from "../store/standup-store.js";

/** Card that prompts the team for standup input — posted on schedule or /standup. */
export function standupPromptCard(): object {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: "Daily Standup",
        weight: "Bolder",
        size: "Large",
      },
      {
        type: "TextBlock",
        text: "Share your update for today. Your response will be recorded and visible in this thread.",
        wrap: true,
        isSubtle: true,
      },
      {
        type: "Input.Text",
        id: "yesterday",
        label: "What did you do yesterday?",
        isMultiline: true,
        isRequired: true,
        errorMessage: "Please share what you worked on yesterday.",
      },
      {
        type: "Input.Text",
        id: "today",
        label: "What will you work on today?",
        isMultiline: true,
        isRequired: true,
        errorMessage: "Please share your plan for today.",
      },
      {
        type: "Input.Text",
        id: "blockers",
        label: "Any blockers? (leave empty if none)",
        isMultiline: true,
        isRequired: false,
      },
    ],
    actions: [
      {
        type: "Action.Execute",
        title: "Submit Update",
        verb: "submitStandup",
        style: "positive",
      },
    ],
  };
}

/** Card showing a single standup response — the message-native record. */
export function standupRecordCard(record: StandupRecord): object {
  const blockerSection = record.hasBlockers
    ? [
        {
          type: "TextBlock",
          text: "Blockers",
          weight: "Bolder",
          color: "Attention",
          spacing: "Medium",
        },
        { type: "TextBlock", text: record.blockers, wrap: true },
      ]
    : [
        {
          type: "TextBlock",
          text: "No blockers",
          isSubtle: true,
          spacing: "Medium",
        },
      ];

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      {
        type: "ColumnSet",
        columns: [
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "TextBlock",
                text: `Standup: ${record.respondent}`,
                weight: "Bolder",
                size: "Medium",
              },
            ],
          },
          {
            type: "Column",
            width: "auto",
            items: [
              {
                type: "TextBlock",
                text: record.date,
                isSubtle: true,
                horizontalAlignment: "Right",
              },
            ],
          },
        ],
      },
      {
        type: "TextBlock",
        text: "Yesterday",
        weight: "Bolder",
        spacing: "Medium",
      },
      { type: "TextBlock", text: record.yesterday, wrap: true },
      {
        type: "TextBlock",
        text: "Today",
        weight: "Bolder",
        spacing: "Medium",
      },
      { type: "TextBlock", text: record.today, wrap: true },
      ...blockerSection,
    ],
    actions: [
      {
        type: "Action.Execute",
        title: "Edit",
        verb: "editStandup",
        data: { recordId: record.id },
      },
    ],
  };
}

/** Card showing the edit form for an existing standup record. */
export function standupEditCard(record: StandupRecord): object {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: `Edit Standup: ${record.respondent}`,
        weight: "Bolder",
        size: "Medium",
      },
      {
        type: "Input.Text",
        id: "yesterday",
        label: "What did you do yesterday?",
        value: record.yesterday,
        isMultiline: true,
        isRequired: true,
      },
      {
        type: "Input.Text",
        id: "today",
        label: "What will you work on today?",
        value: record.today,
        isMultiline: true,
        isRequired: true,
      },
      {
        type: "Input.Text",
        id: "blockers",
        label: "Any blockers?",
        value: record.blockers,
        isMultiline: true,
      },
    ],
    actions: [
      {
        type: "Action.Execute",
        title: "Save",
        verb: "saveStandup",
        data: { recordId: record.id },
        style: "positive",
      },
      {
        type: "Action.Execute",
        title: "Cancel",
        verb: "cancelEdit",
        data: { recordId: record.id },
      },
    ],
  };
}

/** Summary card showing all responses for a date. */
export function standupSummaryCard(summary: StandupSummary): object {
  const body: object[] = [
    {
      type: "TextBlock",
      text: `Standup Summary: ${summary.date}`,
      weight: "Bolder",
      size: "Large",
    },
    {
      type: "FactSet",
      facts: [
        { title: "Responses", value: String(summary.totalResponses) },
        { title: "With blockers", value: String(summary.blockerCount) },
        {
          title: "Respondents",
          value: summary.respondents.join(", ") || "None yet",
        },
      ],
    },
  ];

  if (summary.blockers.length > 0) {
    body.push({
      type: "TextBlock",
      text: "Blockers",
      weight: "Bolder",
      color: "Attention",
      spacing: "Large",
    });

    for (const b of summary.blockers) {
      body.push({
        type: "TextBlock",
        text: `**${b.respondent}:** ${b.text}`,
        wrap: true,
        spacing: "Small",
      });
    }
  }

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body,
  };
}

/** Card showing a list of blocker records. */
export function blockersCard(
  records: { respondent: string; blockers: string; date: string }[]
): object {
  const body: object[] = [
    {
      type: "TextBlock",
      text: `Current Blockers (${records.length})`,
      weight: "Bolder",
      size: "Large",
    },
  ];

  if (records.length === 0) {
    body.push({
      type: "TextBlock",
      text: "No blockers reported. The team is unblocked!",
      isSubtle: true,
    });
  } else {
    for (const r of records) {
      body.push({
        type: "ColumnSet",
        separator: true,
        columns: [
          {
            type: "Column",
            width: "stretch",
            items: [
              { type: "TextBlock", text: `**${r.respondent}**`, wrap: true },
              { type: "TextBlock", text: r.blockers, wrap: true, isSubtle: true, spacing: "None" },
            ],
          },
          {
            type: "Column",
            width: "auto",
            items: [
              { type: "TextBlock", text: r.date, isSubtle: true },
            ],
          },
        ],
      });
    }
  }

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body,
  };
}
