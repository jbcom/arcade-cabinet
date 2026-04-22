import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import Game from "./Game";

test("Gridizen game renders without crashing", async () => {
  const { container } = render(<Game />);

  // Wait for R3F to mount
  await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = container.querySelector("canvas");
  expect(canvas).toBeTruthy();

  const text = container.textContent;
  expect(text).toContain("Gridizen");
  expect(text).toContain("Found a Settlement");
});
