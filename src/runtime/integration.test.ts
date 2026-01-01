import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { boot } from "./boot";

describe("Runtime Integration", () => {
	test("boots with core extension", async () => {
		const extensionsDir = join(process.cwd(), "extensions");
		const runtime = await boot({ extensionsDir });

		expect(runtime.registry.has("core")).toBe(true);
		const core = runtime.registry.get("core");
		expect(core).toBeDefined();
		expect(core?.version).toBe("1.0.0");
	});
});
