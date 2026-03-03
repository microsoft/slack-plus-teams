import type { LLMProvider, DomainRouter, RoutingTestCase } from "../../types.js";

/**
 * Deterministic signal-word counting to match a user message to a domain.
 * Returns scored results for domain, clusters, and experts.
 */
export function deterministicRoute(
  input: string,
  routers: DomainRouter[]
): { domain: string | null; clusters: string[]; experts: string[]; signalCounts: Map<string, number> } {
  const inputLower = input.toLowerCase();
  const signalCounts = new Map<string, number>();

  for (const router of routers) {
    let count = 0;
    for (const signal of router.signals) {
      const signalLower = signal.toLowerCase();
      if (inputLower.includes(signalLower)) {
        count++;
      }
    }
    if (count > 0) {
      signalCounts.set(router.domain, count);
    }
  }

  // Pick domain with most signal matches
  let bestDomain: string | null = null;
  let bestCount = 0;
  for (const [domain, count] of signalCounts) {
    if (count > bestCount) {
      bestCount = count;
      bestDomain = domain;
    }
  }

  if (!bestDomain) return { domain: null, clusters: [], experts: [], signalCounts };

  // Find matching clusters within the best domain
  const router = routers.find((r) => r.domain === bestDomain)!;
  const matchedClusters: string[] = [];
  const matchedExperts = new Set<string>();

  for (const cluster of router.clusters) {
    const whenLower = cluster.when.toLowerCase();
    // Split on commas to get individual signal phrases, strip backticks
    const whenSignals = whenLower
      .split(",")
      .map((s) => s.trim().replace(/`/g, ""))
      .filter(Boolean);

    const hasMatch = whenSignals.some((signal) => {
      // Direct containment — signal phrase appears verbatim in input
      if (inputLower.includes(signal)) return true;
      // Fuzzy fallback only for longer phrases (4+ real words).
      // Filter out punctuation tokens (+, &, /, etc.) and short words
      const realWords = signal.split(/\s+/).filter((w) => w.length > 1 && !/^[^a-z0-9]+$/i.test(w));
      if (realWords.length < 4) return false;
      const signalWords = realWords.filter((w) => w.length > 3);
      if (signalWords.length < 3) return false;
      const matchCount = signalWords.filter((w) => inputLower.includes(w)).length;
      return matchCount >= Math.max(3, Math.ceil(signalWords.length * 0.6));
    });

    if (hasMatch) {
      matchedClusters.push(cluster.name);
      for (const expert of cluster.read) {
        matchedExperts.add(expert);
      }
    }
  }

  return {
    domain: bestDomain,
    clusters: matchedClusters,
    experts: [...matchedExperts],
    signalCounts,
  };
}

/**
 * Jaccard similarity between two string arrays.
 */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Recall: what fraction of expected items were found in actual.
 */
function recall(expected: string[], actual: string[]): number {
  if (expected.length === 0) return 1;
  const actualSet = new Set(actual.map((s) => s.toLowerCase()));
  const found = expected.filter((e) => actualSet.has(e.toLowerCase()));
  return found.length / expected.length;
}

/**
 * Score a deterministic routing result against expected values.
 * domain match = 0.5, cluster Jaccard = 0.25, expert recall = 0.25
 */
export function scoreDeterministic(
  testCase: RoutingTestCase,
  result: ReturnType<typeof deterministicRoute>
): number {
  const domainScore = result.domain?.toLowerCase() === testCase.expectedDomain.toLowerCase() ? 0.5 : 0;
  const clusterScore = jaccard(testCase.expectedClusters, result.clusters) * 0.25;
  const expertScore = recall(testCase.expectedExperts, result.experts) * 0.25;
  return domainScore + clusterScore + expertScore;
}

/**
 * Build the LLM judge prompt for routing evaluation.
 */
function buildJudgePrompt(
  testCase: RoutingTestCase,
  routers: DomainRouter[]
): string {
  const routerSummary = routers
    .map((r) => {
      const clusterNames = r.clusters.map((c) => c.name).join(", ");
      return `- **${r.domain}**: signals=[${r.signals.slice(0, 10).join(", ")}...], clusters=[${clusterNames}]`;
    })
    .join("\n");

  return `You are evaluating a routing system for an expert knowledge base. Given a user message, determine which domain, task clusters, and expert files should be loaded.

## Available Domains & Clusters
${routerSummary}

## User Message
"${testCase.input}"

## Expected Routing
- Domain: ${testCase.expectedDomain}
- Clusters: ${testCase.expectedClusters.join(", ")}
- Experts: ${testCase.expectedExperts.join(", ")}

## Instructions
1. Analyze the user message and determine if the expected routing is correct.
2. Score the routing from 0.0 to 1.0:
   - 1.0 = the expected routing is clearly correct
   - 0.5 = the expected routing is reasonable but there may be better options
   - 0.0 = the expected routing is clearly wrong

Respond in exactly this format:
SCORE: <number>
REASONING: <one paragraph explanation>`;
}

/**
 * Run the LLM judge on a routing test case.
 */
export async function llmJudgeRouting(
  testCase: RoutingTestCase,
  routers: DomainRouter[],
  provider: LLMProvider
): Promise<{ score: number; reasoning: string }> {
  const prompt = buildJudgePrompt(testCase, routers);
  const response = await provider.complete(prompt, {
    temperature: 0,
    systemPrompt: "You are a precise evaluation judge. Follow the output format exactly.",
  });

  const scoreMatch = response.match(/SCORE:\s*([\d.]+)/);
  const reasoningMatch = response.match(/REASONING:\s*([\s\S]+)/);

  return {
    score: scoreMatch ? parseFloat(scoreMatch[1]) : 0,
    reasoning: reasoningMatch?.[1]?.trim() ?? response,
  };
}
