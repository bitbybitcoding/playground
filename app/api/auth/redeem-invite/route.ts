import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

/**
 * Redeem an invite code for a freshly-authenticated Google user.
 *
 * The login page POSTs `{ inviteCode }` to this endpoint after the OAuth
 * callback has redirected the user back with `?error=missing_code&email=...`.
 * At that point the user has a valid Supabase session, so we use the
 * service-role client to (a) mark the code as used and (b) mark the
 * profile as approved. On any error we sign the user out and return 401
 * so the login page can re-render the error.
 */
export async function POST(request: NextRequest) {
  let body: { inviteCode?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const inviteCode = (body.inviteCode || '').trim().toUpperCase();
  if (!inviteCode) {
    return NextResponse.json({ error: 'invalid_invite_code' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data: codeData, error: codeError } = await adminSupabase
    .from('invite_codes')
    .select('*')
    .eq('code', inviteCode)
    .maybeSingle();

  if (codeError || !codeData) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'invalid_invite_code' }, { status: 401 });
  }

  if (codeData.used) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'invalid_invite_code' }, { status: 401 });
  }

  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'invalid_invite_code' }, { status: 401 });
  }

  const { error: updateError } = await adminSupabase
    .from('invite_codes')
    .update({
      used: true,
      used_by: user.id,
      used_at: new Date().toISOString(),
      use_count: (codeData.use_count || 0) + 1,
    })
    .eq('id', codeData.id);

  if (updateError) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'invalid_invite_code' }, { status: 500 });
  }

  await adminSupabase
    .from('profiles')
    .update({ full_name: 'invite-redeemed' })
    .eq('id', user.id);

  return NextResponse.json({ ok: true });
}
