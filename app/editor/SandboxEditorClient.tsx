'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Play, Terminal, X, RotateCcw, Receipt } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
}

declare global {
  interface Window {
    loadPyodide?: (options: {
      indexURL: string;
      stdout?: (text: string) => void;
      stderr?: (text: string) => void;
    }) => Promise<PyodideInstance>;
  }
}

const DEFAULT_CODE = `# Python Sandbox — write and run any Python code here
print("Hello, world!")
`;

export default function SandboxEditorClient() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<PyodideInstance | null>(null);
  const [pyodideLoading, setPyodideLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'terminal' | 'output'>('terminal');
  const outputRef = useRef<HTMLDivElement>(null);
  const liveOutputRef = useRef<string[]>([]);

  const loadPyodideScript = useCallback(async () => {
    if (typeof window === 'undefined' || window.loadPyodide) return;
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide-runtime="true"]');
      if (existing) {
        if (window.loadPyodide) { resolve(); return; }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Script load failed')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      script.async = true;
      script.dataset.pyodideRuntime = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Script load failed'));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        await loadPyodideScript();
        if (!window.loadPyodide) throw new Error('Pyodide unavailable');
        const instance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          stdout: (text) => {
            if (mounted) {
              liveOutputRef.current.push(text);
              setOutput(p => [...p, text]);
            }
          },
          stderr: (text) => {
            if (mounted) {
              const l = `Error: ${text}`;
              liveOutputRef.current.push(l);
              setOutput(p => [...p, l]);
            }
          },
        });
        if (mounted) {
          setPyodide(instance);
          setPyodideLoading(false);
        }
      } catch {
        if (mounted) {
          setPyodideLoading(false);
          setOutput(['Failed to load Python runtime. Please refresh.']);
        }
      }
    }
    init();
    return () => { mounted = false; };
  }, [loadPyodideScript]);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  const runCode = async () => {
    if (!pyodide || isRunning) return;
    setIsRunning(true);
    liveOutputRef.current = ['$ python main.py'];
    setOutput(['$ python main.py']);
    setActiveTab('terminal');
    try {
      await pyodide.runPythonAsync(code);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      const line = `Error: ${message}`;
      liveOutputRef.current.push(line);
      setOutput(p => [...p, line]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="pt-16 h-screen flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-surface overflow-hidden">
        <section className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          {/* File Tab Bar */}
          <div className="flex items-center gap-4 mb-4 font-label text-xs font-bold text-slate-400 uppercase tracking-widest overflow-x-auto">
            <span className="flex items-center gap-1 text-primary bg-primary/5 px-2 py-1 rounded">
              <span className="material-symbols-outlined text-sm">code</span> main.py
            </span>
            <button
              onClick={() => setCode(DEFAULT_CODE)}
              className="flex items-center gap-1 hover:text-slate-600"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <div className="flex-1" />
            <span className="text-slate-400 italic text-[10px]">Python Sandbox</span>
          </div>

          {/* Editor + Terminal */}
          <div className="flex-1 bg-surface-dim rounded-xl overflow-hidden flex flex-col shadow-inner min-h-[300px]">
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                height="100%"
                language="python"
                value={code}
                onChange={(v) => setCode(v || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 },
                  fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                }}
              />
            </div>

            {/* Terminal */}
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
                <button onClick={() => setOutput([])} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div ref={outputRef} className="space-y-1 h-[calc(100%-2rem)] overflow-y-auto">
                {output.length === 0 ? (
                  <p className="text-slate-500 italic">
                    {pyodideLoading ? 'Loading Python runtime...' : 'Click "Run Code" to execute...'}
                  </p>
                ) : (
                  output.map((line, i) => (
                    <p
                      key={i}
                      className={
                        line.startsWith('Error:')
                          ? 'text-bit-red'
                          : line.startsWith('$')
                          ? 'text-slate-500'
                          : 'text-tertiary-fixed'
                      }
                    >
                      {line}
                    </p>
                  ))
                )}
                {isRunning && <p className="text-slate-500 animate-pulse">_</p>}
              </div>
            </div>
          </div>

          {/* Run Button */}
          <div className="mt-4">
            <button
              onClick={runCode}
              disabled={isRunning || pyodideLoading}
              className="w-full bg-bit-green text-[#1b1c1a] py-3 rounded-lg font-label font-bold hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRunning || pyodideLoading ? (
                <span className="w-4 h-4 border-2 border-[#1b1c1a]/30 border-t-[#1b1c1a] rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {pyodideLoading ? 'Loading runtime...' : isRunning ? null : 'Run Code'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
