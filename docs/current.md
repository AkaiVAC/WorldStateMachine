# Current Implementation State

**Last updated:** 2026-01-01
**Test status:** ✅ 251 tests passing
**Current milestone:** M4 complete, Extension Architecture Phases 1-3 complete

**📦 Architecture:** Plugin-first extension system with path aliases (`@core/*`, `@ext/*`)

**🚧 Next:** Phase 4 - Example extensions to prove architecture (see [roadmap.md](roadmap.md))

---

## Extension System ✅

**Location:** `src/extension-system/`, `extensions/core/`

The project now uses a **plugin-first architecture** where all functionality (including core) is an extension.

### Extension System Core
- ✅ **Extension registry** with dependency validation
- ✅ **Extension loader** with TS + JSON config support
- ✅ **Lifecycle hook system** with execution control
- ✅ **Auto-discovery** from `extensions/` directory
- ✅ **Circular dependency detection**
- ✅ **Path aliases** (`@core/*`, `@ext/*`)
- ✅ **Activate pattern** with ExtensionContext for dependency injection
- 45 tests passing

### Core Types
**Location:** `src/core-types/`
- Fundamental contracts: Event, Fact, Entity, Relationship
- Used by all extensions via `@core/*` imports

### Current Structure
```
src/
├── core-types/         # Fundamental types
├── extension-system/   # Plugin infrastructure
└── example/           # Excelsia test data

extensions/
└── core/              # All current functionality
    ├── 1-load-world-data/
    ├── 2-store-timeline/
    ├── 3-validate-consistency/
    ├── 4-build-scene-context/
    ├── 5-send-scene-context/
    └── 6-provide-ui/
```

---

## What Works Right Now ✅

### Timeline Storage (Core Extension)
**Location:** `extensions/core/store-timeline/`

**Fact Store** (`memory-fact-store/`)
- Store and query facts (subject/property/value)
- Temporal queries (validFrom/validTo)
- Multi-world support
- 15 tests passing

**Entity Store** (`memory-entity-store/`)
- Store entities with id/name/aliases/group
- Lookup by id, name, or alias (case-insensitive)
- Multi-world support
- 10 tests passing

**Lexicon** (`memory-lexicon/`)
- Track valid terms per world (case-insensitive)
- World boundary validation support
- 4 tests passing

**Relationship Store** (`memory-relationship-store/`)
- Store typed relationships between entities
- Bidirectional queries (from/to/both directions)
- Query by relationship type
- Multi-world support
- 8 tests passing

**Graph Traversal** (`memory-relationship-store/`)
- BFS traversal with configurable max depth
- Filter by relationship types
- Filter by direction (from/to/both)
- Circular relationship handling
- 10 tests passing

**Event Store** (`memory-event-store/`)
- Store events with participants, visibility, outcomes
- Query by participant, timestamp, location, visibility
- Fact generation from events
- Visibility levels: private, restricted, public
- 30 tests passing

### Data Loading (Core Extension)
**Location:** `extensions/core/load-world-data/`

**SillyTavern Loader** (`from-sillytavern/`)
- Parse SillyTavern lorebook JSON
- Create entities from entries
- Generate UUIDs for entity IDs
- Add keys to lexicon
- Track skipped entries
- 8 tests passing

### Consistency Validation (Core Extension)
**Location:** `extensions/core/validate-consistency/`

**Validation Framework** (`validation-framework/`)
- Generic rule interface (pluggable)
- Run multiple rules, collect violations
- 5 tests passing

**Entity Exists Check** (`check-entity-exists/`)
- Detect unknown entities with fuzzy matching
- Suggestions for similar entities
- 6 tests passing

**World Boundary Check** (`check-world-boundary/`)
- LLM-powered anachronism detection
- Flags out-of-world concepts
- 5 tests passing

### Scene Context Building (Core Extension)
**Location:** `extensions/core/build-scene-context/`

**Keyword Matcher** (`match-keywords/`)
- Match lorebook entries by keywords
- Case-insensitive matching
- Automatic trigger detection
- 5 tests passing

