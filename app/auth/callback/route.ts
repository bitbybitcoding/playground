import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * OAuth callback handler.
 * Implements the required flow:
 *   1. Exchange the OAuth code for a Supabase session using `exchangeCodeForSession`.
 *   2. Pull the user's email from `data.user.email`.
 *   3. Query the `public.profiles` table by email.
 *   4. If a profile exists, redirect to the dashboard.
 *   5. If not, redirect to the login page with `error=missing_code` and the email.
 *   6. On any error path, sign the user out before redirecting.
 */
export async function GET(request: Request) {
  // Create a server‑side Supabase client that respects Next.js cookies.
  const supabase = await createServerSupabaseClient();

  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // If no code is provided, treat as a failure.
  if (!code) {
    await supabase.auth.signOut();
    return Response.redirect(new URL('/login?error=missing_code', url), 302);
  }

  try {
    // 1. Exchange OAuth code for a session – returns { data, error }
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !sessionData?.user?.email) {
      // Missing email or exchange failure
      await supabase.auth.signOut();
      const redirect = new URL('/login', url);
      redirect.searchParams.set('error', 'missing_email');
      if (sessionData?.user?.email) redirect.searchParams.set('email', sessionData.user.email);
      return Response.redirect(redirect, 302);
    }

    const userEmail = sessionData.user.email;

    // 2. Query profiles by email
    const { data: profile, error: profileError } = await supabase
      .from('public.profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // Unexpected DB error – sign out and forward generic error
      await supabase.auth.signOut();
      return Response.redirect(new URL('/login?error=oauth_failed', url), 302);
    }

    if (profile) {
      // Profile exists – allow access
      return Response.redirect(new URL('/dashboard', url), 302);
    }

    // No profile → redirect with missing_code and email param
    const redirect = new URL('/login', url);
    redirect.searchParams.set('error', 'missing_code');
    redirect.searchParams.set('email', userEmail);
    return Response.redirect(redirect, 302);
  } catch (e) {
    // Any unexpected exception – ensure sign‑out
    await supabase.auth.signOut();
    return Response.redirect(new URL('/login?error=oauth_failed', url), 302);
  }
}