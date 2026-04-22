import { PointerLockControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useTrait } from "koota/react";
import { PrimordialTrait } from "../store/traits";
import { primordialEntity } from "../store/world";
import { Lava } from "./Lava";
import { Player } from "./Player";
import { TerrainManager } from "./TerrainManager";

export function World() {
  const state = useTrait(primordialEntity, PrimordialTrait);

  return (
    <>
      <color attach="background" args={["#020608"]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <fogExp2 attach="fog" args={["#020608", 0.015]} />

      <Physics gravity={[0, -22, 0]}>
        <Player />
        <TerrainManager />
      </Physics>

      <Lava />

      {state.phase === "playing" && <PointerLockControls />}
    </>
  );
}
