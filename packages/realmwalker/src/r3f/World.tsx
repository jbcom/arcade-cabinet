import { Physics, RigidBody } from "@react-three/rapier";
import { Sky, Environment, ContactShadows } from "@react-three/drei";
import { useTrait } from "koota/react";
import { realmEntity } from "../store/world";
import { RealmTrait } from "../store/traits";
import { Player } from "./Player";
import * as THREE from "three";

export function World() {
  const state = useTrait(realmEntity, RealmTrait);
  
  // Zone-based environment colors
  const zoneColors = [
    "#0f172a", // Zone 1: Deep Blue
    "#1e1b4b", // Zone 2: Indigo
    "#312e81", // Zone 3: Violet
    "#4338ca", // Zone 4: Purple
  ];
  const color = zoneColors[(state.zone - 1) % zoneColors.length];

  return (
    <>
      <color attach="background" args={[color]} />
      <Sky sunPosition={[0, 10, 20]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      
      <Physics gravity={[0, -20, 0]}>
        <Player />
        
        {/* Dungeon Floor */}
        <RigidBody type="fixed">
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </RigidBody>
        
        {/* Procedural pillars/walls based on zone */}
        {[...Array(15)].map((_, i) => (
          <RigidBody 
            key={i} 
            position={[
              Math.sin(i) * 30, 
              5, 
              Math.cos(i) * 30
            ]} 
            type="fixed"
          >
            <mesh castShadow>
              <boxGeometry args={[4, 10, 4]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </RigidBody>
        ))}
      </Physics>
      
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={100} blur={2} />
    </>
  );
}
