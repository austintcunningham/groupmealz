import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const defaultNext = type === "recovery" ? "/reset-password" : "/";
  const next = safeNextPath(searchParams.get("next"), defaultNext);
  const successUrl = `${origin}${next}`;
  const failureUrl = `${origin}/login?error=auth_callback_failed`;

  function createSupabaseWithCookies(response: NextResponse) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
          ) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
  }

  if (code) {
    const response = NextResponse.redirect(successUrl);
    const supabase = createSupabaseWithCookies(response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  if (tokenHash && type) {
    const response = NextResponse.redirect(successUrl);
    const supabase = createSupabaseWithCookies(response);
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "recovery" | "email" | "signup" | "invite" | "magiclink" | "email_change",
    });
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(failureUrl);
}
