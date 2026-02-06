export type LorebookEntry = {
  id: string;
  name: string;
  keys: string[];
  content: string;
  group: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type InjectedEntry = {
  id: string;
  name: string;
  reason: "auto" | "manual" | "entity";
  matchedKeyword?: string;
};

export const DEFAULT_MODEL = "anthropic/claude-sonnet-4";

export type AppState = {
  entries: LorebookEntry[];
  history: ChatMessage[];
  manualEntries: Set<string>;
  excludeEntries: Set<string>;
  lastInjected: InjectedEntry[];
  lastSystemPrompt: string;
  model: string;
};

export const createState = (): AppState => ({
  entries: [],
  history: [],
  manualEntries: new Set(),
  excludeEntries: new Set(),
  lastInjected: [],
  lastSystemPrompt: "",
  model: DEFAULT_MODEL,
});

export const state = createState();
