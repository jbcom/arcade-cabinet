import { InstancedRigidBodies } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CONFIG } from "../engine/types";

function jsSmoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function fbm(x: number, z: number) {
  return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
}

export function TerrainManager() {
  const _meshRef = useRef<THREE.InstancedMesh>(null);
  const _dummy = useMemo(() => new THREE.Object3D(), []);

  const blocks = useMemo(() => {
    const list = [];
    for (let x = -CONFIG.WORLD_SIZE / 2; x < CONFIG.WORLD_SIZE / 2; x++) {
      for (let z = -CONFIG.WORLD_SIZE / 2; z < CONFIG.WORLD_SIZE / 2; z++) {
        const wx = x * 2;
        const wz = z * 2;
        const distFromCenter = Math.sqrt(wx * wx + wz * wz);
        let h = -4.0;
        if (distFromCenter >= CONFIG.ARENA_RADIUS) {
          const rawFbm = fbm(x * 1.2, z * 1.2);
          const blend = jsSmoothstep(CONFIG.ARENA_RADIUS, CONFIG.ARENA_RADIUS + 10, distFromCenter);
          h = -4.0 * (1 - blend) + rawFbm * blend;
        }
        list.push({ x: wx, y: h, z: wz });
      }
    }
    return list;
  }, []);

  const positions = useMemo(
    () => blocks.map((b) => [b.x, b.y, b.z] as [number, number, number]),
    [blocks]
  );

  return (
    <InstancedRigidBodies positions={positions} colliders="cuboid" type="fixed">
      <instancedMesh args={[undefined, undefined, blocks.length]} receiveShadow>
        <boxGeometry args={[1.9, 1.9, 1.9]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.8} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
