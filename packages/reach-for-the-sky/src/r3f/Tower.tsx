import { useTrait } from "koota/react";
import { BUILDINGS, CONFIG } from "../engine/types";
import { type BuildingData, TowerTrait } from "../store/traits";
import { skyEntity } from "../store/world";

function Building({ data }: { data: BuildingData }) {
  const buildingInfo = BUILDINGS[data.type as keyof typeof BUILDINGS];
  const color = buildingInfo?.color || "#ffffff";

  return (
    <mesh
      position={[
        data.x * CONFIG.CELL_SIZE.w + (data.w * CONFIG.CELL_SIZE.w) / 2,
        data.y * CONFIG.CELL_SIZE.h + (data.h * CONFIG.CELL_SIZE.h) / 2,
        0,
      ]}
    >
      <boxGeometry args={[data.w * CONFIG.CELL_SIZE.w, data.h * CONFIG.CELL_SIZE.h, 10]} />
      <meshStandardMaterial color={color} />
      {/* Visual dirt indicator */}
      {data.dirt > 50 && (
        <mesh position={[0, 0, 5.1]}>
          <planeGeometry args={[data.w * CONFIG.CELL_SIZE.w, data.h * CONFIG.CELL_SIZE.h]} />
          <meshBasicMaterial color="#3e2723" transparent opacity={(data.dirt - 50) / 100} />
        </mesh>
      )}
    </mesh>
  );
}

export function Tower() {
  const { buildings } = useTrait(skyEntity, TowerTrait);

  return (
    <group>
      {buildings.map((b) => (
        <Building key={b.id} data={b} />
      ))}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#2e7d32" />
      </mesh>
    </group>
  );
}
