import { describe, expect, test } from "bun:test";
import { createRelationshipStore } from "./relationship-store";

describe("RelationshipStore", () => {
  describe("Zero - empty/null inputs", () => {
    test("empty store returns empty array when queried", () => {
      const store = createRelationshipStore();

      expect(store.getAll()).toEqual([]);
      expect(store.getByEntity("any-id")).toEqual([]);
      expect(store.getFrom("any-id")).toEqual([]);
      expect(store.getTo("any-id")).toEqual([]);
      expect(store.getByType("any-type")).toEqual([]);
    });
  });

  describe("One - single item behavior", () => {
    test("adds and retrieves single relationship by from entity", () => {
      const store = createRelationshipStore();
      const rel = {
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "alaric",
      };

      store.add(rel);

      const results = store.getFrom("aradia");
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(rel);
    });

    test("retrieves relationship by to entity", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "alaric",
      });

      const results = store.getTo("alaric");
      expect(results).toHaveLength(1);
      expect(results[0]?.from).toBe("aradia");
    });

    test("retrieves relationship by type", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "alaric",
      });

      const results = store.getByType("daughter-of");
      expect(results).toHaveLength(1);
      expect(results[0]?.from).toBe("aradia");
    });

    test("getByEntity returns relationships where entity is from or to", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "alaric",
      });
      store.add({
        worldId: "excelsia",
        from: "alaric",
        type: "rules",
        to: "sunnaria",
      });

      const aradiaRels = store.getByEntity("aradia");
      expect(aradiaRels).toHaveLength(1);

      const alaricRels = store.getByEntity("alaric");
      expect(alaricRels).toHaveLength(2);
    });
  });

  describe("Many - multiple items", () => {
    test("stores multiple relationships from same entity", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "alaric",
        type: "rules",
        to: "sunnaria",
      });
      store.add({
        worldId: "excelsia",
        from: "alaric",
        type: "married-to",
        to: "elara",
      });

      const results = store.getFrom("alaric");
      expect(results).toHaveLength(2);
    });

    test("stores multiple relationships to same entity", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "alaric",
      });
      store.add({
        worldId: "excelsia",
        from: "elara",
        type: "married-to",
        to: "alaric",
      });

      const results = store.getTo("alaric");
      expect(results).toHaveLength(2);
    });

    test("getByType returns all relationships of that type", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "alaric",
      });
      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "elara",
      });
      store.add({
        worldId: "excelsia",
        from: "alaric",
        type: "rules",
        to: "sunnaria",
      });

      const familyRels = store.getByType("daughter-of");
      expect(familyRels).toHaveLength(2);

      const politicalRels = store.getByType("rules");
      expect(politicalRels).toHaveLength(1);
    });

    test("getAll returns all relationships in store", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "alaric",
      });
      store.add({
        worldId: "excelsia",
        from: "alaric",
        type: "rules",
        to: "sunnaria",
      });

      expect(store.getAll()).toHaveLength(2);
    });
  });

  describe("Boundary - edge cases", () => {
    test("handles circular relationships (A→B→A)", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "sunnaria",
        type: "allied-with",
        to: "ilaria",
      });
      store.add({
        worldId: "excelsia",
        from: "ilaria",
        type: "allied-with",
        to: "sunnaria",
      });

      expect(store.getFrom("sunnaria")).toHaveLength(1);
      expect(store.getFrom("ilaria")).toHaveLength(1);
    });

    test("handles self-referential relationship (A→A)", () => {
      const store = createRelationshipStore();
      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "knows",
        to: "aradia",
      });

      const results = store.getFrom("aradia");
      expect(results).toHaveLength(1);
      expect(results[0]?.to).toBe("aradia");
    });
  });

  describe("Simple - happy path scenarios", () => {
    test("complex scenario with multiple relationship types", () => {
      const store = createRelationshipStore();

      store.add({
        worldId: "excelsia",
        from: "aradia",
        type: "daughter-of",
        to: "alaric",
      });
      store.add({
        worldId: "excelsia",
        from: "alaric",
        type: "rules",
        to: "sunnaria",
      });
      store.add({
        worldId: "excelsia",
        from: "royal-gardens",
        type: "part-of",
        to: "sunnaria",
      });

      const aradiaParents = store.getFrom("aradia");
      expect(aradiaParents).toHaveLength(1);
      expect(aradiaParents[0]?.type).toBe("daughter-of");

      const alaricRelations = store.getByEntity("alaric");
      expect(alaricRelations).toHaveLength(2);

      const sunnariaParts = store.getTo("sunnaria");
      expect(sunnariaParts).toHaveLength(2);
    });
  });
});
