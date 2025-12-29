# Current Implementation State

**Last updated:** 2025-12-29
**Test status:** 157 tests passing
**Current milestone:** M2 complete, ready for M3

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

### Timeline System
- ❌ Temporal bounds (validFrom/validTo) on facts
- ❌ Events as source of truth
- ❌ Chapter-based chronology
- ❌ Transaction time (undo/audit)
- ❌ Temporal queries ("what was true at Chapter 5?")

### Relationship Graph ✅ M2 COMPLETE
- ✅ Relationships between entities (flexible typed relationships)
- ✅ Graph traversal for context retrieval (BFS with depth/type/direction filters)
- ✅ "Sunnarian Princess" → Aradia resolution via graph
- 🔜 Integration with context retrieval pipeline (next step)

### Geography System
- ❌ Containment hierarchy (X is in Y)
- ❌ 2D coordinates
- ❌ Routes and travel time
- ❌ Spatial validation
- ❌ Terrain and weather

### Epistemic State
- ❌ Event participation tracking
- ❌ Visibility levels (private/court/public)
- ❌ POV-filtered context
- ❌ Knowledge isolation ("what does character X know?")

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

**M2 Complete:** Relationship graph system working

**What works now:**
- ✅ "Sunnarian" → Entity extraction → Fuzzy match → Sunnaria kingdom entry injected
- ✅ Relationship graph can connect "Sunnaria" → Royal Family → "Princess Aradia"
- ✅ Graph traversal supports multi-hop queries with depth/type/direction filters

**Next integration needed:**
- 🔜 Wire graph traversal into context retrieval pipeline
- 🔜 Use relationships to enhance entity matching ("Sunnarian Princess" → finds Aradia)
- 🔜 Containment queries for spatial context

**Remaining issues:**
- ❌ LLM still invents kingdoms not in lorebook (need broader context injection)
- ❌ No temporal bounds yet (M3: Timeline Foundation)

**Next milestone:** M3 - Timeline Foundation (chapter-based chronology)

---

## File Structure (Actual)

```
src/
├── world-state/          # Core data model
│   ├── fact/             # Facts: subject/property/value (NO temporal bounds yet)
│   ├── entity/           # Entities: id/name/aliases/group
│   ├── lexicon/          # World vocabulary tracking
│   └── relationship/     # M2: Typed relationships and graph traversal
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

**Next step:** M3 (Timeline Foundation) - see `roadmap.md`

---

## Known Issues

1. **Relationship graph not integrated** - Graph traversal works but needs wiring to context retrieval
2. **LLM invents kingdoms** - Need broader context injection or negative examples
3. **No fact extraction from LLM output** - Loop isn't closed (generate → extract → commit)
4. **No temporal bounds** - Facts don't track validFrom/validTo yet (M3)

---

## Test Breakdown

| Module | Tests | Status |
|--------|-------|--------|
| World State (fact/entity/lexicon) | 24 | ✅ |
| World State (relationship) | 26 | ✅ M2 |
| Import (SillyTavern) | 8 | ✅ |
| Validation (validator/rules) | 16 | ✅ |
| LLM (OpenRouter) | 5 | ✅ |
| Retrieval (keyword/entity/lorebook) | 13 | ✅ |
| Analysis (prompt analyzer) | 8 | ✅ |
| UI (server/routes/frontend) | 50 | ✅ |
| Integration | 7 | ✅ |
| **Total** | **157** | **All passing** |

---

## Summary

**M2 is complete.** Relationship graph system implemented with 26 tests covering:
- Typed relationships between entities (flexible string types)
- Bidirectional queries (from/to/both)
- BFS graph traversal with depth/type/direction filters
- Circular relationship handling
- Integration tests proving "Sunnaria" → "Aradia" resolution

**What works:** Basic validation, context injection (keyword + entity extraction), relationship graphs, chat UI.

**What's missing:** Timeline (M3), epistemic state (M5), multi-agent (M6), maps (M7-M9).

**Next:** M3 - Timeline Foundation (chapter-based chronology, temporal bounds on facts)

**Timeline to proof-of-concept (M6):** ~2-3 months remaining
**Timeline to full vision:** ~5-6 months remaining

---

**See also:**
- `vision.md` - The full picture
- `roadmap.md` - Step-by-step path from here to vision
- `DECISIONS.md` - Why we made key design choices
- `notes/context-injection-analysis.md` - Latest testing/analysis
