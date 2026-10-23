'use client';

import React, { useState } from 'react';
import { SolutionProject } from '@/lib/scaffold/types';
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  Lightbulb, 
  Send 
} from 'lucide-react';

interface AiArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: SolutionProject;
  onApplySolution: (solution: SolutionProject) => void;
}

export function AiArchitectModal({
  isOpen,
  onClose,
  solution,
  onApplySolution,
}: AiArchitectModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'Logistics & Fleet Dispatch with Vehicle Status Metrics, Driver Table, and Trip Route Form',
    'Healthcare Patient Portal with Appointment Schedule, Vitals Chart, and Intake Form',
    'Real Estate Property Grid with Deal Value KPI, Filter by Zipcode, and Inquiry Form',
  ];

  const handleGenerate = async (targetPrompt: string) => {
    const query = targetPrompt || prompt;
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, currentSolution: solution }),
      });

      const data = await res.json();

      if (data.success && data.solution) {
        onApplySolution({
          ...solution,
          name: data.solution.name || solution.name,
          description: data.solution.description || solution.description,
          databaseDriver: data.solution.databaseDriver || solution.databaseDriver,
          blocs: data.solution.blocs && data.solution.blocs.length > 0 ? data.solution.blocs : solution.blocs,
        });
        onClose();
      } else {
        // Fallback: rule-based enrichment
        setErrorMsg(data.error || 'AI generation failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error communicating with AI Architect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Solution Architect</h2>
              <p className="text-xs text-slate-400">Describe your domain problem to scaffold classes, views, models & routes.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Scaffold a multi-warehouse logistics grid with stock count metrics, transfer orders table, and dispatch action form..."
            className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Suggested Blueprints:
            </span>
            <div className="flex flex-col gap-1.5">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrompt(qp);
                    handleGenerate(qp);
                  }}
                  className="text-left p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500 text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  &ldquo;{qp}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || !prompt.trim()}
              onClick={() => handleGenerate(prompt)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{loading ? 'Architecting...' : 'Generate Solution'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
