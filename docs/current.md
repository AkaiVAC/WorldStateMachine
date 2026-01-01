# Current Implementation State

**Last updated:** 2025-12-31
**Test status:** 204 tests passing
**Current milestone:** M4 complete, M5 architecture redesigned

---

## What Works Right Now ✅

### World State Foundation
**Location:** `src/world-state/`

**Fact Store** (`fact/`)
- Store and query facts (subject/property/value)
- **NO temporal bounds yet** (validFrom/validTo not implemented)
- Multi-world support (worldId on each fact)
- 4 tests passing

**Entity Store** (`entity/`)
- Store entities with id/name/aliases/group
- Lookup by id, name, or alias (case-insensitive)
- Entity view: compute entity list from facts
- Multi-world support
- 15 tests passing

**Lexicon** (`lexicon/`)
- Track valid terms per world (case-insensitive)
- World boundary validation support
- 5 tests passing

**Relationship Store** (`relationship/`)
- Store typed relationships between entities (flexible string types)
- Bidirectional queries (from/to/both directions)
- Query by relationship type
- Multi-world support
- 12 tests passing

**Graph Traversal** (`relationship/`)
- BFS traversal with configurable max depth
- Filter by relationship types
- Filter by direction (from/to/both)
- Circular relationship handling (no infinite loops)
- 10 tests passing

**Event Store** (`event/`)
- Store events with id, timestamp, title, location, participants, visibility
- Query by participant, timestamp, location, visibility
- Fact generation from events (outcomes → facts with validFrom)
- Visibility levels: private, restricted, public
- Prose storage for original narrative
- 30 tests passing

### Import
**Location:** `src/import/`

**SillyTavern Importer**
- Parse SillyTavern lorebook JSON
- Create entities from entries (comment → name, keys → aliases, group → group)
- Generate UUIDs for entity IDs
- Add keys to lexicon
- Skip disabled entries
- Track skipped entries with reasons
- 8 tests passing

### Validation
**Location:** `src/validation/`

**Validator Framework**
- Generic rule interface (pluggable)
- Run multiple rules, collect violations
- 5 tests passing

**Entity Exists Rule**
- Detect unknown entities using title words + capitalization heuristics
- Fuzzy matching for suggestions ("Did you mean Princess Aradia?")
- 6 tests passing

**World Boundary Rule**
- LLM-powered detection of out-of-world concepts
- Flags anachronisms and real-world bleeding
- 5 tests passing

### LLM Integration
**Location:** `src/llm/`

**OpenRouter Client**
- API client for OpenRouter
- Configurable model (default: `xiaomi/mimo-v2-flash:free`)
- Used by World Boundary Rule and Entity Extraction
- 5 tests passing

### Context Injection & Retrieval
**Location:** `src/retrieval/`, `src/analysis/`

**Keyword Matcher** (`retrieval/`)
- Match lorebook entries by keywords
- Case-insensitive matching
- Automatic trigger detection
- 5 tests passing

**Entity Matcher** (`retrieval/`)
- Fuzzy matching of extracted entities to lorebook entries
- String similarity scoring
- 8 tests passing

**Prompt Analyzer** (`analysis/`)
- LLM-powered entity extraction from user prompts
- Extracts entities/locations/concepts
- 8 tests passing

**Lorebook Loader** (`retrieval/`)
- Load and manage lorebook entries
- Integration point for context injection

### Chat UI
**Location:** `src/ui/`

**Server** (`server/`)
- HTTP server with routing
- Static file serving
- Session management
- 8 tests passing

**Routes** (`routes/`)
- `/chat` - Chat interface
- `/models` - Model selection
- `/lorebook` - Lorebook management
- `/sessions` - Session CRUD
- 12 tests passing

**Frontend** (`public/`)
- Chat messages component
- Lorebook list component
- Markdown rendering
- DOM utilities
- 13 tests passing (1 error: missing 'marked' package)

### Integration
**Location:** `src/`

**Integration Tests**
- Full pipeline testing (import → validation → context injection)
- 7 tests passing

---

## What's Missing (From Vision) ❌

### Timeline System ✅ M3 COMPLETE
- ✅ Temporal bounds (validFrom/validTo) on facts
- ✅ Temporal queries ("what was true at timestamp 5?")
- ❌ Transaction time (undo/audit)

### Events ✅ M4 COMPLETE
- ✅ Events as source of truth
- ✅ Participation tracking (query by participant)
- ✅ Visibility levels (private/restricted/public)
- ✅ Fact generation from events
- ✅ Prose storage

