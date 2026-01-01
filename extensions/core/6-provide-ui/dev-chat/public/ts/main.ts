import { sendMessage } from "./api/chat.ts";
import { fetchLorebook } from "./api/lorebook.ts";
import { fetchModels } from "./api/models.ts";
import {
	appendMessage,
	highlightMatchedEntries,
	updateDebug,
} from "./components/chat-messages.ts";
import { renderLorebook } from "./components/lorebook-list.ts";
import { state } from "./state.ts";
import { getElement } from "./utils/dom.ts";

const loadLorebook = async (): Promise<void> => {
	const data = await fetchLorebook();
	state.entries = data.entries;
	renderLorebook(data.entries, data.groups, state);
};

const setupChatForm = (): void => {
	const form = getElement<HTMLFormElement>("chat-form");
	const input = getElement<HTMLTextAreaElement>("message-input");
	const button = form.querySelector("button");

	if (!button) return;

	form.onsubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const message = input.value.trim();
		if (!message) return;

		appendMessage("user", message);
		input.value = "";
		button.disabled = true;

		try {
			const data = await sendMessage(message, state);

			state.history.push({ role: "user", content: message });
			state.history.push({ role: "assistant", content: data.response });

			appendMessage("assistant", data.response);
			updateDebug(data);
			highlightMatchedEntries(data.injectedEntries);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			appendMessage("assistant", `Error: ${errorMessage}`);
		} finally {
			button.disabled = false;
			input.focus();
		}
	};

	input.onkeydown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			form.requestSubmit();
		}
	};
};

const setupModelSelector = async (): Promise<void> => {
	const select = getElement<HTMLSelectElement>("model-select");
	const models = await fetchModels();

	for (const model of models) {
		const option = document.createElement("option");
		option.value = model.id;
		option.textContent = model.name;
		if (model.id === state.model) {
			option.selected = true;
		}
		select.appendChild(option);
	}

	select.onchange = () => {
		state.model = select.value;
	};
};

const init = async (): Promise<void> => {
	await Promise.all([setupModelSelector(), loadLorebook()]);
	setupChatForm();
};

init();
