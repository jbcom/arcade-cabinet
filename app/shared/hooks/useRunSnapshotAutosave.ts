import type { LaunchGameSlug, SerializableValue } from "@logic/shared";
import { useCallback, useEffect, useRef } from "react";
import { useCabinetRuntime } from "./useCabinetRuntime";

interface RunSnapshotAutosaveOptions {
  active: boolean;
  intervalMs?: number;
  progressSummary: string;
  slug: LaunchGameSlug;
  snapshot: unknown;
}

interface LatestRunSnapshot {
  active: boolean;
  progressSummary: string;
  snapshot: unknown;
}

export function useRunSnapshotAutosave({
  active,
  intervalMs = 2_500,
  progressSummary,
  slug,
  snapshot,
}: RunSnapshotAutosaveOptions) {
  const { updateRun } = useCabinetRuntime(slug);
  const latestRef = useRef<LatestRunSnapshot>({ active, progressSummary, snapshot });

  useEffect(() => {
    latestRef.current = { active, progressSummary, snapshot };
  }, [active, progressSummary, snapshot]);

  const writeLatest = useCallback(() => {
    const latest = latestRef.current;
    if (!latest.active) return;

    const serializable = cloneSerializableSnapshot(latest.snapshot);
    if (serializable === undefined) return;

    updateRun({
      progressSummary: latest.progressSummary,
      snapshot: serializable,
    });
  }, [updateRun]);

  useEffect(() => {
    if (!active) return undefined;

    const initial = window.setTimeout(writeLatest, 400);
    const interval = window.setInterval(writeLatest, intervalMs);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      writeLatest();
    };
  }, [active, intervalMs, writeLatest]);
}

function cloneSerializableSnapshot(value: unknown): SerializableValue | undefined {
  if (value === undefined) return undefined;

  try {
    return JSON.parse(JSON.stringify(value)) as SerializableValue;
  } catch {
    return undefined;
  }
}
