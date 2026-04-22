import { createProtocolArenaLayout } from "@logic/games/protocol-snw/engine/protocolSimulation";
import { InstancedRigidBodies } from "@react-three/rapier";
import { useMemo } from "react";

const terrain = createProtocolArenaLayout().terrain;

export function TerrainManager() {
  const instances = useMemo(
    () =>
      terrain.map((block) => ({
        key: block.id,
        position: block.position,
        scale: block.scale,
      })),
    []
  );

  return (
    <InstancedRigidBodies instances={instances} colliders="cuboid" type="fixed">
      <instancedMesh args={[undefined, undefined, terrain.length]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#111827" roughness={0.82} metalness={0.14} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
