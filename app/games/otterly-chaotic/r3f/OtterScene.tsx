import { browserTestCanvasGlOptions } from "@app/shared";
import {
  GOAL,
  getGoatIntent,
  getGoatPoseCue,
  getOtterlyRescueCue,
  getOtterPoseCue,
  WATER_ZONE,
} from "@logic/games/otterly-chaotic/engine/simulation";
import type {
  GoatPoseCue,
  GoatState,
  OtterlyState,
  OtterPoseCue,
} from "@logic/games/otterly-chaotic/engine/types";
import { Line } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

interface OtterSceneProps {
  state: OtterlyState;
}

function Character({
  position,
  color,
  scale = 1,
  isGoat = false,
  goatPose,
  otterPose,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  isGoat?: boolean;
  goatPose?: GoatPoseCue;
  otterPose?: OtterPoseCue;
}) {
  const otterYaw =
    otterPose && (Math.abs(otterPose.leanX) > 0.001 || Math.abs(otterPose.leanY) > 0.001)
      ? Math.atan2(otterPose.leanX, otterPose.leanY)
      : 0;
  const otterSquash = otterPose ? 1 + otterPose.energy * 0.04 : 1;
  const goatAccent = goatPose?.accent ?? "#333";
  const goatHeadPitch = goatPose?.headPitch ?? 0;
  const goatHoofLift = goatPose?.hoofLift ?? 0;

  return (
    <group
      position={position}
      rotation={[0, isGoat ? 0 : otterYaw, isGoat ? 0 : (otterPose?.leanX ?? 0) * 0.05]}
      scale={isGoat ? scale : scale * otterSquash}
    >
      {isGoat ? (
        // Detailed Goat Model
        <group>
          {/* Body */}
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.6]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Head */}
          <mesh
            castShadow
            position={[0, 0.6 - goatHeadPitch * 0.08, 0.35 + goatHeadPitch * 0.12]}
            rotation={[goatHeadPitch, 0, 0]}
          >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Horns */}
          <mesh castShadow position={[-0.1, 0.8, 0.3]} rotation={[-0.2, 0, 0]}>
            <coneGeometry args={[0.05, 0.3, 8]} />
            <meshStandardMaterial
              color={goatAccent}
              emissive={goatAccent}
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh castShadow position={[0.1, 0.8, 0.3]} rotation={[-0.2, 0, 0]}>
            <coneGeometry args={[0.05, 0.3, 8]} />
            <meshStandardMaterial
              color={goatAccent}
              emissive={goatAccent}
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh castShadow position={[0, 0.52, 0.53]}>
            <boxGeometry args={[0.18, 0.035, 0.045]} />
            <meshStandardMaterial
              color={goatAccent}
              emissive={goatAccent}
              emissiveIntensity={0.45}
            />
          </mesh>
          {/* Legs */}
          <mesh castShadow position={[-0.15, 0.2 + goatHoofLift, 0.2]}>
            <cylinderGeometry args={[0.05, 0.04, 0.4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.15, 0.2, 0.2]}>
            <cylinderGeometry args={[0.05, 0.04, 0.4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[-0.15, 0.2, -0.2]}>
            <cylinderGeometry args={[0.05, 0.04, 0.4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.15, 0.2, -0.2]}>
            <cylinderGeometry args={[0.05, 0.04, 0.4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ) : (
        // Detailed Otter Model
        <group>
          {/* Long sleek body */}
          <mesh castShadow position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.2, 0.5, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.3, 0.4]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* Snout/Cheeks */}
          <mesh castShadow position={[0, 0.28, 0.55]}>
            <boxGeometry args={[0.2, 0.1, 0.15]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
          </mesh>
          {/* Nose */}
          <mesh castShadow position={[0, 0.32, 0.62]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          {/* Tail */}
          <mesh
            castShadow
            position={[0, 0.15 + (otterPose?.tailLift ?? 0) * 0.08, -0.45]}
            rotation={[-Math.PI / 4 - (otterPose?.tailLift ?? 0) * 0.34, 0, 0]}
          >
            <coneGeometry args={[0.08, 0.4, 16]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh castShadow position={[-0.08, 0.38, 0.58]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#050505" />
          </mesh>
          <mesh castShadow position={[0.08, 0.38, 0.58]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#050505" />
          </mesh>
          <mesh castShadow position={[-0.16, 0.44, 0.34]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={otterPose?.accent ?? color} roughness={0.55} />
          </mesh>
          <mesh castShadow position={[0.16, 0.44, 0.34]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={otterPose?.accent ?? color} roughness={0.55} />
          </mesh>
          {/* Tiny legs */}
          <mesh castShadow position={[-0.15, 0.1, 0.2]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh castShadow position={[0.15, 0.1, 0.2]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh castShadow position={[-0.15, 0.1, -0.2]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh castShadow position={[0.15, 0.1, -0.2]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function OtterScene({ state }: OtterSceneProps) {
  const otterPose = getOtterPoseCue(state);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 8.5, 7], fov: 48 }}
      style={{ width: "100%", height: "100%" }}
      data-testid="otterly-chaotic-canvas"
      gl={browserTestCanvasGlOptions}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={["#0b3550"]} />
      <fog attach="fog" args={["#0b3550", 12, 24]} />
      <CameraRig />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#d1fae5", "#123022", 0.8]} />
      <directionalLight position={[6, 10, 4]} intensity={2.1} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#236f3d" roughness={0.88} />
      </mesh>
      <ArenaDressing />
      <mesh
        position={[WATER_ZONE.x + WATER_ZONE.width / 2, 0.02, WATER_ZONE.y + WATER_ZONE.height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[WATER_ZONE.width, WATER_ZONE.height]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.82} roughness={0.28} />
      </mesh>
      <GoalMarker />
      <RescueCueMarker state={state} />
      <GoalPullLine state={state} />
      <SaladBall state={state} />
      <Character
        position={[state.otter.x, 0.1, state.otter.y]}
        color="#a8a29e"
        scale={1.1}
        otterPose={otterPose}
      />
      <PoseSignal
        accent={otterPose.accent}
        energy={otterPose.energy}
        position={[state.otter.x, 0.96, state.otter.y]}
      />
      {state.goats.map((goat) => {
        const goatPose = getGoatPoseCue(state, goat);

        return (
          <group key={goat.id}>
            <GoatIntentLine goat={goat} state={state} />
            <Character
              position={[goat.position.x, 0.1, goat.position.y]}
              color={goat.stunnedMs > 0 ? "#c084fc" : "#e2e8f0"}
              scale={goat.id === "elder" ? 1.15 : 1}
              isGoat={true}
              goatPose={goatPose}
            />
            <PoseSignal
              accent={goatPose.accent}
              energy={goatPose.energy}
              position={[goat.position.x, 1.06, goat.position.y]}
            />
            {goat.stunnedMs > 0 ? <StunStars goat={goat} /> : null}
          </group>
        );
      })}
      <BarkShockwave state={state} />
      {(
        [
          [1.4, -2.8],
          [2.5, -3.2],
          [-3.3, 2.4],
          [0.8, 2.2],
        ] as Array<[number, number]>
      ).map((rock, _index) => (
        <mesh
          key={`rock-${rock[0]}-${rock[1]}`}
          castShadow
          receiveShadow
          position={[rock[0], 0.28, rock[1]]}
        >
          <cylinderGeometry args={[0.35, 0.5, 0.55, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}
    </Canvas>
  );
}

function PoseSignal({
  accent,
  energy,
  position,
}: {
  accent: string;
  energy: number;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22 + energy * 0.16, 0.26 + energy * 0.16, 36]} />
        <meshBasicMaterial color={accent} transparent opacity={0.24 + energy * 0.36} />
      </mesh>
      <pointLight color={accent} intensity={1.8 + energy * 4} distance={2.8} />
    </group>
  );
}

function RescueCueMarker({ state }: { state: OtterlyState }) {
  const cue = getOtterlyRescueCue(state);
  const color =
    cue.threatBand === "danger" ? "#fb7185" : cue.threatBand === "pressure" ? "#facc15" : "#86efac";

  return (
    <group>
      <mesh position={[state.ball.x, 0.055, state.ball.y]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.76, 0.92, 56]} />
        <meshBasicMaterial color={color} transparent opacity={0.34} />
      </mesh>
      {cue.action === "bark" ? (
        <mesh position={[state.otter.x, 0.06, state.otter.y]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.18, 2.34, 72]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.3} />
        </mesh>
      ) : null}
      {cue.action === "recover" ? (
        <Line
          points={[
            [state.otter.x, 0.11, state.otter.y],
            [state.ball.x, 0.11, state.ball.y],
          ]}
          color="#38bdf8"
          lineWidth={2}
          transparent
          opacity={0.42}
          dashed
          dashScale={0.8}
          gapSize={0.13}
        />
      ) : null}
    </group>
  );
}

function GoatIntentLine({ goat, state }: { goat: GoatState; state: OtterlyState }) {
  const intent = getGoatIntent(state, goat);
  const color =
    intent.state === "stunned" ? "#c084fc" : intent.state === "chewing" ? "#fb7185" : "#facc15";

  return (
    <Line
      points={[
        [goat.position.x, 0.08, goat.position.y],
        [state.ball.x, 0.08, state.ball.y],
      ]}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.16 + intent.alertLevel * 0.5}
      dashed={intent.state !== "chewing"}
      dashScale={0.7}
      gapSize={0.12}
    />
  );
}

function StunStars({ goat }: { goat: GoatState }) {
  return (
    <group position={[goat.position.x, 1.24, goat.position.y]}>
      {[0, 1, 2].map((index) => {
        const angle = (index / 3) * Math.PI * 2;
        return (
          <mesh
            key={`stun-${goat.id}-${index}`}
            position={[Math.cos(angle) * 0.42, 0.1 + index * 0.06, Math.sin(angle) * 0.42]}
            rotation={[0, angle, Math.PI / 4]}
          >
            <octahedronGeometry args={[0.11, 0]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.84} />
          </mesh>
        );
      })}
    </group>
  );
}

function BarkShockwave({ state }: { state: OtterlyState }) {
  const age = state.elapsedMs - state.lastBarkMs;
  if (!Number.isFinite(age) || age < 0 || age > 760) return null;

  const progress = age / 760;
  return (
    <mesh position={[state.otter.x, 0.12, state.otter.y]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.45 + progress * 2.6, 0.62 + progress * 2.6, 64]} />
      <meshBasicMaterial
        color={state.lastBarkStunned > 0 ? "#fde047" : "#38bdf8"}
        transparent
        opacity={(1 - progress) * 0.58}
      />
    </mesh>
  );
}

function GoalPullLine({ state }: { state: OtterlyState }) {
  return (
    <Line
      points={[
        [state.ball.x, 0.1, state.ball.y],
        [GOAL.x, 0.1, GOAL.y],
      ]}
      color="#fde047"
      lineWidth={2}
      transparent
      opacity={0.36}
      dashed
      dashScale={0.65}
      gapSize={0.16}
    />
  );
}

function CameraRig() {
  const { camera, size } = useThree();
  const isPortrait = size.height > size.width;

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    if (isPortrait) {
      camera.position.set(0, 12.8, 6.6);
      camera.fov = 60;
    } else {
      camera.position.set(0, 8.5, 7);
      camera.fov = 48;
    }
    camera.lookAt(0, 0.35, 0);
    camera.updateProjectionMatrix();
  }, [camera, isPortrait]);

  return null;
}

function ArenaDressing() {
  const fencePosts = [-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4];
  const meadowPatches: Array<[number, number, number, number, string]> = [
    [-3.4, 2.5, 1.8, 0.7, "#2f8f46"],
    [1.5, -2.9, 2.4, 0.75, "#1f7a3b"],
    [3.2, -0.9, 1.4, 0.55, "#3aa555"],
    [-0.7, 3.7, 2.2, 0.5, "#2b7a44"],
  ];
  const reeds: Array<[number, number]> = [
    [-3.7, -0.7],
    [-3.2, -2.2],
    [-0.4, -2.2],
    [4.3, 2.2],
    [3.2, 3.8],
  ];

  return (
    <group>
      {meadowPatches.map(([x, z, width, depth, color]) => (
        <mesh
          key={`meadow-patch-${x}-${z}`}
          position={[x, 0.018, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color={color} roughness={0.92} />
        </mesh>
      ))}
      {[
        [0, -5.85, 11.8, 0.42],
        [0, 5.85, 11.8, 0.42],
        [-5.85, 0, 0.42, 11.8],
        [5.85, 0, 0.42, 11.8],
      ].map(([x, z, width, depth]) => (
        <mesh key={`berm-${x}-${z}`} position={[x, 0.22, z]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.44, depth]} />
          <meshStandardMaterial color="#14532d" roughness={0.9} />
        </mesh>
      ))}
      {fencePosts.map((x) => (
        <group key={`fence-x-${x}`}>
          <mesh position={[x, 0.32, -5.2]} castShadow>
            <boxGeometry args={[0.16, 0.64, 0.16]} />
            <meshStandardMaterial color="#6b4f30" roughness={0.74} />
          </mesh>
          <mesh position={[x, 0.32, 5.2]} castShadow>
            <boxGeometry args={[0.16, 0.64, 0.16]} />
            <meshStandardMaterial color="#6b4f30" roughness={0.74} />
          </mesh>
        </group>
      ))}
      {[-5.2, 5.2].map((z) => (
        <mesh key={`rail-${z}`} position={[0, 0.62, z]} castShadow>
          <boxGeometry args={[11.2, 0.12, 0.12]} />
          <meshStandardMaterial color="#8b6a3f" roughness={0.72} />
        </mesh>
      ))}
      <mesh
        position={[
          WATER_ZONE.x + WATER_ZONE.width / 2,
          0.035,
          WATER_ZONE.y + WATER_ZONE.height / 2,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.76, 1.94, 48]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.34} />
      </mesh>
      {reeds.map(([x, z]) => (
        <group key={`reed-${x}-${z}`} position={[x, 0, z]}>
          {[0, 0.12, -0.12].map((offset) => (
            <mesh
              key={`reed-blade-${offset}`}
              position={[offset, 0.36, 0]}
              rotation={[0.2, 0, offset]}
            >
              <coneGeometry args={[0.035, 0.72, 5]} />
              <meshStandardMaterial color="#84cc16" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[GOAL.x, 0.03, GOAL.y]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.55, 64]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.68} />
      </mesh>
      {[
        [-4.6, 4.2, 0.7],
        [4.8, -3.6, 0.55],
        [4.7, 4.4, 0.62],
      ].map(([x, z, radius]) => (
        <group key={`shrub-${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, radius, 0]} castShadow>
            <sphereGeometry args={[radius, 12, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.9} />
          </mesh>
          <mesh position={[0, radius * 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, radius, 8]} />
            <meshStandardMaterial color="#6b4423" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GoalMarker() {
  return (
    <group position={[GOAL.x, 0.08, GOAL.y]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.18, 1.35, 0.22, 48]} />
        <meshStandardMaterial color="#b7791f" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.72, 48]} />
        <meshBasicMaterial color="#7c2d12" transparent opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.82, 1.08, 48]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.48} />
      </mesh>
    </group>
  );
}

function SaladBall({ state }: { state: OtterlyState }) {
  const radius = 0.42 + state.ballHealth / 350;
  const damageRatio = 1 - state.ballHealth / 100;
  return (
    <group position={[state.ball.x, 0.4, state.ball.y]}>
      {state.rallyMs > 0 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.25, radius + 0.42, 48]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.58} />
        </mesh>
      ) : null}
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={damageRatio > 0.45 ? "#f97316" : "#45c657"}
          emissive={damageRatio > 0.45 ? "#7f1d1d" : "#14532d"}
          emissiveIntensity={damageRatio * 0.32}
          roughness={0.62}
        />
      </mesh>
      {damageRatio > 0.2 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.12, radius + 0.22, 48]} />
          <meshBasicMaterial color="#fb7185" transparent opacity={damageRatio * 0.5} />
        </mesh>
      ) : null}
      {[
        [0.2, 0.2, 0.22],
        [-0.24, 0.16, -0.18],
        [0.02, 0.32, -0.24],
      ].map(([x, y, z]) => (
        <mesh key={`leaf-${x}-${z}`} position={[x, y, z]} rotation={[0.3, 0.6, 0.2]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.22]} />
          <meshStandardMaterial color="#86efac" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
