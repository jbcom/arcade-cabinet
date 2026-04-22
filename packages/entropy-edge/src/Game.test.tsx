import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import Game from "./Game";

test("Entropy Edge game renders without crashing", async () => {
  const { container } = render(<Game />);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = container.querySelector("canvas");
  expect(canvas).toBeTruthy();

  const text = container.textContent;
  expect(text).toContain("Entropy's Edge");
  expect(text).toContain("Initialize Link");
});
