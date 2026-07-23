import { describe, expect, it } from "vitest";

import { greet, toLabel } from "../index";

describe("greet", () => {
  it("returns a greeting", () => {
    expect(greet()).toBe("hello");
  });
});

describe("toLabel", () => {
  it("labels a string", () => {
    expect(toLabel("x")).toBe("label: x");
  });

  it("labels a number", () => {
    expect(toLabel(42)).toBe("label: 42");
  });
});
