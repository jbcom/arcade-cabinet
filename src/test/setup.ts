import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";

// Common mocks for browser environments
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
