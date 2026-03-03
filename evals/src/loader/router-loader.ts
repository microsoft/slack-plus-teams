import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { DomainRouter, TaskCluster } from "../types.js";

/**
 * Extract a section between a heading and the next same-level heading.
 */
function extractSection(content: string, heading: string): string {
  const idx = content.indexOf(heading);
  if (idx < 0) return "";

  const afterHeading = idx + heading.length;
  // Find next same-level heading
  const headingLevel = heading.match(/^#+/)?.[0] ?? "##";
  const nextIdx = content.indexOf(`\n${headingLevel} `, afterHeading);
  return nextIdx > 0
    ? content.slice(afterHeading, nextIdx)
    : content.slice(afterHeading);
}

/**
 * Parse signal words from the root index.md routing rules section
 * for a specific domain heading (e.g., "Teams").
 */
function parseSignals(routingSection: string, heading: string): string[] {
  // Find the domain heading (e.g., "### Teams —")
  const headingIdx = routingSection.indexOf(`### ${heading}`);
  if (headingIdx < 0) return [];

  // Find the Signals: line after the heading
  const afterHeading = routingSection.slice(headingIdx);
  const signalsMatch = afterHeading.match(/Signals:\s*(.+)/);
  if (!signalsMatch) return [];

  return signalsMatch[1]
    .split(",")
    .map((s) => s.trim().replace(/^`|`$/g, ""))
    .filter(Boolean);
}

/**
 * Parse task clusters from a domain's index.md.
 */
function parseTaskClusters(content: string): TaskCluster[] {
  const clusters: TaskCluster[] = [];

  // Split on ### headings
  const parts = content.split(/^### /m).filter(Boolean);

  for (const part of parts) {
    const lines = part.split("\n");
    const name = lines[0]?.trim() ?? "";
    if (!name) continue;

    const body = lines.slice(1).join("\n");

    // Parse When: line
    const whenMatch = body.match(/^When:\s*(.+)/m);
    const when = whenMatch?.[1]?.trim() ?? "";

    // Parse Read: block — collect lines starting with "- " after "Read:"
    const readMatch = body.match(/Read:\n((?:- .+\n?)+)/);
    const read: string[] = [];
    if (readMatch) {
      for (const line of readMatch[1].split("\n")) {
        const fileMatch = line.match(/^- `([^`]+)`/);
        if (fileMatch) {
          read.push(fileMatch[1]);
        }
      }
    }

    // Parse Depends on:
    const dependsMatch = body.match(/Depends on:\s*`([^`]+)`/);
    const dependsOn = dependsMatch ? [dependsMatch[1]] : [];

    // Parse Cross-domain deps:
    const crossMatch = body.match(/Cross-domain deps:\s*(.+)/);
    const crossDomainDeps: string[] = [];
    if (crossMatch) {
      const deps = crossMatch[1].matchAll(/`([^`]+)`/g);
      for (const d of deps) {
        crossDomainDeps.push(d[1]);
      }
    }

    clusters.push({ name, when, read, dependsOn, crossDomainDeps });
  }

  return clusters;
}

/**
 * Load a single domain's router info (signals from root + clusters from domain index).
 */
export async function loadDomainRouter(
  expertsRoot: string,
  domain: string,
  rootContent: string,
  heading?: string
): Promise<DomainRouter> {
  const routingSection = extractSection(rootContent, "## routing rules");
  const signals = parseSignals(routingSection, heading ?? domain);

  // Load domain index.md
  const domainIndexPath = join(expertsRoot, domain, "index.md");
  let clusters: TaskCluster[] = [];
  try {
    const domainContent = await readFile(domainIndexPath, "utf-8");
    const clustersSection = extractSection(domainContent, "## task clusters");
    if (clustersSection) {
      clusters = parseTaskClusters(clustersSection);
    }
  } catch {
    // Domain may not have an index.md
  }

  return { domain, signals, clusters };
}

/**
 * Load all domain routers.
 */
export async function loadAllRouters(expertsRoot: string): Promise<DomainRouter[]> {
  const rootPath = join(expertsRoot, "index.md");
  const rootContent = await readFile(rootPath, "utf-8");

  const routingSection = extractSection(rootContent, "## routing rules");

  // Extract domain names from ### headings in routing section
  const domains: { heading: string; folder: string }[] = [];
  const headingPattern = /^### (\w+)\s*[—–-]/gm;

  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(routingSection)) !== null) {
    domains.push({ heading: match[1], folder: match[1].toLowerCase() });
  }

  const routers: DomainRouter[] = [];
  for (const { heading, folder } of domains) {
    routers.push(await loadDomainRouter(expertsRoot, folder, rootContent, heading));
  }

  return routers;
}
