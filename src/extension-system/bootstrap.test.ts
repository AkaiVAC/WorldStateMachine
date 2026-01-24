import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { bootstrapExtensions } from "./bootstrap";
import type { ExtensionsConfig } from "./types";

const TEST_DIR = join(import.meta.dir, "__test-bootstrap__");

const activationKey = "__activationLog";

const createTestDir = () => {
    mkdirSync(TEST_DIR, { recursive: true });
};

const cleanupTestDir = () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    clearActivationLog();
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
        JSON.stringify(config, null, 4),
    );
};

const writeExtensionModule = (relativePath: string, contents: string) => {
    const fullPath = join(TEST_DIR, relativePath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, contents);
};

const clearActivationLog = () => {
    (globalThis as Record<string, unknown>)[activationKey] = [];
};

const getActivationLog = (): string[] => {
    const log = (globalThis as Record<string, unknown>)[activationKey];
    if (Array.isArray(log)) {
        return log as string[];
    }
    return [];
};

const writeActivationExtension = (
    name: string,
    status: string,
    after: string[] = [],
) => {
    const afterList =
        after.length > 0 ? `after: ${JSON.stringify(after)},` : "";
    writeExtensionModule(
        `extensions/core/4-build-scene-context/${name}.ts`,
        `const activationKey = "${activationKey}"; export default { name: "${name}", version: "1.0.0", kind: "contextBuilder", ${afterList} activate: () => { const log = globalThis[activationKey] ?? []; log.push("${status}"); globalThis[activationKey] = log; return undefined; } };`,
    );
};

const writeDelayedActivationExtension = (name: string, delayMs: number) => {
    writeExtensionModule(
        `extensions/core/4-build-scene-context/${name}.ts`,
        `const activationKey = "${activationKey}"; export default { name: "${name}", version: "1.0.0", kind: "contextBuilder", activate: async () => { const log = globalThis[activationKey] ?? []; log.push("start-${name}"); globalThis[activationKey] = log; await new Promise((resolve) => setTimeout(resolve, ${delayMs})); log.push("finish-${name}"); return undefined; } };`,
    );
};

const writeContributionExtension = (name: string, content: string) => {
    writeExtensionModule(
        `extensions/core/3-validate-consistency/${name}.ts`,
        content,
    );
};

