import {
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  isCabinetRuntimePaused,
  OverlayButton,
  useRunSnapshotAutosave,
} from "@app/shared";
import {
  advanceCognitiveState,
  createInitialCognitiveState,
  getCognitiveEndingCue,
  getCognitiveRunSummary,
  getCognitiveShiftCue,
} from "@logic/games/cognitive-dissonance/engine/cognitiveSimulation";
import type {
  CognitiveEndingCue,
  CognitivePattern,
  CognitiveState,
} from "@logic/games/cognitive-dissonance/engine/types";
import type { GameSaveSlot, SessionMode } from "@logic/shared";
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

  const start = (mode: SessionMode, saveSlot?: GameSaveSlot) => {
    heldPattern.current = null;
    setState(resolveCognitiveStartState(mode, saveSlot));
  };

  const restart = () => {
    setState(createInitialCognitiveState(state.sessionMode, "menu"));
  };
  const summary = getCognitiveRunSummary(state);
  const endingCue =
    state.phase === "stable" || state.phase === "shattered"
      ? getCognitiveEndingCue(state)
      : undefined;

  useRunSnapshotAutosave({
    active: state.phase === "playing",
    progressSummary: `${summary.elapsedSeconds}s · ${Math.round(state.coherence)}% coherence`,
    slug: "cognitive-dissonance",
    snapshot: state,
  });

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
            phaseLockPercent={summary.phaseLockPercent}
          />
        </>
      ) : null}

      {state.phase === "stable" ? (
        <GameOverScreen
          accent="#67e8f9"
          result={{
            milestones: ["first-stable-shift"],
            mode: state.sessionMode,
            score: summary.coherence * 100 + summary.stableMatches * 50 + summary.phaseLocks * 750,
            slug: "cognitive-dissonance",
            status: "completed",
            summary: endingCue?.statusLabel ?? `Stable ${summary.targetSeconds}s shift`,
          }}
          title={endingCue?.title ?? "Shift Stable"}
          subtitle={endingCue?.message ?? "The shift stabilized."}
          actions={<OverlayButton onClick={restart}>Run Another Shift</OverlayButton>}
        />
      ) : null}

      {state.phase === "shattered" ? (
        <GameOverScreen
          accent="#a78bfa"
          result={{
            mode: state.sessionMode,
            score:
              summary.progressPercent * 10 + summary.stableMatches * 25 + summary.phaseLocks * 250,
            slug: "cognitive-dissonance",
            status: "failed",
            summary:
              endingCue?.statusLabel ?? `Shattered at ${summary.progressPercent}% shift progress`,
          }}
          title={endingCue?.title ?? "Glass Shattered"}
          subtitle={endingCue?.message ?? "Coherence dropped to zero."}
          actions={<OverlayButton onClick={restart}>Reboot</OverlayButton>}
        />
      ) : null}

      {endingCue ? <CognitiveEndingBackdrop cue={endingCue} /> : null}
    </GameViewport>
  );
}

function resolveCognitiveStartState(mode: SessionMode, saveSlot?: GameSaveSlot): CognitiveState {
  const snapshot = saveSlot?.snapshot;
  if (isCognitiveSnapshot(snapshot)) {
    const restored = snapshot as CognitiveState;
    return {
      ...restored,
      phase: "playing",
      phaseLockPulseMs: restored.phaseLockPulseMs ?? 0,
      phaseLocks: restored.phaseLocks ?? 0,
      sessionMode: mode,
      stableHoldMs: restored.stableHoldMs ?? 0,
    };
  }

  return createInitialCognitiveState(mode, "playing");
}

