import type { EntityStore } from "../world-state/entity/entity-store";
import type { Rule, Violation } from "./validator";

const STOP_WORDS = new Set([
	"i",
	"me",
	"my",
	"myself",
	"we",
	"our",
	"ours",
	"you",
	"your",
	"he",
	"him",
	"his",
	"she",
	"her",
	"it",
	"its",
	"they",
	"them",
	"the",
	"a",
	"an",
	"and",
	"but",
	"or",
	"for",
	"nor",
	"on",
	"at",
	"to",
	"from",
	"by",
	"with",
	"in",
	"out",
	"is",
	"are",
	"was",
	"were",
	"be",
	"been",
	"being",
	"have",
	"has",
	"had",
	"do",
	"does",
	"did",
	"will",
	"would",
	"could",
	"should",
	"may",
	"might",
	"must",
	"shall",
	"can",
	"of",
	"that",
	"this",
	"these",
	"those",
	"am",
	"as",
	"if",
	"then",
	"so",
	"than",
	"too",
	"very",
	"just",
	"also",
	"now",
	"here",
	"there",
	"when",
	"where",
	"why",
	"how",
	"all",
	"each",
	"every",
	"both",
	"few",
	"more",
	"most",
	"other",
	"some",
	"such",
	"no",
	"not",
	"only",
	"own",
	"same",
	"into",
	"over",
	"after",
	"before",
	"between",
	"under",
	"again",
	"further",
	"once",
	"during",
	"while",
	"about",
	"against",
	"through",
	"above",
	"below",
	"up",
	"down",
	"off",
	"because",
	"until",
	"although",
	"find",
	"enter",
	"arrived",
	"visited",
	"met",
	"saw",
	"walk",
	"today",
	"yesterday",
	"garden",
]);

const TITLE_WORDS = new Set([
	"king",
	"queen",
	"prince",
	"princess",
	"lord",
	"lady",
	"duke",
	"duchess",
	"count",
	"countess",
	"baron",
	"baroness",
	"emperor",
	"empress",
	"knight",
	"sir",
	"dame",
]);

const isCapitalized = (word: string): boolean => {
	const first = word[0];
	return first === first?.toUpperCase() && first !== first?.toLowerCase();
};

const cleanWord = (word: string): string => {
	return word.replace(/[.,!?;:'"]+$/g, "").replace(/^['"]+/g, "");
};

const findSimilarEntity = (
	term: string,
	entityStore: EntityStore,
	worldId: string,
): string | undefined => {
	const lowerTerm = term.toLowerCase();
	const entities = entityStore.getAllByWorld(worldId);

	for (const entity of entities) {
		const lowerName = entity.name.toLowerCase();
		if (lowerName.includes(lowerTerm) || lowerTerm.includes(lowerName)) {
			return entity.name;
		}
		for (const alias of entity.aliases) {
			const lowerAlias = alias.toLowerCase();
			if (lowerAlias.includes(lowerTerm) || lowerTerm.includes(lowerAlias)) {
				return entity.name;
			}
		}
	}

	return undefined;
};

export const createEntityExistsRule = (
	entityStore: EntityStore,
	worldId: string,
): Rule => {
	return {
		check: async (prompt: string): Promise<Violation[]> => {
			const words = prompt.split(/\s+/).map(cleanWord).filter(Boolean);

			const candidates = words.filter((word) => {
				const lower = word.toLowerCase();
				if (STOP_WORDS.has(lower)) return false;
				if (word.length <= 1) return false;
				if (TITLE_WORDS.has(lower)) return true;
				return isCapitalized(word);
			});

			const violations: Violation[] = [];
			for (const word of candidates) {
				if (!entityStore.getByName(worldId, word)) {
					const suggestion = findSimilarEntity(word, entityStore, worldId);
					violations.push({
						type: "unknown-entity",
						term: word,
						message: suggestion
							? `Unknown entity: ${word}. Did you mean ${suggestion}?`
							: `Unknown entity: ${word}`,
						suggestion,
					});
				}
			}
			return violations;
		},
	};
};
