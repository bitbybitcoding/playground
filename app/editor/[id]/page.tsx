'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopNavBar from '@/components/TopNavBar';
import SideNavBar from '@/components/SideNavBar';
import BottomNavBar from '@/components/BottomNavBar';
import { createClient } from '@/lib/supabase/client';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  ChevronRight,
  Terminal,
  Receipt,
  X,
  Clock
} from 'lucide-react';
import Link from 'next/link';

// Dynamic import for Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  constraints: string | null;
  starter_code: string;
  test_cases: any[];
  expected_output: string | null;
  time_estimate: number;
  points: number;
}

interface PyodideInstance {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packageName: string) => Promise<void>;
  isPyProxy: (obj: unknown) => boolean;
  pyimport: (name: string) => unknown;
}

export default function EditorPage() {
  const params = useParams();
  const challengeId = params.id as string;
  const supabase = useMemo(() => createClient(), []);
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<PyodideInstance | null>(null);
  const [pyodideLoading, setPyodideLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'terminal' | 'output'>('terminal');
  const [showTip, setShowTip] = useState(true);
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  
  const outputRef = useRef<HTMLDivElement>(null);
  // After the existing outputRef declaration, add:
  const liveOutputRef = useRef<string[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Pyodide
  useEffect(() => {
    let isMounted = true;
    
    async function loadPyodide() {
      try {
        setPyodideLoading(true);
        const { loadPyodide } = await import('pyodide');
        
        if (!isMounted) return;
        
        const instance = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          stdout: (text: string) => {
            if (isMounted) {
              liveOutputRef.current.push(text);
              setOutput(prev => [...prev, text]);
            }
          },
          stderr: (text: string) => {
            if (isMounted) {
              const line = `Error: ${text}`;
              liveOutputRef.current.push(line);
              setOutput(prev => [...prev, line]);
            }
          },
        });
        
        if (isMounted) {
          setPyodide(instance as unknown as PyodideInstance);
          setPyodideLoading(false);
        }
      } catch (error) {
        console.error('Failed to load Pyodide:', error);
        if (isMounted) {
          setPyodideLoading(false);
          setOutput(['Failed to load Python runtime. Please refresh the page.']);
        }
      }
    }

    loadPyodide();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch challenge and user data
  useEffect(() => {
    async function fetchData() {
      let existingCode: string | null = null;

      // Fetch user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || 'student');

        // Fetch user progress for this challenge
        const { data: progress } = await supabase
          .from('user_progress')
          .select('code')
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId)
          .maybeSingle();

        if (progress?.code) {
          existingCode = progress.code;
          setCode(progress.code);
        }
      }

      // Fetch challenge
      if (challengeId === 'default') {
        // Use a default challenge
        setChallenge({
          id: 'default',
          title: 'The Infinite Voyager',
          description: 'Welcome, Commander. Your starship needs an automated system to calculate the duration of deep-space jumps. Complete the calculate_journey function to accept two parameters: distance and speed.',
          difficulty: 'beginner',
          category: 'Python',
          constraints: 'Distance will always be a positive integer. Speed will be greater than zero. Return a formatted string as shown in the template.',
          starter_code: `def calculate_journey(distance, speed):
    # Calculate the total time taken
    time = distance / speed
    return f"Travel time: {time} hours"

# Test your function here
distance_input = 150
speed_input = 60

result = calculate_journey(distance_input, speed_input)
print(result)`,
          test_cases: [
            { input: 'calculate_journey(150, 60)', expected: 'Travel time: 2.5 hours' },
            { input: 'calculate_journey(300, 50)', expected: 'Travel time: 6.0 hours' }
          ],
          expected_output: 'Travel time: 2.5 hours',
          time_estimate: 15,
          points: 10
        });
        if (!existingCode) {
          setCode(`def calculate_journey(distance, speed):
    # Calculate the total time taken
    time = distance / speed
    return f"Travel time: {time} hours"

# Test your function here
distance_input = 150
speed_input = 60

result = calculate_journey(distance_input, speed_input)
print(result)`);
        }
      } else {
        const { data: challengeData } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();
        
        if (challengeData) {
          setChallenge(challengeData);
          if (!existingCode) {
            setCode(challengeData.starter_code || '');
          }
        }
      }
    }

    fetchData();
  }, [challengeId, supabase]);

  // Auto-save code
  const saveCode = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaveStatus('saving');

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        challenge_id: challengeId,
        code: code,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,challenge_id'
      });

    if (error) {
      console.error('Failed to save:', error);
      setSaveStatus('unsaved');
    } else {
      setSaveStatus('saved');
    }
  }, [code, challengeId, supabase]);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('unsaved');
    saveTimeoutRef.current = setTimeout(() => {
      saveCode();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [code, saveCode]);

  // Scroll to bottom of output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runCode = async () => {
    if (!pyodide || isRunning) return;

    setIsRunning(true);
    liveOutputRef.current = [];           // ← reset live output
    setOutput([]);
    setActiveTab('terminal');

    try {
      setOutput(['$ python main.py']);
      liveOutputRef.current = ['$ python main.py'];

      await pyodide.runPythonAsync(code);

      // Record attempt — fetch current count first, then increment
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('user_progress')
          .select('attempts')
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId)
          .maybeSingle();

        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            challenge_id: challengeId,
            code,
            status: 'attempted',
            attempts: (existing?.attempts ?? 0) + 1,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,challenge_id' });
      }
    } catch (error: any) {
      const errLine = `Error: ${error.message || 'Unknown error'}`;
      liveOutputRef.current.push(errLine);
      setOutput(prev => [...prev, errLine]);
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    if (challenge) {
      setCode(challenge.starter_code || '');
    }
  };

  const submitSolution = async () => {
    await runCode();

    // Use liveOutputRef — state is stale here, ref is not
    const lastOutput = liveOutputRef.current[liveOutputRef.current.length - 1] ?? '';

    if (
      challenge?.expected_output &&
      lastOutput.includes(challenge.expected_output)
    ) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            challenge_id: challengeId,
            code,
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,challenge_id' });

        // Fetch current profile values first, then increment
        const { data: profile } = await supabase
          .from('profiles')
          .select('impact_points, weekly_hours')
          .eq('id', user.id)
          .single();

        await supabase
          .from('profiles')
          .update({
            impact_points: (profile?.impact_points ?? 0) + challenge.points,
            weekly_hours:
              (profile?.weekly_hours ?? 0) +
              Math.round(challenge.time_estimate / 60),
          })
          .eq('id', user.id);
      }
    }
  };

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-label">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar userRole={userRole} />
      
      <main className="pt-16 h-screen flex overflow-hidden">
        <SideNavBar onRunCode={runCode} />
        
        <div className="lg:ml-64 flex-1 flex flex-col lg:flex-row bg-surface overflow-hidden">
          {/* Code Editor Section */}
          <section className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
            {/* File Tabs */}
            <div className="flex items-center gap-4 mb-4 font-label text-xs font-bold text-slate-400 uppercase tracking-widest overflow-x-auto">
              <span className="flex items-center gap-1 text-primary bg-primary/5 px-2 py-1 rounded whitespace-nowrap">
                <span className="material-symbols-outlined text-sm">code</span> main.py
              </span>
              <button 
                onClick={resetCode}
                className="flex items-center gap-1 hover:text-slate-600 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <div className="flex-1"></div>
              <span className={`text-xs ${saveStatus === 'saved' ? 'text-tertiary' : saveStatus === 'saving' ? 'text-primary' : 'text-slate-400'}`}>
                {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
              </span>
            </div>
            
            {/* Code Canvas */}
            <div className="flex-1 bg-surface-dim rounded-xl overflow-hidden flex flex-col shadow-inner min-h-[300px]">
              <div className="flex-1 overflow-hidden">
                {pyodideLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-label">Loading Python runtime...</p>
                    </div>
                  </div>
                ) : (
                  <MonacoEditor
                    height="100%"
                    language="python"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                      padding: { top: 16 },
                      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                    }}
                  />
                )}
              </div>
              
              {/* Terminal / Output */}
              <div className="h-1/3 bg-[#1b1c1a] p-4 text-white font-mono text-sm border-t border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-4 text-xs font-bold font-label uppercase tracking-widest text-slate-400">
                    <button 
                      onClick={() => setActiveTab('terminal')}
                      className={`flex items-center gap-2 ${activeTab === 'terminal' ? 'text-tertiary-fixed-dim' : ''}`}
                    >
                      <Terminal className="w-4 h-4" /> Terminal
                    </button>
                    <button 
                      onClick={() => setActiveTab('output')}
                      className={`flex items-center gap-2 ${activeTab === 'output' ? 'text-tertiary-fixed-dim' : ''}`}
                    >
                      <Receipt className="w-4 h-4" /> Output
                    </button>
                  </div>
                  <button 
                    onClick={() => setOutput([])}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div 
                  ref={outputRef}
                  className="space-y-1 h-[calc(100%-2rem)] overflow-y-auto"
                >
                  {output.length === 0 ? (
                    <p className="text-slate-500 italic">Click &quot;Run Code&quot; to see output...</p>
                  ) : (
                    output.map((line, idx) => (
                      <p 
                        key={idx} 
                        className={`${
                          line.startsWith('Error:') ? 'text-bit-red' : 
                          line.startsWith('$') ? 'text-slate-500' : 'text-tertiary-fixed'
                        }`}
                      >
                        {line}
                      </p>
                    ))
                  )}
                  {isRunning && <p className="text-slate-500 animate-pulse">_</p>}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={runCode}
                disabled={isRunning || pyodideLoading}
                className="flex-1 bg-bit-green text-[#1b1c1a] py-3 rounded-lg font-label font-bold hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRunning ? (
                  <span className="w-4 h-4 border-2 border-[#1b1c1a]/30 border-t-[#1b1c1a] rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run Code
              </button>
              <button
                onClick={submitSolution}
                disabled={isRunning || pyodideLoading}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-label font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Submit
              </button>
            </div>
          </section>
          
          {/* Problem Description Panel */}
          <aside className="w-full lg:w-80 xl:w-96 bg-surface-container-low p-6 lg:p-8 overflow-y-auto border-l border-outline-variant/15 max-h-[40vh] lg:max-h-none">
            <div className="mb-8">
              <span className="font-label text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-3 block">
                {challenge.category} • {challenge.difficulty}
              </span>
              <h1 className="font-display text-2xl lg:text-4xl font-bold text-on-surface leading-tight mb-4">
                {challenge.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {challenge.time_estimate} mins
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {challenge.points} points
                </span>
              </div>
            </div>
            
            <div className="space-y-6 text-on-surface-variant font-body leading-relaxed text-sm">
              <p>{challenge.description}</p>
              
              {challenge.constraints && (
                <div className="p-4 bg-surface-container-lowest rounded-lg border-l-4 border-primary">
                  <p className="font-label font-bold text-xs uppercase tracking-wider mb-2 text-primary">Constraints</p>
                  <p>{challenge.constraints}</p>
                </div>
              )}
              
              {challenge.test_cases && challenge.test_cases.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-label font-bold text-xs uppercase tracking-wider text-on-surface">Test Cases</h4>
                  <div className="space-y-2">
                    {challenge.test_cases.slice(0, 2).map((testCase, idx) => (
                      <div key={idx} className="p-3 bg-surface-container-lowest rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Input:</p>
                        <code className="text-xs bg-primary/5 px-1 rounded text-primary font-mono">{testCase.input}</code>
                        <p className="text-xs text-slate-500 mt-2 mb-1">Expected:</p>
                        <code className="text-xs bg-tertiary/5 px-1 rounded text-tertiary font-mono">{testCase.expected}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tip Box */}
              {showTip && (
                <div className="p-4 md:p-6 bg-gradient-to-br from-primary-fixed/20 to-surface-container-lowest rounded-2xl border border-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Lightbulb className="w-4 h-4" />
                      <span className="font-label font-bold text-xs uppercase tracking-widest">Pro Tip</span>
                    </div>
                    <button 
                      onClick={() => setShowTip(false)}
                      className="text-slate-400 hover:text-on-surface"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs italic text-on-primary-fixed-variant leading-relaxed">
                    Use &quot;f-strings&quot; to easily embed variables into your strings. It makes the code much more readable!
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-6 mt-6 border-t border-outline-variant/30">
              <Link 
                href="/library" 
                className="w-full flex justify-between items-center group text-slate-500 hover:text-primary transition-colors"
              >
                <span className="font-label font-bold text-sm">Back to Library</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
