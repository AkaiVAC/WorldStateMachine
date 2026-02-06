import type { Relationship } from "@core/relationship";
import { defineExtension } from "@ext-system/define-extension";

export type RelationshipStore = {
  add: (relationship: Relationship) => void;
  getByEntity: (entityId: string) => Relationship[];
  getFrom: (entityId: string) => Relationship[];
  getTo: (entityId: string) => Relationship[];
  getByType: (type: string) => Relationship[];
  getAll: () => Relationship[];
};

export const createRelationshipStore = (): RelationshipStore => {
  const relationships: Relationship[] = [];

  return {
    add: (relationship) => {
      relationships.push(relationship);
    },
    getByEntity: (entityId) => {
      return relationships.filter(
        (r) => r.from === entityId || r.to === entityId,
      );
    },
    getFrom: (entityId) => {
      return relationships.filter((r) => r.from === entityId);
    },
    getTo: (entityId) => {
      return relationships.filter((r) => r.to === entityId);
    },
    getByType: (type) => {
      return relationships.filter((r) => r.type === type);
    },
    getAll: () => [...relationships],
  };
};

export default defineExtension({
  name: "@core/memory-relationship-store",
  version: "1.0.0",
  kind: "store",
  activate: (context) => {
    context.relationshipStore = createRelationshipStore();
    return undefined;
  },
});
