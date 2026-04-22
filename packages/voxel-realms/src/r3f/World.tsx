import { PointerLockControls, Sky } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useState } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import { TerrainManager } from "./TerrainManager";

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
        {/* Sanity Check Cube */}
        <RigidBody position={[0, -5, 0]} type="fixed">
          <mesh castShadow receiveShadow>
            <boxGeometry args={[10, 1, 10]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </RigidBody>
      </Physics>
      {/* Absolute Sanity Check - Non-Physics Mesh */}
      <mesh position={[0, 0, -5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      <PointerLockControls />
    </>
  );
}
