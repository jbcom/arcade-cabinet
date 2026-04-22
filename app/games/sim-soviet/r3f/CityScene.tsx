import { browserTestCanvasGlOptions } from "@app/shared";
import { BUILDINGS } from "@logic/games/sim-soviet/engine/BuildingTypes";
import type { SimSovietState } from "@logic/games/sim-soviet/engine/Simulation";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

interface CitySceneProps {
  state: SimSovietState;
  onCellClick: (x: number, y: number) => void;
}

function CityCellMesh({
  x,
  y,
  building,
  elevation,
  onClick,
}: {
  x: number;
  y: number;
  building: keyof typeof BUILDINGS | undefined;
  elevation: number;
  onClick: () => void;
}) {
  const buildingInfo = building ? BUILDINGS[building] : null;
  return (
    <group position={[x - 4.5, elevation / 2, y - 4.5]}>
      <mesh receiveShadow castShadow onClick={onClick}>
        <boxGeometry args={[0.92, 0.08 + elevation, 0.92]} />
        <meshStandardMaterial color={building ? "#1e293b" : "#334155"} />
      </mesh>
      {buildingInfo ? (
        <>
          <mesh castShadow receiveShadow position={[0, buildingInfo.height / 2 + 0.08, 0]}>
            <boxGeometry args={[0.7, buildingInfo.height, 0.7]} />
            <meshStandardMaterial color={buildingInfo.color} />
          </mesh>
          {building === "tower" ? (
            <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.72, 0.88, 32]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
            </mesh>
          ) : null}
        </>
      ) : null}
    </group>
  );
}

export function CityScene({ state, onCellClick }: CitySceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 11, 8], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      data-testid="sim-soviet-canvas"
      gl={browserTestCanvasGlOptions}
    >
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[8, 12, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <group rotation={[0, Math.PI / 4, 0]}>
        {state.grid.map((cell) => (
          <CityCellMesh
            key={`${cell.x}-${cell.y}`}
            x={cell.x}
            y={cell.y}
            elevation={cell.elevation}
            building={cell.building}
            onClick={() => onCellClick(cell.x, cell.y)}
          />
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#0f766e" />
      </mesh>
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.5}
        maxPolarAngle={1.1}
        minDistance={10}
        maxDistance={18}
        target={[0, 0.8, 0]}
      />
    </Canvas>
  );
}
