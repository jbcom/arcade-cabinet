import { useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  advanceTitanSystems,
  calculateDriveForces,
  normalizeTitanControls,
} from "../engine/titanSimulation";
import type { TitanControls } from "../engine/types";
import { CONFIG } from "../engine/types";
import { TitanTrait } from "../store/traits";
import { titanEntity } from "../store/world";

export function Mech() {
  const { camera, size } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const position = useRef(new THREE.Vector3());
  const movement = useRef({ w: false, a: false, s: false, d: false, fire: false, brace: false });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeyboardControl(event.code, true);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      setKeyboardControl(event.code, false);
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-titan-control]")) {
        return;
      }
      if (event.button === 0) {
        movement.current.fire = true;
      }
    };
    const handleMouseUp = () => {
      movement.current.fire = false;
    };
    const setKeyboardControl = (code: string, active: boolean) => {
      switch (code) {
        case "KeyW":
        case "ArrowUp":
          movement.current.w = active;
          break;
        case "KeyS":
        case "ArrowDown":
          movement.current.s = active;
          break;
        case "KeyA":
        case "ArrowLeft":
          movement.current.a = active;
          break;
        case "KeyD":
        case "ArrowRight":
          movement.current.d = active;
          break;
        case "Space":
          movement.current.fire = active;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          movement.current.brace = active;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useFrame((_state, delta) => {
    if (!rbRef.current) {
      return;
    }

    const currentTrans = rbRef.current.translation();
    position.current.set(currentTrans.x, currentTrans.y, currentTrans.z);

    const rotation = rbRef.current.rotation();
    const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
    const heading = Math.atan2(forward.x, forward.z);
    const titanState = titanEntity.get(TitanTrait);
    const controls = mergeControls(titanState?.controls, movement.current);
    const forces = calculateDriveForces(controls, heading, delta);

    if (titanState && titanState.energy > 0) {
      rbRef.current.applyImpulse(forces.impulse, true);
      rbRef.current.applyTorqueImpulse({ x: 0, y: forces.torqueY, z: 0 }, true);
    }

    const cameraDistance = size.width < 520 ? 34 : 42;
    const cameraHeight = size.width < 520 ? 18 : 20;
    const cameraOffset = new THREE.Vector3(0, cameraHeight, -cameraDistance).applyQuaternion(quat);
    camera.position.lerp(position.current.clone().add(cameraOffset), 0.1);
    camera.lookAt(position.current.clone().add(new THREE.Vector3(0, 5.2, 0)));

    if (titanState) {
      const linvel = rbRef.current.linvel();
      titanEntity.set(
        TitanTrait,
        advanceTitanSystems(titanState, delta * 1000, controls, {
          position: { x: currentTrans.x, y: currentTrans.y, z: currentTrans.z },
          heading,
          velocity: { x: linvel.x, y: linvel.y, z: linvel.z },
        })
      );
    }
  });

  return (
    <RigidBody
      ref={rbRef}
      mass={CONFIG.PLAYER_MASS}
      position={[0, 5.4, 0]}
      colliders={false}
      enabledRotations={[false, true, false]}
      linearDamping={1.25}
      angularDamping={1.8}
    >
      <CuboidCollider args={[2.8, 4.8, 2.4]} position={[0, -0.8, 0]} />
      <group>
        <MechChassis />
      </group>
    </RigidBody>
  );
}

function MechChassis() {
  return (
    <group>
      <ArmorBox position={[0, 1.3, 0]} scale={[4.8, 3.4, 3.4]} color="#334155" />
      <ArmorBox position={[0, -1.2, 0]} scale={[3.5, 1.25, 2.8]} color="#1f2937" />
      <ArmorBox position={[0, 2.4, 1.95]} scale={[2.25, 1.1, 0.5]} color="#38bdf8" glow />
      <ArmorBox position={[0, 0.85, 2.05]} scale={[3.55, 0.22, 0.34]} color="#2dd4bf" glow />
      <ArmorBox position={[0, 2.45, -1.95]} scale={[2.4, 2.9, 0.75]} color="#475569" />
      <ArmorBox position={[0, 2.55, -2.42]} scale={[1.5, 1.9, 0.28]} color="#f59e0b" glow />

      <Leg side={-1} />
      <Leg side={1} />
      <Arm side={-1} cannon />
      <Arm side={1} />

      <mesh position={[0, 4.28, 0.35]} castShadow>
        <cylinderGeometry args={[0.28, 0.38, 1.45, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[0, 5.07, 0.35]} castShadow>
        <boxGeometry args={[2.3, 0.16, 0.16]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Leg({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * 1.35, -1.95, 0]}>
      <ArmorBox position={[0, 0, 0]} scale={[1.05, 2.3, 1.15]} color="#273244" />
      <ArmorBox position={[0, -2.05, -0.08]} scale={[1.15, 2.15, 1.05]} color="#111827" />
      <ArmorBox position={[0, -3.38, 0.45]} scale={[1.75, 0.52, 2.55]} color="#475569" />
      <ArmorBox
        position={[side * 0.34, -1.15, 0.58]}
        scale={[0.22, 2.4, 0.22]}
        color="#2dd4bf"
        glow
      />
    </group>
  );
}

function Arm({ side, cannon = false }: { side: -1 | 1; cannon?: boolean }) {
  return (
    <group position={[side * 3.05, 1.25, 0.2]}>
      <ArmorBox position={[0, 0.65, 0]} scale={[1.1, 1.25, 2.25]} color="#475569" />
      <ArmorBox position={[side * 0.35, -0.82, 0.08]} scale={[0.9, 2.2, 0.95]} color="#1f2937" />
      {cannon ? (
        <>
          <mesh position={[side * 0.38, -1.95, 1.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.46, 3.2, 10]} />
            <meshStandardMaterial color="#111827" metalness={0.82} roughness={0.28} />
          </mesh>
          <mesh position={[side * 0.38, -1.95, 3.2]}>
            <cylinderGeometry args={[0.5, 0.38, 0.34, 12]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.55} />
          </mesh>
        </>
      ) : (
        <ArmorBox position={[side * 0.2, -2.15, 0.35]} scale={[1.2, 0.85, 1.3]} color="#334155" />
      )}
    </group>
  );
}

function ArmorBox({
  position,
  scale,
  color,
  glow = false,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  glow?: boolean;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={glow ? 0.42 : 0.02}
        metalness={glow ? 0.15 : 0.56}
        roughness={0.38}
      />
    </mesh>
  );
}

function mergeControls(
  stateControls: TitanControls | undefined,
  keyboard: { w: boolean; a: boolean; s: boolean; d: boolean; fire: boolean; brace: boolean }
) {
  const keyboardThrottle = keyboard.w ? 1 : keyboard.s ? -1 : 0;
  const keyboardTurn = keyboard.a ? -1 : keyboard.d ? 1 : 0;

  return normalizeTitanControls({
    throttle: keyboardThrottle || stateControls?.throttle,
    turn: keyboardTurn || stateControls?.turn,
    fire: keyboard.fire || stateControls?.fire,
    brace: keyboard.brace || stateControls?.brace,
  });
}
