import { afterEach, describe, expect, mock, test } from "bun:test";
import { fetchModels } from "./models";

describe("fetchModels", () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("returns sorted models from OpenRouter API", async () => {
		const mockResponse = {
			data: [
				{ id: "openai/gpt-4o", name: "OpenAI: GPT-4o" },
				{ id: "anthropic/claude-sonnet-4", name: "Anthropic: Claude Sonnet 4" },
			],
		};

		const mockFetch = mock(() =>
			Promise.resolve({
				json: () => Promise.resolve(mockResponse),
			} as Response),
		);
		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const models = await fetchModels();

		expect(models).toHaveLength(2);
		expect(models[0]?.name).toBe("Anthropic: Claude Sonnet 4");
		expect(models[1]?.name).toBe("OpenAI: GPT-4o");
	});

	test("maps id and name fields correctly", async () => {
		const mockResponse = {
			data: [{ id: "test/model", name: "Test Model" }],
		};

		const mockFetch = mock(() =>
			Promise.resolve({
				json: () => Promise.resolve(mockResponse),
			} as Response),
		);
		globalThis.fetch = mockFetch as unknown as typeof fetch;

		const models = await fetchModels();

		expect(models[0]).toEqual({ id: "test/model", name: "Test Model" });
	});
});
