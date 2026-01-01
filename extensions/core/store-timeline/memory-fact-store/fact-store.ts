import type { Fact } from "@core/fact";

export type FactStore = {
	add: (fact: Fact) => void;
	getBySubject: (subject: string) => Fact[];
	getAll: () => Fact[];
	getFactsAt: (timestamp: number) => Fact[];
};

export const createFactStore = (): FactStore => {
	const facts: Fact[] = [];

	return {
		add: (fact) => {
			facts.push(fact);
		},
		getBySubject: (subject) => {
			return facts.filter((f) => f.subject === subject);
		},
		getAll: () => {
			return [...facts];
		},
		getFactsAt: (timestamp) => {
			return facts.filter((f) => {
				const afterStart =
					f.validFrom === undefined || timestamp >= f.validFrom;
				const beforeEnd = f.validTo === undefined || timestamp < f.validTo;
				return afterStart && beforeEnd;
			});
		},
	};
};
