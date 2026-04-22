import { browserTestCanvasGlOptions } from "@arcade-cabinet/shared";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { GOAL, WATER_ZONE } from "../engine/simulation";
import type { OtterlyState } from "../engine/types";

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
    >
      <color attach="background" args={["#082f49"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 10, 4]} intensity={2.1} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#14532d" />
      </mesh>
      <mesh
        position={[WATER_ZONE.x + WATER_ZONE.width / 2, 0.02, WATER_ZONE.y + WATER_ZONE.height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[WATER_ZONE.width, WATER_ZONE.height]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.78} />
      </mesh>
      <mesh position={[GOAL.x, 0.08, GOAL.y]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.15, 48]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <mesh castShadow position={[state.ball.x, 0.4, state.ball.y]}>
        <sphereGeometry args={[0.42 + state.ballHealth / 350, 32, 32]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
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
      <OrbitControls
        enablePan={false}
        maxPolarAngle={1.2}
        minDistance={7}
        maxDistance={11}
        target={[0, 0.5, 0]}
      />
    </Canvas>
  );
}
