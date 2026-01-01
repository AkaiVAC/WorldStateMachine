import { join } from "node:path";
import type {
	CreateSessionInput,
	Session,
	SessionSummary,
	UpdateSessionInput,
} from "./types";

const getSessionPath = (sessionsDir: string, id: string): string => {
	return join(sessionsDir, `${id}.json`);
};

export const listSessions = async (
	sessionsDir: string,
): Promise<SessionSummary[]> => {
	const glob = new Bun.Glob("*.json");
	const summaries: SessionSummary[] = [];

	for await (const file of glob.scan({ cwd: sessionsDir })) {
		const filePath = join(sessionsDir, file);
		const session = await loadSession(filePath);
		if (session) {
			summaries.push({
				id: session.id,
				name: session.name,
				createdAt: session.createdAt,
				updatedAt: session.updatedAt,
				model: session.model,
				messageCount: session.history.length,
			});
		}
	}

	return summaries.sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
	);
};

export const createSession = async (
	sessionsDir: string,
	input: CreateSessionInput,
): Promise<Session> => {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();

	const session: Session = {
		id,
		name: input.name,
		model: input.model,
		createdAt: now,
		updatedAt: now,
		history: [],
		manualEntries: [],
	};

	await saveSession(sessionsDir, session);
	return session;
};

export const getSession = async (
	sessionsDir: string,
	id: string,
): Promise<Session | null> => {
	const filePath = getSessionPath(sessionsDir, id);
	return loadSession(filePath);
};

export const updateSession = async (
	sessionsDir: string,
	id: string,
	updates: UpdateSessionInput,
): Promise<Session | null> => {
	const session = await getSession(sessionsDir, id);
	if (!session) return null;

	const updated: Session = {
		...session,
		...updates,
		id: session.id,
		createdAt: session.createdAt,
		updatedAt: new Date().toISOString(),
	};

	await saveSession(sessionsDir, updated);
	return updated;
};

export const deleteSession = async (
	sessionsDir: string,
	id: string,
): Promise<boolean> => {
	const filePath = getSessionPath(sessionsDir, id);
	const file = Bun.file(filePath);

	if (!(await file.exists())) {
		return false;
	}

	await Bun.write(filePath, "");
	const { unlink } = await import("node:fs/promises");
	await unlink(filePath);
	return true;
};

const loadSession = async (filePath: string): Promise<Session | null> => {
	const file = Bun.file(filePath);
	if (!(await file.exists())) {
		return null;
	}
	return file.json();
};

const saveSession = async (
	sessionsDir: string,
	session: Session,
): Promise<void> => {
	const filePath = getSessionPath(sessionsDir, session.id);
	await Bun.write(filePath, JSON.stringify(session, null, 2));
};
