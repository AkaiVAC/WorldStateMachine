import type { LorebookEntry } from "../lorebook-entry";

export type EntityMatch = {
	entry: LorebookEntry;
	matchedTerm: string;
};

const isFuzzyMatch = (term: string, candidate: string): boolean => {
	const lowerTerm = term.toLowerCase();
	const lowerCandidate = candidate.toLowerCase();

	if (lowerCandidate === lowerTerm) return true;
	if (lowerCandidate.includes(lowerTerm)) return true;
	if (lowerTerm.includes(lowerCandidate) && lowerCandidate.length > 3) {
		return true;
	}

	const stemmedTerm = lowerTerm.replace(/n$|ian$|an$|s$/, "");
	const stemmedCandidate = lowerCandidate.replace(/n$|ian$|an$|s$/, "");
	if (stemmedCandidate.includes(stemmedTerm) && stemmedTerm.length > 3) {
		return true;
	}
	if (stemmedTerm.includes(stemmedCandidate) && stemmedCandidate.length > 3) {
		return true;
	}

	return false;
};

const findMatchingEntry = (
	term: string,
	entries: LorebookEntry[],
): LorebookEntry | undefined => {
	for (const entry of entries) {
		if (isFuzzyMatch(term, entry.name)) {
			return entry;
		}
		for (const key of entry.keys) {
			if (isFuzzyMatch(term, key)) {
				return entry;
			}
		}
	}
	return undefined;
};

export const matchEntitiesFuzzy = (
	entityTerms: string[],
	entries: LorebookEntry[],
): EntityMatch[] => {
	const matches: EntityMatch[] = [];
	const matchedIds = new Set<string>();

	for (const term of entityTerms) {
		const entry = findMatchingEntry(term, entries);
		if (entry && !matchedIds.has(entry.id)) {
			matchedIds.add(entry.id);
			matches.push({ entry, matchedTerm: term });
		}
	}

	return matches;
};
