import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { primordialEntity } from "../store/world";
import { PrimordialTrait } from "../store/traits";
import { CONFIG } from "../engine/types";

export function Player() {
  const { camera, raycaster, scene } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const position = useRef(new THREE.Vector3());
  
  const [isGrappling, setIsGrappling] = useState(false);
  const [grapplePoint, setGrapplePoint] = useState<THREE.Vector3 | null>(null);
  const movement = useRef({ w: false, a: false, s: false, d: false, space: false });
  const tetherLineGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": movement.current.w = true; break;
        case "KeyS": movement.current.s = true; break;
        case "KeyA": movement.current.a = true; break;
        case "KeyD": movement.current.d = true; break;
        case "Space": movement.current.space = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": movement.current.w = false; break;
        case "KeyS": movement.current.s = false; break;
        case "KeyA": movement.current.a = false; break;
        case "KeyD": movement.current.d = false; break;
        case "Space": movement.current.space = false; break;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const state = primordialEntity.get(PrimordialTrait);
      if (state?.phase !== "playing") return;

      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      const hit = intersects.find(i => i.object.name === "terrain-chunk" && i.distance < CONFIG.maxTetherDist);

      if (hit) {
        setIsGrappling(true);
        setGrapplePoint(hit.point);
        
        if (rbRef.current) {
            const currentPos = rbRef.current.translation();
            const posVec = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
            const impulseDir = hit.point.clone().sub(posVec).normalize().multiplyScalar(15 * CONFIG.playerMass);
            rbRef.current.applyImpulse(impulseDir, true);
        }
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsGrappling(false);
        setGrapplePoint(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [camera, raycaster, scene]);

  useFrame((state, delta) => {
    const pState = primordialEntity.get(PrimordialTrait);
    if (pState?.phase !== "playing" || !rbRef.current) return;

    const currentTrans = rbRef.current.translation();
    const currentVel = rbRef.current.linvel();
    position.current.set(currentTrans.x, currentTrans.y, currentTrans.z);

    // Continuous raycasting for crosshair
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const hit = intersects.find(i => i.object.name === "terrain-chunk" && i.distance < CONFIG.maxTetherDist);
    
    if (!!hit !== pState.isInGrappleRange) {
        primordialEntity.set(PrimordialTrait, { ...pState, isInGrappleRange: !!hit });
    }

    // Apply tether physics
    if (isGrappling && grapplePoint) {
      const dist = position.current.distanceTo(grapplePoint);
      if (dist > CONFIG.tetherRestLength) {
        const forceDir = grapplePoint.clone().sub(position.current).normalize();
        const forceMag = (dist - CONFIG.tetherRestLength) * CONFIG.tetherStrength * delta;
        const dampingX = currentVel.x * CONFIG.tetherDamping * delta;
        const dampingY = currentVel.y * CONFIG.tetherDamping * delta;
        const dampingZ = currentVel.z * CONFIG.tetherDamping * delta;

        rbRef.current.applyImpulse({
          x: forceDir.x * forceMag - dampingX,
          y: forceDir.y * forceMag - dampingY,
          z: forceDir.z * forceMag - dampingZ
        }, true);
      }

      // Update tether line visual (from camera slightly lower to look like it comes from hand)
      tetherLineGeometry.setFromPoints([new THREE.Vector3(position.current.x, position.current.y - 0.5, position.current.z), grapplePoint]);
    }

    // Air control (relative to camera view)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Move horizontally relative to view
    cameraDirection.normalize();

    const right = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

    const moveDir = new THREE.Vector3();
    if (movement.current.w) moveDir.add(cameraDirection);
    if (movement.current.s) moveDir.sub(cameraDirection);
    if (movement.current.d) moveDir.sub(right);
    if (movement.current.a) moveDir.add(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize().multiplyScalar(CONFIG.airControl * delta);
      rbRef.current.applyImpulse(moveDir, true);
    }

    if (movement.current.space) {
        rbRef.current.applyImpulse({x: 0, y: CONFIG.jumpForce * CONFIG.playerMass, z: 0}, true);
        movement.current.space = false;
    }

    // First-person camera: lock to player position
    camera.position.copy(position.current);

    // Update state altitude and time
    const currentAltitude = Math.floor(position.current.y);
    let maxAlt = pState.maxAltitude;
    if (currentAltitude > pState.maxAltitude) {
       maxAlt = currentAltitude;
    }
    
    const speed = Math.sqrt(currentVel.x**2 + currentVel.y**2 + currentVel.z**2);
    
    // Combine all high-frequency state updates into one set call
    primordialEntity.set(PrimordialTrait, { 
        ...pState, 
        altitude: currentAltitude, 
        maxAltitude: maxAlt, 
        velocity: Math.floor(speed),
        timeSurvived: pState.timeSurvived + delta * 1000
    });
  });

  return (
    <>
      <RigidBody ref={rbRef} mass={CONFIG.playerMass} position={[0, 10, 0]} enabledRotations={[false, false, false]} colliders="ball">
        <mesh visible={false}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </RigidBody>
      {isGrappling && (
        <line geometry={tetherLineGeometry}>
          <lineBasicMaterial color="#00eeff" linewidth={2} />
        </line>
      )}
    </>
  );
}
