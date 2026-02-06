import type { GraphTraversal } from "@ext/core/2-store-timeline/memory-relationship-store/graph-traversal";
import type { RelationshipStore } from "@ext/core/2-store-timeline/memory-relationship-store/relationship-store";
import type { LorebookEntry } from "@ext/core/4-build-scene-context/lorebook-entry";
import { defineExtension } from "@ext-system/define-extension";

export type ExpansionOptions = {
  maxDepth?: number;
  relationshipTypes?: string[];
};

export type RelationshipRetrieval = {
  expandViaRelationships: (
    matchedEntryIds: string[],
    options?: ExpansionOptions,
  ) => LorebookEntry[];
};

export const createRelationshipRetrieval = (
  relationshipStore: RelationshipStore,
  graphTraversal: GraphTraversal,
  allEntries: LorebookEntry[],
): RelationshipRetrieval => {
  const expandViaRelationships = (
    matchedEntryIds: string[],
    options: ExpansionOptions = {},
  ): LorebookEntry[] => {
    const { maxDepth = 2 } = options;

    const relatedIds = new Set<string>();

    for (const entryId of matchedEntryIds) {
      const connected = graphTraversal.findConnected(
        relationshipStore,
        entryId,
        {
          maxDepth,
          relationshipTypes: options.relationshipTypes,
        },
      );

      for (const id of connected) {
        relatedIds.add(id);
      }
    }

    const alreadyMatched = new Set(matchedEntryIds);
    const additionalEntries: LorebookEntry[] = [];

    for (const id of relatedIds) {
      if (!alreadyMatched.has(id)) {
        const entry = allEntries.find((e) => e.id === id);
        if (entry) {
          additionalEntries.push(entry);
        }
      }
    }

    return additionalEntries;
  };

  return {
    expandViaRelationships,
  };
};

export default defineExtension({
  name: "@core/relationship-retrieval",
  version: "1.0.0",
  kind: "contextBuilder",
  activate: () => ({
    contextBuilders: [createRelationshipRetrieval],
  }),
});
