import { browserTestCanvasGlOptions } from "@app/shared";
import {
  cellKey,
  createSectorCells,
  GRID_HALF,
  GRID_SIZE,
} from "@logic/games/entropy-edge/engine/simulation";
import type {
  EntropyState,
  FallingBlock,
  GridNode,
  Shockwave,
} from "@logic/games/entropy-edge/engine/types";
import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ReactElement } from "react";
import { useRef } from "react";
import * as THREE from "three";

const TILE_SIZE = 1;

function GridFloor({ state }: { state: EntropyState }) {
  const tiles: ReactElement[] = [];
  const targetKey = state.targetNode ? cellKey(state.targetNode.gridX, state.targetNode.gridZ) : "";
  const playerKey = cellKey(state.playerGridX, state.playerGridZ);

  for (const cell of createSectorCells()) {
    const isDark = (cell.x + cell.z) % 2 === 0;
    const isGuide =
      state.targetNode &&
      (cell.x === state.playerGridX || cell.z === state.playerGridZ) &&
      (Math.sign(state.targetNode.gridX - state.playerGridX) ===
        Math.sign(cell.x - state.playerGridX) ||
        Math.sign(state.targetNode.gridZ - state.playerGridZ) ===
          Math.sign(cell.z - state.playerGridZ));
    const isTarget = cell.key === targetKey;
    const isPlayer = cell.key === playerKey;
    const isSurgeCleared = cell.key === state.lastSurgeClearedKey;
    const baseColor = isTarget
      ? "#321226"
      : isPlayer
        ? "#0d2d35"
        : isSurgeCleared
          ? "#1d2a18"
          : isDark
            ? "#111a2b"
            : "#0c1724";
    const emissive = isTarget
      ? "#ff0055"
      : isPlayer
        ? "#00e5ff"
        : isSurgeCleared
          ? "#a3e635"
          : isGuide
            ? "#14536a"
            : "#020617";

    tiles.push(
      <mesh key={cell.key} position={[cell.x, 0, cell.z]} receiveShadow>
        <boxGeometry args={[TILE_SIZE - 0.05, 0.12, TILE_SIZE - 0.05]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissive}
          emissiveIntensity={
            isTarget || isPlayer
              ? 0.32
              : isSurgeCleared
                ? 0.26
                : isGuide
                  ? 0.16
                  : cell.unstable
                    ? 0.04
                    : 0
          }
          metalness={0.45}
          roughness={0.38}
        />
      </mesh>
    );
  }

  return <group>{tiles}</group>;
}

function GridSeams() {
  const seams: ReactElement[] = [];

  for (let x = -GRID_HALF; x <= GRID_HALF; x++) {
    seams.push(
      <Line
        key={`seam-z-${x}`}
        points={[
          [x - 0.5, 0.085, -GRID_HALF - 0.48],
          [x - 0.5, 0.085, GRID_HALF + 0.48],
        ]}
        color="rgba(125, 211, 252, 0.22)"
        lineWidth={1}
      />
    );
  }

  for (let z = -GRID_HALF; z <= GRID_HALF; z++) {
    seams.push(
      <Line
        key={`seam-x-${z}`}
        points={[
          [-GRID_HALF - 0.48, 0.085, z - 0.5],
          [GRID_HALF + 0.48, 0.085, z - 0.5],
        ]}
        color="rgba(125, 211, 252, 0.14)"
        lineWidth={1}
      />
    );
  }

  return <group>{seams}</group>;
}

function GridBorder() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.28, 0]}>
        <boxGeometry args={[GRID_SIZE + 1.1, 0.32, GRID_SIZE + 1.1]} />
        <meshStandardMaterial color="#06111c" metalness={0.65} roughness={0.32} />
      </mesh>
      {[
        { id: "north", x: 0, z: -GRID_HALF - 0.76, w: GRID_SIZE + 1.6, d: 0.24 },
        { id: "south", x: 0, z: GRID_HALF + 0.76, w: GRID_SIZE + 1.6, d: 0.24 },
        { id: "west", x: -GRID_HALF - 0.76, z: 0, w: 0.24, d: GRID_SIZE + 1.6 },
        { id: "east", x: GRID_HALF + 0.76, z: 0, w: 0.24, d: GRID_SIZE + 1.6 },
      ].map((rail) => (
        <mesh key={rail.id} castShadow receiveShadow position={[rail.x, 0.26, rail.z]}>
          <boxGeometry args={[rail.w, 0.55, rail.d]} />
          <meshStandardMaterial color="#0b1f2f" emissive="#062b3d" emissiveIntensity={0.14} />
        </mesh>
      ))}
    </group>
  );
}

