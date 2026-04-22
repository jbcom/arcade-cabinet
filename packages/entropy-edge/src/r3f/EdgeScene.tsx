import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ReactElement } from "react";
import { useRef } from "react";
import * as THREE from "three";
import { GRID_HALF } from "../engine/simulation";
import type { EntropyState, FallingBlock, GridNode, Shockwave } from "../engine/types";

const TILE_SIZE = 1;
const GRID_SIZE = GRID_HALF * 2 + 1;

function GridFloor() {
  const tiles: ReactElement[] = [];
  for (let x = -GRID_HALF; x <= GRID_HALF; x++) {
    for (let z = -GRID_HALF; z <= GRID_HALF; z++) {
      const isDark = (x + z) % 2 === 0;
      tiles.push(
        <mesh key={`tile-${x}-${z}`} position={[x, -0.05, z]} receiveShadow>
          <boxGeometry args={[TILE_SIZE - 0.04, 0.1, TILE_SIZE - 0.04]} />
          <meshStandardMaterial color={isDark ? "#111a2b" : "#0d1520"} />
        </mesh>
      );
    }
  }
  return <group>{tiles}</group>;
}

function GridBorder() {
  return (
    <mesh receiveShadow position={[0, -0.12, 0]}>
      <boxGeometry args={[GRID_SIZE + 0.4, 0.24, GRID_SIZE + 0.4]} />
      <meshStandardMaterial color="#0a1018" />
    </mesh>
  );
}

function BlockedCell({ cellKey }: { cellKey: string }) {
  const [xs, zs] = cellKey.split(",");
  const x = Number(xs);
  const z = Number(zs);
  return (
    <mesh castShadow receiveShadow position={[x, 0.5, z]}>
      <boxGeometry args={[0.92, 1, 0.92]} />
      <meshStandardMaterial color="#111822" metalness={0.7} roughness={0.2} />
    </mesh>
  );
}

function FallingBlockMesh({ block }: { block: FallingBlock }) {
  return (
    <mesh castShadow position={[block.gridX, block.worldY, block.gridZ]}>
      <boxGeometry args={[0.88, 0.88, 0.88]} />
      <meshStandardMaterial
        color="#1a2535"
        metalness={0.6}
        roughness={0.3}
        emissive="#00e5ff"
        emissiveIntensity={0.15}
      />
    </mesh>
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
      ref.current.position.y = 0.4 + bob + (Math.random() - 0.5) * shake * 0.1;
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

function AutoOrbitCamera() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.07;
    const radius = 22;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
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
      shadows
      camera={{ position: [18, 16, 18], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      data-testid="entropy-edge-canvas"
    >
      <color attach="background" args={["#060d1a"]} />
      <fog attach="fog" args={["#060d1a", 30, 80]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 8, 0]} color="#00b3cc" intensity={1.2} distance={25} />

      <GridFloor />
      <GridBorder />

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
          maxDistance={32}
          target={[0, 0.5, 0]}
        />
      ) : (
        <AutoOrbitCamera />
      )}
    </Canvas>
  );
}
