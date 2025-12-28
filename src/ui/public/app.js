const state = {
    entries: [],
    history: [],
    manualEntries: new Set(),
    excludeEntries: new Set(),
    lastInjected: [],
    lastSystemPrompt: '',
};

async function init() {
    await loadLorebook();
    setupChatForm();
}

async function loadLorebook() {
    const res = await fetch('/api/lorebook');
    const data = await res.json();
    state.entries = data.entries;
    renderLorebook(data.entries, data.groups);
}

function renderLorebook(entries, groups) {
    const container = document.getElementById('lorebook-entries');
    container.innerHTML = '';

    const grouped = {};
    for (const entry of entries) {
        const group = entry.group || 'Other';
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(entry);
    }

    for (const group of [...groups, 'Other'].filter((g) => grouped[g])) {
        if (!grouped[group]) continue;

        const header = document.createElement('div');
        header.className = 'group-header';
        header.textContent = group;
        container.appendChild(header);

        for (const entry of grouped[group]) {
            const div = document.createElement('div');
            div.className = 'entry';
            div.dataset.id = entry.id;
            div.innerHTML = `
                <div class="entry-name">${escapeHtml(entry.name)}</div>
                <div class="entry-group">${escapeHtml(
                    entry.keys.slice(0, 3).join(', ')
                )}</div>
            `;
            div.onclick = () => toggleEntry(entry.id, div);
            container.appendChild(div);
        }
    }
}

function toggleEntry(id, element) {
    if (state.manualEntries.has(id)) {
        state.manualEntries.delete(id);
        element.classList.remove('active');
    } else {
        state.manualEntries.add(id);
        element.classList.add('active');
    }
}

function setupChatForm() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('message-input');
    const button = form.querySelector('button');

    form.onsubmit = async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        appendMessage('user', message);
        input.value = '';
        button.disabled = true;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    history: state.history,
                    manualEntries: [...state.manualEntries],
                    excludeEntries: [...state.excludeEntries],
                }),
            });

            const data = await res.json();

            state.history.push({ role: 'user', content: message });
            state.history.push({ role: 'assistant', content: data.response });

            appendMessage('assistant', data.response);
            updateDebug(data);
            highlightMatchedEntries(data.injectedEntries);
        } catch (err) {
            appendMessage('assistant', `Error: ${err.message}`);
        } finally {
            button.disabled = false;
            input.focus();
        }
    };

    input.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.requestSubmit();
        }
    };
}

function appendMessage(role, content) {
    const container = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = content;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function updateDebug(data) {
    const injectedList = data.injectedEntries
        .map(
            (e) =>
                `- ${e.name} (${e.reason}${
                    e.matchedKeyword ? `: "${e.matchedKeyword}"` : ''
                })`
        )
        .join('\n');

    document.getElementById('injected-context').textContent =
        injectedList || '(none)';
    document.getElementById('full-prompt').textContent = data.systemPrompt;
}

function highlightMatchedEntries(injected) {
    document.querySelectorAll('.entry.matched').forEach((el) => {
        el.classList.remove('matched');
    });

    const injectedIds = new Set(injected.map((e) => e.id));
    document.querySelectorAll('.entry').forEach((el) => {
        if (injectedIds.has(el.dataset.id)) {
            el.classList.add('matched');
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
