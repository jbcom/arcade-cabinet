import { ContactShadows, Grid, Sky, Sparkles, Stars } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { createArenaLayout } from "../engine/titanSimulation";
import type { ArenaBeaconData, ArenaObstacleData } from "../engine/types";
import { Mech } from "./Mech";

const layout = createArenaLayout();

function ArenaFloor() {
  return (
    <RigidBody type="fixed">
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[220, 220]} />
          <meshStandardMaterial color="#161a21" roughness={0.92} metalness={0.18} />
        </mesh>
        <Grid
          args={[220, 220]}
          cellSize={8}
          cellThickness={0.85}
          cellColor="#26313d"
          sectionSize={24}
          sectionThickness={1.35}
          sectionColor="#0f766e"
          fadeDistance={142}
          fadeStrength={1.4}
          position={[0, 0.05, 0]}
        />
        {[28, 56, 84].map((radius) => (
          <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
            <torusGeometry args={[radius, 0.16, 8, 128]} />
            <meshStandardMaterial color="#134e4a" emissive="#2dd4bf" emissiveIntensity={0.26} />
          </mesh>
        ))}
        {layout.beacons.map((beacon) => (
          <Beacon key={beacon.id} beacon={beacon} />
        ))}
      </group>
    </RigidBody>
  );
}

function ArenaObstacle({ obstacle }: { obstacle: ArenaObstacleData }) {
  return (
    <RigidBody position={obstacle.position} type="fixed">
      {obstacle.kind === "gantry" ? (
        <Gantry obstacle={obstacle} />
      ) : obstacle.kind === "reactor" ? (
        <Reactor obstacle={obstacle} />
      ) : obstacle.kind === "pylon" ? (
        <Pylon obstacle={obstacle} />
      ) : (
        <Cover obstacle={obstacle} />
      )}
    </RigidBody>
  );
}

function Cover({ obstacle }: { obstacle: ArenaObstacleData }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={obstacle.scale} />
        <meshStandardMaterial color="#3d4551" metalness={0.44} roughness={0.46} />
      </mesh>
      <mesh position={[0, obstacle.scale[1] / 2 + 0.08, 0]}>
        <boxGeometry args={[obstacle.scale[0] * 0.86, 0.12, obstacle.scale[2] * 0.82]} />
        <meshStandardMaterial
          color={obstacle.accent}
          emissive={obstacle.accent}
          emissiveIntensity={0.48}
        />
      </mesh>
      {obstacle.threat > 1 ? (
        <mesh position={[0, obstacle.scale[1] * 0.12, obstacle.scale[2] / 2 + 0.08]}>
          <boxGeometry args={[obstacle.scale[0] * 0.72, 0.22, 0.16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.35} />
        </mesh>
      ) : null}
    </group>
  );
}

function Gantry({ obstacle }: { obstacle: ArenaObstacleData }) {
  const [width, height, depth] = obstacle.scale;

  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - 1.2), -height * 0.28, 0]} castShadow>
          <boxGeometry args={[1.8, height * 0.92, depth]} />
          <meshStandardMaterial color="#2f3540" metalness={0.55} roughness={0.42} />
        </mesh>
      ))}
      <mesh position={[0, height * 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 1.6, depth]} />
        <meshStandardMaterial color="#3f4656" metalness={0.54} roughness={0.38} />
      </mesh>
      <mesh position={[0, height * 0.18, depth / 2 + 0.16]}>
        <boxGeometry args={[width * 0.86, 0.22, 0.22]} />
        <meshStandardMaterial
          color={obstacle.accent}
          emissive={obstacle.accent}
          emissiveIntensity={0.55}
        />
      </mesh>
    </group>
  );
}

function Reactor({ obstacle }: { obstacle: ArenaObstacleData }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={[obstacle.scale[0] / 2, obstacle.scale[0] / 2.5, obstacle.scale[1], 12]}
        />
        <meshStandardMaterial color="#2a3340" metalness={0.62} roughness={0.36} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry
          args={[obstacle.scale[0] / 3.5, obstacle.scale[0] / 3.5, obstacle.scale[1] * 1.04, 12]}
        />
        <meshStandardMaterial
          color={obstacle.accent}
          emissive={obstacle.accent}
          emissiveIntensity={0.42}
          transparent
          opacity={0.62}
        />
      </mesh>
      <Sparkles count={18} color={obstacle.accent} scale={obstacle.scale[0] * 1.2} size={2} />
    </group>
  );
}

function Pylon({ obstacle }: { obstacle: ArenaObstacleData }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={[obstacle.scale[0] / 2, obstacle.scale[0] / 2, obstacle.scale[1], 6]}
        />
        <meshStandardMaterial color="#273244" metalness={0.58} roughness={0.42} />
      </mesh>
      <mesh position={[0, obstacle.scale[1] / 2 + 0.9, 0]}>
        <octahedronGeometry args={[2.8, 0]} />
        <meshStandardMaterial
          color={obstacle.accent}
          emissive={obstacle.accent}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

function Beacon({ beacon }: { beacon: ArenaBeaconData }) {
  return (
    <group position={beacon.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[beacon.radius * 0.72, beacon.radius, 48]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.32}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 2.8, 10]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

export function World() {
  return (
    <>
      <fog attach="fog" args={["#141922", 42, 176]} />
      <Sky sunPosition={[70, 22, 42]} turbidity={6.5} rayleigh={0.4} />
      <Stars radius={180} depth={38} count={900} factor={3.2} saturation={0.35} fade speed={0.25} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#94f3ff", "#312116", 0.42]} />
      <directionalLight
        position={[34, 58, 28]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 13, 0]} color="#2dd4bf" intensity={2.2} distance={74} />
      <pointLight position={[0, 10, -18]} color="#38bdf8" intensity={1.35} distance={42} />
      <pointLight position={[-42, 11, -38]} color="#f59e0b" intensity={1.8} distance={58} />

      <Physics gravity={[0, -9.8, 0]}>
        <ArenaFloor />
        {layout.obstacles.map((obstacle) => (
          <ArenaObstacle key={obstacle.id} obstacle={obstacle} />
        ))}
        <Mech />
      </Physics>
      <ContactShadows
        opacity={0.46}
        scale={120}
        blur={2.4}
        far={54}
        resolution={1024}
        color="#05070a"
      />
    </>
  );
}
