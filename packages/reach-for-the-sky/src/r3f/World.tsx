import { MapControls, Sky } from "@react-three/drei";
import { useTrait } from "koota/react";
import { CONFIG } from "../engine/types";
import { SkyTrait } from "../store/traits";
import { skyEntity } from "../store/world";
import { Tower } from "./Tower";

export function World() {
  const state = useTrait(skyEntity, SkyTrait);

  // Calculate sun position based on simulation tick
  const hour = (state.tick / CONFIG.DAY_TICKS) * 24;
  const sunTheta = (hour / 24) * Math.PI * 2 - Math.PI / 2;
  const sunPosition = [Math.cos(sunTheta) * 100, Math.sin(sunTheta) * 100, 50] as [
    number,
    number,
    number,
  ];

  return (
    <>
      <Sky sunPosition={sunPosition} />
      <ambientLight intensity={state.tick > 500 && state.tick < 1500 ? 0.6 : 0.2} />
      <directionalLight
        position={sunPosition}
        intensity={state.tick > 600 && state.tick < 1400 ? 1 : 0}
        castShadow
      />

      <Tower />

      <MapControls
        enableRotate={false}
        panSpeed={2}
        zoomSpeed={2}
        minDistance={20}
        maxDistance={500}
      />
    </>
  );
}