### Relationship Graph ✅ M2 COMPLETE + INTEGRATED
- ✅ Relationships between entities (flexible typed relationships)
- ✅ Graph traversal for context retrieval (BFS with depth/type/direction filters)
- ✅ "Sunnarian Princess" → Aradia resolution via graph
- ✅ Integrated into chat context retrieval pipeline
- ✅ World summary prevents kingdom invention

### Geography System
- ❌ Containment hierarchy (X is in Y)
- ❌ 2D coordinates
- ❌ Routes and travel time
- ❌ Spatial validation
- ❌ Terrain and weather

### Epistemic State
- ❌ POV-filtered context
- ❌ Knowledge isolation ("what does character X know?")
- ❌ Lorebook → Entity/Fact ETL (prerequisite for epistemic isolation)

### Multi-Agent Orchestration
- ❌ Separate context per character
- ❌ Orchestrated dialogue
- ❌ Secret handling in conversations

### Calendar System
- ❌ Full temporal granularity (year → day → hour)
- ❌ Custom calendar support
- ❌ Season/time-of-day constraints

### Effect Propagation
- ❌ Identify affected entities
- ❌ LLM-generated possibility branches
- ❌ Cascading effect system

### Scene Execution
- ❌ Staging area for extracted facts
- ❌ Human review workflow
- ❌ Commit to timeline
- ❌ Ambient generation

---

## Current Status (From Testing)

**M4 Complete + Graph Integrated:** Event system and context retrieval working together

**What works now:**
- ✅ "Sunnarian" → Entity extraction → Fuzzy match → Sunnaria kingdom entry injected
- ✅ Graph traversal expands matches: Sunnaria → Alaric, Aradia, Elara
- ✅ World summary in system prompt prevents kingdom invention
- ✅ Events with participants, locations, visibility levels
- ✅ Fact generation from events with temporal bounds
- ✅ Related entries marked as "related" in injected entries

**Next milestone:** M5 - Epistemic State (POV-filtered knowledge, "what does X know?")

---

## File Structure (Actual)

```
src/
├── world-state/          # Core data model
│   ├── fact/             # Facts: subject/property/value with temporal bounds
│   ├── entity/           # Entities: id/name/aliases/group
│   ├── lexicon/          # World vocabulary tracking
│   ├── relationship/     # M2: Typed relationships and graph traversal
│   └── event/            # M4: Events with participants, visibility, outcomes
│
├── import/               # Getting data in
│   └── silly-tavern-importer.ts
│
├── validation/           # Constraint checking
│   ├── validator.ts      # Rule framework
│   ├── entity-exists-rule.ts
│   └── world-boundary-rule.ts
│
├── llm/                  # LLM integration
│   └── openrouter.ts
│
├── retrieval/            # Context retrieval
│   ├── keyword-matcher.ts
│   ├── entity-matcher.ts
│   ├── lorebook-entry.ts
│   └── lorebook-loader.ts
│
├── analysis/             # Prompt analysis
│   └── prompt-analyzer.ts
│
├── ui/                   # Chat interface
│   ├── server/           # HTTP server, routing
│   ├── routes/           # API routes (chat, models, lorebook, sessions)
│   └── public/           # Frontend (components, utilities)
│
└── integration.test.ts   # Full pipeline tests
```

---

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **Testing:** Bun test (114 tests)
- **Linting/Formatting:** Biome
- **LLM:** OpenRouter API (configurable model)
- **Frontend:** Vanilla JS/TS (no framework)

---

## Dev Workflow

**Test:** `bun test`
**Lint/Format:** `bun run check`

**Rules:**
- TDD mandatory (failing test → minimum code → refactor)
- No comments (self-documenting code)
- One step at a time
- Ask before large changes

See `CLAUDE.md` for full development guidelines.

---

## Gap Analysis

**From M2 (current) to Vision:**
- M1+M2 provide basic validation, context injection, and relationship graphs
- Missing timeline (M3), epistemic state (M5), multi-agent (M6), maps (M7-M9)
- Chat UI exists but context injection needs graph integration

**Next step:** M4 (Events) - see `roadmap.md`

---

## Known Issues

1. ~~**Relationship graph not integrated**~~ - ✅ Fixed: Graph traversal wired into context retrieval
2. ~~**LLM invents kingdoms**~~ - ✅ Fixed: `constant` entries (world overview) always injected
3. **No fact extraction from LLM output** - Loop isn't closed (generate → extract → commit)
4. ~~**Name collisions in keyword matching**~~ - ✅ Resolved by design: Entity IDs replace keyword matching (see below)

---

## Architectural Insight (2025-12-30)

**Key realization:** The lorebook is an *import format*, not the runtime model.

