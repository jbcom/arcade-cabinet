import { InstancedRigidBodies } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { BlockData, ChunkData } from "../engine/TerrainWorker";
import TerrainWorker from "../engine/TerrainWorker?worker";
import { CONFIG } from "../engine/types";

const COLORS: Record<string, string> = {
  grass: "#4caf50",
  dirt: "#795548",
  stone: "#9e9e9e",
  sand: "#ffe082",
  water: "#2196f3",
  snow: "#ffffff",
  wood: "#5d4037",
  leaves: "#2e7d32",
  ore: "#b45309",
};

const isVitest =
  typeof window !== "undefined" &&
  (window as unknown as { __vitest_browser__?: boolean }).__vitest_browser__;

function InstancedBlocks({
  type,
  blocks,
  cx,
  cz,
}: {
  type: string;
  blocks: BlockData[];
  cx: number;
  cz: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(
    () =>
      blocks.map(
        (b) =>
          [cx * CONFIG.CHUNK_SIZE + b.x + 0.5, b.y + 0.5, cz * CONFIG.CHUNK_SIZE + b.z + 0.5] as [
            number,
            number,
            number,
          ]
      ),
    [blocks, cx, cz]
  );

  useEffect(() => {
    if (isVitest && meshRef.current) {
      const dummy = new THREE.Object3D();
      blocks.forEach((block, i) => {
        dummy.position.set(
          cx * CONFIG.CHUNK_SIZE + block.x + 0.5,
          block.y + 0.5,
          cz * CONFIG.CHUNK_SIZE + block.z + 0.5
        );
        dummy.updateMatrix();
        meshRef.current?.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [blocks, cx, cz]);

  return (
    <>
      {!isVitest && (
        <InstancedRigidBodies positions={positions} colliders="cuboid" type="fixed">
          <instancedMesh args={[undefined, undefined, blocks.length]} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={COLORS[type] || "#ffffff"} />
          </instancedMesh>
        </InstancedRigidBodies>
      )}
      {isVitest && (
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, blocks.length]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={COLORS[type] || "#ffffff"} />
        </instancedMesh>
      )}
    </>
  );
}

function Chunk({ data }: { data: ChunkData }) {
  const blocksByType = useMemo(() => {
    const grouped = new Map<string, BlockData[]>();
    data.blocks.forEach((block) => {
      const arr = grouped.get(block.type) || [];
      arr.push(block);
      grouped.set(block.type, arr);
    });
    return grouped;
  }, [data]);

  return (
    <group>
      {Array.from(blocksByType.entries()).map(([type, blocks]) => (
        <InstancedBlocks key={type} type={type} blocks={blocks} cx={data.cx} cz={data.cz} />
      ))}
    </group>
  );
}

export function TerrainManager({ playerPos }: { playerPos: THREE.Vector3 }) {
  const [chunks, setChunks] = useState<Map<string, ChunkData>>(new Map());
  const workerRef = useRef<Worker>(null);
  const requestedChunks = useRef<Set<string>>(new Set());

  useEffect(() => {
    workerRef.current = new TerrainWorker();

    workerRef.current.onmessage = (e) => {
      const data = e.data as ChunkData;
      const key = `${data.cx},${data.cz}`;
      setChunks((prev) => {
        const next = new Map(prev);
        next.set(key, data);
        return next;
      });
    };

    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;

    const pCx = Math.floor(playerPos.x / CONFIG.CHUNK_SIZE);
    const pCz = Math.floor(playerPos.z / CONFIG.CHUNK_SIZE);

    const R = CONFIG.RENDER_DISTANCE;
    const currentVisibleKeys = new Set<string>();

    for (let cx = pCx - R; cx <= pCx + R; cx++) {
      for (let cz = pCz - R; cz <= pCz + R; cz++) {
        const key = `${cx},${cz}`;
        currentVisibleKeys.add(key);
        if (!requestedChunks.current.has(key)) {
          requestedChunks.current.add(key);
          workerRef.current.postMessage({ cx, cz, config: CONFIG });
        }
      }
    }

    setChunks((prev) => {
      const next = new Map(prev);
      let changed = false;
      for (const key of next.keys()) {
        if (!currentVisibleKeys.has(key)) {
          next.delete(key);
          requestedChunks.current.delete(key);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [playerPos.x, playerPos.z]); // Only react to player position changes, not chunk state updates

  return (
    <>
      {Array.from(chunks.values()).map((data) => (
        <Chunk key={`${data.cx},${data.cz}`} data={data} />
      ))}
    </>
  );
}
