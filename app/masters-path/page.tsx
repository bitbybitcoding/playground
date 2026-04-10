import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import BottomNavBar from '@/components/BottomNavBar';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';

export default async function MastersPathPage() {
  const MAX_CARD_CHALLENGES = 8;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .order('difficulty', { ascending: true })
    .order('created_at', { ascending: true });

  const { data: userProgress } = await supabase
    .from('user_progress')
    .select('challenge_id, status')
    .eq('user_id', user.id);

  const progressByChallengeId = new Map((userProgress || []).map((item) => [item.challenge_id, item.status]));
  const completedCount = (userProgress || []).filter((p) => p.status === 'completed').length;
  const totalChallenges = challenges?.length || 0;
  const progressPercentage = totalChallenges > 0 ? Math.round((completedCount / totalChallenges) * 100) : 0;
  const featuredChallenge = challenges?.[0] || null;
  const otherChallenges = challenges?.slice(1, MAX_CARD_CHALLENGES + 1) || [];

  const getStatus = (challengeId: string) => progressByChallengeId.get(challengeId) || 'not_started';

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole={profile?.role} />

      <main className="lg:ml-0 pt-24 pb-20 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto">
        <header className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-headline tracking-tighter leading-tight mb-4 md:mb-6">
                Master&apos;s Path
              </h1>
            </div>
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl w-full md:w-72 shadow-sm">
              <h4 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                Current Progress
              </h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl md:text-4xl font-headline font-bold">{completedCount}</span>
                <span className="text-lg md:text-xl font-headline text-on-surface-variant opacity-50">/ {totalChallenges}</span>
              </div>
              <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="mt-4 text-xs font-medium text-tertiary">{progressPercentage}% completed</p>
            </div>
          </div>
        </header>

        {!featuredChallenge ? (
          <section className="text-center py-16 bg-surface-container-low rounded-xl">
            <h2 className="font-display text-2xl font-bold mb-2">No path available yet</h2>
            <p className="text-slate-500">Publish challenges in Supabase to populate this page.</p>
          </section>
        ) : (
          <section className="space-y-8">
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl md:text-3xl font-headline font-bold">{featuredChallenge.title}</h2>
                <span className="text-tertiary-container flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle className="w-4 h-4" fill="currentColor" />
                  {getStatus(featuredChallenge.id) === 'completed'
                    ? 'Completed'
                    : getStatus(featuredChallenge.id) === 'in_progress'
                    ? 'In Progress'
                    : 'Available'}
                </span>
              </div>
              <p className="text-on-surface-variant leading-relaxed mb-4 text-sm md:text-base">{featuredChallenge.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                <span className="uppercase tracking-wider">{featuredChallenge.difficulty}</span>
                <span className="uppercase tracking-wider">{featuredChallenge.category}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {featuredChallenge.time_estimate} mins
                </span>
              </div>
              <Link
                href={`/editor/${featuredChallenge.id}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg font-bold text-sm"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {otherChallenges.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {otherChallenges.map((challenge) => {
                  const status = getStatus(challenge.id);
                  return (
                    <div key={challenge.id} className="bg-surface-container-low rounded-xl p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{challenge.difficulty}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>
                      <h3 className="font-headline text-xl font-bold mb-2 line-clamp-1">{challenge.title}</h3>
                      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{challenge.description}</p>
                      <div className="text-xs text-slate-500 mb-4">{challenge.category} • {challenge.time_estimate} mins</div>
                      <Link href={`/editor/${challenge.id}`} className="mt-auto text-primary text-sm font-bold inline-flex items-center gap-1">
                        Open <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
