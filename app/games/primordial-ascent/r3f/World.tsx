import { PrimordialTrait } from "@logic/games/primordial-ascent/store/traits";
import { primordialEntity } from "@logic/games/primordial-ascent/store/world";
import { PointerLockControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useTrait } from "koota/react";
import { CavernGuide } from "./CavernGuide";
import { Lava } from "./Lava";
import { Player } from "./Player";
import { TerrainManager } from "./TerrainManager";

export function World() {
  const state = useTrait(primordialEntity, PrimordialTrait);

  return (
    <>
      <color attach="background" args={["#06131a"]} />
      <ambientLight intensity={0.42} color="#b9f7ff" />
      <directionalLight position={[10, 38, 12]} intensity={1.35} castShadow color="#dffbff" />
      <pointLight position={[0, -24, -18]} intensity={38} distance={92} color="#ff3b1f" />
      <spotLight
        position={[-18, 28, 10]}
        angle={0.55}
        penumbra={0.7}
        intensity={48}
        distance={120}
        color="#00e5ff"
      />
      <spotLight
        position={[10, 34, -32]}
        angle={0.42}
        penumbra={0.8}
        intensity={28}
        distance={130}
        color="#36fbd1"
      />
      <spotLight
        position={[0, 116, -124]}
        angle={0.74}
        penumbra={0.84}
        intensity={38}
        distance={190}
        color="#9af8ff"
      />
      <fogExp2 attach="fog" args={["#06131a", 0.0058]} />

      <Physics gravity={[0, -22, 0]}>
        <CavernGuide />
        <Player />
        <TerrainManager />
      </Physics>

      <Lava />
      <HeatShimmer y={state.lavaHeight + 3} intensity={Math.max(0, 1 - state.distToLava / 70)} />
      {state.thermalLift > 0 ? (
        <ThermalDraft lift={state.thermalLift} y={state.lavaHeight + 8} />
      ) : null}
      <AscentAxis progress={state.objectiveProgress} />

      {state.phase === "playing" && <PointerLockControls />}
    </>
  );
}

function AscentAxis({ progress }: { progress: number }) {
  const opacity = Math.max(0.1, 0.34 - progress / 420);

  return (
    <group position={[0, 86, -104]}>
      {[0, 1, 2, 3].map((index) => (
        <mesh
          key={`ascent-axis-${index}`}
          position={[index % 2 === 0 ? -8 : 8, index * 22 - 38, index * -18 + 42]}
          rotation={[0.18, 0, index % 2 === 0 ? 0.08 : -0.08]}
        >
          <planeGeometry args={[2.2, 58]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? "#2dd4bf" : "#93f8ff"}
            transparent
            opacity={opacity - index * 0.035}
            side={2}
          />
        </mesh>
      ))}
    </group>
  );
}

function HeatShimmer({ y, intensity }: { y: number; intensity: number }) {
  if (intensity <= 0.03) return null;

  return (
    <group position={[0, y, -20]}>
      {[0, 1, 2, 3].map((index) => {
        const innerRadius = 12 + index * 4.4;

        return (
          <mesh
            key={`heat-shimmer-${index}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, index * 2.2, 0]}
          >
            <ringGeometry args={[innerRadius, innerRadius + 0.09, 72]} />
            <meshBasicMaterial
              color="#ff8a2a"
              transparent
              opacity={Math.max(0, intensity * (0.26 - index * 0.045))}
            />
          </mesh>
        );
      })}
    </group>
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
