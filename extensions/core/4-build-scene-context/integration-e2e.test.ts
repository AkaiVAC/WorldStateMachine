import { describe, expect, test } from "bun:test";
import { createGraphTraversal } from "@ext/core/2-store-timeline/memory-relationship-store/graph-traversal";
import { createRelationshipStore } from "@ext/core/2-store-timeline/memory-relationship-store/relationship-store";
import { createRelationshipRetrieval } from "@ext/core/4-build-scene-context/expand-relationships/relationship-retrieval";
import type { LorebookEntry } from "@ext/core/4-build-scene-context/lorebook-entry";
import { matchEntitiesFuzzy } from "@ext/core/4-build-scene-context/match-entities/entity-matcher";
import { matchEntries } from "@ext/core/4-build-scene-context/match-keywords/keyword-matcher";

describe("E2E: Context Retrieval with Relationship Graph", () => {
  test("Sunnarian Princess → finds both Sunnaria and Aradia", () => {
    const relationshipStore = createRelationshipStore();
    const traversal = createGraphTraversal();

    relationshipStore.add({
      worldId: "excelsia",
      from: "alaric",
      type: "rules",
      to: "sunnaria",
    });
    relationshipStore.add({
      worldId: "excelsia",
      from: "aradia",
      type: "daughter-of",
      to: "alaric",
    });
    relationshipStore.add({
      worldId: "excelsia",
      from: "aradia",
      type: "member-of",
      to: "royal-family",
    });
    relationshipStore.add({
      worldId: "excelsia",
      from: "alaric",
      type: "member-of",
      to: "royal-family",
    });

    const entries: LorebookEntry[] = [
      {
        id: "sunnaria",
        name: "Kingdom of Sunnaria",
        keys: ["sunnaria", "sunnarian"],
        content:
          "A prosperous medieval kingdom ruled by King Alaric and Queen Elara.",
        group: "Locations",
      },
      {
        id: "alaric",
        name: "King Alaric of Sunnaria",
        keys: ["alaric", "king alaric"],
        content: "The wise ruler of Sunnaria, father of Princess Aradia.",
        group: "Characters",
      },
      {
        id: "aradia",
        name: "Princess Aradia of Sunnaria",
        keys: ["aradia", "princess aradia"],
        content:
          "The intelligent and compassionate daughter of King Alaric and Queen Elara.",
        group: "Characters",
      },
      {
        id: "royal-family",
        name: "Sunnarian Royal Family",
        keys: ["royal family", "sunnarian royals"],
        content: "The ruling family of Sunnaria.",
        group: "Organizations",
      },
    ];

    const userPrompt = "The Sunnarian princess enters the garden.";

    const keywordMatches = matchEntries(userPrompt, entries);
    expect(keywordMatches).toHaveLength(1);
    expect(keywordMatches[0]?.entry.id).toBe("sunnaria");

    const entityTerms = ["Sunnarian", "princess"];
    const entityMatches = matchEntitiesFuzzy(entityTerms, entries);
    expect(entityMatches.length).toBeGreaterThanOrEqual(1);

    const matchedIds = new Set([
      ...keywordMatches.map((m) => m.entry.id),
      ...entityMatches.map((m) => m.entry.id),
    ]);

    const retrieval = createRelationshipRetrieval(
      relationshipStore,
      traversal,
      entries,
    );
    const relatedEntries = retrieval.expandViaRelationships(
      Array.from(matchedIds),
      { maxDepth: 2 },
    );

    const allContextIds = [...matchedIds, ...relatedEntries.map((e) => e.id)];

    expect(allContextIds).toContain("sunnaria");
    expect(allContextIds).toContain("aradia");
    expect(allContextIds).toContain("alaric");
  });

  test("Royal Gardens → finds Sunnaria via spatial containment", () => {
    const relationshipStore = createRelationshipStore();
    const traversal = createGraphTraversal();

    relationshipStore.add({
      worldId: "excelsia",
      from: "royal-gardens",
      type: "part-of",
      to: "sunnaria",
    });
    relationshipStore.add({
      worldId: "excelsia",
      from: "palace",
      type: "part-of",
      to: "sunnaria",
    });

    const entries: LorebookEntry[] = [
      {
        id: "royal-gardens",
        name: "Royal Gardens of Sunnaria",
        keys: ["royal gardens", "gardens"],
        content: "Beautiful gardens within the palace grounds.",
        group: "Locations",
      },
      {
        id: "sunnaria",
        name: "Kingdom of Sunnaria",
        keys: ["sunnaria"],
        content: "A prosperous medieval kingdom.",
        group: "Locations",
      },
      {
        id: "palace",
        name: "Sunnarian Palace",
        keys: ["palace"],
        content: "The royal seat of power.",
        group: "Locations",
      },
    ];

    const userPrompt = "I walk through the royal gardens.";

    const keywordMatches = matchEntries(userPrompt, entries);
    const matchedIds = keywordMatches.map((m) => m.entry.id);

    expect(matchedIds).toContain("royal-gardens");

    const retrieval = createRelationshipRetrieval(
      relationshipStore,
      traversal,
      entries,
    );
    const relatedEntries = retrieval.expandViaRelationships(matchedIds, {
      maxDepth: 2,
    });

    const allContextIds = [...matchedIds, ...relatedEntries.map((e) => e.id)];

    expect(allContextIds).toContain("sunnaria");
    expect(allContextIds).toContain("palace");
  });

  test("filters by relationship type: family only", () => {
    const relationshipStore = createRelationshipStore();
    const traversal = createGraphTraversal();

    relationshipStore.add({
      worldId: "excelsia",
      from: "aradia",
      type: "daughter-of",
      to: "alaric",
    });
    relationshipStore.add({
      worldId: "excelsia",
      from: "aradia",
      type: "knows",
      to: "guard",
    });

    const entries: LorebookEntry[] = [
      {
        id: "aradia",
        name: "Princess Aradia",
        keys: ["aradia"],
        content: "Princess of Sunnaria",
        group: "Characters",
      },
      {
        id: "alaric",
        name: "King Alaric",
        keys: ["alaric"],
        content: "King of Sunnaria",
        group: "Characters",
      },
      {
        id: "guard",
        name: "Royal Guard",
        keys: ["guard"],
        content: "Palace guard",
        group: "Characters",
      },
    ];

    const retrieval = createRelationshipRetrieval(
      relationshipStore,
      traversal,
      entries,
    );
    const relatedEntries = retrieval.expandViaRelationships(["aradia"], {
      maxDepth: 1,
      relationshipTypes: ["daughter-of", "son-of"],
    });

    expect(relatedEntries.map((e) => e.id)).toContain("alaric");
    expect(relatedEntries.map((e) => e.id)).not.toContain("guard");
  });
});

