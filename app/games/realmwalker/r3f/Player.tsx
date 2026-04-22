import {
  advanceRealmState,
  calculateMovementVelocity,
  normalizeMovement,
} from "@logic/games/realmwalker/engine/realmSimulation";
import { CONFIG } from "@logic/games/realmwalker/engine/types";
import { MovementTrait, RealmTrait } from "@logic/games/realmwalker/store/traits";
import { realmEntity } from "@logic/games/realmwalker/store/world";
import { useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Player() {
  const { camera, size } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const rigRef = useRef<THREE.Group>(null);
  const position = useRef(new THREE.Vector3());
  const keyboard = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKey(event.code, true);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      setKey(event.code, false);
    };
    const setKey = (code: string, active: boolean) => {
      switch (code) {
        case "KeyW":
        case "ArrowUp":
          keyboard.current.w = active;
          break;
        case "KeyS":
        case "ArrowDown":
          keyboard.current.s = active;
          break;
        case "KeyA":
        case "ArrowLeft":
          keyboard.current.a = active;
          break;
        case "KeyD":
        case "ArrowRight":
          keyboard.current.d = active;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_state, _delta) => {
    if (!rbRef.current) {
      return;
    }

    const currentTrans = rbRef.current.translation();
    position.current.set(currentTrans.x, currentTrans.y, currentTrans.z);

    const touchMovement = realmEntity.get(MovementTrait) ?? { x: 0, z: 0 };
    const movement = normalizeMovement({
      x: touchMovement.x + (keyboard.current.d ? 1 : 0) - (keyboard.current.a ? 1 : 0),
      z: touchMovement.z + (keyboard.current.s ? 1 : 0) - (keyboard.current.w ? 1 : 0),
    });
    const velocity = calculateMovementVelocity(movement);
    const currentVel = rbRef.current.linvel();
    rbRef.current.setLinvel({ x: velocity.x, y: currentVel.y, z: velocity.z }, true);

    if (rigRef.current && (movement.x !== 0 || movement.z !== 0)) {
      rigRef.current.rotation.y = Math.atan2(velocity.x, velocity.z);
    }

    const isPortrait = size.height > size.width;
    const cameraHeight = isPortrait ? 13 : 11;
    const cameraOffset = isPortrait ? 25 : 21;
    camera.position.lerp(
      new THREE.Vector3(position.current.x, cameraHeight, position.current.z + cameraOffset),
      0.11
    );
    camera.lookAt(position.current.x, position.current.y + 0.7, position.current.z);

    const state = realmEntity.get(RealmTrait);
    if (state) {
      realmEntity.set(
        RealmTrait,
        advanceRealmState(state, {
          player: { x: currentTrans.x, y: currentTrans.y, z: currentTrans.z },
          movement,
        })
      );
    }
  });

  return (
    <RigidBody
      ref={rbRef}
      mass={CONFIG.PLAYER_MASS}
      position={[0, 5, 0]}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={1.4}
    >
      <CuboidCollider args={[0.62, 1.35, 0.52]} position={[0, 0.55, 0]} />
      <group ref={rigRef}>
        <TravelerModel />
      </group>
    </RigidBody>
  );
}

function TravelerModel() {
  return (
    <group>
      <mesh castShadow position={[0, 0.55, 0]}>
        <coneGeometry args={[0.72, 1.55, 5]} />
        <meshStandardMaterial color="#2e1065" emissive="#1e1b4b" emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[0, 1.42, -0.02]}>
        <coneGeometry args={[0.55, 0.78, 5]} />
        <meshStandardMaterial color="#6d28d9" emissive="#4c1d95" emissiveIntensity={0.45} />
      </mesh>
      <mesh castShadow position={[0, 1.26, 0.18]}>
        <sphereGeometry args={[0.3, 18, 12]} />
        <meshStandardMaterial color="#ddd6fe" emissive="#a78bfa" emissiveIntensity={0.28} />
      </mesh>
      <mesh castShadow position={[-0.34, 0.54, 0.08]} rotation={[0.12, 0, 0.28]}>
        <boxGeometry args={[0.18, 0.92, 0.2]} />
        <meshStandardMaterial color="#4c1d95" emissive="#312e81" emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[0.34, 0.54, 0.08]} rotation={[0.12, 0, -0.28]}>
        <boxGeometry args={[0.18, 0.92, 0.2]} />
        <meshStandardMaterial color="#4c1d95" emissive="#312e81" emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[-0.22, -0.38, 0.05]} rotation={[0.16, 0, 0.08]}>
        <boxGeometry args={[0.22, 0.98, 0.22]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0.22, -0.38, 0.05]} rotation={[0.16, 0, -0.08]}>
        <boxGeometry args={[0.22, 0.98, 0.22]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <mesh position={[0.78, 0.38, 0.6]} rotation={[Math.PI / 2, 0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.1, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.18} />
      </mesh>
      <mesh position={[0.78, 0.38, 1.73]} rotation={[Math.PI / 2, 0.15, 0]}>
        <coneGeometry args={[0.17, 0.4, 4]} />
        <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={0.78} />
      </mesh>
      <mesh position={[0.78, 0.38, 0.2]} rotation={[Math.PI / 2, 0.15, 0]}>
        <torusGeometry args={[0.22, 0.025, 8, 24]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.84, 1.06, 44]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.36} />
      </mesh>
      <pointLight position={[0.7, 1.2, 0.4]} color="#c084fc" intensity={1.4} distance={7} />
    </group>
  );
}
