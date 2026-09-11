import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const PROTECTED_PREFIXES = ["/dashboard", "/studio"];

/**
 * Refreshes the Supabase session cookie on every navigation (the
 * documented pattern — this is what avoids the "two tabs refresh the
 * same expired token" race the @supabase/ssr README warns about) and
 * gates /dashboard and /studio behind a signed-in session.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  // No Supabase project configured yet: let marketing/auth pages render,
  // but don't try to gate protected routes against a session that can
  // never exist.
  if (!isSupabaseConfigured()) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("reason", "not-configured");
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
