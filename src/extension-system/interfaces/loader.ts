import type { Entity, Event, Fact, Relationship } from "../../core-types";

export type SkippedEntry = {
	key: string;
	reason: string;
};

export type LoadResult = {
	entities: Entity[];
	events?: Event[];
	facts?: Fact[];
	relationships?: Relationship[];
	skipped?: SkippedEntry[];
};

export type WorldDataLoader = {
	name: string;
	canHandle: (filePath: string) => boolean;
	load: (filePath: string, worldId: string) => Promise<LoadResult>;
};
