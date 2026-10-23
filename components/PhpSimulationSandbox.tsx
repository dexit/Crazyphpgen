'use client';

import React, { useState } from 'react';
import { SolutionProject, BlocItem } from '@/lib/scaffold/types';
import { 
  Play, 
  Terminal, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Cpu, 
  Database, 
  Send, 
  Code2, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface PhpSimulationSandboxProps {
  solution: SolutionProject;
}

export function PhpSimulationSandbox({ solution }: PhpSimulationSandboxProps) {
  const [selectedRoute, setSelectedRoute] = useState<string>(
    solution.blocs[0]?.phpConfig.psrRoute || '/api/blocs/mrr'
  );
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [requestRole, setRequestRole] = useState<'admin' | 'manager' | 'customer' | 'guest'>('admin');
  const [postPayload, setPostPayload] = useState<string>(
    JSON.stringify({ name: 'Acme Enterprise', email: 'billing@acme.com', tier: 'enterprise' }, null, 2)
  );

  const [executing, setExecuting] = useState(false);
  const [responseView, setResponseView] = useState<'json' | 'html' | 'lifecycle'>('json');
  const [executionStats, setExecutionStats] = useState({
    status: 200,
    durationMs: 1.84,
    memoryPeak: '2.18 MB',
    timestamp: new Date().toLocaleTimeString(),
  });

  const activeBloc = solution.blocs.find((b) => b.phpConfig.psrRoute === selectedRoute) || solution.blocs[0];

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setExecutionStats({
        status: 200,
        durationMs: +(Math.random() * 2 + 1.2).toFixed(2),
        memoryPeak: `${(Math.random() * 0.5 + 2.1).toFixed(2)} MB`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 400);
  };

  const simulatedResponseJson = {
    status: 'success',
    php_version: '8.3.12',
    psr_request: {
      method: httpMethod,
      route: selectedRoute,
      caller_role: requestRole,
    },
    bloc: {
      class: activeBloc?.phpConfig.className,
      model: activeBloc?.phpConfig.modelName,
      table: activeBloc?.phpConfig.tableName,
      grid_coordinates: {
        colStart: activeBloc?.grid.colStart,
        colSpan: activeBloc?.grid.colSpan,
        rowSpan: activeBloc?.grid.rowSpan,
      },
    },
    state_payload: activeBloc ? Object.fromEntries(activeBloc.stateFields.map((f) => [f.name, f.initialValue])) : {},
    meta: {
      repository_query: activeBloc?.phpConfig.repositoryQuery,
      cache_ttl: activeBloc?.phpConfig.cacheSeconds ? `${activeBloc.phpConfig.cacheSeconds}s` : 'no-cache',
    },
  };

  const simulatedHtml = `<!-- Rendered by src/Views/blocs/${activeBloc?.slug}.php -->
<div class="grid-bloc col-span-${activeBloc?.grid.colSpan} bg-slate-900 border border-slate-800 p-5 rounded-xl">
    <div class="bloc-header flex justify-between">
        <h3 class="font-bold text-slate-100">${activeBloc?.title}</h3>
        <span class="badge bg-indigo-900 text-indigo-300 font-mono text-xs">PHP 8.3</span>
    </div>
    <div class="bloc-body mt-3">
        <div class="data-value text-2xl font-mono text-white">$84,320</div>
        <p class="text-xs text-slate-400 mt-1">Repository: ${activeBloc?.phpConfig.repositoryQuery}</p>
    </div>
</div>`;

  return (
    <div className="flex flex-col h-full min-h-[680px] bg-slate-950 text-slate-100 divide-y divide-slate-800">
      {/* Simulation Command Bar */}
      <div className="p-4 lg:p-6 bg-slate-900/60 border-b border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Live PHP 8.3 Sandbox & Event Dispatcher
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates real PSR-7 HTTP request dispatch, BLoC event transitions, and SSR Blade markup.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 flex items-center gap-1.5 border border-slate-700/60">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>PHP 8.3.12 (CLI)</span>
            </span>
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              OPcache: ON
            </span>
          </div>
        </div>

        {/* Request Configurator Form */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
          {/* Method */}
          <div className="sm:col-span-2">
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 focus:outline-none focus:border-indigo-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Endpoint Route */}
          <div className="sm:col-span-5">
            <select
              value={selectedRoute}
              onChange={(e) => {
                setSelectedRoute(e.target.value);
                const match = solution.blocs.find((b) => b.phpConfig.psrRoute === e.target.value);
                if (match) setHttpMethod(match.phpConfig.httpMethod);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="/">GET / (Full 12-Col Dashboard SSR)</option>
              {solution.blocs.map((b) => (
                <option key={b.id} value={b.phpConfig.psrRoute}>
                  {b.phpConfig.httpMethod} {b.phpConfig.psrRoute} ({b.phpConfig.className})
                </option>
              ))}
            </select>
          </div>

          {/* Role Header */}
          <div className="sm:col-span-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">Role:</span>
              <select
                value={requestRole}
                onChange={(e) => setRequestRole(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="customer">Customer</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>

          {/* Execute Button */}
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleExecute}
              disabled={executing}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {executing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{executing ? 'Executing...' : 'Dispatch'}</span>
            </button>
          </div>
        </div>

        {/* POST payload editor if POST selected */}
        {httpMethod === 'POST' && (
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400">Request Body (JSON):</label>
            <textarea
              rows={3}
              value={postPayload}
              onChange={(e) => setPostPayload(e.target.value)}
              className="w-full p-2.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Output Inspection Area */}
      <div className="flex-1 p-4 lg:p-6 space-y-4 overflow-y-auto">
        {/* Execution Metrics Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-bold">{executionStats.status} OK</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{executionStats.durationMs}ms</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>{executionStats.memoryPeak}</span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setResponseView('json')}
              className={`px-3 py-1 rounded-md font-mono transition-all ${
                responseView === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JSON Response
            </button>
            <button
              type="button"
              onClick={() => setResponseView('html')}
              className={`px-3 py-1 rounded-md font-mono transition-all ${
                responseView === 'html' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SSR HTML Preview
            </button>
            <button
              type="button"
              onClick={() => setResponseView('lifecycle')}
              className={`px-3 py-1 rounded-md font-mono transition-all ${
                responseView === 'lifecycle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BLoC Lifecycle
            </button>
          </div>
        </div>

        {/* View Content */}
        {responseView === 'json' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs overflow-x-auto text-emerald-300">
            <pre>{JSON.stringify(simulatedResponseJson, null, 2)}</pre>
          </div>
        )}

        {responseView === 'html' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs overflow-x-auto text-sky-300">
              <pre>{simulatedHtml}</pre>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
              <span className="text-xs text-slate-400 font-mono block mb-2">Live DOM Render:</span>
              <div dangerouslySetInnerHTML={{ __html: simulatedHtml }} />
            </div>
          </div>
        )}

        {responseView === 'lifecycle' && (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              BLoC Execution Pipeline Sequence
            </span>

            <div className="space-y-3">
              {[
                { step: '1. Request Captured', desc: `PSR-7 Request parsed (${httpMethod} ${selectedRoute})`, color: 'text-indigo-400' },
                { step: '2. RBAC Policy Evaluated', desc: `PolicyManager::can('${requestRole}', '${activeBloc?.phpConfig.tableName}', '${httpMethod === 'POST' ? 'create' : 'read'}') => true`, color: 'text-purple-400' },
                { step: '3. BLoC Instantiated', desc: `$bloc = new \\App\\Blocs\\${activeBloc?.phpConfig.className}(); Initial state hydrated`, color: 'text-emerald-400' },
                { step: '4. Repository Query Executed', desc: `${activeBloc?.phpConfig.repositoryQuery}`, color: 'text-amber-400' },
                { step: '5. Immutable State Emitted', desc: `$bloc->emit(new ${activeBloc?.phpConfig.className}State(...)); Response::json()`, color: 'text-sky-400' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <span className={`font-bold ${s.color}`}>{s.step}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
