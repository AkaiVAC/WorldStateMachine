import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { bootstrapExtensions } from "./bootstrap";
import type { ExtensionsConfig } from "./types";

const TEST_DIR = join(import.meta.dir, "__test-bootstrap__");

const createTestDir = () => {
    mkdirSync(TEST_DIR, { recursive: true });
};

const cleanupTestDir = () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
};

const createBaseConfig = (): ExtensionsConfig => ({
    loaders: [],
    stores: [],
    validators: [],
    contextBuilders: [],
    senders: [],
    ui: [],
});

const writeConfig = (config: ExtensionsConfig) => {
    writeFileSync(
        join(TEST_DIR, "extensions.json"),
        JSON.stringify(config, null, 2),
    );
};

const writeExtensionModule = (relativePath: string, contents: string) => {
    const fullPath = join(TEST_DIR, relativePath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, contents);
};

describe("bootstrapExtensions", () => {
    beforeEach(createTestDir);
    afterEach(cleanupTestDir);

    test("fails fast when an extension module is missing", () => {
        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/missing-store",
                    path: "extensions/core/2-store-timeline/missing-store.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: extension module missing: extensions/core/2-store-timeline/missing-store.ts.",
        );
    });

    test("fails fast on kind mismatch for a stage", () => {
        writeExtensionModule(
            "extensions/core/2-store-timeline/memory-store.ts",
            "export default { name: '@core/memory-store', version: '1.0.0', kind: 'loader', activate: () => {} };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/memory-store",
                    path: "extensions/core/2-store-timeline/memory-store.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: extension kind mismatch for stores: @core/memory-store is loader.",
        );
    });

    test.todo("fails fast on unknown after dependency", () => {});
    test.todo("fails fast on dependency cycle", () => {});
    test.todo("activates only entries with status on", () => {});
    test.todo("writes normalized paths before activation", () => {});
    test.todo("writes needs status updates before activation", () => {});
    test.todo("validates required store slots after activation", () => {});
    test.todo("activates extensions in within-stage waves", () => {});
});
