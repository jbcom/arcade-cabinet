import {
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  isCabinetRuntimePaused,
  OverlayButton,
} from "@app/shared";
import {
  advanceCognitiveState,
  createInitialCognitiveState,
  getCognitiveRunSummary,
} from "@logic/games/cognitive-dissonance/engine/cognitiveSimulation";
import type {
  CognitivePattern,
  CognitiveState,
} from "@logic/games/cognitive-dissonance/engine/types";
import type { SessionMode } from "@logic/shared";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PATTERN_COLORS: Record<CognitivePattern, string> = {
  cyan: "#67e8f9",
  gold: "#facc15",
  violet: "#a78bfa",
};

export default function Game() {
  const [state, setState] = useState<CognitiveState>(() =>
    createInitialCognitiveState("standard", "menu")
  );
  const heldPattern = useRef<CognitivePattern | null>(null);

  useEffect(() => {
    if (state.phase !== "playing") return undefined;

    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const delta = now - last;
      last = now;
      if (!isCabinetRuntimePaused()) {
        setState((current) => advanceCognitiveState(current, delta, heldPattern.current));
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [state.phase]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1") heldPattern.current = "violet";
      if (event.key === "2") heldPattern.current = "cyan";
      if (event.key === "3") heldPattern.current = "gold";
    };
    const handleKeyUp = () => {
      heldPattern.current = null;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const start = (mode: SessionMode) => {
    heldPattern.current = null;
    setState(createInitialCognitiveState(mode, "playing"));
  };

  const restart = () => {
    setState(createInitialCognitiveState(state.sessionMode, "menu"));
  };
  const summary = getCognitiveRunSummary(state);

  return (
    <GameViewport background="#060712" data-browser-screenshot-mode="page">
      <CognitiveThreeAdapter state={state} />

      {state.phase === "menu" ? (
        <CartridgeStartScreen
          accent="#a78bfa"
          cartridgeId="Slot 11"
          description="Match escaping patterns with rim controls and keep the AI cabinet coherent."
          gameSlug="cognitive-dissonance"
          kicker="Diegetic Mind Cartridge"
          motif="mind"
          onStart={start}
          rules={[
            "Hold the rim color matching the escaping pattern.",
            "Correct matches lower tension and rebuild coherence.",
            "Standard mode lets coherence recover instead of shattering instantly.",
          ]}
          secondaryAccent="#67e8f9"
          startLabel="Stabilize Shift"
          title="COGNITIVE DISSONANCE"
        />
      ) : null}

      {state.phase === "playing" ? (
        <>
          <Hud state={state} />
          <RimControls
            active={state.currentPattern}
            onHold={(pattern) => {
              heldPattern.current = pattern;
            }}
            onRelease={() => {
              heldPattern.current = null;
            }}
          />
        </>
      ) : null}

      {state.phase === "stable" ? (
        <GameOverScreen
          accent="#67e8f9"
          result={{
            milestones: ["first-stable-shift"],
            mode: state.sessionMode,
            score: summary.coherence * 100 + summary.stableMatches * 50,
            slug: "cognitive-dissonance",
            status: "completed",
            summary: `Stable ${summary.targetSeconds}s shift`,
          }}
          title="Shift Stable"
          subtitle={`${summary.targetSeconds}s shift held at ${summary.coherence}% coherence with ${summary.tension}% tension.`}
          actions={<OverlayButton onClick={restart}>Run Another Shift</OverlayButton>}
        />
      ) : null}

      {state.phase === "shattered" ? (
        <GameOverScreen
          accent="#a78bfa"
          result={{
            mode: state.sessionMode,
            score: summary.progressPercent * 10 + summary.stableMatches * 25,
            slug: "cognitive-dissonance",
            status: "failed",
            summary: `Shattered at ${summary.progressPercent}% shift progress`,
          }}
          title="Glass Shattered"
          subtitle={`Coherence dropped to zero after ${summary.elapsedSeconds}s (${summary.progressPercent}% of the shift). Match earlier and use rim controls as recovery.`}
          actions={<OverlayButton onClick={restart}>Reboot</OverlayButton>}
        />
      ) : null}
    </GameViewport>
  );
}

function CognitiveThreeAdapter({ state }: { state: CognitiveState }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#060712");
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0.5, 7);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight("#8796ff", 1.4);
    scene.add(ambient);
    const key = new THREE.PointLight("#67e8f9", 15, 18);
    key.position.set(2.2, 3, 3);
    scene.add(key);

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: "#1e1b4b",
      emissive: "#5b21b6",
      emissiveIntensity: 0.55,
      metalness: 0.2,
      opacity: 0.72,
      roughness: 0.18,
      transparent: true,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.45, 48, 32), sphereMaterial);
    scene.add(sphere);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: "#67e8f9", transparent: true });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.025, 8, 96), ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    const patternMeshes = Array.from({ length: 4 }, (_, index) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.14 + index * 0.02, 16, 12),
        new THREE.MeshStandardMaterial({
          color: "#a78bfa",
          emissive: "#a78bfa",
          emissiveIntensity: 1.4,
        })
      );
      scene.add(mesh);
      return mesh;
    });

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const animate = () => {
      const current = stateRef.current;
      const time = current.elapsedMs / 1000;
      const activeColor = PATTERN_COLORS[current.currentPattern];
      sphere.rotation.y = time * 0.18;
      sphere.rotation.x = Math.sin(time * 0.35) * 0.08;
      sphere.scale.setScalar(1 + current.tension * 0.0018);
      sphereMaterial.emissive.set(activeColor);
      sphereMaterial.emissiveIntensity = 0.25 + current.coherence / 120;
      ringMaterial.color.set(activeColor);
      ringMaterial.opacity = 0.25 + current.coherence / 160;

      for (let index = 0; index < patternMeshes.length; index++) {
        const pattern = current.patterns[index];
        const mesh = patternMeshes[index];
        if (!pattern || !mesh) continue;
        const orbit = pattern.orbit + time * (0.32 + index * 0.04);
        mesh.position.set(
          Math.cos(orbit) * 2.2,
          Math.sin(orbit * 1.7) * 1.05,
          Math.sin(orbit) * 0.9
        );
        mesh.scale.setScalar(0.7 + pattern.intensity * 1.2);
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.color.set(PATTERN_COLORS[pattern.color]);
        material.emissive.set(PATTERN_COLORS[pattern.color]);
        material.emissiveIntensity = 0.7 + pattern.intensity;
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      renderer.dispose();
      sphere.geometry.dispose();
      sphereMaterial.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      for (const mesh of patternMeshes) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="absolute inset-0" />;
}

function Hud({ state }: { state: CognitiveState }) {
  return (
    <header className="absolute inset-x-0 top-0 z-10 grid gap-2 p-3 sm:grid-cols-4 sm:p-5">
      <Metric label="Coherence" value={`${Math.round(state.coherence)}%`} accent="#67e8f9" />
      <Metric label="Tension" value={`${Math.round(state.tension)}%`} accent="#f87171" />
      <Metric
        label="Shift"
        value={`${getCognitiveRunSummary(state).progressPercent}%`}
        accent="#facc15"
      />
      <Metric
        label="Pattern"
        value={state.currentPattern}
        accent={PATTERN_COLORS[state.currentPattern]}
      />
      <Metric label="Mode" value={state.sessionMode} accent="#c4b5fd" />
      <div className="rounded-md border border-violet-200/16 bg-black/50 p-3 sm:col-span-4">
        <div className="font-mono text-[0.6rem] font-black uppercase tracking-[0.22em] text-violet-100/52">
          Objective
        </div>
        <div className="mt-1 text-sm font-bold text-violet-50">{state.objective}</div>
      </div>
    </header>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-md border border-white/12 bg-black/52 p-2 backdrop-blur">
      <div className="font-mono text-[0.58rem] font-black uppercase tracking-[0.2em] text-white/45">
        {label}
      </div>
      <div className="mt-1 text-lg font-black uppercase" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function RimControls({
  active,
  onHold,
  onRelease,
}: {
  active: CognitivePattern;
  onHold: (pattern: CognitivePattern) => void;
  onRelease: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-3 gap-2 p-3 sm:p-5">
      {(["violet", "cyan", "gold"] as const).map((pattern) => (
        <button
          key={pattern}
          type="button"
          className="min-h-16 rounded-md border px-3 py-2 text-center font-black uppercase tracking-[0.12em] text-white shadow-2xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
          style={{
            background:
              active === pattern
                ? `linear-gradient(135deg, ${PATTERN_COLORS[pattern]}66, rgba(15,23,42,0.84))`
                : "rgba(15,23,42,0.72)",
            borderColor: active === pattern ? PATTERN_COLORS[pattern] : "rgba(255,255,255,0.16)",
          }}
          onPointerDown={() => onHold(pattern)}
          onPointerLeave={onRelease}
          onPointerUp={onRelease}
        >
          {pattern}
        </button>
      ))}
    </div>
  );
}
