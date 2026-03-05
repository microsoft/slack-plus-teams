/**
 * Standup workflow handlers — the core logic that wires all five pillars together.
 *
 * Pillar 1: Triggers — /standup command, scheduled cron, card actions
 * Pillar 2: State — createStandupRecord persists to the store
 * Pillar 3: Logic — aggregation, edit flow, card state machine
 * Pillar 4: Intelligence — NL queries via handleNLQuery
 * Pillar 5: Visibility — every mutation returns a refreshed card in-place
 */

import type { App } from "@microsoft/teams.apps";
import cron from "node-cron";
import {
  createStandupRecord,
  updateCardActivityId,
  getBlockers,
  summarizeDate,
  type StandupRecord,
} from "../store/standup-store.js";
import {
  standupPromptCard,
  standupRecordCard,
  standupEditCard,
  standupSummaryCard,
  blockersCard,
} from "../ui/standup-cards.js";
import { handleNLQuery } from "../ai/query-functions.js";

// Store conversation references for proactive messaging (Pillar 1: scheduled triggers)
const conversationRefs = new Map<string, {
  channelId: string;
  conversation: { id: string };
  serviceUrl: string;
}>();

// Track standup prompt activity IDs so responses can reply in-thread
const activePrompts = new Map<string, string>(); // conversationId -> promptActivityId

