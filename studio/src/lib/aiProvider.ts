import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { ModelTier } from "./modelRouter";

export type GenerationRequest = {
  tier: ModelTier;
  /** The file(s) currently in view, so the model edits in place rather than inventing new structure. */
  context: string;
  /** The user's plain-language instruction. */
  prompt: string;
};

export type GenerationResult = {
  code: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export class ProviderNotConfiguredError extends Error {}

const SYSTEM_PROMPT = `You are the Lead Code Generator inside VBC AI Studio.
Emit production-ready React 19 & Next.js 15 TypeScript. Partial code or
"// TODO" placeholders are strictly prohibited — every function you write
must be complete and correct. Reply with ONLY the final file contents,
no prose, no markdown fences.`;

/**
 * Deep tier: routed to Claude for anything touching logic, data, or
 * cross-file structure — the "Frontier Model Guarantee" from the
 * blueprint. Real call; requires ANTHROPIC_API_KEY.
 */
async function callDeepTier(req: GenerationRequest): Promise<GenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError(
      "ANTHROPIC_API_KEY is not set — the deep tier has nothing to call.",
    );
  }

  const client = new Anthropic({ apiKey });
  const model = "claude-sonnet-5";

  const response = await client.messages.create({
    model,
    // A single-file edit rarely needs more than this; kept modest so a
    // worst-case generation stays well inside the API route's 60s
    // Vercel function budget alongside the Code Guard compile step.
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    output_config: { effort: "high" },
    messages: [
      {
        role: "user",
        content: `Current file(s):\n\`\`\`\n${req.context}\n\`\`\`\n\nInstruction: ${req.prompt}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("Model returned no text content.");
  }

  return {
    code: text.text,
    model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

/**
 * Fast tier: cosmetic/copy edits and the planner pass. The blueprint's
 * 3-tier router names DeepSeek V3 / Gemini Flash for this tier, purely
 * for cost — neither is wired up yet (needs its own SDK + API key; this
 * is the natural next integration once one is chosen). In the
 * meantime this calls Claude Haiku, which is still meaningfully
 * cheaper than the deep tier's Sonnet call and needs no extra
 * provider account beyond the one the deep tier already requires.
 */
async function callFastTier(req: GenerationRequest): Promise<GenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError(
      "ANTHROPIC_API_KEY is not set — the fast tier has nothing to call.",
    );
  }

  const client = new Anthropic({ apiKey });
  const model = "claude-haiku-4-5";

  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    thinking: { type: "enabled", budget_tokens: 1024 },
    messages: [
      {
        role: "user",
        content: `Current file(s):\n\`\`\`\n${req.context}\n\`\`\`\n\nInstruction: ${req.prompt}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("Model returned no text content.");
  }

  return {
    code: text.text,
    model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

export async function generate(req: GenerationRequest): Promise<GenerationResult> {
  return req.tier === "deep" ? callDeepTier(req) : callFastTier(req);
}
