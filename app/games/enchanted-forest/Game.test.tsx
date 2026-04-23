import { verifyBrowserGameStartFlow } from "@app/test/browserGameHarness";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Enchanted Forest reaches gameplay from the start screen", async () => {
  const { rootElement } = await verifyBrowserGameStartFlow({
    Component: Game,
    title: "START",
    startFlow: ["START"],
    ready: /GROVE CHORUS/,
  });

  expect(rootElement.textContent).toContain("Listening Grove");
});
