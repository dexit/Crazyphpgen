'use client';

import React, { useState } from 'react';
import { 
  SolutionProject, 
  BlocItem, 
  BlocType, 
  PHPFramework, 
  DbTable, 
  RolePermission,
  DbRowRecord
} from '@/lib/scaffold/types';
import { 
  PRESET_SOLUTIONS, 
  clampGrid, 
  createDefaultBloc 
} from '@/lib/scaffold/bloc-engine';
import { generatePhpSolution } from '@/lib/scaffold/php-generator';
import { createSolutionZip, triggerDownload } from '@/lib/scaffold/zip-exporter';

import { Header, ActiveTab } from '@/components/Header';
import { VisualGridCanvas } from '@/components/VisualGridCanvas';
import { ThreeCityBuilder } from '@/components/ThreeCityBuilder';
import { PrismaStudioViewer } from '@/components/PrismaStudioViewer';
import { QueueAndRedisMonitor } from '@/components/QueueAndRedisMonitor';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import { UmlClassDiagram } from '@/components/UmlClassDiagram';
import { DatabasePlanner } from '@/components/DatabasePlanner';
import { PhpCodeViewer } from '@/components/PhpCodeViewer';
import { PhpSimulationSandbox } from '@/components/PhpSimulationSandbox';
import { BlocInspector } from '@/components/BlocInspector';
import { AddBlocModal } from '@/components/AddBlocModal';
import { AiArchitectModal } from '@/components/AiArchitectModal';
import { BabysittingInstallerModal } from '@/components/BabysittingInstallerModal';

