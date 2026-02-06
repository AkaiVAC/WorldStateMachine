import { join } from "node:path";
import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
  updateSession,
} from "./store";
import type { CreateSessionInput, UpdateSessionInput } from "./types";

const getSessionsDir = (): string => {
  return join(import.meta.dir, "../../../data/sessions");
};

export const listSessionsHandler = async (): Promise<Response> => {
  const sessionsDir = getSessionsDir();
  const sessions = await listSessions(sessionsDir);
  return Response.json(sessions);
};

export const createSessionHandler = async (req: Request): Promise<Response> => {
  const sessionsDir = getSessionsDir();
  const body = (await req.json()) as CreateSessionInput;
  const session = await createSession(sessionsDir, body);
  return Response.json(session, { status: 201 });
};

export const getSessionHandler = async (
  _req: Request,
  params?: Record<string, string>,
): Promise<Response> => {
  const id = params?.id;
  if (!id) {
    return Response.json({ error: "Session ID required" }, { status: 400 });
  }

  const sessionsDir = getSessionsDir();
  const session = await getSession(sessionsDir, id);

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  return Response.json(session);
};

export const updateSessionHandler = async (
  req: Request,
  params?: Record<string, string>,
): Promise<Response> => {
  const id = params?.id;
  if (!id) {
    return Response.json({ error: "Session ID required" }, { status: 400 });
  }

  const sessionsDir = getSessionsDir();
  const updates = (await req.json()) as UpdateSessionInput;
  const session = await updateSession(sessionsDir, id, updates);

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  return Response.json(session);
};

export const deleteSessionHandler = async (
  _req: Request,
  params?: Record<string, string>,
): Promise<Response> => {
  const id = params?.id;
  if (!id) {
    return Response.json({ error: "Session ID required" }, { status: 400 });
  }

  const sessionsDir = getSessionsDir();
  const deleted = await deleteSession(sessionsDir, id);

  if (!deleted) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
};
