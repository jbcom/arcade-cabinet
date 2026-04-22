import { browserTestCanvasGlOptions } from "@arcade-cabinet/shared";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CIVIC_CENTER } from "../engine/logic";
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
  const ambientColor = isNight ? "#23324c" : "#f6f2df";
  const ambientInt = isNight ? 0.55 : 1.3;
  return (
    <group>
      <ambientLight color={ambientColor} intensity={ambientInt} />
      <hemisphereLight args={[isNight ? "#172554" : "#dbeafe", "#34422f", isNight ? 0.7 : 1]} />
      {!isNight && (
        <directionalLight
          position={[sunX, Math.max(sunY, 5), 20]}
          intensity={1.55}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
      )}
      <directionalLight position={[-22, 26, -18]} intensity={isNight ? 0.25 : 0.5} />
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
  inspectedTileIdx: number | null;
}

function WorldMeshes({ grid, heatmap, time, inspectedTileIdx }: WorldMeshesProps) {
  const isNight = time >= 18 || time <= 6;
  const terrainGeo = useMemo(() => new THREE.BoxGeometry(1, 0.32, 1), []);
  const terrainMat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.86, metalness: 0.02, vertexColors: true }),
    []
  );
  const roadGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const roadMat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0.02, vertexColors: true }),
    []
  );
  const buildingGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const buildingMat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.48, metalness: 0.04, vertexColors: true }),
    []
  );
  const emissiveGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const emissiveMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xf1c40f,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
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
      const terrainY = tile.terrain === "WATER" ? -0.16 : tile.terrain === "SAND" ? -0.03 : 0;
      dummy.position.set(tile.x, terrainY, tile.z);
      dummy.scale.set(1, tile.terrain === "WATER" ? 0.72 : 1, 1);
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
        dummy.position.set(tile.x, 0.16, tile.z);
        dummy.scale.set(0.96, 0.08, 0.96);
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
      <PlanningTable />
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
      <RoadMarkings grid={grid} />
      <CivicDetails grid={grid} />
      {grid
        .filter((t) => t.warning !== "NONE")
        .slice(0, 30)
        .map((t) => (
          <WarningMesh key={`warn-${t.id}`} tile={t} />
        ))}
      <InspectedHighlight grid={grid} inspectedTileIdx={inspectedTileIdx} />
    </group>
  );
}

function PlanningTable() {
  const center = (GRID_SIZE - 1) / 2;
  return (
    <group>
      <mesh position={[center, -0.48, center]} receiveShadow>
        <boxGeometry args={[GRID_SIZE + 4, 0.72, GRID_SIZE + 4]} />
        <meshStandardMaterial color="#7f8a72" roughness={0.82} />
      </mesh>
      <mesh position={[center, -0.08, -2.4]} receiveShadow>
        <boxGeometry args={[GRID_SIZE + 5, 0.36, 0.65]} />
        <meshStandardMaterial color="#4a5148" roughness={0.8} />
      </mesh>
      <mesh position={[center, -0.08, GRID_SIZE + 1.4]} receiveShadow>
        <boxGeometry args={[GRID_SIZE + 5, 0.36, 0.65]} />
        <meshStandardMaterial color="#4a5148" roughness={0.8} />
      </mesh>
      <mesh position={[-2.4, -0.08, center]} receiveShadow>
        <boxGeometry args={[0.65, 0.36, GRID_SIZE + 5]} />
        <meshStandardMaterial color="#4a5148" roughness={0.8} />
      </mesh>
      <mesh position={[GRID_SIZE + 1.4, -0.08, center]} receiveShadow>
        <boxGeometry args={[0.65, 0.36, GRID_SIZE + 5]} />
        <meshStandardMaterial color="#4a5148" roughness={0.8} />
      </mesh>
    </group>
  );
}

interface GridOnlyProps {
  grid: GridTile[];
}

