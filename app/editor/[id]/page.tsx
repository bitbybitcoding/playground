import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import BottomNavBar from '@/components/BottomNavBar';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import EditorClient from './EditorClient';

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
    return (
      <div className="min-h-screen bg-background">
        <TopNavBar />
        <main className="pt-24 px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center py-20">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Challenge not found</h1>
            <p className="text-slate-500 mb-6">This challenge is unavailable right now.</p>
            <Link href="/library" className="text-primary font-bold hover:underline">
              Back to Library
            </Link>
          </div>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  return <EditorClient challengeId={challengeId} initialChallenge={challenge} />;
}
