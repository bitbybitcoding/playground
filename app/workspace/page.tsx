import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import BottomNavBar from '@/components/BottomNavBar';
import Link from 'next/link';
import { 
  Plus, 
  ArrowRight, 
  Terminal,
  Folder,
  FileText,
  Database,
  Code,
  ChevronRight
} from 'lucide-react';

export default async function WorkspacePage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_progress')
      .select('*, challenges(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
  ]);

  const recentChallenges = (projects || [])
    .map((project) => project.challenges)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole={profile?.role} />
      
      <main className="lg:ml-0 pt-24 px-4 md:px-12 pb-24 md:pb-16 min-h-screen">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-4 block">
              WORKSPACE ARCHIVE
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-black text-on-surface leading-tight tracking-tight">
              Crafting the future,<br />
              <span className="text-primary italic">Bit by Bit.</span>
            </h1>
            <p className="font-body text-slate-500 mt-4 md:mt-6 max-w-md leading-relaxed">
              Your digital atelier for architectural code and community-driven innovation. 
              Manage your personal journey or collaborate on global impact.
            </p>
          </div>
          <div>
            <Link 
              href="/library"
              className="bg-gradient-to-br from-primary to-bit-lavender text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/10 text-sm md:text-base"
            >
              <Plus className="w-5 h-5" />
              Start New Project
            </Link>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* My Projects Section (Large Span) */}
          <section className="col-span-1 lg:col-span-8 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h2 className="font-display text-xl md:text-2xl font-bold italic">My Projects</h2>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-xs font-bold font-label text-slate-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Personal
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold font-label text-slate-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span> Community
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Project Cards */}
              {projects?.slice(0, 4).map((project, idx) => (
                <div 
                  key={project.id}
                  className="group bg-surface-container-lowest p-5 md:p-6 rounded-2xl hover:bg-surface-container-low transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl ${
                      idx % 2 === 0 ? 'bg-primary-fixed text-primary' : 'bg-tertiary/10 text-tertiary'
                    }`}>
                      {idx % 3 === 0 ? <Code className="w-5 h-5 md:w-6 md:h-6" /> :
                       idx % 3 === 1 ? <Database className="w-5 h-5 md:w-6 md:h-6" /> :
                       <FileText className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                    <span className={`px-2 md:px-3 py-1 text-[10px] font-bold font-label uppercase tracking-widest rounded-full ${
                      project.status === 'completed' 
                        ? 'bg-bit-green/20 text-tertiary' 
                        : project.status === 'in_progress'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary/10 text-secondary'
                    }`}>
                      {project.status === 'completed' ? 'Published' : 
                       project.status === 'in_progress' ? 'In Progress' : 'Under Review'}
                    </span>
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {project.challenges?.title || `Project ${idx + 1}`}
                  </h3>
                  <p className="text-slate-500 text-sm font-body mb-4 md:mb-6 line-clamp-1">
                    {project.challenges?.category || 'Python'} • {project.challenges?.difficulty || 'Beginner'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                    <span className="text-xs font-label text-slate-400">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                    <Link 
                      href={`/editor/${project.challenge_id}`}
                      className="text-slate-400 hover:text-primary transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {(!projects || projects.length === 0) && (
                <div className="col-span-full bg-surface-container-lowest p-8 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">No projects yet</h3>
                  <p className="text-slate-500 mb-4">Start your coding journey by exploring challenges</p>
                  <Link 
                    href="/library"
                    className="text-primary font-bold hover:underline inline-flex items-center gap-2"
                  >
                    Browse Challenges <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Featured Project Card */}
              {projects && projects.length > 0 && (
                <div className="group col-span-1 md:col-span-2 bg-surface-container-lowest p-6 md:p-8 rounded-2xl hover:bg-surface-container-low transition-all duration-300 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-bit-lavender/20 flex items-center justify-center">
                    <Code className="w-12 h-12 text-primary/40" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">
                        Latest Challenge
                      </h3>
                      <span className="px-2 md:px-3 py-1 bg-primary/10 text-[10px] font-bold font-label uppercase tracking-widest rounded-full text-primary">
                        Active
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-body mb-4 md:mb-6 leading-relaxed">
                      Continue working on your most recent challenge. Your progress is automatically saved.
                    </p>
                    <div className="flex gap-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-primary">
                          Y
                        </div>
                      </div>
                      <span className="text-xs font-label text-slate-400 flex items-center">
                        Last edited recently
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar Content */}
          <section className="col-span-1 lg:col-span-4 space-y-6 md:space-y-8">
            {/* Quick Stats */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
              <h3 className="font-display text-lg font-bold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-surface-container-low rounded-lg">
                  <p className="text-2xl font-black text-primary">{projects?.filter(p => p.status === 'completed').length || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Completed</p>
                </div>
                <div className="text-center p-3 bg-surface-container-low rounded-lg">
                  <p className="text-2xl font-black text-tertiary">{projects?.filter(p => p.status === 'in_progress').length || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">In Progress</p>
                </div>
              </div>
            </div>

            {recentChallenges.length > 0 && (
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                <h3 className="font-display text-lg font-bold mb-4">Recent Challenge Topics</h3>
                <div className="space-y-3">
                  {recentChallenges.map((challenge: any) => (
                    <div key={challenge.id} className="flex items-center justify-between">
                      <p className="text-sm font-medium line-clamp-1">{challenge.title}</p>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        {challenge.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer Identity */}
      <footer className="px-4 md:px-12 py-8 md:py-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
        <p className="font-display italic font-bold text-sm md:text-base">Bit by Bit Coding © 2026</p>
        <div className="flex gap-4 md:gap-8 font-label text-xs uppercase tracking-widest font-bold">
          <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Support</Link>
        </div>
      </footer>

      <BottomNavBar />
    </div>
  );
}
