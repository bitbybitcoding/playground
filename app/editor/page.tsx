import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import BottomNavBar from '@/components/BottomNavBar';
import SandboxEditorClient from './SandboxEditorClient';

export default async function SandboxEditorPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole={profile?.role} />
      <SandboxEditorClient />
      <BottomNavBar />
    </div>
  );
}
