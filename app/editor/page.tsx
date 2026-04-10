import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EditorIndexPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: latestProgress } = await supabase
    .from('user_progress')
    .select('challenge_id')
    .eq('user_id', user.id)
    .not('challenge_id', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestProgress?.challenge_id) {
    redirect(`/editor/${latestProgress.challenge_id}`);
  }

  const { data: firstAvailableChallenge } = await supabase
    .from('challenges')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstAvailableChallenge?.id) {
    redirect(`/editor/${firstAvailableChallenge.id}`);
  }

  redirect('/library');
}
