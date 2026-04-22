import { useFrame, useThree } from "@react-three/fiber";
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Player({ onPositionChange }: { onPositionChange: (pos: THREE.Vector3) => void }) {
  const { camera } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const position = useRef(new THREE.Vector3(0, 2, 0));

  const movement = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    // Initial camera setup
    camera.position.set(0, 2, 0);
    camera.lookAt(0, -5, -10);
  }, [camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          movement.current.forward = true;
          break;
        case "KeyS":
          movement.current.backward = true;
          break;
        case "KeyA":
          movement.current.left = true;
          break;
        case "KeyD":
          movement.current.right = true;
          break;
        case "Space":
          movement.current.jump = true;
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          movement.current.forward = false;
          break;
        case "KeyS":
          movement.current.backward = false;
          break;
        case "KeyA":
          movement.current.left = false;
          break;
        case "KeyD":
          movement.current.right = false;
          break;
        case "Space":
          movement.current.jump = false;
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
    onPositionChange(position.current.clone());

    const speed = 5;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(
      0,
      0,
      (movement.current.backward ? 1 : 0) - (movement.current.forward ? 1 : 0)
    );
    const sideVector = new THREE.Vector3(
      (movement.current.left ? 1 : 0) - (movement.current.right ? 1 : 0),
      0,
      0
    );

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.quaternion);

    const currentVel = rbRef.current.linvel();
    rbRef.current.setLinvel({ x: direction.x, y: currentVel.y, z: direction.z }, true);

    if (movement.current.jump && Math.abs(currentVel.y) < 0.05) {
      rbRef.current.setLinvel({ x: currentVel.x, y: 5, z: currentVel.z }, true);
      movement.current.jump = false;
    }

    camera.position.copy(position.current);
    camera.position.y += 0.6; // Eye level
  });

  return (
    <RigidBody
      ref={rbRef}
      mass={1}
      position={[0, 2, 0]}
      enabledRotations={[false, false, false]}
      colliders="ball"
    >
      <mesh visible={false}>
        <sphereGeometry args={[0.4]} />
        <meshBasicMaterial />
      </mesh>
    </RigidBody>
  );
}
