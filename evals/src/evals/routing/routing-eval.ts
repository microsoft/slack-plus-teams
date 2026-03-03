import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { RoutingTestCase, RoutingResult, EvalConfig, LLMProvider, DomainRouter } from "../../types.js";
import { loadAllRouters } from "../../loader/router-loader.js";
import { deterministicRoute, scoreDeterministic, llmJudgeRouting } from "./routing-judge.js";

/**
 * Load all routing test cases from the cases directory.
 */
async function loadRoutingCases(casesDir: string): Promise<RoutingTestCase[]> {
  const routingDir = join(casesDir, "routing");
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(routingDir);
  const yamlFiles = files.filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  const allCases: RoutingTestCase[] = [];
  for (const file of yamlFiles) {
    const raw = await readFile(join(routingDir, file), "utf-8");
    const cases: RoutingTestCase[] = parseYaml(raw);
    allCases.push(...cases);
  }

  return allCases;
}

/**
 * Run routing eval for all test cases.
 * Runs deterministic scoring for all cases, and optionally LLM judge if provider is available.
 */
export async function runRoutingEval(
  config: EvalConfig,
  provider?: LLMProvider
): Promise<RoutingResult[]> {
  const expertsRoot = resolve(config.paths.experts_root);
  const casesDir = resolve(config.paths.cases_dir);

  const routers = await loadAllRouters(expertsRoot);
  const cases = await loadRoutingCases(casesDir);

  const results: RoutingResult[] = [];

  for (const testCase of cases) {
    const detResult = deterministicRoute(testCase.input, routers);
    const detScore = scoreDeterministic(testCase, detResult);

    let llmScore = 0;
    let llmJudgment: string | undefined;

    if (provider) {
      try {
        const judge = await llmJudgeRouting(testCase, routers, provider);
        llmScore = judge.score;
        llmJudgment = judge.reasoning;
      } catch (err) {
        llmJudgment = `LLM judge error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    // Combined score: if no LLM, use deterministic only; otherwise weighted average
    const combinedScore = provider ? detScore * 0.6 + llmScore * 0.4 : detScore;

    results.push({
      testCase: testCase.name,
      passed: combinedScore >= config.thresholds.routing.min_score,
      score: combinedScore,
      deterministicScore: detScore,
      llmScore,
      details: {
        matchedDomain: detResult.domain,
        matchedClusters: detResult.clusters,
        matchedExperts: detResult.experts,
        domainCorrect: detResult.domain?.toLowerCase() === testCase.expectedDomain.toLowerCase(),
        clusterJaccard: 0, // computed inside scoreDeterministic
        expertRecall: 0,
        llmJudgment,
      },
    });
  }

  return results;
}
