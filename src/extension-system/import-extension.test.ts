import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { importExtension } from "./import-extension";

const fixturesDir = join(import.meta.dir, "__fixtures__", "import-extension");

describe("importExtension", () => {
	test("throws when path does not exist", async () => {
		const invalidPath = join(fixturesDir, "nonexistent.ts");
		await expect(importExtension(invalidPath)).rejects.toThrow();
	});

	test("throws when module exports undefined", async () => {
		const path = join(fixturesDir, "exports-undefined.ts");
		await expect(importExtension(path)).rejects.toThrow("Extension invalid");
	});

	test("throws when module exports non-object", async () => {
		const path = join(fixturesDir, "exports-non-object.ts");
		await expect(importExtension(path)).rejects.toThrow("Extension invalid");
	});

	test("throws when extension missing name field", async () => {
		const path = join(fixturesDir, "missing-name.ts");
		await expect(importExtension(path)).rejects.toThrow("Extension missing required field: name");
	});

	test("throws when extension missing version field", async () => {
		const path = join(fixturesDir, "missing-version.ts");
		await expect(importExtension(path)).rejects.toThrow("Extension missing required field: version");
	});

	test("throws when extension missing kind field", async () => {
		const path = join(fixturesDir, "missing-kind.ts");
		await expect(importExtension(path)).rejects.toThrow("Extension missing required field: kind");
	});

	test("throws when extension missing activate function", async () => {
		const path = join(fixturesDir, "missing-activate.ts");
		await expect(importExtension(path)).rejects.toThrow("Extension missing required field: activate");
	});

	test("throws when extension has invalid kind value", async () => {
		const path = join(fixturesDir, "invalid-kind.ts");
		await expect(importExtension(path)).rejects.toThrow("Extension has invalid kind");
	});

	test("successfully imports valid extension", async () => {
		const path = join(fixturesDir, "valid-minimal.ts");
		const extension = await importExtension(path);
		expect(extension.name).toBe("@test/minimal");
		expect(extension.version).toBe("1.0.0");
		expect(extension.kind).toBe("loader");
		expect(typeof extension.activate).toBe("function");
	});

	test("successfully imports extension with optional after field", async () => {
		const path = join(fixturesDir, "valid-with-after.ts");
		const extension = await importExtension(path);
		expect(extension.name).toBe("@test/with-after");
		expect(extension.after).toEqual(["@test/dependency"]);
	});

	test("successfully imports extension with optional deactivate function", async () => {
		const path = join(fixturesDir, "valid-with-deactivate.ts");
		const extension = await importExtension(path);
		expect(extension.name).toBe("@test/with-deactivate");
		expect(typeof extension.deactivate).toBe("function");
	});
});
