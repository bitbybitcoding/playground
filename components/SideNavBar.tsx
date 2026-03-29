'use client';

import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Bug, 
  Puzzle, 
  Settings, 
  Terminal, 
  Receipt,
  Play
} from 'lucide-react';

interface SideNavBarProps {
  activeTab?: 'files' | 'search' | 'debugger' | 'extensions' | 'settings';
  onRunCode?: () => void;
  showTerminal?: boolean;
}

export default function SideNavBar({ 
  activeTab = 'files', 
  onRunCode,
  showTerminal = true 
}: SideNavBarProps) {
  const [active, setActive] = useState(activeTab);

  const navItems = [
    { id: 'files', icon: FileText, label: 'Files' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'debugger', icon: Bug, label: 'Debugger' },
    { id: 'extensions', icon: Puzzle, label: 'Extensions' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[#f5f3ef] flex flex-col py-6 border-r border-outline-variant/15 z-40 hidden lg:flex">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-label font-bold text-sm text-on-surface">Python: Language</h3>
            <p className="font-label text-[10px] uppercase tracking-widest text-slate-500">LEVEL 1 • 15 MINS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-l-lg font-label text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-surface-container-lowest text-primary font-bold'
                  : 'text-slate-500 hover:bg-white/50 hover:translate-x-1'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-6 space-y-4">
        <div className="p-4 bg-primary-fixed/30 rounded-xl border border-primary/10">
          <p className="text-xs font-label text-on-primary-fixed-variant leading-relaxed">
            Need help? Review the <span className="font-bold underline decoration-primary/30">Logic Lessons</span> first.
          </p>
        </div>
        
        <button
          onClick={onRunCode}
          className="w-full py-3 bg-bit-green text-[#1b1c1a] font-label font-bold rounded-lg hover:brightness-105 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Run Code
        </button>

        {showTerminal && (
          <div className="flex justify-around border-t border-outline-variant/15 pt-4">
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <Terminal className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Terminal</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <Receipt className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Output</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
