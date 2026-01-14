import { describe, expect, test } from "bun:test";
import { computeDependencyStatus } from "./compute-dependency-status";
import type { ExtensionEntry, ExtensionsConfig } from "./types";

describe("computeDependencyStatus", () => {
	test("marks extension as needs: when dependency is off", () => {
		const config: ExtensionsConfig = {
			stores: [],
			loaders: [
				{ name: "@test/loader-a", path: "a.ts", status: "on" },
				{ name: "@test/loader-b", path: "b.ts", status: "off" },
			],
			validators: [],
			contextBuilders: [],
			senders: [],
			ui: [],
		};

		const extensions = new Map([
			["@test/loader-a", { name: "@test/loader-a", after: ["@test/loader-b"] }],
			["@test/loader-b", { name: "@test/loader-b", after: [] }],
		]);

		const result = computeDependencyStatus(config, extensions);

		expect(result.loaders[0].status).toBe("needs:@test/loader-b");
		expect(result.loaders[1].status).toBe("off");
	});
});