**Problem:** Keyword matching "Elara" can't distinguish Queen Elara from a student named Elara. Secondary keys, corroborating evidence, and other patches are brittle - they fundamentally can't solve disambiguation when two entities with the same name appear in the same scene.

**Solution:** Transform lorebook into structured data:
- **Entities** with unique IDs (not names)
- **Facts** with subject=entityId (structured, queryable, temporal)
- **Relationships** linking entity IDs

**Implications for M5:**
- M5 now includes lorebook ETL as prerequisite
- `getKnowledge(entityId, timestamp)` queries by ID, not name
- Scene setup binds display names to entity IDs
- New characters get fresh IDs (no collision with existing entities)
- True epistemic isolation becomes possible

**See:** `roadmap.md` (Architectural Foundation section), `decisions.md` (Lorebook Is Import Format)

---

## Test Breakdown

| Module | Tests | Status |
|--------|-------|--------|
| World State (fact/entity/lexicon) | 24 | ✅ |
| World State (relationship) | 26 | ✅ M2 |
| World State (event) | 30 | ✅ M4 |
| Import (SillyTavern) | 8 | ✅ |
| Validation (validator/rules) | 16 | ✅ |
| LLM (OpenRouter) | 5 | ✅ |
| Retrieval (keyword/entity/E2E) | 19 | ✅ |
| Analysis (prompt analyzer) | 8 | ✅ |
| UI (server/routes/frontend) | 50 | ✅ |
| Integration | 7 | ✅ |
| **Total** | **204** | **All passing** |

---

## Summary

**M4 is complete.** Event system and context retrieval fully integrated:
- Event type with id, timestamp, title, location, participants, visibility, outcomes, prose
- EventStore with queries by participant, timestamp, location, visibility
- Fact generation from events (outcomes → facts with validFrom from event timestamp)
- Visibility levels: private, restricted, public
- Graph traversal expansion integrated into chat context pipeline
- `constant` lorebook entries (like world overview) always injected
- 6 new E2E tests for complex story scenarios (diplomatic meetings, trade, multi-kingdom)

**What works:** Basic validation, context injection (keyword + entity + graph expansion), relationship graphs, temporal facts, events, constant entries, chat UI.

**What's missing:** Epistemic state (M5), multi-agent (M6), maps (M7-M9).

**Next:** M5 - Epistemic State + Tool-Calling Architecture (major architectural shift)

**Architectural Pivots (2025-12-31 / 2026-01-01):**

The M5 and M11 designs have been significantly expanded based on insights about world state management:

1. **World State as RPG Stats:** All entities (characters, kingdoms, economies, weather) have queryable numeric attributes. No hardcoded schemas - facts are arbitrary key-value pairs that adapt to any world.

2. **Tool-Calling Over Context-Stuffing:** LLMs query facts via tools rather than receiving massive context packages. This ensures deterministic values (grain-tariff is exactly 0.15, not "approximately 15%") and prevents hallucination.

3. **Characters Are RPG Stat Sheets:** Characters get comprehensive state extraction across ALL attributes:
   - Physical: height, strength, age, health, stamina
   - Equipment: shoe condition, tunic color, sword state
   - Appearance: clothing color, visible injuries, hair style
   - Conditions: wetness, exhaustion, poisoned, blessed
   - Social: attitudes, mood, trust levels
   - Skills: combat, magic, knowledge domains

   **Example:** "I was wearing red" stays red across scenes. Damaged shoe affects mud navigation. Height affects reach constraints.

4. **Unified World Tick:** ALL entities simulate forward every timestamp at varying detail levels:
   - **Tier 1 (Focus):** Full prose scenes for current protagonists
   - **Tier 2 (Intentional):** State changes + summaries for off-screen active characters (Aradia fighting necromancer)
   - **Tier 3 (Passive):** Minimal drift for background NPCs (location, routine)
   - **Tier 4 (System):** Automatic updates for economies, weather, kingdoms

   **Result:** World always ticks. Off-screen characters continue to exist and act. No freeze problem. Seamless focus shifts.

5. **Hybrid Persistence:** SQLite for runtime queries + JSON snapshots for human-readable backups. Fast, scalable, inspectable.

6. **Comprehensive ETL:** Extract ALL measurable attributes from lorebook prose, including inferred values. "Thriving economy" → trade-volume: 8500. All entities in a category get same schema.

See updated roadmap.md M5 and M11 sections for complete designs.

---

**See also:**
- `vision.md` - The full picture
- `roadmap.md` - Step-by-step path from here to vision
- `DECISIONS.md` - Why we made key design choices
- `notes/context-injection-analysis.md` - Latest testing/analysis
