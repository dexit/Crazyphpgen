'use client';

import React, { useState } from 'react';
import { 
  BlocItem, 
  SolutionProject 
} from '@/lib/scaffold/types';
import { 
  TrendingUp, 
  Table, 
  PenTool, 
  BarChart3, 
  Search, 
  Kanban, 
  FileText, 
  Trash2, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  ArrowUpRight, 
  CheckCircle2, 
  Send,
  Building2,
  DollarSign,
  PackageCheck,
  Truck,
  Layers,
  ArrowRight
} from 'lucide-react';

interface VisualGridCanvasProps {
  solution: SolutionProject;
  selectedBlocId: string | null;
  onSelectBloc: (blocId: string) => void;
  onUpdateBlocGrid: (blocId: string, delta: { colStart?: number; colSpan?: number; rowStart?: number; rowSpan?: number }) => void;
  onDeleteBloc: (blocId: string) => void;
  showGridGuides: boolean;
}

export function VisualGridCanvas({
  solution,
  selectedBlocId,
  onSelectBloc,
  onUpdateBlocGrid,
  onDeleteBloc,
  showGridGuides,
}: VisualGridCanvasProps) {
  // Local interactive states for demo preview functionality
  const [metricPeriod, setMetricPeriod] = useState<Record<string, string>>({});
  const [gridSearch, setGridSearch] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState<Record<string, boolean>>({});
  const [formSuccess, setFormSuccess] = useState<Record<string, string>>({});
  const [kanbanStageMap, setKanbanStageMap] = useState<Record<string, any[]>>({});

  const handlePeriodChange = (blocId: string, period: string) => {
    setMetricPeriod((prev) => ({ ...prev, [blocId]: period }));
  };

  const handleFormSubmit = (blocId: string, e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting((prev) => ({ ...prev, [blocId]: true }));
    setTimeout(() => {
      setFormSubmitting((prev) => ({ ...prev, [blocId]: false }));
      setFormSuccess((prev) => ({ ...prev, [blocId]: '✓ Dispatched to PHP Controller • Record Saved!' }));
      setTimeout(() => {
        setFormSuccess((prev) => ({ ...prev, [blocId]: '' }));
      }, 3500);
    }, 600);
  };

  const handleKanbanAdvance = (blocId: string, stageIdx: number) => {
    setKanbanStageMap((prev) => {
      const current = prev[blocId] || [
        { id: 's1', name: 'Leads', count: 14 },
        { id: 's2', name: 'Proposal', count: 8 },
        { id: 's3', name: 'Won', count: 21 },
      ];
      const next = [...current];
      if (next[stageIdx] && next[stageIdx].count > 0 && next[stageIdx + 1]) {
        next[stageIdx] = { ...next[stageIdx], count: next[stageIdx].count - 1 };
        next[stageIdx + 1] = { ...next[stageIdx + 1], count: next[stageIdx + 1].count + 1 };
      }
      return { ...prev, [blocId]: next };
    });
  };

  return (
    <div className="relative min-h-[700px] w-full p-4 lg:p-6 bg-slate-950">
      {/* Visual Subgrid column markers banner */}
      {showGridGuides && (
        <div className="mb-4 grid grid-cols-12 gap-3 text-center pointer-events-none select-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="py-1 px-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400"
            >
              Col {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* 12-Column CSS Grid Container */}
      <div 
        className="grid grid-cols-12 gap-4 lg:gap-5 auto-rows-[minmax(190px,auto)]"
      >
        {solution.blocs.map((bloc) => {
          const isSelected = selectedBlocId === bloc.id;
          const colStart = bloc.grid.colStart;
          const colSpan = Math.min(bloc.grid.colSpan, 13 - colStart);
          const rowStart = bloc.grid.rowStart;
          const rowSpan = bloc.grid.rowSpan;

          return (
            <div
              key={bloc.id}
              onClick={() => onSelectBloc(bloc.id)}
              style={{
                gridColumn: `${colStart} / span ${colSpan}`,
                gridRow: `${rowStart} / span ${rowSpan}`,
              }}
              className={`group relative flex flex-col justify-between rounded-2xl p-4 lg:p-5 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                  : 'bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* Card Header & Controls Toolbar */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
                    PHP
                  </span>
                  <div className="truncate">
                    <h3 className="text-sm font-semibold text-slate-100 truncate flex items-center gap-1.5">
                      {bloc.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      {bloc.phpConfig.className}
                    </p>
                  </div>
                </div>

                {/* Direct Grid Column Controls */}
                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  {/* Col Start Adjust */}
                  <div className="flex items-center bg-slate-800/80 rounded-md border border-slate-700/60 p-0.5 text-xs text-slate-300">
                    <button
                      type="button"
                      title="Move Col Left"
                      aria-label="Move Col Left"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (colStart > 1) onUpdateBlocGrid(bloc.id, { colStart: colStart - 1 });
                      }}
                      disabled={colStart <= 1}
                      className="p-1 hover:text-white disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1 font-mono text-[11px]">{colStart}</span>
                    <button
                      type="button"
                      title="Move Col Right"
                      aria-label="Move Col Right"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (colStart + colSpan <= 12) onUpdateBlocGrid(bloc.id, { colStart: colStart + 1 });
                      }}
                      disabled={colStart + colSpan > 12}
                      className="p-1 hover:text-white disabled:opacity-30"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Col Span Adjust */}
                  <div className="flex items-center bg-slate-800/80 rounded-md border border-slate-700/60 p-0.5 text-xs text-slate-300">
                    <button
                      type="button"
                      title="Decrease Span"
                      aria-label="Decrease Span"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (colSpan > 1) onUpdateBlocGrid(bloc.id, { colSpan: colSpan - 1 });
                      }}
                      disabled={colSpan <= 1}
                      className="p-1 hover:text-white disabled:opacity-30"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1 font-mono text-[11px]">{colSpan}w</span>
                    <button
                      type="button"
                      title="Increase Span"
                      aria-label="Increase Span"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (colStart + colSpan <= 13) onUpdateBlocGrid(bloc.id, { colSpan: colSpan + 1 });
                      }}
                      disabled={colStart + colSpan > 12}
                      className="p-1 hover:text-white disabled:opacity-30"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Settings / Inspect */}
                  <button
                    type="button"
                    title="Configure Bloc"
                    aria-label="Configure Bloc"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBloc(bloc.id);
                    }}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Bloc */}
                  <button
                    type="button"
                    title="Remove Bloc"
                    aria-label="Remove Bloc"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBloc(bloc.id);
                    }}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bloc Body Render according to Type */}
              <div className="flex-1 py-1">
                {/* Metric Type */}
                {bloc.type === 'metric' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Aggregate KPI</span>
                      <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                        {['7d', '30d', '1y'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePeriodChange(bloc.id, p);
                            }}
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              (metricPeriod[bloc.id] || '30d') === p
                                ? 'bg-indigo-600 text-white font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono">
                        {(metricPeriod[bloc.id] === '7d')
                          ? '$18,420'
                          : (metricPeriod[bloc.id] === '1y')
                          ? '$592,100'
                          : '$84,320'}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> +14.8%
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Query: <code className="text-indigo-300 font-mono text-[11px]">{bloc.phpConfig.repositoryQuery}</code>
                    </p>
                  </div>
                )}

                {/* DataGrid Type */}
                {bloc.type === 'datagrid' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Filter rows..."
                          value={gridSearch[bloc.id] || ''}
                          onChange={(e) => setGridSearch((prev) => ({ ...prev, [bloc.id]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full pl-8 pr-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Model: {bloc.phpConfig.modelName}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-800/80">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="py-1.5 px-3">Name / Org</th>
                            <th className="py-1.5 px-3">Contact</th>
                            <th className="py-1.5 px-3">Tier</th>
                            <th className="py-1.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {[
                            { id: 1, name: 'Acme Corp', contact: 'ops@acme.com', tier: 'Enterprise', status: 'Active' },
                            { id: 2, name: 'Hyperion AI', contact: 'lead@hyperion.io', tier: 'Pro (50)', status: 'Active' },
                            { id: 3, name: 'Vortex Labs', contact: 'dev@vortex.org', tier: 'Starter', status: 'Trial' },
                          ]
                            .filter((row) => 
                              !gridSearch[bloc.id] || 
                              row.name.toLowerCase().includes(gridSearch[bloc.id].toLowerCase()) ||
                              row.contact.toLowerCase().includes(gridSearch[bloc.id].toLowerCase())
                            )
                            .map((row) => (
                              <tr key={row.id} className="hover:bg-slate-800/40">
                                <td className="py-1.5 px-3 font-medium text-slate-200">{row.name}</td>
                                <td className="py-1.5 px-3 text-slate-400 font-mono">{row.contact}</td>
                                <td className="py-1.5 px-3">
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px]">
                                    {row.tier}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-right">
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Form Type */}
                {bloc.type === 'form' && (
                  <form onSubmit={(e) => handleFormSubmit(bloc.id, e)} className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Workspace Name / Entity Title
                      </label>
                      <input
                        type="text"
                        defaultValue="Hyperion Cluster Alpha"
                        required
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Owner Email</label>
                        <input
                          type="email"
                          defaultValue="lead@domain.com"
                          required
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Tier Plan</label>
                        <select
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="enterprise">Enterprise</option>
                          <option value="pro">Pro</option>
                          <option value="starter">Starter</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {formSuccess[bloc.id] ? (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {formSuccess[bloc.id]}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          POST {bloc.phpConfig.psrRoute}
                        </span>
                      )}

                      <button
                        type="submit"
                        disabled={formSubmitting[bloc.id]}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>{formSubmitting[bloc.id] ? 'Saving...' : 'Dispatch PHP'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Chart Type */}
                {bloc.type === 'chart' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Weekly SQL Event Aggregate</span>
                      <span className="text-xs font-mono text-sky-400">7 cohorts</span>
                    </div>

                    {/* SVG Graphic */}
                    <div className="h-28 w-full flex items-end justify-between gap-2 pt-2 px-1">
                      {[35, 52, 68, 48, 82, 95, 74].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group/bar">
                          <div
                            style={{ height: `${val}%` }}
                            className="w-full max-w-[28px] rounded-t bg-gradient-to-t from-sky-600 to-indigo-500 group-hover/bar:from-sky-400 group-hover/bar:to-indigo-300 transition-all duration-300"
                          />
                          <span className="text-[10px] text-slate-500 font-mono">D{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter Bar Type */}
                {bloc.type === 'filter_bar' && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-purple-400" />
                      <input
                        type="text"
                        placeholder="Global lookup: accounts, orders, metrics, telemetry..."
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {['All', 'Active', 'Overdue', 'Flagged'].map((tag, i) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                            i === 0
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kanban Type */}
                {bloc.type === 'kanban' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(kanbanStageMap[bloc.id] || [
                        { id: 's1', name: 'Leads', count: 14 },
                        { id: 's2', name: 'Proposal', count: 8 },
                        { id: 's3', name: 'Review', count: 5 },
                        { id: 's4', name: 'Won', count: 21 },
                      ]).map((stg, i) => (
                        <div
                          key={stg.id}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-400">{stg.name}</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-200">
                              {stg.count}
                            </span>
                          </div>
                          {i < 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleKanbanAdvance(bloc.id, i);
                              }}
                              className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detail Card Type */}
                {bloc.type === 'detail_card' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <span className="text-slate-400">Target Record</span>
                      <span className="font-mono text-indigo-400">ID: #1042</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-100">Enterprise Master Service Agreement</p>
                      <p className="text-slate-400 text-[11px]">Bound to Model: {bloc.phpConfig.modelName}</p>
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                        Active Sync
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">PHP DTO: Valid</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Isomorphic Footer Info */}
              <div className="pt-2.5 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {bloc.phpConfig.httpMethod} {bloc.phpConfig.psrRoute}
                </span>
                <span className="text-slate-400">
                  Col {colStart}:{colSpan}w
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
