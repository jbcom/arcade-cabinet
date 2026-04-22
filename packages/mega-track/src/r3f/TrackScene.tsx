import { browserTestCanvasGlOptions } from "@arcade-cabinet/shared";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MegaTrackState, Obstacle } from "../engine/types";
import { CONFIG } from "../engine/types";

interface TrackSceneProps {
  state: MegaTrackState;
}

function Track({ distance }: { distance: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ff6600";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = "#0044ff";
      ctx.fillRect(0, 0, 64, 1024);
      ctx.fillRect(1024 - 64, 0, 64, 1024);

      const laneW = (1024 - 128) / 3;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (let y = 0; y < 1024; y += 128) {
        ctx.fillRect(64 + laneW - 8, y, 16, 64);
        ctx.fillRect(64 + laneW * 2 - 8, y, 16, 64);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 100);
    return tex;
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      texture.offset.y = -(distance % 1024) / 1024;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 2000]} />
      <meshStandardMaterial map={texture} roughness={0.3} />
    </mesh>
  );
}

function Car({ lane }: { lane: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const targetX = lane * CONFIG.LANE_WIDTH;

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        targetX,
        5 * delta
      );
    }
  });

  return (
    <group ref={meshRef} position={[0, 1.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[12, 6, 25]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 2, -8]} castShadow>
        <boxGeometry args={[10, 4, 10]} />
        <meshStandardMaterial color="#333" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Obstacles({ obstacles, distance }: { obstacles: Obstacle[]; distance: number }) {
  return (
    <>
      {obstacles.map((obs) => (
        <mesh key={obs.id} position={[obs.x, 2, -(obs.z - distance)]}>
          <boxGeometry args={[8, 8, 8]} />
          <meshStandardMaterial color={obs.type === "cone" ? "#f97316" : "#ef4444"} />
        </mesh>
      ))}
    </>
  );
}

export function TrackScene({ state }: TrackSceneProps) {
  return (
    <Canvas shadows gl={browserTestCanvasGlOptions}>
      <color attach="background" args={["#87ceeb"]} />
      <PerspectiveCamera makeDefault position={[0, 40, 60]} fov={75} />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />

      <Track distance={state.distance} />
      <Car lane={state.currentLane} />
      <Obstacles obstacles={state.obstacles} distance={state.distance} />

      <fogExp2 attach="fog" args={["#87ceeb", 0.002]} />
    </Canvas>
  );
}
