import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import BottomNavBar from '@/components/BottomNavBar';
import { Play, Code, FileText, Database, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch user progress
  const { data: userProgress } = await supabase
    .from('user_progress')
    .select('*, challenges(*)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  // Fetch pathways progress
  const { data: pathwayProgress } = await supabase
    .from('user_pathway_progress')
    .select('*, pathways(*)')
    .eq('user_id', user.id);

  // Fetch recent challenges
  const { data: recentChallenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  const firstName = profile?.full_name?.split(' ')[0] || 'Coder';
  const completedChallenges = userProgress?.filter(p => p.status === 'completed').length || 0;
  const inProgressChallenges = userProgress?.filter(p => p.status === 'in_progress').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole={profile?.role} />
      
      <main className="lg:ml-0 pt-24 px-4 md:px-8 pb-24 md:pb-12 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl md:text-5xl font-black text-on-surface tracking-tight mb-2">
                Welcome back, <span className="text-primary italic">{firstName}</span>
              </h1>
              <p className="text-on-surface-variant max-w-lg leading-relaxed font-medium">
                Ready to continue your journey? You&apos;re doing great work on your impact projects.
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/library"
                className="px-4 md:px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 text-sm md:text-base"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Resume Last Task</span>
                <span className="sm:hidden">Resume</span>
              </Link>
              <Link 
                href="/editor/default"
                className="px-4 md:px-6 py-3 bg-surface-container-highest text-on-surface font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 text-sm md:text-base"
              >
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Jump to Editor</span>
                <span className="sm:hidden">Editor</span>
              </Link>
            </div>
          </header>

          {/* Bento Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
            {/* Current Course Progress Card (Spans 8) */}
            <section className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center transition-all hover:translate-y-[-4px]">
              <div className="relative w-full md:w-1/3 aspect-video md:aspect-square rounded-lg overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-bit-lavender flex items-center justify-center">
                  <Code className="w-16 h-16 text-white/50" />
                </div>
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-5xl">auto_stories</span>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-2 block">Current Course</span>
                    <h2 className="font-display text-xl md:text-2xl font-bold mb-1">Python: Language & Application</h2>
                    <p className="text-slate-500 font-medium text-sm">Week 5: File I/O Operations</p>
                  </div>
                  <span className="bg-secondary/10 text-secondary text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {Math.round((completedChallenges / (completedChallenges + inProgressChallenges + 1)) * 100) || 0}% Complete
                  </span>
                </div>
                <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden mb-6">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((completedChallenges / (completedChallenges + inProgressChallenges + 1)) * 100) || 0}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <span className="text-xs text-slate-500 block mb-1">Completed</span>
                    <p className="font-bold text-sm">{completedChallenges} challenges</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <span className="text-xs text-slate-500 block mb-1">In Progress</span>
                    <p className="font-bold text-sm">{inProgressChallenges} challenges</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Weekly Goals (Spans 4) */}
            <section className="md:col-span-4 bg-surface-container-low rounded-xl p-6 md:p-8 flex flex-col">
              <h3 className="font-display text-xl font-bold mb-6">Weekly Goals</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Coding Hours</span>
                    <span className="text-primary">{profile?.weekly_hours || 0} / 10h</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(((profile?.weekly_hours || 0) / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Tasks Completed</span>
                    <span className="text-tertiary">{completedChallenges} / 15</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full">
                    <div 
                      className="h-full bg-tertiary-container rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((completedChallenges / 15) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white/50 rounded-lg italic text-sm text-slate-600 border-l-4 border-primary">
                  &ldquo;You&apos;re making great progress! Keep pushing forward.&rdquo;
                </div>
              </div>
            </section>

            {/* Recently Worked On (Spans 4) */}
            <section className="md:col-span-4 bg-surface-container-low rounded-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-bold">Recent Files</h3>
                <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
              </div>
              <div className="space-y-2">
                {userProgress?.slice(0, 3).map((progress, idx) => (
                  <Link 
                    key={progress.id}
                    href={`/editor/${progress.challenge_id}`}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary-container" />
                      <div>
                        <p className="font-bold text-sm">challenge_{progress.challenge_id.slice(0, 6)}.py</p>
                        <p className="text-[10px] text-slate-400">
                          {progress.status === 'completed' ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">chevron_right</span>
                  </Link>
                ))}
                {(!userProgress || userProgress.length === 0) && (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-sm">No recent activity</p>
                    <Link href="/library" className="text-primary text-sm hover:underline mt-2 inline-block">
                      Start a challenge
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Social Impact Track (Spans 8) */}
            <section className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6 md:p-8 border border-outline-variant/15">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <span className="text-[10px] text-tertiary font-bold uppercase tracking-[0.2em] mb-2 block">The Impact Track</span>
                  <h3 className="font-display text-2xl font-black">Coding for Change</h3>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary">{profile?.impact_points || 0}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Impact Points</p>
                </div>
              </div>
              
              <div className="relative pt-12">
                {/* Horizontal Timeline */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 rounded-full"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-tertiary -translate-y-1/2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((profile?.impact_points || 0) / 5000) * 100, 100)}%` }}
                ></div>
                
                <div className="flex justify-between items-center relative">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-white ring-4 ring-surface-container-lowest">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="text-center w-24 md:w-32">
                      <p className="font-bold text-xs">Foundation</p>
                      <p className="text-[10px] text-slate-500">Logic & Ethics</p>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest ${
                      (profile?.impact_points || 0) >= 500 ? 'bg-tertiary text-white' : 'bg-surface-container-high text-slate-400'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-center w-24 md:w-32">
                      <p className="font-bold text-xs">Local Pilot</p>
                      <p className="text-[10px] text-slate-500">Non-profit Tooling</p>
                    </div>
                  </div>
                  
                  {/* Step 3 (Current) */}
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-[6px] scale-110 ${
                      (profile?.impact_points || 0) >= 2000 
                        ? 'bg-primary text-white ring-primary/20' 
                        : 'bg-surface-container-high text-slate-400 ring-surface-container-high/20'
                    }`}>
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="text-center w-24 md:w-32">
                      <p className={`font-bold text-xs ${(profile?.impact_points || 0) >= 2000 ? 'text-primary' : ''}`}>Community Scaler</p>
                      <p className="text-[10px] text-slate-500 italic">
                        {(profile?.impact_points || 0) >= 2000 ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-slate-400 ring-4 ring-surface-container-lowest">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="text-center w-24 md:w-32">
                      <p className="font-bold text-xs">Global Open Source</p>
                      <p className="text-[10px] text-slate-500">Locked</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-surface-container-low rounded-lg flex items-center gap-6">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Impact Spotlight</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Complete more challenges to earn impact points. Advanced students work with 
                    non-profits to build real technology solutions that benefit the community.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
