import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { beginGameRun, readGameProgress, readGameSaveSlot } from "../hooks/useCabinetRuntime";
import { GameOverScreen } from "./atoms";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

test("GameOverScreen records the run result and clears the resume slot", async () => {
  beginGameRun("mega-track", "challenge", {
    progressSummary: "Leg 3",
    snapshot: { integrity: 62 },
  });

  render(
    <GameOverScreen
      result={{
        milestones: ["first-cup"],
        mode: "challenge",
        score: 8800,
        slug: "mega-track",
        status: "completed",
        summary: "Cup cleared",
      }}
      subtitle="Cup cleared"
      title="Cup Complete"
    />
  );

  await waitFor(() => {
    expect(readGameSaveSlot("mega-track")).toBeUndefined();
    expect(readGameProgress("mega-track")).toMatchObject({
      bestScore: 8800,
      lastResult: {
        score: 8800,
        status: "completed",
        summary: "Cup cleared",
      },
      sessionsCompleted: 1,
      sessionsStarted: 1,
    });
  });
});
