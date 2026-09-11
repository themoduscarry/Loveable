import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";
import type { Database } from "./types";

/**
 * Supabase client for Server Components, Server Actions and Route
 * Handlers. Cookie writes silently no-op when called from a Server
 * Component (Next.js forbids it there) — session refresh in that case
 * happens in proxy.ts instead, same as the standard Supabase/Next.js
 * SSR pattern.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — proxy.ts refreshes the
          // session instead. Safe to ignore.
        }
      },
    },
  });
}
