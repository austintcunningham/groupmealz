import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Keep middleware under Vercel's invocation limit if Auth/DNS stalls. */
const AUTH_TIMEOUT_MS = 8000;

function isPublicPath(pathname: string): boolean {
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isDevOnlyRoute =
    process.env.NODE_ENV !== "production" && pathname.startsWith("/dev/");

  return (
    isAuthRoute ||
    isDevOnlyRoute ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/review/") ||
    pathname.startsWith("/order") ||
    pathname.startsWith("/catering") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/cron") ||
    pathname === "/" ||
    pathname === "/faq"
  );
}

async function getUserFast(
  supabase: ReturnType<typeof createServerClient>
): Promise<{ id: string } | null> {
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("supabase auth timeout")), AUTH_TIMEOUT_MS)
      ),
    ]);
    return result.data.user ?? null;
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const publicRoute = isPublicPath(pathname);

  const user = await getUserFast(supabase);

  if (!user && !publicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
