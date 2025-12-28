import { createPromptAnalyzer } from "./analysis/prompt-analyzer";
import { importSillyTavernLorebook } from "./import/silly-tavern-importer";
import { ask } from "./llm/openrouter";
import { createEntityExistsRule } from "./validation/entity-exists-rule";
import { validate } from "./validation/validator";
import { createWorldBoundaryRule } from "./validation/world-boundary-rule";
import { createEntityStore } from "./world-state/entity/entity-store";

const examplesDir = `${import.meta.dir}/example/Excelsia`;
const worldId = "excelsia";
const worldSetting = "medieval fantasy";

const setupWorld = async () => {
	const result = await importSillyTavernLorebook(
		`${examplesDir}/Excelsia - Characters.json`,
		worldId,
	);

	const entityStore = createEntityStore();

	for (const entity of result.entities) {
		entityStore.add(entity);
	}

	return { entityStore };
};

const validatePrompt = async (prompt: string) => {
	console.log("\n=== Validating Prompt ===");
	console.log(`"${prompt}"\n`);

	const { entityStore } = await setupWorld();

	const analyzer = createPromptAnalyzer({
		askFn: ask,
		worldSetting,
	});

	const entityRule = createEntityExistsRule({
		analyzer,
		entityStore,
		worldId,
	});
	const worldBoundaryRule = createWorldBoundaryRule({
		analyzer,
		worldSetting,
	});

	const violations = await validate(prompt, [entityRule, worldBoundaryRule]);

	if (violations.length === 0) {
		console.log("No violations found.");
	} else {
		console.log(`Found ${violations.length} violation(s):\n`);
		for (const v of violations) {
			const icon = v.type === "unknown-entity" ? "👤" : "🌍";
			console.log(`${icon} [${v.type}] "${v.term}"`);
			console.log(`   ${v.message}`);
			if (v.suggestion) {
				console.log(`   💡 Suggestion: ${v.suggestion}`);
			}
			console.log();
		}
	}

	return violations;
};

const mvpPrompt =
	"I enter the Sunnarian Royal Gardens and find the prince snorkeling.";

const complexPrompt = `As I wandered through the moonlit streets of Ilaria, my smartphone buzzed
with a notification. The ancient wizard Theron appeared before me, his LED-lit staff
glowing with mystical energy. "The Queen requires your presence," he declared,
adjusting his bluetooth earpiece. We took an Uber to the Crystal Palace where
Princess Aradia was livestreaming her coronation rehearsal on TikTok.`;

console.log("🏰 Lorebook Manager - MVP Validation Test\n");
console.log("Testing with real LLM (OpenRouter)...");

console.log("\n" + "=".repeat(50));
console.log("TEST 1: MVP Prompt (prince snorkeling)");
console.log("=".repeat(50));
await validatePrompt(mvpPrompt);

console.log("\n" + "=".repeat(50));
console.log("TEST 2: Complex Prompt (many anachronisms)");
console.log("=".repeat(50));
await validatePrompt(complexPrompt);
