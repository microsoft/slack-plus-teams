/**
 * SharePoint Lists store for standup records.
 *
 * Pillar 2: State — every standup response becomes a durable list item
 * linked to the originating thread via ThreadActivityId.
 *
 * In production, use @microsoft/microsoft-graph-client with app-only auth.
 * This example uses an in-memory store that mirrors the List schema so you
 * can run it without a SharePoint site. Set SHAREPOINT_SITE_ID to enable
 * the real Graph-backed store.
 */

export interface StandupRecord {
  id: string;
  respondent: string;
  respondentId: string;
  date: string; // ISO date (YYYY-MM-DD)
  yesterday: string;
  today: string;
  blockers: string;
  hasBlockers: boolean;
  threadActivityId: string;
  conversationId: string;
  serviceUrl: string;
  cardActivityId?: string;
  createdAt: string;
}

export interface StandupSummary {
  date: string;
  totalResponses: number;
  blockerCount: number;
  respondents: string[];
  blockers: { respondent: string; text: string }[];
}

// ---------- In-memory store (swap for Graph client in production) ----------

const records: StandupRecord[] = [];

export function createStandupRecord(
  fields: Omit<StandupRecord, "id" | "createdAt">
): StandupRecord {
  const record: StandupRecord = {
    ...fields,
    id: `standup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  records.push(record);
  return record;
}

export function updateCardActivityId(recordId: string, cardActivityId: string): void {
  const record = records.find((r) => r.id === recordId);
  if (record) record.cardActivityId = cardActivityId;
}

export function getStandupsByDate(date: string): StandupRecord[] {
  return records.filter((r) => r.date === date);
}

export function getStandupsByDateRange(start: string, end: string): StandupRecord[] {
  return records.filter((r) => r.date >= start && r.date <= end);
}

export function getBlockers(currentOnly: boolean): StandupRecord[] {
  const withBlockers = records.filter((r) => r.hasBlockers);
  if (!currentOnly) return withBlockers;

  // "Current" = from the most recent standup date
  const dates = [...new Set(withBlockers.map((r) => r.date))].sort().reverse();
  if (dates.length === 0) return [];
  return withBlockers.filter((r) => r.date === dates[0]);
}

export function getStandupsByRespondent(name: string, limit = 10): StandupRecord[] {
  return records
    .filter((r) => r.respondent.toLowerCase().includes(name.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function summarizeDate(date: string): StandupSummary {
  const dayRecords = getStandupsByDate(date);
  return {
    date,
    totalResponses: dayRecords.length,
    blockerCount: dayRecords.filter((r) => r.hasBlockers).length,
    respondents: dayRecords.map((r) => r.respondent),
    blockers: dayRecords
      .filter((r) => r.hasBlockers)
      .map((r) => ({ respondent: r.respondent, text: r.blockers })),
  };
}

/**
 * Production implementation would look like:
 *
 * async function createStandupRecord(fields) {
 *   return graphClient
 *     .api(`/sites/${siteId}/lists/${listId}/items`)
 *     .post({ fields: {
 *       Title: `Standup - ${fields.respondent} - ${fields.date}`,
 *       Respondent: fields.respondent,
 *       Yesterday: fields.yesterday,
 *       Today: fields.today,
 *       Blockers: fields.blockers,
 *       HasBlockers: fields.hasBlockers,
 *       ThreadActivityId: fields.threadActivityId,
 *       ConversationId: fields.conversationId,
 *     }});
 * }
 *
 * async function getStandupsByDate(date) {
 *   const res = await graphClient
 *     .api(`/sites/${siteId}/lists/${listId}/items`)
 *     .filter(`fields/Date eq '${date}'`)
 *     .expand("fields")
 *     .get();
 *   return res.value.map(item => item.fields);
 * }
 */
