import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import BottomNavBar from '@/components/BottomNavBar';
import Link from 'next/link';
import { 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Database, 
  ArrowRight,
  Lock,
  Code,
  Layers,
  GitBranch,
  BarChart3,
  Sparkles
} from 'lucide-react';

export default async function MastersPathPage() {
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

  // Fetch challenges by category
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_published', true)
    .order('difficulty', { ascending: true });

  // Fetch user progress
  const { data: userProgress } = await supabase
    .from('user_progress')
    .select('challenge_id, status')
    .eq('user_id', user.id);

  const completedCount = userProgress?.filter(p => p.status === 'completed').length || 0;
  const totalChallenges = challenges?.length || 24;
  const progressPercentage = Math.round((completedCount / totalChallenges) * 100);

  const modules = [
    {
      id: 'array-mastery',
      title: 'Array Mastery',
      description: 'Master the foundation of modern computation. Learn to manipulate, transform, and traverse contiguous data structures with maximum efficiency.',
      difficulty: 'beginner',
      status: completedCount >= 3 ? 'completed' : completedCount >= 1 ? 'in_progress' : 'not_started',
      icon: Layers,
      timeEstimate: '45 mins',
      color: 'tertiary'
    },
    {
      id: 'recursion-riddles',
      title: 'Recursion Riddles',
      description: 'Unlock the power of functional depth. Dive into the recursive patterns that define natural growth and complex logic.',
      difficulty: 'intermediate',
      status: completedCount >= 6 ? 'completed' : completedCount >= 3 ? 'in_progress' : 'locked',
      icon: GitBranch,
      timeEstimate: '1.5 hours',
      color: 'primary'
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Drafting',
      description: 'Optimization at its peak. Learn to cache the past to predict the future through sophisticated dynamic programming.',
      difficulty: 'advanced',
      status: completedCount >= 10 ? 'completed' : completedCount >= 6 ? 'in_progress' : 'locked',
      icon: Sparkles,
      timeEstimate: '2 hours',
      color: 'bit-lavender'
    },
    {
      id: 'greedy-algorithms',
      title: 'Greedy Gladiators',
      description: 'Sometimes the best local choice leads to the global optimum. Explore the greedy strategy in pathfinding.',
      difficulty: 'intermediate',
      status: completedCount >= 14 ? 'completed' : completedCount >= 10 ? 'in_progress' : 'locked',
      icon: TrendingUp,
      timeEstimate: '2.5 hours',
      color: 'secondary'
    },
    {
      id: 'graph-theory',
      title: 'Graph Theory',
      description: 'Connect the dots. Understand how to model social networks and infrastructure through nodes and edges.',
      difficulty: 'advanced',
      status: completedCount >= 18 ? 'completed' : completedCount >= 14 ? 'in_progress' : 'locked',
      icon: Database,
      timeEstimate: '4 hours',
      color: 'bit-lavender'
    },
    {
      id: 'sorting-studio',
      title: 'Sorting Studio',
      description: 'From Bubble to Quick. Organize data with elegance and understand the trade-offs of different sorting techniques.',
      difficulty: 'beginner',
      status: completedCount >= 21 ? 'completed' : completedCount >= 18 ? 'in_progress' : 'locked',
      icon: BarChart3,
      timeEstimate: '1 hour',
      color: 'tertiary'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole={profile?.role} />
      
      <main className="lg:ml-0 pt-24 pb-20 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="max-w-2xl">
              <span className="font-label text-xs tracking-[0.2em] text-secondary font-bold uppercase mb-4 block">
                Editorial Collection
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-headline tracking-tighter leading-tight mb-4 md:mb-6">
                The Master&apos;s Path: <br />
                <span className="italic font-light text-brand-gradient">Algorithm Design</span>
              </h1>
              <p className="text-body text-base md:text-lg text-on-surface-variant max-w-lg leading-relaxed">
                A curated series of micro-challenges designed to sharpen your problem-solving intuition through intentional practice and craft.
              </p>
            </div>
            
            {/* Collection Progress Card */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl w-full md:w-72 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                  Current Mastery
                </h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl md:text-4xl font-headline font-bold">{completedCount}</span>
                  <span className="text-lg md:text-xl font-headline text-on-surface-variant opacity-50">/ {totalChallenges}</span>
                </div>
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-gradient transition-all duration-1000"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-xs font-medium text-tertiary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {progressPercentage}% of path completed
                </p>
              </div>
              {/* Background accent */}
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Code className="w-24 h-24 md:w-32 md:h-32" />
              </div>
            </div>
          </div>
        </header>

        {/* Challenges Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-8 lg:gap-10">
          {/* Featured Card (Large/Primary) */}
          <div className="md:col-span-2 lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 md:p-8 lg:p-10 flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 group hover:bg-white transition-all duration-300">
            <div className="md:w-1/3 shrink-0">
              <div className="aspect-square bg-surface-container-low rounded-lg overflow-hidden mb-4 md:mb-6 flex items-center justify-center">
                <Layers className="w-16 h-16 md:w-20 md:h-20 text-primary/30" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">
                  Recommended Start
                </span>
                <div className="flex items-center gap-3">
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                    Beginner
                  </span>
                  <span className="text-on-surface-variant text-[10px] font-medium flex items-center gap-1 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> 45 MINS
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl md:text-3xl font-headline font-bold">Array Mastery</h2>
                  <span className="text-tertiary-container flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4" fill="currentColor" />
                    {completedCount >= 3 ? 'Completed' : 'Available'}
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                  Master the foundation of modern computation. Learn to manipulate, transform, and traverse contiguous data structures with maximum efficiency.
                </p>
                <div className="p-3 md:p-4 bg-surface-container-low rounded-lg border-l-4 border-primary">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Mission Objective</h5>
                  <p className="text-sm italic opacity-80">Implement an O(n) solution for multi-dimensional matrix rotation without utilizing temporary buffer arrays.</p>
                </div>
              </div>
              <Link 
                href="/library"
                className="mt-6 md:mt-8 self-start px-4 md:px-6 py-2.5 md:py-3 bg-surface-container-highest rounded-lg font-medium text-sm hover:bg-primary hover:text-on-primary transition-all"
              >
                {completedCount >= 3 ? 'Review Solution' : 'Start Challenge'}
              </Link>
            </div>
          </div>

          {/* Side Cards */}
          {modules.slice(1, 3).map((module) => {
            const Icon = module.icon;
            const isLocked = module.status === 'locked';
            return (
              <div 
                key={module.id}
                className={`lg:col-span-4 bg-surface-container-low rounded-xl p-6 md:p-8 flex flex-col justify-between group ${
                  isLocked ? 'opacity-60' : 'hover:-translate-y-1 transition-transform'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                      module.difficulty === 'beginner' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                      module.difficulty === 'intermediate' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                      'bg-primary-fixed text-on-primary-fixed'
                    }`}>
                      {module.difficulty}
                    </span>
                    <span className={`font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 ${
                      module.status === 'completed' ? 'text-tertiary' :
                      module.status === 'in_progress' ? 'text-primary' :
                      'text-on-surface-variant opacity-40'
                    }`}>
                      {isLocked ? <Lock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {module.status === 'completed' ? 'Completed' : 
                       module.status === 'in_progress' ? 'In Progress' : 'Locked'}
                    </span>
                  </div>
                  <h2 className="font-headline text-xl md:text-2xl font-bold mb-3 md:mb-4">{module.title}</h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4 md:mb-6">
                    {module.description}
                  </p>
                  <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50 mb-2">
                    EST. TIME: {module.timeEstimate}
                  </div>
                </div>
                {isLocked ? (
                  <button disabled className="w-full py-3 md:py-4 bg-surface-container-high text-slate-400 rounded-lg font-bold text-sm tracking-widest uppercase cursor-not-allowed">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Locked
                  </button>
                ) : (
                  <Link 
                    href="/library"
                    className="w-full py-3 md:py-4 bg-brand-gradient text-white rounded-lg font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all text-center block"
                  >
                    {module.status === 'completed' ? 'Review' : 'Continue Path'}
                  </Link>
                )}
              </div>
            );
          })}

          {/* Wide Card - Next Frontier */}
          <div className="md:col-span-2 lg:col-span-8 bg-brand-gradient rounded-xl p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-10 text-white overflow-hidden relative">
            <div className="relative z-10 flex-1">
              <h3 className="text-2xl md:text-3xl font-headline italic mb-3 md:mb-4">The Next Frontier</h3>
              <p className="text-white/80 leading-relaxed mb-6 md:mb-8 max-w-md text-sm md:text-base">
                Upon completing this module, you&apos;ll unlock the &quot;System Architect&quot; series, where algorithms meet global scalability.
              </p>
              <div className="flex gap-4">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-[10px] font-bold">
                    A
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-[10px] font-bold">
                    B
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-[10px] font-bold">
                    C
                  </div>
                </div>
                <div className="text-xs">
                  <p className="font-bold">1.2k+ Students</p>
                  <p className="opacity-70">Already on this path</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 md:w-1/3 text-center md:text-right">
              <Database className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto md:ml-auto opacity-20" />
            </div>
            {/* Artistic overlay */}
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl -mr-16 md:-mr-32 -mt-16 md:-mt-32"></div>
          </div>

          {/* Remaining Modules */}
          {modules.slice(3).map((module) => {
            const Icon = module.icon;
            const isLocked = module.status === 'locked';
            return (
              <div 
                key={module.id}
                className={`lg:col-span-4 bg-surface-container-low rounded-xl p-6 md:p-8 group ${isLocked ? 'opacity-60' : 'hover:-translate-y-1 transition-transform'}`}
              >
                <div className="mb-4 md:mb-6 flex justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                    module.difficulty === 'beginner' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                    module.difficulty === 'intermediate' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                    'bg-primary-fixed text-on-primary-fixed'
                  }`}>
                    {module.difficulty}
                  </span>
                  <span className={`font-bold text-[10px] uppercase tracking-widest ${isLocked ? 'opacity-40' : ''}`}>
                    {isLocked ? 'Locked' : module.status === 'completed' ? 'Completed' : 'Available'}
                  </span>
                </div>
                <h2 className="font-headline text-xl md:text-2xl font-bold mb-3 md:mb-4">{module.title}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4 md:mb-6">
                  {module.description}
                </p>
                <div className="pt-4 md:pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{module.timeEstimate}</span>
                  {isLocked ? (
                    <span className="text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                  ) : (
                    <Link 
                      href="/library"
                      className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Details <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Aesthetic Footer Text */}
        <footer className="mt-16 md:mt-24 text-center">
          <div className="w-12 h-12 md:w-16 h-16 bg-primary mx-auto mb-6 md:mb-8 rounded-full opacity-20"></div>
          <p className="font-headline italic text-xl md:text-2xl text-on-surface-variant opacity-60 max-w-md mx-auto px-4">
            &ldquo;Code is poetry written for machines, but designed for minds.&rdquo;
          </p>
          <p className="font-label text-[10px] uppercase tracking-[0.4em] mt-4 md:mt-6 opacity-40">
            Bit by Bit Coding © 2026
          </p>
        </footer>
      </main>

      <BottomNavBar />
    </div>
  );
}
