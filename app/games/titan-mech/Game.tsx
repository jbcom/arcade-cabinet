import {
  browserTestCanvasGlOptions,
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
  useRunSnapshotAutosave,
} from "@app/shared";
import {
  applyTitanUpgrade,
  calculateTitanContractCue,
  calculateTitanDeliveryCue,
  calculateTitanThreatCue,
  createInitialTitanState,
  getTitanRunSummary,
} from "@logic/games/titan-mech/engine/titanSimulation";
import type { TitanUpgradeId } from "@logic/games/titan-mech/engine/types";
import { TitanTrait } from "@logic/games/titan-mech/store/traits";
import { titanEntity, titanWorld } from "@logic/games/titan-mech/store/world";
import type { GameSaveSlot, SessionMode } from "@logic/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { World } from "./r3f/World";
import { HUD } from "./ui/HUD";

function TitanApp() {
  const state = useTrait(titanEntity, TitanTrait);
  const phase =
    (useTrait(titanEntity, PhaseTrait) as { phase: string } | undefined)?.phase ?? "menu";
  const summary = getTitanRunSummary(state);

  const handleStart = (mode: SessionMode, saveSlot?: GameSaveSlot) => {
    const next = resolveTitanStartState(mode, saveSlot);
    titanEntity.set(PhaseTrait, { phase: "playing" });
    titanEntity.set(TitanTrait, next);
  };

  const handleUpgrade = (upgradeId: TitanUpgradeId) => {
    const next = applyTitanUpgrade(state, upgradeId);
    titanEntity.set(PhaseTrait, { phase: "playing" });
    titanEntity.set(TitanTrait, next);
  };

  useRunSnapshotAutosave({
    active: phase === "playing",
    progressSummary: `${summary.credits} credits · ${summary.hp} HP`,
    slug: "titan-mech",
    snapshot: state,
  });

  return (
    <GameViewport background="#0b0f14" data-browser-screenshot-mode="page">
      <Canvas shadows camera={{ fov: 48, position: [0, 20, -42] }} gl={browserTestCanvasGlOptions}>
        {phase === "playing" && <World />}
      </Canvas>

      {phase === "menu" && (
        <CartridgeStartScreen
          accent="#f43f5e"
          cartridgeId="Slot 08"
          description="Pilot a heat-stressed extraction titan through ore pylons and reactor pressure."
          gameSlug="titan-mech"
          kicker="Overheat Cartridge"
          motif="mech"
          onStart={handleStart}
          rules={[
            "Enter pylon rings and hold extractor to grind ore into the hopper.",
            "Full hoppers eject into credits and scrap while heat spikes climb.",
            "Use coolant, movement, and weapons to keep the chassis online.",
          ]}
          secondaryAccent="#f59e0b"
          startLabel="Engage Chassis"
          title="TITAN MECH: OVERHEAT"
        />
      )}

      {phase === "playing" && <HUD />}

      {phase === "gameover" && (
        <GameOverScreen
          result={{
            mode: state.sessionMode,
            score: summary.score,
            slug: "titan-mech",
            status: "failed",
            summary: `Chassis destroyed with ${summary.credits} credits`,
          }}
          title="CHASSIS DESTROYED"
          subtitle={`Final Scrap: ${summary.scrap}. Credits ${summary.credits}/${summary.contractCreditsTarget}. Heat discipline keeps the contract recoverable.`}
          actions={
            <OverlayButton onClick={() => handleStart(state.sessionMode)}>Reboot OS</OverlayButton>
          }
        />
      )}

      {phase === "upgrade" && (
        <GameOverScreen
          result={{
            milestones: ["first-contract-extracted"],
            mode: state.sessionMode,
            score: summary.score,
            slug: "titan-mech",
            status: "completed",
            summary: `Extracted ${summary.credits} credits`,
          }}
          title="CONTRACT EXTRACTED"
          subtitle={`Contract ${summary.contractNumber} banked: ${summary.credits}/${summary.contractCreditsTarget} credits, ${summary.scrap} scrap, ${summary.rareIsotopes} rare isotopes. Install one chassis upgrade before the next extraction.`}
          actions={
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {state.pendingUpgrades.map((upgrade) => (
                <OverlayButton
                  key={upgrade.id}
                  aria-label={`Install ${upgrade.title}`}
                  onClick={() => handleUpgrade(upgrade.id)}
                  style={{
                    borderColor: upgrade.accent,
                    boxShadow: `0 0 18px ${upgrade.accent}55`,
                    maxWidth: 230,
                    textAlign: "left",
                  }}
                >
                  <span style={{ display: "block", fontSize: 13, fontWeight: 900 }}>
                    {upgrade.title}
                  </span>
                  <span style={{ display: "block", fontSize: 11, lineHeight: 1.25, opacity: 0.82 }}>
                    {upgrade.effects.join(" / ")}
                  </span>
                </OverlayButton>
              ))}
            </div>
          }
        />
      )}
    </GameViewport>
  );
}

function resolveTitanStartState(mode: SessionMode, saveSlot?: GameSaveSlot) {
  const snapshot = saveSlot?.snapshot;
  if (isTitanSnapshot(snapshot)) {
    const restored = snapshot as ReturnType<typeof createInitialTitanState>;
    const extraction = {
      ...restored.extraction,
      lastPayoutMs: restored.extraction.lastPayoutMs ?? 0,
    };
    return {
      ...restored,
      extraction,
      phase: "playing" as const,
      sessionMode: mode,
      contractCue:
        restored.contractCue ??
        calculateTitanContractCue({
          extraction,
          heat: restored.heat,
          objectiveProgress: restored.objectiveProgress,
          position: restored.pose.position,
        }),
      deliveryCue:
        restored.deliveryCue ??
        calculateTitanDeliveryCue({
          extraction,
          phase: "playing",
        }),
      threatCue: restored.threatCue ?? calculateTitanThreatCue(restored.pose.position),
      contractNumber: restored.contractNumber ?? 1,
      elapsedMs: restored.elapsedMs ?? 0,
      lastThreatEventMs: restored.lastThreatEventMs ?? 0,
      pendingUpgrades: restored.pendingUpgrades ?? [],
      upgrades: restored.upgrades ?? [],
    };
  }

  return createInitialTitanState("playing", mode);
}

function isTitanSnapshot(
  snapshot: unknown
): snapshot is ReturnType<typeof createInitialTitanState> {
  const value = snapshot as Partial<ReturnType<typeof createInitialTitanState>> | undefined;
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.hp === "number" &&
      typeof value.heat === "number" &&
      typeof value.energy === "number" &&
      typeof value.score === "number" &&
      value.pose &&
      typeof value.pose === "object" &&
      value.extraction &&
      typeof value.extraction === "object"
  );
}

export default function Game() {
  return (
    <WorldProvider world={titanWorld}>
      <TitanApp />
    </WorldProvider>
  );
}
