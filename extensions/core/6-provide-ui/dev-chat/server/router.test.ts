import { describe, expect, test } from "bun:test";
import { matchRoute } from "./router";
import type { Routes } from "./types";

describe("matchRoute", () => {
	const mockHandler = () => new Response("ok");

	test("returns null for non-matching path", () => {
		const routes: Routes = {
			"/api/users/:id": { GET: mockHandler },
		};

		const result = matchRoute("/api/posts/123", "GET", routes);

		expect(result).toBeNull();
	});

	test("returns null for non-matching method", () => {
		const routes: Routes = {
			"/api/users/:id": { GET: mockHandler },
		};

		const result = matchRoute("/api/users/123", "POST", routes);

		expect(result).toBeNull();
	});

	test("matches single parameter route", () => {
		const routes: Routes = {
			"/api/users/:id": { GET: mockHandler },
		};

		const result = matchRoute("/api/users/123", "GET", routes);

		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ id: "123" });
	});

	test("matches multiple parameter route", () => {
		const routes: Routes = {
			"/api/users/:userId/posts/:postId": { GET: mockHandler },
		};

		const result = matchRoute("/api/users/1/posts/2", "GET", routes);

		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ userId: "1", postId: "2" });
	});

	test("returns null for wrong segment count", () => {
		const routes: Routes = {
			"/api/users/:id": { GET: mockHandler },
		};

		const result = matchRoute("/api/users/123/extra", "GET", routes);

		expect(result).toBeNull();
	});

	test("skips routes without parameters", () => {
		const routes: Routes = {
			"/api/users": { GET: mockHandler },
		};

		const result = matchRoute("/api/users", "GET", routes);

		expect(result).toBeNull();
	});
});
