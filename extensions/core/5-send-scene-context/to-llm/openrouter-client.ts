import { defineExtension } from "@ext-system/define-extension";

const DEFAULT_MODEL = "xiaomi/mimo-v2-flash:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";


export type FetchFn = (url: string, options: RequestInit) => Promise<Response>;

export type ChatMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

type AskOptions = {
	model?: string;
	fetchFn?: FetchFn;
};

type ChatOptions = AskOptions;

export const ask = async (
	prompt: string,
	options: AskOptions = {},
): Promise<string> => {
	const { model = DEFAULT_MODEL, fetchFn = fetch } = options;
	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error("OPENROUTER_API_KEY environment variable is not set");
	}

	const response = await fetchFn(OPENROUTER_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model,
			messages: [{ role: "user", content: prompt }],
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error?.message ?? "OpenRouter API error");
	}

	return data.choices[0].message.content;
};

export const chat = async (
	messages: ChatMessage[],
	options: ChatOptions = {},
): Promise<string> => {
	const { model = DEFAULT_MODEL, fetchFn = fetch } = options;
	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error("OPENROUTER_API_KEY environment variable is not set");
	}

	const response = await fetchFn(OPENROUTER_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model,
			messages,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error?.message ?? "OpenRouter API error");
	}

	return data.choices[0].message.content;
};

export default defineExtension({
	name: "@core/openrouter",
	version: "1.0.0",
	kind: "sender",
	activate: () => ({
		senders: [chat],
	}),
});

