import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "./config-loader";
import type { ExtensionsConfig } from "./types";

const TEST_DIR = join(import.meta.dir, "__test-config__");

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

describe("loadConfig", () => {
    beforeEach(createTestDir);
    afterEach(cleanupTestDir);

    describe("Zero inputs", () => {
        test("throws when config is missing", () => {
            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config missing: extensions.json. Restore the default file.",
            );
        });

        test("throws when required stage arrays are missing", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            writeFileSync(configPath, JSON.stringify({ loaders: [] }, null, 4));

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: missing required stage arrays.",
            );
        });
    });

    describe("Single entry behavior", () => {
        test("accepts config with one entry in a stage", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                loaders: [
                    {
                        name: "@core/sillytavern-loader",
                        path: "extensions/core/1-load-world-data/from-sillytavern",
                        status: "on",
                    },
                ],
            } satisfies ExtensionsConfig;

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(loadConfig(TEST_DIR)).toEqual(config);
        });
    });

    describe("Multiple entries", () => {
        test("accepts multiple entries in a stage", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                loaders: [
                    {
                        name: "@core/sillytavern-loader",
                        path: "extensions/core/1-load-world-data/from-sillytavern",
                        status: "on",
                    },
                    {
                        name: "@core/secondary-loader",
                        path: "extensions/core/1-load-world-data/secondary",
                        status: "off",
                    },
                ],
            } satisfies ExtensionsConfig;

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(loadConfig(TEST_DIR)).toEqual(config);
        });
    });

    describe("Boundary cases", () => {
        test("throws when a stage value is not an array", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                loaders: {},
            };

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: stage values must be arrays.",
            );
        });
        test("throws when an entry is missing required fields", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                validators: [
                    {
                        path: "extensions/core/3-validate-consistency/entity-exists",
                        status: "on",
                    },
                ],
            };

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: entry 0 in validators missing: name, path, status.",
            );
        });
        test("throws when an entry is null", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                loaders: [null],
            };

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: entry 0 in loaders missing: name, path, status.",
            );
        });
        test("throws when status has empty needs list", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                loaders: [
                    {
                        name: "@core/sillytavern-loader",
                        path: "extensions/core/1-load-world-data/from-sillytavern",
                        status: "needs:",
                    },
                ],
            };

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: needs list cannot be empty.",
            );
        });
        test("throws when needs list contains empty dependency names", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                loaders: [
                    {
                        name: "@core/sillytavern-loader",
                        path: "extensions/core/1-load-world-data/from-sillytavern",
                        status: "needs:,@core/keyword-matcher",
                    },
                ],
            };

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: needs list contains empty dependency names.",
            );
        });
        test("throws when status is invalid", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                loaders: [
                    {
                        name: "@core/sillytavern-loader",
                        path: "extensions/core/1-load-world-data/from-sillytavern",
                        status: "maybe",
                    },
                ],
            };

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: status must be on, off, or needs:<dependency>.",
            );
        });
    });

    describe("Interface ergonomics", () => {
        test("returns a helpful error message for invalid config", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = {
                ...createBaseConfig(),
                loaders: [
                    {
                        path: "extensions/core/1-load-world-data/from-sillytavern",
                        status: "on",
                    },
                ],
            };

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: entry 0 in loaders missing: name, path, status.",
            );
        });
    });

    describe("Exceptions", () => {
        test("throws when the config JSON is invalid", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            writeFileSync(configPath, "{ this is not json }");

            expect(() => loadConfig(TEST_DIR)).toThrow(
                "Config invalid: JSON parse error.",
            );
        });
    });

    describe("Simple happy path", () => {
        test("loads and parses valid config", () => {
            const configPath = join(TEST_DIR, "extensions.json");
            const config = createBaseConfig();

            writeFileSync(configPath, JSON.stringify(config, null, 4));

            expect(loadConfig(TEST_DIR)).toEqual(config);
        });
    });
});
