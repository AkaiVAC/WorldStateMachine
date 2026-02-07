import { join } from "node:path";
import type { EntityStore } from "@ext/core/2-store-timeline/memory-entity-store/entity-store";
import { createEntityStore } from "@ext/core/2-store-timeline/memory-entity-store/entity-store";
import type { RelationshipStore } from "@ext/core/2-store-timeline/memory-relationship-store/relationship-store";
import { createRelationshipStore } from "@ext/core/2-store-timeline/memory-relationship-store/relationship-store";
import type { LorebookEntry } from "@ext/core/4-build-scene-context/lorebook-entry";
import { loadLorebooksFromDir } from "@ext/core/4-build-scene-context/lorebook-loader";
import { excelsiaRelationships } from "../../../../../src/example/Excelsia/relationships";

export const WORLD_ID = "excelsia";

let cachedEntries: LorebookEntry[] | null = null;
let cachedRelationshipStore: RelationshipStore | null = null;
let cachedEntityStore: EntityStore | null = null;

const getExcelsiaPath = () => {
  return join(import.meta.dir, "../../../../../src/example/Excelsia");
};

export const getLorebookEntries = async (): Promise<LorebookEntry[]> => {
  if (cachedEntries) {
    return cachedEntries;
  }

  cachedEntries = await loadLorebooksFromDir(getExcelsiaPath());
  return cachedEntries;
};

export const getEntityStore = async (): Promise<EntityStore> => {
  if (cachedEntityStore) return cachedEntityStore;

  const entries = await getLorebookEntries();
  cachedEntityStore = createEntityStore();
  for (const entry of entries) {
    cachedEntityStore.add({
      id: entry.id,
      name: entry.name,
      aliases: entry.keys,
      group: entry.group,
      worldId: WORLD_ID,
    });
  }
  return cachedEntityStore;
};

export const getRelationshipStore = (): RelationshipStore => {
  if (cachedRelationshipStore) {
    return cachedRelationshipStore;
  }

  cachedRelationshipStore = createRelationshipStore();
  for (const rel of excelsiaRelationships) {
    cachedRelationshipStore.add(rel);
  }
  return cachedRelationshipStore;
};

export const lorebookHandler = async (): Promise<Response> => {
  const entries = await getLorebookEntries();

  const groups = [...new Set(entries.map((e) => e.group).filter(Boolean))];

  return Response.json({
    entries: entries.map((e) => ({
      id: e.id,
      name: e.name,
      group: e.group,
      keys: e.keys,
      content: e.content,
    })),
    groups,
  });
};
