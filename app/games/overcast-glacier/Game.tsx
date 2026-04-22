import {
  CartridgeStartScreen,
  FloatingJoystick,
  GameOverScreen,
  GameViewport,
  isCabinetRuntimePaused,
  OverlayButton,
} from "@app/shared";
import {
  advanceOvercastState,
  createInitialOvercastState,
  getOvercastRunSummary,
} from "@logic/games/overcast-glacier/engine/overcastSimulation";
import type {
  OvercastControls,
  OvercastEntity,
  OvercastState,
} from "@logic/games/overcast-glacier/engine/types";
import type { SessionMode } from "@logic/shared";
import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

const laneX = {
  "-1": "23%",
  "0": "50%",
  "1": "77%",
} as const;

export default function Game() {
  const [state, setState] = useState<OvercastState>(() => createInitialOvercastState("menu"));
  const controlsRef = useRef<Partial<OvercastControls>>({});

  const start = (mode: SessionMode = state.sessionMode) => {
    controlsRef.current = {};
    setState(createInitialOvercastState("playing", mode));
  };

  useKeyboardControls(controlsRef);
  useOvercastLoop(state.phase, controlsRef, setState);
  const summary = getOvercastRunSummary(state);

  return (
    <GameViewport background="#0f172a">
      <SlopeScene state={state} />

      {state.phase === "menu" ? (
        <CartridgeStartScreen
          accent="#7dd3fc"
          cartridgeId="Slot 09"
          description="A kung-fu kitten skis a corrupted glacier, kicks snowmen, and snaps glitches."
          gameSlug="overcast-glacier"
          kicker="Glacier Cartridge"
          motif="track"
          onStart={start}
          rules={[
            "Steer across three lanes and collect cocoa before warmth drains.",
            "Kick snowmen in your lane or dodge before impact.",
            "Spend photo charges on glitches for score and control.",
          ]}
          secondaryAccent="#10b981"
          startLabel="Drop In"
          title="OVERCAST: GLACIER"
        />
      ) : null}

      {state.phase === "playing" ? <OvercastHUD state={state} controlsRef={controlsRef} /> : null}

      {state.phase === "gameover" ? (
        <GameOverScreen
          result={{
            mode: state.sessionMode,
            score: summary.score,
            slug: "overcast-glacier",
            status: "failed",
            summary: `Frozen in segment ${summary.segment}`,
          }}
          title="FROST CURSE"
          subtitle={`Segment ${summary.segment}/${summary.targetSegments}. Score ${summary.score}. Cocoa and clean kicks keep warmth recoverable.`}
          actions={<OverlayButton onClick={() => start(state.sessionMode)}>Warm Up</OverlayButton>}
          accent="#7dd3fc"
        />
      ) : null}

      {state.phase === "finished" ? (
        <GameOverScreen
          result={{
            milestones: ["first-glacier-clear"],
            mode: state.sessionMode,
            score: summary.score,
            slug: "overcast-glacier",
            status: "completed",
            summary: `Cleared ${summary.segmentsCleared} glacier segments`,
          }}
          title="GLACIER CLEARED"
          subtitle={`${summary.segmentsCleared} segments, ${summary.score} points, ${summary.warmth}% warmth remaining.`}
          actions={
            <OverlayButton onClick={() => start(state.sessionMode)}>
              Run Another Route
            </OverlayButton>
          }
          accent="#7dd3fc"
        />
      ) : null}
    </GameViewport>
  );
}

