import {
  createActiveSaveSlot,
  createEmptyProgress,
  createGameResult,
  type GameProgress,
  type GameResult,
  type GameRunStatus,
  type GameSaveSlot,
  type GameSettings,
  type LaunchGameSlug,
  markProgressStarted,
  normalizeGameProgress,
  normalizeGameSaveSlot,
  normalizeGameSettings,
  normalizeSessionMode,
  recordGameResult,
  type SerializableValue,
  type SessionMode,
  updateActiveSaveSlot,
} from "@logic/shared";
import { useCallback, useEffect, useState } from "react";

const SETTINGS_KEY = "arcade-cabinet:v1:settings";
const PROGRESS_PREFIX = "arcade-cabinet:v1:progress:";
const SAVE_PREFIX = "arcade-cabinet:v1:save:";

export interface FinishGameRunInput {
  mode: SessionMode;
  status: Exclude<GameRunStatus, "active">;
  score: number;
  summary?: string;
  stats?: Record<string, number | string | boolean>;
  milestones?: readonly string[];
  now?: Date;
}

export interface AbandonGameRunInput {
  mode?: SessionMode;
  score?: number;
  summary?: string;
  stats?: Record<string, number | string | boolean>;
  milestones?: readonly string[];
  now?: Date;
}

export interface UpdateGameRunInput {
  label?: string;
  mode?: SessionMode;
  progressSummary?: string;
  snapshot?: SerializableValue;
}

export function readCabinetSettings(storage = getStorage()): GameSettings {
  return normalizeGameSettings(readJson<GameSettings>(SETTINGS_KEY, storage));
}

export function writeCabinetSettings(settings: GameSettings, storage = getStorage()) {
  writeJson(SETTINGS_KEY, normalizeGameSettings(settings), storage);
}

export function readGameProgress(slug: LaunchGameSlug, storage = getStorage()): GameProgress {
  return normalizeGameProgress(slug, readJson<GameProgress>(progressKey(slug), storage));
}

export function writeGameProgress(progress: GameProgress, storage = getStorage()) {
  writeJson(progressKey(progress.slug), normalizeGameProgress(progress.slug, progress), storage);
}

export function readGameSaveSlot(
  slug: LaunchGameSlug,
  storage = getStorage()
): GameSaveSlot | undefined {
  return normalizeGameSaveSlot(slug, readJson<GameSaveSlot>(saveKey(slug), storage));
}

export function writeGameSaveSlot(slot: GameSaveSlot, storage = getStorage()) {
  writeJson(saveKey(slot.slug), normalizeGameSaveSlot(slot.slug, slot), storage);
}

export function clearGameSaveSlot(slug: LaunchGameSlug, storage = getStorage()) {
  try {
    storage?.removeItem(saveKey(slug));
  } catch {
    return;
  }
}

export function updateGameRun(
  slug: LaunchGameSlug,
  patch: UpdateGameRunInput,
  storage = getStorage()
): GameSaveSlot | undefined {
  const slot = readGameSaveSlot(slug, storage);
  if (!slot) return undefined;

  const next = updateActiveSaveSlot(slot, patch);
  writeGameSaveSlot(next, storage);
  return next;
}

export function beginGameRun(
  slug: LaunchGameSlug,
  mode: SessionMode,
  options: { label?: string; progressSummary?: string; snapshot?: SerializableValue } = {},
  storage = getStorage()
) {
  const normalizedMode = normalizeSessionMode(mode);
  const progress = markProgressStarted(
    readGameProgress(slug, storage) ?? createEmptyProgress(slug, normalizedMode),
    normalizedMode
  );
  const slot = createActiveSaveSlot({
    label: options.label ?? `Resume ${modeLabel(normalizedMode)} Run`,
    mode: normalizedMode,
    progressSummary: options.progressSummary ?? modeLabel(normalizedMode),
    slug,
    snapshot: options.snapshot,
  });

  writeGameProgress(progress, storage);
  writeGameSaveSlot(slot, storage);

  return { progress, slot };
}

export function finishGameRun(
  slug: LaunchGameSlug,
  input: FinishGameRunInput,
  storage = getStorage()
): { progress: GameProgress; result: GameResult } {
  const saveSlot = readGameSaveSlot(slug, storage);
  const progress = readGameProgress(slug, storage) ?? createEmptyProgress(slug, input.mode);
  const now = input.now ?? new Date();
  const result = createGameResult({
    endedAt: now,
    mode: input.mode,
    score: input.score,
    slug,
    startedAt: saveSlot?.startedAt ?? now,
    status: input.status,
    summary: input.summary,
    stats: input.stats,
  });
  const nextProgress = recordGameResult(progress, result, input.milestones ?? []);

  writeGameProgress(nextProgress, storage);
  clearGameSaveSlot(slug, storage);

  return { progress: nextProgress, result };
}

