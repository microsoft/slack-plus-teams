import type { LLMProvider, CompletenessTestCase, ExpertFile } from "../../types.js";

/**
 * Phase 1: Generate an implementation using only expert content.
 */
export function buildGenerationPrompt(
  testCase: CompletenessTestCase,
  experts: ExpertFile[]
): string {
  const expertContent = experts
    .map((e) => {
      return `--- Expert: ${e.path} ---\n## Purpose\n${e.purpose}\n\n## Rules\n${e.rules}\n\n## Patterns\n${e.patterns}\n\n## Pitfalls\n${e.pitfalls}`;
    })
    .join("\n\n");

  return `You are a developer implementing a task using only the expert knowledge provided below. Do NOT use any knowledge beyond what's in the experts.

## Task
${testCase.task}

## Expert Knowledge
${expertContent}

## Instructions
Write a complete TypeScript implementation for the task described above, using only the patterns, rules, and guidance from the expert files. Include all necessary imports, types, and logic.

Respond with ONLY the code implementation (no explanation).`;
}

/**
 * Phase 2: Judge whether the generated code covers all required concepts.
 */
export function buildJudgePrompt(
  testCase: CompletenessTestCase,
  generatedCode: string
): string {
  const conceptsList = testCase.requiredConcepts
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");

  return `You are evaluating whether a generated code implementation covers all required concepts for a task.

## Task
${testCase.task}

## Required Concepts
${conceptsList}

## Generated Code
\`\`\`typescript
${generatedCode}
\`\`\`

## Instructions
For each required concept, determine if it is COVERED or MISSING in the generated code. A concept is covered if the code demonstrates the pattern, includes the relevant API call, or handles the concern — even if the exact wording differs.

Respond in exactly this format (one line per concept):

CONCEPT: <concept name> | STATUS: COVERED | EVIDENCE: <brief quote or description>
CONCEPT: <concept name> | STATUS: MISSING | REASON: <why it's missing>

After all concepts, add:
COVERAGE: <number of covered>/${testCase.requiredConcepts.length}
REASONING: <one paragraph summary>`;
}

/**
 * Parse the judge response into covered/missing concepts.
 */
export function parseJudgeResponse(
  response: string,
  requiredConcepts: string[]
): { coveredConcepts: string[]; missingConcepts: string[]; reasoning: string } {
  const covered: string[] = [];
  const missing: string[] = [];

  for (const concept of requiredConcepts) {
    const escapedConcept = concept.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`CONCEPT:\\s*${escapedConcept}.*?STATUS:\\s*(COVERED|MISSING)`, "i");
    const match = response.match(pattern);

    if (match && match[1].toUpperCase() === "COVERED") {
      covered.push(concept);
    } else {
      // If can't parse or status is MISSING, check for a more lenient match
      const lenientPattern = new RegExp(`${escapedConcept}.*?COVERED`, "i");
      if (response.match(lenientPattern)) {
        covered.push(concept);
      } else {
        missing.push(concept);
      }
    }
  }

  const reasoningMatch = response.match(/REASONING:\s*([\s\S]+)/);
  const reasoning = reasoningMatch?.[1]?.trim() ?? "";

  return { coveredConcepts: covered, missingConcepts: missing, reasoning };
}

/**
 * Run the two-phase completeness eval for a single test case.
 */
export async function evaluateCompleteness(
  testCase: CompletenessTestCase,
  experts: ExpertFile[],
  provider: LLMProvider
): Promise<{
  coverageRatio: number;
  coveredConcepts: string[];
  missingConcepts: string[];
  generatedCode: string;
  judgeReasoning: string;
}> {
  // Phase 1: Generate implementation
  const genPrompt = buildGenerationPrompt(testCase, experts);
  const generatedCode = await provider.complete(genPrompt, {
    temperature: 0,
    maxTokens: 8192,
    systemPrompt: "You are a TypeScript developer. Output only code.",
  });

  // Phase 2: Judge coverage
  const judgePrompt = buildJudgePrompt(testCase, generatedCode);
  const judgeResponse = await provider.complete(judgePrompt, {
    temperature: 0,
    systemPrompt: "You are a precise evaluation judge. Follow the output format exactly.",
  });

  const parsed = parseJudgeResponse(judgeResponse, testCase.requiredConcepts);

  return {
    coverageRatio: parsed.coveredConcepts.length / testCase.requiredConcepts.length,
    coveredConcepts: parsed.coveredConcepts,
    missingConcepts: parsed.missingConcepts,
    generatedCode,
    judgeReasoning: parsed.reasoning,
  };
}
