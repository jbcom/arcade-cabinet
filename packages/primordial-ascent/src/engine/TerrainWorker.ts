import { createNoise3D } from "simplex-noise";

const noise3D = createNoise3D();

export interface ChunkConfig {
  chunkSize: number;
  voxelSize: number;
  isoLevel: number;
  noiseScale: number;
}

export interface ChunkData {
  cx: number;
  cy: number;
  cz: number;
  positions: Float32Array;
  indices: Uint32Array;
  normals: Float32Array;
  colors: Float32Array;
}

self.onmessage = (e: MessageEvent<{ cx: number; cy: number; cz: number; config: ChunkConfig }>) => {
  const { cx, cy, cz, config } = e.data;
  const size = config.chunkSize;
  const vs = config.voxelSize;
  const scale = config.noiseScale;

  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  let indexOffset = 0;

  function getDensity(x: number, y: number, z: number) {
    const worldX = (cx * size + x) * vs;
    const worldY = (cy * size + y) * vs;
    const worldZ = (cz * size + z) * vs;

    // 1. MEANDERING SHAFT
    const driftX = noise3D(worldY * 0.002, 0, 0) * 250;
    const driftZ = noise3D(0, worldY * 0.002, 0) * 250;
    const dx = worldX - driftX;
    const dz = worldZ - driftZ;
    const distFromCenter = Math.sqrt(dx * dx + dz * dz);

    // 2. DYNAMIC RADIUS
    const baseRadius = 150;
    const radiusVariation = noise3D(0, worldY * 0.005, 0) * 80;
    const shaftRadius = baseRadius + radiusVariation;
    const shaftMask = Math.max(0, 1.0 - distFromCenter / shaftRadius);

    // 3. DOMAIN WARPING
    const warpScale = 0.015;
    const warpForce = 40.0;
    const wx =
      worldX + noise3D(worldX * warpScale, worldY * warpScale, worldZ * warpScale) * warpForce;
    const wy =
      worldY +
      noise3D(worldX * warpScale + 100, worldY * warpScale, worldZ * warpScale) * warpForce;
    const wz =
      worldZ +
      noise3D(worldX * warpScale + 200, worldY * warpScale, worldZ * warpScale) * warpForce;

    // 4. MULTI-FRACTAL RIDGED NOISE
    const n1 = noise3D(wx * scale, wy * scale * 1.5, wz * scale);
    const n2 = noise3D(wx * scale * 2.5, wy * scale * 3.0, wz * scale * 2.5) * 0.5;
    const n3 =
      (1.0 - Math.abs(noise3D(wx * scale * 0.6, wy * scale * 0.3, wz * scale * 0.6))) * 1.2;

    const density = (n1 + n2 + n3) * 0.4;

    return density + distFromCenter * 0.005 - shaftMask * 0.85;
  }

  const densities = new Float32Array((size + 2) * (size + 2) * (size + 2));
  function idx(x: number, y: number, z: number) {
    return x + (size + 2) * (y + (size + 2) * z);
  }

  for (let z = -1; z <= size; z++) {
    for (let y = -1; y <= size; y++) {
      for (let x = -1; x <= size; x++) {
        densities[idx(x + 1, y + 1, z + 1)] = getDensity(x, y, z);
      }
    }
  }

  const faces = [
    {
      dir: [1, 0, 0],
      corners: [
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 0],
        [1, 1, 0],
      ],
      norm: [1, 0, 0],
    },
    {
      dir: [-1, 0, 0],
      corners: [
        [0, 1, 0],
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 1],
      ],
      norm: [-1, 0, 0],
    },
    {
      dir: [0, 1, 0],
      corners: [
        [0, 1, 1],
        [1, 1, 1],
        [1, 1, 0],
        [0, 1, 0],
      ],
      norm: [0, 1, 0],
    },
    {
      dir: [0, -1, 0],
      corners: [
        [0, 0, 0],
        [1, 0, 0],
        [1, 0, 1],
        [0, 0, 1],
      ],
      norm: [0, -1, 0],
    },
    {
      dir: [0, 0, 1],
      corners: [
        [1, 1, 1],
        [0, 1, 1],
        [0, 0, 1],
        [1, 0, 1],
      ],
      norm: [0, 0, 1],
    },
    {
      dir: [0, 0, -1],
      corners: [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
        [0, 0, 0],
      ],
      norm: [0, 0, -1],
    },
  ];

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (densities[idx(x + 1, y + 1, z + 1)] > config.isoLevel) {
          const wx = (cx * size + x) * vs;
          const wy = (cy * size + y) * vs;
          const wz = (cz * size + z) * vs;

          const colorNoise = noise3D(wx * 0.03, wy * 0.03, wz * 0.03);
          const isVein = colorNoise > 0.65;

          for (let f = 0; f < 6; f++) {
            const face = faces[f];
            if (
              densities[idx(x + face.dir[0] + 1, y + face.dir[1] + 1, z + face.dir[2] + 1)] <=
              config.isoLevel
            ) {
              let fr = 0.05,
                fg = 0.08,
                fb = 0.1,
                a = 1.0;

              if (isVein) {
                fr = 0.0;
                fg = 0.4;
                fb = 0.3;
              }

              if (face.dir[1] === 1) {
                fr = 0.15;
                fg = 0.4;
                fb = 0.2;
              } else if (face.dir[1] === -1) {
                fr = 0.0;
                fg = 0.8;
                fb = 1.0;
                if (isVein) {
                  fr = 1.0;
                  fg = 0.1;
                  fb = 0.8;
                }
              }

              for (let i = 0; i < 4; i++) {
                positions.push(
                  wx + face.corners[i][0] * vs,
                  wy + face.corners[i][1] * vs,
                  wz + face.corners[i][2] * vs
                );
                normals.push(...face.norm);
                colors.push(fr, fg, fb, a);
              }
              indices.push(
                indexOffset,
                indexOffset + 1,
                indexOffset + 2,
                indexOffset,
                indexOffset + 2,
                indexOffset + 3
              );
              indexOffset += 4;
            }
          }
        }
      }
    }
  }

  self.postMessage({
    cx,
    cy,
    cz,
    positions: new Float32Array(positions),
    indices: new Uint32Array(indices),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
  });
};
