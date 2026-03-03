# Expert System Evals

Eval harness for the Slack-to-Teams expert system. Tests three dimensions: routing accuracy, expert completeness, and code pattern correctness.

## Setup

```bash
cd evals
npm install
```

For LLM-based evals (routing judge, completeness), create a `.env` file:

```
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

The provider is configured in `eval-config.yaml`. Supported providers: `openai`, `anthropic`, `azure-openai`.

## Running evals

```bash
# All dimensions
npm run eval

# Individual dimensions
npm run eval:patterns       # No API key needed — fully deterministic
npm run eval:routing        # Deterministic + LLM judge (API key optional)
npm run eval:completeness   # Requires API key

# JSON report output
npm run eval:report         # Writes to reports/latest.json

# Verbose output (shows per-test details)
npm run eval -- --verbose
```

## Eval dimensions

### Patterns (deterministic)

Extracts fenced TypeScript code blocks from every expert markdown file and compiles them in-memory using the TypeScript compiler API. No SDK type packages are installed — the compiler runs with `noLib`, `noResolve`, and lenient settings to validate syntax and structure only. Catches broken code examples after expert edits.

- **Test cases**: `cases/patterns/patterns.yaml`
- **Pass criteria**: 0 compilation errors per file

### Routing

Tests whether user queries route to the correct domain, task clusters, and expert files. Two layers:

1. **Deterministic** — counts signal-word matches from `experts/index.md` and domain `index.md` files. Free and fast.
2. **LLM judge** — sends the query + router summary to the LLM and asks it to pick domain/clusters/experts. Catches ambiguity the deterministic layer misses.

Combined score: `deterministic * 0.6 + LLM * 0.4`. Without an API key, only the deterministic score is used.

- **Test cases**: `cases/routing/*.yaml` (51 cases across all 7 domains plus ambiguous scenarios)
- **Pass criteria**: combined score >= 0.75

### Completeness

Two-phase LLM eval. Phase 1: the LLM generates an implementation using only the expert's content. Phase 2: a judge checks whether required concepts from the test case are covered in the generated code. Catches gaps in expert documentation.

- **Test cases**: `cases/completeness/*.yaml` (9 cases across slack, teams, bridge)
- **Pass criteria**: concept coverage >= 70%

## Known issues: LLM judge scoring

The routing eval has ~10 test cases that intermittently fail due to conservative LLM judge scoring (scores 57-73%, just below the 75% threshold). The deterministic layer routes these correctly, but the LLM judge scores them lower. These are:

- **Cross-domain ambiguity** — queries that touch multiple domains (e.g., "Ruby Slack bot to Teams TS" spans convert + bridge). The judge penalizes when the deterministic router picks one domain over another.
- **Cluster matching gaps** — the deterministic router finds the correct domain but can't match short When: signal phrases (common in smaller domains like security and convert). The domain score (0.5) is correct, but 0.0 cluster Jaccard drags the total below threshold.
- **Broad queries** — short or generic queries like "set up a Slack Bolt app" where the judge expects more specific cluster matches than the signal-word counter produces.
- **Scoring variance** — LLM judge scores vary between runs. A test at 72% may pass on the next run at 78%.

If you see routing failures in CI, check `--verbose` output. If the deterministic score is correct and only the LLM judge is low, the routing logic is fine — the test case threshold or judge prompt may need tuning.

## Configuration

Edit `eval-config.yaml` to change:

- **provider** — LLM provider and model for judge evals
- **thresholds** — pass/fail cutoffs per dimension
- **dimensions** — which dimensions to run by default

## Adding test cases

Test cases are YAML files in `cases/`. Each dimension has its own format:

**Routing** (`cases/routing/*.yaml`):
```yaml
- name: "descriptive name"
  input: "user query to route"
  expectedDomain: slack
  expectedClusters:
    - "Task cluster name from domain index.md"
  expectedExperts:
    - "domain/expert-filename.md"
  tags: [routing, slack]
```

**Completeness** (`cases/completeness/*.yaml`):
```yaml
- name: "descriptive name"
  task: "implementation task description"
  expertFiles:
    - domain/expert-filename.md
  requiredConcepts:
    - "Concept the expert should cover"
  tags: [completeness, domain]
```

**Patterns** (`cases/patterns/patterns.yaml`):
```yaml
- domain: slack
  files: all
  tags: [patterns, slack]
```

## Project structure

```
evals/
  eval-config.yaml          # Configuration
  cases/                    # Test case YAML files
    routing/
    completeness/
    patterns/
  src/
    runner.ts               # CLI entry point
    config.ts               # Config loader
    reporter.ts             # Console + JSON output
    types.ts                # All interfaces
    loader/                 # Expert/router markdown parsers
    providers/              # LLM provider adapters (OpenAI, Anthropic, Azure)
    evals/
      patterns/             # TypeScript compilation checks
      routing/              # Signal matching + LLM judge
      completeness/         # Two-phase concept coverage
  reports/                  # JSON output (gitignored)
```
