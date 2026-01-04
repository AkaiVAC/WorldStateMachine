import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { discoverExtensions } from "./discover-extensions";

const TEST_DIR = join(import.meta.dir, "__test-extensions__");

const createTestDir = () => {
    mkdirSync(TEST_DIR, { recursive: true });
};

const cleanupTestDir = () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
};

const createExtension = (name: string) => {
    const extDir = join(TEST_DIR, name);
    mkdirSync(extDir);
    writeFileSync(join(extDir, "extension.config.ts"), "export default {}");
    return extDir;
};

describe("discoverExtensions", () => {
    beforeEach(createTestDir);
    afterEach(cleanupTestDir);

    // Zero
    test("returns empty array for empty directory", () => {
        const result = discoverExtensions(TEST_DIR);
        expect(result).toEqual([]);
    });

    // One
    test("discovers extension with TypeScript config", () => {
        const extDir = createExtension("my-extension");

        const result = discoverExtensions(TEST_DIR);

        expect(result).toEqual([{ path: extDir }]);
    });

    // Many
    test("discovers multiple extensions", () => {
        const ext1 = createExtension("alpha");
        const ext2 = createExtension("beta");
        const ext3 = createExtension("gamma");

        const result = discoverExtensions(TEST_DIR);

        expect(result).toHaveLength(3);
        expect(result).toContainEqual({ path: ext1 });
        expect(result).toContainEqual({ path: ext2 });
        expect(result).toContainEqual({ path: ext3 });
    });

    // Boundary
    test("throws when directory does not exist", () => {
        const nonexistent = join(TEST_DIR, "does-not-exist");

        expect(() => discoverExtensions(nonexistent)).toThrow();
    });

    test("ignores subdirectories without config files", () => {
        createExtension("valid-extension");
        mkdirSync(join(TEST_DIR, "no-config-dir"));

        const result = discoverExtensions(TEST_DIR);

        expect(result).toHaveLength(1);
    });
});
