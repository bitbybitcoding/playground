'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Library, Terminal, Heart, User } from 'lucide-react';

export default function BottomNavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/library', icon: Library, label: 'Library' },
    { href: '/workspace', icon: Terminal, label: 'Code' },
    { href: '/masters-path', icon: Heart, label: 'Impact' },
    { href: '/dashboard', icon: User, label: 'Account' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#fbf9f5]/90 backdrop-blur-md h-16 flex justify-around items-center px-4 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={`flex flex-col items-center ${
              active ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" fill={active ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
