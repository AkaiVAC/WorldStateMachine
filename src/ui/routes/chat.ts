import { type ChatMessage, chat } from "../../llm/openrouter";
import { matchEntries } from "../../retrieval/keyword-matcher";
import type { LorebookEntry } from "../../retrieval/lorebook-entry";
import { getLorebookEntries } from "./lorebook";

type ChatRequest = {
	message: string;
	history: Array<{ role: "user" | "assistant"; content: string }>;
	character?: string;
	manualEntries?: string[];
	excludeEntries?: string[];
};

type InjectedEntry = {
	id: string;
	name: string;
	reason: "auto" | "manual";
	matchedKeyword?: string;
};

type ChatResponse = {
	response: string;
	injectedEntries: InjectedEntry[];
	systemPrompt: string;
};

const WORLD_CONTEXT = `You are roleplaying in Excelsia, a medieval fantasy world with eight kingdoms.
Stay in character. Respond as the characters would, using their knowledge and personality.
Do not break character or reference the real world.`;

export const chatHandler = async (req: Request): Promise<Response> => {
	const body = (await req.json()) as ChatRequest;
	const { message, history, manualEntries = [], excludeEntries = [] } = body;

	const allEntries = await getLorebookEntries();

	const autoMatched = matchEntries(message, allEntries);
	const autoMatchedIds = new Set(autoMatched.map((m) => m.entry.id));
	const excludeSet = new Set(excludeEntries);

	const injectedEntries: InjectedEntry[] = [];
	const entriesToInject: LorebookEntry[] = [];

	for (const match of autoMatched) {
		if (!excludeSet.has(match.entry.id)) {
			entriesToInject.push(match.entry);
			injectedEntries.push({
				id: match.entry.id,
				name: match.entry.name,
				reason: "auto",
				matchedKeyword: match.matchedKeyword,
			});
		}
	}

	for (const entryId of manualEntries) {
		if (!autoMatchedIds.has(entryId)) {
			const entry = allEntries.find((e) => e.id === entryId);
			if (entry) {
				entriesToInject.push(entry);
				injectedEntries.push({
					id: entry.id,
					name: entry.name,
					reason: "manual",
				});
			}
		}
	}

	const lorebookContext = entriesToInject
		.map((e) => `[${e.name}]\n${e.content}`)
		.join("\n\n");

	const systemPrompt = lorebookContext
		? `${WORLD_CONTEXT}\n\n--- LOREBOOK ---\n${lorebookContext}`
		: WORLD_CONTEXT;

	const messages: ChatMessage[] = [
		{ role: "system", content: systemPrompt },
		...history.map(
			(h) => ({ role: h.role, content: h.content }) as ChatMessage,
		),
		{ role: "user", content: message },
	];

	const response = await chat(messages, {
		model: "anthropic/claude-sonnet-4",
	});

	const chatResponse: ChatResponse = {
		response,
		injectedEntries,
		systemPrompt,
	};

	return Response.json(chatResponse);
};
