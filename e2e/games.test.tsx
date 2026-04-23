import { describe, test } from "vitest";

describe("browser game e2e flows", () => {
  test.skip("all games have been extracted to standalone repos", () => {
    // Every game that used to live in this cabinet now has its own
    // repo under `arcade-cabinet/<slug>`. The e2e journey tests
    // moved with each game to its upstream repo's own harness.
  });
});
