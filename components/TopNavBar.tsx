'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell, Settings, Menu, X } from 'lucide-react';

interface TopNavBarProps {
  userRole?: 'student' | 'admin' | null;
}

export default function TopNavBar({ userRole }: TopNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; email: string } | null>(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    getProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path === '/library' && pathname === '/library') return true;
    if (path === '/workspace' && pathname === '/workspace') return true;
    if (path === '/admin' && pathname.startsWith('/admin')) return true;
    return false;
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/library', label: 'Library' },
    { href: '/workspace', label: 'Projects' },
    ...(userRole === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 md:px-8 h-16 bg-[#fbf9f5]/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="font-display text-xl md:text-2xl font-black text-primary italic tracking-tight">
          Bit by Bit Coding
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-label font-medium transition-colors duration-200 ${
                isActive(link.href)
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-slate-600 hover:text-bit-lavender'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          <button className="text-slate-600 hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-slate-600 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full cursor-pointer hover:bg-surface-container-high transition-colors">
            <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden">
              <span className="text-primary font-bold text-sm">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="font-label font-bold text-sm text-on-surface">
              {profile?.full_name?.split(' ')[0] || 'Profile'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-500 font-label font-medium hover:text-secondary transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#fbf9f5] border-b border-outline-variant/15 md:hidden">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 font-label font-medium ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-slate-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="py-3 text-left text-secondary font-label font-medium"
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