function useOvercastLoop(
  phase: OvercastState["phase"],
  controlsRef: MutableRefObject<Partial<OvercastControls>>,
  setState: Dispatch<SetStateAction<OvercastState>>
) {
  useEffect(() => {
    if (phase !== "playing") {
      return undefined;
    }

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(64, now - last);
      last = now;
      if (isCabinetRuntimePaused()) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const controlsSnapshot = { ...controlsRef.current };
      controlsRef.current = {
        ...controlsRef.current,
        kick: false,
        photo: false,
      };
      setState((current) => advanceOvercastState(current, delta, controlsSnapshot));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [controlsRef, phase, setState]);
}

function useKeyboardControls(controlsRef: MutableRefObject<Partial<OvercastControls>>) {
  useEffect(() => {
    const setSteer = (value: number) => {
      controlsRef.current = { ...controlsRef.current, steer: value };
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") setSteer(-1);
      if (event.code === "ArrowRight" || event.code === "KeyD") setSteer(1);
      if (event.code === "KeyX" || event.code === "Space") {
        controlsRef.current = { ...controlsRef.current, kick: true };
      }
      if (event.code === "KeyP") {
        controlsRef.current = { ...controlsRef.current, photo: true };
      }
    };
    const keyup = (event: KeyboardEvent) => {
      if (
        event.code === "ArrowLeft" ||
        event.code === "ArrowRight" ||
        event.code === "KeyA" ||
        event.code === "KeyD"
      ) {
        setSteer(0);
      }
    };

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [controlsRef]);
}

function SlopeScene({ state }: { state: OvercastState }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 8%, rgba(125,211,252,0.35), transparent 32%), linear-gradient(180deg, #111827 0%, #1e3a8a 38%, #e0f2fe 100%)",
      }}
    >
      <Snow />
      <div
        style={{
          position: "absolute",
          insetInline: "8%",
          bottom: "-12%",
          height: "102%",
          clipPath: "polygon(44% 0, 56% 0, 98% 100%, 2% 100%)",
          background:
            "repeating-linear-gradient(90deg, rgba(15,23,42,0.18) 0 2px, transparent 2px 16%), linear-gradient(180deg, rgba(248,250,252,0.58), rgba(125,211,252,0.42) 48%, rgba(248,250,252,0.96))",
          boxShadow: "inset 0 0 80px rgba(14,165,233,0.32)",
        }}
      />
      {[-1, 0, 1].map((lane) => (
        <div
          key={lane}
          style={{
            position: "absolute",
            left: laneX[String(lane) as keyof typeof laneX],
            top: "18%",
            bottom: "-8%",
            width: 2,
            transform: "translateX(-50%) perspective(480px) rotateX(62deg)",
            transformOrigin: "bottom",
            background: "linear-gradient(180deg, transparent, rgba(16,185,129,0.45))",
            boxShadow: "0 0 16px rgba(16,185,129,0.42)",
          }}
        />
      ))}
      {state.entities.map((entity) => (
        <SlopeEntity key={entity.id} entity={entity} />
      ))}
      <Player lane={state.playerLane} event={state.lastEvent} />
    </div>
  );
}

