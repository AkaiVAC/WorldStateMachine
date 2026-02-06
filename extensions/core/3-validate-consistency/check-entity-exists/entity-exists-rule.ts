import type { EntityStore } from "@ext/core/2-store-timeline/memory-entity-store/entity-store";
import type {
  Rule,
  Violation,
} from "@ext/core/3-validate-consistency/validation-framework/validator";
import { createValidator } from "@ext/core/3-validate-consistency/validation-framework/validator";
import type { PromptAnalyzer } from "@ext/core/4-build-scene-context/analyze-prompt/prompt-analyzer";
import { defineExtension } from "@ext-system/define-extension";

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

export type EntityExistsValidatorOptions = EntityExistsRuleOptions;

export const createEntityExistsValidator = (
  options: EntityExistsValidatorOptions,
) => createValidator([createEntityExistsRule(options)]);

export default defineExtension({
  name: "@core/entity-exists-validator",
  version: "1.0.0",
  kind: "validator",
  activate: () => ({
    validators: [createEntityExistsValidator],
  }),
});
