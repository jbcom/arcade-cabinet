import { useFrame, useThree } from "@react-three/fiber";
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  advancePrimordialState,
  calculateAirControlImpulse,
  calculateJumpImpulse,
  calculateTetherImpulse,
  calculateThermalLift,
} from "../engine/primordialSimulation";
import { CONFIG, type PrimordialControls } from "../engine/types";
import { PrimordialTrait } from "../store/traits";
import { primordialEntity } from "../store/world";

const CAMERA_PITCH = 0.18;

export function Player() {
  const { camera, raycaster, scene } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const position = useRef(new THREE.Vector3());

  const [isGrappling, setIsGrappling] = useState(false);
  const [grapplePoint, setGrapplePoint] = useState<THREE.Vector3 | null>(null);
  const movement = useRef<PrimordialControls>({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    grapple: false,
  });
  const tetherLineGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  useEffect(() => {
    camera.position.set(
      CONFIG.playerStartPosition.x,
      CONFIG.playerStartPosition.y,
      CONFIG.playerStartPosition.z
    );
    camera.rotation.set(CAMERA_PITCH, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    const acquireGrapple = () => {
      const state = primordialEntity.get(PrimordialTrait);
      if (state?.phase !== "playing") return;

      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(
        (i) => i.object.name === "terrain-chunk" && i.distance < CONFIG.maxTetherDist
      );

      if (!hit) return;

      movement.current.grapple = true;
      setIsGrappling(true);
      setGrapplePoint(hit.point);

      if (rbRef.current) {
        const currentPos = rbRef.current.translation();
        const initialImpulse = calculateTetherImpulse(
          { x: currentPos.x, y: currentPos.y, z: currentPos.z },
          { x: 0, y: 0, z: 0 },
          hit.point,
          0.014
        ).impulse;

        rbRef.current.applyImpulse(initialImpulse, true);
      }
    };

    const releaseGrapple = () => {
      movement.current.grapple = false;
      setIsGrappling(false);
      setGrapplePoint(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          movement.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          movement.current.back = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          movement.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
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
        case "ArrowUp":
          movement.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          movement.current.back = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          movement.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          movement.current.right = false;
          break;
        case "Space":
          movement.current.jump = false;
          break;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) acquireGrapple();
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (e.button === 0) releaseGrapple();
    };

    const handleMobileGrappleStart = () => acquireGrapple();
    const handleMobileGrappleEnd = () => releaseGrapple();
    const handleMobileJump = () => {
      movement.current.jump = true;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("primordial:grapple-start", handleMobileGrappleStart);
    window.addEventListener("primordial:grapple-end", handleMobileGrappleEnd);
    window.addEventListener("primordial:jump", handleMobileJump);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("primordial:grapple-start", handleMobileGrappleStart);
      window.removeEventListener("primordial:grapple-end", handleMobileGrappleEnd);
      window.removeEventListener("primordial:jump", handleMobileJump);
    };
  }, [camera, raycaster, scene]);

  useFrame((_state, delta) => {
    const pState = primordialEntity.get(PrimordialTrait);
    if (pState?.phase !== "playing" || !rbRef.current) return;

    const currentTrans = rbRef.current.translation();
    const currentVel = rbRef.current.linvel();
    position.current.set(currentTrans.x, currentTrans.y, currentTrans.z);

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const hit = intersects.find(
      (i) => i.object.name === "terrain-chunk" && i.distance < CONFIG.maxTetherDist
    );

    if (isGrappling && grapplePoint) {
      const tether = calculateTetherImpulse(position.current, currentVel, grapplePoint, delta);
      rbRef.current.applyImpulse(tether.impulse, true);

      tetherLineGeometry.setFromPoints([
        new THREE.Vector3(position.current.x, position.current.y - 0.5, position.current.z),
        grapplePoint,
      ]);
    }

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const moveImpulse = calculateAirControlImpulse(movement.current, cameraDirection, delta);
    if (moveImpulse.x !== 0 || moveImpulse.z !== 0) {
      rbRef.current.applyImpulse(moveImpulse, true);
    }

    const thermalLift = calculateThermalLift(pState.distToLava);
    if (thermalLift > 0) {
      rbRef.current.applyImpulse({ x: 0, y: thermalLift * delta * CONFIG.playerMass, z: 0 }, true);
    }

    if (movement.current.jump) {
      rbRef.current.applyImpulse(calculateJumpImpulse(), true);
      movement.current.jump = false;
    }

    camera.position.copy(position.current);
    camera.rotation.x = CAMERA_PITCH;

    primordialEntity.set(
      PrimordialTrait,
      advancePrimordialState(pState, delta * 1000, {
        position: currentTrans,
        velocity: currentVel,
        lavaHeight: pState.lavaHeight,
        grappleDistance: hit?.distance ?? null,
      })
    );
  });

  return (
    <>
      <RigidBody
        ref={rbRef}
        mass={CONFIG.playerMass}
        position={[
          CONFIG.playerStartPosition.x,
          CONFIG.playerStartPosition.y,
          CONFIG.playerStartPosition.z,
        ]}
        enabledRotations={[false, false, false]}
        colliders="ball"
      >
        <mesh visible={false}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </RigidBody>
      {isGrappling && (
        <threeLine geometry={tetherLineGeometry}>
          <lineBasicMaterial color="#00eeff" linewidth={2} />
        </threeLine>
      )}
      <FirstPersonHarness isGrappling={isGrappling} />
    </>
  );
}

function FirstPersonHarness({ isGrappling }: { isGrappling: boolean }) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    const offset = new THREE.Vector3(0.44, -0.42, -0.92).applyQuaternion(camera.quaternion);
    groupRef.current.position.copy(camera.position).add(offset);
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={groupRef} scale={0.9}>
      <mesh position={[0.05, -0.05, 0.12]} rotation={[Math.PI / 2, 0, 0.18]}>
        <cylinderGeometry args={[0.13, 0.18, 0.58, 8]} />
        <meshStandardMaterial color="#202a35" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0.02, 0.09, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.025, 8, 18]} />
        <meshStandardMaterial
          color="#c9fbff"
          emissive={isGrappling ? "#00ff66" : "#00e5ff"}
          emissiveIntensity={isGrappling ? 1.6 : 0.85}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.02, 0.09, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.085, 0.32, 6]} />
        <meshStandardMaterial
          color="#e6feff"
          emissive={isGrappling ? "#00ff66" : "#00e5ff"}
          emissiveIntensity={isGrappling ? 1.3 : 0.65}
          metalness={0.4}
          roughness={0.25}
        />
      </mesh>
      <pointLight
        color={isGrappling ? "#00ff66" : "#00e5ff"}
        intensity={isGrappling ? 5 : 2.4}
        distance={4}
      />
    </group>
  );
}
