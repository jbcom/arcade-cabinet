import {
  advanceLavaHeight,
  calculateDistanceToLava,
} from "@logic/games/primordial-ascent/engine/primordialSimulation";
import { CONFIG } from "@logic/games/primordial-ascent/engine/types";
import { PrimordialTrait } from "@logic/games/primordial-ascent/store/traits";
import { primordialEntity } from "@logic/games/primordial-ascent/store/world";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function Lava() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      colorA: { value: new THREE.Color("#ff3300") },
      colorB: { value: new THREE.Color("#3a0500") },
    }),
    []
  );

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      const pState = primordialEntity.get(PrimordialTrait);
      if (pState?.phase === "playing") {
        const newY = advanceLavaHeight(
          pState.lavaHeight,
          pState.timeSurvived,
          delta * 1000,
          pState.sessionMode
        );
        meshRef.current.position.y = newY;
        const distToLava = calculateDistanceToLava(pState.altitude, newY);

        primordialEntity.set(PrimordialTrait, {
          ...pState,
          phase: pState.altitude <= newY + CONFIG.lavaContactMargin ? "gameover" : pState.phase,
          lavaHeight: newY,
          distToLava,
        });
      }
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    
    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vUv = uv;
      vPosition = position;
      vec3 pos = position;
      float noiseFreq = 0.05;
      float noiseAmp = 2.0;
      vec2 noisePos = vec2(pos.x * noiseFreq + time * 0.5, pos.z * noiseFreq + time * 0.5);
      pos.y += snoise(noisePos) * noiseAmp;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      float mixValue = sin(vPosition.y * 0.5 + time) * 0.5 + 0.5;
      vec3 color = mix(colorA, colorB, mixValue);
      float rim = smoothstep(0.15, 0.9, vUv.y) * 0.18;
      gl_FragColor = vec4(color + vec3(rim, rim * 0.35, 0.0), 0.94);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, CONFIG.lavaStartHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1000, 1000, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
