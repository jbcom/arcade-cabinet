import { browserTestCanvasGlOptions } from "@app/shared";
import type { MegaTrackState, Obstacle } from "@logic/games/mega-track/engine/types";
import { CONFIG } from "@logic/games/mega-track/engine/types";
import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

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
      ctx.fillStyle = "#18212d";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = "#111827";
      ctx.fillRect(48, 0, 928, 1024);
      ctx.fillStyle = "#06b6d4";
      ctx.fillRect(0, 0, 34, 1024);
      ctx.fillRect(990, 0, 34, 1024);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(58, 0, 12, 1024);
      ctx.fillRect(954, 0, 12, 1024);

      const laneW = (1024 - 116) / 3;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (let y = 0; y < 1024; y += 128) {
        ctx.fillRect(58 + laneW - 7, y, 14, 72);
        ctx.fillRect(58 + laneW * 2 - 7, y + 48, 14, 72);
      }

      ctx.fillStyle = "rgba(148,163,184,0.18)";
      for (let y = 0; y < 1024; y += 64) {
        ctx.fillRect(90, y, 844, 2);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 90);
    tex.anisotropy = 8;
    return tex;
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      texture.offset.y = -((distance * 0.012) % 1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -850]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[112, 2400]} />
      <meshStandardMaterial map={texture} roughness={0.42} metalness={0.02} />
    </mesh>
  );
}

function Car({ lane, overdrive }: { lane: number; overdrive: boolean }) {
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
    <group ref={meshRef} position={[0, 2.2, 10]}>
      <mesh castShadow>
        <boxGeometry args={[12, 3.4, 22]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.34} metalness={0.12} />
      </mesh>
      <mesh position={[0, 2.35, -4]} castShadow>
        <boxGeometry args={[8.5, 3.8, 8.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.22} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, -14]} rotation={[Math.PI / 2, 0, Math.PI / 4]} castShadow>
        <coneGeometry args={[6.4, 9, 4]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.28} metalness={0.18} />
      </mesh>
      {[-5.9, 5.9].map((x) =>
        [-7, 7].map((z) => (
          <mesh
            key={`wheel-${x}-${z}`}
            position={[x, -1.4, z]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[1.45, 1.45, 1.3, 16]} />
            <meshStandardMaterial color="#020617" roughness={0.6} />
          </mesh>
        ))
      )}
      {[-4, 4].map((x) => (
        <mesh key={`headlight-${x}`} position={[x, 0.5, -12.6]}>
          <boxGeometry args={[2, 0.3, 0.4]} />
          <meshBasicMaterial color="#67e8f9" />
        </mesh>
      ))}
      {overdrive
        ? [-3.6, 3.6].map((x) => (
            <mesh
              key={`overdrive-flame-${x}`}
              position={[x, -0.1, 15.2]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <coneGeometry args={[1.2, 7.5, 16]} />
              <meshBasicMaterial color="#facc15" transparent opacity={0.72} />
            </mesh>
          ))
        : null}
    </group>
  );
}

function Obstacles({ obstacles, distance }: { obstacles: Obstacle[]; distance: number }) {
  return (
    <>
      {obstacles
        .map((obs) => ({ obs, z: -(obs.z - distance) }))
        .filter(({ z }) => z > -1250 && z < 120)
        .map(({ obs, z }) => (
          <ObstacleMesh key={obs.id} obstacle={obs} z={z} />
        ))}
    </>
  );
}

