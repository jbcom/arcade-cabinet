import { Physics } from "@react-three/rapier";
import { Player } from "./Player";
import { TerrainManager } from "./TerrainManager";
import { Enemies } from "./Enemies";

export function World() {
  return (
    <>
      <color attach="background" args={["#020205"]} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <fogExp2 attach="fog" args={["#020205", 0.02]} />
      
      <Physics gravity={[0, -9.8, 0]}>
        <Player />
        <TerrainManager />
        <Enemies />
      </Physics>
    </>
  );
}
