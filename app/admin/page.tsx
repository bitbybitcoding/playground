import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';
import { 
  Users, 
  Code, 
  Key, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalChallenges } = await supabase
    .from('challenges')
    .select('*', { count: 'exact', head: true });

  const { count: activeCodes } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact', head: true })
    .eq('used', false);

  const { count: completedProgress } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent challenges
  const { data: recentChallenges } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { 
      label: 'Total Users', 
      value: totalUsers || 0, 
      icon: Users, 
      color: 'primary',
      href: '/admin/users'
    },
    { 
      label: 'Challenges', 
      value: totalChallenges || 0, 
      icon: Code, 
      color: 'tertiary',
      href: '/admin/challenges'
    },
    { 
      label: 'Active Codes', 
      value: activeCodes || 0, 
      icon: Key, 
      color: 'bit-lavender',
      href: '/admin/invite-codes'
    },
    { 
      label: 'Completions', 
      value: completedProgress || 0, 
      icon: CheckCircle, 
      color: 'bit-green',
      href: '#'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole="admin" />
      
      <main className="lg:ml-0 pt-24 px-4 md:px-8 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-black text-on-surface mb-2">
              Admin Dashboard
            </h1>
            <p className="text-on-surface-variant">
              Manage users, challenges, and invite codes for Bit by Bit Coding.
            </p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-container-low transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                    stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                    stat.color === 'tertiary' ? 'bg-tertiary/10 text-tertiary' :
                    stat.color === 'bit-lavender' ? 'bg-bit-lavender/10 text-bit-lavender' :
                    'bg-bit-green/10 text-tertiary'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-black text-on-surface mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-500 font-label">{stat.label}</p>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-xl p-6 mb-8">
            <h2 className="font-display text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/challenges"
                className="px-4 py-2 bg-primary text-white rounded-lg font-label font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                New Challenge
              </Link>
              <Link
                href="/admin/invite-codes"
                className="px-4 py-2 bg-tertiary text-white rounded-lg font-label font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Generate Code
              </Link>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-label font-medium text-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                View Users
              </Link>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold">Recent Users</h2>
                <Link 
                  href="/admin/users"
                  className="text-primary text-sm font-label font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentUsers?.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.full_name || 'Unnamed User'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
                {(!recentUsers || recentUsers.length === 0) && (
                  <p className="text-center text-slate-500 py-4">No users yet</p>
                )}
              </div>
            </div>

            {/* Recent Challenges */}
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold">Recent Challenges</h2>
                <Link 
                  href="/admin/challenges"
                  className="text-primary text-sm font-label font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentChallenges?.map((challenge) => (
                  <div 
                    key={challenge.id}
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{challenge.title}</p>
                      <p className="text-xs text-slate-500">
                        {challenge.category} • {challenge.difficulty}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      challenge.is_published ? 'bg-bit-green/20 text-tertiary' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {challenge.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
                {(!recentChallenges || recentChallenges.length === 0) && (
                  <p className="text-center text-slate-500 py-4">No challenges yet</p>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8 bg-surface-container-low rounded-xl p-6">
            <h2 className="font-display text-xl font-bold mb-4">System Status</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-lg">
                <div className="w-8 h-8 rounded-full bg-bit-green/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-tertiary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Database</p>
                  <p className="text-xs text-slate-500">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-lg">
                <div className="w-8 h-8 rounded-full bg-bit-green/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-tertiary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Authentication</p>
                  <p className="text-xs text-slate-500">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-lg">
                <div className="w-8 h-8 rounded-full bg-bit-green/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-tertiary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Python Runtime</p>
                  <p className="text-xs text-slate-500">Operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
