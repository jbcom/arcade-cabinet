import { browserTestCanvasGlOptions } from "@arcade-cabinet/shared";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BUILDINGS, GRID_SIZE, type GridizenState, type GridTile, PALETTE } from "../engine/types";

interface GridSceneProps {
  state: GridizenState;
  onInteraction: (x: number, z: number) => void;
}

interface LightingProps {
  time: number;
}

function Lighting({ time }: LightingProps) {
  const hourAngle = ((time - 6) / 24) * Math.PI * 2;
  const sunX = Math.cos(hourAngle) * 50;
  const sunY = Math.sin(hourAngle) * 50;
  const isNight = sunY < 0;
  const ambientColor = isNight ? "#1e293b" : "#ffffff";
  const ambientInt = isNight ? 0.4 : 1.2;
  return (
    <group>
      <ambientLight color={ambientColor} intensity={ambientInt} />
      {!isNight && (
        <directionalLight position={[sunX, Math.max(sunY, 5), 20]} intensity={1.5} castShadow />
      )}
    </group>
  );
}

interface WarningMeshProps {
  tile: GridTile;
}

function WarningMesh({ tile }: WarningMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        tile.level * 0.5 + 1.5 + Math.sin(clock.elapsedTime * 4 + tile.id) * 0.2;
      meshRef.current.rotation.y = clock.elapsedTime * 2;
    }
  });
  const color =
    tile.warning === "NO_ROAD" ? "#9ca3af" : tile.warning === "NO_POWER" ? "#facc15" : "#60a5fa";
  return (
    <mesh ref={meshRef} position={[tile.x, 0, tile.z]}>
      <octahedronGeometry args={[0.3]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
}

interface InspectedHighlightProps {
  grid: GridTile[];
  inspectedTileIdx: number | null;
}

function InspectedHighlight({ grid, inspectedTileIdx }: InspectedHighlightProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 5) * 0.05;
  });
  if (inspectedTileIdx === null || !grid[inspectedTileIdx]) return null;
  const tile = grid[inspectedTileIdx];
  return (
    <mesh ref={ref} position={[tile.x, 0.5, tile.z]}>
      <boxGeometry args={[1.05, 1.05, 1.05]} />
      <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
    </mesh>
  );
}

interface WorldMeshesProps {
  grid: GridTile[];
  heatmap: boolean;
  time: number;
}

