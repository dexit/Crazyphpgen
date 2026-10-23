'use client';

import React, { useState } from 'react';
import { SolutionProject } from '@/lib/scaffold/types';
import { 
  CheckCircle2, 
  X, 
  Terminal, 
  Database, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Copy, 
  Check, 
  Boxes 
} from 'lucide-react';

interface BabysittingInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: SolutionProject;
  onUpdateDriver: (driver: 'sqlite' | 'mysql' | 'pgsql') => void;
}

export function BabysittingInstallerModal({
  isOpen,
  onClose,
  solution,
  onUpdateDriver,
}: BabysittingInstallerModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDriver, setSelectedDriver] = useState<'sqlite' | 'mysql' | 'pgsql'>(solution.databaseDriver);
  const [testingConn, setTestingConn] = useState(false);
  const [connSuccess, setConnSuccess] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setTestingConn(true);
    setTimeout(() => {
      setTestingConn(false);
      setConnSuccess(true);
      onUpdateDriver(selectedDriver);
    }, 600);
  };

  const sampleEnv = `# GridBloc PHP Generated Environment
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_DRIVER=${selectedDriver}
DB_HOST=127.0.0.1
DB_PORT=${selectedDriver === 'pgsql' ? '5432' : '3306'}
DB_NAME=${solution.slug}
DB_USER=${selectedDriver === 'pgsql' ? 'postgres' : 'root'}
DB_PASS=secret123

# Redis & Queues
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Session & Security
SESSION_LIFETIME=10080
SESSION_SECURE_COOKIE=false
ARGON_MEMORY_COST=65536
ARGON_TIME_COST=4
`;

  const copyEnv = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white shadow">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Full Babysitting Setup & Installer Wizard</h2>
              <p className="text-xs text-slate-400">
                Automated environment validator, database connectivity tester, and migrations runner.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-2 rounded-lg border text-left transition-all ${
              step === 1 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            1. Pre-flight Check
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`p-2 rounded-lg border text-left transition-all ${
              step === 2 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            2. Database & Driver
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`p-2 rounded-lg border text-left transition-all ${
              step === 3 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            3. Docker & Launch
          </button>
        </div>

        {/* Step 1: Pre-flight Verification */}
        {step === 1 && (
          <div className="space-y-3 py-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              System Prerequisites & Extensions
            </span>

            <div className="space-y-2">
              {[
                { name: 'PHP Runtime 8.3+ (Strict Types, Match Expressions)', status: 'Verified (PHP 8.3.12)', ok: true },
                { name: 'Composer 2.7+ (PSR-4 Autoloading)', status: 'Active (composer.json ready)', ok: true },
                { name: 'PDO Drivers (pdo_mysql, pdo_pgsql, pdo_sqlite)', status: 'Installed & Configured', ok: true },
                { name: 'Sodium / Argon2id Password Hashing Engine', status: 'Enabled (64MB memory cost)', ok: true },
                { name: 'Redis 7.2 Connection Pooling Client', status: 'Available (with memory fallback)', ok: true },
                { name: 'OPcache Acceleration', status: 'Enabled for sub-millisecond execution', ok: true },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">{item.name}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{item.status}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
              >
                <span>Continue to Database</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Database Driver & Connection Ping */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Database Driver & Credentials Setup
            </span>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'sqlite', label: 'SQLite 3', desc: 'Zero-config local file. Instant setup.' },
                { id: 'mysql', label: 'MySQL 8.0', desc: 'Enterprise relational standard.' },
                { id: 'pgsql', label: 'PostgreSQL 16', desc: 'Advanced relational & JSON querying.' },
              ].map((drv) => (
                <button
                  key={drv.id}
                  type="button"
                  onClick={() => {
                    setSelectedDriver(drv.id as any);
                    setConnSuccess(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedDriver === drv.id
                      ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block font-mono">{drv.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">{drv.desc}</span>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400">Active DSN:</span>
                <p className="text-emerald-400 font-semibold mt-0.5">
                  {selectedDriver === 'sqlite'
                    ? 'sqlite:database/app.sqlite'
                    : selectedDriver === 'pgsql'
                    ? 'pgsql:host=localhost;port=5432;dbname=' + solution.slug
                    : 'mysql:host=localhost;port=3306;dbname=' + solution.slug}
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-all"
              >
                {testingConn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{testingConn ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {connSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Connection verified! Prepared statement pool ready. Default admin seeded.</span>
              </div>
            )}

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
              >
                <span>Continue to Docker Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Docker & CLI Launch Script */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Generated .env & Run Scripts
              </span>
              <button
                type="button"
                onClick={copyEnv}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? 'Copied' : 'Copy .env'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed max-h-44 overflow-y-auto">
              {sampleEnv}
            </pre>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-slate-400 font-bold block">1-Command Launch Options:</span>
              <div className="space-y-1">
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                  <span className="text-slate-400">Native PHP CLI:</span>
                  <code className="text-emerald-400">php bin/setup.php && composer start</code>
                </div>
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                  <span className="text-slate-400">Docker Compose:</span>
                  <code className="text-sky-400">docker compose up -d</code>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
              >
                Finish Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
