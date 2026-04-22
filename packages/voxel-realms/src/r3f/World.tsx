import { PointerLockControls, Sky } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useState } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import { TerrainManager } from "./TerrainManager";

const SPAWN_BLOCKS: Array<[number, number, number, string]> = [
  [-1, -1, -1, "#5b7f3a"],
  [0, -1, -1, "#6b8f3f"],
  [1, -1, -1, "#5b7f3a"],
  [-1, -1, 0, "#6b8f3f"],
  [0, -1, 0, "#8fbf52"],
  [1, -1, 0, "#6b8f3f"],
  [-1, -1, 1, "#4f6f35"],
  [0, -1, 1, "#6b8f3f"],
  [1, -1, 1, "#4f6f35"],
  [0, -2, 0, "#7c6a55"],
];

function SpawnPlatform() {
  return (
    <RigidBody type="fixed">
      <group>
        {SPAWN_BLOCKS.map(([x, y, z, color]) => (
          <mesh key={`${x}-${y}-${z}`} position={[x, y, z]} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.88} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

function HorizonBeacon() {
  return (
    <group position={[0, 0, -10]}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.5, 3.6, 0.5]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.3} />
      </mesh>
      <pointLight color="#38bdf8" intensity={2.2} distance={16} position={[0, 4, 0]} />
    </group>
  );
}

export function World() {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 2, 0));

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[100, 200, 100]}
        intensity={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <Physics gravity={[0, -15, 0]}>
        <Player onPositionChange={setPlayerPos} />
        <TerrainManager playerPos={playerPos} />
        <SpawnPlatform />
      </Physics>
      <HorizonBeacon />
      <PointerLockControls />
    </>
  );
}
