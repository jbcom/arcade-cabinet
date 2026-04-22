import "@testing-library/jest-dom/vitest";
import "../../packages/shared/src/styles/globals.css";

// Common mocks for browser environments
if (typeof window !== "undefined") {
  window.scrollTo = () => {};
}
