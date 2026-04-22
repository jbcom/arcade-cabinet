import { Sky } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Mech } from "./Mech";

const ARENA_OBSTACLES = Array.from({ length: 24 }, (_, index) => {
  const ring = index < 8 ? 34 : index < 16 ? 62 : 88;
  const angle = (index / 8) * Math.PI * 2 + (index % 3) * 0.18;
  const scale = index % 4 === 0 ? [7, 9, 5] : index % 3 === 0 ? [5, 6, 9] : [4, 4, 4];
  return {
    id: `obstacle-${index}`,
    position: [Math.cos(angle) * ring, scale[1] / 2, Math.sin(angle) * ring] as [
      number,
      number,
      number,
    ],
    scale: scale as [number, number, number],
  };
});

function ArenaFloor() {
  return (
    <RigidBody type="fixed">
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#101827" roughness={0.9} />
        </mesh>
        {[28, 56, 84].map((radius) => (
          <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <torusGeometry args={[radius, 0.18, 8, 96]} />
            <meshStandardMaterial color="#164e63" emissive="#0891b2" emissiveIntensity={0.22} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

function ArenaObstacle({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: [number, number, number];
}) {
  return (
    <RigidBody position={position} type="fixed">
      <mesh castShadow receiveShadow>
        <boxGeometry args={scale} />
        <meshStandardMaterial color="#3f4656" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, scale[1] / 2 + 0.08, 0]}>
        <boxGeometry args={[scale[0] * 0.82, 0.12, scale[2] * 0.82]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.5} />
      </mesh>
    </RigidBody>
  );
}

export function World() {
  return (
    <>
      <Sky sunPosition={[80, 26, 60]} turbidity={8} rayleigh={0.55} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[50, 100, 50]} intensity={1.25} castShadow />
      <pointLight position={[0, 16, 0]} color="#00ffcc" intensity={2.4} distance={90} />

      <Physics gravity={[0, -9.8, 0]}>
        <Mech />
        <ArenaFloor />
        {ARENA_OBSTACLES.map((obstacle) => (
          <ArenaObstacle key={obstacle.id} position={obstacle.position} scale={obstacle.scale} />
        ))}
      </Physics>
    </>
  );
}
