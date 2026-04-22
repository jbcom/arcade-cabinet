import { createNoise2D, createNoise3D } from "simplex-noise";

const noise2D = createNoise2D();
const _noise3D = createNoise3D();

export interface ChunkConfig {
  CHUNK_SIZE: number;
  WORLD_HEIGHT: number;
  RENDER_DISTANCE: number;
}

export interface BlockData {
  x: number;
  y: number;
  z: number;
  type: string;
}

export interface ChunkData {
  cx: number;
  cz: number;
  blocks: BlockData[];
}

function getProceduralHeight(x: number, z: number) {
  let elevation = 0;
  const n1 = noise2D(x * 0.01, z * 0.01) * 20;
  const n2 = noise2D(x * 0.05, z * 0.05) * 5;
  elevation = n1 + n2;
  const terrace = Math.floor(elevation / 4) * 4;
  const mix = noise2D(x * 0.02, z * 0.02) * 0.5 + 0.5;
  let finalY = Math.floor(elevation * (1 - mix) + terrace * mix);
  const mnt = noise2D(x * 0.003, z * 0.003);
  if (mnt > 0.4) {
    const power = (mnt - 0.4) * 50;
    finalY += Math.floor(power * (noise2D(x * 0.01, z * 0.01) * 0.5 + 0.5) ** 2);
  }
  return finalY;
}

self.onmessage = (e: MessageEvent<{ cx: number; cz: number; config: ChunkConfig }>) => {
  const { cx, cz, config } = e.data;
  const CHUNK_SIZE = config.CHUNK_SIZE;
  const blocks: BlockData[] = [];

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const wx = cx * CHUNK_SIZE + lx;
      const wz = cz * CHUNK_SIZE + lz;
      const wy = getProceduralHeight(wx, wz);

      if (wy < -1) {
        blocks.push({ x: lx, y: -1, z: lz, type: "water" });
        blocks.push({ x: lx, y: wy, z: lz, type: "sand" });
      } else if (wy === -1 || wy === 0) {
        blocks.push({ x: lx, y: wy, z: lz, type: "sand" });
        blocks.push({ x: lx, y: wy - 1, z: lz, type: "stone" });
      } else if (wy > 4) {
        blocks.push({ x: lx, y: wy, z: lz, type: "snow" });
        blocks.push({ x: lx, y: wy - 1, z: lz, type: "stone" });
      } else {
        blocks.push({ x: lx, y: wy, z: lz, type: "grass" });
        blocks.push({ x: lx, y: wy - 1, z: lz, type: "dirt" });
        blocks.push({ x: lx, y: wy - 2, z: lz, type: "stone" });

        // Trees
        if (Math.random() < 0.015 && wy > 0) {
          blocks.push({ x: lx, y: wy + 1, z: lz, type: "wood" });
          blocks.push({ x: lx, y: wy + 2, z: lz, type: "wood" });
          blocks.push({ x: lx, y: wy + 3, z: lz, type: "leaves" });
          if (lx > 0) blocks.push({ x: lx - 1, y: wy + 2, z: lz, type: "leaves" });
          if (lx < CHUNK_SIZE - 1) blocks.push({ x: lx + 1, y: wy + 2, z: lz, type: "leaves" });
          if (lz > 0) blocks.push({ x: lx, y: wy + 2, z: lz - 1, type: "leaves" });
          if (lz < CHUNK_SIZE - 1) blocks.push({ x: lx, y: wy + 2, z: lz + 1, type: "leaves" });
        }
      }

      // Depth filling
      let depth = wy - 3;
      while (depth > wy - 6) {
        blocks.push({ x: lx, y: depth, z: lz, type: "stone" });
        depth--;
      }
    }
  }

  self.postMessage({
    cx,
    cz,
    blocks,
  });
};
