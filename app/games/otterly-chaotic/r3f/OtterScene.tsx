import { browserTestCanvasGlOptions } from "@app/shared";
import { GOAL, WATER_ZONE } from "@logic/games/otterly-chaotic/engine/simulation";
import type { OtterlyState } from "@logic/games/otterly-chaotic/engine/types";
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
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  isGoat?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      {isGoat ? (
        // Detailed Goat Model
        <group>
          {/* Body */}
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.6]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.6, 0.35]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Horns */}
          <mesh castShadow position={[-0.1, 0.8, 0.3]} rotation={[-0.2, 0, 0]}>
            <coneGeometry args={[0.05, 0.3, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh castShadow position={[0.1, 0.8, 0.3]} rotation={[-0.2, 0, 0]}>
            <coneGeometry args={[0.05, 0.3, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Legs */}
          <mesh castShadow position={[-0.15, 0.2, 0.2]}>
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
          <mesh castShadow position={[0, 0.15, -0.45]} rotation={[-Math.PI / 4, 0, 0]}>
            <coneGeometry args={[0.08, 0.4, 16]} />
            <meshStandardMaterial color={color} roughness={0.7} />
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
        <meshStandardMaterial color="#1f6b3a" roughness={0.88} />
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
      <SaladBall state={state} />
      <Character position={[state.otter.x, 0.1, state.otter.y]} color="#a8a29e" scale={1.1} />
      {state.goats.map((goat) => (
        <group key={goat.id}>
          <Character
            position={[goat.position.x, 0.1, goat.position.y]}
            color={goat.stunnedMs > 0 ? "#c084fc" : "#e2e8f0"}
            scale={goat.id === "elder" ? 1.15 : 1}
            isGoat={true}
          />
        </group>
      ))}
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

function CameraRig() {
  const { camera, size } = useThree();
  const isPortrait = size.height > size.width;

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    if (isPortrait) {
      camera.position.set(0, 13.2, 10.8);
      camera.fov = 62;
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
  const reeds: Array<[number, number]> = [
    [-3.7, -0.7],
    [-3.2, -2.2],
    [-0.4, -2.2],
    [4.3, 2.2],
    [3.2, 3.8],
  ];

  return (
    <group>
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
    </group>
  );
}

function GoalMarker() {
  return (
    <group position={[GOAL.x, 0.08, GOAL.y]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.15, 48]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.72, 48]} />
        <meshBasicMaterial color="#7c2d12" transparent opacity={0.72} />
      </mesh>
    </group>
  );
}

function SaladBall({ state }: { state: OtterlyState }) {
  const radius = 0.42 + state.ballHealth / 350;
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
        <meshStandardMaterial color="#45c657" roughness={0.62} />
      </mesh>
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
