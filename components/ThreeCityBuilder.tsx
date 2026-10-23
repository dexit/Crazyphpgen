'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SolutionProject, BlocItem, BlocType } from '@/lib/scaffold/types';
import { PHP_STUBS_CATALOG, PhpStubContract } from '@/lib/scaffold/php-stubs';
import { 
  Boxes, 
  RotateCcw, 
  Eye, 
  Layers, 
  Sparkles, 
  Compass, 
  Sun, 
  Moon,
  Workflow,
  ArrowUpRight,
  Code2,
  Move,
  Plane,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  ArrowUp,
  Shield,
  Home,
  Database,
  PenTool,
  Cpu,
  FlaskConical,
  Radio,
  FileCode2,
  Check
} from 'lucide-react';

interface ThreeCityBuilderProps {
  solution: SolutionProject;
  selectedBlocId: string | null;
  onSelectBloc: (blocId: string) => void;
  onUpdateBlocGrid: (blocId: string, delta: { colStart?: number; colSpan?: number; rowStart?: number; rowSpan?: number }) => void;
}

type SkyAtmosphere = 'cyber_twilight' | 'sunset_metropolis' | 'daylight_strato' | 'emerald_matrix';
type CameraProjection = 'isometric_town' | 'metropolis_perspective' | 'top_ortho';
type VoxelTool = 'select' | 'place' | 'grow' | 'road' | 'demolish';

export type BuildingBlockType = 
  | 'controller' 
  | 'view' 
  | 'table' 
  | 'form' 
  | 'model' 
  | 'auth' 
  | 'middleware' 
  | 'test';

