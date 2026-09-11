/**
 * Central place to read the Supabase env vars and fail loudly, with a
 * useful message, instead of Supabase's own client throwing a cryptic
 * error deep in a fetch call the first time someone visits /login.
 *
 * None of these are set by default — they only exist once you've created
 * a Supabase project and copied its values in. See .env.example.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local, create a project at ` +
        `supabase.com, and paste its values in — see studio/README.md.`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** True once the public Supabase env vars are present — safe to call from either side. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
