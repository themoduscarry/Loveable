/**
 * Smart 3-Tier Router.
 *
 * Routes cheap, high-volume work (style tweaks, copy edits, the AI
 * Systems Analyst's planning pass) to a fast/cheap model, and reserves
 * the frontier model for the work that actually needs deep reasoning —
 * new logic, schema changes, multi-file refactors. This is the single
 * biggest lever on margin: planning + trivial-edit tokens are routinely
 * 30-40% of a session's volume and don't need frontier-grade reasoning.
 *
 * Pure and dependency-free on purpose, so it's unit-testable without a
 * network call or an API key.
 */

export type ModelTier = "fast" | "deep";

export type ModelRoute = {
  tier: ModelTier;
  /** Model id to call for this tier. Swap freely — nothing else in the
   *  app depends on which provider these point at. */
  model: string;
  reason: string;
};

const DEEP_SIGNALS = [
  /\b(schema|migration|database|auth|authentication|api route|endpoint)\b/i,
  /\b(refactor|architecture|state management|algorithm)\b/i,
  /\b(integrat(e|ion)|webhook|payment|billing)\b/i,
  /\bfix (this )?bug\b/i,
  /\b(logic|business rule|calculation)\b/i,
];

const FAST_SIGNALS = [
  /\b(color|colour|padding|margin|font|spacing|shadow|rounded|align)\b/i,
  /\b(copy|text|wording|headline|label)\b/i,
  /\bmake (it|this|the) (bigger|smaller|bold|italic)\b/i,
  /\brename\b/i,
];

/**
 * Classifies a prompt into a routing tier. Deliberately simple —
 * favors a couple of cheap false-positives toward "deep" over silently
 * under-serving a logic change with a weak model, since a wrong-tier
 * generation costs a full Code Guard round-trip either way.
 */
export function classifyTask(prompt: string, touchedFiles: number = 1): ModelRoute {
  const deepHit = DEEP_SIGNALS.some((re) => re.test(prompt));
  const fastHit = FAST_SIGNALS.some((re) => re.test(prompt));

  if (deepHit || touchedFiles > 3 || prompt.length > 600) {
    return {
      tier: "deep",
      model: "claude-sonnet-5",
      reason: deepHit
        ? "Prompt mentions logic, data, or integration work."
        : touchedFiles > 3
          ? `Touches ${touchedFiles} files — treating as a cross-cutting change.`
          : "Long, detailed prompt — likely more than a cosmetic tweak.",
    };
  }

  if (fastHit) {
    return {
      tier: "fast",
      model: "deepseek-v3",
      reason: "Cosmetic/copy edit — routed to the fast tier.",
    };
  }

  // Ambiguous prompts default to fast; Code Guard catches the failure
  // mode (a build that doesn't compile) cheaply, which is a better
  // trade than defaulting every ambiguous prompt to the expensive tier.
  return {
    tier: "fast",
    model: "gemini-2.0-flash",
    reason: "No strong signal either way — defaulting to the fast tier.",
  };
}

/** Planning passes (AI Systems Analyst's SUMMARY.md) never need frontier reasoning. */
export function plannerRoute(): ModelRoute {
  return {
    tier: "fast",
    model: "gemini-2.0-flash",
    reason: "Planning/file-tree pass — always routed to the fast tier.",
  };
}
