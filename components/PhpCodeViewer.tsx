'use client';

import React, { useState } from 'react';
import { GeneratedFile, SolutionProject } from '@/lib/scaffold/types';
import { generatePhpSolution } from '@/lib/scaffold/php-generator';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Search, 
  ExternalLink,
  Code2
} from 'lucide-react';

interface PhpCodeViewerProps {
  solution: SolutionProject;
  onDownloadZip: () => void;
}

export function PhpCodeViewer({ solution, onDownloadZip }: PhpCodeViewerProps) {
  const files: GeneratedFile[] = generatePhpSolution(solution);
  const [selectedPath, setSelectedPath] = useState<string>(files[0]?.path || 'composer.json');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedFile = files.find((f) => f.path === selectedPath) || files[0];

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file.php';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[680px] bg-slate-950 text-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-800">
      {/* File Tree Sidebar */}
      <div className="w-full md:w-80 flex flex-col bg-slate-900/40 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
            PSR-4 Solution Tree ({files.length} files)
          </span>
          <button
            type="button"
            onClick={onDownloadZip}
            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>.ZIP</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 text-[10px]">
          {['all', 'bloc', 'controller', 'model', 'view', 'config'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded-md font-mono capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Files list */}
        <div className="flex-1 overflow-y-auto space-y-1 max-h-[500px]">
          {filteredFiles.map((file) => {
            const isSelected = selectedPath === file.path;
            const parts = file.path.split('/');
            const filename = parts.pop();
            const dir = parts.join('/');

            return (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedPath(file.path)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="truncate">
                  {dir && <span className="opacity-60 text-[10px] block truncate">{dir}/</span>}
                  <span className="font-semibold truncate">{filename}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans uppercase ${
                  isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {file.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Editor View */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Editor Top Bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="font-mono text-xs font-semibold text-white truncate">
              {selectedFile?.path}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
              {selectedFile?.language.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSingle}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 font-mono text-xs leading-relaxed overflow-x-auto text-slate-200">
            <pre className="table w-full">
              {selectedFile?.code.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-slate-800/40">
                  <span className="table-cell select-none pr-4 text-slate-600 text-right w-10 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre font-mono text-slate-200">
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
