/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { create } from 'zustand';

// --- 1. CONSTANTS & TYPES ---
const GRID_SIZE = 64;
const TICK_RATE_MS = 1000;

const MILESTONES = [
  { tier: 1, name: 'Camp', popRequired: 0, unlocks: ['ROAD', 'RESIDENTIAL', 'POWER', 'WATER_PUMP', 'PARK'] },
  { tier: 2, name: 'Village', popRequired: 50, unlocks: ['COMMERCIAL'] },
  { tier: 3, name: 'Town', popRequired: 200, unlocks: ['INDUSTRIAL'] },
  { tier: 4, name: 'City', popRequired: 1000, unlocks: [] },
];

const BUILDINGS = {
  NONE: { cost: 0, color: '#000', type: 'infra', name: 'None' },
  ROAD: { cost: 10, color: '#555555', type: 'infra', name: 'Road' },
  RESIDENTIAL: { cost: 50, color: '#2ecc71', type: 'zone', name: 'Residential' },
  COMMERCIAL: { cost: 100, color: '#3498db', type: 'zone', name: 'Commercial' },
  INDUSTRIAL: { cost: 150, color: '#f1c40f', type: 'zone', name: 'Industrial' },
  POWER: { cost: 500, color: '#e74c3c', type: 'util', name: 'Power Plant' },
  WATER_PUMP: { cost: 300, color: '#85c1e9', type: 'util', name: 'Water Pump' },
  PARK: { cost: 200, color: '#27ae60', type: 'serv', name: 'Park' },
};

const PALETTE = {
  GRASS: '#4ade80',
  WATER: '#3b82f6',
  SAND: '#fcd34d',
  FOREST: '#166534',
};

// --- 2. FAST NOISE GENERATOR ---
const SimpleNoise = {
  p: new Uint8Array(512),
  init(seed = 1234) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const r = Math.floor((seed * (i + 1) * 1234.5678) % (i + 1));
      [p[i], p[r]] = [p[r], p[i]];
    }
    for (let i = 0; i < 512; i++) this.p[i] = p[i & 255];
  },
  fade: (t) => t * t * t * (t * (t * 6 - 15) + 10),
  lerp: (t, a, b) => a + t * (b - a),
  grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  },
  get(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = this.fade(x), v = this.fade(y);
    const A = this.p[X] + Y, B = this.p[X + 1] + Y;
    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(u, this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1))
    );
  }
};

const generateMap = () => {
  SimpleNoise.init(Math.random());
  const grid = [];
  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const height = SimpleNoise.get(x * 0.05, z * 0.05);
      const moisture = SimpleNoise.get(x * 0.1 + 100, z * 0.1 + 100);
      let terrain = 'GRASS';
      if (height < -0.2) terrain = 'WATER';
      else if (height < -0.1) terrain = 'SAND';
      else if (moisture > 0.3) terrain = 'FOREST';
      grid.push({ id: z * GRID_SIZE + x, x, z, terrain, building: 'NONE', level: 0, powered: false, watered: false, roadAccess: false, happiness: 100, warning: 'NONE' });
    }
  }
  return grid;
};