function OvercastHUD({
  state,
  controlsRef,
}: {
  state: OvercastState;
  controlsRef: MutableRefObject<Partial<OvercastControls>>;
}) {
  const setControls = (patch: Partial<OvercastControls>) => {
    controlsRef.current = { ...controlsRef.current, ...patch };
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        padding: "clamp(0.75rem, 2vw, 1rem)",
        pointerEvents: "none",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <FloatingJoystick
        accent="#7dd3fc"
        label="Overcast steering joystick"
        onChange={(vector) => setControls({ steer: vector.x })}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, max-content))",
          justifyContent: "space-between",
          gap: "0.5rem",
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        <Metric label="Warmth" value={`${Math.round(state.warmth)}%`} accent="#7dd3fc" />
        <Metric label="Score" value={state.score.toString()} accent="#f8fafc" />
        <Metric label="Combo" value={`x${state.combo}`} accent="#10b981" />
        <Metric label="Photo" value={state.photoCharges.toString()} accent="#facc15" />
      </div>

      <div />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "0.75rem",
          alignItems: "end",
        }}
      >
        <div
          style={{
            maxWidth: 560,
            border: "1px solid rgba(125,211,252,0.42)",
            background: "rgba(15,23,42,0.72)",
            borderRadius: 8,
            padding: "0.75rem 0.85rem",
            boxShadow: "0 16px 42px rgba(15,23,42,0.34)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ color: "#bfdbfe", fontSize: 12, fontWeight: 800 }}>{state.objective}</div>
          <div
            style={{
              height: 7,
              marginTop: 8,
              overflow: "hidden",
              borderRadius: 999,
              background: "rgba(15,23,42,0.84)",
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(100, state.warmth))}%`,
                height: "100%",
                background: "linear-gradient(90deg, #ef4444, #facc15, #7dd3fc)",
              }}
            />
          </div>
        </div>

        <div className="pointer-events-auto" style={{ display: "flex", gap: 8 }}>
          <ActionButton
            label="Kick snowman"
            text="KICK"
            onPress={() => setControls({ kick: true })}
          />
          <ActionButton
            label="Photograph glitch"
            text="PHOTO"
            onPress={() => setControls({ photo: true })}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        minWidth: 86,
        border: `1px solid ${accent}66`,
        background: "rgba(15,23,42,0.68)",
        borderRadius: 8,
        padding: "0.55rem 0.65rem",
        boxShadow: `0 0 22px ${accent}24`,
      }}
    >
      <div style={{ color: "#cbd5e1", fontSize: 10 }}>{label}</div>
      <div style={{ color: accent, fontSize: 18, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function ActionButton({
  label,
  text,
  onPress,
}: {
  label: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(event) => {
        event.preventDefault();
        onPress();
      }}
      style={{
        minWidth: 66,
        height: 48,
        border: "1px solid rgba(125,211,252,0.7)",
        borderRadius: 8,
        background: "rgba(14,165,233,0.24)",
        color: "#eff6ff",
        fontSize: 12,
        fontWeight: 900,
        cursor: "pointer",
        boxShadow: "0 0 18px rgba(125,211,252,0.22)",
      }}
    >
      {text}
    </button>
  );
}

function SlopeEntity({ entity }: { entity: OvercastEntity }) {
  const top = `${Math.max(10, Math.min(88, 94 - entity.distance * 0.68))}%`;
  const scale = 0.42 + (120 - entity.distance) / 155;
  const color =
    entity.kind === "cocoa" ? "#8b4513" : entity.kind === "glitch" ? "#10b981" : "#f8fafc";

  return (
    <div
      style={{
        position: "absolute",
        left: laneX[String(entity.lane) as keyof typeof laneX],
        top,
        width: 52,
        height: 52,
        transform: `translate(-50%, -50%) scale(${Math.max(0.42, scale)})`,
        display: "grid",
        placeItems: "center",
        filter: `drop-shadow(0 0 16px ${color})`,
      }}
    >
      <div
        style={{
          width: entity.kind === "snowman" ? 42 : 34,
          height: entity.kind === "snowman" ? 42 : 34,
          borderRadius: entity.kind === "glitch" ? 4 : "50%",
          background:
            entity.kind === "glitch"
              ? "repeating-linear-gradient(45deg, #10b981 0 4px, #052e16 4px 8px)"
              : color,
          border: "2px solid rgba(255,255,255,0.72)",
          boxShadow: entity.kind === "cocoa" ? "inset 0 0 0 8px #5f2d10" : undefined,
        }}
      />
    </div>
  );
}

function Player({ lane, event }: { lane: -1 | 0 | 1; event: string }) {
  const eventColor = event === "hit" || event === "glitch" ? "#ef4444" : "#7dd3fc";

  return (
    <div
      style={{
        position: "absolute",
        left: laneX[String(lane) as keyof typeof laneX],
        bottom: "12%",
        width: 72,
        height: 92,
        transform: "translateX(-50%)",
        display: "grid",
        placeItems: "end center",
        transition: "left 160ms ease-out",
        filter: `drop-shadow(0 0 18px ${eventColor})`,
      }}
    >
      <div
        style={{
          width: 42,
          height: 46,
          borderRadius: "48% 48% 42% 42%",
          background: "linear-gradient(180deg, #f8fafc, #94a3b8)",
          border: "2px solid #0f172a",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: 68,
          height: 12,
          borderRadius: 999,
          background: "#0f172a",
          boxShadow: "0 0 12px rgba(15,23,42,0.8)",
        }}
      />
    </div>
  );
}

function Snow() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 14% 16%, rgba(255,255,255,0.85) 0 1px, transparent 2px), radial-gradient(circle at 72% 22%, rgba(255,255,255,0.75) 0 1px, transparent 2px), radial-gradient(circle at 42% 44%, rgba(255,255,255,0.65) 0 1px, transparent 2px), radial-gradient(circle at 84% 62%, rgba(255,255,255,0.75) 0 1px, transparent 2px)",
        backgroundSize: "180px 180px",
        opacity: 0.78,
      }}
    />
  );
}
