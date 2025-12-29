import type { Fact } from "../fact/fact";

export type Visibility = "private" | "restricted" | "public";

export type Event = {
	id: string;
	worldId: string;
	timestamp: number;
	title: string;
	location?: string;
	participants: string[];
	visibility: Visibility;
	outcomes?: Fact[];
	prose?: string;
};
