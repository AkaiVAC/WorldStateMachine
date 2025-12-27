import type { EntityStore } from "../world-state/entity/entity-store";
import type { Lexicon } from "../world-state/lexicon/lexicon";
import type { Rule, Violation } from "./validator";

type AskFn = (prompt: string) => Promise<string>;

type WorldBoundaryRuleOptions = {
	askFn: AskFn;
	entityStore: EntityStore;
	lexicon: Lexicon;
	worldId: string;
	worldSetting: string;
};

const cleanWord = (word: string): string => {
	return word.replace(/[.,!?;:'"]+$/g, "").replace(/^['"]+/g, "");
};

const extractTerms = (prompt: string): string[] => {
	return prompt
		.split(/\s+/)
		.map(cleanWord)
		.filter((w) => w.length > 0);
};

const buildPrompt = (term: string, worldSetting: string): string => {
	return `Does the word "${term}" fit in a ${worldSetting} setting? Answer only YES or NO.`;
};

export const createWorldBoundaryRule = (
	options: WorldBoundaryRuleOptions,
): Rule => {
	const { askFn, entityStore, lexicon, worldId, worldSetting } = options;

	return {
		check: async (prompt: string): Promise<Violation[]> => {
			const terms = extractTerms(prompt);
			if (terms.length === 0) return [];

			const violations: Violation[] = [];

			for (const term of terms) {
				if (entityStore.getByName(worldId, term)) continue;
				if (lexicon.hasTerm(worldId, term)) continue;

				const llmPrompt = buildPrompt(term, worldSetting);
				const response = await askFn(llmPrompt);

				if (response.toUpperCase().includes("NO")) {
					violations.push({
						type: "world-boundary",
						term,
						message: `"${term}" may not fit in a ${worldSetting} setting`,
					});
				}
			}

			return violations;
		},
	};
};