function WorldMeshes({ grid, heatmap, time }: WorldMeshesProps) {
  const isNight = time >= 18 || time <= 6;
  const terrainGeo = useMemo(() => new THREE.BoxGeometry(1, 0.5, 1), []);
  const terrainMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);
  const roadGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const roadMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const buildingGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const buildingMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.4 }), []);
  const emissiveGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const emissiveMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xf1c40f,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      }),
    []
  );

  const terrainRef = useRef<THREE.InstancedMesh>(null);
  const roadRef = useRef<THREE.InstancedMesh>(null);
  const buildingRef = useRef<THREE.InstancedMesh>(null);
  const emissiveRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (grid.length === 0) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let bCount = 0;
    let rCount = 0;
    let eCount = 0;

    for (let i = 0; i < grid.length; i++) {
      const tile = grid[i];
      if (!tile) continue;
      dummy.position.set(tile.x, tile.terrain === "WATER" ? -0.2 : 0, tile.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      terrainRef.current?.setMatrixAt(i, dummy.matrix);
      const hex = PALETTE[tile.terrain] ?? "#4ade80";
      if (heatmap) {
        const val = tile.happiness / 100;
        color.setHSL((1 - val) * 0.3, 1, 0.5);
      } else {
        color.set(hex);
      }
      terrainRef.current?.setColorAt(i, color);

      if (tile.building === "ROAD") {
        dummy.position.set(tile.x, 0.1, tile.z);
        dummy.scale.set(1, 0.1, 1);
        dummy.updateMatrix();
        roadRef.current?.setMatrixAt(rCount, dummy.matrix);
        color.set(BUILDINGS.ROAD?.color ?? "#555555");
        roadRef.current?.setColorAt(rCount, color);
        rCount++;
      }

      if (tile.building !== "NONE" && tile.building !== "ROAD") {
        const b = BUILDINGS[tile.building];
        if (b) {
          const height = tile.level > 0 ? tile.level * 0.5 + 0.5 : 0.5;
          dummy.position.set(tile.x, height / 2, tile.z);
          dummy.scale.set(0.8, height, 0.8);
          dummy.updateMatrix();
          buildingRef.current?.setMatrixAt(bCount, dummy.matrix);
          color.set(b.color);
          if (!tile.powered && tile.building !== "PARK") color.multiplyScalar(0.5);
          buildingRef.current?.setColorAt(bCount, color);
          bCount++;
          if (isNight && tile.level >= 1 && tile.powered) {
            dummy.position.set(tile.x, height / 2, tile.z);
            dummy.scale.set(0.82, height * 0.8, 0.82);
            dummy.updateMatrix();
            emissiveRef.current?.setMatrixAt(eCount, dummy.matrix);
            color.set("#f1c40f");
            emissiveRef.current?.setColorAt(eCount, color);
            eCount++;
          }
        }
      }
    }

    if (terrainRef.current) {
      terrainRef.current.instanceMatrix.needsUpdate = true;
      if (terrainRef.current.instanceColor) terrainRef.current.instanceColor.needsUpdate = true;
    }
    if (roadRef.current) {
      roadRef.current.count = rCount;
      roadRef.current.instanceMatrix.needsUpdate = true;
      if (roadRef.current.instanceColor) roadRef.current.instanceColor.needsUpdate = true;
    }
    if (buildingRef.current) {
      buildingRef.current.count = bCount;
      buildingRef.current.instanceMatrix.needsUpdate = true;
      if (buildingRef.current.instanceColor) buildingRef.current.instanceColor.needsUpdate = true;
    }
    if (emissiveRef.current) {
      emissiveRef.current.count = eCount;
      emissiveRef.current.instanceMatrix.needsUpdate = true;
      if (emissiveRef.current.instanceColor) emissiveRef.current.instanceColor.needsUpdate = true;
    }
  }, [grid, heatmap, isNight]);

  if (grid.length === 0) return null;
  return (
    <group>
      <instancedMesh
        ref={terrainRef}
        args={[terrainGeo, terrainMat, GRID_SIZE * GRID_SIZE]}
        receiveShadow
      />
      <instancedMesh ref={roadRef} args={[roadGeo, roadMat, GRID_SIZE * GRID_SIZE]} receiveShadow />
      <instancedMesh
        ref={buildingRef}
        args={[buildingGeo, buildingMat, GRID_SIZE * GRID_SIZE]}
        castShadow
        receiveShadow
      />
      <instancedMesh ref={emissiveRef} args={[emissiveGeo, emissiveMat, GRID_SIZE * GRID_SIZE]} />
      {grid
        .filter((t) => t.warning !== "NONE")
        .slice(0, 30)
        .map((t) => (
          <WarningMesh key={`warn-${t.id}`} tile={t} />
        ))}
      <InspectedHighlight grid={grid} inspectedTileIdx={null} />
    </group>
  );
}

interface InteractionPlaneProps {
  onInteraction: (x: number, z: number) => void;
}

function InteractionPlane({ onInteraction }: InteractionPlaneProps) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[GRID_SIZE / 2, 0.5, GRID_SIZE / 2]}
      onClick={(e) => {
        e.stopPropagation();
        const x = Math.round(e.point.x);
        const z = Math.round(e.point.z);
        onInteraction(x, z);
      }}
    >
      <planeGeometry args={[GRID_SIZE * 2, GRID_SIZE * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function GameCamera() {
  return (
    <OrbitControls
      target={[GRID_SIZE / 2, 0, GRID_SIZE / 2]}
      maxPolarAngle={Math.PI / 2.5}
      minDistance={10}
      maxDistance={80}
      makeDefault
      dampingFactor={0.1}
    />
  );
}

export function GridScene({ state, onInteraction }: GridSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [GRID_SIZE / 2, 40, GRID_SIZE / 2 + 30], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
      data-testid="gridizen-canvas"
      gl={browserTestCanvasGlOptions}
    >
      <Lighting time={state.time} />
      <WorldMeshes grid={state.grid} heatmap={state.heatmap} time={state.time} />
      <InteractionPlane onInteraction={onInteraction} />
      <GameCamera />
    </Canvas>
  );
}
