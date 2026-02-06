import type { InjectedEntry } from "../state.ts";
import { getElement } from "../utils/dom.ts";
import { renderMarkdown } from "../utils/markdown.ts";

export const appendMessage = (
  role: "user" | "assistant",
  content: string,
): void => {
  const container = getElement<HTMLDivElement>("messages");
  const div = document.createElement("div");
  div.className = `message ${role}`;

  if (role === "assistant") {
    div.innerHTML = renderMarkdown(content);
  } else {
    div.textContent = content;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
};

export const updateDebug = (data: {
  injectedEntries: InjectedEntry[];
  systemPrompt: string;
}): void => {
  const injectedList = data.injectedEntries
    .map(
      (e) =>
        `- ${e.name} (${e.reason}${e.matchedKeyword ? `: "${e.matchedKeyword}"` : ""})`,
    )
    .join("\n");

  getElement<HTMLPreElement>("injected-context").textContent =
    injectedList || "(none)";
  getElement<HTMLPreElement>("full-prompt").textContent = data.systemPrompt;
};

export const highlightMatchedEntries = (injected: InjectedEntry[]): void => {
  document.querySelectorAll(".entry.matched").forEach((el) => {
    el.classList.remove("matched");
  });

  const injectedIds = new Set(injected.map((e) => e.id));
  document.querySelectorAll<HTMLElement>(".entry").forEach((el) => {
    if (el.dataset.id && injectedIds.has(el.dataset.id)) {
      el.classList.add("matched");
    }
  });
};
