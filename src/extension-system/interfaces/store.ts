import type {
    Entity,
    Event,
    Fact,
    Relationship,
    Visibility,
} from "../../core-types";

export type FactStore = {
    add: (fact: Fact) => void;
    getAll: () => Fact[];
    getBySubject: (subject: string, worldId: string) => Fact[];
    getAt: (subject: string, timestamp: number, worldId: string) => Fact[];
};

export type EntityStore = {
    add: (entity: Entity) => void;
    getAll: () => Entity[];
    getById: (id: string, worldId: string) => Entity | undefined;
    getByName: (name: string, worldId: string) => Entity | undefined;
    getByAlias: (alias: string, worldId: string) => Entity[];
};

export type EventStore = {
    add: (event: Event) => void;
    getAll: () => Event[];
    getByParticipant: (entityId: string, worldId: string) => Event[];
    getByTimestamp: (timestamp: number, worldId: string) => Event[];
    getByLocation: (locationId: string, worldId: string) => Event[];
    getByVisibility: (visibility: Visibility, worldId: string) => Event[];
};

export type RelationshipStore = {
    add: (relationship: Relationship) => void;
    getAll: () => Relationship[];
    getByFrom: (fromId: string, worldId: string) => Relationship[];
    getByTo: (toId: string, worldId: string) => Relationship[];
    getByType: (type: string, worldId: string) => Relationship[];
};
