import { describe, test } from "bun:test";

describe("bootstrapExtensions", () => {
    describe("Dependency ordering", () => {
        test.todo("activates a single extension", () => {});
        test.todo("respects after dependencies within a stage", () => {});
        test.todo("activates independent extensions in the same wave", () => {});
    });

    describe("Needs status handling", () => {
        test.todo("skips extensions marked needs when dependencies are off", () => {});
        test.todo("activates extensions once dependencies are on", () => {});
    });

    describe("Kind validation", () => {
        test.todo("errors when extension kind does not match stage", () => {});
    });

    describe("Cycle detection", () => {
        test.todo("errors when after dependencies create a cycle", () => {});
    });

    describe("Unknown dependencies", () => {
        test.todo("errors when after references an unknown extension name", () => {});
    });

    describe("Required store slots", () => {
        test.todo("errors when factStore is missing", () => {});
        test.todo("errors when eventStore is missing", () => {});
        test.todo("errors when entityStore is missing", () => {});
    });
});
