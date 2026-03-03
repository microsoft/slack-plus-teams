// ── LLM Provider ──

export interface LLMProvider {
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ProviderConfig {
  type: "openai" | "anthropic" | "azure-openai";
  model: string;
  azure_endpoint?: string;
  azure_deployment?: string;
  api_version?: string;
}

// ── Expert System Structures ──

export interface ExpertFile {
  /** Relative path from experts root, e.g. "slack/runtime.bolt-foundations-ts.md" */
  path: string;
  /** Domain folder name, e.g. "slack" */
  domain: string;
  /** Filename without extension, e.g. "runtime.bolt-foundations-ts" */
  name: string;
  /** Content of the ## purpose section */
  purpose: string;
  /** Content of the ## rules section */
  rules: string;
  /** Content of the ## patterns section (may contain fenced code blocks) */
  patterns: string;
  /** Content of the ## pitfalls section */
  pitfalls: string;
  /** Content of the ## references section */
  references: string;
  /** Full raw markdown content */
  raw: string;
}

export interface TaskCluster {
  /** Cluster name, e.g. "Bolt Foundations" */
  name: string;
  /** Signal words from the When: line */
  when: string;
  /** Expert files to read */
  read: string[];
  /** Dependencies (Depends on: lines) */
  dependsOn: string[];
  /** Cross-domain dependencies */
  crossDomainDeps: string[];
}

export interface DomainRouter {
  /** Domain name, e.g. "slack" */
  domain: string;
  /** Signal words from root index.md for this domain */
  signals: string[];
  /** Task clusters parsed from the domain's index.md */
  clusters: TaskCluster[];
}

// ── Code Pattern ──

export interface CodePattern {
  /** Source expert file path */
  expertPath: string;
  /** Pattern heading */
  heading: string;
  /** Extracted TypeScript code */
  code: string;
  /** Line number in the source file where the code block starts */
  lineNumber: number;
}

// ── Test Cases ──

export interface RoutingTestCase {
  /** Human-readable name */
  name: string;
  /** User message / prompt to route */
  input: string;
  /** Expected domain, e.g. "slack" */
  expectedDomain: string;
  /** Expected cluster names */
  expectedClusters: string[];
  /** Expected expert files to be loaded */
  expectedExperts: string[];
  /** Tags for filtering */
  tags?: string[];
}

export interface CompletenessTestCase {
  /** Human-readable name */
  name: string;
  /** Task description for the LLM to implement */
  task: string;
  /** Expert files to use as context */
  expertFiles: string[];
  /** Required concepts that must be covered in the implementation */
  requiredConcepts: string[];
  /** Tags for filtering */
  tags?: string[];
}

export interface PatternTestCase {
  /** Domain to check, or "all" */
  domain: string;
  /** Specific expert files to check (optional — if empty, checks all in domain) */
  files?: string[];
  /** Tags for filtering */
  tags?: string[];
}

// ── Results ──

export interface RoutingResult {
  testCase: string;
  passed: boolean;
  score: number;
  deterministicScore: number;
  llmScore: number;
  details: {
    matchedDomain: string | null;
    matchedClusters: string[];
    matchedExperts: string[];
    domainCorrect: boolean;
    clusterJaccard: number;
    expertRecall: number;
    llmJudgment?: string;
  };
}

export interface CompletenessResult {
  testCase: string;
  passed: boolean;
  coverageRatio: number;
  details: {
    coveredConcepts: string[];
    missingConcepts: string[];
    generatedCode: string;
    judgeReasoning: string;
  };
}

export interface PatternResult {
  expertPath: string;
  heading: string;
  passed: boolean;
  errors: PatternError[];
}

export interface PatternError {
  message: string;
  line?: number;
  column?: number;
  code: string;
}

export interface EvalReport {
  timestamp: string;
  dimensions: {
    routing?: {
      results: RoutingResult[];
      passRate: number;
      avgScore: number;
    };
    completeness?: {
      results: CompletenessResult[];
      passRate: number;
      avgCoverage: number;
    };
    patterns?: {
      results: PatternResult[];
      passRate: number;
      totalErrors: number;
    };
  };
  summary: {
    totalTests: number;
    totalPassed: number;
    overallPassRate: number;
  };
}

// ── Config ──

export interface EvalConfig {
  provider: ProviderConfig;
  paths: {
    experts_root: string;
    cases_dir: string;
    reports_dir: string;
  };
  thresholds: {
    routing: { min_score: number };
    completeness: { min_coverage: number };
    patterns: { max_errors_per_file: number };
  };
  dimensions: string[];
}
