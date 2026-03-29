'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TopNavBar from '@/components/TopNavBar';
import { generateInviteCode } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  Copy,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface InviteCode {
  id: string;
  code: string;
  used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  expires_at: string | null;
  max_uses: number;
  use_count: number;
}

export default function AdminInviteCodesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generateExpiry, setGenerateExpiry] = useState('');

  useEffect(() => {
    checkAdminAndFetchCodes();
  }, []);

  async function checkAdminAndFetchCodes() {
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
    fetchCodes();
  }

  async function fetchCodes() {
    setLoading(true);
    const { data } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setCodes(data);
    }
    setLoading(false);
  }

  async function generateCodes() {
    const newCodes = [];
    for (let i = 0; i < generateCount; i++) {
      newCodes.push({
        code: generateInviteCode(),
        expires_at: generateExpiry || null,
        max_uses: 1,
      });
    }

    const { error } = await supabase
      .from('invite_codes')
      .insert(newCodes);

    if (error) {
      alert('Error generating codes: ' + error.message);
      return;
    }

    setShowGenerateModal(false);
    fetchCodes();
  }

  async function revokeCode(id: string) {
    if (!confirm('Are you sure you want to revoke this code?')) return;

    const { error } = await supabase
      .from('invite_codes')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error revoking code: ' + error.message);
      return;
    }

    fetchCodes();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: codes.length,
    used: codes.filter(c => c.used).length,
    active: codes.filter(c => !c.used).length,
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
                  Invite Codes
                </h1>
                <p className="text-sm text-slate-500">
                  Generate and manage access codes for new users
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-label font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Codes
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-surface-container-lowest p-4 rounded-xl">
              <p className="text-2xl font-black text-primary">{stats.total}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl">
              <p className="text-2xl font-black text-bit-green">{stats.active}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Active</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl">
              <p className="text-2xl font-black text-slate-400">{stats.used}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Used</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Codes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCodes.map((code) => (
              <div 
                key={code.id}
                className={`bg-surface-container-lowest rounded-xl p-5 border-2 transition-all ${
                  code.used 
                    ? 'border-slate-100 opacity-60' 
                    : 'border-bit-green/30 hover:border-bit-green'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    code.used 
                      ? 'bg-slate-100 text-slate-500' 
                      : 'bg-bit-green/20 text-tertiary'
                  }`}>
                    {code.used ? 'Used' : 'Active'}
                  </div>
                  <div className="flex gap-1">
                    {!code.used && (
                      <button
                        onClick={() => copyCode(code.code)}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === code.code ? (
                          <CheckCircle className="w-4 h-4 text-bit-green" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => revokeCode(code.id)}
                      className="p-1.5 text-slate-400 hover:text-secondary transition-colors"
                      title="Revoke code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-mono text-lg font-bold tracking-wider text-on-surface">
                    {code.code}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Created {new Date(code.created_at).toLocaleDateString()}</span>
                  </div>
                  {code.expires_at && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3 h-3" />
                      <span>Expires {new Date(code.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {code.used && (
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>Used on {new Date(code.used_at!).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredCodes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No codes found</p>
            </div>
          )}
        </div>
      </main>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6">
            <h2 className="font-display text-xl font-bold mb-4">Generate Invite Codes</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Number of Codes</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={generateExpiry}
                  onChange={(e) => setGenerateExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-medium hover:bg-surface-container-highest transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateCodes}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
