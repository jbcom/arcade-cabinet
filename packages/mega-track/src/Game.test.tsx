import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import Game from "./Game";

test("Mega Track game renders without crashing", async () => {
  const { container } = render(<Game />);
  
  // Wait a bit for R3F to initialize
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Check for the canvas
  const canvas = container.querySelector("canvas");
  expect(canvas).toBeTruthy();

  // Verify the start screen is visible
  const startScreen = container.textContent;
  expect(startScreen).toContain("Mega Track");
  expect(startScreen).toContain("Start Race");
});
