import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';

const ERROR_REDIRECT = '/login?error=oauth_failed';
const NOT_ALLOWED_REDIRECT = '/login?error=not_allowed';
const MISSING_CODE_REDIRECT = '/login?error=missing_code';
const MISSING_EMAIL_REDIRECT = '/login?error=missing_email';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextPath = requestUrl.searchParams.get('next');
  const startedAtParam = requestUrl.searchParams.get('startedAt');
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL(MISSING_CODE_REDIRECT, origin));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL(ERROR_REDIRECT, origin));
  }

  const email = data.user.email?.toLowerCase();
  if (!email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL(MISSING_EMAIL_REDIRECT, origin));
  }

  const startedAt = startedAtParam ? Number(startedAtParam) : null;
  const createdAt = data.user.created_at ? new Date(data.user.created_at).getTime() : null;
  const startedAtValid = startedAt !== null && Number.isFinite(startedAt);
  const createdAfterStart = startedAtValid && createdAt !== null ? createdAt >= startedAt : true;

  if (createdAfterStart) {
    const adminSupabase = createAdminSupabaseClient();
    await adminSupabase.auth.admin.deleteUser(data.user.id);
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL(NOT_ALLOWED_REDIRECT, origin));
  }

  const safeNextPath = nextPath && nextPath.startsWith('/') ? nextPath : '/dashboard';
  return NextResponse.redirect(new URL(safeNextPath, origin));
}
