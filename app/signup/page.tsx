'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, Key, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Validate invite code
      const { data: codeData, error: codeError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', inviteCode)
        .single();

      if (codeError || !codeData) {
        setError('Invalid invite code. Please check and try again.');
        setLoading(false);
        return;
      }

      if (codeData.used) {
        setError('This invite code has already been used.');
        setLoading(false);
        return;
      }

      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        setError('This invite code has expired.');
        setLoading(false);
        return;
      }

      // Step 2: Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'student',
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      // Step 3: Mark invite code as used
      const { error: updateError } = await supabase
        .from('invite_codes')
        .update({
          used: true,
          used_by: authData.user.id,
          used_at: new Date().toISOString(),
          use_count: codeData.use_count + 1,
        })
        .eq('id', codeData.id);

      if (updateError) {
        console.error('Failed to update invite code:', updateError);
      }

      setSuccess(true);
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-bit-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-bit-green" />
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface mb-4">
            Welcome to BbB!
          </h1>
          <p className="text-on-surface-variant mb-6">
            Your account has been created successfully. Redirecting to your dashboard...
          </p>
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-black text-primary italic tracking-tight">
              Bit by Bit Coding
            </span>
          </Link>
          <p className="text-on-surface-variant mt-2 font-label">
            Join our community of learners
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-lg">
          <h1 className="font-display text-2xl font-bold text-on-surface mb-2">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 font-label mb-6">
            You need an invite code to join. Request one from your tutor or admin.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-on-error-container">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="inviteCode" className="block font-label font-bold text-sm text-on-surface mb-2">
                Invite Code <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="BBB-XXXXXXXX"
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-label uppercase tracking-wider"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block font-label font-bold text-sm text-on-surface mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-label"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-label font-bold text-sm text-on-surface mb-2">
                Email Address <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-label"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block font-label font-bold text-sm text-on-surface mb-2">
                Password <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-12 pr-12 py-3 bg-surface-container-low rounded-lg border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-label"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                id="terms" 
                className="w-4 h-4 mt-0.5 rounded border-outline-variant text-primary focus:ring-primary"
                required
              />
              <label htmlFor="terms" className="text-sm text-slate-500 font-label">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-lg font-label font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-outline-variant/20 text-center">
            <p className="text-sm text-slate-500 font-label">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-400 font-label hover:text-on-surface transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
