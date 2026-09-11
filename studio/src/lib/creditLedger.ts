import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import type { ModelTier } from "./modelRouter";

type AdminClient = SupabaseClient<Database>;

/**
 * Base credit cost per generation, by router tier. The "deep" tier costs
 * more per call (frontier model, larger context) but is only reached for
 * prompts that actually need it — see src/lib/modelRouter.ts.
 */
export const BASE_COST: Record<ModelTier, number> = {
  fast: 1,
  deep: 6,
};

/**
 * The blueprint's headline promise: a build that fails Code Guard is
 * capped at a 10% diagnostic fee, never the full generation cost.
 * Rounds up so a failed fast-tier call still costs a symbolic 1 credit
 * rather than zero — the diagnostic itself isn't free to run.
 */
export const DIAGNOSTIC_FEE_RATE = 0.1;

export function costForOutcome(tier: ModelTier, codeGuardPassed: boolean): number {
  const base = BASE_COST[tier];
  return codeGuardPassed ? base : Math.max(1, Math.ceil(base * DIAGNOSTIC_FEE_RATE));
}

export class InsufficientCreditsError extends Error {
  constructor(public balance: number, public required: number) {
    super(`Insufficient credits: have ${balance}, need ${required}.`);
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Pre-flight check, called before any LLM call is made — there's no
 * point spending a token budget on a generation the user can't afford
 * even in the best case (Code Guard passes, full price charged).
 */
export async function assertHasCredits(
  admin: AdminClient,
  userId: string,
  tier: ModelTier,
): Promise<{ balance: number }> {
  const { data, error } = await admin
    .from("user_subscriptions")
    .select("credit_balance, rollover_credits")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error(`No subscription row for user ${userId}: ${error?.message ?? "not found"}`);
  }

  const available = data.credit_balance + data.rollover_credits;
  const required = BASE_COST[tier];

  if (available < required) {
    throw new InsufficientCreditsError(available, required);
  }

  return { balance: available };
}

export type SettleGenerationArgs = {
  userId: string;
  projectId: string;
  prompt: string;
  tier: ModelTier;
  codeGuardPassed: boolean;
  errorDetails?: string;
  commitHash?: string;
};

export type SettleGenerationResult = {
  creditsCharged: number;
  newBalance: number;
};

/**
 * Deducts the actual charge (full price on a Code Guard pass, the
 * capped diagnostic fee on a fail) and writes the audit row in
 * generation_logs. The deduction is a single conditional UPDATE
 * (`WHERE credit_balance >= amount`), so two concurrent generations
 * can't both succeed against a balance that only covers one of them.
 */
export async function settleGeneration(
  admin: AdminClient,
  args: SettleGenerationArgs,
): Promise<SettleGenerationResult> {
  const charge = costForOutcome(args.tier, args.codeGuardPassed);

  const { data: current, error: readError } = await admin
    .from("user_subscriptions")
    .select("credit_balance")
    .eq("user_id", args.userId)
    .single();

  if (readError || !current) {
    throw new Error(`No subscription row for user ${args.userId}`);
  }

  const { data: updated, error: updateError } = await admin
    .from("user_subscriptions")
    .update({ credit_balance: current.credit_balance - charge })
    .eq("user_id", args.userId)
    .gte("credit_balance", charge)
    .select("credit_balance")
    .single();

  if (updateError || !updated) {
    throw new InsufficientCreditsError(current.credit_balance, charge);
  }

  await admin.from("generation_logs").insert({
    project_id: args.projectId,
    user_id: args.userId,
    prompt: args.prompt,
    model_tier: args.tier,
    credits_deducted: charge,
    code_guard_passed: args.codeGuardPassed,
    error_details: args.errorDetails ?? null,
    commit_hash: args.commitHash ?? null,
  });

  return { creditsCharged: charge, newBalance: updated.credit_balance };
}
