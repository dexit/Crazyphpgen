'use client';

import React from 'react';
import { 
  Grid3X3, 
  Workflow, 
  Database, 
  Code2, 
  Play, 
  Download, 
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  Boxes,
  Compass,
  FileCode2,
  Table,
  Zap,
  Wrench
} from 'lucide-react';
import { PHPFramework, SolutionProject } from '@/lib/scaffold/types';
import { PRESET_SOLUTIONS } from '@/lib/scaffold/bloc-engine';

export type ActiveTab = 'grid' | 'three' | 'studio' | 'queue' | 'diagram' | 'uml' | 'database' | 'code' | 'sandbox';

interface HeaderProps {
  solution: SolutionProject;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSelectPreset: (preset: SolutionProject) => void;
  onFrameworkChange: (framework: PHPFramework) => void;
  onOpenAddModal: () => void;
  onOpenAiModal: () => void;
  onOpenSetupWizard: () => void;
  onDownloadZip: () => void;
  onCopyAllCode: () => void;
  copied: boolean;
  gridGuidesActive: boolean;
  onToggleGridGuides: () => void;
}

export function Header({
  solution,
  activeTab,
  onTabChange,
  onSelectPreset,
  onFrameworkChange,
  onOpenAddModal,
  onOpenAiModal,
  onOpenSetupWizard,
  onDownloadZip,
  onCopyAllCode,
  copied,
  gridGuidesActive,
  onToggleGridGuides,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="px-3 lg:px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">GridBloc PHP</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                8.3 PSR-4
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Isomorphic
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {solution.name}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800/80 shadow-inner overflow-x-auto">
          <button
            type="button"
            onClick={() => onTabChange('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'grid'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>2D Grid</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('three')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'three'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>3D Town</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('studio')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'studio'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span>DB Studio</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('queue')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'queue'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Redis & Queues</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('database')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>RBAC Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('diagram')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'diagram'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-indigo-400" />
            <span>Flow</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('uml')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'uml'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span>UML</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PHP Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('sandbox')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span>Sandbox</span>
          </button>
        </nav>

        {/* Action Controls & Wizard */}
        <div className="flex items-center gap-2">
          {/* Setup Wizard Button */}
          <button
            type="button"
            onClick={onOpenSetupWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 transition-all shadow-sm"
            title="Open Automated Setup & Installer Wizard"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Setup Wizard</span>
          </button>
          {/* Preset Selector */}
          <select
            value={solution.id}
            onChange={(e) => {
              const selected = PRESET_SOLUTIONS.find((p) => p.id === e.target.value);
              if (selected) onSelectPreset(selected);
            }}
            className="text-xs bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Preset Solutions"
          >
            {PRESET_SOLUTIONS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>

          {/* Grid Guides toggle */}
          {activeTab === 'grid' && (
            <button
              type="button"
              onClick={onToggleGridGuides}
              className={`p-1.5 text-xs rounded-lg border transition-all ${
                gridGuidesActive
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle 12-Column Grid Lines"
              aria-label="Toggle 12-Column Grid Lines"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          )}

          {/* Add Bloc button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Add Bloc</span>
          </button>

          {/* AI Architect trigger */}
          <button
            type="button"
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden md:inline">AI Architect</span>
          </button>

          {/* Copy all code */}
          <button
            type="button"
            onClick={onCopyAllCode}
            className="p-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all"
            title="Copy PHP Code Bundle"
            aria-label="Copy PHP Code Bundle"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download ZIP */}
          <button
            type="button"
            onClick={onDownloadZip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Download ZIP</span>
          </button>
        </div>
      </div>
    </header>
  );
}
