'use client';

import React from 'react';
import { BlocType } from '@/lib/scaffold/types';
import { 
  X, 
  TrendingUp, 
  Table, 
  PenTool, 
  BarChart3, 
  Search, 
  Kanban, 
  FileText,
  Plus
} from 'lucide-react';

interface AddBlocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBloc: (type: BlocType) => void;
}

export function AddBlocModal({ isOpen, onClose, onAddBloc }: AddBlocModalProps) {
  if (!isOpen) return null;

  const blocTypes: { type: BlocType; title: string; desc: string; icon: any; color: string; defaultSpan: string }[] = [
    {
      type: 'metric',
      title: 'KPI Metric Stat Card',
      desc: 'Aggregated calculation with trend percentage and cached query.',
      icon: TrendingUp,
      color: 'emerald',
      defaultSpan: '3 Columns (col-span-3)',
    },
    {
      type: 'datagrid',
      title: 'Data Grid / Table Bloc',
      desc: 'Paginated, searchable record table bound to a PHP Model.',
      icon: Table,
      color: 'indigo',
      defaultSpan: '8 Columns (col-span-8)',
    },
    {
      type: 'form',
      title: 'Action Form & Validator',
      desc: 'PSR-7 form submission handler with PHP validation rules.',
      icon: PenTool,
      color: 'amber',
      defaultSpan: '4 Columns (col-span-4)',
    },
    {
      type: 'chart',
      title: 'Analytics Series Chart',
      desc: 'Visual bar/line SVG series bound to time-bucketed SQL metrics.',
      icon: BarChart3,
      color: 'sky',
      defaultSpan: '6 Columns (col-span-6)',
    },
    {
      type: 'filter_bar',
      title: 'Search & Facet Filter Bar',
      desc: 'Global debounced search bar and status tags filter.',
      icon: Search,
      color: 'purple',
      defaultSpan: '12 Columns (col-span-12)',
    },
    {
      type: 'kanban',
      title: 'Pipeline Kanban Board',
      desc: 'Multi-stage pipeline board with stage state transitions in PHP.',
      icon: Kanban,
      color: 'rose',
      defaultSpan: '12 Columns (col-span-12)',
    },
    {
      type: 'detail_card',
      title: 'Entity Detail Inspector',
      desc: 'Active record inspector card with relations and attributes.',
      icon: FileText,
      color: 'indigo',
      defaultSpan: '4 Columns (col-span-4)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Add Isomorphic UI Bloc to Grid
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a component block to automatically scaffold UI subgrid, PHP BLoC class, Model, and PSR-7 route.
            </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {blocTypes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  onAddBloc(item.type);
                  onClose();
                }}
                className="text-left p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900 transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">{item.defaultSpan}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
