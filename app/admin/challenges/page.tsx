'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TopNavBar from '@/components/TopNavBar';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  constraints: string | null;
  starter_code: string;
  test_cases: { input: string; expected: string }[];
  expected_output: string | null;
  time_estimate: number;
  points: number;
  is_published: boolean;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  constraints: string;
  starter_code: string;
  test_cases: string;
  expected_output: string;
  time_estimate: number;
  points: number;
  is_published: boolean;
}

const defaultForm: FormData = {
  title: '',
  description: '',
  difficulty: 'beginner',
  category: 'Python',
  constraints: '',
  starter_code: '# Write your starter code here\n',
  test_cases: '[{"input": "", "expected": ""}]',
  expected_output: '',
  time_estimate: 30,
  points: 10,
  is_published: true,
};

export default function AdminChallengesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultForm);

  useEffect(() => {
    checkAdminAndFetchChallenges();
  }, []);

  async function checkAdminAndFetchChallenges() {
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
    fetchChallenges();
  }

  async function fetchChallenges() {
    setLoading(true);
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setChallenges(data as Challenge[]);
    }
    setLoading(false);
  }

  function openModal(challenge?: Challenge) {
    if (challenge) {
      setEditingChallenge(challenge);
      setFormData({
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        constraints: challenge.constraints || '',
        starter_code: challenge.starter_code,
        test_cases: JSON.stringify(challenge.test_cases || [], null, 2),
        expected_output: challenge.expected_output || '',
        time_estimate: challenge.time_estimate,
        points: challenge.points,
        is_published: challenge.is_published,
      });
    } else {
      setEditingChallenge(null);
      setFormData(defaultForm);
    }
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let parsedTestCases;
    try {
      parsedTestCases = JSON.parse(formData.test_cases);
    } catch {
      alert('Invalid JSON in Test Cases. Please check the format and try again.');
      return;
    }
    const challengeData = {
      ...formData,
      test_cases: parsedTestCases,
    };

    if (editingChallenge) {
      const { error } = await supabase
        .from('challenges')
        .update(challengeData)
        .eq('id', editingChallenge.id);

      if (error) {
        alert('Error updating challenge: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('challenges')
        .insert([challengeData]);

      if (error) {
        alert('Error creating challenge: ' + error.message);
        return;
      }
    }

    setShowModal(false);
    fetchChallenges();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting challenge: ' + error.message);
      return;
    }

    fetchChallenges();
  }

  async function togglePublish(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('challenges')
      .update({ is_published: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating challenge: ' + error.message);
      return;
    }

    fetchChallenges();
  }

  const filteredChallenges = challenges.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  Challenges
                </h1>
                <p className="text-sm text-slate-500">
                  Manage coding challenges and exercises
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-primary text-white rounded-lg font-label font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Challenge
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Challenges Table */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Difficulty</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Points</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredChallenges.map((challenge) => (
                    <tr key={challenge.id} className="hover:bg-surface-container-low/50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{challenge.title}</p>
                        <p className="text-xs text-slate-500">{challenge.time_estimate} mins</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{challenge.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          challenge.difficulty === 'beginner' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                          challenge.difficulty === 'intermediate' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                          'bg-primary-fixed text-on-primary-fixed'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{challenge.points}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePublish(challenge.id, challenge.is_published)}
                          className={`flex items-center gap-1 text-sm ${
                            challenge.is_published ? 'text-tertiary' : 'text-slate-400'
                          }`}
                        >
                          {challenge.is_published ? (
                            <><CheckCircle className="w-4 h-4" /> Published</>
                          ) : (
                            <><XCircle className="w-4 h-4" /> Draft</>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(challenge)}
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(challenge.id)}
                            className="p-2 text-slate-400 hover:text-secondary transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredChallenges.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No challenges found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="font-display text-xl font-bold">
                {editingChallenge ? 'Edit Challenge' : 'New Challenge'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time (mins)</label>
                  <input
                    type="number"
                    value={formData.time_estimate}
                    onChange={(e) => {
                      const parsedValue = Number(e.target.value);
                      setFormData({
                        ...formData,
                        time_estimate: Number.isNaN(parsedValue)
                          ? formData.time_estimate
                          : Math.max(0, parsedValue),
                      });
                    }}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Points</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => {
                      const parsedValue = Number(e.target.value);
                      setFormData({
                        ...formData,
                        points: Number.isNaN(parsedValue)
                          ? formData.points
                          : Math.max(0, parsedValue),
                      });
                    }}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Constraints</label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Starter Code</label>
                <textarea
                  value={formData.starter_code}
                  onChange={(e) => setFormData({ ...formData, starter_code: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Test Cases (JSON)</label>
                <textarea
                  value={formData.test_cases}
                  onChange={(e) => setFormData({ ...formData, test_cases: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expected Output</label>
                <input
                  type="text"
                  value={formData.expected_output}
                  onChange={(e) => setFormData({ ...formData, expected_output: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="is_published" className="text-sm">Publish immediately</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-medium hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingChallenge ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
