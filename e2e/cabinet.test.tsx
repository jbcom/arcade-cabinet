import ArcadeApp from "@app/arcade/App";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";

const cabinetViewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  document.getElementById("cabinet-viewport-clip")?.remove();
  cleanup();
});

describe("cabinet landing visual captures", () => {
  test("captures the cabinet hero and game gallery without internal spec sections", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ArcadeApp />
      </MemoryRouter>
    );

    await expect.element(page.getByRole("heading", { name: "ARCADE" })).toBeVisible();
    await expect.element(page.getByText("Choose A World")).toBeVisible();
    expect(document.body.textContent).not.toContain("Built on Modern Primitives");

    for (const viewport of cabinetViewports) {
      await page.viewport(viewport.width, viewport.height);
      window.scrollTo(0, 0);
      await new Promise((resolve) => window.setTimeout(resolve, 260));
      await captureCabinetScreenshot(`test-screenshots/cabinet/home-${viewport.name}.png`);

      document.getElementById("library")?.scrollIntoView();
      await new Promise((resolve) => window.setTimeout(resolve, 420));
      const screenshot = await captureCabinetScreenshot(
        `test-screenshots/cabinet/gallery-${viewport.name}.png`
      );
      expect(screenshot.base64.length).toBeGreaterThan(5_000);
    }
  });
});

describe("cabinet runtime shell", () => {
  test("game routes expose pause, settings, rules, and local settings persistence", async () => {
    render(
      <MemoryRouter initialEntries={["/games/mega-track"]}>
        <ArcadeApp />
      </MemoryRouter>
    );

    await expect.element(page.getByTestId("cabinet-menu-button")).toBeVisible();
    await userEvent.click(page.getByTestId("cabinet-menu-button"));
    await expect.element(page.getByTestId("cabinet-pause-menu")).toBeVisible();

    await userEvent.click(page.getByText("Settings"));
    await expect.element(page.getByTestId("cabinet-settings-panel")).toBeVisible();
    await userEvent.click(page.getByText("Reduced Motion"));

    expect(localStorage.getItem("arcade-cabinet:v1:settings")).toContain('"reducedMotion":true');

    await userEvent.click(page.getByText("Back"));
    await userEvent.click(
      page.getByTestId("cabinet-pause-menu").getByRole("button", { name: "Rules" })
    );
    await expect.element(page.getByText(/Run a three-leg cup/)).toBeVisible();
  });

  test("unknown routes fall back to the cabinet", async () => {
    render(
      <MemoryRouter initialEntries={["/does-not-exist"]}>
        <ArcadeApp />
      </MemoryRouter>
    );

    await expect.element(page.getByRole("heading", { name: "ARCADE" })).toBeVisible();
  });
});

async function captureCabinetScreenshot(path: string) {
  const clipElement = getViewportClipElement();
  return page.screenshot({
    base64: true,
    element: clipElement,
    path: `../${path}`,
  });
}

function getViewportClipElement() {
  const existing = document.getElementById("cabinet-viewport-clip");
  if (existing) return existing;

  const clipElement = document.createElement("div");
  clipElement.id = "cabinet-viewport-clip";
  clipElement.setAttribute("aria-hidden", "true");
  Object.assign(clipElement.style, {
    inset: "0",
    pointerEvents: "none",
    position: "fixed",
    zIndex: "2147483647",
  });
  document.body.appendChild(clipElement);
  return clipElement;
}
