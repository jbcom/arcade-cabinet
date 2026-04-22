import { ContactShadows, Float, Sky, Sparkles, Stars } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useTrait } from "koota/react";
import { DoubleSide } from "three";
import { createRealmLayout, getZonePalette } from "../engine/realmSimulation";
import type { RealmRelic, RealmSentinel } from "../engine/types";
import { RealmTrait } from "../store/traits";
import { realmEntity } from "../store/world";
import { Player } from "./Player";

export function World() {
  const state = useTrait(realmEntity, RealmTrait);
  const zone = getZonePalette(state.zone);
  const layout = createRealmLayout(state.zone);

  return (
    <>
      <color attach="background" args={[zone.background]} />
      <fog attach="fog" args={[zone.fog, 30, 112]} />
      <Sky sunPosition={[-8, 8, 14]} turbidity={8} rayleigh={0.7} mieCoefficient={0.02} />
      <Stars radius={90} depth={45} count={900} factor={3} saturation={0.6} fade speed={0.2} />
      <ambientLight intensity={0.6} color="#dbeafe" />
      <hemisphereLight args={[zone.accent, zone.floor, 1.25]} />
      <directionalLight position={[10, 24, 12]} intensity={1.75} color="#f8fafc" castShadow />
      <pointLight position={[0, 8, -18]} intensity={4} distance={55} color={zone.accent} />
      <pointLight position={[16, 6, 20]} intensity={2.5} distance={32} color={zone.secondary} />

      <Physics gravity={[0, -20, 0]}>
        <Player />
        <RealmFloor zone={zone} layout={layout} />
        {layout.pillars.map((pillar) => (
          <RigidBody
            key={pillar.id}
            position={[
              Math.sin(pillar.angle) * pillar.radius,
              pillar.height / 2,
              Math.cos(pillar.angle) * pillar.radius,
            ]}
            type="fixed"
          >
            <Pillar
              height={pillar.height}
              angle={pillar.angle}
              accent={zone.accent}
              secondary={zone.secondary}
            />
          </RigidBody>
        ))}
        {layout.sentinels.map((sentinel) => (
          <RigidBody key={sentinel.id} position={sentinel.position} type="fixed">
            <Sentinel sentinel={sentinel} accent={zone.secondary} />
          </RigidBody>
        ))}
      </Physics>

      {layout.relics.map((relic) => (
        <Relic
          key={relic.id}
          relic={relic}
          accent={zone.accent}
          secondary={zone.secondary}
          collected={state.loot.includes(relic.name)}
        />
      ))}
      {layout.floatingSigils.map((sigil) => (
        <Float key={sigil.id} speed={1.2} rotationIntensity={0.6} floatIntensity={1.4}>
          <mesh
            position={[
              Math.sin(sigil.angle) * sigil.radius,
              sigil.y,
              Math.cos(sigil.angle) * sigil.radius,
            ]}
            rotation={[Math.PI / 2, 0, sigil.angle]}
          >
            <torusGeometry args={[1.3, 0.06, 8, 48]} />
            <meshStandardMaterial
              color={zone.accent}
              emissive={zone.accent}
              emissiveIntensity={0.9}
              transparent
              opacity={0.78}
            />
          </mesh>
        </Float>
      ))}
      <Portal position={layout.portal} accent={zone.accent} secondary={zone.secondary} />
      <Sparkles count={85} scale={[70, 18, 70]} size={2.6} speed={0.35} color={zone.accent} />
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={90} blur={2.5} />
    </>
  );
}

function RealmFloor({
  zone,
  layout,
}: {
  zone: ReturnType<typeof getZonePalette>;
  layout: ReturnType<typeof createRealmLayout>;
}) {
  return (
    <RigidBody type="fixed">
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[180, 180]} />
          <meshStandardMaterial color={zone.floor} roughness={0.92} metalness={0.05} />
        </mesh>
        {layout.pathSlabs.map((slab) => (
          <mesh key={slab.id} position={[0, 0.04, slab.z]} receiveShadow>
            <boxGeometry args={[slab.width, 0.08, 3.8]} />
            <meshStandardMaterial
              color={zone.path}
              emissive={zone.path}
              emissiveIntensity={0.15}
              roughness={0.8}
            />
          </mesh>
        ))}
        {layout.runicRings.map((radius) => (
          <mesh key={radius} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
            <torusGeometry args={[radius, 0.045, 8, 160]} />
            <meshStandardMaterial
              color={zone.accent}
              emissive={zone.accent}
              emissiveIntensity={0.65}
              transparent
              opacity={0.58}
            />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

function Pillar({
  height,
  angle,
  accent,
  secondary,
}: {
  height: number;
  angle: number;
  accent: string;
  secondary: string;
}) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -height / 2 + 0.35, 0]}>
        <cylinderGeometry args={[2.6, 3.2, 0.7, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, height, 2.4]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, height / 2 + 0.8, 0]}>
        <octahedronGeometry args={[1.35]} />
        <meshStandardMaterial
          color={secondary}
          emissive={secondary}
          emissiveIntensity={0.75}
          roughness={0.35}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, angle]} position={[0, height / 2 + 0.8, 0]}>
        <torusGeometry args={[1.9, 0.045, 8, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function Sentinel({ sentinel, accent }: { sentinel: RealmSentinel; accent: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, sentinel.scale[1] / 2, 0]}>
        <boxGeometry args={sentinel.scale} />
        <meshStandardMaterial
          color="#111827"
          emissive="#0f172a"
          emissiveIntensity={0.2}
          roughness={0.7}
        />
      </mesh>
      <mesh castShadow position={[0, sentinel.scale[1] + 0.55, 0]}>
        <octahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.1}
          roughness={0.35}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[sentinel.patrolRadius - 0.08, sentinel.patrolRadius + 0.08, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function Relic({
  relic,
  accent,
  secondary,
  collected,
}: {
  relic: RealmRelic;
  accent: string;
  secondary: string;
  collected: boolean;
}) {
  if (collected) {
    return null;
  }

  const color =
    relic.rarity === "mythic" ? "#fbbf24" : relic.rarity === "rare" ? secondary : accent;

  return (
    <Float speed={1.4} rotationIntensity={0.8} floatIntensity={0.7}>
      <group position={relic.position}>
        <mesh castShadow>
          <dodecahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.05}
            roughness={0.28}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.25, 0.045, 8, 48]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
        </mesh>
        <pointLight color={color} intensity={1.4} distance={10} />
      </group>
    </Float>
  );
}

function Portal({
  position,
  accent,
  secondary,
}: {
  position: [number, number, number];
  accent: string;
  secondary: string;
}) {
  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[5.2, 0.28, 12, 96]} />
          <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={1.1} />
        </mesh>
        <mesh>
          <circleGeometry args={[4.85, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={0.24} side={DoubleSide} />
        </mesh>
        <pointLight color={secondary} intensity={4} distance={32} />
      </group>
    </Float>
  );
}