describe("E2E: Complex Story Scenarios", () => {
  const createDiplomaticWorld = () => {
    const store = createRelationshipStore();
    const traversal = createGraphTraversal();

    // Sunnaria royal family
    store.add({
      worldId: "excelsia",
      from: "alaric",
      type: "rules",
      to: "sunnaria",
    });
    store.add({
      worldId: "excelsia",
      from: "aradia",
      type: "daughter-of",
      to: "alaric",
    });
    store.add({
      worldId: "excelsia",
      from: "aradia",
      type: "member-of",
      to: "sunnaria",
    });

    // Lunaria royal family
    store.add({
      worldId: "excelsia",
      from: "cedric",
      type: "rules",
      to: "lunaria",
    });
    store.add({
      worldId: "excelsia",
      from: "isabella",
      type: "daughter-of",
      to: "cedric",
    });
    store.add({
      worldId: "excelsia",
      from: "isabella",
      type: "member-of",
      to: "lunaria",
    });

    // Kingdom borders
    store.add({
      worldId: "excelsia",
      from: "sunnaria",
      type: "borders",
      to: "lunaria",
    });

    // Trade relationships
    store.add({
      worldId: "excelsia",
      from: "sunnaria",
      type: "trades-with",
      to: "lunaria",
    });
    store.add({
      worldId: "excelsia",
      from: "golden-rivers",
      type: "part-of",
      to: "sunnaria",
    });
    store.add({
      worldId: "excelsia",
      from: "trade-guild",
      type: "operates-in",
      to: "sunnaria",
    });

    const entries: LorebookEntry[] = [
      {
        id: "sunnaria",
        name: "Kingdom of Sunnaria",
        keys: ["sunnaria", "sunnarian"],
        content: "Central trade hub ruled by King Alaric.",
        group: "Kingdoms",
      },
      {
        id: "lunaria",
        name: "Kingdom of Lunaria",
        keys: ["lunaria", "lunarian"],
        content: "Maritime kingdom ruled by King Cedric.",
        group: "Kingdoms",
      },
      {
        id: "alaric",
        name: "King Alaric",
        keys: ["alaric", "king alaric"],
        content: "Wise ruler of Sunnaria.",
        group: "Characters",
      },
      {
        id: "aradia",
        name: "Princess Aradia",
        keys: ["aradia", "princess aradia"],
        content: "Daughter of King Alaric.",
        group: "Characters",
      },
      {
        id: "cedric",
        name: "King Cedric",
        keys: ["cedric", "king cedric"],
        content: "Ruler of Lunaria.",
        group: "Characters",
      },
      {
        id: "isabella",
        name: "Princess Isabella",
        keys: ["isabella", "princess isabella"],
        content: "Daughter of King Cedric.",
        group: "Characters",
      },
      {
        id: "golden-rivers",
        name: "Golden Rivers",
        keys: ["golden rivers", "river trade"],
        content: "Major trade route through Sunnaria.",
        group: "Geography",
      },
      {
        id: "trade-guild",
        name: "Merchant's Guild",
        keys: ["merchant", "guild", "trade"],
        content: "Controls commerce in Sunnaria.",
        group: "Factions",
      },
      {
        id: "tariffs",
        name: "Trade Tariffs",
        keys: ["tariff", "tariffs", "taxes", "duties"],
        content: "Import duties on foreign goods.",
        group: "Economics",
      },
      {
        id: "world-overview",
        name: "Excelsia Continental Overview",
        keys: [],
        content: "Medieval fantasy continent with eight kingdoms.",
        group: "Geography",
        constant: true,
      },
    ];

    return { store, traversal, entries };
  };

  test("diplomatic meeting mentions both kingdoms → context for both royal families", () => {
    const { store, traversal, entries } = createDiplomaticWorld();

    const userPrompt =
      "The Sunnarian and Lunarian delegations meet at the border.";

    const keywordMatches = matchEntries(userPrompt, entries);
    const matchedIds = new Set(keywordMatches.map((m) => m.entry.id));

    expect(matchedIds).toContain("sunnaria");
    expect(matchedIds).toContain("lunaria");

    const retrieval = createRelationshipRetrieval(store, traversal, entries);
    const relatedEntries = retrieval.expandViaRelationships(
      Array.from(matchedIds),
      { maxDepth: 2 },
    );
    const allContextIds = [...matchedIds, ...relatedEntries.map((e) => e.id)];

    expect(allContextIds).toContain("alaric");
    expect(allContextIds).toContain("aradia");
    expect(allContextIds).toContain("cedric");
    expect(allContextIds).toContain("isabella");
  });

  test("trade discussion → expands to economic and geographic context", () => {
    const { store, traversal, entries } = createDiplomaticWorld();

    const userPrompt =
      "The merchant guild proposes new tariffs on Lunarian goods.";

    const keywordMatches = matchEntries(userPrompt, entries);
    const matchedIds = new Set(keywordMatches.map((m) => m.entry.id));

    expect(matchedIds).toContain("trade-guild");
    expect(matchedIds).toContain("tariffs");
    expect(matchedIds).toContain("lunaria");

    const retrieval = createRelationshipRetrieval(store, traversal, entries);
    const relatedEntries = retrieval.expandViaRelationships(
      Array.from(matchedIds),
      { maxDepth: 2 },
    );
    const allContextIds = [...matchedIds, ...relatedEntries.map((e) => e.id)];

    expect(allContextIds).toContain("sunnaria");
    expect(allContextIds).toContain("golden-rivers");
  });

  test("princess meeting → finds both characters and their kingdoms", () => {
    const { store, traversal, entries } = createDiplomaticWorld();

    const entityTerms = ["Princess Aradia", "Princess Isabella"];
    const entityMatches = matchEntitiesFuzzy(entityTerms, entries);
    const matchedIds = new Set(entityMatches.map((m) => m.entry.id));

    expect(matchedIds).toContain("aradia");
    expect(matchedIds).toContain("isabella");

    const retrieval = createRelationshipRetrieval(store, traversal, entries);
    const relatedEntries = retrieval.expandViaRelationships(
      Array.from(matchedIds),
      { maxDepth: 2 },
    );
    const allContextIds = [...matchedIds, ...relatedEntries.map((e) => e.id)];

    expect(allContextIds).toContain("alaric");
    expect(allContextIds).toContain("sunnaria");
    expect(allContextIds).toContain("cedric");
    expect(allContextIds).toContain("lunaria");
  });

  test("constant entries are always identified", () => {
    const { entries } = createDiplomaticWorld();

    const constantEntries = entries.filter((e) => e.constant);
    expect(constantEntries).toHaveLength(1);
    expect(constantEntries[0]?.id).toBe("world-overview");
  });

  test("river trade prompt → geographic and economic chain", () => {
    const { store, traversal, entries } = createDiplomaticWorld();

    const userPrompt = "Ships sail down the Golden Rivers carrying spices.";

    const keywordMatches = matchEntries(userPrompt, entries);
    const matchedIds = new Set(keywordMatches.map((m) => m.entry.id));

    expect(matchedIds).toContain("golden-rivers");

    const retrieval = createRelationshipRetrieval(store, traversal, entries);
    const relatedEntries = retrieval.expandViaRelationships(
      Array.from(matchedIds),
      { maxDepth: 2 },
    );
    const allContextIds = [...matchedIds, ...relatedEntries.map((e) => e.id)];

    expect(allContextIds).toContain("sunnaria");
    expect(allContextIds).toContain("trade-guild");
  });

  test("no matches still returns empty (graceful degradation)", () => {
    const { store, traversal, entries } = createDiplomaticWorld();

    const userPrompt = "The weather is nice today.";

    const keywordMatches = matchEntries(userPrompt, entries);
    expect(keywordMatches).toHaveLength(0);

    const retrieval = createRelationshipRetrieval(store, traversal, entries);
    const relatedEntries = retrieval.expandViaRelationships([], {
      maxDepth: 2,
    });
    expect(relatedEntries).toHaveLength(0);
  });
});