function isCognitiveSnapshot(snapshot: unknown): snapshot is CognitiveState {
  const value = snapshot as Partial<CognitiveState> | undefined;
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.elapsedMs === "number" &&
      typeof value.coherence === "number" &&
      typeof value.tension === "number" &&
      typeof value.currentPattern === "string" &&
      Array.isArray(value.patterns)
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
    const fill = new THREE.PointLight("#facc15", 6, 12);
    fill.position.set(-2.6, -2.4, 4);
    scene.add(fill);

    const cabinetMaterial = new THREE.MeshStandardMaterial({
      color: "#0b1020",
      emissive: "#312e81",
      emissiveIntensity: 0.22,
      metalness: 0.55,
      roughness: 0.32,
    });
    const glassMaterial = new THREE.MeshBasicMaterial({
      color: "#67e8f9",
      opacity: 0.1,
      transparent: true,
    });
    const frameAccentMaterial = new THREE.MeshBasicMaterial({
      color: "#a78bfa",
      opacity: 0.62,
      transparent: true,
    });
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.4, 0.18), cabinetMaterial);
    backPanel.position.set(0, 0, -0.85);
    scene.add(backPanel);

    const glassPanel = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.55), glassMaterial);
    glassPanel.position.set(0, 0.05, -0.42);
    scene.add(glassPanel);

    const frameBars = [
      { id: "top", x: 0, y: 2.05, w: 6.2, h: 0.14 },
      { id: "bottom", x: 0, y: -2.05, w: 6.2, h: 0.14 },
      { id: "left", x: -3.15, y: 0, w: 0.14, h: 4.1 },
      { id: "right", x: 3.15, y: 0, w: 0.14, h: 4.1 },
    ].map((bar) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(bar.w, bar.h, 0.12), frameAccentMaterial);
      mesh.name = bar.id;
      mesh.position.set(bar.x, bar.y, -0.24);
      scene.add(mesh);
      return mesh;
    });

    const scanlineMaterial = new THREE.MeshBasicMaterial({
      color: "#67e8f9",
      opacity: 0.055,
      transparent: true,
    });
    const scanlines = Array.from({ length: 14 }, (_, index) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5.1, 0.012), scanlineMaterial);
      mesh.position.set(0, -1.55 + index * 0.24, -0.18);
      scene.add(mesh);
      return mesh;
    });

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
    const verticalRingMaterial = new THREE.MeshBasicMaterial({
      color: "#a78bfa",
      opacity: 0.32,
      transparent: true,
    });
    const verticalRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.82, 0.018, 8, 96),
      verticalRingMaterial
    );
    verticalRing.rotation.y = Math.PI / 2;
    scene.add(verticalRing);
    const phaseLockMaterial = new THREE.MeshBasicMaterial({
      color: "#facc15",
      opacity: 0,
      transparent: true,
    });
    const phaseLockRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.75, 0.055, 10, 128),
      phaseLockMaterial
    );
    phaseLockRing.rotation.x = Math.PI / 2;
    scene.add(phaseLockRing);
    const stableEndingMaterial = new THREE.MeshBasicMaterial({
      color: "#67e8f9",
      opacity: 0,
      transparent: true,
    });
    const stableEndingRings = Array.from({ length: 9 }, (_, index) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(2.95 + index * 0.16, 0.013, 8, 128),
        stableEndingMaterial
      );
      mesh.rotation.x = Math.PI / 2;
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    });
    const shardGeometry = new THREE.BufferGeometry();
    shardGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0.32, 0.08, 0, 0.06, 0.38, 0]), 3)
    );
    shardGeometry.computeVertexNormals();
    const shatterMaterial = new THREE.MeshBasicMaterial({
      color: "#fb7185",
      opacity: 0,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const shatterShards = Array.from({ length: 22 }, () => {
      const mesh = new THREE.Mesh(shardGeometry, shatterMaterial);
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    });

    const controlNodes = (["violet", "cyan", "gold"] as const).map((pattern, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: PATTERN_COLORS[pattern],
        emissive: PATTERN_COLORS[pattern],
        emissiveIntensity: 0.55,
        metalness: 0.25,
        roughness: 0.18,
      });
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 28), material);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set((index - 1) * 1.05, -1.72, 0.22);
      scene.add(mesh);
      return { material, mesh, pattern };
    });

    const rainMaterial = new THREE.LineBasicMaterial({
      color: "#a78bfa",
      opacity: 0.22,
      transparent: true,
    });
    const rainLines = Array.from({ length: 18 }, (_, index) => {
      const x = -2.55 + (index % 6) * 1.02;
      const y = 1.85 - Math.floor(index / 6) * 0.42;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, -0.05),
        new THREE.Vector3(x + 0.18, y - 0.44, -0.05),
      ]);
      const line = new THREE.Line(geometry, rainMaterial);
      scene.add(line);
      return line;
    });

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
      const cue = getCognitiveShiftCue(current);
      const endingCue =
        current.phase === "stable" || current.phase === "shattered"
          ? getCognitiveEndingCue(current)
          : undefined;
      const activeColor = PATTERN_COLORS[current.currentPattern];
      const phaseLockStrength = cue.phaseLockActive ? 1 : cue.phaseLockPercent / 100;
      const stableEndingStrength = endingCue?.tone === "stable" ? endingCue.intensity : 0;
      const shatterStrength = endingCue?.tone === "shattered" ? endingCue.intensity : 0;
      sphere.rotation.y = time * 0.18;
      sphere.rotation.x = Math.sin(time * 0.35) * 0.08;
      sphere.scale.setScalar(
        1 + current.tension * 0.0018 + phaseLockStrength * 0.035 + stableEndingStrength * 0.08
      );
      sphereMaterial.emissive.set(activeColor);
      sphereMaterial.emissiveIntensity =
        0.25 + current.coherence / 120 + stableEndingStrength * 0.42;
      cabinetMaterial.emissive.set(activeColor);
      cabinetMaterial.emissiveIntensity =
        0.08 + current.tension / 280 + stableEndingStrength * 0.18 + shatterStrength * 0.24;
      glassMaterial.color.set(activeColor);
      glassMaterial.opacity =
        0.06 + current.coherence / 900 + phaseLockStrength * 0.04 + stableEndingStrength * 0.045;
      frameAccentMaterial.color.set(cue.urgency === "high" ? "#fb7185" : activeColor);
      frameAccentMaterial.opacity = 0.35 + current.tension / 180 + shatterStrength * 0.1;
      ringMaterial.color.set(activeColor);
      ringMaterial.opacity =
        0.25 + current.coherence / 160 + phaseLockStrength * 0.16 + stableEndingStrength * 0.16;
      verticalRing.rotation.z = time * 0.12;
      verticalRingMaterial.color.set(PATTERN_COLORS[cue.nextPattern]);
      verticalRingMaterial.opacity = 0.18 + current.tension / 260;
      phaseLockRing.rotation.z = -time * 0.28;
      phaseLockRing.scale.setScalar(1 + Math.sin(time * 5) * 0.025 + phaseLockStrength * 0.08);
      phaseLockMaterial.opacity = cue.phaseLockActive ? 0.62 : cue.phaseLockPercent / 240;

      stableEndingMaterial.color.set(activeColor);
      stableEndingMaterial.opacity =
        stableEndingStrength > 0 ? 0.18 + stableEndingStrength * 0.08 : 0;
      for (let index = 0; index < stableEndingRings.length; index++) {
        const mesh = stableEndingRings[index];
        const visible = endingCue?.tone === "stable" && index < endingCue.ringCount;
        if (!mesh) continue;
        mesh.visible = visible;
        if (!visible) continue;
        mesh.rotation.z = time * (0.08 + index * 0.012);
        mesh.scale.setScalar(1 + Math.sin(time * 0.85 + index) * 0.025 + index * 0.01);
        mesh.position.z = -0.1 + index * 0.006;
      }

      shatterMaterial.color.set("#fb7185");
      shatterMaterial.opacity = shatterStrength > 0 ? 0.24 + shatterStrength * 0.18 : 0;
      for (let index = 0; index < shatterShards.length; index++) {
        const mesh = shatterShards[index];
        const visible = endingCue?.tone === "shattered" && index < endingCue.shardCount;
        if (!mesh) continue;
        mesh.visible = visible;
        if (!visible) continue;
        const angle = index * 1.91 + time * 0.18;
        const radius = 1.05 + (index % 6) * 0.34 + shatterStrength * 0.26;
        mesh.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.84) * (0.92 + (index % 4) * 0.18),
          0.2 + Math.sin(angle) * 0.38
        );
        mesh.rotation.set(time * 0.24 + index, angle, -time * 0.18 + index * 0.31);
        mesh.scale.setScalar(0.86 + (index % 5) * 0.16 + shatterStrength * 0.18);
      }

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

      for (const node of controlNodes) {
        const active = node.pattern === current.currentPattern;
        node.mesh.scale.setScalar(active ? 1.28 + phaseLockStrength * 0.18 : 0.92);
        node.material.emissiveIntensity = active ? 1.4 + phaseLockStrength : 0.42;
      }

      rainMaterial.color.set(cue.urgency === "high" ? "#fb7185" : activeColor);
      rainMaterial.opacity =
        cue.stage === "calibration"
          ? 0.08
          : cue.stage === "drift"
            ? 0.16
            : 0.24 + current.tension / 360;
      for (let index = 0; index < rainLines.length; index++) {
        const line = rainLines[index];
        line.position.y = -((time * (0.12 + current.tension / 600) + index * 0.19) % 0.9);
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      renderer.dispose();
      backPanel.geometry.dispose();
      cabinetMaterial.dispose();
      glassPanel.geometry.dispose();
      glassMaterial.dispose();
      for (const mesh of frameBars) {
        mesh.geometry.dispose();
      }
      frameAccentMaterial.dispose();
      for (const mesh of scanlines) {
        mesh.geometry.dispose();
      }
      scanlineMaterial.dispose();
      sphere.geometry.dispose();
      sphereMaterial.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      verticalRing.geometry.dispose();
      verticalRingMaterial.dispose();
      phaseLockRing.geometry.dispose();
      phaseLockMaterial.dispose();
      for (const mesh of stableEndingRings) {
        mesh.geometry.dispose();
      }
      stableEndingMaterial.dispose();
      shardGeometry.dispose();
      shatterMaterial.dispose();
      for (const node of controlNodes) {
        node.mesh.geometry.dispose();
        node.material.dispose();
      }
      for (const line of rainLines) {
        line.geometry.dispose();
      }
      rainMaterial.dispose();
      for (const mesh of patternMeshes) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="absolute inset-0" />;
}

