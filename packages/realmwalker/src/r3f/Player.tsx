import { useFrame, useThree } from "@react-three/fiber";
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CONFIG } from "../engine/types";
import { MovementTrait, RealmTrait } from "../store/traits";
import { realmEntity } from "../store/world";

export function Player() {
  const { camera } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const position = useRef(new THREE.Vector3());
  const movement = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          movement.current.w = true;
          break;
        case "KeyS":
          movement.current.s = true;
          break;
        case "KeyA":
          movement.current.a = true;
          break;
        case "KeyD":
          movement.current.d = true;
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          movement.current.w = false;
          break;
        case "KeyS":
          movement.current.s = false;
          break;
        case "KeyA":
          movement.current.a = false;
          break;
        case "KeyD":
          movement.current.d = false;
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
    if (!rbRef.current) return;

    const currentTrans = rbRef.current.translation();
    position.current.set(currentTrans.x, currentTrans.y, currentTrans.z);

    const speed = CONFIG.MOVE_SPEED;
    const touchMovement = realmEntity.get(MovementTrait) ?? { x: 0, z: 0 };
    const direction = new THREE.Vector3(
      touchMovement.x + (movement.current.d ? 1 : 0) - (movement.current.a ? 1 : 0),
      0,
      touchMovement.z + (movement.current.s ? 1 : 0) - (movement.current.w ? 1 : 0)
    );

    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(speed);
    }

    const currentVel = rbRef.current.linvel();
    rbRef.current.setLinvel({ x: direction.x, y: currentVel.y, z: direction.z }, true);

    // Camera follow (Third Person)
    const cameraOffset = new THREE.Vector3(0, 10, 20);
    camera.position.lerp(position.current.clone().add(cameraOffset), 0.1);
    camera.lookAt(position.current);

    // Update state score
    const pState = realmEntity.get(RealmTrait);
    if (pState) {
      realmEntity.set(RealmTrait, { ...pState, score: Math.floor(position.current.length()) });
    }
  });

  return (
    <RigidBody
      ref={rbRef}
      mass={CONFIG.PLAYER_MASS}
      position={[0, 5, 0]}
      colliders="ball"
      enabledRotations={[false, false, false]}
    >
      <group>
        <mesh castShadow position={[0, 0.25, 0]}>
          <capsuleGeometry args={[0.48, 1.15, 6, 16]} />
          <meshStandardMaterial color="#7c3aed" emissive="#312e81" emissiveIntensity={0.45} />
        </mesh>
        <mesh castShadow position={[0, 1.15, -0.04]}>
          <sphereGeometry args={[0.38, 20, 12]} />
          <meshStandardMaterial color="#c4b5fd" emissive="#7c3aed" emissiveIntensity={0.35} />
        </mesh>
        <mesh castShadow position={[0, 0.55, -0.38]} rotation={[0.35, 0, 0]}>
          <coneGeometry args={[0.62, 1.6, 5]} />
          <meshStandardMaterial color="#1e1b4b" emissive="#0f172a" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0.34, 0.92, -0.28]} rotation={[0.2, 0.15, -0.45]}>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color="#ddd6fe" emissive="#a78bfa" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.78, 0.2, 0.55]} rotation={[Math.PI / 2, 0.15, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2.1, 10]} />
          <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.18} />
        </mesh>
        <mesh position={[0.78, 0.2, 1.68]} rotation={[Math.PI / 2, 0.15, 0]}>
          <coneGeometry args={[0.16, 0.38, 4]} />
          <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={0.7} />
        </mesh>
        <pointLight position={[0.7, 1.2, 0.4]} color="#c084fc" intensity={1.4} distance={7} />
      </group>
    </RigidBody>
  );
}
