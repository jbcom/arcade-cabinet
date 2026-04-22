import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
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
      gameSlug: "entropy-edge" as const,
      onStart,
      startLabel: "Start Test",
      title: "TEST CARTRIDGE",
    };

    const { rerender } = render(<CartridgeStartScreen {...props} />);

    await userEvent.click(page.getByText("Challenge"));
    await userEvent.click(page.getByText("Start Test"));

    expect(onStart).toHaveBeenCalledWith("challenge");
    expect(localStorage.getItem("arcade-cabinet:v1:progress:entropy-edge")).toContain(
      '"lastSelectedMode":"challenge"'
    );

    rerender(<CartridgeStartScreen {...props} />);

    await expect.element(page.getByText("Resume Challenge Run")).toBeVisible();
  });
});
