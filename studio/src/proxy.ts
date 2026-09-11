import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// The Studio product lives entirely under /studio/*. Within that,
// /studio (its own landing page), /studio/login, and everything under
// /studio/auth/* are public — the auth callback runs *before* a
// session exists, so gating it behind one would make sign-in
// impossible. Every other /studio/* path — the dashboard and a
// project workspace (/studio/<projectId>) — requires a session.
const PUBLIC_STUDIO_PATHS = new Set(["/studio", "/studio/login"]);

function isProtected(pathname: string): boolean {
  if (!pathname.startsWith("/studio/")) return false;
  if (pathname.startsWith("/studio/auth/")) return false;
  return !PUBLIC_STUDIO_PATHS.has(pathname);
}

/**
 * Refreshes the Supabase session cookie on every navigation (the
 * documented pattern — this is what avoids the "two tabs refresh the
 * same expired token" race the @supabase/ssr README warns about) and
 * gates the Studio dashboard/workspace behind a signed-in session.
 * The marketing site (everything outside /studio/*) is never gated.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const protectedRoute = isProtected(pathname);

  // No Supabase project configured yet: let marketing/auth pages render,
  // but don't try to gate protected routes against a session that can
  // never exist.
  if (!isSupabaseConfigured()) {
    if (protectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/studio/login";
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

  if (protectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
