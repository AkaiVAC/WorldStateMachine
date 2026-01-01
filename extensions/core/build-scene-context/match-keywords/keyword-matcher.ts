import type { LorebookEntry } from "./lorebook-entry";

export type MatchResult = {
	entry: LorebookEntry;
	matchedKeyword: string;
};

export const matchEntries = (
	message: string,
	entries: LorebookEntry[],
): MatchResult[] => {
	if (!message) {
		return [];
	}

	const results: MatchResult[] = [];
	const messageLower = message.toLowerCase();

	for (const entry of entries) {
		for (const keyword of entry.keys) {
			if (!keyword) {
				continue;
			}

			const keywordLower = keyword.toLowerCase();
			const pattern = new RegExp(`\\b${escapeRegex(keywordLower)}\\b`, "i");

			if (pattern.test(messageLower)) {
				results.push({ entry, matchedKeyword: keyword });
				break;
			}
		}
	}

	return results;
};

const escapeRegex = (str: string): string => {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
