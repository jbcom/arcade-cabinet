import { PointerLockControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useTrait } from "koota/react";
import { PrimordialTrait } from "../store/traits";
import { primordialEntity } from "../store/world";
import { CavernGuide } from "./CavernGuide";
import { Lava } from "./Lava";
import { Player } from "./Player";
import { TerrainManager } from "./TerrainManager";

export function World() {
  const state = useTrait(primordialEntity, PrimordialTrait);

  return (
    <>
      <color attach="background" args={["#020608"]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[10, 38, 12]} intensity={0.85} castShadow color="#dffbff" />
      <pointLight position={[0, -24, -18]} intensity={28} distance={80} color="#ff3b1f" />
      <spotLight
        position={[-18, 28, 10]}
        angle={0.55}
        penumbra={0.7}
        intensity={36}
        distance={120}
        color="#00e5ff"
      />
      <fogExp2 attach="fog" args={["#020608", 0.012]} />

      <Physics gravity={[0, -22, 0]}>
        <CavernGuide />
        <Player />
        <TerrainManager />
      </Physics>

      <Lava />
      {state.thermalLift > 0 ? (
        <ThermalDraft lift={state.thermalLift} y={state.lavaHeight + 8} />
      ) : null}

      {state.phase === "playing" && <PointerLockControls />}
    </>
  );
}

function ThermalDraft({ lift, y }: { lift: number; y: number }) {
  const opacity = Math.min(0.48, 0.12 + lift / 50);

  return (
    <group position={[0, y, -18]}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[0, index * 3.8, 0]}>
          <torusGeometry args={[8 + index * 3.4, 0.08, 8, 72]} />
          <meshBasicMaterial color="#f97316" transparent opacity={opacity - index * 0.08} />
        </mesh>
      ))}
    </group>
  );
}
