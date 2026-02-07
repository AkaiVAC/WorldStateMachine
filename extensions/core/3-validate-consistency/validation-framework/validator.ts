export type Violation = {
  type: string;
  term: string;
  message: string;
  suggestion?: string;
};

export type Rule = {
  check: (prompt: string) => Promise<Violation[]>;
};

export type Validator = {
  validate: (prompt: string) => Promise<Violation[]>;
};

export const validate = async (
  prompt: string,
  rules: Rule[],
): Promise<Violation[]> => {
  const results = await Promise.all(rules.map((rule) => rule.check(prompt)));
  return results.flat();
};

export const createValidator = (rules: Rule[]): Validator => ({
  validate: (prompt) => validate(prompt, rules),
});
