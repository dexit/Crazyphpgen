'use client';

import React from 'react';
import { BlocItem } from '@/lib/scaffold/types';
import { 
  X, 
  Settings, 
  Layers, 
  Database, 
  Zap, 
  Sliders, 
  ShieldAlert 
} from 'lucide-react';

interface BlocInspectorProps {
  bloc: BlocItem | null;
  onClose: () => void;
  onUpdateBloc: (updated: BlocItem) => void;
}

export function BlocInspector({ bloc, onClose, onUpdateBloc }: BlocInspectorProps) {
  if (!bloc) return null;

  const handleChange = (path: string, value: any) => {
    const updated = { ...bloc };
    if (path === 'title') updated.title = value;
    if (path === 'slug') updated.slug = value;
    if (path === 'description') updated.description = value;
    if (path === 'grid.colStart') updated.grid.colStart = Number(value);
    if (path === 'grid.colSpan') updated.grid.colSpan = Number(value);
    if (path === 'grid.rowSpan') updated.grid.rowSpan = Number(value);
    if (path === 'phpConfig.className') updated.phpConfig.className = value;
    if (path === 'phpConfig.modelName') updated.phpConfig.modelName = value;
    if (path === 'phpConfig.tableName') updated.phpConfig.tableName = value;
    if (path === 'phpConfig.psrRoute') updated.phpConfig.psrRoute = value;
    if (path === 'phpConfig.httpMethod') updated.phpConfig.httpMethod = value;
    if (path === 'phpConfig.repositoryQuery') updated.phpConfig.repositoryQuery = value;

    onUpdateBloc(updated);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-100">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Bloc Inspector</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto text-xs">
        {/* Basic Meta */}
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            General Properties
          </span>
          <div>
            <label className="block text-slate-400 mb-1">Bloc Title</label>
            <input
              type="text"
              value={bloc.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Slug Identifier</label>
            <input
              type="text"
              value={bloc.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-3 py-1.5 font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea
              rows={2}
              value={bloc.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 12-Column Subgrid Settings */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            12-Column Subgrid Coordinates
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Col Start</label>
              <input
                type="number"
                min={1}
                max={12}
                value={bloc.grid.colStart}
                onChange={(e) => handleChange('grid.colStart', e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Col Span</label>
              <input
                type="number"
                min={1}
                max={12}
                value={bloc.grid.colSpan}
                onChange={(e) => handleChange('grid.colSpan', e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Row Span</label>
              <input
                type="number"
                min={1}
                max={4}
                value={bloc.grid.rowSpan}
                onChange={(e) => handleChange('grid.rowSpan', e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* PHP 8.3 & PSR-4 Architecture */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            PHP 8.3 BLoC & Controller Mapping
          </span>
          <div>
            <label className="block text-slate-400 mb-1">PHP Class Name</label>
            <input
              type="text"
              value={bloc.phpConfig.className}
              onChange={(e) => handleChange('phpConfig.className', e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-emerald-400 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Model Name</label>
              <input
                type="text"
                value={bloc.phpConfig.modelName}
                onChange={(e) => handleChange('phpConfig.modelName', e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Table Name</label>
              <input
                type="text"
                value={bloc.phpConfig.tableName}
                onChange={(e) => handleChange('phpConfig.tableName', e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Method</label>
              <select
                value={bloc.phpConfig.httpMethod}
                onChange={(e) => handleChange('phpConfig.httpMethod', e.target.value)}
                className="w-full px-2 py-1.5 font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-400 mb-1">PSR Route</label>
              <input
                type="text"
                value={bloc.phpConfig.psrRoute}
                onChange={(e) => handleChange('phpConfig.psrRoute', e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-slate-950 border border-slate-800 rounded-lg text-sky-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Repository Query Expression</label>
            <input
              type="text"
              value={bloc.phpConfig.repositoryQuery}
              onChange={(e) => handleChange('phpConfig.repositoryQuery', e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-[11px] text-amber-300 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}
