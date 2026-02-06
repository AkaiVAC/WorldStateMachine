import type {
  Rule,
  Violation,
} from "@ext/core/3-validate-consistency/validation-framework/validator";
import { createValidator } from "@ext/core/3-validate-consistency/validation-framework/validator";
import type { PromptAnalyzer } from "@ext/core/4-build-scene-context/analyze-prompt/prompt-analyzer";
import { defineExtension } from "@ext-system/define-extension";

type WorldBoundaryRuleOptions = {
  analyzer: PromptAnalyzer;
  worldSetting: string;
};

export const createWorldBoundaryRule = (
  options: WorldBoundaryRuleOptions,
): Rule => {
  const { analyzer, worldSetting } = options;

  return {
    check: async (prompt: string): Promise<Violation[]> => {
      const { anachronisms } = await analyzer.analyze(prompt);

      return anachronisms.map((term) => ({
        type: "world-boundary",
        term,
        message: `"${term}" may not fit in a ${worldSetting} setting`,
      }));
    },
  };
};

export type WorldBoundaryValidatorOptions = WorldBoundaryRuleOptions;

export const createWorldBoundaryValidator = (
  options: WorldBoundaryValidatorOptions,
) => createValidator([createWorldBoundaryRule(options)]);

export default defineExtension({
  name: "@core/world-boundary-validator",
  version: "1.0.0",
  kind: "validator",
  activate: () => ({
    validators: [createWorldBoundaryValidator],
  }),
});
