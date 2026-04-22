import { Physics, RigidBody } from "@react-three/rapier";
import { Sky, Environment } from "@react-three/drei";
import { Mech } from "./Mech";

export function World() {
  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1} castShadow />
      
      <Physics gravity={[0, -9.8, 0]}>
        <Mech />
        
        {/* Ground */}
        <RigidBody type="fixed">
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
        </RigidBody>
        
        {/* Some obstacles */}
        {[...Array(20)].map((_, i) => (
          <RigidBody key={i} position={[Math.random() * 200 - 100, 2, Math.random() * 200 - 100]}>
            <mesh castShadow>
              <boxGeometry args={[4, 4, 4]} />
              <meshStandardMaterial color="#555" />
            </mesh>
          </RigidBody>
        ))}
      </Physics>
    </>
  );
}
