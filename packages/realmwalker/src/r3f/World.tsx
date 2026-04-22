import { ContactShadows, Float, Sky, Sparkles, Stars } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useTrait } from "koota/react";
import { DoubleSide } from "three";
import { RealmTrait } from "../store/traits";
import { realmEntity } from "../store/world";
import { Player } from "./Player";

const ZONES = [
  {
    background: "#07111f",
    fog: "#0c1b2f",
    floor: "#13251f",
    path: "#256d68",
    accent: "#7dd3fc",
    secondary: "#c084fc",
  },
  {
    background: "#130d2a",
    fog: "#24114a",
    floor: "#1d1934",
    path: "#6d28d9",
    accent: "#c084fc",
    secondary: "#f0abfc",
  },
  {
    background: "#1e1535",
    fog: "#312044",
    floor: "#221b2d",
    path: "#a855f7",
    accent: "#fbbf24",
    secondary: "#fb7185",
  },
  {
    background: "#081f1d",
    fog: "#0d3b36",
    floor: "#122620",
    path: "#14b8a6",
    accent: "#5eead4",
    secondary: "#fde68a",
  },
];
const PILLARS = Array.from({ length: 12 }, (_, index) => ({
  id: `pillar-${index + 1}`,
  angle: (index / 12) * Math.PI * 2,
  radius: 24 + (index % 3) * 6,
  height: 7 + (index % 4),
}));
const RUNIC_RINGS = [8, 16, 26, 38].map((radius) => ({
  id: `runic-ring-${radius}`,
  radius,
}));
const PATH_SLABS = Array.from({ length: 11 }, (_, index) => ({
  id: `path-slab-${index + 1}`,
  z: -30 + index * 6,
  width: index % 2 === 0 ? 5.6 : 4.6,
}));
const FLOATING_SIGILS = Array.from({ length: 8 }, (_, index) => ({
  id: `floating-sigil-${index + 1}`,
  angle: (index / 8) * Math.PI * 2,
  radius: 18 + (index % 2) * 10,
  y: 5 + (index % 3) * 1.4,
}));

export function World() {
  const state = useTrait(realmEntity, RealmTrait);
  const zone = ZONES[(state.zone - 1) % ZONES.length];

  return (
    <>
      <color attach="background" args={[zone.background]} />
      <fog attach="fog" args={[zone.fog, 28, 105]} />
      <Sky sunPosition={[-8, 8, 14]} turbidity={8} rayleigh={0.7} mieCoefficient={0.02} />
      <Stars radius={90} depth={45} count={900} factor={3} saturation={0.6} fade speed={0.2} />
      <ambientLight intensity={0.65} color="#dbeafe" />
      <hemisphereLight args={[zone.accent, zone.floor, 1.3]} />
      <directionalLight position={[10, 24, 12]} intensity={1.8} color="#f8fafc" castShadow />
      <pointLight position={[0, 8, -18]} intensity={4} distance={55} color={zone.accent} />
      <pointLight position={[16, 6, 20]} intensity={2.5} distance={32} color={zone.secondary} />

      <Physics gravity={[0, -20, 0]}>
        <Player />

        <RigidBody type="fixed">
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[180, 180]} />
              <meshStandardMaterial color={zone.floor} roughness={0.92} metalness={0.05} />
            </mesh>
            {PATH_SLABS.map((slab) => (
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
            {RUNIC_RINGS.map((ring) => (
              <mesh key={ring.id} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                <torusGeometry args={[ring.radius, 0.045, 8, 160]} />
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

        {PILLARS.map((pillar) => (
          <RigidBody
            key={pillar.id}
            position={[
              Math.sin(pillar.angle) * pillar.radius,
              pillar.height / 2,
              Math.cos(pillar.angle) * pillar.radius,
            ]}
            type="fixed"
          >
            <group>
              <mesh castShadow receiveShadow position={[0, -pillar.height / 2 + 0.35, 0]}>
                <cylinderGeometry args={[2.6, 3.2, 0.7, 6]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
              </mesh>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.4, pillar.height, 2.4]} />
                <meshStandardMaterial color="#1e1b4b" roughness={0.85} />
              </mesh>
              <mesh castShadow position={[0, pillar.height / 2 + 0.8, 0]}>
                <octahedronGeometry args={[1.35]} />
                <meshStandardMaterial
                  color={zone.secondary}
                  emissive={zone.secondary}
                  emissiveIntensity={0.75}
                  roughness={0.35}
                />
              </mesh>
              <mesh
                rotation={[Math.PI / 2, 0, pillar.angle]}
                position={[0, pillar.height / 2 + 0.8, 0]}
              >
                <torusGeometry args={[1.9, 0.045, 8, 64]} />
                <meshStandardMaterial
                  color={zone.accent}
                  emissive={zone.accent}
                  emissiveIntensity={0.8}
                />
              </mesh>
            </group>
          </RigidBody>
        ))}
      </Physics>

      {FLOATING_SIGILS.map((sigil) => (
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
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[0, 7, -42]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[5.2, 0.28, 12, 96]} />
            <meshStandardMaterial
              color={zone.secondary}
              emissive={zone.secondary}
              emissiveIntensity={1.1}
            />
          </mesh>
          <mesh>
            <circleGeometry args={[4.85, 64]} />
            <meshBasicMaterial color={zone.accent} transparent opacity={0.24} side={DoubleSide} />
          </mesh>
          <pointLight color={zone.secondary} intensity={4} distance={32} />
        </group>
      </Float>
      <Sparkles count={80} scale={[70, 18, 70]} size={2.6} speed={0.35} color={zone.accent} />
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={90} blur={2.5} />
    </>
  );
}
