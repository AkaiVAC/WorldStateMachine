import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { ask, type FetchFn } from "./openrouter-client";

const originalEnv = process.env.OPENROUTER_API_KEY;

const mockFetch = (response: object): FetchFn => {
	return () => Promise.resolve(new Response(JSON.stringify(response)));
};

const mockFetchCapture = (
	response: object,
	capture: { body?: string },
): FetchFn => {
	return (_url, options) => {
		capture.body = options.body as string;
		return Promise.resolve(new Response(JSON.stringify(response)));
	};
};

describe("OpenRouter client", () => {
	beforeEach(() => {
		process.env.OPENROUTER_API_KEY = "test-api-key";
	});

	afterEach(() => {
		process.env.OPENROUTER_API_KEY = originalEnv;
	});

	test("returns response content from API", async () => {
		const fetchFn = mockFetch({
			choices: [{ message: { content: "Hello from LLM" } }],
		});

		const result = await ask("Say hello", { fetchFn });

		expect(result).toBe("Hello from LLM");
	});

	test("uses default model when none specified", async () => {
		const capture: { body?: string } = {};
		const fetchFn = mockFetchCapture(
			{ choices: [{ message: { content: "response" } }] },
			capture,
		);

		await ask("test prompt", { fetchFn });

		expect(capture.body).toBeDefined();
		const parsed = JSON.parse(capture.body ?? "{}");
		expect(parsed.model).toBe("xiaomi/mimo-v2-flash:free");
	});

	test("uses custom model when specified", async () => {
		const capture: { body?: string } = {};
		const fetchFn = mockFetchCapture(
			{ choices: [{ message: { content: "response" } }] },
			capture,
		);

		await ask("test prompt", { model: "openai/gpt-4o-mini", fetchFn });

		expect(capture.body).toBeDefined();
		const parsed = JSON.parse(capture.body ?? "{}");
		expect(parsed.model).toBe("openai/gpt-4o-mini");
	});

	test("throws when API key is missing", async () => {
		delete process.env.OPENROUTER_API_KEY;
		const fetchFn = mockFetch({
			choices: [{ message: { content: "response" } }],
		});

		expect(ask("test", { fetchFn })).rejects.toThrow("OPENROUTER_API_KEY");
	});

	test("throws when API returns error", async () => {
		const fetchFn: FetchFn = () =>
			Promise.resolve(
				new Response(JSON.stringify({ error: { message: "Rate limited" } }), {
					status: 429,
				}),
			);

		expect(ask("test", { fetchFn })).rejects.toThrow("Rate limited");
	});
});
