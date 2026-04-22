import { Physics } from "@react-three/rapier";
import { Enemies } from "./Enemies";
import { Player } from "./Player";
import { TerrainManager } from "./TerrainManager";

const beaconPositions = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2;
  return [Math.cos(angle) * 28, -1.55, Math.sin(angle) * 28] as const;
});

function ArenaFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.96, 0]} receiveShadow>
        <circleGeometry args={[32, 96]} />
        <meshStandardMaterial
          color="#101826"
          emissive="#061d24"
          emissiveIntensity={0.28}
          roughness={0.92}
        />
      </mesh>
      {[10, 20, 30].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.9, 0]}>
          <ringGeometry args={[radius - 0.08, radius + 0.08, 96]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={radius === 30 ? 0.44 : 0.22} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <mesh key={angle} rotation={[-Math.PI / 2, 0, angle]} position={[0, -2.88, 0]}>
            <planeGeometry args={[0.12, 58]} />
            <meshBasicMaterial color="#0ea5e9" transparent opacity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function PerimeterBeacons() {
  return (
    <group>
      {beaconPositions.map(([x, y, z]) => (
        <group key={`${x}-${z}`} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.34, 3.2, 8]} />
            <meshStandardMaterial
              color="#172033"
              emissive="#0f172a"
              emissiveIntensity={0.4}
              roughness={0.55}
            />
          </mesh>
          <mesh position={[0, 1.85, 0]}>
            <octahedronGeometry args={[0.52, 0]} />
            <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2.2} />
          </mesh>
          <pointLight color="#00ffcc" intensity={1.25} distance={11} position={[0, 1.85, 0]} />
        </group>
      ))}
    </group>
  );
}

export function World() {
  return (
    <>
      <color attach="background" args={["#040609"]} />
      <ambientLight intensity={0.26} />
      <hemisphereLight args={["#67e8f9", "#05070a", 0.32]} />
      <directionalLight position={[10, 20, 10]} intensity={1.35} castShadow />
      <fogExp2 attach="fog" args={["#040609", 0.018]} />
      <ArenaFloor />
      <PerimeterBeacons />

      <Physics gravity={[0, -9.8, 0]}>
        <Player />
        <TerrainManager />
        <Enemies />
      </Physics>
    </>
  );
}
