import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles both the GitHub OAuth redirect and the email magic-link
 * redirect — both land here with a `code` param to exchange for a
 * session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const url = new URL("/login", origin);
  url.searchParams.set("error", "auth-callback-failed");
  return NextResponse.redirect(url);
}