// --- 3. ZUSTAND STORE & SIMULATION ---
const useGameStore = create((set, get) => ({
  grid: [],
  time: 8,
  funds: 25000,
  population: 0, jobs: 0, happiness: 100,
  powerUse: 0, powerMax: 0, waterUse: 0, waterMax: 0,
  milestone: 1,
  selectedTool: 'INSPECT',
  inspectedTileIdx: null,
  heatmap: false,

  initMap: () => set({ grid: generateMap() }),
  setTool: (t) => set({ selectedTool: t, inspectedTileIdx: t !== 'INSPECT' ? null : get().inspectedTileIdx }),
  setInspectedTile: (idx) => set({ inspectedTileIdx: idx }),
  toggleHeatmap: () => set(s => ({ heatmap: !s.heatmap })),

  handleInteraction: (x, z) => {
    const { grid, funds, selectedTool } = get();
    if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) return;
    const idx = z * GRID_SIZE + x;
    const tile = grid[idx];
    if (selectedTool === 'INSPECT') { set({ inspectedTileIdx: idx }); return; }
    if (selectedTool === 'NONE') return;
    if (selectedTool === 'BULLDOZE') {
      if (tile.building !== 'NONE') {
        const newGrid = [...grid]; newGrid[idx] = { ...tile, building: 'NONE', level: 0, warning: 'NONE' };
        set({ grid: newGrid, funds: funds - 5, inspectedTileIdx: null });
      } else if (tile.terrain === 'FOREST') {
        const newGrid = [...grid]; newGrid[idx] = { ...tile, terrain: 'GRASS' };
        set({ grid: newGrid, funds: funds - 20, inspectedTileIdx: null });
      }
      return;
    }
    if (tile.terrain === 'WATER' && selectedTool !== 'WATER_PUMP' && selectedTool !== 'ROAD') return;
    if (tile.terrain === 'FOREST') return;
    if (tile.building !== 'NONE') return;
    const cost = BUILDINGS[selectedTool].cost;
    if (funds < cost) return;
    const newGrid = [...grid]; newGrid[idx] = { ...tile, building: selectedTool, level: 0 };
    set({ grid: newGrid, funds: funds - cost, inspectedTileIdx: null });
  },

  tick: () => {
    const state = get();
    if (!state.grid.length) return;
    const newGrid = [...state.grid];
    let time = state.time + 1;
    if (time >= 24) time = 0;
    let pMax = 0, pUse = 0, wMax = 0, wUse = 0;
    let pop = 0, jobs = 0, upkeep = 0;
    const powerSources = []; const waterSources = [];
    for (let i = 0; i < newGrid.length; i++) {
      const t = newGrid[i];
      if (t.building === 'POWER') { pMax += 200; powerSources.push(i); }
      if (t.building === 'WATER_PUMP') { wMax += 200; waterSources.push(i); }
      if (t.building === 'RESIDENTIAL' && t.level > 0) pop += t.level * 4;
      if ((t.building === 'COMMERCIAL' || t.building === 'INDUSTRIAL') && t.level > 0) jobs += t.level * 4;
      if (t.building !== 'NONE' && t.building !== 'ROAD') upkeep += 2;
    }
    const poweredSet = new Set(); const wateredSet = new Set(); const roadSet = new Set();
    for (let i = 0; i < newGrid.length; i++) { if (newGrid[i].building === 'ROAD') roadSet.add(i); }
    const runBFS = (sources, resultSet) => {
      const queue = [...sources]; const visited = new Set(sources);
      while (queue.length > 0) {
        const curr = queue.shift(); resultSet.add(curr);
        const x = curr % GRID_SIZE; const z = Math.floor(curr / GRID_SIZE);
        const neighbors = [[x+1,z],[x-1,z],[x,z+1],[x,z-1]];
        for (const [nx,nz] of neighbors) {
          if (nx>=0&&nx<GRID_SIZE&&nz>=0&&nz<GRID_SIZE) {
            const nIdx = nz*GRID_SIZE+nx;
            if (!visited.has(nIdx)&&(roadSet.has(nIdx)||newGrid[nIdx].building!=='NONE')) {
              visited.add(nIdx);
              if (roadSet.has(nIdx)) queue.push(nIdx);
              resultSet.add(nIdx);
            }
          }
        }
      }
    };
    if (pMax > 0) runBFS(powerSources, poweredSet);
    if (wMax > 0) runBFS(waterSources, wateredSet);
    let globalHap = 100;
    if (pUse > pMax) globalHap -= 20;
    if (wUse > wMax) globalHap -= 20;
    for (let i = 0; i < newGrid.length; i++) {
      const t = newGrid[i];
      let localHap = 50;
      const x = t.x, z = t.z;
      const neighbors = [[x+1,z],[x-1,z],[x,z+1],[x,z-1],[x+1,z+1],[x-1,z-1]];
      let hasRoad = false;
      for (const [nx,nz] of neighbors) {
        if (nx>=0&&nx<GRID_SIZE&&nz>=0&&nz<GRID_SIZE) {
          const nTile = newGrid[nz*GRID_SIZE+nx];
          if (nTile.building==='ROAD') hasRoad = true;
          if (nTile.terrain==='FOREST'||nTile.terrain==='WATER') localHap += 5;
          if (nTile.building==='PARK') localHap += 15;
          if (nTile.building==='INDUSTRIAL') localHap -= 20;
        }
      }
      t.happiness = Math.max(0, Math.min(100, localHap));
      if (t.building==='NONE'||t.building==='ROAD') continue;
      t.roadAccess = hasRoad;
      t.powered = poweredSet.has(i) && pMax > pUse;
      t.watered = wateredSet.has(i) && wMax > wUse;
      pUse += (t.level||1)*2; wUse += (t.level||1)*2;
      t.warning = 'NONE';
      if (!t.roadAccess) t.warning = 'NO_ROAD';
      else if (!t.powered && t.building!=='PARK') t.warning = 'NO_POWER';
      else if (!t.watered && t.building!=='PARK') t.warning = 'NO_WATER';
      if (t.building==='RESIDENTIAL'||t.building==='COMMERCIAL'||t.building==='INDUSTRIAL') {
        if (t.roadAccess&&t.powered&&t.watered&&t.happiness>40) { if (Math.random()<0.1&&t.level<5) t.level++; }
        else if (Math.random()<0.05&&t.level>0) { t.level--; }
      }
    }
    let newMilestone = state.milestone;
    for (let i = MILESTONES.length-1; i>=0; i--) { if (pop>=MILESTONES[i].popRequired) { newMilestone=MILESTONES[i].tier; break; } }
    let funds = state.funds;
    if (time===0) { const taxes = pop*5+jobs*8; funds += taxes-upkeep; }
    set({ grid: newGrid, time, funds, population: pop, jobs, powerMax: pMax, powerUse: pUse, waterMax: wMax, waterUse: wUse, milestone: newMilestone, happiness: Math.max(0, globalHap) });
  }
}));

