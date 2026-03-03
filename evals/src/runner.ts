import "dotenv/config";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { loadConfig } from "./config.js";
import { createProvider } from "./providers/index.js";
import { runPatternEval } from "./evals/patterns/pattern-eval.js";
import { runRoutingEval } from "./evals/routing/routing-eval.js";
import { runCompletenessEval } from "./evals/completeness/completeness-eval.js";
import { printReport, writeReport } from "./reporter.js";
import type { EvalReport, LLMProvider } from "./types.js";

const { values } = parseArgs({
  options: {
    dimension: { type: "string", short: "d" },
    tag: { type: "string", short: "t" },
    output: { type: "string", short: "o" },
    verbose: { type: "boolean", short: "v", default: false },
    config: { type: "string", short: "c" },
  },
});

async function main(): Promise<void> {
  const config = await loadConfig(values.config);

  const dimensions = values.dimension
    ? [values.dimension]
    : config.dimensions;

  // Only create provider if we need LLM-based evals
  const needsLLM = dimensions.includes("routing") || dimensions.includes("completeness");
  let provider: LLMProvider | undefined;

  if (needsLLM) {
    try {
      provider = createProvider(config.provider);
    } catch (err) {
      console.warn(
        `Warning: Could not create LLM provider: ${err instanceof Error ? err.message : String(err)}`
      );
      console.warn("LLM-based evals (routing judge, completeness) will run in deterministic-only mode.\n");
    }
  }

  const report: EvalReport = {
    timestamp: new Date().toISOString(),
    dimensions: {},
    summary: { totalTests: 0, totalPassed: 0, overallPassRate: 0 },
  };

  // Run requested dimensions
  if (dimensions.includes("patterns")) {
    console.log("Running pattern compilation eval...");
    const results = await runPatternEval(config);
    const passRate = results.filter((r) => r.passed).length / Math.max(results.length, 1);
    report.dimensions.patterns = {
      results,
      passRate,
      totalErrors: results.reduce((s, r) => s + r.errors.length, 0),
    };
  }

  if (dimensions.includes("routing")) {
    console.log("Running routing eval...");
    const results = await runRoutingEval(config, provider);
    const passRate = results.filter((r) => r.passed).length / Math.max(results.length, 1);
    report.dimensions.routing = {
      results,
      passRate,
      avgScore: results.reduce((s, r) => s + r.score, 0) / Math.max(results.length, 1),
    };
  }

  if (dimensions.includes("completeness")) {
    if (!provider) {
      console.warn("Skipping completeness eval — no LLM provider available.\n");
    } else {
      console.log("Running completeness eval...");
      const results = await runCompletenessEval(config, provider);
      const passRate = results.filter((r) => r.passed).length / Math.max(results.length, 1);
      report.dimensions.completeness = {
        results,
        passRate,
        avgCoverage: results.reduce((s, r) => s + r.coverageRatio, 0) / Math.max(results.length, 1),
      };
    }
  }

  // Calculate summary
  let totalTests = 0;
  let totalPassed = 0;

  if (report.dimensions.patterns) {
    totalTests += report.dimensions.patterns.results.length;
    totalPassed += report.dimensions.patterns.results.filter((r) => r.passed).length;
  }
  if (report.dimensions.routing) {
    totalTests += report.dimensions.routing.results.length;
    totalPassed += report.dimensions.routing.results.filter((r) => r.passed).length;
  }
  if (report.dimensions.completeness) {
    totalTests += report.dimensions.completeness.results.length;
    totalPassed += report.dimensions.completeness.results.filter((r) => r.passed).length;
  }

  report.summary = {
    totalTests,
    totalPassed,
    overallPassRate: totalTests > 0 ? totalPassed / totalTests : 0,
  };

  // Output
  printReport(report, values.verbose ?? false);

  if (values.output) {
    await writeReport(report, resolve(values.output));
  }

  // Exit with non-zero if any tests failed
  if (totalPassed < totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
});
