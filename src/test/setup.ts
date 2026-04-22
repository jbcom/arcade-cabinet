import "@testing-library/jest-dom/vitest";

// Common mocks for browser environments
if (typeof window !== "undefined") {
  window.scrollTo = () => {};
}
