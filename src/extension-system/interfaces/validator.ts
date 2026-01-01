export type Violation = {
	type: string;
	term: string;
	message: string;
	suggestion?: string;
};

export type ValidationContext = {
	worldId: string;
	timestamp?: number;
	data?: Record<string, unknown>;
};

export type Validator = {
	name: string;
	check: (prompt: string, context: ValidationContext) => Promise<Violation[]>;
};
