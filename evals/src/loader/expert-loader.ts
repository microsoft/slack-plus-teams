import { readdir, readFile } from "node:fs/promises";
import { join, relative, basename, dirname } from "node:path";
import type { ExpertFile } from "../types.js";

/**
 * Parse a markdown expert file into structured sections.
 */
function parseExpertMarkdown(raw: string, filePath: string, expertsRoot: string): ExpertFile {
  const relPath = relative(expertsRoot, filePath).replace(/\\/g, "/");
  const domain = relPath.split("/")[0] ?? "";
  const name = basename(filePath, ".md");

  const extractSection = (heading: string): string => {
    const pattern = new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |\\Z)`, "m");
    const match = raw.match(pattern);
    return match?.[1]?.trim() ?? "";
  };

  return {
    path: relPath,
    domain,
    name,
    purpose: extractSection("purpose"),
    rules: extractSection("rules"),
    patterns: extractSection("patterns"),
    pitfalls: extractSection("pitfalls"),
    references: extractSection("references"),
    raw,
  };
}

/**
 * Load a single expert file.
 */
export async function loadExpertFile(filePath: string, expertsRoot: string): Promise<ExpertFile> {
  const raw = await readFile(filePath, "utf-8");
  return parseExpertMarkdown(raw, filePath, expertsRoot);
}

/**
 * Load all expert .md files from a domain directory.
 * Excludes index.md and files starting with _.
 */
export async function loadDomainExperts(
  expertsRoot: string,
  domain: string
): Promise<ExpertFile[]> {
  const domainDir = join(expertsRoot, domain);
  const entries = await readdir(domainDir);

  const expertFiles = entries.filter(
    (f) => f.endsWith(".md") && f !== "index.md" && !f.startsWith("_")
  );

  const results: ExpertFile[] = [];
  for (const file of expertFiles) {
    results.push(await loadExpertFile(join(domainDir, file), expertsRoot));
  }

  return results;
}

/**
 * Load all expert files across all domains.
 */
export async function loadAllExperts(expertsRoot: string): Promise<ExpertFile[]> {
  const entries = await readdir(expertsRoot, { withFileTypes: true });
  const domains = entries.filter((e) => e.isDirectory() && !e.name.startsWith("_")).map((e) => e.name);

  const all: ExpertFile[] = [];
  for (const domain of domains) {
    const experts = await loadDomainExperts(expertsRoot, domain);
    all.push(...experts);
  }

  return all;
}
