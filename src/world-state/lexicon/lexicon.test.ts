import { describe, expect, test } from "bun:test";
import { createLexicon } from "./lexicon";

describe("Lexicon", () => {
	// Zero
	test("empty lexicon returns false for any term", () => {
		const lexicon = createLexicon();

		const result = lexicon.hasTerm("excelsia", "sword");

		expect(result).toBe(false);
	});

	// One
	test("returns true for added term", () => {
		const lexicon = createLexicon();
		lexicon.addTerm("excelsia", "sword");

		const result = lexicon.hasTerm("excelsia", "sword");

		expect(result).toBe(true);
	});

	// Many
	test("tracks multiple terms independently", () => {
		const lexicon = createLexicon();
		lexicon.addTerm("excelsia", "sword");
		lexicon.addTerm("excelsia", "castle");
		lexicon.addTerm("excelsia", "knight");

		expect(lexicon.hasTerm("excelsia", "sword")).toBe(true);
		expect(lexicon.hasTerm("excelsia", "castle")).toBe(true);
		expect(lexicon.hasTerm("excelsia", "knight")).toBe(true);
		expect(lexicon.hasTerm("excelsia", "snorkeling")).toBe(false);
	});

	// Boundary
	test("same term in different worlds are independent", () => {
		const lexicon = createLexicon();
		lexicon.addTerm("excelsia", "sword");

		expect(lexicon.hasTerm("excelsia", "sword")).toBe(true);
		expect(lexicon.hasTerm("sunnaria", "sword")).toBe(false);
	});

	test("term lookup is case-insensitive", () => {
		const lexicon = createLexicon();
		lexicon.addTerm("excelsia", "Sword");

		expect(lexicon.hasTerm("excelsia", "sword")).toBe(true);
		expect(lexicon.hasTerm("excelsia", "SWORD")).toBe(true);
		expect(lexicon.hasTerm("excelsia", "SwoRd")).toBe(true);
	});
});
