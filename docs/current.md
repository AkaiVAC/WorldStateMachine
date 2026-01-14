# Current Implementation State

**Current milestone:** M4 complete, Extension System Bootstrap complete, `needs:` logic in progress

**Architecture:** Config-driven 6-stage extension pipeline with path aliases (`@core/*`, `@ext/*`)

**Next:** Complete `needs:` dependency status logic, then M5

**Run tests:** `bun test`

---

## Architecture Overview

The project uses a **config-driven extension architecture** where extensions are organized into 6 stages.

```
src/
├── core-types/           # Fundamental contracts (Event, Fact, Entity, Relationship)
└── extension-system/     # Extension loading and activation
    ├── types.ts                       # Config and extension types
    ├── config-loader.ts               # Load and validate extensions.config.json
    ├── config-loader/                 # Validation helpers
    ├── import-extension.ts            # Load and validate extension modules
    ├── build-dependency-graph.ts      # Build DAG with cycle detection
    ├── topological-sort.ts            # Sort into parallel activation waves
    ├── validate-required-slots.ts     # Validate required stores
    ├── activate-extensions.ts         # Parallel extension activation
    ├── compute-dependency-status.ts   # Compute needs: status from dependencies
    └── bootstrap.ts                   # Orchestrate full bootstrap process

extensions/
└── core/                 # Standard implementation (split by stage)
    ├── 1-load-world-data/       # SillyTavern and other data loaders
    ├── 2-store-timeline/        # Fact, Event, Entity, Relationship stores
    ├── 3-validate-consistency/  # Entity exists, world boundary validation
    ├── 4-build-scene-context/   # Keyword/entity matching, graph expansion
    ├── 5-send-scene-context/    # OpenRouter / LLM clients
    └── 6-provide-ui/            # Dev Chat interface

extensions.config.json      # Central config listing enabled extensions per stage
```

### The 6 Stages

Execution order: stores → loaders → validators → contextBuilders → senders → ui

| Stage              | Purpose                             | Model      |
| ------------------ | ----------------------------------- | ---------- |
| 1. stores          | Storage backends (memory, postgres) | Slot-based |
| 2. loaders         | Import data (SillyTavern, CSV, DB)  | Additive   |
| 3. validators      | Validation rules                    | Additive   |
| 4. contextBuilders | Build LLM context                   | Additive   |
| 5. senders         | Send to LLM or export               | Slot-based |
| 6. ui              | User interface                      | Additive   |

---

## What Works

### Extension System Bootstrap (Complete)

**Location:** `src/extension-system/`

**Status:** ✅ Bootstrap fully implemented and tested (60 tests, 96 assertions)

**Components:**

-   **Config Loader** - Load and validate `extensions.config.json`
-   **Extension Importer** - Load extension modules with validation
-   **Dependency Graph** - Build DAG with cycle detection
-   **Topological Sort** - Sort into parallel activation waves
-   **Extension Activation** - Parallel activation within waves
-   **Slot Validation** - Ensure required stores present
-   **Bootstrap Orchestrator** - Full end-to-end initialization

**Bootstrap Process:**

1. Load config from `extensions.config.json`
2. Filter extensions by status (`"on"` only)
3. Process stages in order (stores → loaders → validators → contextBuilders → senders → ui)
4. Within each stage: import → build DAG → topological sort → activate waves
5. Validate required slots (factStore, eventStore, entityStore)
6. Return populated ExtensionContext

**Features:**

-   Stages execute in order (no cross-stage dependency graphs)
-   Within-stage parallel activation via `after` field dependencies
-   Status filtering: `"on"`, `"off"`, or `"needs:<dependency>"`
-   ExtensionContext is plain object (type-safe, no index signatures)
-   Comprehensive test coverage (unit + integration)
-   Clean, refactored codebase following SOLID principles

**Dependency Status Logic (In Progress):**

-   ✅ **computeDependencyStatus** - Detect and mark extensions with unavailable dependencies
-   ⏳ **Still needed:**
    -   Respect user-disabled extensions (off stays off)
    -   Re-enable when dependencies become available
    -   Handle multiple and chained dependencies
    -   Config writer to persist status updates back to disk

**See [decisions.md](decisions.md) for full design rationale.**

### Timeline Storage

**Location:** `extensions/core/2-store-timeline/`

