import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { PatternTestCase, PatternResult, EvalConfig } from "../../types.js";
import { loadDomainExperts, loadAllExperts } from "../../loader/expert-loader.js";
import { extractCodePatterns } from "../../loader/pattern-extractor.js";
import { compileTypeScript } from "./ts-compiler.js";

/**
 * Run pattern compilation eval for all test cases.
 */
export async function runPatternEval(config: EvalConfig): Promise<PatternResult[]> {
  const expertsRoot = resolve(config.paths.experts_root);
  const casesPath = join(resolve(config.paths.cases_dir), "patterns", "patterns.yaml");

  const casesRaw = await readFile(casesPath, "utf-8");
  const cases: PatternTestCase[] = parseYaml(casesRaw);

  const results: PatternResult[] = [];

  for (const testCase of cases) {
    const experts =
      testCase.domain === "all"
        ? await loadAllExperts(expertsRoot)
        : await loadDomainExperts(expertsRoot, testCase.domain);

    // Filter to specific files if specified
    const filtered = testCase.files
      ? experts.filter((e) => testCase.files!.some((f) => e.path.endsWith(f)))
      : experts;

    for (const expert of filtered) {
      const patterns = extractCodePatterns(expert.raw, expert.path);

      for (const pattern of patterns) {
        const compileResult = compileTypeScript(pattern.code, `${expert.name}.ts`);

        results.push({
          expertPath: expert.path,
          heading: pattern.heading,
          passed: compileResult.success,
          errors: compileResult.errors,
        });
      }
    }
  }

  return results;
}
