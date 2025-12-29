# Current Implementation State

**Last updated:** 2025-12-29
**Test status:** 114 tests passing, 1 test with error (missing 'marked' package)
**Current milestone:** M1 complete, starting M2

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

### Relationship Graph
- ❌ Relationships between entities (daughter-of, rules, etc.)
- ❌ Graph traversal for context retrieval
- ❌ "Sunnarian Princess" → Aradia resolution

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

## Current Problem (From Testing)

**Test case:** "The Sunnarian Court Princess Comedy"

**What works:**
- ✅ "Sunnarian" → Entity extraction → Fuzzy match → Sunnaria kingdom entry injected

**What doesn't work:**
- ❌ "Princess" alone doesn't match "Princess Aradia" (too generic)
- ❌ LLM still invents kingdoms not in lorebook (Drakmoor, Valenhall)
- ❌ No relationship graph to connect "Sunnarian" + "Princess" → Aradia

**Root cause:** Need relationship graph traversal (Milestone 2)

**Analysis:** See `notes/context-injection-analysis.md`

---

## File Structure (Actual)

```
src/
├── world-state/          # Core data model
│   ├── fact/             # Facts: subject/property/value (NO temporal bounds yet)
│   ├── entity/           # Entities: id/name/aliases/group
│   └── lexicon/          # World vocabulary tracking
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

**From M1 (current) to Vision:**
- M1 provides basic validation and context injection
- Missing all advanced features (timeline, relationships, epistemic, maps)
- Chat UI exists but context injection is basic (keyword matching only)

**Next step:** M2 (Relationship Graph) - see `roadmap.md`

---

## Known Issues

1. **Missing 'marked' package** - 1 test error in markdown rendering
2. **Entity extraction doesn't handle relationships** - "Sunnarian Princess" doesn't combine to find Aradia
3. **LLM invents kingdoms** - Need broader context injection or negative examples
4. **No fact extraction from LLM output** - Loop isn't closed (generate → extract → commit)

---

## Test Breakdown

| Module | Tests | Status |
|--------|-------|--------|
| World State (fact/entity/lexicon) | 24 | ✅ |
| Import (SillyTavern) | 8 | ✅ |
| Validation (validator/rules) | 16 | ✅ |
| LLM (OpenRouter) | 5 | ✅ |
| Retrieval (keyword/entity/lorebook) | 13 | ✅ |
| Analysis (prompt analyzer) | 8 | ✅ |
| UI (server/routes/frontend) | 33 | ✅ (1 error) |
| Integration | 7 | ✅ |
| **Total** | **114** | **113 pass, 1 error** |

---

## Summary

**M1 is complete.** Basic validation works. Context injection works (keyword + entity extraction). Chat UI works.

**But:** The system is still far from the vision. No timeline, no relationships, no epistemic state, no maps, no multi-agent.

**Next:** M2 - Relationship Graph (see `roadmap.md`)

**Timeline to vision:** ~5-7 months of development (see `roadmap.md` for milestones)

---

**See also:**
- `vision.md` - The full picture
- `roadmap.md` - Step-by-step path from here to vision
- `DECISIONS.md` - Why we made key design choices
- `notes/context-injection-analysis.md` - Latest testing/analysis
