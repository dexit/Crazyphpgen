'use client';

import React, { useState } from 'react';
import { QueueJob, SolutionProject } from '@/lib/scaffold/types';
import { 
  Cpu, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  Radio, 
  Play, 
  Trash2,
  Zap,
  Activity
} from 'lucide-react';

interface QueueAndRedisMonitorProps {
  solution: SolutionProject;
}

export function QueueAndRedisMonitor({ solution }: QueueAndRedisMonitorProps) {
  const [activeQueue, setActiveQueue] = useState<string>('default');
  const [selectedJobClass, setSelectedJobClass] = useState<string>('App\\Jobs\\SendWelcomeEmailJob');
  const [jobPayload, setJobPayload] = useState<string>(
    JSON.stringify({ userId: 1, email: 'admin@gridbloc.local', template: 'welcome_v1' }, null, 2)
  );
  const [isDispatching, setIsDispatching] = useState(false);
  const [workerRunning, setWorkerRunning] = useState(false);

  const [jobs, setJobs] = useState<QueueJob[]>([
    {
      id: 'job_88a91b2c',
      queue: 'default',
      handler: 'App\\Jobs\\SendWelcomeEmailJob',
      payload: { userId: 1, email: 'admin@gridbloc.local' },
      status: 'completed',
      attempts: 1,
      maxAttempts: 3,
      createdAt: '16:42:01',
      completedAt: '16:42:02',
    },
    {
      id: 'job_e4f71a09',
      queue: 'billing',
      handler: 'App\\Jobs\\ProcessSubscriptionBilling',
      payload: { workspaceId: 1, amountCents: 49900 },
      status: 'completed',
      attempts: 1,
      maxAttempts: 3,
      createdAt: '16:42:15',
      completedAt: '16:42:16',
    },
    {
      id: 'job_03bc9842',
      queue: 'default',
      handler: 'App\\Jobs\\SyncInventoryWarehouse',
      payload: { sku: 'HYPER-991', quantity: 450 },
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      createdAt: '16:43:10',
    },
  ]);

  const [workerLogs, setWorkerLogs] = useState<string[]>([
    '[16:42:01] [Worker:1] [Redis] Connection pool initialized to redis://redis:6379 (pool size: 10)',
    '[16:42:02] [Worker:1] Processed job_88a91b2c (App\\Jobs\\SendWelcomeEmailJob) in 14.2ms [OK]',
    '[16:42:16] [Worker:2] Processed job_e4f71a09 (App\\Jobs\\ProcessSubscriptionBilling) in 48.6ms [OK]',
  ]);

  const handleDispatchJob = () => {
    setIsDispatching(true);
    let parsed: any = {};
    try {
      parsed = JSON.parse(jobPayload);
    } catch {
      parsed = { raw: jobPayload };
    }

    const newJob: QueueJob = {
      id: `job_${Math.random().toString(36).slice(2, 10)}`,
      queue: activeQueue,
      handler: selectedJobClass,
      payload: parsed,
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toLocaleTimeString(),
    };

    setTimeout(() => {
      setJobs((prev) => [newJob, ...prev]);
      setWorkerLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] [RedisClient] LPUSH queues:${activeQueue} -> ${newJob.id}`,
        ...prev,
      ]);
      setIsDispatching(false);
    }, 300);
  };

  const handleProcessNextJob = () => {
    const pendingJob = jobs.find((j) => j.status === 'pending');
    if (!pendingJob) return;

    setWorkerRunning(true);
    setJobs((prev) =>
      prev.map((j) => (j.id === pendingJob.id ? { ...j, status: 'processing', attempts: 1 } : j))
    );

    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === pendingJob.id
            ? { ...j, status: 'completed', completedAt: new Date().toLocaleTimeString() }
            : j
        )
      );
      setWorkerLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] [Worker] Executed ${pendingJob.id} (${pendingJob.handler}) in 18.4ms [200 OK]`,
        ...prev,
      ]);
      setWorkerRunning(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full min-h-[680px] bg-slate-950 text-slate-100 divide-y divide-slate-800">
      {/* Top Banner & Redis Pooling Strip */}
      <div className="p-4 lg:p-5 bg-slate-900/80 border-b border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              Redis Connection Pooling & Asynchronous Message Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Redis 7.2 stream monitor, background workers, and asynchronous job dispatcher.
            </p>
          </div>

          {/* Redis Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Redis: Connected (redis:6379)</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60">
              Latency: 0.38ms
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60">
              Pool: 10/10 Active
            </span>
          </div>
        </div>

        {/* Quick Job Dispatcher Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 items-end">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Queue Name</label>
            <select
              value={activeQueue}
              onChange={(e) => setActiveQueue(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="default">queues:default</option>
              <option value="billing">queues:billing</option>
              <option value="notifications">queues:notifications</option>
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Job Class Handler</label>
            <select
              value={selectedJobClass}
              onChange={(e) => setSelectedJobClass(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-rose-300 focus:outline-none focus:border-rose-500"
            >
              <option value="App\Jobs\SendWelcomeEmailJob">App\Jobs\SendWelcomeEmailJob</option>
              <option value="App\Jobs\ProcessSubscriptionBilling">App\Jobs\ProcessSubscriptionBilling</option>
              <option value="App\Jobs\SyncInventoryWarehouse">App\Jobs\SyncInventoryWarehouse</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              onClick={handleDispatchJob}
              disabled={isDispatching}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
            >
              {isDispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Push to Redis</span>
            </button>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleProcessNextJob}
              disabled={workerRunning || !jobs.some((j) => j.status === 'pending')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
            >
              {workerRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>Work Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Queue Jobs Table + Live Worker Console */}
      <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
        {/* Jobs Table */}
        <div className="flex-1 p-4 lg:p-5 overflow-auto space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Jobs Stream ({jobs.length})
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Job ID</th>
                  <th className="py-2.5 px-3">Queue</th>
                  <th className="py-2.5 px-3">Handler</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-indigo-400">{job.id}</td>
                    <td className="py-2.5 px-3 text-slate-400">{job.queue}</td>
                    <td className="py-2.5 px-3 text-slate-200">{job.handler}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-sans font-semibold ${
                        job.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : job.status === 'processing'
                          ? 'bg-sky-500/10 text-sky-400 animate-pulse'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{job.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Worker Console */}
        <div className="w-full lg:w-96 p-4 lg:p-5 bg-slate-950 flex flex-col justify-between space-y-3 font-mono text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-semibold uppercase text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Worker Stream
              </span>
              <span className="text-[10px] text-emerald-400 animate-pulse">● Listening</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1.5 h-72 overflow-y-auto leading-relaxed text-slate-300">
              {workerLogs.map((log, idx) => (
                <div key={idx} className="hover:text-white">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>CLI Worker Command:</span>
              <code className="text-rose-400">php bin/queue-worker.php</code>
            </div>
            <p className="text-[10px] text-slate-500">
              Processes Redis list entries using atomic POP operations to prevent race conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
