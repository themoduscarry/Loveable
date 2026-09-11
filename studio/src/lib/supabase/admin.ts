import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";
import type { Database } from "./types";

/**
 * Service-role client. Bypasses Row Level Security entirely, so it is
 * only ever used from trusted server code — the credit ledger and
 * generation-log writes in src/lib/creditLedger.ts and the /api/generate
 * route. Never import this from a Client Component; the "server-only"
 * import above turns that into a build-time error rather than a leaked
 * service-role key.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
