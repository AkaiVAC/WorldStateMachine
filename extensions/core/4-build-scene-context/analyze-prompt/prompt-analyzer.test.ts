import { describe, expect, test } from "bun:test";
import { createPromptAnalyzer } from "./prompt-analyzer";

describe("PromptAnalyzer", () => {
	describe("Zero", () => {
		test("empty prompt returns empty results", async () => {
			const mockAsk = () =>
				Promise.resolve(
					JSON.stringify({ entityReferences: [], anachronisms: [] }),
				);
			const analyzer = createPromptAnalyzer({
				askFn: mockAsk,
				worldSetting: "medieval fantasy",
			});

			const result = await analyzer.analyze("");

			expect(result.entityReferences).toEqual([]);
			expect(result.anachronisms).toEqual([]);
		});
	});

	describe("One", () => {
		test("extracts single entity reference", async () => {
			const mockAsk = () =>
				Promise.resolve(
					JSON.stringify({ entityReferences: ["prince"], anachronisms: [] }),
				);
			const analyzer = createPromptAnalyzer({
				askFn: mockAsk,
				worldSetting: "medieval fantasy",
			});

			const result = await analyzer.analyze("I met the prince.");

			expect(result.entityReferences).toContain("prince");
		});

		test("extracts single anachronism", async () => {
			const mockAsk = () =>
				Promise.resolve(
					JSON.stringify({
						entityReferences: [],
						anachronisms: ["smartphone"],
					}),
				);
			const analyzer = createPromptAnalyzer({
				askFn: mockAsk,
				worldSetting: "medieval fantasy",
			});

			const result = await analyzer.analyze("I checked my smartphone.");

			expect(result.anachronisms).toContain("smartphone");
		});
	});

	describe("Many", () => {
		test("extracts multiple entity references and anachronisms", async () => {
			const mockAsk = () =>
				Promise.resolve(
					JSON.stringify({
						entityReferences: ["prince", "Sunnarian Royal Gardens"],
						anachronisms: ["snorkeling"],
					}),
				);
			const analyzer = createPromptAnalyzer({
				askFn: mockAsk,
				worldSetting: "medieval fantasy",
			});

			const result = await analyzer.analyze(
				"I enter the Sunnarian Royal Gardens and find the prince snorkeling.",
			);

			expect(result.entityReferences).toContain("prince");
			expect(result.entityReferences).toContain("Sunnarian Royal Gardens");
			expect(result.anachronisms).toContain("snorkeling");
		});
	});

	describe("Interface", () => {
		test("passes world setting to LLM prompt", async () => {
			let capturedPrompt = "";
			const mockAsk = (prompt: string) => {
				capturedPrompt = prompt;
				return Promise.resolve(
					JSON.stringify({ entityReferences: [], anachronisms: [] }),
				);
			};
			const analyzer = createPromptAnalyzer({
				askFn: mockAsk,
				worldSetting: "cyberpunk sci-fi",
			});

			await analyzer.analyze("Test prompt");

			expect(capturedPrompt).toContain("cyberpunk sci-fi");
		});

		test("passes input text to LLM prompt", async () => {
			let capturedPrompt = "";
			const mockAsk = (prompt: string) => {
				capturedPrompt = prompt;
				return Promise.resolve(
					JSON.stringify({ entityReferences: [], anachronisms: [] }),
				);
			};
			const analyzer = createPromptAnalyzer({
				askFn: mockAsk,
				worldSetting: "medieval fantasy",
			});

			await analyzer.analyze("The wizard cast a fireball.");

			expect(capturedPrompt).toContain("The wizard cast a fireball.");
		});
	});

	describe("Exception", () => {
		test("handles malformed JSON response gracefully", async () => {
			const mockAsk = () => Promise.resolve("not valid json");
			const analyzer = createPromptAnalyzer({
				askFn: mockAsk,
				worldSetting: "medieval fantasy",
			});

			const result = await analyzer.analyze("Test prompt");

			expect(result.entityReferences).toEqual([]);
			expect(result.anachronisms).toEqual([]);
		});

		test("handles missing fields in response", async () => {
			const mockAsk = () => Promise.resolve(JSON.stringify({}));
			const analyzer = createPromptAnalyzer({
				askFn: mockAsk,
				worldSetting: "medieval fantasy",
			});

			const result = await analyzer.analyze("Test prompt");

			expect(result.entityReferences).toEqual([]);
			expect(result.anachronisms).toEqual([]);
		});
	});
});
