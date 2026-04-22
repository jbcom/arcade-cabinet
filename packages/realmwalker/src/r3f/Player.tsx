import { useFrame, useThree } from "@react-three/fiber";
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CONFIG } from "../engine/types";
import { RealmTrait } from "../store/traits";
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
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(
      0,
      0,
      (movement.current.s ? 1 : 0) - (movement.current.w ? 1 : 0)
    );
    const sideVector = new THREE.Vector3(
      (movement.current.a ? 1 : 0) - (movement.current.d ? 1 : 0),
      0,
      0
    );

    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed);

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
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#4c1d95" emissiveIntensity={0.5} />
      </mesh>
      {/* "Weapon" mesh */}
      <mesh position={[0.7, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#ddd" metalness={1} roughness={0.2} />
      </mesh>
    </RigidBody>
  );
}
