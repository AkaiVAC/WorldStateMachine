import type { PromptAnalyzer } from "../analysis/prompt-analyzer";
import type { EntityStore } from "../world-state/entity/entity-store";
import type { Rule, Violation } from "./validator";

const isFuzzyMatch = (term: string, candidate: string): boolean => {
	if (candidate.includes(term)) return true;
	if (term.includes(candidate)) {
		if (candidate.length > 3) return true;
		const tokens = term.split(/[\s\p{P}]+/u);
		return tokens.includes(candidate);
	}
	return false;
};

const findSimilarEntity = (
	term: string,
	entityStore: EntityStore,
	worldId: string,
): string | undefined => {
	const lowerTerm = term.toLowerCase();
	const entities = entityStore.getAllByWorld(worldId);

	for (const entity of entities) {
		if (isFuzzyMatch(lowerTerm, entity.name.toLowerCase())) {
			return entity.name;
		}
		for (const alias of entity.aliases) {
			if (isFuzzyMatch(lowerTerm, alias.toLowerCase())) {
				return entity.name;
			}
		}
	}

	return undefined;
};

type EntityExistsRuleOptions = {
	analyzer: PromptAnalyzer;
	entityStore: EntityStore;
	worldId: string;
};

export const createEntityExistsRule = (
	options: EntityExistsRuleOptions,
): Rule => {
	const { analyzer, entityStore, worldId } = options;

	return {
		check: async (prompt: string): Promise<Violation[]> => {
			const { entityReferences } = await analyzer.analyze(prompt);

			const violations: Violation[] = [];
			for (const term of entityReferences) {
				if (!entityStore.getByName(worldId, term)) {
					const suggestion = findSimilarEntity(term, entityStore, worldId);
					violations.push({
						type: "unknown-entity",
						term,
						message: suggestion
							? `Unknown entity: ${term}. Did you mean ${suggestion}?`
							: `Unknown entity: ${term}`,
						suggestion,
					});
				}
			}
			return violations;
		},
	};
};