function BlockedCell({ cellKey }: { cellKey: string }) {
  const [xs, zs] = cellKey.split(",");
  const x = Number(xs);
  const z = Number(zs);
  return (
    <mesh castShadow receiveShadow position={[x, 0.5, z]}>
      <boxGeometry args={[0.92, 1, 0.92]} />
      <meshStandardMaterial
        color="#111822"
        emissive="#45111c"
        emissiveIntensity={0.12}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
}

function FallingBlockMesh({ block }: { block: FallingBlock }) {
  return (
    <group>
      <mesh position={[block.gridX, 0.09, block.gridZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.58, 32]} />
        <meshBasicMaterial color="#ff0055" transparent opacity={0.26} />
      </mesh>
      <mesh castShadow position={[block.gridX, block.worldY, block.gridZ]}>
        <boxGeometry args={[0.88, 0.88, 0.88]} />
        <meshStandardMaterial
          color="#1a2535"
          emissive="#00e5ff"
          emissiveIntensity={0.18}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <Line
        points={[
          [block.gridX, 0.5, block.gridZ],
          [block.gridX, Math.max(0.6, block.worldY - 0.6), block.gridZ],
        ]}
        color="rgba(0, 229, 255, 0.32)"
        lineWidth={2}
      />
    </group>
  );
}

function TargetNodeMesh({ node }: { node: GridNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 1.5;
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.08;
      ref.current.scale.setScalar(pulse);
    }
  });
  return (
    <group ref={ref} position={[node.gridX, 0, node.gridZ]}>
      {/* Pillar */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 5, 8]} />
        <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={1.2} />
      </mesh>
      {/* Core gem */}
      <mesh position={[0, 1.2, 0]}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={2} wireframe />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.8, 48]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.42} />
      </mesh>
      <pointLight color="#ff0055" intensity={3} distance={6} position={[0, 1.2, 0]} />
    </group>
  );
}

function PlayerSphere({ x, z, shake }: { x: number; z: number; shake: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x, 0.25);
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, z, 0.25);
      const bob = Math.sin(clock.getElapsedTime() * 4) * 0.06;
      const deterministicShake = Math.sin(clock.getElapsedTime() * 37) * shake * 0.05;
      ref.current.position.y = 0.4 + bob + deterministicShake;
    }
  });
  return (
    <mesh ref={ref} castShadow position={[x, 0.4, z]}>
      <sphereGeometry args={[0.38, 24, 24]} />
      <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.9} />
      <pointLight color="#00e5ff" intensity={2.5} distance={5} />
    </mesh>
  );
}

function ShockwaveMesh({ sw }: { sw: Shockwave }) {
  return (
    <mesh position={[sw.x, 0.1, sw.z]} rotation={[-Math.PI / 2, 0, 0]} scale={sw.scale}>
      <torusGeometry args={[1, 0.12, 8, 48]} />
      <meshBasicMaterial color="#ff0055" transparent opacity={Math.max(0, sw.life * 0.7)} />
    </mesh>
  );
}

function TargetGuide({ state }: { state: EntropyState }) {
  if (!state.targetNode) return null;

  return (
    <Line
      points={[
        [state.playerGridX, 0.18, state.playerGridZ],
        [state.targetNode.gridX, 0.18, state.targetNode.gridZ],
      ]}
      color="rgba(0, 229, 255, 0.5)"
      dashed
      dashScale={0.8}
      gapSize={0.12}
      lineWidth={2}
    />
  );
}

function RiftPillars() {
  return (
    <group>
      {[
        { id: "left-a", x: -6.4, z: -4.2, h: 4.8, color: "#00e5ff" },
        { id: "left-b", x: -6.4, z: 3.4, h: 3.8, color: "#00e5ff" },
        { id: "right-a", x: 6.4, z: -3.6, h: 4.5, color: "#ff0055" },
        { id: "right-b", x: 6.4, z: 4.2, h: 3.4, color: "#ff0055" },
      ].map((pillar) => (
        <group key={pillar.id} position={[pillar.x, 0, pillar.z]}>
          <mesh castShadow position={[0, pillar.h / 2, 0]}>
            <cylinderGeometry args={[0.09, 0.13, pillar.h, 8]} />
            <meshStandardMaterial
              color="#06111c"
              emissive={pillar.color}
              emissiveIntensity={0.22}
              metalness={0.8}
              roughness={0.24}
            />
          </mesh>
          <pointLight
            color={pillar.color}
            intensity={0.8}
            distance={5}
            position={[0, pillar.h, 0]}
          />
        </group>
      ))}
    </group>
  );
}

function AutoOrbitCamera() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.07;
    const radius = 17;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = 13;
  });
  return null;
}

interface EdgeSceneProps {
  state: EntropyState;
  isPlaying: boolean;
}

export function EdgeScene({ state, isPlaying }: EdgeSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [13, 12, 13], fov: 46 }}
      style={{ width: "100%", height: "100%" }}
      data-testid="entropy-edge-canvas"
      gl={browserTestCanvasGlOptions}
    >
      <color attach="background" args={["#040a13"]} />
      <fog attach="fog" args={["#040a13", 18, 54]} />
      <ambientLight intensity={0.42} />
      <directionalLight
        position={[8, 18, 6]}
        intensity={1.65}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 8, 0]} color="#00b3cc" intensity={1.2} distance={25} />

      <GridBorder />
      <GridFloor state={state} />
      <GridSeams />
      <RiftPillars />
      <TargetGuide state={state} />

      {state.blockedCells.map((key) => (
        <BlockedCell key={key} cellKey={key} />
      ))}

      {state.fallingBlocks.map((block) => (
        <FallingBlockMesh key={block.id} block={block} />
      ))}

      {state.targetNode ? <TargetNodeMesh node={state.targetNode} /> : null}

      {state.shockwaves.map((sw) => (
        <ShockwaveMesh key={sw.id} sw={sw} />
      ))}

      <PlayerSphere x={state.playerGridX} z={state.playerGridZ} shake={state.cameraShake} />

      {isPlaying ? (
        <OrbitControls
          enablePan={false}
          maxPolarAngle={1.3}
          minDistance={14}
          maxDistance={26}
          target={[0, 0.5, 0]}
        />
      ) : (
        <AutoOrbitCamera />
      )}
    </Canvas>
  );
}
