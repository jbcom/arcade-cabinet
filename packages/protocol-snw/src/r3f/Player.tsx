import { useFrame, useThree } from "@react-three/fiber";
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  advanceSNWState,
  calculatePlayerVelocity,
  normalizeSNWControls,
} from "../engine/protocolSimulation";
import type { SNWControls } from "../engine/types";
import { SNWTrait } from "../store/traits";
import { snwEntity } from "../store/world";

export function Player() {
  const { camera, size } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const rigRef = useRef<THREE.Group>(null);
  const position = useRef(new THREE.Vector3());
  const pointer = useRef(new THREE.Vector2());
  const keyboard = useRef({ w: false, a: false, s: false, d: false, dash: false, fire: false });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKey(event.code, true);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      setKey(event.code, false);
    };
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-snw-control]")) {
        return;
      }
      keyboard.current.fire = true;
    };
    const handlePointerUp = () => {
      keyboard.current.fire = false;
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
        case "Space":
          keyboard.current.dash = active;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  useFrame((_state, delta) => {
    if (!rbRef.current) {
      return;
    }
    const state = snwEntity.get(SNWTrait);
    if (state?.phase !== "playing") {
      return;
    }

    const currentTrans = rbRef.current.translation();
    position.current.set(currentTrans.x, currentTrans.y, currentTrans.z);
    const controls = mergeControls(state.controls, keyboard.current);
    const velocity = calculatePlayerVelocity(controls, state.dashCooldownMs === 0);
    const currentVel = rbRef.current.linvel();

    rbRef.current.setLinvel({ x: velocity.x, y: currentVel.y, z: velocity.z }, true);

    if (rigRef.current) {
      const target = new THREE.Vector3(
        pointer.current.x * 20 + position.current.x,
        position.current.y,
        -pointer.current.y * 20 + position.current.z
      );
      rigRef.current.lookAt(target);
    }

    const isPortrait = size.height > size.width;
    const cameraHeight = isPortrait ? 48 : 39;
    const cameraOffset = isPortrait ? 18 : 28;
    camera.position.lerp(
      new THREE.Vector3(position.current.x, cameraHeight, position.current.z + cameraOffset),
      0.13
    );
    camera.lookAt(position.current.x, position.current.y - 0.5, position.current.z);

    snwEntity.set(
      SNWTrait,
      advanceSNWState(state, delta * 1000, {
        player: { x: currentTrans.x, y: currentTrans.y, z: currentTrans.z },
        controls,
      })
    );
  });

  return (
    <RigidBody
      ref={rbRef}
      mass={1.2}
      position={[0, 1.3, 0]}
      enabledRotations={[false, false, false]}
      colliders="cuboid"
      linearDamping={1.1}
    >
      <group ref={rigRef}>
        <mesh castShadow>
          <octahedronGeometry args={[0.82, 0]} />
          <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.78, -0.08]} castShadow>
          <boxGeometry args={[0.34, 0.16, 1.8]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#38bdf8" emissiveIntensity={0.44} />
        </mesh>
        <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.06, 1.18, 40]} />
          <meshBasicMaterial color="#2dd4bf" transparent opacity={0.54} />
        </mesh>
        <pointLight color="#2dd4bf" intensity={1.2} distance={14} />
      </group>
    </RigidBody>
  );
}

function mergeControls(
  stateControls: SNWControls,
  keyboard: { w: boolean; a: boolean; s: boolean; d: boolean; dash: boolean; fire: boolean }
) {
  return normalizeSNWControls({
    x: (keyboard.d ? 1 : 0) - (keyboard.a ? 1 : 0) || stateControls.x,
    z: (keyboard.s ? 1 : 0) - (keyboard.w ? 1 : 0) || stateControls.z,
    dash: keyboard.dash || stateControls.dash,
    fire: keyboard.fire || stateControls.fire,
  });
}
