'use client';

import React, { useState } from 'react';
import { SolutionProject, DbTable, DbColumn, RolePermission } from '@/lib/scaffold/types';
import { 
  Database, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Key, 
  Link2, 
  Check, 
  Code2, 
  Table as TableIcon,
  Copy
} from 'lucide-react';

interface DatabasePlannerProps {
  solution: SolutionProject;
  onUpdateTables: (tables: DbTable[]) => void;
  onUpdatePermissions: (permissions: RolePermission[]) => void;
}

export function DatabasePlanner({
  solution,
  onUpdateTables,
  onUpdatePermissions,
}: DatabasePlannerProps) {
  const tables = solution.dbTables || [];
  const permissions = solution.permissions || [];

  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'tables' | 'rbac' | 'sql'>('tables');
  const [copied, setCopied] = useState(false);

  // New column state
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<DbColumn['type']>('VARCHAR');
  const [newColNullable, setNewColNullable] = useState(true);

  // New table state
  const [newTableName, setNewTableName] = useState('');
  const [newTableDesc, setNewTableDesc] = useState('');
  const [showAddTable, setShowAddTable] = useState(false);

  const activeTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim() || !activeTable) return;

    const updatedTables = tables.map((tbl) => {
      if (tbl.id === activeTable.id) {
        return {
          ...tbl,
          columns: [
            ...tbl.columns,
            {
              name: newColName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              type: newColType,
              isNullable: newColNullable,
            },
          ],
        };
      }
      return tbl;
    });

    onUpdateTables(updatedTables);
    setNewColName('');
  };

  const handleDeleteColumn = (colName: string) => {
    if (!activeTable) return;
    const updatedTables = tables.map((tbl) => {
      if (tbl.id === activeTable.id) {
        return {
          ...tbl,
          columns: tbl.columns.filter((c) => c.name !== colName),
        };
      }
      return tbl;
    });
    onUpdateTables(updatedTables);
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const newTbl: DbTable = {
      id: `t_${Date.now()}`,
      name: newTableName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      description: newTableDesc || 'Data table for entity records',
      rowCount: 0,
      columns: [
        { name: 'id', type: 'INTEGER', isPrimary: true },
        { name: 'name', type: 'VARCHAR', isNullable: false },
        { name: 'created_at', type: 'DATETIME' },
      ],
    };

    const nextTables = [...tables, newTbl];
    onUpdateTables(nextTables);
    setSelectedTableId(newTbl.id);
    setNewTableName('');
    setNewTableDesc('');
    setShowAddTable(false);
  };

  const handleTogglePermission = (
    role: RolePermission['role'],
    table: string,
    action: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete'
  ) => {
    const existingIdx = permissions.findIndex((p) => p.role === role && p.table === table);
    let nextPerms = [...permissions];

    if (existingIdx >= 0) {
      const current = nextPerms[existingIdx];
      nextPerms[existingIdx] = {
        ...current,
        [action]: !current[action],
      };
    } else {
      nextPerms.push({
        role,
        table,
        canCreate: action === 'canCreate',
        canRead: action === 'canRead',
        canUpdate: action === 'canUpdate',
        canDelete: action === 'canDelete',
        scope: role === 'admin' ? 'all' : 'organization',
      });
    }

    onUpdatePermissions(nextPerms);
  };

  // Generate real DDL
  const generatedSql = tables.map((tbl) => {
    const colLines = tbl.columns.map((c) => {
      let def = `  ${c.name} ${c.type}`;
      if (c.isPrimary) def += ' PRIMARY KEY AUTOINCREMENT';
      if (c.isUnique) def += ' UNIQUE';
      if (c.isNullable === false) def += ' NOT NULL';
      if (c.defaultValue) def += ` DEFAULT ${c.defaultValue}`;
      return def;
    }).join(',\n');

    return `-- Table: ${tbl.name} (${tbl.description})\nCREATE TABLE IF NOT EXISTS ${tbl.name} (\n${colLines}\n);`;
  }).join('\n\n');

  const handleCopySql = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-[680px] bg-slate-950 text-slate-100">
      {/* Sub-header navigation */}
      <div className="px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            Visual Database Schema & Access Planner
          </h2>
          <p className="text-xs text-slate-400">
            Define SQL tables, relationships, and configure Role-Based Access Control (RBAC) visually.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'tables' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tables & Schema</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rbac')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'rbac' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Access & RBAC Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'sql' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SQL DDL Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Tables & Schema Designer */}
      {activeTab === 'tables' && (
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Tables Sidebar */}
          <div className="w-full md:w-72 p-4 space-y-3 bg-slate-900/30">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Database Tables ({tables.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddTable(!showAddTable)}
                className="p-1 rounded bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add Table Quick Form */}
            {showAddTable && (
              <form onSubmit={handleAddTable} className="p-3 rounded-xl bg-slate-900 border border-purple-500/40 space-y-2">
                <input
                  type="text"
                  placeholder="table_name"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description..."
                  value={newTableDesc}
                  onChange={(e) => setNewTableDesc(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTable(false)}
                    className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-0.5 text-xs bg-purple-600 text-white rounded font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1.5">
              {tables.map((tbl) => {
                const isSelected = activeTable?.id === tbl.id;
                return (
                  <button
                    key={tbl.id}
                    type="button"
                    onClick={() => setSelectedTableId(tbl.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500/40 shadow'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono">{tbl.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {tbl.columns.length} cols
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{tbl.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Table Columns Manager */}
          {activeTable && (
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    {activeTable.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeTable.description}</p>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                  Driver: {solution.databaseDriver.toUpperCase()}
                </div>
              </div>

              {/* Columns Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2 px-4">Column Name</th>
                      <th className="py-2 px-4">SQL Type</th>
                      <th className="py-2 px-4">Attributes</th>
                      <th className="py-2 px-4">Foreign Key</th>
                      <th className="py-2 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {activeTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-800/30">
                        <td className="py-2 px-4 font-mono font-medium text-slate-200 flex items-center gap-1.5">
                          {col.isPrimary && <Key className="w-3.5 h-3.5 text-amber-400" />}
                          {col.name}
                        </td>
                        <td className="py-2 px-4 font-mono text-purple-300">{col.type}</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-1.5">
                            {col.isPrimary && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono">
                                PK
                              </span>
                            )}
                            {col.isUnique && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-mono">
                                UNIQUE
                              </span>
                            )}
                            {col.isNullable ? (
                              <span className="text-slate-500 text-[10px] font-mono">NULL</span>
                            ) : (
                              <span className="text-slate-300 text-[10px] font-mono">NOT NULL</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4 font-mono text-xs">
                          {col.foreignKey ? (
                            <span className="text-indigo-400 flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {col.foreignKey.targetTable}.{col.foreignKey.targetColumn}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-right">
                          {!col.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(col.name)}
                              className="text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete Column"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Column Row */}
              <form onSubmit={handleAddColumn} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Add New Column
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="column_name"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={newColType}
                    onChange={(e) => setNewColType(e.target.value as any)}
                    className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="VARCHAR">VARCHAR (255)</option>
                    <option value="INTEGER">INTEGER</option>
                    <option value="TEXT">TEXT</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="DATETIME">DATETIME</option>
                    <option value="DECIMAL">DECIMAL (10,2)</option>
                    <option value="JSON">JSON</option>
                  </select>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newColNullable}
                      onChange={(e) => setNewColNullable(e.target.checked)}
                      className="rounded border-slate-800 text-purple-600 focus:ring-0"
                    />
                    <span>Allow NULL</span>
                  </label>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Column</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: RBAC & Access Matrix */}
      {activeTab === 'rbac' && (
        <div className="flex-1 p-6 space-y-6 overflow-x-auto">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Role-Based Access Control (RBAC) Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure table-level CRUD permissions and scoping rules generated into <code className="text-indigo-300 font-mono">src/Security/PolicyManager.php</code>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Target Table</th>
                  <th className="py-3 px-4 text-center">Create</th>
                  <th className="py-3 px-4 text-center">Read</th>
                  <th className="py-3 px-4 text-center">Update</th>
                  <th className="py-3 px-4 text-center">Delete</th>
                  <th className="py-3 px-4">Row Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(['admin', 'manager', 'customer', 'guest'] as const).map((role) => (
                  <React.Fragment key={role}>
                    {tables.map((table) => {
                      const perm = permissions.find((p) => p.role === role && p.table === table.name) || {
                        role,
                        table: table.name,
                        canCreate: role === 'admin',
                        canRead: role !== 'guest',
                        canUpdate: role === 'admin',
                        canDelete: role === 'admin',
                        scope: role === 'admin' ? 'all' : 'own',
                      };

                      return (
                        <tr key={`${role}-${table.name}`} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 font-semibold text-slate-200 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                              role === 'admin' ? 'bg-rose-500/10 text-rose-300' :
                              role === 'manager' ? 'bg-amber-500/10 text-amber-300' :
                              role === 'customer' ? 'bg-sky-500/10 text-sky-300' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {role}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-purple-300">{table.name}</td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canCreate}
                              onChange={() => handleTogglePermission(role, table.name, 'canCreate')}
                              className="rounded border-slate-800 text-purple-600 focus:ring-0"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canRead}
                              onChange={() => handleTogglePermission(role, table.name, 'canRead')}
                              className="rounded border-slate-800 text-purple-600 focus:ring-0"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canUpdate}
                              onChange={() => handleTogglePermission(role, table.name, 'canUpdate')}
                              className="rounded border-slate-800 text-purple-600 focus:ring-0"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canDelete}
                              onChange={() => handleTogglePermission(role, table.name, 'canDelete')}
                              className="rounded border-slate-800 text-purple-600 focus:ring-0"
                            />
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                            {perm.scope}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Generated SQL DDL */}
      {activeTab === 'sql' && (
        <div className="flex-1 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-mono">database/migrations/001_create_schema.sql</h3>
              <p className="text-xs text-slate-400">Instant executable SQL statements generated from visual schema design.</p>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-mono transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
            {generatedSql}
          </pre>
        </div>
      )}
    </div>
  );
}