function RoadMarkings({ grid }: GridOnlyProps) {
  const roadSet = useMemo(
    () =>
      new Set(grid.filter((tile) => tile.building === "ROAD").map((tile) => `${tile.x},${tile.z}`)),
    [grid]
  );
  const districtRoads = useMemo(
    () =>
      grid.filter(
        (tile) =>
          tile.building === "ROAD" &&
          Math.abs(tile.x - CIVIC_CENTER.x) <= 11 &&
          Math.abs(tile.z - CIVIC_CENTER.z) <= 11
      ),
    [grid]
  );

  return (
    <group>
      {districtRoads.map((tile) => {
        const hasEastWest =
          roadSet.has(`${tile.x - 1},${tile.z}`) || roadSet.has(`${tile.x + 1},${tile.z}`);
        const hasNorthSouth =
          roadSet.has(`${tile.x},${tile.z - 1}`) || roadSet.has(`${tile.x},${tile.z + 1}`);
        return (
          <group key={`road-marking-${tile.id}`} position={[tile.x, 0.235, tile.z]}>
            <mesh position={[0, -0.03, 0]} receiveShadow>
              <boxGeometry args={[0.94, 0.035, 0.94]} />
              <meshStandardMaterial color="#2f3b45" roughness={0.72} />
            </mesh>
            {hasEastWest ? (
              <mesh receiveShadow>
                <boxGeometry args={[0.58, 0.018, 0.07]} />
                <meshBasicMaterial color="#d6d3c5" />
              </mesh>
            ) : null}
            {hasNorthSouth ? (
              <mesh receiveShadow>
                <boxGeometry args={[0.07, 0.018, 0.58]} />
                <meshBasicMaterial color="#d6d3c5" />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function CivicDetails({ grid }: GridOnlyProps) {
  const detailedTiles = useMemo(
    () =>
      grid
        .filter(
          (tile) =>
            tile.building !== "NONE" &&
            tile.building !== "ROAD" &&
            Math.abs(tile.x - CIVIC_CENTER.x) <= 13 &&
            Math.abs(tile.z - CIVIC_CENTER.z) <= 13
        )
        .slice(0, 96),
    [grid]
  );

  return (
    <group>
      {detailedTiles.map((tile) => (
        <CivicBuilding key={`civic-building-${tile.id}`} tile={tile} />
      ))}
    </group>
  );
}

function CivicBuilding({ tile }: WarningMeshProps) {
  const height = tile.level > 0 ? tile.level * 0.5 + 0.5 : 0.5;
  if (tile.building === "POWER") return <PowerPlant tile={tile} />;
  if (tile.building === "WATER_PUMP") return <WaterTower tile={tile} />;
  if (tile.building === "PARK") return <ParkLot tile={tile} />;
  return (
    <group position={[tile.x, 0, tile.z]}>
      <mesh position={[0, height + 0.17, 0]} castShadow>
        <coneGeometry args={[0.56, 0.34, 4]} />
        <meshStandardMaterial color={tile.building === "RESIDENTIAL" ? "#f4d06f" : "#e2e8f0"} />
      </mesh>
      {tile.building === "COMMERCIAL" ? (
        <mesh position={[0, height + 0.42, 0]} castShadow>
          <boxGeometry args={[0.66, 0.12, 0.66]} />
          <meshStandardMaterial color="#f8fafc" emissive="#93c5fd" emissiveIntensity={0.15} />
        </mesh>
      ) : null}
      {tile.building === "INDUSTRIAL" ? (
        <>
          <mesh position={[-0.24, height + 0.42, -0.1]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.72, 10]} />
            <meshStandardMaterial color="#6b7280" roughness={0.62} />
          </mesh>
          <mesh position={[0.24, height + 0.3, 0.08]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.48, 10]} />
            <meshStandardMaterial color="#78716c" roughness={0.62} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function PowerPlant({ tile }: WarningMeshProps) {
  return (
    <group position={[tile.x, 0, tile.z]}>
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.92, 0.52, 0.72]} />
        <meshStandardMaterial color="#b94a48" roughness={0.5} />
      </mesh>
      {[-0.24, 0.24].map((x) => (
        <mesh key={`stack-${tile.id}-${x}`} position={[x, 1.28, -0.1]} castShadow>
          <cylinderGeometry args={[0.11, 0.14, 1.04, 14]} />
          <meshStandardMaterial color="#574b45" roughness={0.68} />
        </mesh>
      ))}
      <mesh position={[0, 1.92, -0.1]}>
        <torusGeometry args={[0.34, 0.025, 8, 32]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

function WaterTower({ tile }: WarningMeshProps) {
  return (
    <group position={[tile.x, 0, tile.z]}>
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.1, 10]} />
        <meshStandardMaterial color="#5b6f7b" roughness={0.52} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.42, 18, 10]} />
        <meshStandardMaterial color="#69b7d8" metalness={0.12} roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.028, 8, 32]} />
        <meshBasicMaterial color="#a7f3d0" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function ParkLot({ tile }: WarningMeshProps) {
  const treePoints = [
    { key: "west", x: -0.25, z: -0.2 },
    { key: "east", x: 0.22, z: 0.2 },
    { key: "north", x: 0.08, z: -0.28 },
  ];

  return (
    <group position={[tile.x, 0, tile.z]}>
      {treePoints.map(({ key, x, z }) => (
        <group key={`park-tree-${tile.id}-${key}`} position={[x, 0, z]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.5, 8]} />
            <meshStandardMaterial color="#6b4e2e" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.82, 0]} castShadow>
            <coneGeometry args={[0.24, 0.48, 8]} />
            <meshStandardMaterial color={key === "east" ? "#2f7d46" : "#3f8f52"} roughness={0.86} />
          </mesh>
        </group>
      ))}
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
  const { camera, size } = useThree();
  const isPortrait = size.height > size.width;

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    if (isPortrait) {
      camera.position.set(CIVIC_CENTER.x + 19, 42, CIVIC_CENTER.z + 22);
      camera.fov = 40;
    } else {
      camera.position.set(CIVIC_CENTER.x + 15, 22, CIVIC_CENTER.z + 17);
      camera.fov = 34;
    }
    camera.lookAt(CIVIC_CENTER.x, 0.25, CIVIC_CENTER.z);
    camera.updateProjectionMatrix();
  }, [camera, isPortrait]);

  return (
    <OrbitControls
      target={[CIVIC_CENTER.x, 0.25, CIVIC_CENTER.z]}
      maxPolarAngle={Math.PI / 2.35}
      minPolarAngle={Math.PI / 4.5}
      minDistance={12}
      maxDistance={50}
      enablePan={false}
      makeDefault
      dampingFactor={0.1}
    />
  );
}

export function GridScene({ state, onInteraction }: GridSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [CIVIC_CENTER.x + 15, 22, CIVIC_CENTER.z + 17], fov: 34 }}
      style={{ width: "100%", height: "100%" }}
      data-testid="gridizen-canvas"
      gl={browserTestCanvasGlOptions}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={["#dce5df"]} />
      <fog attach="fog" args={["#dce5df", 35, 78]} />
      <Lighting time={state.time} />
      <WorldMeshes
        grid={state.grid}
        heatmap={state.heatmap}
        inspectedTileIdx={state.inspectedTileIdx}
        time={state.time}
      />
      <InteractionPlane onInteraction={onInteraction} />
      <GameCamera />
    </Canvas>
  );
}