// --- 4. R3F SCENE & MESHES ---
const Lighting = () => {
  const time = useGameStore(s => s.time);
  const hourAngle = ((time - 6) / 24) * Math.PI * 2;
  const sunX = Math.cos(hourAngle) * 50;
  const sunY = Math.sin(hourAngle) * 50;
  const isNight = sunY < 0;
  const ambientColor = isNight ? '#1e293b' : '#ffffff';
  const ambientInt = isNight ? 0.4 : 1.2;
  return (
    <group>
      <ambientLight color={ambientColor} intensity={ambientInt} />
      {!isNight && <directionalLight position={[sunX, Math.max(sunY, 5), 20]} intensity={1.5} castShadow />}
    </group>
  );
};

const WarningMesh = ({ t }) => {
  const meshRef = useRef(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = (t.level * 0.5) + 1.5 + Math.sin(clock.elapsedTime * 4 + t.id) * 0.2;
      meshRef.current.rotation.y = clock.elapsedTime * 2;
    }
  });
  const color = t.warning === 'NO_ROAD' ? '#9ca3af' : t.warning === 'NO_POWER' ? '#facc15' : '#60a5fa';
  return (
    <mesh ref={meshRef} position={[t.x, 0, t.z]}>
      <octahedronGeometry args={[0.3]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
};

const InspectedHighlight = () => {
  const inspectedTileIdx = useGameStore(s => s.inspectedTileIdx);
  const grid = useGameStore(s => s.grid);
  const ref = useRef(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 5) * 0.05; });
  if (inspectedTileIdx === null || !grid[inspectedTileIdx]) return null;
  const tile = grid[inspectedTileIdx];
  return (
    <mesh ref={ref} position={[tile.x, 0.5, tile.z]}>
      <boxGeometry args={[1.05, 1.05, 1.05]} />
      <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
    </mesh>
  );
};

