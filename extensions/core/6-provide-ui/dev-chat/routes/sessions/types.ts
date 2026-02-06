export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Session = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  history: ChatMessage[];
  manualEntries: string[];
};

export type SessionSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  messageCount: number;
};

export type CreateSessionInput = {
  name: string;
  model: string;
};

export type UpdateSessionInput = Partial<
  Omit<Session, "id" | "createdAt" | "updatedAt">
>;
