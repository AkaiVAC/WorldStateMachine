import type { Fact } from "./fact";

type FactStore = {
	add: (fact: Fact) => void;
	getBySubject: (subject: string) => Fact[];
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
	};
};
