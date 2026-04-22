import { InstancedRigidBodies } from "@react-three/rapier";
import { useEffect, useMemo, useState } from "react";
import { SNWTrait } from "../store/traits";
import { snwEntity } from "../store/world";

interface EnemyData {
  id: string;
  x: number;
  z: number;
  type: string;
}

export function Enemies() {
  const [enemies, setEnemies] = useState<EnemyData[]>([]);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const state = snwEntity.get(SNWTrait);
      if (state?.phase !== "playing") return;

      setEnemies((prev) => {
        if (prev.length > 20) return prev; // Max enemies

        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * 10;
        return [
          ...prev,
          {
            id: Math.random().toString(),
            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius,
            type: "grunt",
          },
        ];
      });
    }, 2000);

    return () => clearInterval(spawnInterval);
  }, []);

  const positions = useMemo(
    () => enemies.map((e) => [e.x, 1, e.z] as [number, number, number]),
    [enemies]
  );

  return (
    <InstancedRigidBodies positions={positions} colliders="cuboid">
      <instancedMesh args={[undefined, undefined, 50]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff0044" />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
