import type { Entity } from "../../../../src/core-types";

export type EntityStore = {
	add: (entity: Entity) => void;
	getById: (id: string) => Entity | undefined;
	getByName: (worldId: string, name: string) => Entity | undefined;
	getByGroup: (worldId: string, group: string) => Entity[];
	getAllByWorld: (worldId: string) => Entity[];
};

export const createEntityStore = (): EntityStore => {
	const entities: Entity[] = [];

	const matchesName = (entity: Entity, name: string): boolean => {
		const lowerName = name.toLowerCase();
		if (entity.name.toLowerCase() === lowerName) {
			return true;
		}
		return entity.aliases.some((alias) => alias.toLowerCase() === lowerName);
	};

	return {
		add: (entity) => {
			entities.push(entity);
		},
		getById: (id) => {
			return entities.find((e) => e.id === id);
		},
		getByName: (worldId, name) => {
			return entities.find(
				(e) => e.worldId === worldId && matchesName(e, name),
			);
		},
		getByGroup: (worldId, group) => {
			return entities.filter((e) => e.worldId === worldId && e.group === group);
		},
		getAllByWorld: (worldId) => {
			return entities.filter((e) => e.worldId === worldId);
		},
	};
};
