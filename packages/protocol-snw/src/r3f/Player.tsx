import { useFrame, useThree } from "@react-three/fiber";
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SNWTrait } from "../store/traits";
import { snwEntity } from "../store/world";

export function Player() {
  const { camera, size } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const position = useRef(new THREE.Vector3());
  const pointer = useRef(new THREE.Vector2());

  const movement = useRef({ w: false, a: false, s: false, d: false, dash: false });

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
        case "Space":
          movement.current.dash = true;
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

    const handlePointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useFrame((_state, _delta) => {
    if (!rbRef.current) return;
    const state = snwEntity.get(SNWTrait);
    if (state?.phase !== "playing") return;

    const currentTrans = rbRef.current.translation();
    position.current.set(currentTrans.x, currentTrans.y, currentTrans.z);

    const speed = 15;
    const dir = new THREE.Vector3(
      (movement.current.d ? 1 : 0) - (movement.current.a ? 1 : 0),
      0,
      (movement.current.s ? 1 : 0) - (movement.current.w ? 1 : 0)
    ).normalize();

    const currentVel = rbRef.current.linvel();
    const finalSpeed = movement.current.dash ? speed * 3 : speed;

    rbRef.current.setLinvel(
      {
        x: dir.x * finalSpeed,
        y: currentVel.y,
        z: dir.z * finalSpeed,
      },
      true
    );

    if (movement.current.dash) movement.current.dash = false;

    const isPortrait = size.height > size.width;
    const cameraHeight = isPortrait ? 30 : 40;
    const cameraOffset = isPortrait ? 13 : 20;

    camera.position.lerp(
      new THREE.Vector3(position.current.x, cameraHeight, position.current.z + cameraOffset),
      0.16
    );
    camera.lookAt(position.current);

    // Mesh rotation towards mouse
    const _target = new THREE.Vector3(
      pointer.current.x * 20 + position.current.x,
      position.current.y,
      -pointer.current.y * 20 + position.current.z
    );
    // Standard R3F mesh ref rotation would be cleaner, but for now we look at the virtual point
  });

  return (
    <RigidBody
      ref={rbRef}
      mass={1}
      position={[0, 2, 0]}
      enabledRotations={[false, false, false]}
      colliders="cuboid"
    >
      <mesh>
        <boxGeometry args={[1, 1, 2]} />
        <meshStandardMaterial color="#00ffcc" />
      </mesh>
    </RigidBody>
  );
}
