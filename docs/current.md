# Current Implementation State

**Current milestone:** M4 complete, Extension Architecture Phases 1-3 complete

**Architecture:** Plugin-first extension system with path aliases (`@core/*`, `@ext/*`)

**Next:** Phase 4 - Example extensions to prove architecture (see [roadmap.md](roadmap.md))

**Run tests:** `bun test`

---

## Architecture Overview

The project uses a **plugin-first architecture** where all functionality (including core) is an extension.

```
src/
├── core-types/           # Fundamental contracts (Event, Fact, Entity, Relationship)
├── extension-system/     # Plugin infrastructure (Registry, Loader, Hooks)
└── runtime/              # Runtime creation and Orchestrator

extensions/
└── core/                 # Standard implementation
    ├── 1-load-world-data/       # SillyTavern and other loaders
    ├── 2-store-timeline/        # Fact, Event, Entity, Relationship stores
    ├── 3-validate-consistency/  # Entity and world boundary validation
    ├── 4-build-scene-context/   # Keyword/entity matching, graph expansion
    ├── 5-send-scene-context/    # OpenRouter / LLM clients
    └── 6-provide-ui/            # Dev Chat interface
```

---

## What Works

### Extension System
**Location:** `src/extension-system/`
- Extension registry with dependency validation
- Extension loader with TS + JSON config support
- Lifecycle hook system with execution control
- Auto-discovery from `extensions/` directory
- Circular dependency detection
- Activate pattern with ExtensionContext for dependency injection

### Timeline Storage
**Location:** `extensions/core/2-store-timeline/`
- **Fact Store** - Store and query facts with temporal bounds (validFrom/validTo)
- **Entity Store** - Entities with id/name/aliases/group, case-insensitive lookup
- **Lexicon** - Valid terms per world for boundary validation
- **Relationship Store** - Typed relationships between entities, bidirectional queries
- **Graph Traversal** - BFS with configurable depth, type, and direction filters
- **Event Store** - Events with participants, visibility, outcomes, fact generation

### Data Loading
**Location:** `extensions/core/1-load-world-data/`
- SillyTavern lorebook JSON import
- Entity creation, UUID generation, lexicon population
- Skip tracking for disabled/invalid entries

### Consistency Validation
**Location:** `extensions/core/3-validate-consistency/`
- **Validation Framework** - Generic rule interface, collect violations
- **Entity Exists Check** - Unknown entity detection with fuzzy suggestions
- **World Boundary Check** - LLM-powered anachronism detection

### Scene Context Building
**Location:** `extensions/core/4-build-scene-context/`
- **Keyword Matcher** - Match lorebook entries by keywords
- **Entity Matcher** - Fuzzy matching with similarity scoring
- **Prompt Analyzer** - LLM-powered entity extraction
- **Relationship Expander** - Graph-based context expansion

### LLM Integration
**Location:** `extensions/core/5-send-scene-context/`
- OpenRouter API client with configurable models
- Used by validators and analyzers

### Dev Chat UI
**Location:** `extensions/core/6-provide-ui/dev-chat/`
- HTTP server with routing and session management
- Chat interface with context injection
- Lorebook and session management routes
- Vanilla JS/TS frontend

---

## What's Missing (From Vision)

### Completed Milestones
- ✅ **M1** - Basic validation, import, UI
- ✅ **M2** - Relationship graph with traversal
- ✅ **M3** - Temporal bounds on facts
- ✅ **M4** - Events with participants, visibility, fact generation

### Still Needed
- ❌ **M5** - Epistemic state (POV-filtered knowledge)
- ❌ **M6** - Multi-agent orchestration
- ❌ **M7-M9** - Geography, maps, spatial validation
- ❌ **M10** - Calendar system
- ❌ **M11** - Effect propagation, scene execution

**See [roadmap.md](roadmap.md) for milestone details.**

---

## Key Architectural Decisions

### Lorebook Is Import Format (2025-12-30)

**Problem:** Keyword matching "Elara" can't distinguish Queen Elara from a student named Elara.

**Solution:** Transform lorebook into structured data:
- **Entities** with unique IDs (not names)
- **Facts** with subject=entityId (structured, queryable, temporal)
- **Relationships** linking entity IDs

**Implication:** M5 includes lorebook ETL as prerequisite for epistemic isolation.

### Plugin-First Architecture (2026-01-01)

Everything is an extension, including core functionality:
- Zero codebase changes to add features
- Lifecycle hooks for interception
- Extensible stores
- Auto-discovery

### World State as RPG Stats

All entities have queryable numeric attributes:
- Characters get comprehensive state (physical, equipment, conditions, skills)
- Kingdoms have economies, military strength, etc.
- No hardcoded schemas - facts adapt to any world

### Tool-Calling Over Context-Stuffing

LLMs query facts via tools rather than receiving massive context packages:
- Deterministic values (grain-tariff is exactly 0.15)
- Prevents hallucination
- Scales to large worlds

---

## Known Issues

1. **No fact extraction from LLM output** - Generate → extract → commit loop not closed
2. **Epistemic isolation not implemented** - All characters see all facts currently

---

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **Testing:** Bun test
- **Linting/Formatting:** Biome
- **LLM:** OpenRouter API
- **Frontend:** Vanilla JS/TS

---

## See Also

- [vision.md](vision.md) - The full picture
- [roadmap.md](roadmap.md) - Step-by-step path
- [decisions.md](decisions.md) - Design rationale
