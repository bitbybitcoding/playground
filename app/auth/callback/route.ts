import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

/**
 * Google OAuth callback (invite-gated).
 *
 * Flow A – returning user:
 *   1. Exchange OAuth code for a Supabase session.
 *   2. The user's `auth.users.created_at` is from their original sign‑up
 *      (> 120 s ago) → they are a returning user. Redirect to `next`.
 *
 * Flow B – new user (invite gate):
 *   1. The user's `auth.users.created_at` was set moments ago by the OAuth
 *      flow (< 120 s) → they are a brand‑new OAuth user who has not yet
 *      redeemed an invite code.
 *   2. Redirect to `/login?error=missing_code&email=...`. The session is
 *      KEPT alive so that the redeem endpoint (`/api/auth/redeem-invite`)
 *      can read the user's identity from the cookie.
 *   3. The middleware is configured to allow this specific path.
 *
 * Rejection paths call `supabase.auth.signOut()`.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextPath = requestUrl.searchParams.get('next');
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin));
  }

  const email = data.user.email?.toLowerCase();
  if (!email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin));
  }

  const safeNextPath =
    nextPath && nextPath.startsWith('/') ? nextPath : '/dashboard';

  // Distinguish a *returning* user from a *brand‑new* OAuth user.
  //
  // For a returning user the `auth.users` row was created at the time
  // of their **original** sign‑up (could be days/weeks ago). For a
  // brand‑new user the row is created NOW by the OAuth exchange, so
  // `created_at` is within a few seconds of the current time.
  const NEW_USER_THRESHOLD_MS = 120_000; // 2 min — well above OAuth latency
  const userAgeMs = data.user.created_at
    ? Date.now() - new Date(data.user.created_at).getTime()
    : 0;
  const isNewUser = userAgeMs < NEW_USER_THRESHOLD_MS;

  if (!isNewUser) {
    // Flow A — returning user
    return NextResponse.redirect(new URL(safeNextPath, origin));
  }

  // Flow B — new user.  Check whether the profile already carries a
  // post‑redemption marker (set by `/api/auth/redeem-invite`) so that
  // a user who redeemed an invite and then immediately signs in again
  // is not sent back to the invite prompt.
  const adminSupabase = createAdminSupabaseClient();
  try {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('full_name')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.full_name === 'invite-redeemed') {
      // Pre‑approved via previous redemption — treat as returning
      return NextResponse.redirect(new URL(safeNextPath, origin));
    }
  } catch {
    // Profile lookup failed for some unexpected reason.  Fall through
    // to the invite prompt rather than silently blocking the user.
  }

  // Send the user to the login page with the invite‑code prompt.
  // The session stays alive — the middleware allows this specific path.
  const redirectUrl = new URL('/login', origin);
  redirectUrl.searchParams.set('error', 'missing_code');
  redirectUrl.searchParams.set('email', email);
  return NextResponse.redirect(redirectUrl);
}
