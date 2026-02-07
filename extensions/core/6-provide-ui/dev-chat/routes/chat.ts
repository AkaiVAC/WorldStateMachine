import { createGraphTraversal } from "@ext/core/2-store-timeline/memory-relationship-store/graph-traversal";
import { createEntityExistsRule } from "@ext/core/3-validate-consistency/check-entity-exists/entity-exists-rule";
import { createWorldBoundaryRule } from "@ext/core/3-validate-consistency/check-world-boundary/world-boundary-rule";
import {
  type Violation,
  validate,
} from "@ext/core/3-validate-consistency/validation-framework/validator";
import { createPromptAnalyzer } from "@ext/core/4-build-scene-context/analyze-prompt/prompt-analyzer";
import { createRelationshipRetrieval } from "@ext/core/4-build-scene-context/expand-relationships/relationship-retrieval";
import type { LorebookEntry } from "@ext/core/4-build-scene-context/lorebook-entry";
import { matchEntitiesFuzzy } from "@ext/core/4-build-scene-context/match-entities/entity-matcher";
import { matchEntries } from "@ext/core/4-build-scene-context/match-keywords/keyword-matcher";
import {
  ask,
  type ChatMessage,
  chat,
} from "@ext/core/5-send-scene-context/to-llm/openrouter-client";
import {
  getEntityStore,
  getLorebookEntries,
  getRelationshipStore,
  WORLD_ID,
} from "./lorebook";

const DEFAULT_MODEL = "anthropic/claude-sonnet-4";
const ENTITY_EXTRACTION_MODEL = "xiaomi/mimo-v2-flash:free";
const WORLD_SETTING = "medieval fantasy";

type ChatRequest = {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  character?: string;
  model?: string;
  manualEntries?: string[];
  excludeEntries?: string[];
};

type InjectedEntry = {
  id: string;
  name: string;
  reason: "constant" | "entity" | "auto" | "manual" | "related";
  matchedKeyword?: string;
};

type ChatResponse = {
  response: string;
  injectedEntries: InjectedEntry[];
  systemPrompt: string;
  violations: Violation[];
};

const WORLD_CONTEXT = `You are roleplaying in Excelsia, a ${WORLD_SETTING} world with eight kingdoms.
Stay in character. Respond as the characters would, using their knowledge and personality.
Do not break character or reference the real world.`;

const analyzer = createPromptAnalyzer({
  askFn: (prompt) => ask(prompt, { model: ENTITY_EXTRACTION_MODEL }),
  worldSetting: WORLD_SETTING,
});

export const chatHandler = async (req: Request): Promise<Response> => {
  const body = (await req.json()) as ChatRequest;
  const {
    message,
    history,
    model = DEFAULT_MODEL,
    manualEntries = [],
    excludeEntries = [],
  } = body;

  const allEntries = await getLorebookEntries();
  const excludeSet = new Set(excludeEntries);
  const injectedIds = new Set<string>();
  const injectedEntries: InjectedEntry[] = [];
  const entriesToInject: LorebookEntry[] = [];

  for (const entry of allEntries) {
    if (entry.constant && !excludeSet.has(entry.id)) {
      injectedIds.add(entry.id);
      entriesToInject.push(entry);
      injectedEntries.push({
        id: entry.id,
        name: entry.name,
        reason: "constant",
      });
    }
  }

  const { entityReferences, anachronisms } = await analyzer.analyze(message);

  const cachedAnalyzer = {
    analyze: async () => ({ entityReferences, anachronisms }),
  };

  const entityStore = await getEntityStore();
  const entityRule = createEntityExistsRule({
    analyzer: cachedAnalyzer,
    entityStore,
    worldId: WORLD_ID,
  });
  const worldBoundaryRule = createWorldBoundaryRule({
    analyzer: cachedAnalyzer,
    worldSetting: WORLD_SETTING,
  });
  const violations = await validate(message, [entityRule, worldBoundaryRule]);

  const entityMatches = matchEntitiesFuzzy(entityReferences, allEntries);

  for (const match of entityMatches) {
    if (!excludeSet.has(match.entry.id)) {
      injectedIds.add(match.entry.id);
      entriesToInject.push(match.entry);
      injectedEntries.push({
        id: match.entry.id,
        name: match.entry.name,
        reason: "entity",
        matchedKeyword: match.matchedTerm,
      });
    }
  }

  const keywordMatches = matchEntries(message, allEntries);

  for (const match of keywordMatches) {
    if (!excludeSet.has(match.entry.id) && !injectedIds.has(match.entry.id)) {
      injectedIds.add(match.entry.id);
      entriesToInject.push(match.entry);
      injectedEntries.push({
        id: match.entry.id,
        name: match.entry.name,
        reason: "auto",
        matchedKeyword: match.matchedKeyword,
      });
    }
  }

  for (const entryId of manualEntries) {
    if (!injectedIds.has(entryId)) {
      const entry = allEntries.find((e) => e.id === entryId);
      if (entry) {
        injectedIds.add(entry.id);
        entriesToInject.push(entry);
        injectedEntries.push({
          id: entry.id,
          name: entry.name,
          reason: "manual",
        });
      }
    }
  }

  const relationshipStore = getRelationshipStore();
  const graphTraversal = createGraphTraversal();
  const relationshipRetrieval = createRelationshipRetrieval(
    relationshipStore,
    graphTraversal,
    allEntries,
  );

  const relatedEntries = relationshipRetrieval.expandViaRelationships(
    Array.from(injectedIds),
    { maxDepth: 2 },
  );

  for (const entry of relatedEntries) {
    if (!excludeSet.has(entry.id) && !injectedIds.has(entry.id)) {
      injectedIds.add(entry.id);
      entriesToInject.push(entry);
      injectedEntries.push({
        id: entry.id,
        name: entry.name,
        reason: "related",
      });
    }
  }

  const lorebookContext = entriesToInject
    .map((e) => `[${e.name}]\n${e.content}`)
    .join("\n\n");

  const systemPrompt = lorebookContext
    ? `${WORLD_CONTEXT}\n\n--- LOREBOOK ---\n${lorebookContext}`
    : WORLD_CONTEXT;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.map(
      (h) => ({ role: h.role, content: h.content }) as ChatMessage,
    ),
    { role: "user", content: message },
  ];

  const response = await chat(messages, { model });

  const chatResponse: ChatResponse = {
    response,
    injectedEntries,
    systemPrompt,
    violations,
  };

  return Response.json(chatResponse);
};