function ObstacleMesh({ obstacle, z }: { obstacle: Obstacle; z: number }) {
  if (obstacle.type === "barrier") {
    return (
      <group position={[obstacle.x, 3.2, z]}>
        <mesh castShadow>
          <boxGeometry args={[16, 5.2, 5]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} />
        </mesh>
        {[-4, 0, 4].map((x) => (
          <mesh key={`stripe-${obstacle.id}-${x}`} position={[x, 0.15, -2.65]}>
            <boxGeometry args={[2.1, 5.4, 0.18]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        ))}
      </group>
    );
  }

  if (obstacle.type === "pace-car") {
    return (
      <group position={[obstacle.x, 2.5, z]}>
        <mesh castShadow>
          <boxGeometry args={[11, 3.2, 20]} />
          <meshStandardMaterial color="#f97316" roughness={0.34} metalness={0.12} />
        </mesh>
        <mesh position={[0, 2.2, -3]} castShadow>
          <boxGeometry args={[7, 3, 7]} />
          <meshStandardMaterial color="#1f2937" roughness={0.28} />
        </mesh>
        <mesh position={[0, 4.05, 8]}>
          <boxGeometry args={[10, 0.35, 1.4]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[obstacle.x, 2.2, z]}>
      <mesh castShadow>
        <coneGeometry args={[4.5, 8.5, 16]} />
        <meshStandardMaterial color="#fb923c" roughness={0.52} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <torusGeometry args={[2.7, 0.28, 8, 24]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

function TrackDressing({ distance }: { distance: number }) {
  const pulse = (distance * 0.02) % 1;
  const markerPositions = useMemo(() => Array.from({ length: 9 }, (_, index) => index), []);

  return (
    <group>
      {[-58, 58].map((x) => (
        <group key={`rail-${x}`}>
          <mesh position={[x, 1, -850]} receiveShadow>
            <boxGeometry args={[2.2, 2, 2380]} />
            <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.2} />
          </mesh>
          <mesh position={[x, 2.3, -850]}>
            <boxGeometry args={[1.1, 0.35, 2380]} />
            <meshBasicMaterial color={x < 0 ? "#22d3ee" : "#facc15"} />
          </mesh>
        </group>
      ))}
      {[-320, -700, -1080, -1460].map((z, index) => (
        <CheckpointGate key={`gate-${z}`} z={z + pulse * 16} index={index} />
      ))}
      {markerPositions.map((index) => {
        const z = -(((index * 210 + 90 + distance * 0.45) % 1890) + 80);
        return (
          <group key={`speed-marker-${index}`}>
            <mesh position={[-66, 0.7, z]}>
              <boxGeometry args={[5, 0.5, 20]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} />
            </mesh>
            <mesh position={[66, 0.7, z - 70]}>
              <boxGeometry args={[5, 0.5, 20]} />
              <meshBasicMaterial color="#fde047" transparent opacity={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function CheckpointGate({ z, index }: { z: number; index: number }) {
  const color = index % 2 === 0 ? "#22d3ee" : "#facc15";
  return (
    <group position={[0, 0, z]}>
      {[-48, 48].map((x) => (
        <mesh key={`gate-post-${z}-${x}`} position={[x, 11, 0]} castShadow>
          <boxGeometry args={[3, 22, 3]} />
          <meshStandardMaterial color="#1f2937" roughness={0.46} metalness={0.16} />
        </mesh>
      ))}
      <mesh position={[0, 22.5, 0]} castShadow>
        <boxGeometry args={[102, 3, 3]} />
        <meshStandardMaterial color="#273449" roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh position={[0, 24.4, -0.25]}>
        <boxGeometry args={[94, 0.6, 0.5]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const { camera, size } = useThree();
  const isPortrait = size.height > size.width;

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    if (isPortrait) {
      camera.position.set(0, 46, 94);
      camera.fov = 58;
    } else {
      camera.position.set(0, 34, 76);
      camera.fov = 52;
    }
    camera.lookAt(0, 3, -250);
    camera.updateProjectionMatrix();
  }, [camera, isPortrait]);

  return null;
}

export function TrackScene({ state }: TrackSceneProps) {
  return (
    <Canvas shadows gl={browserTestCanvasGlOptions} dpr={[1, 1.5]}>
      <color attach="background" args={["#bde7f1"]} />
      <PerspectiveCamera makeDefault position={[0, 34, 76]} fov={52} />
      <CameraRig />

      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#dff7ff", "#172033", 0.9]} />
      <directionalLight position={[45, 95, 35]} intensity={1.35} castShadow />

      <Track distance={state.distance} />
      <TrackDressing distance={state.distance} />
      <Car lane={state.currentLane} overdrive={state.overdriveMs > 0} />
      <Obstacles obstacles={state.obstacles} distance={state.distance} />

      <fog attach="fog" args={["#bde7f1", 360, 1280]} />
    </Canvas>
  );
}
