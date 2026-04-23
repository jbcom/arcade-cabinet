import { PointerLockControls, Sky } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useState } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import { SpawnCamp } from "./SpawnCamp";
import { TerrainManager } from "./TerrainManager";

export function World() {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 4, 0));

  return (
    <>
      <Sky sunPosition={[80, 34, 90]} turbidity={5} rayleigh={1.5} mieCoefficient={0.012} />
      <ambientLight intensity={0.46} color="#e7f8ff" />
      <directionalLight
        castShadow
        position={[80, 130, 60]}
        intensity={1.25}
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