export function ThreeCityBuilder({
  solution,
  selectedBlocId,
  onSelectBloc,
  onUpdateBlocGrid,
}: ThreeCityBuilderProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Voxel / Building Growth State
  const [activeTool, setActiveTool] = useState<VoxelTool>('select');
  const [selectedBlockType, setSelectedBlockType] = useState<BuildingBlockType>('controller');
  const [buildingTiers, setBuildingTiers] = useState<Record<string, number>>({});
  const [atmosphere, setAtmosphere] = useState<SkyAtmosphere>('cyber_twilight');
  const [cameraMode, setCameraMode] = useState<CameraProjection>('isometric_town');
  const [autoRotate, setAutoRotate] = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<BlocItem | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ col: number; row: number } | null>(null);
  const [activeStub, setActiveStub] = useState<PhpStubContract | null>(null);

  const activeBloc = solution.blocs.find((b) => b.id === selectedBlocId) || solution.blocs[0];

  // Increase Building Tier (Growing mechanism)
  const handleGrowBuilding = (blocId: string) => {
    setBuildingTiers((prev) => {
      const current = prev[blocId] || 1;
      const next = Math.min(current + 1, 4);
      return { ...prev, [blocId]: next };
    });
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 650;

    const atmoConfig = {
      cyber_twilight: {
        bg: 0x060919,
        fog: 0x060919,
        ambient: 0x312e81,
        ambientInt: 1.8,
        sun: 0x818cf8,
        sunInt: 2.2,
        gridGlow: 0x6366f1,
        cloudColor: 0x1e1b4b,
        roadColor: 0x1e293b,
      },
      sunset_metropolis: {
        bg: 0x1c0d28,
        fog: 0x1c0d28,
        ambient: 0x7c2d12,
        ambientInt: 2.0,
        sun: 0xf59e0b,
        sunInt: 2.5,
        gridGlow: 0xf97316,
        cloudColor: 0x451a03,
        roadColor: 0x3b1d28,
      },
      daylight_strato: {
        bg: 0x0c1a30,
        fog: 0x0c1a30,
        ambient: 0x38bdf8,
        ambientInt: 1.6,
        sun: 0xffffff,
        sunInt: 2.4,
        gridGlow: 0x0284c7,
        cloudColor: 0x0f2942,
        roadColor: 0x1e293b,
      },
      emerald_matrix: {
        bg: 0x021a12,
        fog: 0x021a12,
        ambient: 0x064e3b,
        ambientInt: 1.8,
        sun: 0x34d399,
        sunInt: 2.2,
        gridGlow: 0x10b981,
        cloudColor: 0x022c22,
        roadColor: 0x064e3b,
      },
    }[atmosphere];

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(atmoConfig.bg);
    scene.fog = new THREE.FogExp2(atmoConfig.fog, 0.009);

    // 2. Camera Setup (Orthographic for Isometric Town vs Perspective for Sky Metropolis)
    let camera: THREE.Camera;
    const aspect = width / height;

    if (cameraMode === 'isometric_town') {
      const d = 26;
      camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
      camera.position.set(40, 40, 40);
      camera.lookAt(0, 0, 0);
    } else if (cameraMode === 'top_ortho') {
      const d = 24;
      camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
      camera.position.set(0, 60, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
      camera.position.set(28, 30, 42);
      camera.lookAt(0, 2, 0);
    }
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(atmoConfig.ambient, atmoConfig.ambientInt);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(atmoConfig.sun, atmoConfig.sunInt);
    dirLight.position.set(40, 55, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
    rimLight.position.set(-30, 25, -25);
    scene.add(rimLight);

    // 5. 12-Column Ground Voxel Platform (Isometric Town / Sky Isle)
    const gridCols = 12;
    const colWidth = 3.2;
    const totalWidth = gridCols * colWidth;
    const totalDepth = 36;

    // Foundation Isle
    const platformGeo = new THREE.BoxGeometry(totalWidth + 6, 1.8, totalDepth + 6);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.8,
      metalness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.9;
    platform.receiveShadow = true;
    scene.add(platform);

    // Neon Perimeter Grid
    const borderGeo = new THREE.BoxGeometry(totalWidth + 6.3, 0.2, totalDepth + 6.3);
    const borderMat = new THREE.MeshBasicMaterial({ color: atmoConfig.gridGlow, wireframe: true });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.y = 0.05;
    scene.add(borderMesh);

    // Voxel Ground Grid Tiles (12 columns x 6 rows)
    const groundTilesGroup = new THREE.Group();
    const tileGeo = new THREE.PlaneGeometry(colWidth - 0.2, 5.2);
    tileGeo.rotateX(-Math.PI / 2);

    for (let c = 1; c <= 12; c++) {
      for (let r = 1; r <= 6; r++) {
        const x = -totalWidth / 2 + (c - 0.5) * colWidth;
        const z = -totalDepth / 2 + (r - 0.5) * 5.6 + 1.2;

        const tileMat = new THREE.MeshStandardMaterial({
          color: (c + r) % 2 === 0 ? 0x0f172a : 0x0b1120,
          roughness: 0.8,
        });
        const tileMesh = new THREE.Mesh(tileGeo, tileMat);
        tileMesh.position.set(x, 0.02, z);
        tileMesh.receiveShadow = true;
        (tileMesh as any).userData = { col: c, row: r, isTile: true };
        groundTilesGroup.add(tileMesh);
      }
    }
    scene.add(groundTilesGroup);

    // 6. Volumetric Cloud Layer drifting underneath
    const cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: atmoConfig.cloudColor,
      roughness: 0.9,
      transparent: true,
      opacity: 0.7,
    });
    for (let ci = 0; ci < 20; ci++) {
      const puffGeo = new THREE.DodecahedronGeometry(Math.random() * 5 + 4, 1);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (Math.random() - 0.5) * (totalWidth * 2.2),
        -12 + (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * (totalDepth * 2.2)
      );
      cloudsGroup.add(puff);
    }
    scene.add(cloudsGroup);

    // 7. Render Procedural Growing Architectural Buildings
    const meshMap = new Map<string, THREE.Group>();
    meshMapRef.current = meshMap;

    solution.blocs.forEach((bloc) => {
      const group = new THREE.Group();
      group.name = `bloc_${bloc.id}`;
      (group as any).userData = { blocId: bloc.id, bloc };

      const spanCols = Math.min(bloc.grid.colSpan, 13 - bloc.grid.colStart);
      const bWidth = spanCols * colWidth - 0.5;
      const bDepth = bloc.grid.rowSpan * 5.2 - 0.6;

      const startX = -totalWidth / 2 + (bloc.grid.colStart - 1) * colWidth;
      const centerX = startX + bWidth / 2;
      const centerZ = -totalDepth / 2 + (bloc.grid.rowStart - 1) * 5.6 + bDepth / 2 + 1.2;

      // Tier Level (default 1, grows up to 4)
      const tierLevel = buildingTiers[bloc.id] || 1;

      // Color coding based on architecture type
      let baseHeight = 2.4 + (tierLevel - 1) * 1.6;
      let primaryColor = 0x6366f1; // Indigo Controller
      let glowColor = 0x818cf8;

      if (bloc.type === 'metric') {
        primaryColor = 0x10b981; // Emerald KPI
        glowColor = 0x34d399;
      } else if (bloc.type === 'datagrid') {
        primaryColor = 0x4f46e5; // Indigo Table
        glowColor = 0xa5b4fc;
      } else if (bloc.type === 'form') {
        primaryColor = 0xf59e0b; // Amber Form
        glowColor = 0xfcd34d;
      } else if (bloc.type === 'chart') {
        primaryColor = 0x0ea5e9; // Sky Chart
        glowColor = 0x7dd3fc;
      } else if (bloc.type === 'kanban') {
        primaryColor = 0xf43f5e; // Rose Pipeline
        glowColor = 0xfb7185;
      } else if (bloc.type === 'filter_bar') {
        primaryColor = 0xa855f7; // Purple Filter
        glowColor = 0xd8b4fe;
      }

      const isSelected = selectedBlocId === bloc.id;

      // Pedestal
      const baseGeo = new THREE.BoxGeometry(bWidth + 0.2, 0.4, bDepth + 0.2);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.2;
      group.add(baseMesh);

      // Floor Tiers (Procedural Growing Building Floors!)
      for (let t = 0; t < tierLevel; t++) {
        const floorHeight = 1.6;
        const scale = 1 - t * 0.08;
        const floorGeo = new THREE.BoxGeometry(bWidth * scale, floorHeight, bDepth * scale);
        const floorMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x3730a3 : primaryColor,
          roughness: 0.35,
          metalness: 0.5,
          emissive: isSelected ? primaryColor : 0x000000,
          emissiveIntensity: isSelected ? 0.35 : 0.08,
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.position.y = 0.4 + t * floorHeight + floorHeight / 2;
        floorMesh.castShadow = true;
        floorMesh.receiveShadow = true;
        group.add(floorMesh);

        // Window edge illumination
        const edgeGeo = new THREE.EdgesGeometry(floorGeo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: isSelected ? 0xffffff : glowColor,
          transparent: true,
          opacity: 0.65,
        });
        const edgeSegments = new THREE.LineSegments(edgeGeo, edgeMat);
        edgeSegments.position.copy(floorMesh.position);
        group.add(edgeSegments);
      }

      // Rooftop Feature
      const totalRoofY = 0.4 + tierLevel * 1.6;
      const roofCapGeo = new THREE.BoxGeometry(bWidth * 0.7, 0.3, bDepth * 0.7);
      const roofCapMat = new THREE.MeshStandardMaterial({ color: 0x0b1120 });
      const roofCap = new THREE.Mesh(roofCapGeo, roofCapMat);
      roofCap.position.y = totalRoofY + 0.15;
      group.add(roofCap);

      // Spire Antenna with Blinking Navigation Light
      const antennaGeo = new THREE.CylinderGeometry(0.06, 0.12, 1.4, 8);
      const antennaMat = new THREE.MeshBasicMaterial({ color: glowColor });
      const antenna = new THREE.Mesh(antennaGeo, antennaMat);
      antenna.position.y = totalRoofY + 0.3 + 0.7;
      group.add(antenna);

      const beaconGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = totalRoofY + 1.8;
      group.add(beacon);

      group.position.set(centerX, 0, centerZ);
      scene.add(group);
      meshMap.set(bloc.id, group);
    });

    // 8. Connecting Data Conduits (Roads & Energy highways)
    const roadSplines: THREE.CatmullRomCurve3[] = [];
    for (let i = 0; i < solution.blocs.length - 1; i++) {
      const b1 = meshMap.get(solution.blocs[i].id);
      const b2 = meshMap.get(solution.blocs[i + 1].id);
      if (b1 && b2) {
        const p1 = b1.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        const p2 = b2.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        const mid = p1.clone().lerp(p2, 0.5).add(new THREE.Vector3(0, 2.0, 0));

        const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
        roadSplines.push(curve);

        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.1, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: atmoConfig.gridGlow,
          transparent: true,
          opacity: 0.55,
        });
        scene.add(new THREE.Mesh(tubeGeo, tubeMat));
      }
    }

    // 9. Drones traveling conduits
    const drones: THREE.Group[] = [];
    roadSplines.forEach((curve) => {
      const droneGroup = new THREE.Group();
      const hullGeo = new THREE.ConeGeometry(0.3, 0.8, 5);
      hullGeo.rotateX(Math.PI / 2);
      const hullMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 });
      droneGroup.add(new THREE.Mesh(hullGeo, hullMat));
      scene.add(droneGroup);
      drones.push(droneGroup);
    });

    // 10. Mouse Interaction (Orbit / Pan / Click / Hover)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let theta = Math.PI / 4;
    let phi = Math.PI / 3.4;
    let radius = 62;

    const updateCamera = () => {
      if (cameraMode === 'isometric_town') {
        const d = 26;
        (camera as THREE.OrthographicCamera).position.set(
          d * Math.sin(theta),
          d * 1.1,
          d * Math.cos(theta)
        );
        camera.lookAt(0, 0, 0);
      } else if (cameraMode === 'top_ortho') {
        camera.position.set(0, 60, 0);
        camera.lookAt(0, 0, 0);
      } else {
        (camera as THREE.PerspectiveCamera).position.x = radius * Math.sin(phi) * Math.sin(theta);
        (camera as THREE.PerspectiveCamera).position.y = radius * Math.cos(phi);
        (camera as THREE.PerspectiveCamera).position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 2, 0);
      }
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);
      let foundBloc: BlocItem | null = null;
      let foundTileCoords: { col: number; row: number } | null = null;

      for (const hit of intersects) {
        let parent: any = hit.object;
        if (parent.userData?.isTile) {
          foundTileCoords = { col: parent.userData.col, row: parent.userData.row };
        }
        while (parent) {
          if (parent.userData?.bloc) {
            foundBloc = parent.userData.bloc;
            break;
          }
          parent = parent.parent;
        }
        if (foundBloc) break;
      }
      setHoveredBuilding(foundBloc);
      setHoveredTile(foundTileCoords);

      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      theta -= dx * 0.007;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - dy * 0.007));
      updateCamera();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let parent: any = hit.object;

        // Check if building clicked
        while (parent) {
          if (parent.userData?.blocId) {
            const bId = parent.userData.blocId;
            onSelectBloc(bId);

            if (activeTool === 'grow') {
              handleGrowBuilding(bId);
            }
            return;
          }
          parent = parent.parent;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(20, Math.min(100, radius + e.deltaY * 0.05));
      updateCamera();
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 11. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Cloud rotation
      cloudsGroup.rotation.y = elapsed * 0.012;

      // Auto-rotate
      if (autoRotate && !isDragging) {
        theta += 0.003;
        updateCamera();
      }

      // Drone flight
      drones.forEach((drone, idx) => {
        const curve = roadSplines[idx];
        if (curve) {
          const t = (elapsed * 0.35 + idx * 0.3) % 1;
          const pos = curve.getPoint(t);
          const tangent = curve.getTangent(t);
          drone.position.copy(pos);
          drone.lookAt(pos.clone().add(tangent));
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [solution, selectedBlocId, buildingTiers, atmosphere, cameraMode, autoRotate, activeTool]);

  return (
    <div className="relative w-full h-[680px] bg-slate-950 overflow-hidden select-none flex flex-col">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Top Left: Sky Metropolis & Voxel Toolset */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-950/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-2xl">
        {/* Brand */}
        <div className="flex items-center gap-1.5 px-2 font-mono text-[11px] text-sky-400 font-bold border-r border-slate-800">
          <Plane className="w-3.5 h-3.5" />
          <span>Voxel Metropolis</span>
        </div>

        {/* Camera Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setCameraMode('isometric_town')}
            className={`px-2 py-0.5 rounded transition-all ${
              cameraMode === 'isometric_town' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Isometric 45° Town View"
          >
            Isometric
          </button>
          <button
            type="button"
            onClick={() => setCameraMode('metropolis_perspective')}
            className={`px-2 py-0.5 rounded transition-all ${
              cameraMode === 'metropolis_perspective' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Perspective Metropolis View"
          >
            Perspective
          </button>
          <button
            type="button"
            onClick={() => setCameraMode('top_ortho')}
            className={`px-2 py-0.5 rounded transition-all ${
              cameraMode === 'top_ortho' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Top-Down 12-Col View"
          >
            Top 12-Col
          </button>
        </div>

        {/* Atmosphere Presets */}
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
          {[
            { id: 'cyber_twilight', label: 'Twilight' },
            { id: 'sunset_metropolis', label: 'Sunset' },
            { id: 'daylight_strato', label: 'Daylight' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAtmosphere(item.id as any)}
              className={`px-2 py-0.5 rounded transition-all ${
                atmosphere === item.id ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Auto Orbit */}
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-xs transition-all ${
            autoRotate ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
          title="Auto-rotate Camera"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>{autoRotate ? 'Orbit: ON' : 'Orbit: OFF'}</span>
        </button>
      </div>

      {/* Top Center: Growing Building / Voxel Action Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-2xl">
        <span className="text-[10px] uppercase font-mono text-slate-400 px-2 font-semibold">
          3D Voxel Tools:
        </span>

        <button
          type="button"
          onClick={() => setActiveTool('select')}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 transition-all ${
            activeTool === 'select' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          <span>Select</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTool('grow');
            if (activeBloc) handleGrowBuilding(activeBloc.id);
          }}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 transition-all ${
            activeTool === 'grow' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
          title="Grow Building Tier (+Floor)"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Grow (+Tier)</span>
        </button>
      </div>

      {/* Bottom Left: Hovered / Selected Architectural Building Card */}
      {(hoveredBuilding || activeBloc) && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white text-sm truncate">
                {(hoveredBuilding || activeBloc)?.title}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
              Tier {buildingTiers[(hoveredBuilding || activeBloc)?.id || ''] || 1} Building
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Class:</span>
              <span className="text-emerald-400 font-semibold">{(hoveredBuilding || activeBloc)?.phpConfig.className}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bound Model:</span>
              <span className="text-sky-400">{(hoveredBuilding || activeBloc)?.phpConfig.modelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">12-Col Footprint:</span>
              <span className="text-amber-400">
                Col {(hoveredBuilding || activeBloc)?.grid.colStart} (Span {(hoveredBuilding || activeBloc)?.grid.colSpan}w)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PSR Route:</span>
              <span className="text-purple-400">{(hoveredBuilding || activeBloc)?.phpConfig.psrRoute}</span>
            </div>
          </div>

          {/* Quick Grow Action */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleGrowBuilding((hoveredBuilding || activeBloc)!.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all font-mono text-[10px]"
            >
              <ArrowUp className="w-3 h-3" />
              <span>Grow Tier (+Floor)</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono">Click building to grow</span>
          </div>
        </div>
      )}

      {/* Bottom Right: 12-Col 3D Positioning Controls */}
      {activeBloc && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-2xl text-xs space-y-2.5 max-w-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-semibold text-white font-mono text-xs flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-indigo-400" />
              12-Col Ground Lane
            </span>
            <span className="text-[10px] font-mono px-1.5 rounded bg-indigo-500/20 text-indigo-300">
              Col {activeBloc.grid.colStart}:{activeBloc.grid.colSpan}w
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {/* Shift Col Left/Right */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  if (activeBloc.grid.colStart > 1) {
                    onUpdateBlocGrid(activeBloc.id, { colStart: activeBloc.grid.colStart - 1 });
                  }
                }}
                disabled={activeBloc.grid.colStart <= 1}
                className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                title="Shift Lane West"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-200">Lane {activeBloc.grid.colStart}</span>
              <button
                type="button"
                onClick={() => {
                  if (activeBloc.grid.colStart + activeBloc.grid.colSpan <= 12) {
                    onUpdateBlocGrid(activeBloc.id, { colStart: activeBloc.grid.colStart + 1 });
                  }
                }}
                disabled={activeBloc.grid.colStart + activeBloc.grid.colSpan > 12}
                className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                title="Shift Lane East"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Span Width Adjust */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  if (activeBloc.grid.colSpan > 1) {
                    onUpdateBlocGrid(activeBloc.id, { colSpan: activeBloc.grid.colSpan - 1 });
                  }
                }}
                disabled={activeBloc.grid.colSpan <= 1}
                className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                title="Narrow Span"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-200">{activeBloc.grid.colSpan}w</span>
              <button
                type="button"
                onClick={() => {
                  if (activeBloc.grid.colStart + activeBloc.grid.colSpan <= 13) {
                    onUpdateBlocGrid(activeBloc.id, { colSpan: activeBloc.grid.colSpan + 1 });
                  }
                }}
                disabled={activeBloc.grid.colStart + activeBloc.grid.colSpan > 12}
                className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                title="Widen Span"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
