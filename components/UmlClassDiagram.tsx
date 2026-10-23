'use client';

import React, { useState } from 'react';
import { SolutionProject, BlocItem } from '@/lib/scaffold/types';
import { PHP_STUBS_CATALOG } from '@/lib/scaffold/php-stubs';
import { 
  Workflow, 
  Layers, 
  ArrowRight, 
  Plus, 
  Copy, 
  Check, 
  Code2, 
  FileCode,
  Download
} from 'lucide-react';

interface UmlClassDiagramProps {
  solution: SolutionProject;
  onSelectBloc?: (blocId: string) => void;
}

export function UmlClassDiagram({ solution, onSelectBloc }: UmlClassDiagramProps) {
  const [selectedClass, setSelectedClass] = useState<string>(
    solution.blocs[0]?.phpConfig.className || 'RevenueMetricBloc'
  );
  const [copied, setCopied] = useState(false);

  // Group classes into BLoCs, Models, and Controllers
  const blocClasses = solution.blocs.map((b) => ({
    name: b.phpConfig.className,
    stereotype: 'BLoC State Machine',
    extends: 'Bloc',
    implements: ['JsonSerializable'],
    bloc: b,
    properties: [
      { name: 'state', type: `${b.phpConfig.className}State`, vis: '#' },
      { name: 'repository', type: `?${b.phpConfig.modelName}`, vis: '-' },
    ],
    methods: [
      { name: 'dispatch', params: 'object $event', ret: 'void', vis: '+' },
      { name: 'getState', params: '', ret: `${b.phpConfig.className}State`, vis: '+' },
      ...b.events.map((e) => ({
        name: e.phpHandler,
        params: 'object $event',
        ret: 'void',
        vis: '+',
      })),
      { name: 'toArray', params: '', ret: 'array', vis: '+' },
    ],
  }));

  const modelClasses = Array.from(new Set(solution.blocs.map((b) => b.phpConfig.modelName))).map((modelName) => {
    const parent = solution.blocs.find((b) => b.phpConfig.modelName === modelName);
    return {
      name: modelName,
      stereotype: 'DataMapper Model',
      extends: 'Model',
      implements: ['JsonSerializable'],
      bloc: parent,
      properties: [
        { name: 'id', type: '?int', vis: '+' },
        { name: 'attributes', type: 'array', vis: '+' },
      ],
      methods: [
        { name: 'find', params: 'int $id', ret: '?self', vis: '+', isStatic: true },
        { name: 'all', params: 'int $limit = 50', ret: 'array', vis: '+', isStatic: true },
        { name: 'create', params: 'array $data', ret: 'self', vis: '+', isStatic: true },
        { name: 'toArray', params: '', ret: 'array', vis: '+' },
      ],
    };
  });

  const activeClassData =
    blocClasses.find((c) => c.name === selectedClass) ||
    modelClasses.find((c) => c.name === selectedClass) ||
    blocClasses[0];

  const handleCopyPhpClass = () => {
    if (!activeClassData) return;
    const code = `<?php\n\ndeclare(strict_types=1);\n\nnamespace App;\n\nfinal class ${activeClassData.name} extends ${activeClassData.extends}\n{\n    // Generated from UML Class Diagram\n}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[680px] bg-slate-950 text-slate-100 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
      {/* UML Visual Diagram Canvas */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-sky-400" />
              Interactive UML Class Diagram & Interconnectedness Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard UML 2.5 class boxes with inheritance, methods, properties, and typed contracts.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              PSR-4 Strict
            </span>
          </div>
        </div>

        {/* Visual UML Classes Grid */}
        <div className="space-y-8">
          {/* Section: BLoC Classes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>BLoC State Machine Classes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {blocClasses.map((cls) => {
                const isSelected = selectedClass === cls.name;
                return (
                  <div
                    key={cls.name}
                    onClick={() => {
                      setSelectedClass(cls.name);
                      if (cls.bloc && onSelectBloc) onSelectBloc(cls.bloc.id);
                    }}
                    className={`rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden shadow-lg ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* UML Header */}
                    <div className="p-3 bg-slate-950 border-b border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-indigo-400 block">
                        &laquo;{cls.stereotype}&raquo;
                      </span>
                      <h3 className="text-sm font-bold font-mono text-white mt-0.5">{cls.name}</h3>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        extends {cls.extends} {cls.implements?.length ? `implements ${cls.implements.join(', ')}` : ''}
                      </div>
                    </div>

                    {/* UML Properties */}
                    <div className="p-3 border-b border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-300">
                      {cls.properties.map((p) => (
                        <div key={p.name} className="flex items-center justify-between">
                          <span>
                            <span className="text-amber-400 font-bold">{p.vis}</span> {p.name}
                          </span>
                          <span className="text-slate-500 text-[10px]">{p.type}</span>
                        </div>
                      ))}
                    </div>

                    {/* UML Methods */}
                    <div className="p-3 space-y-1 font-mono text-[11px] text-slate-200">
                      {cls.methods.map((m) => (
                        <div key={m.name} className="flex items-center justify-between">
                          <span className="truncate">
                            <span className="text-emerald-400 font-bold">{m.vis}</span> {m.name}({m.params})
                          </span>
                          <span className="text-sky-400 text-[10px] pl-2 font-semibold">:{m.ret}</span>
                        </div>
                      ))}
                    </div>

                    {/* Linkage badge */}
                    <div className="p-2 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>Bound Model: {cls.bloc.phpConfig.modelName}</span>
                      <span>Route: {cls.bloc.phpConfig.psrRoute}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: DataMapper Models */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>DataMapper Model Classes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {modelClasses.map((cls) => {
                const isSelected = selectedClass === cls.name;
                return (
                  <div
                    key={cls.name}
                    onClick={() => setSelectedClass(cls.name)}
                    className={`rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden shadow-lg ${
                      isSelected
                        ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-3 bg-slate-950 border-b border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-sky-400 block">
                        &laquo;{cls.stereotype}&raquo;
                      </span>
                      <h3 className="text-sm font-bold font-mono text-white mt-0.5">{cls.name}</h3>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        extends {cls.extends}
                      </div>
                    </div>

                    <div className="p-3 border-b border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-300">
                      {cls.properties.map((p) => (
                        <div key={p.name} className="flex items-center justify-between">
                          <span>
                            <span className="text-amber-400 font-bold">{p.vis}</span> {p.name}
                          </span>
                          <span className="text-slate-500 text-[10px]">{p.type}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 space-y-1 font-mono text-[11px] text-slate-200">
                      {cls.methods.map((m) => (
                        <div key={m.name} className="flex items-center justify-between">
                          <span className="truncate">
                            <span className="text-emerald-400 font-bold">{m.vis}</span> {m.name}({m.params})
                          </span>
                          <span className="text-sky-400 text-[10px] pl-2 font-semibold">:{m.ret}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* UML Class Detail Inspector Sidebar */}
      <div className="w-full lg:w-80 p-5 bg-slate-900/60 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              UML Inspector
            </span>
            <button
              type="button"
              onClick={handleCopyPhpClass}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {activeClassData && (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-indigo-400">&laquo;{activeClassData.stereotype}&raquo;</span>
                <h3 className="text-base font-bold text-white font-mono">{activeClassData.name}</h3>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Extends:</span>
                  <span className="text-emerald-400">{activeClassData.extends}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Implements:</span>
                  <span className="text-sky-400">{activeClassData.implements?.join(', ') || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method Count:</span>
                  <span className="text-purple-400">{activeClassData.methods.length}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Class Signatures:</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 max-h-56 overflow-y-auto">
                  {activeClassData.methods.map((m) => (
                    <div key={m.name} className="text-slate-300">
                      <span className="text-emerald-400">public</span> function {m.name}({m.params}): <span className="text-sky-400">{m.ret}</span>;
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          UML definitions map 1:1 to generated PHP 8.3 classes in <code className="text-indigo-300">src/Blocs/</code> and <code className="text-sky-300">src/Models/</code>.
        </div>
      </div>
    </div>
  );
}
