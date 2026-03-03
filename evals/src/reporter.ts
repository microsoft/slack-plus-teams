import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import chalk from "chalk";
import type { EvalReport, RoutingResult, CompletenessResult, PatternResult } from "./types.js";

/**
 * Print routing results to console.
 */
function printRoutingResults(results: RoutingResult[], verbose: boolean): void {
  console.log(chalk.bold("\n── Routing Eval ──\n"));

  for (const r of results) {
    const icon = r.passed ? chalk.green("✓") : chalk.red("✗");
    const score = chalk.dim(`(${(r.score * 100).toFixed(0)}%)`);
    console.log(`  ${icon} ${r.testCase} ${score}`);

    if (verbose && !r.passed) {
      console.log(chalk.dim(`    Domain: matched=${r.details.matchedDomain ?? "none"}, correct=${r.details.domainCorrect}`));
      console.log(chalk.dim(`    Clusters: ${r.details.matchedClusters.join(", ") || "(none)"}`));
      if (r.details.llmJudgment) {
        console.log(chalk.dim(`    Judge: ${r.details.llmJudgment.slice(0, 120)}...`));
      }
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
  console.log(chalk.dim(`\n  ${passed}/${results.length} passed, avg score: ${(avg * 100).toFixed(1)}%`));
}

/**
 * Print completeness results to console.
 */
function printCompletenessResults(results: CompletenessResult[], verbose: boolean): void {
  console.log(chalk.bold("\n── Completeness Eval ──\n"));

  for (const r of results) {
    const icon = r.passed ? chalk.green("✓") : chalk.red("✗");
    const coverage = chalk.dim(`(${(r.coverageRatio * 100).toFixed(0)}%)`);
    console.log(`  ${icon} ${r.testCase} ${coverage}`);

    if (verbose && !r.passed) {
      console.log(chalk.dim(`    Missing: ${r.details.missingConcepts.join(", ")}`));
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const avg = results.reduce((s, r) => s + r.coverageRatio, 0) / results.length;
  console.log(chalk.dim(`\n  ${passed}/${results.length} passed, avg coverage: ${(avg * 100).toFixed(1)}%`));
}

/**
 * Print pattern results to console.
 */
function printPatternResults(results: PatternResult[], verbose: boolean): void {
  console.log(chalk.bold("\n── Pattern Compilation Eval ──\n"));

  // Group by expert file
  const byExpert = new Map<string, PatternResult[]>();
  for (const r of results) {
    const existing = byExpert.get(r.expertPath) ?? [];
    existing.push(r);
    byExpert.set(r.expertPath, existing);
  }

  for (const [expert, patterns] of byExpert) {
    const allPassed = patterns.every((p) => p.passed);
    const icon = allPassed ? chalk.green("✓") : chalk.red("✗");
    const failCount = patterns.filter((p) => !p.passed).length;
    const suffix = allPassed ? "" : chalk.dim(` (${failCount}/${patterns.length} failed)`);
    console.log(`  ${icon} ${expert}${suffix}`);

    if (verbose) {
      for (const p of patterns.filter((p) => !p.passed)) {
        console.log(chalk.dim(`    └ ${p.heading}:`));
        for (const err of p.errors.slice(0, 3)) {
          console.log(chalk.red(`      ${err.code}: ${err.message}`));
        }
      }
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);
  console.log(chalk.dim(`\n  ${passed}/${results.length} patterns compiled, ${totalErrors} total errors`));
}

/**
 * Print the full eval report summary.
 */
export function printReport(report: EvalReport, verbose: boolean): void {
  console.log(chalk.bold.underline(`\nExpert System Eval Report — ${report.timestamp}\n`));

  if (report.dimensions.routing) {
    printRoutingResults(report.dimensions.routing.results, verbose);
  }
  if (report.dimensions.completeness) {
    printCompletenessResults(report.dimensions.completeness.results, verbose);
  }
  if (report.dimensions.patterns) {
    printPatternResults(report.dimensions.patterns.results, verbose);
  }

  // Overall summary
  console.log(chalk.bold("\n── Summary ──\n"));
  console.log(`  Total tests: ${report.summary.totalTests}`);
  console.log(`  Passed:      ${report.summary.totalPassed}`);

  const rate = report.summary.overallPassRate * 100;
  const rateColor = rate >= 80 ? chalk.green : rate >= 60 ? chalk.yellow : chalk.red;
  console.log(`  Pass rate:   ${rateColor(`${rate.toFixed(1)}%`)}`);
  console.log();
}

/**
 * Write the report to a JSON file.
 */
export async function writeReport(report: EvalReport, outputPath: string): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(report, null, 2));
  console.log(chalk.dim(`\nReport written to ${outputPath}`));
}
