import { ContactShadows, Grid, Stars } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { createProtocolArenaLayout } from "../engine/protocolSimulation";
import type { CoverNode, PerimeterNode } from "../engine/types";
import { Enemies } from "./Enemies";
import { Player } from "./Player";
import { TerrainManager } from "./TerrainManager";

const arena = createProtocolArenaLayout();

function ArenaFloor() {
  return (
    <RigidBody type="fixed">
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.95, 0]} receiveShadow>
          <circleGeometry args={[arena.radius + 4, 128]} />
          <meshStandardMaterial
            color="#071116"
            emissive="#061d24"
            emissiveIntensity={0.34}
            roughness={0.86}
            metalness={0.2}
          />
        </mesh>
        <Grid
          args={[(arena.radius + 10) * 2, (arena.radius + 10) * 2]}
          cellSize={4}
          cellThickness={0.65}
          cellColor="#0f2e35"
          sectionSize={12}
          sectionThickness={1.1}
          sectionColor="#0f766e"
          fadeDistance={78}
          fadeStrength={1.2}
          position={[0, -2.86, 0]}
        />
        {arena.rings.map((radius) => (
          <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, 0]}>
            <ringGeometry args={[radius - 0.12, radius + 0.12, 128]} />
            <meshBasicMaterial
              color="#2dd4bf"
              transparent
              opacity={radius === arena.radius ? 0.5 : 0.24}
            />
          </mesh>
        ))}
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index / 12) * Math.PI * 2;
          return (
            <mesh key={angle} rotation={[-Math.PI / 2, 0, angle]} position={[0, -2.78, 0]}>
              <planeGeometry args={[0.1, arena.radius * 1.88]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
            </mesh>
          );
        })}
        {arena.perimeter.map((node) => (
          <PerimeterBeacon key={node.id} node={node} />
        ))}
        {arena.cover.map((node) => (
          <CoverBaffle key={node.id} node={node} />
        ))}
      </group>
    </RigidBody>
  );
}

function PerimeterBeacon({ node }: { node: PerimeterNode }) {
  return (
    <group position={node.position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.36, 2.8, 8]} />
        <meshStandardMaterial
          color="#172033"
          emissive="#0f172a"
          emissiveIntensity={0.36}
          roughness={0.55}
          metalness={0.28}
        />
      </mesh>
      <mesh position={[0, 1.64, 0]}>
        <octahedronGeometry args={[0.54, 0]} />
        <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={2.1} />
      </mesh>
      <pointLight color={node.color} intensity={1.2} distance={10} position={[0, 1.64, 0]} />
    </group>
  );
}

function CoverBaffle({ node }: { node: CoverNode }) {
  return (
    <group position={node.position} rotation={[0, node.rotationY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={node.scale} />
        <meshStandardMaterial
          color={node.color}
          emissive="#071116"
          roughness={0.58}
          metalness={0.38}
        />
      </mesh>
      <mesh position={[0, node.scale[1] / 2 + 0.06, 0]}>
        <boxGeometry args={[node.scale[0] * 0.78, 0.1, Math.max(0.16, node.scale[2] * 0.18)]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
}

export function World() {
  return (
    <>
      <color attach="background" args={["#03070a"]} />
      <fog attach="fog" args={["#03070a", 38, 108]} />
      <Stars radius={150} depth={38} count={1000} factor={2.8} fade speed={0.16} />
      <ambientLight intensity={0.2} />
      <hemisphereLight args={["#67e8f9", "#020617", 0.34]} />
      <directionalLight
        position={[18, 36, 18]}
        intensity={1.18}
        castShadow
        shadow-mapSize={[1536, 1536]}
      />
      <pointLight color="#2dd4bf" intensity={1.8} distance={70} position={[0, 8, 0]} />
      <pointLight color="#f43f5e" intensity={1.2} distance={48} position={[-20, 6, -18]} />

      <Physics gravity={[0, -9.8, 0]}>
        <ArenaFloor />
        <TerrainManager />
        <Enemies />
        <Player />
      </Physics>
      <ContactShadows
        opacity={0.48}
        scale={80}
        blur={2.1}
        far={34}
        resolution={1024}
        color="#020305"
      />
    </>
  );
}
