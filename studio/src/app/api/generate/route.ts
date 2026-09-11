import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { classifyTask } from "@/lib/modelRouter";
import { assertHasCredits, InsufficientCreditsError, settleGeneration } from "@/lib/creditLedger";
import { generate, ProviderNotConfiguredError } from "@/lib/aiProvider";
import { runStaticAnalysis } from "@/lib/codeGuard";

export const runtime = "nodejs";
// This route does a full Claude call plus a real tsc compile in one
// request/response cycle — comfortably past Vercel's default function
// timeout. Raise the ceiling explicitly (60s is within the Hobby plan's
// configurable max).
export const maxDuration = 60;

type GenerateBody = {
  projectId: string;
  prompt: string;
  /** Path the generated file should land at, e.g. "app/page.tsx". */
  filePath: string;
  /** Current contents of that file (and any other files given as context). */
  context: string;
};

export async function POST(request: Request) {
  let body: GenerateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.projectId || !body.prompt || !body.filePath) {
    return NextResponse.json(
      { error: "projectId, prompt, and filePath are required." },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "No Supabase project is connected yet." },
      { status: 503 },
    );
  }

  // 1. Authenticate the caller and confirm they own the project. Uses the
  // user's own session (RLS-scoped client), not the admin client — a
  // stranger's projectId simply won't come back.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, owner_id")
    .eq("id", body.projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const admin = createAdminClient();

  // 2. Pick a tier and pre-flight the credit balance before spending any
  // tokens on a generation the user can't afford.
  const route = classifyTask(body.prompt);

  try {
    await assertHasCredits(admin, user.id, route.tier);
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "insufficient_credits", balance: err.balance, required: err.required },
        { status: 402 },
      );
    }
    throw err;
  }

  // 3. Call the model.
  let generated;
  try {
    generated = await generate({ tier: route.tier, context: body.context, prompt: body.prompt });
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return NextResponse.json(
        {
          error: "provider_not_configured",
          message: err.message,
        },
        { status: 503 },
      );
    }
    throw err;
  }

  // 4. Code Guard, Stage 2 (static analysis) — see src/lib/codeGuard.ts for
  // why this stage runs server-side rather than in a WebContainer.
  const guardResult = await runStaticAnalysis([{ path: body.filePath, content: generated.code }]);

  // 5. Settle credits against the real outcome and log the attempt —
  // full price on a pass, the capped diagnostic fee on a fail.
  const settlement = await settleGeneration(admin, {
    userId: user.id,
    projectId: project.id,
    prompt: body.prompt,
    tier: route.tier,
    codeGuardPassed: guardResult.passed,
    errorDetails: guardResult.passed ? undefined : guardResult.diagnostics,
  });

  if (!guardResult.passed) {
    return NextResponse.json(
      {
        error: "code_guard_failed",
        diagnostics: guardResult.diagnostics,
        creditsCharged: settlement.creditsCharged,
        newBalance: settlement.newBalance,
        route,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    code: generated.code,
    model: generated.model,
    route,
    creditsCharged: settlement.creditsCharged,
    newBalance: settlement.newBalance,
    tokens: { input: generated.inputTokens, output: generated.outputTokens },
  });
}
