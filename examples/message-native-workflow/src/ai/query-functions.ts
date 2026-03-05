/**
 * AI function calling for natural language queries over standup data.
 *
 * Pillar 4: Intelligence — users ask "show blockers", "summarize last week",
 * "what did Alice work on?" and the AI translates to structured queries.
 */

import OpenAI from "openai";
import {
  getStandupsByDate,
  getStandupsByDateRange,
  getBlockers,
  getStandupsByRespondent,
  summarizeDate,
  type StandupRecord,
  type StandupSummary,
} from "../store/standup-store.js";

// ---------- Tool definitions for the LLM ----------

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "queryStandups",
      description:
        "Query standup check-in records. Use when the user asks about standups, updates, what someone worked on, or standup history.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description:
              'ISO date (YYYY-MM-DD) to query. Use "today" logic to resolve relative dates.',
          },
          startDate: {
            type: "string",
            description: "Start of date range (ISO). Use with endDate for range queries like 'last week'.",
          },
          endDate: {
            type: "string",
            description: "End of date range (ISO).",
          },
          respondent: {
            type: "string",
            description: "Filter by respondent name (partial match).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "queryBlockers",
      description:
        "Query blockers reported in standups. Use when the user asks about blockers, obstacles, issues, or what's blocking the team.",
      parameters: {
        type: "object",
        properties: {
          currentOnly: {
            type: "boolean",
            description: "True for only the most recent blockers. False for all history. Default true.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "summarizeStandups",
      description:
        "Get a summary of standups for a specific date. Use when the user asks for a summary, overview, or status report.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "ISO date to summarize (YYYY-MM-DD).",
          },
        },
        required: ["date"],
      },
    },
  },
];

// ---------- Function implementations ----------

interface QueryResult {
  records?: StandupRecord[];
  summary?: StandupSummary;
  text: string;
}

function executeQueryStandups(args: {
  date?: string;
  startDate?: string;
  endDate?: string;
  respondent?: string;
}): QueryResult {
  let records: StandupRecord[];

  if (args.respondent) {
    records = getStandupsByRespondent(args.respondent);
  } else if (args.startDate && args.endDate) {
    records = getStandupsByDateRange(args.startDate, args.endDate);
  } else if (args.date) {
    records = getStandupsByDate(args.date);
  } else {
    records = getStandupsByDate(todayISO());
  }

  const text = records.length === 0
    ? "No standup records found for the given criteria."
    : `Found ${records.length} standup record(s). ${records.map(
        (r) =>
          `${r.respondent} (${r.date}): Yesterday: ${r.yesterday}. Today: ${r.today}.${
            r.hasBlockers ? ` Blockers: ${r.blockers}` : ""
          }`
      ).join(" | ")}`;

  return { records, text };
}

function executeQueryBlockers(args: { currentOnly?: boolean }): QueryResult {
  const records = getBlockers(args.currentOnly ?? true);
  const text = records.length === 0
    ? "No blockers reported. The team is unblocked."
    : `${records.length} blocker(s): ${records
        .map((r) => `${r.respondent}: ${r.blockers}`)
        .join(" | ")}`;

  return { records, text };
}

function executeSummarize(args: { date: string }): QueryResult {
  const summary = summarizeDate(args.date);
  const text = `Standup summary for ${summary.date}: ${summary.totalResponses} responses, ${summary.blockerCount} with blockers. Respondents: ${summary.respondents.join(", ") || "none"}.${
    summary.blockers.length > 0
      ? ` Blockers: ${summary.blockers.map((b) => `${b.respondent}: ${b.text}`).join("; ")}`
      : " No blockers."
  }`;

  return { summary, text };
}

// ---------- Main query handler ----------

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (openaiClient) return openaiClient;

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!endpoint || !apiKey) return null;

  openaiClient = new OpenAI({
    apiKey,
    baseURL: `${endpoint}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o"}`,
    defaultQuery: { "api-version": "2024-10-21" },
    defaultHeaders: { "api-key": apiKey },
  });
  return openaiClient;
}

export interface NLQueryResult {
  answer: string;
  records?: StandupRecord[];
  summary?: StandupSummary;
}

/**
 * Handle a natural language query about standup data.
 * Falls back to keyword matching if Azure OpenAI is not configured.
 */
export async function handleNLQuery(userMessage: string): Promise<NLQueryResult> {
  const client = getClient();

  // Fallback: keyword-based routing when AI is not configured
  if (!client) {
    return handleKeywordFallback(userMessage);
  }

  const today = todayISO();

  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a standup workflow assistant. Answer questions about daily standup check-ins.
Today's date is ${today}. Use the provided functions to query real data.
Never make up standup data — only report what the functions return.
When the user says "last week", compute the Monday-Friday dates for the previous work week.`,
      },
      { role: "user", content: userMessage },
    ],
    tools,
  });

  const choice = response.choices[0];
  const toolCalls = choice.message.tool_calls;

  if (!toolCalls?.length) {
    return { answer: choice.message.content ?? "I couldn't find relevant standup data for that query." };
  }

  // Execute function calls
  const toolCall = toolCalls[0];
  const args = JSON.parse(toolCall.function.arguments);
  let result: QueryResult;

  switch (toolCall.function.name) {
    case "queryStandups":
      result = executeQueryStandups(args);
      break;
    case "queryBlockers":
      result = executeQueryBlockers(args);
      break;
    case "summarizeStandups":
      result = executeSummarize(args);
      break;
    default:
      return { answer: "Unknown query type." };
  }

  // Send result back to LLM for natural language response
  const followUp = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Summarize the standup query results in a friendly, concise way. Use bullet points for multiple items. Include counts.",
      },
      { role: "user", content: userMessage },
      choice.message,
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: result.text,
      },
    ],
  });

  return {
    answer: followUp.choices[0].message.content ?? result.text,
    records: result.records,
    summary: result.summary,
  };
}

/** Simple keyword-based query when AI is not configured. */
function handleKeywordFallback(message: string): NLQueryResult {
  const lower = message.toLowerCase();
  const today = todayISO();

  if (lower.includes("blocker")) {
    const result = executeQueryBlockers({ currentOnly: true });
    return { answer: result.text, records: result.records };
  }

  if (lower.includes("summary") || lower.includes("summarize") || lower.includes("status")) {
    const result = executeSummarize({ date: today });
    return { answer: result.text, summary: result.summary };
  }

  // Default: show today's standups
  const result = executeQueryStandups({ date: today });
  return { answer: result.text, records: result.records };
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}
