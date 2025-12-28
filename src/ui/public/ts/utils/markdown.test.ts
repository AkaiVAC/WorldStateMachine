import { describe, expect, test } from "bun:test";
import { renderMarkdown } from "./markdown.ts";

describe("renderMarkdown", () => {
	test("renders bold text", () => {
		const result = renderMarkdown("**bold**");
		expect(result).toContain("<strong>bold</strong>");
	});

	test("renders italic text", () => {
		const result = renderMarkdown("*italic*");
		expect(result).toContain("<em>italic</em>");
	});

	test("renders code blocks", () => {
		const result = renderMarkdown("```js\nconst x = 1;\n```");
		expect(result).toContain("<code");
		expect(result).toContain("const x = 1;");
	});

	test("renders inline code", () => {
		const result = renderMarkdown("`code`");
		expect(result).toContain("<code>code</code>");
	});

	test("renders links", () => {
		const result = renderMarkdown("[link](https://example.com)");
		expect(result).toContain('<a href="https://example.com"');
		expect(result).toContain("link</a>");
	});

	test("renders lists", () => {
		const result = renderMarkdown("- item 1\n- item 2");
		expect(result).toContain("<ul>");
		expect(result).toContain("<li>item 1</li>");
	});

	test("renders line breaks with gfm breaks option", () => {
		const result = renderMarkdown("line 1\nline 2");
		expect(result).toContain("<br");
	});
});