const WorldMeshes = () => {
  const grid = useGameStore(s => s.grid);
  const heatmap = useGameStore(s => s.heatmap);
  const time = useGameStore(s => s.time);
  const isNight = time >= 18 || time <= 6;
  const terrainGeo = useMemo(() => new THREE.BoxGeometry(1, 0.5, 1), []);
  const terrainMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);
  const roadGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const roadMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const buildingGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const buildingMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.4 }), []);
  const emissiveGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const emissiveMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xf1c40f, wireframe: true, transparent: true, opacity: 0.8 }), []);
  const terrainRef = useRef(null);
  const roadRef = useRef(null);
  const buildingRef = useRef(null);
  const emissiveRef = useRef(null);

  useEffect(() => {
    if (grid.length === 0) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let bCount = 0, rCount = 0, eCount = 0;
    grid.forEach((tile, i) => {
      dummy.position.set(tile.x, tile.terrain === 'WATER' ? -0.2 : 0, tile.z);
      dummy.scale.set(1, 1, 1); dummy.updateMatrix();
      terrainRef.current?.setMatrixAt(i, dummy.matrix);
      let hex = PALETTE[tile.terrain];
      if (heatmap) { const val = tile.happiness / 100; color.setHSL((1 - val) * 0.3, 1, 0.5); } else { color.set(hex); }
      terrainRef.current?.setColorAt(i, color);
      if (tile.building === 'ROAD') {
        dummy.position.set(tile.x, 0.1, tile.z); dummy.scale.set(1, 0.1, 1); dummy.updateMatrix();
        roadRef.current?.setMatrixAt(rCount, dummy.matrix); color.set(BUILDINGS.ROAD.color);
        roadRef.current?.setColorAt(rCount, color); rCount++;
      }
      if (tile.building !== 'NONE' && tile.building !== 'ROAD') {
        const b = BUILDINGS[tile.building];
        const height = tile.level > 0 ? tile.level * 0.5 + 0.5 : 0.5;
        dummy.position.set(tile.x, height / 2, tile.z); dummy.scale.set(0.8, height, 0.8); dummy.updateMatrix();
        buildingRef.current?.setMatrixAt(bCount, dummy.matrix); color.set(b.color);
        if (!tile.powered && tile.building !== 'PARK') color.multiplyScalar(0.5);
        buildingRef.current?.setColorAt(bCount, color); bCount++;
        if (isNight && tile.level >= 1 && tile.powered) {
          dummy.position.set(tile.x, height / 2, tile.z); dummy.scale.set(0.82, height * 0.8, 0.82); dummy.updateMatrix();
          emissiveRef.current?.setMatrixAt(eCount, dummy.matrix); color.set('#f1c40f');
          emissiveRef.current?.setColorAt(eCount, color); eCount++;
        }
      }
    });
    if (terrainRef.current) { terrainRef.current.instanceMatrix.needsUpdate = true; if (terrainRef.current.instanceColor) terrainRef.current.instanceColor.needsUpdate = true; }
    if (roadRef.current) { roadRef.current.count = rCount; roadRef.current.instanceMatrix.needsUpdate = true; if (roadRef.current.instanceColor) roadRef.current.instanceColor.needsUpdate = true; }
    if (buildingRef.current) { buildingRef.current.count = bCount; buildingRef.current.instanceMatrix.needsUpdate = true; if (buildingRef.current.instanceColor) buildingRef.current.instanceColor.needsUpdate = true; }
    if (emissiveRef.current) { emissiveRef.current.count = eCount; emissiveRef.current.instanceMatrix.needsUpdate = true; if (emissiveRef.current.instanceColor) emissiveRef.current.instanceColor.needsUpdate = true; }
  }, [grid, heatmap, isNight]);

  if (grid.length === 0) return null;
  return (
    <group>
      <instancedMesh ref={terrainRef} args={[terrainGeo, terrainMat, GRID_SIZE * GRID_SIZE]} receiveShadow />
      <instancedMesh ref={roadRef} args={[roadGeo, roadMat, GRID_SIZE * GRID_SIZE]} receiveShadow />
      <instancedMesh ref={buildingRef} args={[buildingGeo, buildingMat, GRID_SIZE * GRID_SIZE]} castShadow receiveShadow />
      <instancedMesh ref={emissiveRef} args={[emissiveGeo, emissiveMat, GRID_SIZE * GRID_SIZE]} />
      {grid.filter(t => t.warning !== 'NONE').slice(0, 30).map(t => <WarningMesh key={`warn-${t.id}`} t={t} />)}
      <InspectedHighlight />
    </group>
  );
};

