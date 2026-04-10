import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import BottomNavBar from '@/components/BottomNavBar';
import Link from 'next/link';
import { Search, ArrowRight, CheckCircle, Clock, MoreHorizontal, Sparkles } from 'lucide-react';

export default async function LibraryPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const [
    { data: profile },
    challengeResult,
    { data: userProgress },
    { data: pathways },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('user_progress')
      .select('challenge_id, status')
      .eq('user_id', user.id),
    supabase
      .from('pathways')
      .select('*')
      .eq('is_active', true),
  ]);

  let challenges = challengeResult.data || [];

  if (challengeResult.error) {
    console.error('Primary library challenges query failed, attempting admin fallback:', challengeResult.error.message);
  }

  if ((challengeResult.error || challenges.length === 0) && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminSupabase = createAdminSupabaseClient();
    const { data: adminChallenges, error: adminChallengesError } = await adminSupabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminChallengesError) {
      console.error('Failed to fetch challenges with admin fallback:', adminChallengesError.message);
    } else {
      challenges = adminChallenges || [];
    }
  }

  // Get challenge status
  const getChallengeStatus = (challengeId: string) => {
    const progress = userProgress?.find(p => p.challenge_id === challengeId);
    return progress?.status || 'not_started';
  };

  // Group challenges by difficulty
  const beginnerChallenges = challenges?.filter(c => c.difficulty === 'beginner') || [];
  const intermediateChallenges = challenges?.filter(c => c.difficulty === 'intermediate') || [];
  const advancedChallenges = challenges?.filter(c => c.difficulty === 'advanced') || [];

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole={profile?.role} />
      
      <main className="lg:ml-0 mt-16 p-4 md:p-8 min-h-screen pb-24 md:pb-12">
        {/* Editorial Header Section */}
        <header className="max-w-6xl mx-auto mb-8 md:mb-16 relative">
          <div className="absolute -top-8 -left-4 md:-top-12 md:-left-12 opacity-10 pointer-events-none">
            <span className="font-headline text-8xl md:text-[12rem] text-primary italic font-black">{'{}'}</span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl md:text-7xl font-black text-on-surface mb-4 leading-tight relative">
            Problem <br />
            <span className="text-primary italic">Library</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-xl">
            A curated atelier of micro-challenges designed to transform your coding syntax into digital craftsmanship.
          </p>
        </header>

        {/* Filters & Pathways Section */}
        <section className="max-w-6xl mx-auto mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-end">
            {/* Pathways Horizontal Scroll */}
            <div className="flex-1 overflow-hidden w-full">
              <h3 className="font-label text-xs font-bold uppercase tracking-[0.2em] mb-4 text-outline">Active Pathways</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {pathways?.map((pathway) => (
                    <div 
                      key={pathway.id}
                    className="flex-shrink-0 bg-surface-container-lowest editorial-shadow p-4 md:p-6 rounded-xl border-l-4 border-primary w-56 md:w-64"
                  >
                    <h4 className="font-headline text-base md:text-lg font-bold mb-1">{pathway.name}</h4>
                    <p className="text-sm text-on-surface-variant mb-4">
                      {pathway.total_challenges} Challenges
                    </p>
                      <div className="h-1.5 w-full bg-surface-container-low rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            
            {/* Hard Filters */}
            <div className="flex gap-2 pb-4 w-full md:w-auto overflow-x-auto">
              <button className="bg-surface-container-low px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors whitespace-nowrap">
                All Difficulties
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                All Topics
              </button>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="max-w-6xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input 
              type="text" 
              placeholder="Search challenges..."
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-label"
            />
          </div>
        </section>

        {/* Main Challenge Grid */}
        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Featured Card */}
          {challenges && challenges.length > 0 && (
            <div className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-lowest editorial-shadow flex flex-col md:flex-row">
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-tertiary-fixed-dim/20 text-tertiary px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                      Featured
                    </span>
                    <span className="text-outline text-[10px] font-black uppercase tracking-widest">
                      {challenges[0].category} • {challenges[0].difficulty}
                    </span>
                  </div>
                  <h2 className="font-headline text-2xl md:text-4xl font-black mb-4 group-hover:text-primary transition-colors">
                    {challenges[0].title}
                  </h2>
                  <p className="text-on-surface-variant mb-6 line-clamp-3 text-sm">
                    {challenges[0].description}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-xs font-bold text-primary">
                      A
                    </div>
                    <div className="w-8 h-8 rounded-full bg-tertiary/20 border-2 border-white flex items-center justify-center text-xs font-bold text-tertiary">
                      B
                    </div>
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-[10px] font-bold">
                      +{Math.max(0, (challenges[0].points || 10) - 2)}
                    </div>
                  </div>
                  <Link 
                    href={`/editor/${challenges[0].id}`}
                    className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    Begin Challenge <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 min-h-[200px] md:min-h-[240px] relative bg-gradient-to-br from-primary/20 to-bit-lavender/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-20 h-20 text-primary/30" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-transparent to-transparent md:block hidden"></div>
              </div>
            </div>
          )}

          {/* Challenge Cards */}
          {challenges?.slice(1).map((challenge) => {
            const status = getChallengeStatus(challenge.id);
            return (
              <div 
                key={challenge.id}
                className="bg-surface-container-lowest editorial-shadow rounded-xl p-6 md:p-8 hover:-translate-y-1 transition-transform"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container-low rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">code</span>
                  </div>
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-tertiary" />
                  ) : status === 'in_progress' ? (
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">In Progress</span>
                  ) : (
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <h3 className="font-headline text-lg md:text-2xl font-bold mb-2">{challenge.title}</h3>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">{challenge.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-bold uppercase tracking-tighter bg-surface-container-high px-2 py-1 rounded">
                    {challenge.category} • {challenge.difficulty}
                  </span>
                  <Link 
                    href={`/editor/${challenge.id}`}
                    className="text-primary font-bold text-xs hover:underline"
                  >
                    {status === 'completed' ? 'Review' : status === 'in_progress' ? 'Resume' : 'Start'}
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {(!challenges || challenges.length === 0) && (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="font-headline text-2xl font-bold mb-2">No challenges yet</h3>
              <p className="text-slate-500">Check back soon for new challenges!</p>
            </div>
          )}
        </section>

      </main>

      <BottomNavBar />
    </div>
  );
}
