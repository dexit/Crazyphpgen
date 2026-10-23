'use client';

import React, { useState } from 'react';
import { SolutionProject, BlocItem } from '@/lib/scaffold/types';
import { 
  Boxes, 
  Zap, 
  Cpu, 
  Database, 
  Workflow, 
  ArrowRight, 
  CheckCircle, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  Code2
} from 'lucide-react';

interface ArchitectureDiagramProps {
  solution: SolutionProject;
  onSelectBloc?: (blocId: string) => void;
}

export function ArchitectureDiagram({ solution, onSelectBloc }: ArchitectureDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<{
    type: 'bloc' | 'event' | 'controller' | 'model' | 'table';
    item: any;
    parentBloc?: BlocItem;
  } | null>(null);

  const [animateFlow, setAnimateFlow] = useState(true);

  // Default selection to first bloc if none selected
  const activeBloc = selectedNode?.parentBloc || solution.blocs[0];

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[680px] bg-slate-950 text-slate-100 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
      {/* Visual Canvas Diagram */}
      <div className="flex-1 p-6 overflow-x-auto overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-400" />
              Isomorphic BLoC & Architecture Flow Diagram
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual pipeline mapping frontend grid subgrids directly to PHP 8.3 controllers, state machines, models & SQL tables.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAnimateFlow(!animateFlow)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-mono transition-all ${
                animateFlow
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${animateFlow ? 'text-amber-400 fill-amber-400' : ''}`} />
              <span>{animateFlow ? 'Stream Pulse: ON' : 'Stream Pulse: OFF'}</span>
            </button>
          </div>
        </div>

        {/* 5-Column Isomorphic Architecture Flow Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[900px]">
          {/* Column 1: UI Grid Blocs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Boxes className="w-4 h-4 text-indigo-400" />
              <span>1. 12-Col UI Blocs</span>
            </div>
            <div className="space-y-2.5">
              {solution.blocs.map((bloc) => {
                const isSelected = activeBloc?.id === bloc.id;
                return (
                  <button
                    key={bloc.id}
                    type="button"
                    onClick={() => {
                      setSelectedNode({ type: 'bloc', item: bloc, parentBloc: bloc });
                      if (onSelectBloc) onSelectBloc(bloc.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 truncate">{bloc.title}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-indigo-300">
                        {bloc.grid.colStart}:{bloc.grid.colSpan}w
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">type: {bloc.type}</p>
                    {animateFlow && isSelected && (
                      <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Typed Events */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-500/30 text-xs font-semibold text-amber-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>2. Dispatched Events</span>
            </div>
            <div className="space-y-2.5">
              {solution.blocs.map((bloc) => {
                const isCurrent = activeBloc?.id === bloc.id;
                return (
                  <div
                    key={bloc.id}
                    className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                      isCurrent
                        ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-slate-400 truncate">{bloc.slug}</div>
                    {bloc.events.map((evt) => (
                      <div
                        key={evt.name}
                        onClick={() => setSelectedNode({ type: 'event', item: evt, parentBloc: bloc })}
                        className="cursor-pointer p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400/50 text-xs text-amber-200 font-mono flex items-center justify-between"
                      >
                        <span className="truncate">{evt.name}()</span>
                        <span className="text-[10px] text-slate-500">{evt.payloadType}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: PHP BLoC State Machines */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/30 text-xs font-semibold text-emerald-300">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>3. PHP 8.3 BLoC</span>
            </div>
            <div className="space-y-2.5">
              {solution.blocs.map((bloc) => {
                const isCurrent = activeBloc?.id === bloc.id;
                return (
                  <button
                    key={bloc.id}
                    type="button"
                    onClick={() => setSelectedNode({ type: 'controller', item: bloc.phpConfig, parentBloc: bloc })}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="text-xs font-semibold text-emerald-300 font-mono truncate">
                      {bloc.phpConfig.className}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      State: {bloc.phpConfig.className}State
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-mono mt-1">
                      Route: {bloc.phpConfig.httpMethod} {bloc.phpConfig.psrRoute}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 4: DataMapper PHP Models */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-sky-500/30 text-xs font-semibold text-sky-300">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>4. PSR-4 Models</span>
            </div>
            <div className="space-y-2.5">
              {solution.blocs.map((bloc) => {
                const isCurrent = activeBloc?.id === bloc.id;
                return (
                  <button
                    key={bloc.id}
                    type="button"
                    onClick={() => setSelectedNode({ type: 'model', item: bloc.phpConfig, parentBloc: bloc })}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-sky-950/30 border-sky-500 ring-1 ring-sky-500/40 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="text-xs font-semibold text-sky-300 font-mono truncate">
                      {bloc.phpConfig.modelName}.php
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono truncate">
                      Table: {bloc.phpConfig.tableName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      ActiveRecord / PDO
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 5: Database Schema Tables */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-500/30 text-xs font-semibold text-purple-300">
              <Database className="w-4 h-4 text-purple-400" />
              <span>5. SQL Schema Tables</span>
            </div>
            <div className="space-y-2.5">
              {(solution.dbTables || []).map((table) => {
                const isRelated = activeBloc?.phpConfig.tableName === table.name;
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedNode({ type: 'table', item: table, parentBloc: activeBloc })}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isRelated
                        ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/40 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-300 font-mono truncate">
                        {table.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {table.columns.length} cols
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {table.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Details Inspector Panel */}
      <div className="w-full lg:w-80 p-5 bg-slate-900/60 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Node Details
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              {selectedNode?.type || 'bloc'}
            </span>
          </div>

          {activeBloc && (
            <div className="space-y-3 text-xs">
              <div>
                <h3 className="font-bold text-sm text-white">{activeBloc.title}</h3>
                <p className="text-slate-400 mt-1">{activeBloc.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">PHP Class:</span>
                  <span className="text-emerald-400">{activeBloc.phpConfig.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">HTTP Route:</span>
                  <span className="text-sky-400">{activeBloc.phpConfig.psrRoute}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span className="text-purple-400">{activeBloc.phpConfig.modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SQL Table:</span>
                  <span className="text-amber-400">{activeBloc.phpConfig.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grid Position:</span>
                  <span className="text-indigo-300">Col {activeBloc.grid.colStart} (Span {activeBloc.grid.colSpan})</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Repository Query:</span>
                <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-[11px] overflow-x-auto">
                  {activeBloc.phpConfig.repositoryQuery}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 font-medium">State Machine DTO:</span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono text-[10px]">
                  {activeBloc.stateFields.map((f) => (
                    <div key={f.name} className="flex justify-between text-slate-300">
                      <span>${f.name}</span>
                      <span className="text-slate-500">{f.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-500">
          Click any column node to view its PHP 8.3 isomorphic mapping and database linkage.
        </div>
      </div>
    </div>
  );
}
