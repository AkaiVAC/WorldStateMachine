import type { AppState, LorebookEntry } from '../state.ts';
import { escapeHtml, getElement } from '../utils/dom.ts';

export const renderLorebook = (
    entries: LorebookEntry[],
    groups: string[],
    state: AppState
): void => {
    const container = getElement<HTMLDivElement>('lorebook-entries');
    container.innerHTML = '';

    const fragment = document.createDocumentFragment();
    const grouped: Record<string, LorebookEntry[]> = {};
    for (const entry of entries) {
        const group = entry.group || 'Other';
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(entry);
    }

    for (const group of [...groups, 'Other'].filter((g) => grouped[g])) {
        const header = document.createElement('div');
        header.className = 'group-header';
        header.textContent = group;
        fragment.appendChild(header);

        for (const entry of grouped[group] || []) {
            const div = document.createElement('div');
            div.className = state.manualEntries.has(entry.id)
                ? 'entry active'
                : 'entry';
            div.dataset.id = entry.id;
            div.innerHTML = `
				<div class="entry-name">${escapeHtml(entry.name)}</div>
				<div class="entry-group">${escapeHtml(entry.keys.slice(0, 3).join(', '))}</div>
			`;
            div.onclick = () => toggleEntry(entry.id, div, state);
            fragment.appendChild(div);
        }
    }

    container.appendChild(fragment);
};

export const toggleEntry = (
    id: string,
    element: HTMLElement,
    state: AppState
): void => {
    if (state.manualEntries.has(id)) {
        state.manualEntries.delete(id);
        element.classList.remove('active');
    } else {
        state.manualEntries.add(id);
        element.classList.add('active');
    }
};
