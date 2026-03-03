import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { CompletenessTestCase, CompletenessResult, EvalConfig, LLMProvider } from "../../types.js";
import { loadExpertFile } from "../../loader/expert-loader.js";
import { evaluateCompleteness } from "./completeness-judge.js";

/**
 * Load all completeness test cases from the cases directory.
 */
async function loadCompletenessCases(casesDir: string): Promise<CompletenessTestCase[]> {
  const completenessDir = join(casesDir, "completeness");
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(completenessDir);
  const yamlFiles = files.filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  const allCases: CompletenessTestCase[] = [];
  for (const file of yamlFiles) {
    const raw = await readFile(join(completenessDir, file), "utf-8");
    const cases: CompletenessTestCase[] = parseYaml(raw);
    allCases.push(...cases);
  }

  return allCases;
}

/**
 * Run completeness eval for all test cases. Requires an LLM provider.
 */
export async function runCompletenessEval(
  config: EvalConfig,
  provider: LLMProvider
): Promise<CompletenessResult[]> {
  const expertsRoot = resolve(config.paths.experts_root);
  const casesDir = resolve(config.paths.cases_dir);

  const cases = await loadCompletenessCases(casesDir);
  const results: CompletenessResult[] = [];

  for (const testCase of cases) {
    // Load the specified expert files
    const experts = await Promise.all(
      testCase.expertFiles.map((f) =>
        loadExpertFile(join(expertsRoot, f), expertsRoot)
      )
    );

    try {
      const result = await evaluateCompleteness(testCase, experts, provider);

      results.push({
        testCase: testCase.name,
        passed: result.coverageRatio >= config.thresholds.completeness.min_coverage,
        coverageRatio: result.coverageRatio,
        details: {
          coveredConcepts: result.coveredConcepts,
          missingConcepts: result.missingConcepts,
          generatedCode: result.generatedCode,
          judgeReasoning: result.judgeReasoning,
        },
      });
    } catch (err) {
      results.push({
        testCase: testCase.name,
        passed: false,
        coverageRatio: 0,
        details: {
          coveredConcepts: [],
          missingConcepts: testCase.requiredConcepts,
          generatedCode: "",
          judgeReasoning: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      });
    }
  }

  return results;
}
