import { createCavernLayout } from "@logic/games/primordial-ascent/engine/primordialSimulation";
import type { PrimordialGrappleGuideCue } from "@logic/games/primordial-ascent/engine/types";
import { PrimordialTrait } from "@logic/games/primordial-ascent/store/traits";
import { primordialEntity } from "@logic/games/primordial-ascent/store/world";
import { RigidBody } from "@react-three/rapier";
import { useTrait } from "koota/react";
import { useMemo } from "react";
import * as THREE from "three";

const GUIDE_MARKERS = [
  { id: "guide-marker-near", radius: 1, y: -5.8 },
  { id: "guide-marker-mid", radius: 0.72, y: -8.4 },
  { id: "guide-marker-far", radius: 0.48, y: -10.8 },
] as const;

export function CavernGuide() {
  const layout = useMemo(() => createCavernLayout(), []);
  const state = useTrait(primordialEntity, PrimordialTrait);

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
            <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.52, 0.72, 48]} />
              <meshBasicMaterial
                color={state.routeCue.nextShelfId === platform.id ? "#caff8a" : "#77f08d"}
                transparent
                opacity={state.routeCue.nextShelfId === platform.id ? 0.52 : 0.22}
                side={THREE.DoubleSide}
              />
            </mesh>
            {state.routeCue.nextShelfId === platform.id ? (
              <pointLight color="#a3ff76" intensity={10} distance={18} decay={2} />
            ) : null}
          </group>
        </RigidBody>
      ))}

      {layout.anchors.map((anchor) => (
        <group key={anchor.id} position={anchor.position}>
          {state.routeCue.nextAnchorId === anchor.id ? (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[anchor.ringRadius * 1.32, 0.11, 10, 64]} />
              <meshBasicMaterial color="#f0ffff" transparent opacity={0.46} toneMapped={false} />
            </mesh>
          ) : null}
          <mesh name="terrain-chunk" rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[anchor.radius, anchor.radius * 0.72, 0.32, 32]} />
            <meshStandardMaterial
              color="#06303a"
              emissive={anchor.accent}
              emissiveIntensity={state.routeCue.nextAnchorId === anchor.id ? 1.45 : 0.82}
              roughness={0.58}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[anchor.ringRadius, 0.16, 10, 42]} />
            <meshStandardMaterial
              color="#d9fbff"
              emissive={anchor.accent}
              emissiveIntensity={state.routeCue.nextAnchorId === anchor.id ? 2.8 : 1.8}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[anchor.ringRadius * 0.7, 0.08, 8, 32]} />
            <meshBasicMaterial color={new THREE.Color(anchor.accent)} transparent opacity={0.7} />
          </mesh>
          <pointLight
            color={anchor.accent}
            intensity={state.routeCue.nextAnchorId === anchor.id ? 22 : 12}
            distance={state.routeCue.nextAnchorId === anchor.id ? 48 : 34}
            decay={2.2}
          />
        </group>
      ))}

      {state.routeCue.nextAnchorPosition ? (
        <GrappleGuideMarkers
          cue={state.grappleGuideCue}
          position={state.routeCue.nextAnchorPosition}
        />
      ) : null}

      <RouteBeaconTrail />

      <group position={[0, 24, -32]}>
        {[0, 1, 2, 3].map((index) => (
          <mesh
            key={`route-ring-${index}`}
            position={[0, index * 13, -index * 18]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[7.6 + index * 0.6, 0.07, 8, 56]} />
            <meshBasicMaterial color="#36fbd1" transparent opacity={0.34 - index * 0.045} />
          </mesh>
        ))}
        <mesh position={[0, -5, 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[9.5, 12.5, 48]} />
          <meshBasicMaterial color="#ff6a2a" transparent opacity={0.24} />
        </mesh>
      </group>

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
      <group position={[0, 108, -126]}>
        {[0, 1, 2].map((index) => (
          <mesh
            key={`surface-vent-${index}`}
            position={[0, index * 14, -index * 14]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[11 + index * 3.8, 0.16, 10, 72]} />
            <meshBasicMaterial
              color="#84f8ff"
              transparent
              opacity={0.26 - index * 0.055}
              toneMapped={false}
            />
          </mesh>
        ))}
        <pointLight color="#84f8ff" intensity={20} distance={64} decay={2} />
      </group>
    </group>
  );
}

function GrappleGuideMarkers({
  cue,
  position,
}: {
  cue: PrimordialGrappleGuideCue;
  position: [number, number, number];
}) {
  if (!["anchor", "reticle", "lava", "tether"].includes(cue.focus)) return null;

  const color =
    cue.kind === "missed-grip" ? "#ffb86b" : cue.urgency === "high" ? "#ff7448" : "#eaffff";
  const ringOpacity = cue.pulse ? 0.58 : 0.32;

  return (
    <group position={position}>
      {[0, 1, 2].map((index) => (
        <mesh
          key={`grapple-guide-ring-${index}`}
          position={[0, 0, index * -0.18]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[8.6 + index * 1.1, 0.06, 8, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={Math.max(0.16, ringOpacity - index * 0.12)}
            toneMapped={false}
          />
        </mesh>
      ))}
      {GUIDE_MARKERS.map((marker) => (
        <mesh key={marker.id} position={[0, marker.y, 0]}>
          <sphereGeometry args={[marker.radius, 12, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.72} toneMapped={false} />
        </mesh>
      ))}
      <pointLight color={color} intensity={cue.pulse ? 18 : 9} distance={34} decay={2.1} />
    </group>
  );
}

function RouteBeaconTrail() {
  const layout = useMemo(() => createCavernLayout(), []);
  const state = useTrait(primordialEntity, PrimordialTrait);
  const points = useMemo(() => {
    const route = [
      [0, 12, -8] as [number, number, number],
      ...layout.anchors.map((a) => a.position),
    ];
    const samples: Array<{ id: string; position: [number, number, number]; anchorId: string }> = [];

    for (let index = 1; index < route.length; index++) {
      const from = route[index - 1];
      const to = route[index];
      const anchorId = layout.anchors[index - 1]?.id ?? "surface";

      for (let step = 1; step <= 3; step++) {
        const t = step / 4;
        samples.push({
          id: `${anchorId}-beacon-${step}`,
          anchorId,
          position: [
            from[0] + (to[0] - from[0]) * t,
            from[1] + (to[1] - from[1]) * t,
            from[2] + (to[2] - from[2]) * t,
          ],
        });
      }
    }

    return samples;
  }, [layout]);

  return (
    <group>
      {points.map((point) => {
        const isActive = point.anchorId === state.routeCue.nextAnchorId;
        const isPassed = point.position[1] < state.altitude - 6;

        return (
          <mesh key={point.id} position={point.position}>
            <sphereGeometry args={[isActive ? 0.72 : 0.46, 12, 8]} />
            <meshBasicMaterial
              color={isActive ? "#eaffff" : "#36fbd1"}
              transparent
              opacity={isPassed ? 0.1 : isActive ? 0.82 : 0.42}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
