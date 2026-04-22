import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import * as THREE from "three";
import { createCavernLayout } from "../engine/primordialSimulation";

export function CavernGuide() {
  const layout = useMemo(() => createCavernLayout(), []);

  return (
    <group>
      {layout.ribs.map((rib) => (
        <group key={rib.id} position={rib.position} rotation={rib.rotation} scale={rib.scale}>
          <mesh>
            <torusGeometry args={[22, 0.8, 8, 36, Math.PI * 1.34]} />
            <meshStandardMaterial
              color={rib.accent}
              emissive="#0f172a"
              emissiveIntensity={0.15}
              roughness={0.82}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[0, -1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[1.4, 36, 1.2]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {layout.platforms.map((platform) => (
        <RigidBody key={platform.id} type="fixed" colliders="cuboid" position={platform.position}>
          <group scale={platform.scale}>
            <mesh name="terrain-chunk" position={[0, -0.14, 0]}>
              <boxGeometry args={[1, 0.52, 1]} />
              <meshStandardMaterial color="#25303a" roughness={0.95} />
            </mesh>
            <mesh name="terrain-chunk" position={[0, 0.16, 0]}>
              <boxGeometry args={[0.96, 0.08, 0.96]} />
              <meshStandardMaterial
                color={platform.accent}
                emissive="#18a55c"
                emissiveIntensity={0.45}
                roughness={0.7}
              />
            </mesh>
          </group>
        </RigidBody>
      ))}

      {layout.anchors.map((anchor) => (
        <group key={anchor.id} position={anchor.position}>
          <mesh name="terrain-chunk" rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[anchor.radius, anchor.radius * 0.72, 0.32, 32]} />
            <meshStandardMaterial
              color="#06303a"
              emissive={anchor.accent}
              emissiveIntensity={0.8}
              roughness={0.58}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[anchor.ringRadius, 0.16, 10, 42]} />
            <meshStandardMaterial
              color="#d9fbff"
              emissive={anchor.accent}
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[anchor.ringRadius * 0.7, 0.08, 8, 32]} />
            <meshBasicMaterial color={new THREE.Color(anchor.accent)} transparent opacity={0.7} />
          </mesh>
          <pointLight color={anchor.accent} intensity={12} distance={34} decay={2.2} />
        </group>
      ))}

      <mesh position={[0, 92, -98]} rotation={[0.35, 0.2, 0]}>
        <coneGeometry args={[4.8, 18, 5]} />
        <meshStandardMaterial
          color="#102032"
          emissive="#123a4a"
          emissiveIntensity={0.35}
          roughness={0.86}
        />
      </mesh>
      <mesh position={[-14, 58, -68]} rotation={[-0.2, 0.4, 0.1]}>
        <coneGeometry args={[3.8, 16, 5]} />
        <meshStandardMaterial
          color="#1f2937"
          emissive="#334155"
          emissiveIntensity={0.18}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}
