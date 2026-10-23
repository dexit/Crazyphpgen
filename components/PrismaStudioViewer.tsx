'use client';

import React, { useState } from 'react';
import { SolutionProject, DbTable, DbRowRecord } from '@/lib/scaffold/types';
import { 
  Database, 
  Table as TableIcon, 
  Plus, 
  Trash2, 
  Search, 
  Link2, 
  Filter, 
  Key, 
  Check, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PrismaStudioViewerProps {
  solution: SolutionProject;
  onUpdateTableRecords?: (records: Record<string, DbRowRecord[]>) => void;
}

export function PrismaStudioViewer({ solution }: PrismaStudioViewerProps) {
  // Built-in seed data for Prisma Studio experience
  const defaultRecords: Record<string, DbRowRecord[]> = {
    users: [
      { id: 1, name: 'System Administrator', email: 'admin@gridbloc.local', role: 'admin', status: 'active', created_at: '2026-01-01 10:00:00' },
      { id: 2, name: 'Elena Rostova', email: 'elena@hyperion.io', role: 'manager', status: 'active', created_at: '2026-02-15 14:22:00' },
      { id: 3, name: 'Marcus Bell', email: 'marcus@nebula.dev', role: 'customer', status: 'active', created_at: '2026-03-20 09:12:00' },
      { id: 4, name: 'Sarah Connor', email: 'sarah@vortex.org', role: 'customer', status: 'active', created_at: '2026-04-05 18:45:00' },
    ],
    workspaces: [
      { id: 1, name: 'Hyperion AI Labs', slug: 'hyperion-ai', owner_email: 'elena@hyperion.io', plan: 'enterprise', max_seats: 100, status: 'active' },
      { id: 2, name: 'Nebula Stream Inc', slug: 'nebula-stream', owner_email: 'marcus@nebula.dev', plan: 'pro', max_seats: 25, status: 'active' },
      { id: 3, name: 'Vortex Dynamics', slug: 'vortex-dyn', owner_email: 'sarah@vortex.org', plan: 'starter', max_seats: 5, status: 'trial' },
    ],
    subscriptions: [
      { id: 101, workspace_id: 1, stripe_subscription_id: 'sub_1P82xEnterprise', mrr_cents: 49900, status: 'active', currency: 'usd' },
      { id: 102, workspace_id: 2, stripe_subscription_id: 'sub_2B77yPro', mrr_cents: 14900, status: 'active', currency: 'usd' },
      { id: 103, workspace_id: 3, stripe_subscription_id: 'sub_3M19zStarter', mrr_cents: 4900, status: 'trialing', currency: 'usd' },
    ],
    transactions: [
      { id: 1001, workspace_id: 1, amount: '499.00', period: '2026-03', settled_at: '2026-03-01 12:00:00' },
      { id: 1002, workspace_id: 2, amount: '149.00', period: '2026-03', settled_at: '2026-03-01 12:05:00' },
      { id: 1003, workspace_id: 1, amount: '499.00', period: '2026-04', settled_at: '2026-04-01 12:00:00' },
    ],
    jobs: [
      { id: 1, queue: 'default', job: 'App\\Jobs\\SendWelcomeEmailJob', attempts: 0, reserved_at: null, created_at: '2026-04-20 16:00:00' },
      { id: 2, queue: 'billing', job: 'App\\Jobs\\ProcessInvoiceSettlement', attempts: 1, reserved_at: null, created_at: '2026-04-20 16:02:00' },
    ],
  };

  const [records, setRecords] = useState<Record<string, DbRowRecord[]>>(defaultRecords);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbDriver, setDbDriver] = useState<'sqlite' | 'mysql' | 'pgsql'>(solution.databaseDriver);
  const [newRowModalOpen, setNewRowModalOpen] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [connectionStringCopied, setConnectionStringCopied] = useState(false);

  const tablesList = ['users', ...(solution.dbTables?.map((t) => t.name) || []), 'jobs'];
  const uniqueTables = Array.from(new Set(tablesList));

  const activeRows = (records[selectedTable] || []).filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeTableSchema = solution.dbTables?.find((t) => t.name === selectedTable);

  const getColumns = (): string[] => {
    if (records[selectedTable] && records[selectedTable].length > 0) {
      return Object.keys(records[selectedTable][0]);
    }
    if (activeTableSchema) {
      return activeTableSchema.columns.map((c) => c.name);
    }
    return ['id', 'name', 'created_at'];
  };

  const columns = getColumns();

  const handleDeleteRow = (id: number) => {
    setRecords((prev) => ({
      ...prev,
      [selectedTable]: (prev[selectedTable] || []).filter((r) => r.id !== id),
    }));
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(0, ...((records[selectedTable] || []).map((r) => Number(r.id) || 0))) + 1;
    const created: DbRowRecord = { id: newId, ...newRowData };

    setRecords((prev) => ({
      ...prev,
      [selectedTable]: [created, ...(prev[selectedTable] || [])],
    }));

    setNewRowData({});
    setNewRowModalOpen(false);
  };

  const getConnectionString = () => {
    if (dbDriver === 'pgsql') return `pgsql:host=localhost;port=5432;dbname=${solution.slug};user=postgres`;
    if (dbDriver === 'mysql') return `mysql:host=localhost;port=3306;dbname=${solution.slug};charset=utf8mb4`;
    return `sqlite:database/app.sqlite`;
  };

  const copyConnectionString = () => {
    navigator.clipboard.writeText(getConnectionString());
    setConnectionStringCopied(true);
    setTimeout(() => setConnectionStringCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-[680px] bg-slate-950 text-slate-100 divide-y divide-slate-800">
      {/* Prisma Studio Style Top Navigation Bar */}
      <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">Visual DB Studio</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                Prisma Studio UI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live relational data browser, inline record management, foreign keys & connection pooling.
            </p>
          </div>
        </div>

        {/* Database Driver Selector & Connection String */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {(['sqlite', 'mysql', 'pgsql'] as const).map((drv) => (
              <button
                key={drv}
                type="button"
                onClick={() => setDbDriver(drv)}
                className={`px-2 py-0.5 rounded font-mono uppercase text-[10px] transition-all ${
                  dbDriver === drv ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {drv}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={copyConnectionString}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-mono transition-colors"
            title="Copy PDO Connection String"
          >
            {connectionStringCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Connection String</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Sidebar Tables + Data Grid */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        {/* Tables Left Sidebar */}
        <div className="w-full md:w-64 p-4 space-y-3 bg-slate-900/40">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-indigo-400" />
              Models & Tables ({uniqueTables.length})
            </span>
          </div>

          <div className="space-y-1">
            {uniqueTables.map((tblName) => {
              const isSelected = selectedTable === tblName;
              const count = records[tblName]?.length || 0;
              return (
                <button
                  key={tblName}
                  type="button"
                  onClick={() => {
                    setSelectedTable(tblName);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span className="font-semibold truncate">{tblName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count} rows
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Records Grid Area */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Action Toolbar */}
          <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder={`Search ${selectedTable} rows...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewRowModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          {/* Table Data Matrix */}
          <div className="flex-1 overflow-auto p-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-x-auto shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px] font-mono">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="py-2.5 px-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {col === 'id' && <Key className="w-3 h-3 text-amber-400" />}
                          {col.endsWith('_id') && col !== 'id' && <Link2 className="w-3 h-3 text-sky-400" />}
                          <span>{col}</span>
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {activeRows.length > 0 ? (
                    activeRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                        {columns.map((col) => {
                          const val = row[col];
                          const isForeignKey = col.endsWith('_id') && col !== 'id';

                          return (
                            <td key={col} className="py-2.5 px-4 whitespace-nowrap text-slate-300">
                              {isForeignKey ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedTable('workspaces')}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-[11px] transition-colors"
                                  title="Inspect foreign key relation"
                                >
                                  <span>#{val}</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              ) : col === 'status' ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium uppercase ${
                                  val === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {val}
                                </span>
                              ) : col === 'role' ? (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px]">
                                  {val}
                                </span>
                              ) : (
                                <span>{String(val ?? 'NULL')}</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length + 1} className="py-8 text-center text-slate-500 text-xs">
                        No records found in table <code className="text-emerald-400 font-mono">{selectedTable}</code>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Row Modal */}
      {newRowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Record to {selectedTable}
              </h3>
              <button
                type="button"
                onClick={() => setNewRowModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRow} className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {columns
                .filter((col) => col !== 'id')
                .map((col) => (
                  <div key={col}>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">{col}</label>
                    <input
                      type="text"
                      placeholder={`Enter ${col}...`}
                      value={newRowData[col] || ''}
                      onChange={(e) => setNewRowData((prev) => ({ ...prev, [col]: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                ))}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewRowModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
