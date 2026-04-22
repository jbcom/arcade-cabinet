import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";

export type TextMatcher = string | RegExp;

export interface BrowserGameStartFlow {
  Component: ComponentType;
  title: TextMatcher;
  startFlow: TextMatcher[];
  ready: TextMatcher;
  expectsCanvas?: boolean;
}

export async function verifyBrowserGameStartFlow({
  Component,
  title,
  startFlow,
  ready,
  expectsCanvas = false,
}: BrowserGameStartFlow) {
  await page.viewport(1280, 720);

  const { container } = render(
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Component />
    </div>
  );

  await expect.element(page.getByText(title)).toBeVisible();

  for (const label of startFlow) {
    await userEvent.click(page.getByText(label));
  }

  await expect.element(page.getByText(ready)).toBeVisible();

  if (expectsCanvas) {
    expect(container.querySelector("canvas")).not.toBeNull();
  }
}
