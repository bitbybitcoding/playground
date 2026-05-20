import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditorClient from './EditorClient';

export const dynamic = 'force-dynamic';

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: challengeId } = await params;

  // Verify user is authenticated
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch challenge using admin client to bypass RLS — challenges are public content
  const adminSupabase = createAdminSupabaseClient();
  const { data: challenge } = await adminSupabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .maybeSingle();

  if (!challenge) {
    redirect('/editor');
  }

  return <EditorClient challengeId={challengeId} initialChallenge={challenge} />;
}