function CognitiveEndingBackdrop({ cue }: { cue: CognitiveEndingCue }) {
  const accent = PATTERN_COLORS[cue.accentPattern];
  const rings = Array.from({ length: cue.ringCount }, (_, index) => ({
    id: `stable-ending-ring-${index + 1}`,
    inset: 14 + index * 4,
    opacity: Math.max(0.18, 0.42 - index * 0.026),
  }));
  const shards = Array.from({ length: cue.shardCount }, (_, index) => ({
    id: `shatter-ending-shard-${index + 1}`,
    left: 8 + ((index * 17) % 84),
    opacity: 0.22 + (index % 4) * 0.08,
    rotate: index * 27,
    top: 10 + ((index * 29) % 78),
  }));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-cognitive-ending={cue.tone}
      style={{
        background:
          cue.tone === "stable"
            ? `radial-gradient(circle at 50% 42%, ${accent}44, transparent 42%), radial-gradient(circle at 50% 78%, #67e8f922, transparent 34%)`
            : "radial-gradient(circle at 50% 42%, rgba(251,113,133,0.34), transparent 38%), radial-gradient(circle at 22% 18%, rgba(167,139,250,0.24), transparent 26%)",
      }}
    >
      {cue.tone === "stable"
        ? rings.map((ring) => (
            <div
              key={ring.id}
              className="absolute rounded-full border"
              style={{
                borderColor: accent,
                boxShadow: `0 0 24px ${accent}`,
                inset: `${ring.inset}%`,
                opacity: ring.opacity,
              }}
            />
          ))
        : shards.map((shard) => (
            <div
              key={shard.id}
              className="absolute h-16 w-5 border-l border-t"
              style={{
                borderColor: "#fb7185",
                boxShadow: "0 0 20px rgba(251,113,133,0.72)",
                left: `${shard.left}%`,
                opacity: shard.opacity,
                top: `${shard.top}%`,
                transform: `rotate(${shard.rotate}deg) skewY(-18deg)`,
              }}
            />
          ))}
      <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-md border border-white/16 bg-black/48 px-4 py-2 text-center font-mono text-[0.62rem] font-black uppercase tracking-[0.24em] text-white/58 backdrop-blur">
        {cue.statusLabel} · {cue.nextAction}
      </div>
    </div>
  );
}

