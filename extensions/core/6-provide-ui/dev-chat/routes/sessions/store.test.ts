import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import {
	createSession,
	deleteSession,
	getSession,
	listSessions,
	updateSession,
} from "./store";

const testSessionsDir = join(import.meta.dir, "__test_sessions__");

describe("Sessions Store", () => {
	beforeEach(async () => {
		await mkdir(testSessionsDir, { recursive: true });
	});

	afterEach(async () => {
		await rm(testSessionsDir, { recursive: true, force: true });
	});

	describe("listSessions", () => {
		test("returns empty array when no sessions exist", async () => {
			const sessions = await listSessions(testSessionsDir);
			expect(sessions).toEqual([]);
		});

		test("returns session metadata for existing sessions", async () => {
			const session = await createSession(testSessionsDir, {
				name: "Test Session",
				model: "anthropic/claude-sonnet-4",
			});

			const sessions = await listSessions(testSessionsDir);

			expect(sessions).toHaveLength(1);
			expect(sessions[0]?.id).toBe(session.id);
			expect(sessions[0]?.name).toBe("Test Session");
		});

		test("returns multiple sessions sorted by updatedAt", async () => {
			await createSession(testSessionsDir, { name: "First", model: "test" });
			await createSession(testSessionsDir, { name: "Second", model: "test" });

			const sessions = await listSessions(testSessionsDir);

			expect(sessions).toHaveLength(2);
		});
	});

	describe("createSession", () => {
		test("creates session with unique id", async () => {
			const session = await createSession(testSessionsDir, {
				name: "New Session",
				model: "anthropic/claude-sonnet-4",
			});

			expect(session.id).toBeDefined();
			expect(session.name).toBe("New Session");
			expect(session.model).toBe("anthropic/claude-sonnet-4");
			expect(session.history).toEqual([]);
			expect(session.manualEntries).toEqual([]);
		});

		test("persists session to filesystem", async () => {
			const session = await createSession(testSessionsDir, {
				name: "Persisted Session",
				model: "test",
			});

			const loaded = await getSession(testSessionsDir, session.id);

			expect(loaded).not.toBeNull();
			expect(loaded?.name).toBe("Persisted Session");
		});

		test("sets createdAt and updatedAt timestamps", async () => {
			const before = new Date().toISOString();
			const session = await createSession(testSessionsDir, {
				name: "Timestamped",
				model: "test",
			});
			const after = new Date().toISOString();

			expect(session.createdAt >= before).toBe(true);
			expect(session.createdAt <= after).toBe(true);
			expect(session.updatedAt).toBe(session.createdAt);
		});
	});

	describe("getSession", () => {
		test("returns null for non-existent session", async () => {
			const session = await getSession(testSessionsDir, "non-existent-id");
			expect(session).toBeNull();
		});

		test("returns session data for existing session", async () => {
			const created = await createSession(testSessionsDir, {
				name: "Existing",
				model: "test",
			});

			const loaded = await getSession(testSessionsDir, created.id);

			expect(loaded).not.toBeNull();
			expect(loaded?.id).toBe(created.id);
			expect(loaded?.name).toBe("Existing");
		});
	});

	describe("updateSession", () => {
		test("updates session history", async () => {
			const session = await createSession(testSessionsDir, {
				name: "Chat",
				model: "test",
			});

			const updated = await updateSession(testSessionsDir, session.id, {
				history: [
					{ role: "user", content: "Hello" },
					{ role: "assistant", content: "Hi there!" },
				],
			});

			expect(updated?.history).toHaveLength(2);
			expect(updated?.history?.[0]?.content).toBe("Hello");
		});

		test("updates session name", async () => {
			const session = await createSession(testSessionsDir, {
				name: "Original",
				model: "test",
			});

			const updated = await updateSession(testSessionsDir, session.id, {
				name: "Renamed",
			});

			expect(updated?.name).toBe("Renamed");
		});

		test("updates updatedAt timestamp", async () => {
			const session = await createSession(testSessionsDir, {
				name: "Update Test",
				model: "test",
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			const updated = await updateSession(testSessionsDir, session.id, {
				name: "Updated Name",
			});

			expect(updated).not.toBeNull();
			if (updated) {
				expect(updated.updatedAt > session.updatedAt).toBe(true);
			}
		});

		test("returns null for non-existent session", async () => {
			const result = await updateSession(testSessionsDir, "fake-id", {
				name: "Updated",
			});
			expect(result).toBeNull();
		});
	});

	describe("deleteSession", () => {
		test("removes session file", async () => {
			const session = await createSession(testSessionsDir, {
				name: "To Delete",
				model: "test",
			});

			const deleted = await deleteSession(testSessionsDir, session.id);

			expect(deleted).toBe(true);

			const loaded = await getSession(testSessionsDir, session.id);
			expect(loaded).toBeNull();
		});

		test("returns false for non-existent session", async () => {
			const deleted = await deleteSession(testSessionsDir, "fake-id");
			expect(deleted).toBe(false);
		});
	});
});
