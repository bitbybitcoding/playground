import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

/**
 * Google OAuth callback (invite-gated).
 *
 * Flow A – returning user:
 *   1. Exchange OAuth code for a Supabase session.
 *   2. Look up the user's `public.profiles` row by id via the service-role
 *      client. A *returning* user has a profile whose `created_at` is older
 *      than ~60 s. (The `on_auth_user_created` trigger creates the profile
 *      in the same transaction that inserts the auth user, so a brand-new
 *      OAuth user has a profile whose age is essentially zero.) If the
 *      profile is older than the threshold, the user is returning and we
 *      redirect to `next`.
 *
 * Flow B – new user (invite gate):
 *   1. The profile is brand-new (just created by the trigger) and has not
 *      been redeemed. We sign the user out and redirect to
 *      `/login?error=missing_code&email=...` so the login page can render
 *      the invite-code prompt. The user then submits a code via
 *      `POST /api/auth/redeem-invite`, which performs the redemption and
 *      updates `profiles.full_name` to a sentinel value
 *      (`'invite-redeemed'`) so a *second* OAuth sign-in by the same user
 *      is treated as Flow A.
 *
 * Rejection paths always call `supabase.auth.signOut()` to avoid a ghost
 * session.
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

  const userId = data.user.id;
  const email = data.user.email?.toLowerCase();
  if (!email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin));
  }

  const safeNextPath = nextPath && nextPath.startsWith('/') ? nextPath : '/dashboard';
  const adminSupabase = createAdminSupabaseClient();

  // Look up the profile row. The `on_auth_user_created` trigger in
  // `setup.sql` auto-creates a `profiles` row for every new `auth.users`
  // insert, so "no profile" cannot be used to detect "new user".
  //
  // To distinguish a *returning* user from a *brand-new* OAuth user we
  // compare the profile's `created_at` against the current time. The trigger
  // runs within the same transaction that inserts the auth user, so for a
  // *new* OAuth sign-in both timestamps are within a few seconds of "now".
  // A returning user has a profile that was created minutes / hours / days
  // ago, so the profile's age is well beyond the OAuth user creation lag.
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .eq('id', userId)
    .maybeSingle();

  // Threshold: treat a profile as "pre-existing" (returning user) when it
  // is older than 60 seconds. This is well above the trigger-to-OAuth lag.
  const NEW_USER_THRESHOLD_MS = 60_000;
  const profileAgeMs = profile?.created_at
    ? Date.now() - new Date(profile.created_at).getTime()
    : 0;
  const isReturningUser =
    profile !== null && profileAgeMs > NEW_USER_THRESHOLD_MS;
  // Also accept the explicit post-redemption marker set below.
  const isPreApproved = profile?.full_name === 'invite-redeemed';

  if (isReturningUser || isPreApproved) {
    return NextResponse.redirect(new URL(safeNextPath, origin));
  }

  // New user (brand-new OAuth account, profile just created by the trigger,
  // not yet redeemed). Sign them out and send them to the login page so they
  // can submit an invite code. The login page POSTs the code to
  // `/api/auth/redeem-invite`, which performs the redemption with the
  // service-role client (bypasses RLS so non-admin users can mark the code
  // as used) and then redirects to `next`.
  await supabase.auth.signOut();
  const redirectUrl = new URL('/login', origin);
  redirectUrl.searchParams.set('error', 'missing_code');
  redirectUrl.searchParams.set('email', email);
  return NextResponse.redirect(redirectUrl);
}
