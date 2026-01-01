import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { createRuntime } from "./createRuntime";

describe("Runtime Integration", () => {
	test("creates runtime with core extension", async () => {
		const extensionsDir = join(process.cwd(), "extensions");
		const runtime = await createRuntime({ extensionsDir });

		expect(runtime.registry.has("core")).toBe(true);
		const core = runtime.registry.get("core");
		expect(core).toBeDefined();
		expect(core?.version).toBe("1.0.0");
	});
});
