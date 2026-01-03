import { describe, expect, test } from "bun:test";
import { importSillyTavernLorebook } from "@ext/core/1-load-world-data/from-sillytavern/sillytavern-loader";
import { createEntityStore } from "@ext/core/2-store-timeline/memory-entity-store/entity-store";
import { createLexicon } from "@ext/core/2-store-timeline/memory-lexicon/lexicon";
import { createEntityExistsRule } from "@ext/core/3-validate-consistency/check-entity-exists/entity-exists-rule";
import { createWorldBoundaryRule } from "@ext/core/3-validate-consistency/check-world-boundary/world-boundary-rule";
import { validate } from "@ext/core/3-validate-consistency/validation-framework/validator";
import type { PromptAnalyzer } from "@ext/core/4-build-scene-context/analyze-prompt/prompt-analyzer";

const examplesDir = `${import.meta.dir}/example/Excelsia`;
const worldId = "excelsia";

describe("Integration: Import → Store → Query", () => {
    test("imports Excelsia Characters and populates stores", async () => {
        const result = await importSillyTavernLorebook(
            `${examplesDir}/Excelsia - Characters.json`,
            worldId,
        );

        const entityStore = createEntityStore();
        const lexicon = createLexicon();

        for (const entity of result.entities) {
            entityStore.add(entity);
        }

        for (const term of result.lexiconTerms) {
            lexicon.addTerm(worldId, term);
        }

        expect(result.entities.length).toBeGreaterThan(10);
        expect(result.lexiconTerms.length).toBeGreaterThan(20);

        const alaric = entityStore.getByName(
            worldId,
            "King Alaric of Sunnaria",
        );
        expect(alaric).toBeDefined();
        expect(alaric?.group).toBe("Characters");

        const byAlias = entityStore.getByName(worldId, "Alaric");
        expect(byAlias).toBeDefined();
        expect(byAlias?.name).toBe("King Alaric of Sunnaria");

        expect(lexicon.hasTerm(worldId, "Alaric")).toBe(true);
        expect(lexicon.hasTerm(worldId, "King Alaric")).toBe(true);
        expect(lexicon.hasTerm(worldId, "Princess Aradia")).toBe(true);
    });

    test("Sunnarian royal family members are queryable", async () => {
        const result = await importSillyTavernLorebook(
            `${examplesDir}/Excelsia - Characters.json`,
            worldId,
        );

        const entityStore = createEntityStore();
        for (const entity of result.entities) {
            entityStore.add(entity);
        }

        const alaric = entityStore.getByName(worldId, "King Alaric");
        const elara = entityStore.getByName(worldId, "Queen Elara");
        const aradia = entityStore.getByName(worldId, "Princess Aradia");

        expect(alaric).toBeDefined();
        expect(elara).toBeDefined();
        expect(aradia).toBeDefined();

        expect(alaric?.name).toContain("Sunnaria");
        expect(elara?.name).toContain("Sunnaria");
        expect(aradia?.name).toContain("Sunnaria");

        const prince = entityStore.getByName(worldId, "Prince");
        expect(prince).toBeUndefined();
    });

    test("disabled entries are not imported", async () => {
        const result = await importSillyTavernLorebook(
            `${examplesDir}/Excelsia - Characters.json`,
            worldId,
        );

        const entityStore = createEntityStore();
        for (const entity of result.entities) {
            entityStore.add(entity);
        }

        const checklist = entityStore.getByName(
            worldId,
            "Character Integration Checklist",
        );
        expect(checklist).toBeUndefined();
    });

    test("lexicon is case-insensitive", async () => {
        const result = await importSillyTavernLorebook(
            `${examplesDir}/Excelsia - Characters.json`,
            worldId,
        );

        const lexicon = createLexicon();
        for (const term of result.lexiconTerms) {
            lexicon.addTerm(worldId, term);
        }

        expect(lexicon.hasTerm(worldId, "alaric")).toBe(true);
        expect(lexicon.hasTerm(worldId, "ALARIC")).toBe(true);
        expect(lexicon.hasTerm(worldId, "Alaric")).toBe(true);

        expect(lexicon.hasTerm(worldId, "snorkeling")).toBe(false);
    });
});

describe("MVP: Prince Snorkeling Test", () => {
    const mockAnalyzer: PromptAnalyzer = {
        analyze: async (text: string) => {
            const result = {
                entityReferences: [] as string[],
                anachronisms: [] as string[],
            };
            if (text.includes("prince")) {
                result.entityReferences.push("prince");
            }
            if (text.includes("snorkeling")) {
                result.anachronisms.push("snorkeling");
            }
            return result;
        },
    };

    test("flags 'prince' as unknown entity with suggestion", async () => {
        const result = await importSillyTavernLorebook(
            `${examplesDir}/Excelsia - Characters.json`,
            worldId,
        );

        const entityStore = createEntityStore();
        for (const entity of result.entities) {
            entityStore.add(entity);
        }

        const rule = createEntityExistsRule({
            analyzer: mockAnalyzer,
            entityStore,
            worldId,
        });
        const violations = await rule.check(
            "I enter the Sunnarian Royal Gardens and find the prince snorkeling.",
        );

        const princeViolation = violations.find((v) => v.term === "prince");
        expect(princeViolation).toBeDefined();
        expect(princeViolation?.type).toBe("unknown-entity");
        expect(princeViolation?.suggestion).toContain("Princess");
    });

    test("flags 'snorkeling' as world-boundary violation", async () => {
        const rule = createWorldBoundaryRule({
            analyzer: mockAnalyzer,
            worldSetting: "medieval fantasy",
        });

        const violations = await rule.check(
            "I enter the Sunnarian Royal Gardens and find the prince snorkeling.",
        );

        const snorkelingViolation = violations.find(
            (v) => v.term === "snorkeling",
        );
        expect(snorkelingViolation).toBeDefined();
        expect(snorkelingViolation?.type).toBe("world-boundary");
    });

    test("full validation catches both violations", async () => {
        const result = await importSillyTavernLorebook(
            `${examplesDir}/Excelsia - Characters.json`,
            worldId,
        );

        const entityStore = createEntityStore();
        for (const entity of result.entities) {
            entityStore.add(entity);
        }

        const entityRule = createEntityExistsRule({
            analyzer: mockAnalyzer,
            entityStore,
            worldId,
        });
        const worldBoundaryRule = createWorldBoundaryRule({
            analyzer: mockAnalyzer,
            worldSetting: "medieval fantasy",
        });

        const prompt =
            "I enter the Sunnarian Royal Gardens and find the prince snorkeling.";
        const violations = await validate(prompt, [
            entityRule,
            worldBoundaryRule,
        ]);

        expect(violations.length).toBeGreaterThanOrEqual(2);

        const princeViolation = violations.find((v) => v.term === "prince");
        const snorkelingViolation = violations.find(
            (v) => v.term === "snorkeling",
        );

        expect(princeViolation).toBeDefined();
        expect(snorkelingViolation).toBeDefined();

        expect(princeViolation?.suggestion).toContain("Princess");
        expect(snorkelingViolation?.type).toBe("world-boundary");
    });
});
