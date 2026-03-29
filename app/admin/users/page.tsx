'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TopNavBar from '@/components/TopNavBar';
import { 
  Search, 
  ArrowLeft, 
  User,
  Mail,
  Calendar,
  Award,
  Clock,
  MoreHorizontal,
  Shield,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'admin';
  impact_points: number;
  weekly_hours: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  async function checkAdminAndFetchUsers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setUserRole('admin');
    fetchUsers();
  }

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setUsers(data);
    }
    setLoading(false);
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Error updating role: ' + error.message);
      return;
    }

    fetchUsers();
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    admins: users.filter(u => u.role === 'admin').length,
    totalPoints: users.reduce((acc, u) => acc + (u.impact_points || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole={userRole} />
      
      <main className="lg:ml-0 pt-24 px-4 md:px-8 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-black text-on-surface">
                  Users
                </h1>
                <p className="text-sm text-slate-500">
                  Manage student and admin accounts
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-lowest p-4 rounded-xl">
              <p className="text-2xl font-black text-primary">{stats.total}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Users</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl">
              <p className="text-2xl font-black text-tertiary">{stats.students}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Students</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl">
              <p className="text-2xl font-black text-bit-lavender">{stats.admins}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Admins</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl">
              <p className="text-2xl font-black text-bit-green">{stats.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Points</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Users Table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Impact Points</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Weekly Hours</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-low/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.full_name || 'Unnamed User'}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-bit-lavender" />
                          <span className="text-sm">{user.impact_points || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-tertiary" />
                          <span className="text-sm">{user.weekly_hours || 0}h</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleRole(user.id, user.role)}
                            className={`p-2 transition-colors ${
                              user.role === 'admin' 
                                ? 'text-primary hover:text-secondary' 
                                : 'text-slate-400 hover:text-primary'
                            }`}
                            title={user.role === 'admin' ? 'Demote to student' : 'Promote to admin'}
                          >
                            {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No users found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