**Entity Matcher** (`match-entities/`)
- Fuzzy matching to lorebook entries
- String similarity scoring
- 8 tests passing

**Prompt Analyzer** (`analyze-prompt/`)
- LLM-powered entity extraction
- Extracts entities/locations/concepts
- 8 tests passing

**Relationship Expander** (`expand-relationships/`)
- Graph-based context expansion
- Relationship traversal
- 7 tests passing

**Lorebook Loader**
- Load and manage lorebook entries
- Integration with context building

### LLM Sending (Core Extension)
**Location:** `extensions/core/send-scene-context/`

**OpenRouter Client** (`to-llm/`)
- API client for OpenRouter
- Configurable models
- Used by validators and analyzers
- 5 tests passing

### Dev Chat UI (Core Extension)
**Location:** `extensions/core/provide-ui/dev-chat/`

**Server** (`server/`)
- HTTP server with routing
- Static file serving
- Session management
- 8 tests passing

**Routes** (`routes/`)
- `/chat` - Chat interface with context injection
- `/models` - Model selection
- `/lorebook` - Lorebook management
- `/sessions` - Session CRUD
- 12 tests passing

**Frontend** (`public/`)
- Chat messages component
- Lorebook list component
- Markdown rendering
- 13 tests passing

### Integration
**Location:** `src/integration.test.ts`

**Full Pipeline Tests**
- Import → Validation → Context Injection
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
├── core-types/           # Fundamental contracts (Event, Fact, Entity, Relationship)
├── extension-system/     # Plugin infrastructure (Registry, Loader, Hooks)
└── runtime/              # Runtime creation and Orchestrator

extensions/
└── core/                 # Standard implementation
    ├── 1-load-world-data/    # SillyTavern and other loaders
    ├── 2-store-timeline/     # Fact, Event, Entity, Relationship stores
    ├── 3-validate-consistency/ # Entity and world boundary validation
    ├── 4-build-scene-context/  # Keyword and entity matching, graph expansion
    ├── 5-send-scene-context/   # OpenRouter / LLM clients
    └── 6-provide-ui/         # Dev Chat interface
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

## Recent Changes (2026-01-01)

### **Extension Architecture - Phases 1-3 Complete** 🎯

**Major architectural pivot:** Plugin-first architecture fully implemented.

**Completed:**
1. ✅ **Phase 1**: Extension system core (registry, loader, hooks, activate pattern)
2. ✅ **Phase 2**: Migrated all code to `extensions/core/` with numbered directories
3. ✅ **Phase 3**: Runtime system with activation and dependency injection
4. ✅ **Hard Rule #8**: SOLID principles and Simple Design enforced

**Test status:** 251 tests passing (45 extension system, 206 core functionality)

**Key decisions:**
1. **Everything is an extension** - Including core functionality
2. **Zero codebase changes** to add features - Drop extension folder, restart
3. **Lifecycle hooks** - Extensions can intercept before/after any operation
4. **Extensible stores** - Even timeline storage is pluggable
5. **Auto-discovery** - No manual registration needed
6. **Readable directory names** - `load-world-data/`, `validate-consistency/`, etc.

**See [roadmap.md](roadmap.md) for complete implementation plan.**

**Current structure:**
```
src/
├── core-types/           # Fundamental (Event, Fact, Entity)
├── extension-system/     # Plugin loader, registry, hooks, activate
└── runtime/              # createRuntime and orchestrator

extensions/
├── core/                 # ALL current functionality as extension
│   ├── 1-load-world-data/
│   ├── 2-store-timeline/
│   ├── 3-validate-consistency/
│   ├── 4-build-scene-context/
│   ├── 5-send-scene-context/
│   └── 6-provide-ui/
└── (user extensions)
```

**Impact:**
- Future features = new extensions (no core changes)
- Users can replace any component (with validation)
- Clean separation of concerns
- VS Code-level extensibility

---

**See also:**
- `vision.md` - The full picture
- `roadmap.md` - Step-by-step path from here to vision
- `DECISIONS.md` - Why we made key design choices
- `notes/context-injection-analysis.md` - Latest testing/analysis
