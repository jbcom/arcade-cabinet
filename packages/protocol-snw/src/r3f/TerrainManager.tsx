import { InstancedRigidBodies } from "@react-three/rapier";
import { useMemo } from "react";
import { createProtocolArenaLayout } from "../engine/protocolSimulation";

const terrain = createProtocolArenaLayout().terrain;

export function TerrainManager() {
  const positions = useMemo(() => terrain.map((block) => block.position), []);
  const scales = useMemo(() => terrain.map((block) => block.scale), []);

  return (
    <InstancedRigidBodies positions={positions} scales={scales} colliders="cuboid" type="fixed">
      <instancedMesh args={[undefined, undefined, terrain.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#111827" roughness={0.82} metalness={0.14} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
