import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import Game from "./Game";

test("Sim Soviet game renders without crashing", async () => {
  const { container } = render(<Game />);
  
  // Wait for R3F
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const canvas = container.querySelector("canvas");
  expect(canvas).toBeTruthy();

  const text = container.textContent;
  expect(text).toContain("Sim Soviet");
  expect(text).toContain("Begin the Plan");
});