export default function HomePage() {
  const [solution, setSolution] = useState<SolutionProject>(PRESET_SOLUTIONS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('grid');
  const [selectedBlocId, setSelectedBlocId] = useState<string | null>(solution.blocs[0]?.id || null);
  const [gridGuidesActive, setGridGuidesActive] = useState(true);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Update Bloc Grid Coordinates
  const handleUpdateBlocGrid = (
    blocId: string,
    delta: { colStart?: number; colSpan?: number; rowStart?: number; rowSpan?: number }
  ) => {
    setSolution((prev) => {
      const updatedBlocs = prev.blocs.map((b) => {
        if (b.id === blocId) {
          const nextCoord = clampGrid({
            colStart: delta.colStart ?? b.grid.colStart,
            colSpan: delta.colSpan ?? b.grid.colSpan,
            rowStart: delta.rowStart ?? b.grid.rowStart,
            rowSpan: delta.rowSpan ?? b.grid.rowSpan,
          });
          return { ...b, grid: nextCoord };
        }
        return b;
      });
      return { ...prev, blocs: updatedBlocs };
    });
  };

  // Delete Bloc
  const handleDeleteBloc = (blocId: string) => {
    setSolution((prev) => ({
      ...prev,
      blocs: prev.blocs.filter((b) => b.id !== blocId),
    }));
    if (selectedBlocId === blocId) {
      setSelectedBlocId(null);
      setIsInspectorOpen(false);
    }
  };

  // Add Bloc
  const handleAddBloc = (type: BlocType) => {
    const newBloc = createDefaultBloc(type, solution.blocs.length);
    setSolution((prev) => ({
      ...prev,
      blocs: [...prev.blocs, newBloc],
    }));
    setSelectedBlocId(newBloc.id);
  };

  // Select Bloc
  const handleSelectBloc = (blocId: string) => {
    setSelectedBlocId(blocId);
    setIsInspectorOpen(true);
  };

  // Update Bloc Object
  const handleUpdateBloc = (updated: BlocItem) => {
    setSolution((prev) => ({
      ...prev,
      blocs: prev.blocs.map((b) => (b.id === updated.id ? updated : b)),
    }));
  };

  // Update Database Tables & Permissions
  const handleUpdateTables = (tables: DbTable[]) => {
    setSolution((prev) => ({ ...prev, dbTables: tables }));
  };

  const handleUpdatePermissions = (perms: RolePermission[]) => {
    setSolution((prev) => ({ ...prev, permissions: perms }));
  };

  // Update Driver
  const handleUpdateDriver = (driver: 'sqlite' | 'mysql' | 'pgsql') => {
    setSolution((prev) => ({ ...prev, databaseDriver: driver }));
  };

  // Download ZIP
  const handleDownloadZip = async () => {
    const files = generatePhpSolution(solution);
    const blob = await createSolutionZip(files, solution.slug);
    triggerDownload(blob, `${solution.slug}-php-solution.zip`);
  };

  // Copy All Code
  const handleCopyAllCode = () => {
    const files = generatePhpSolution(solution);
    const bundleText = files
      .map((f) => `// ================================\n// File: ${f.path}\n// ================================\n\n${f.code}`)
      .join('\n\n');
    navigator.clipboard.writeText(bundleText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const activeBloc = solution.blocs.find((b) => b.id === selectedBlocId) || null;

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        solution={solution}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectPreset={(p) => {
          setSolution(p);
          setSelectedBlocId(p.blocs[0]?.id || null);
        }}
        onFrameworkChange={(fw) => setSolution((prev) => ({ ...prev, framework: fw }))}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenSetupWizard={() => setIsSetupWizardOpen(true)}
        onDownloadZip={handleDownloadZip}
        onCopyAllCode={handleCopyAllCode}
        copied={copiedAll}
        gridGuidesActive={gridGuidesActive}
        onToggleGridGuides={() => setGridGuidesActive(!gridGuidesActive)}
      />

      {/* Main Tab Views */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Tab 1: 2D Grid Builder */}
        {activeTab === 'grid' && (
          <VisualGridCanvas
            solution={solution}
            selectedBlocId={selectedBlocId}
            onSelectBloc={handleSelectBloc}
            onUpdateBlocGrid={handleUpdateBlocGrid}
            onDeleteBloc={handleDeleteBloc}
            showGridGuides={gridGuidesActive}
          />
        )}

        {/* Tab 2: 3D Voxel Town & Sky Metropolis */}
        {activeTab === 'three' && (
          <ThreeCityBuilder
            solution={solution}
            selectedBlocId={selectedBlocId}
            onSelectBloc={handleSelectBloc}
            onUpdateBlocGrid={handleUpdateBlocGrid}
          />
        )}

        {/* Tab 3: Visual Prisma Studio DB Viewer */}
        {activeTab === 'studio' && (
          <PrismaStudioViewer
            solution={solution}
          />
        )}

        {/* Tab 4: Redis Pooling & Queue Messaging Monitor */}
        {activeTab === 'queue' && (
          <QueueAndRedisMonitor
            solution={solution}
          />
        )}

        {/* Tab 5: Isomorphic Architecture Flow Diagram */}
        {activeTab === 'diagram' && (
          <ArchitectureDiagram
            solution={solution}
            onSelectBloc={handleSelectBloc}
          />
        )}

        {/* Tab 6: UML Class Diagram & Interconnectedness */}
        {activeTab === 'uml' && (
          <UmlClassDiagram
            solution={solution}
            onSelectBloc={handleSelectBloc}
          />
        )}

        {/* Tab 7: Visual Database Schema & RBAC Planner */}
        {activeTab === 'database' && (
          <DatabasePlanner
            solution={solution}
            onUpdateTables={handleUpdateTables}
            onUpdatePermissions={handleUpdatePermissions}
          />
        )}

        {/* Tab 8: PSR-4 PHP Code Matrix */}
        {activeTab === 'code' && (
          <PhpCodeViewer
            solution={solution}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {/* Tab 9: Live PHP 8.3 Simulation Sandbox */}
        {activeTab === 'sandbox' && (
          <PhpSimulationSandbox
            solution={solution}
          />
        )}
      </div>

      {/* Drawer: Bloc Inspector */}
      {isInspectorOpen && activeBloc && (
        <BlocInspector
          bloc={activeBloc}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateBloc={handleUpdateBloc}
        />
      )}

      {/* Modal: Add Bloc */}
      <AddBlocModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBloc={handleAddBloc}
      />

      {/* Modal: AI Architect */}
      <AiArchitectModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        solution={solution}
        onApplySolution={(newSol) => {
          setSolution(newSol);
          setSelectedBlocId(newSol.blocs[0]?.id || null);
        }}
      />

      {/* Modal: Babysitting Installer & Setup Wizard */}
      <BabysittingInstallerModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
        solution={solution}
        onUpdateDriver={handleUpdateDriver}
      />
    </main>
  );
}