-   **Fact Store** - Store and query facts with temporal bounds (validFrom/validTo)
-   **Entity Store** - Entities with id/name/aliases/group, case-insensitive lookup
-   **Lexicon** - Valid terms per world for boundary validation
-   **Relationship Store** - Typed relationships between entities, bidirectional queries
-   **Graph Traversal** - BFS with configurable depth, type, and direction filters
-   **Event Store** - Events with participants, visibility, outcomes, fact generation

### Data Loading

**Location:** `extensions/core/1-load-world-data/`

-   SillyTavern lorebook JSON import
-   Entity creation, UUID generation, lexicon population
-   Skip tracking for disabled/invalid entries

### Consistency Validation

**Location:** `extensions/core/3-validate-consistency/`

-   **Validation Framework** - Generic rule interface, collect violations
-   **Entity Exists Check** - Unknown entity detection with fuzzy suggestions
-   **World Boundary Check** - LLM-powered anachronism detection

### Scene Context Building

**Location:** `extensions/core/4-build-scene-context/`

-   **Keyword Matcher** - Match lorebook entries by keywords
-   **Entity Matcher** - Fuzzy matching with similarity scoring
-   **Prompt Analyzer** - LLM-powered entity extraction
-   **Relationship Expander** - Graph-based context expansion

### LLM Integration

**Location:** `extensions/core/5-send-scene-context/`

-   OpenRouter API client with configurable models
-   Used by validators and analyzers

### Dev Chat UI

**Location:** `extensions/core/6-provide-ui/dev-chat/`

-   HTTP server with routing and session management
-   Chat interface with context injection
-   Lorebook and session management routes
-   Vanilla JS/TS frontend

---

## What's Missing (From Vision)

### Completed Milestones

-   ✅ **M1** - Basic validation, import, UI
-   ✅ **M2** - Relationship graph with traversal
-   ✅ **M3** - Temporal bounds on facts
-   ✅ **M4** - Events with participants, visibility, fact generation

### Still Needed

-   ❌ **M5** - Epistemic state (POV-filtered knowledge)
-   ❌ **M6** - Multi-agent orchestration
-   ❌ **M7-M9** - Geography, maps, spatial validation
-   ❌ **M10** - Calendar system
-   ❌ **M11** - Effect propagation, scene execution

**See [roadmap.md](roadmap.md) for milestone details.**

---

## Key Architectural Decisions

### Config-Driven Extensions (2026-01-10)

**Approach:** Extensions loaded via central config file, not auto-discovered.

**Benefits:**

-   Explicit over magic (see exactly what's loaded)
-   Non-technical users can edit JSON config
-   GUI can easily read/write config later
-   No custom directory scanning needed

### Six-Stage Pipeline (2026-01-10)

Extensions organized into 6 ordered stages:

1. loaders → 2. stores → 3. validators → 4. contextBuilders → 5. senders → 6. ui

**Benefits:**

-   Natural data flow, simple ordering
-   No cross-stage circular dependencies
-   Stage N only depends on stages 1 to N-1

### Lorebook Is Import Format (2025-12-30)

**Problem:** Keyword matching "Elara" can't distinguish Queen Elara from a student named Elara.

**Solution:** Transform lorebook into structured data:

-   **Entities** with unique IDs (not names)
-   **Facts** with subject=entityId (structured, queryable, temporal)
-   **Relationships** linking entity IDs

### World State as RPG Stats

All entities have queryable numeric attributes:

-   Characters get comprehensive state (physical, equipment, conditions, skills)
-   Kingdoms have economies, military strength, etc.
-   No hardcoded schemas - facts adapt to any world

### Tool-Calling Over Context-Stuffing

LLMs query facts via tools rather than receiving massive context packages:

-   Deterministic values (grain-tariff is exactly 0.15)
-   Prevents hallucination
-   Scales to large worlds

---

## Known Issues

1. **No fact extraction from LLM output** - Generate → extract → commit loop not closed
2. **Epistemic isolation not implemented** - All characters see all facts currently

---

## Tech Stack

-   **Runtime:** Bun
-   **Language:** TypeScript (strict mode)
-   **Testing:** Bun test
-   **Linting/Formatting:** Biome
-   **LLM:** OpenRouter API
-   **Frontend:** Vanilla JS/TS

---

## See Also

-   [vision.md](vision.md) - The full picture
-   [roadmap.md](roadmap.md) - Step-by-step path
-   [decisions.md](decisions.md) - Design rationale
