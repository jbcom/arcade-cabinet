import { cleanup } from "@testing-library/react";
import { afterEach, test } from "vitest";
import { verifyBrowserGameStartFlow } from "../../../src/test/browserGameHarness";
import Game from "./Game";

afterEach(() => {
  cleanup();
});

test("Realmwalker reaches gameplay from the start screen", async () => {
  await verifyBrowserGameStartFlow({
    Component: Game,
    title: "REALMWALKER",
    startFlow: ["Enter the Shifting Realm"],
    ready: "VITALITY",
    expectsCanvas: true,
  });
});
