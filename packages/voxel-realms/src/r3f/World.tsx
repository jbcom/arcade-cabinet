import { PointerLockControls, Sky } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import { SpawnCamp } from "./SpawnCamp";
import { TerrainManager } from "./TerrainManager";

export function World() {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 4, 0));

  return (
    <>
      <color attach="background" args={["#bfe7f2"]} />
      <fog attach="fog" args={["#bfe7f2", 18, 88]} />
      <Sky sunPosition={[80, 34, 90]} turbidity={4.5} rayleigh={1.2} mieCoefficient={0.01} />
      <BlockClouds />
      <OceanPlane />
      <DistantBlockRidges />
      <ambientLight intensity={0.56} color="#e7f8ff" />
      <directionalLight
        castShadow
        position={[80, 130, 60]}
        intensity={1.45}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight args={["#c7f3ff", "#2f5a31", 0.45]} />
      <Physics gravity={[0, -15, 0]}>
        <Player onPositionChange={setPlayerPos} />
        <TerrainManager playerPos={playerPos} />
        <SpawnCamp />
      </Physics>
      <PointerLockControls />
    </>
  );
}

function BlockClouds() {
  const clouds = useMemo(
    () => [
      { position: [-24, 18, -26], scale: [8, 1.2, 2.6] },
      { position: [-18, 18.7, -25], scale: [4, 1, 2.2] },
      { position: [18, 16, -18], scale: [9, 1.3, 2.8] },
      { position: [25, 16.8, -17], scale: [4.5, 1, 2.2] },
      { position: [-12, 20, 28], scale: [10, 1.2, 3] },
      { position: [6, 22, 36], scale: [7, 1, 2.4] },
    ],
    []
  );

  return (
    <group>
      {clouds.map((cloud) => (
        <mesh
          key={cloud.position.join(",")}
          position={cloud.position as [number, number, number]}
          scale={cloud.scale as [number, number, number]}
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f8fbff" roughness={0.95} transparent opacity={0.78} />
        </mesh>
      ))}
    </group>
  );
}

function OceanPlane() {
  return (
    <mesh position={[0, -0.42, -18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[160, 110, 1, 1]} />
      <meshStandardMaterial
        color="#38bdf8"
        emissive="#075985"
        emissiveIntensity={0.16}
        roughness={0.38}
        metalness={0.05}
        transparent
        opacity={0.32}
      />
    </mesh>
  );
}

function DistantBlockRidges() {
  const blocks = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const x = -42 + index * 5;
        const height = 2 + ((index * 7) % 5);

        return {
          key: `ridge-${index}`,
          position: [x, height / 2 - 1, 42 + (index % 3) * 4] as [number, number, number],
          scale: [4, height, 4] as [number, number, number],
          color: index % 4 === 0 ? "#d6c06f" : index % 3 === 0 ? "#5f8f3a" : "#64748b",
        };
      }),
    []
  );

  return (
    <group>
      {blocks.map((block) => (
        <mesh key={block.key} position={block.position} scale={block.scale} receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={block.color} roughness={0.86} />
        </mesh>
      ))}
    </group>
  );
}
