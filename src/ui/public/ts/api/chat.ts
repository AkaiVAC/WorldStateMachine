import type { AppState, ChatMessage, InjectedEntry } from "../state.ts";

export type ChatRequest = {
	message: string;
	history: ChatMessage[];
	model: string;
	manualEntries: string[];
	excludeEntries: string[];
};

export type ChatResponse = {
	response: string;
	injectedEntries: InjectedEntry[];
	systemPrompt: string;
};

export const sendMessage = async (
	message: string,
	state: AppState,
): Promise<ChatResponse> => {
	const res = await fetch("/api/chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			message,
			history: state.history,
			model: state.model,
			manualEntries: [...state.manualEntries],
			excludeEntries: [...state.excludeEntries],
		}),
	});
	return res.json();
};
