import { describe, expect, test } from "bun:test";
import { type Rule, validate } from "./validator";

describe("Validator", () => {
  test("returns empty array when no rules provided", async () => {
    const result = await validate("some prompt", []);

    expect(result).toEqual([]);
  });
  test("returns empty array when rule passes", async () => {
    const passingRule: Rule = {
      check: () => Promise.resolve([]),
    };

    const result = await validate("some prompt", [passingRule]);

    expect(result).toEqual([]);
  });
  test("returns violation when rule fails", async () => {
    const failingRule: Rule = {
      check: () =>
        Promise.resolve([
          { type: "test", term: "foo", message: "foo is invalid" },
        ]),
    };

    const result = await validate("some prompt", [failingRule]);

    expect(result).toEqual([
      { type: "test", term: "foo", message: "foo is invalid" },
    ]);
  });
  test("collects violations from multiple failing rules", async () => {
    const rule1: Rule = {
      check: () =>
        Promise.resolve([{ type: "a", term: "x", message: "error x" }]),
    };
    const rule2: Rule = {
      check: () =>
        Promise.resolve([{ type: "b", term: "y", message: "error y" }]),
    };

    const result = await validate("prompt", [rule1, rule2]);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ type: "a", term: "x", message: "error x" });
    expect(result).toContainEqual({ type: "b", term: "y", message: "error y" });
  });

  test("handles rule that returns multiple violations", async () => {
    const rule: Rule = {
      check: () =>
        Promise.resolve([
          { type: "t", term: "a", message: "error a" },
          { type: "t", term: "b", message: "error b" },
        ]),
    };

    const result = await validate("prompt", [rule]);

    expect(result).toHaveLength(2);
  });
});
