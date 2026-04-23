import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { beginGameRun } from "../hooks/useCabinetRuntime";
import { CartridgeStartScreen } from "./Cartridge";

describe("CartridgeStartScreen runtime integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("persists selected session mode and exposes resume after a run starts", async () => {
    const onStart = vi.fn();

    const props = {
      accent: "#38bdf8",
      description: "Test cartridge",
      gameSlug: "mega-track" as const,
      onStart,
      startLabel: "Start Test",
      title: "TEST CARTRIDGE",
    };

    const { rerender } = render(<CartridgeStartScreen {...props} />);

    await userEvent.click(page.getByText("Challenge"));
    await userEvent.click(page.getByText("Start Test"));

    expect(onStart).toHaveBeenCalledWith("challenge");
    expect(localStorage.getItem("arcade-cabinet:v1:progress:mega-track")).toContain(
      '"lastSelectedMode":"challenge"'
    );

    rerender(<CartridgeStartScreen {...props} />);

    await expect.element(page.getByText("Resume Challenge Run")).toBeVisible();
  });

  test("passes active save slot snapshots through the load action", async () => {
    beginGameRun("farm-follies", "cozy", {
      label: "Resume Farm Tower",
      progressSummary: "Tier 4 tower",
      snapshot: { dropCount: 12, phase: "playing" },
    });

    const onStart = vi.fn();
    render(
      <CartridgeStartScreen
        accent="#84cc16"
        description="Test cartridge"
        gameSlug="farm-follies"
        onStart={onStart}
        startLabel="Start Farm"
        title="FARM TEST"
      />
    );

    await userEvent.click(page.getByText("Resume Farm Tower"));

    expect(onStart).toHaveBeenCalledWith(
      "cozy",
      expect.objectContaining({
        mode: "cozy",
        snapshot: { dropCount: 12, phase: "playing" },
      })
    );
  });
});
