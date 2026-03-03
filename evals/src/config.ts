import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { parse as parseYaml } from "yaml";
import type { EvalConfig } from "./types.js";

/**
 * Load and validate eval-config.yaml.
 * Resolves relative paths against the config file's directory.
 */
export async function loadConfig(configPath?: string): Promise<EvalConfig> {
  const resolvedPath = resolve(configPath ?? "eval-config.yaml");
  const configDir = dirname(resolvedPath);

  const raw = await readFile(resolvedPath, "utf-8");
  const parsed = parseYaml(raw) as EvalConfig;

  // Resolve relative paths
  parsed.paths.experts_root = resolve(configDir, parsed.paths.experts_root);
  parsed.paths.cases_dir = resolve(configDir, parsed.paths.cases_dir);
  parsed.paths.reports_dir = resolve(configDir, parsed.paths.reports_dir);

  // Validate required fields
  if (!parsed.provider?.type) {
    throw new Error("eval-config.yaml: provider.type is required");
  }
  if (!parsed.provider?.model) {
    throw new Error("eval-config.yaml: provider.model is required");
  }
  if (!parsed.thresholds) {
    throw new Error("eval-config.yaml: thresholds section is required");
  }

  return parsed;
}
