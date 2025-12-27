export type Violation = {
	type: string;
	term: string;
	message: string;
	suggestion?: string;
};

export type Rule = {
	check: (prompt: string) => Promise<Violation[]>;
};

export const validate = async (
	prompt: string,
	rules: Rule[],
): Promise<Violation[]> => {
	const results = await Promise.all(rules.map((rule) => rule.check(prompt)));
	return results.flat();
};