export function registerStandupHandlers(app: App): void {
  // ---------- Pillar 1: Command triggers ----------

  // /standup — manually trigger a standup prompt
  app.on("message", async (ctx) => {
    const text = (ctx.activity.text ?? "").trim().toLowerCase();

    // Store conversation reference for proactive messaging
    if (ctx.activity.conversation?.id && ctx.activity.serviceUrl) {
      conversationRefs.set(ctx.activity.conversation.id, {
        channelId: ctx.activity.channelId ?? "msteams",
        conversation: { id: ctx.activity.conversation.id },
        serviceUrl: ctx.activity.serviceUrl,
      });
    }

    if (text === "standup") {
      const response = await ctx.send({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: standupPromptCard(),
          },
        ],
      });
      // Track so responses can thread
      if (response?.id && ctx.activity.conversation?.id) {
        activePrompts.set(ctx.activity.conversation.id, response.id);
      }
      return;
    }

    if (text === "status") {
      const today = new Date().toISOString().split("T")[0];
      const summary = summarizeDate(today);
      await ctx.send({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: standupSummaryCard(summary),
          },
        ],
      });
      return;
    }

    if (text === "blockers") {
      const blockerRecords = getBlockers(true);
      await ctx.send({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: blockersCard(blockerRecords),
          },
        ],
      });
      return;
    }

    if (text === "help") {
      await ctx.send({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
              type: "AdaptiveCard",
              $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
              version: "1.5",
              body: [
                { type: "TextBlock", text: "Standup Bot Commands", weight: "Bolder", size: "Large" },
                {
                  type: "FactSet",
                  facts: [
                    { title: "standup", value: "Post a standup check-in prompt" },
                    { title: "status", value: "Show today's standup summary" },
                    { title: "blockers", value: "Show current blockers" },
                    { title: "help", value: "Show this help card" },
                  ],
                },
                {
                  type: "TextBlock",
                  text: "You can also ask natural language questions like:",
                  wrap: true,
                  spacing: "Medium",
                },
                {
                  type: "TextBlock",
                  text: '"What did Alice work on?" | "Show blockers from last week" | "Summarize Monday\'s standup"',
                  wrap: true,
                  isSubtle: true,
                },
              ],
            },
          },
        ],
      });
      return;
    }

    // ---------- Pillar 4: NL query for anything else ----------
    if (text.length > 3) {
      const result = await handleNLQuery(text);

      // Send the NL answer
      await ctx.send(result.answer);

      // Also send cards for the underlying records (Pillar 5: visibility)
      if (result.summary) {
        await ctx.send({
          type: "message",
          attachments: [
            {
              contentType: "application/vnd.microsoft.card.adaptive",
              content: standupSummaryCard(result.summary),
            },
          ],
        });
      } else if (result.records && result.records.length > 0 && result.records.length <= 5) {
        for (const record of result.records) {
          await ctx.send({
            type: "message",
            attachments: [
              {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: standupRecordCard(record),
              },
            ],
          });
        }
      }
    }
  });

  // ---------- Pillar 3 & 5: Card action handlers (state machine + visibility) ----------

  app.on("card.action" as any, async (ctx) => {
    const data = ctx.activity.value?.action?.data ?? ctx.activity.value ?? {};
    const verb = data.verb ?? ctx.activity.value?.action?.verb;

    // Submit standup check-in
    if (verb === "submitStandup") {
      const yesterday = data.yesterday ?? "";
      const today = data.today ?? "";
      const blockers = data.blockers ?? "";

      if (!yesterday || !today) {
        return {
          statusCode: 400,
          type: "application/vnd.microsoft.card.adaptive",
          value: standupPromptCard(), // Re-show the form
        };
      }

      // Pillar 2: Persist to store
      const record = createStandupRecord({
        respondent: ctx.activity.from?.name ?? "Unknown",
        respondentId: ctx.activity.from?.aadObjectId ?? ctx.activity.from?.id ?? "",
        date: new Date().toISOString().split("T")[0],
        yesterday,
        today,
        blockers,
        hasBlockers: blockers.trim().length > 0,
        threadActivityId: ctx.activity.replyToId ?? ctx.activity.id ?? "",
        conversationId: ctx.activity.conversation?.id ?? "",
        serviceUrl: ctx.activity.serviceUrl ?? "",
      });

      // Pillar 5: Replace the prompt card with the record card in-place
      return {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: standupRecordCard(record),
      };
    }

    // Edit standup
    if (verb === "editStandup") {
      const records = await import("../store/standup-store.js");
      const all = records.getStandupsByDate(new Date().toISOString().split("T")[0]);
      const record = all.find((r: StandupRecord) => r.id === data.recordId);
      if (!record) return { statusCode: 200, type: "application/vnd.microsoft.card.adaptive", value: {} };

      return {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: standupEditCard(record),
      };
    }

    // Save edited standup
    if (verb === "saveStandup") {
      const storeModule = await import("../store/standup-store.js");
      const all = storeModule.getStandupsByDate(new Date().toISOString().split("T")[0]);
      const record = all.find((r: StandupRecord) => r.id === data.recordId);
      if (!record) return { statusCode: 200, type: "application/vnd.microsoft.card.adaptive", value: {} };

      // Update fields in-place (in production, PATCH the list item)
      record.yesterday = data.yesterday ?? record.yesterday;
      record.today = data.today ?? record.today;
      record.blockers = data.blockers ?? "";
      record.hasBlockers = (record.blockers ?? "").trim().length > 0;

      return {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: standupRecordCard(record),
      };
    }

    // Cancel edit — show the record card again
    if (verb === "cancelEdit") {
      const storeModule = await import("../store/standup-store.js");
      const all = storeModule.getStandupsByDate(new Date().toISOString().split("T")[0]);
      const record = all.find((r: StandupRecord) => r.id === data.recordId);
      if (!record) return { statusCode: 200, type: "application/vnd.microsoft.card.adaptive", value: {} };

      return {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: standupRecordCard(record),
      };
    }

    return { statusCode: 200, type: "application/vnd.microsoft.card.adaptive", value: {} };
  });

  // ---------- Pillar 1: Scheduled trigger ----------

  const cronExpr = process.env.STANDUP_CRON ?? "0 9 * * 1-5";
  cron.schedule(cronExpr, async () => {
    console.log(`[standup] Scheduled trigger fired at ${new Date().toISOString()}`);
    for (const [convId, ref] of conversationRefs) {
      try {
        // In production, use adapter.continueConversation(ref, ...) for proactive send.
        // The Teams SDK v2 App doesn't expose a raw proactive API directly, so this
        // would be wired via the underlying BotFrameworkAdapter. For this example,
        // the ref is stored for demonstration purposes.
        console.log(`[standup] Would send prompt to conversation: ${convId}`);
      } catch (err) {
        console.error(`[standup] Failed to send to ${convId}:`, err);
      }
    }
  });

  console.log(`[standup] Scheduled standup cron: ${cronExpr}`);
}