function Hud({ state }: { state: CognitiveState }) {
  const summary = getCognitiveRunSummary(state);
  const cue = getCognitiveShiftCue(state);

  return (
    <header className="absolute inset-x-0 top-0 z-10 grid grid-cols-2 gap-2 p-3 sm:grid-cols-5 sm:p-5">
      <Metric label="Coherence" value={`${Math.round(state.coherence)}%`} accent="#67e8f9" />
      <Metric label="Tension" value={`${Math.round(state.tension)}%`} accent="#f87171" />
      <Metric label="Shift" value={`${summary.progressPercent}%`} accent="#facc15" />
      <Metric
        label="Pattern"
        value={state.currentPattern}
        accent={PATTERN_COLORS[state.currentPattern]}
      />
      <Metric label="Phase Lock" value={`${summary.phaseLockPercent}%`} accent="#facc15" />
      <div className="col-span-2 rounded-md border border-violet-200/16 bg-black/50 p-3 sm:col-span-5">
        <div className="font-mono text-[0.6rem] font-black uppercase tracking-[0.22em] text-violet-100/52">
          {cue.stageLabel} · Next {cue.nextPattern}
        </div>
        <div className="mt-1 text-sm font-bold text-violet-50">{cue.instruction}</div>
        <div className="mt-1 text-xs font-semibold text-violet-100/70">{state.lastEvent}</div>
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
  phaseLockPercent,
}: {
  active: CognitivePattern;
  onHold: (pattern: CognitivePattern) => void;
  onRelease: () => void;
  phaseLockPercent: number;
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
            boxShadow:
              active === pattern
                ? `0 0 ${14 + phaseLockPercent / 6}px ${PATTERN_COLORS[pattern]}66`
                : "0 12px 30px rgba(0,0,0,0.34)",
          }}
          onPointerDown={() => onHold(pattern)}
          onPointerLeave={onRelease}
          onPointerUp={onRelease}
        >
          <span className="block text-[0.58rem] tracking-[0.2em] text-white/52">
            {active === pattern ? "hold" : "rim"}
          </span>
          <span>{pattern}</span>
        </button>
      ))}
    </div>
  );
}