export function abandonGameRun(
  slug: LaunchGameSlug,
  input: AbandonGameRunInput = {},
  storage = getStorage()
): { progress: GameProgress; result: GameResult } | undefined {
  const saveSlot = readGameSaveSlot(slug, storage);
  if (!saveSlot) {
    clearGameSaveSlot(slug, storage);
    return undefined;
  }

  return finishGameRun(
    slug,
    {
      milestones: input.milestones,
      mode: input.mode ?? saveSlot.mode,
      now: input.now,
      score: input.score ?? 0,
      stats: input.stats,
      status: "abandoned",
      summary: input.summary,
    },
    storage
  );
}

export function useCabinetRuntime(slug?: LaunchGameSlug) {
  const [settings, setSettingsState] = useState<GameSettings>(() => readCabinetSettings());
  const [progress, setProgressState] = useState<GameProgress | undefined>(() =>
    slug ? readGameProgress(slug) : undefined
  );
  const [saveSlot, setSaveSlotState] = useState<GameSaveSlot | undefined>(() =>
    slug ? readGameSaveSlot(slug) : undefined
  );

  useEffect(() => {
    setSettingsState(readCabinetSettings());
    setProgressState(slug ? readGameProgress(slug) : undefined);
    setSaveSlotState(slug ? readGameSaveSlot(slug) : undefined);
  }, [slug]);

  const setSettings = useCallback(
    (next: GameSettings | ((current: GameSettings) => GameSettings)) => {
      setSettingsState((current) => {
        const resolved = normalizeGameSettings(typeof next === "function" ? next(current) : next);
        writeCabinetSettings(resolved);
        applySettingsToDocument(resolved);
        return resolved;
      });
    },
    []
  );

  const setProgress = useCallback(
    (next: GameProgress | ((current: GameProgress) => GameProgress)) => {
      if (!slug) return;

      setProgressState((current) => {
        const resolved = normalizeGameProgress(
          slug,
          typeof next === "function" ? next(current ?? createEmptyProgress(slug)) : next
        );
        writeGameProgress(resolved);
        return resolved;
      });
    },
    [slug]
  );

  const beginRun = useCallback(
    (
      mode: SessionMode,
      options: { label?: string; progressSummary?: string; snapshot?: SerializableValue } = {}
    ) => {
      if (!slug) return undefined;
      const result = beginGameRun(slug, mode, options);
      setProgressState(result.progress);
      setSaveSlotState(result.slot);
      return result;
    },
    [slug]
  );

  const saveRun = useCallback((slot: GameSaveSlot) => {
    writeGameSaveSlot(slot);
    setSaveSlotState(slot);
  }, []);

  const updateRun = useCallback(
    (patch: UpdateGameRunInput) => {
      if (!slug) return undefined;
      const slot = updateGameRun(slug, patch);
      if (slot) setSaveSlotState(slot);
      return slot;
    },
    [slug]
  );

  const clearRun = useCallback(() => {
    if (!slug) return;
    clearGameSaveSlot(slug);
    setSaveSlotState(undefined);
  }, [slug]);

  const finishRun = useCallback(
    (input: FinishGameRunInput) => {
      if (!slug) return undefined;
      const result = finishGameRun(slug, input);
      setProgressState(result.progress);
      setSaveSlotState(undefined);
      return result;
    },
    [slug]
  );

  const abandonRun = useCallback(
    (input: AbandonGameRunInput = {}) => {
      if (!slug) return undefined;
      const result = abandonGameRun(slug, input);
      if (result) setProgressState(result.progress);
      setSaveSlotState(undefined);
      return result;
    },
    [slug]
  );

  return {
    abandonRun,
    beginRun,
    clearRun,
    finishRun,
    progress,
    saveRun,
    saveSlot,
    setProgress,
    setSettings,
    settings,
    updateRun,
  };
}

export function applySettingsToDocument(settings = readCabinetSettings()) {
  if (typeof document === "undefined") return;

  const normalized = normalizeGameSettings(settings);
  document.documentElement.dataset.reducedMotion = String(normalized.reducedMotion);
  document.documentElement.dataset.graphicsQuality = normalized.graphicsQuality;
  document.documentElement.dataset.handedness = normalized.handedness;
  document.documentElement.style.setProperty("--cabinet-text-scale", String(normalized.textScale));
  document.documentElement.style.setProperty(
    "--cabinet-joystick-sensitivity",
    String(normalized.joystickSensitivity)
  );
}

function readJson<T>(key: string, storage: Storage | undefined): Partial<T> | undefined {
  try {
    const raw = storage?.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as Partial<T>;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown, storage: Storage | undefined) {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function getStorage() {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function progressKey(slug: LaunchGameSlug) {
  return `${PROGRESS_PREFIX}${slug}`;
}

function saveKey(slug: LaunchGameSlug) {
  return `${SAVE_PREFIX}${slug}`;
}

function modeLabel(mode: SessionMode) {
  return mode[0].toUpperCase() + mode.slice(1);
}