describe("bootstrapExtensions", () => {
    beforeEach(createTestDir);
    afterEach(cleanupTestDir);

    test("boots real extensions config end to end", async () => {
        await expect(bootstrapExtensions(process.cwd())).resolves.toBeDefined();
    });

    test("aggregates contribution arrays into the context", async () => {
        writeContributionExtension(
            "validator-alpha",
            "export default { name: '@core/validator-alpha', version: '1.0.0', kind: 'validator', activate: () => ({ validators: [{ name: 'alpha' }] }) };",
        );
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; context.eventStore = { ok: true }; context.entityStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            validators: [
                {
                    name: "@core/validator-alpha",
                    path: "extensions/core/3-validate-consistency/validator-alpha.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        const context = await bootstrapExtensions(TEST_DIR);

        expect(context.validators).toEqual([{ name: "alpha" }]);
    });

    test("aggregates multiple contribution collections from one extension", async () => {
        writeContributionExtension(
            "validator-beta",
            "export default { name: '@core/validator-beta', version: '1.0.0', kind: 'validator', activate: () => ({ validators: [{ name: 'beta' }], contextBuilders: [{ name: 'builder' }] }) };",
        );
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; context.eventStore = { ok: true }; context.entityStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            validators: [
                {
                    name: "@core/validator-beta",
                    path: "extensions/core/3-validate-consistency/validator-beta.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        const context = await bootstrapExtensions(TEST_DIR);

        expect(context.validators).toEqual([{ name: "beta" }]);
        expect(context.contextBuilders).toEqual([{ name: "builder" }]);
    });

    test("ignores empty contributions", async () => {
        writeContributionExtension(
            "validator-empty",
            "export default { name: '@core/validator-empty', version: '1.0.0', kind: 'validator', activate: () => ({}) };",
        );
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; context.eventStore = { ok: true }; context.entityStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            validators: [
                {
                    name: "@core/validator-empty",
                    path: "extensions/core/3-validate-consistency/validator-empty.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        const context = await bootstrapExtensions(TEST_DIR);

        expect(context.validators).toEqual([]);
        expect(context.contextBuilders).toEqual([]);
    });

    test("supports async contribution returns", async () => {
        writeContributionExtension(
            "validator-async",
            "export default { name: '@core/validator-async', version: '1.0.0', kind: 'validator', activate: async () => ({ validators: [{ name: 'async' }] }) };",
        );
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; context.eventStore = { ok: true }; context.entityStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            validators: [
                {
                    name: "@core/validator-async",
                    path: "extensions/core/3-validate-consistency/validator-async.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        const context = await bootstrapExtensions(TEST_DIR);

        expect(context.validators).toEqual([{ name: "async" }]);
    });

    test("fails fast when an extension module is missing", async () => {
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

        return expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: extension module missing: extensions/core/2-store-timeline/missing-store.ts.",
        );
    });

    test("writes normalized paths when bootstrap fails to load an extension module", async () => {
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: () => undefined };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions\\core\\2-store-timeline\\required-store.ts",
                    status: "on",
                },
            ],
            ui: [
                {
                    name: "@core/missing-ui",
                    path: "extensions/core/6-provide-ui/dev-chat/missing-ui.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        await expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: extension module missing: extensions/core/6-provide-ui/dev-chat/missing-ui.ts.",
        );

        const result = (await Bun.file(
            join(TEST_DIR, "extensions.json"),
        ).json()) as ExtensionsConfig;

        expect(result.stores[0]?.path).toBe(
            "extensions/core/2-store-timeline/required-store.ts",
        );
    });
    test("writes needs status updates when bootstrap fails after dependencies are read", async () => {
        writeActivationExtension("needs-alpha", "needs-alpha");
        writeActivationExtension("needs-beta", "needs-beta", ["needs-alpha"]);
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: () => undefined };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            contextBuilders: [
                {
                    name: "needs-alpha",
                    path: "extensions/core/4-build-scene-context/needs-alpha.ts",
                    status: "off",
                },
                {
                    name: "needs-beta",
                    path: "extensions/core/4-build-scene-context/needs-beta.ts",
                    status: "on",
                },
            ],
            ui: [
                {
                    name: "@core/missing-ui",
                    path: "extensions/core/6-provide-ui/dev-chat/missing-ui.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        await expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: extension module missing: extensions/core/6-provide-ui/dev-chat/missing-ui.ts.",
        );

        const result = (await Bun.file(
            join(TEST_DIR, "extensions.json"),
        ).json()) as ExtensionsConfig;

        expect(result.contextBuilders[1]?.status).toBe("needs:needs-alpha");
    });

    test("fails fast on kind mismatch for a stage", async () => {
        writeExtensionModule(
            "extensions/core/2-store-timeline/memory-store.ts",
            "export default { name: '@core/memory-store', version: '1.0.0', kind: 'loader', activate: () => undefined };",
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

        return expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: extension kind mismatch for stores: @core/memory-store is loader.",
        );
    });

    test("fails fast on unknown after dependency", async () => {
        writeExtensionModule(
            "extensions/core/4-build-scene-context/keyword-matcher.ts",
            "export default { name: '@core/keyword-matcher', version: '1.0.0', kind: 'contextBuilder', after: ['@core/missing'], activate: () => undefined };",
        );

        const config = {
            ...createBaseConfig(),
            contextBuilders: [
                {
                    name: "@core/keyword-matcher",
                    path: "extensions/core/4-build-scene-context/keyword-matcher.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        return expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: unknown dependency @core/missing for @core/keyword-matcher.",
        );
    });

    test("fails fast on dependency cycle", async () => {
        writeExtensionModule(
            "extensions/core/4-build-scene-context/cycle-alpha.ts",
            "export default { name: '@core/cycle-alpha', version: '1.0.0', kind: 'contextBuilder', after: ['@core/cycle-beta'], activate: () => undefined };",
        );
        writeExtensionModule(
            "extensions/core/4-build-scene-context/cycle-beta.ts",
            "export default { name: '@core/cycle-beta', version: '1.0.0', kind: 'contextBuilder', after: ['@core/cycle-alpha'], activate: () => undefined };",
        );

        const config = {
            ...createBaseConfig(),
            contextBuilders: [
                {
                    name: "@core/cycle-alpha",
                    path: "extensions/core/4-build-scene-context/cycle-alpha.ts",
                    status: "on",
                },
                {
                    name: "@core/cycle-beta",
                    path: "extensions/core/4-build-scene-context/cycle-beta.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        return expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: dependency cycle detected in contextBuilders.",
        );
    });

    test("activates only entries with status on", async () => {
        writeActivationExtension("alpha", "alpha");
        writeActivationExtension("beta", "beta");
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; context.eventStore = { ok: true }; context.entityStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            contextBuilders: [
                {
                    name: "alpha",
                    path: "extensions/core/4-build-scene-context/alpha.ts",
                    status: "on",
                },
                {
                    name: "beta",
                    path: "extensions/core/4-build-scene-context/beta.ts",
                    status: "off",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        await bootstrapExtensions(TEST_DIR);

        expect(getActivationLog()).toEqual(["alpha"]);
    });

    test("writes normalized paths before activation", async () => {
        writeActivationExtension("normalize", "normalize");
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; context.eventStore = { ok: true }; context.entityStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            contextBuilders: [
                {
                    name: "normalize",
                    path: "extensions\\core\\4-build-scene-context\\normalize.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        await expect(bootstrapExtensions(TEST_DIR)).resolves.toBeDefined();

        const result = (await Bun.file(
            join(TEST_DIR, "extensions.json"),
        ).json()) as ExtensionsConfig;

        expect(result.contextBuilders[0]?.path).toBe(
            "extensions/core/4-build-scene-context/normalize.ts",
        );
    });

    test("writes needs status updates before activation", async () => {
        writeActivationExtension("needs-alpha", "needs-alpha");
        writeActivationExtension("needs-beta", "needs-beta", ["needs-alpha"]);
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; context.eventStore = { ok: true }; context.entityStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            contextBuilders: [
                {
                    name: "needs-alpha",
                    path: "extensions/core/4-build-scene-context/needs-alpha.ts",
                    status: "off",
                },
                {
                    name: "needs-beta",
                    path: "extensions/core/4-build-scene-context/needs-beta.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        const before = (await Bun.file(
            join(TEST_DIR, "extensions.json"),
        ).json()) as ExtensionsConfig;

        expect(before.contextBuilders[1]?.status).toBe("on");

        await bootstrapExtensions(TEST_DIR);

        const result = (await Bun.file(
            join(TEST_DIR, "extensions.json"),
        ).json()) as ExtensionsConfig;

        expect(result.contextBuilders[1]?.status).toBe("needs:needs-alpha");
    });

    test("validates required store slots after activation", async () => {
        writeExtensionModule(
            "extensions/core/2-store-timeline/partial-store.ts",
            "export default { name: '@core/partial-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/partial-store",
                    path: "extensions/core/2-store-timeline/partial-store.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        return expect(bootstrapExtensions(TEST_DIR)).rejects.toThrow(
            "Bootstrap error: missing required store slots: eventStore, entityStore.",
        );
    });

    test("activates extensions in within-stage waves", async () => {
        writeDelayedActivationExtension("wave-alpha", 40);
        writeDelayedActivationExtension("wave-beta", 5);
        writeDelayedActivationExtension("wave-gamma", 10);
        writeExtensionModule(
            "extensions/core/2-store-timeline/required-store.ts",
            "export default { name: '@core/required-store', version: '1.0.0', kind: 'store', activate: (context) => { context.factStore = { ok: true }; context.eventStore = { ok: true }; context.entityStore = { ok: true }; return undefined; } };",
        );

        const config = {
            ...createBaseConfig(),
            stores: [
                {
                    name: "@core/required-store",
                    path: "extensions/core/2-store-timeline/required-store.ts",
                    status: "on",
                },
            ],
            contextBuilders: [
                {
                    name: "wave-alpha",
                    path: "extensions/core/4-build-scene-context/wave-alpha.ts",
                    status: "on",
                },
                {
                    name: "wave-beta",
                    path: "extensions/core/4-build-scene-context/wave-beta.ts",
                    status: "on",
                },
                {
                    name: "wave-gamma",
                    path: "extensions/core/4-build-scene-context/wave-gamma.ts",
                    status: "on",
                },
            ],
        } satisfies ExtensionsConfig;

        writeConfig(config);

        await bootstrapExtensions(TEST_DIR);

        expect(getActivationLog()).toEqual([
            "start-wave-alpha",
            "start-wave-beta",
            "start-wave-gamma",
            "finish-wave-beta",
            "finish-wave-gamma",
            "finish-wave-alpha",
        ]);
    });
});
