import type { CodePattern } from "../types.js";

/**
 * Extract all fenced TypeScript code blocks from an expert's markdown content.
 */
export function extractCodePatterns(
  markdown: string,
  expertPath: string
): CodePattern[] {
  const patterns: CodePattern[] = [];
  const lines = markdown.split("\n");

  let currentHeading = "(untitled)";
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let blockStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track headings
    const headingMatch = line.match(/^#{1,4}\s+(.+)/);
    if (headingMatch && !inCodeBlock) {
      currentHeading = headingMatch[1].trim();
      continue;
    }

    // Start of typescript fence
    if (!inCodeBlock && /^```typescript\s*$/i.test(line)) {
      inCodeBlock = true;
      codeLines = [];
      blockStartLine = i + 1; // 0-indexed line in file
      continue;
    }

    // End of any fence while we're collecting
    if (inCodeBlock && /^```\s*$/.test(line)) {
      inCodeBlock = false;
      if (codeLines.length > 0) {
        patterns.push({
          expertPath,
          heading: currentHeading,
          code: codeLines.join("\n"),
          lineNumber: blockStartLine + 1, // 1-indexed for human display
        });
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
    }
  }

  return patterns;
}
