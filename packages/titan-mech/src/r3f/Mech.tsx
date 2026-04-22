import { useFrame, useThree } from "@react-three/fiber";
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CONFIG } from "../engine/types";
import { TitanTrait } from "../store/traits";
import { titanEntity } from "../store/world";

export function Mech() {
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

  useFrame((_state, delta) => {
    if (!rbRef.current) return;

    const currentTrans = rbRef.current.translation();
    position.current.set(currentTrans.x, currentTrans.y, currentTrans.z);

    const rotation = rbRef.current.rotation();
    const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);

    // Movement
    if (movement.current.w) {
      rbRef.current.applyImpulse(forward.multiplyScalar(CONFIG.MOVE_SPEED * delta), true);
    }
    if (movement.current.s) {
      rbRef.current.applyImpulse(forward.multiplyScalar(-CONFIG.MOVE_SPEED * 0.5 * delta), true);
    }

    // Turning
    if (movement.current.a) {
      rbRef.current.applyTorqueImpulse({ x: 0, y: CONFIG.TURN_SPEED * delta, z: 0 }, true);
    }
    if (movement.current.d) {
      rbRef.current.applyTorqueImpulse({ x: 0, y: -CONFIG.TURN_SPEED * delta, z: 0 }, true);
    }

    // Camera follow
    const cameraOffset = new THREE.Vector3(0, 15, -30).applyQuaternion(quat);
    camera.position.lerp(position.current.clone().add(cameraOffset), 0.1);
    camera.lookAt(position.current.clone().add(new THREE.Vector3(0, 5, 0)));

    // Update state
    const pState = titanEntity.get(TitanTrait);
    if (pState) {
      titanEntity.set(TitanTrait, { ...pState, score: Math.floor(position.current.length()) });
    }
  });

  return (
    <RigidBody
      ref={rbRef}
      mass={CONFIG.PLAYER_MASS}
      position={[0, 5, 0]}
      colliders="cuboid"
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <group>
        {/* Main Body */}
        <mesh castShadow>
          <boxGeometry args={[4, 5, 4]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        {/* Cockpit */}
        <mesh position={[0, 2, 1.5]} castShadow>
          <boxGeometry args={[2, 1.5, 2]} />
          <meshStandardMaterial color="#00ffff" transparent opacity={0.6} />
        </mesh>
        {/* Legs */}
        <mesh position={[-1.5, -2.5, 0]} castShadow>
          <boxGeometry args={[1, 3, 1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[1.5, -2.5, 0]} castShadow>
          <boxGeometry args={[1, 3, 1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
    </RigidBody>
  );
}