const InteractionPlane = () => {
  const handleInteraction = useGameStore(s => s.handleInteraction);
  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[GRID_SIZE/2, 0.5, GRID_SIZE/2]}
      onClick={(e) => { e.stopPropagation(); const x = Math.round(e.point.x); const z = Math.round(e.point.z); handleInteraction(x, z); }}>
      <planeGeometry args={[GRID_SIZE * 2, GRID_SIZE * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

// --- 5. UI COMPONENTS ---
const TileInspectorPanel = () => {
  const idx = useGameStore(s => s.inspectedTileIdx);
  const grid = useGameStore(s => s.grid);
  if (idx === null || !grid[idx]) return null;
  const tile = grid[idx];
  const bData = BUILDINGS[tile.building];
  const hapColor = tile.happiness > 60 ? '#4ade80' : tile.happiness < 40 ? '#f87171' : '#facc15';
  return (
    <div style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', pointerEvents: 'auto', color: 'white', width: '16rem', position: 'absolute', left: '1rem', top: '6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{bData.name !== 'None' ? bData.name : tile.terrain}</h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>[{tile.x}, {tile.z}]</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#cbd5e1' }}>Base Terrain:</span>
          <span style={{ fontWeight: '500' }}>{tile.terrain}</span>
        </div>
        {tile.building !== 'NONE' && (<>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#cbd5e1' }}>Level:</span><span style={{ fontWeight: '500', color: '#4ade80' }}>{tile.level}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#cbd5e1' }}>Road Access:</span><span>{tile.roadAccess ? '✅' : '❌'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#cbd5e1' }}>Power:</span><span>{tile.powered ? '✅' : '❌'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#cbd5e1' }}>Water:</span><span>{tile.watered ? '✅' : '❌'}</span></div>
        </>)}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#cbd5e1' }}>Happiness:</span>
          <span style={{ fontWeight: 'bold', color: hapColor }}>{tile.happiness}/100</span>
        </div>
        {tile.warning !== 'NONE' && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '0.25rem', color: '#fca5a5', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>
            ⚠️ {tile.warning.replace('_', ' ')}
          </div>
        )}
      </div>
    </div>
  );
};

const HUD = () => {
  const { funds, population, happiness, time, powerUse, powerMax, milestone, selectedTool, setTool, toggleHeatmap, heatmap } = useGameStore();
  const currentTier = MILESTONES.find(m => m.tier === milestone);
  const nextTier = MILESTONES.find(m => m.tier === milestone + 1);
  const formatTime = (h) => { const ampm = h >= 12 ? 'PM' : 'AM'; const hour = h % 12 === 0 ? 12 : h % 12; return `${hour}:00 ${ampm}`; };
  const allowedTools = MILESTONES.filter(m => m.tier <= milestone).flatMap(m => m.unlocks);
  const panelStyle = { background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)', borderRadius: '1rem', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', pointerEvents: 'auto', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', color: '#1e293b', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ ...panelStyle, padding: '0.75rem', maxWidth: '200px' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4ade80' }}>Tier {milestone}: {currentTier?.name}</h2>
          {nextTier ? (
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', lineHeight: '1.4', color: '#cbd5e1' }}>Goal: Reach {nextTier.popRequired} Pop</p>
          ) : (
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#cbd5e1' }}>Maximum Tier Reached!</p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ ...panelStyle, paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderRadius: '9999px', display: 'flex', gap: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>⏱️ {formatTime(time)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4ade80' }}>💵 ${funds.toLocaleString()}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#93c5fd' }}>👥 {population}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>😊 {happiness}%</span>
          </div>
          <div style={{ ...panelStyle, paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', borderRadius: '9999px', display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ color: powerUse > powerMax ? '#f87171' : 'inherit', fontWeight: powerUse > powerMax ? 'bold' : 'normal' }}>⚡ {powerUse}/{powerMax}</span>
            <button onClick={toggleHeatmap} style={{ marginLeft: '0.5rem', padding: '0 0.5rem', borderRadius: '0.25rem', background: heatmap ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', pointerEvents: 'auto' }}>
              👁️ Data Lens
            </button>
          </div>
        </div>
      </div>

      <TileInspectorPanel />

      <div style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(24px)', paddingBottom: '1.5rem', paddingTop: '1rem', borderRadius: '1.5rem 1.5rem 0 0', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)', pointerEvents: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '0.5rem' }}>
          <button onClick={() => setTool('INSPECT')} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '1rem', border: selectedTool === 'INSPECT' ? '2px solid #60a5fa' : '2px solid transparent', background: selectedTool === 'INSPECT' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)', color: selectedTool === 'INSPECT' ? '#bfdbfe' : 'white', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.25rem' }}>🔍</span>
            <span style={{ fontSize: '10px', marginTop: '0.25rem', fontWeight: 'bold' }}>Inspect</span>
          </button>
          <button onClick={() => setTool('BULLDOZE')} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '1rem', border: selectedTool === 'BULLDOZE' ? '2px solid #ef4444' : '2px solid transparent', background: selectedTool === 'BULLDOZE' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)', color: selectedTool === 'BULLDOZE' ? '#fca5a5' : 'white', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.25rem' }}>🚜</span>
            <span style={{ fontSize: '10px', marginTop: '0.25rem', fontWeight: 'bold' }}>Clear</span>
          </button>
          <div style={{ width: '1px', height: '3rem', background: 'rgba(255,255,255,0.1)', margin: 'auto 0.25rem', flexShrink: 0 }} />
          {Object.entries(BUILDINGS).filter(([key]) => allowedTools.includes(key)).map(([key, data]) => {
            const isSelected = selectedTool === key;
            return (
              <button key={key} onClick={() => setTool(key)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '5rem', height: '5rem', borderRadius: '1rem', border: isSelected ? '2px solid #4ade80' : '2px solid transparent', background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', color: isSelected ? 'white' : 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', marginBottom: '0.25rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', backgroundColor: data.color }} />
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'white', textAlign: 'center', lineHeight: '1.2', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>{data.name}</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '0.125rem' }}>${data.cost}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 6. MAIN EXPORT ---
export default function Game() {
  const initMap = useGameStore(s => s.initMap);
  const tick = useGameStore(s => s.tick);
  useEffect(() => {
    initMap();
    const interval = setInterval(tick, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [initMap, tick]);
  return (
    <div style={{ width: '100%', height: '100vh', background: '#1e293b', overflow: 'hidden', userSelect: 'none', touchAction: 'none' }}>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <Canvas shadows camera={{ position: [GRID_SIZE/2, 40, GRID_SIZE/2 + 30], fov: 40 }}>
        <Lighting />
        <WorldMeshes />
        <InteractionPlane />
        <OrbitControls target={[GRID_SIZE/2, 0, GRID_SIZE/2]} maxPolarAngle={Math.PI / 2.5} minDistance={10} maxDistance={80} makeDefault dampingFactor={0.1} />
      </Canvas>
      <HUD />
    </div>
  );
}
