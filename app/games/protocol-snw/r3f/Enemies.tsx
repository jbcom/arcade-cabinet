import type { SNWEnemy } from "@logic/games/protocol-snw/engine/types";
import { SNWTrait } from "@logic/games/protocol-snw/store/traits";
import { snwEntity } from "@logic/games/protocol-snw/store/world";
import { RigidBody } from "@react-three/rapier";
import { useTrait } from "koota/react";

export function Enemies() {
  const state = useTrait(snwEntity, SNWTrait);

  return (
    <group>
      {state.enemies.map((enemy) => (
        <EnemyConstruct key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
}

function EnemyConstruct({ enemy }: { enemy: SNWEnemy }) {
  const color = enemy.kind === "brute" ? "#f97316" : enemy.kind === "drone" ? "#a855f7" : "#f43f5e";
  const height = enemy.kind === "brute" ? 2.5 : enemy.kind === "drone" ? 1.55 : 1.7;
  const width = enemy.kind === "brute" ? 1.45 : enemy.kind === "drone" ? 1.15 : 0.9;

  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={[enemy.position.x, enemy.position.y, enemy.position.z]}
    >
      <group>
        <mesh castShadow receiveShadow position={[0, height * 0.36, 0]}>
          {enemy.kind === "drone" ? (
            <octahedronGeometry args={[width, 0]} />
          ) : (
            <boxGeometry args={[width, height, width]} />
          )}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.55}
            roughness={0.4}
            metalness={0.28}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <ringGeometry args={[width * 0.9, width * 1.35, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.42} />
        </mesh>
        <mesh position={[0, height + 0.36, 0]}>
          <sphereGeometry args={[0.16, 12, 8]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </RigidBody>
  );
}
