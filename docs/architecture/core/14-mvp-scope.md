## 14. MVP Scope

### 14.1 Success Criterion

A single test validates the MVP:

```
User prompt: "I enter the Sunnarian Royal Gardens and find the prince snorkeling."

System flags:
⚠️ "prince" - Sunnaria has no prince. Did you mean Princess Aradia?
⚠️ "snorkeling" - Activity not established in world. Out of place?
```

**If the system catches these two violations, MVP is complete.**

This tests:
1. **Entity validation**: "prince" doesn't exist in Sunnarian royal family
2. **World-boundary validation**: "snorkeling" doesn't belong in this world

---

### 14.2 Current Progress

**Last updated:** 2025-12-29

#### Completed Components (Beyond MVP)

| Component | File | Tests | Status |
|-----------|------|-------|--------|
| **World State** | | | |
| `Fact` | `world-state/fact/fact.ts` | - | ✅ Type only |
| `FactStore` | `world-state/fact/fact-store.ts` | 4 | ✅ Complete |
| `Entity` | `world-state/entity/entity.ts` | - | ✅ Type only |
| `EntityStore` | `world-state/entity/entity-store.ts` | 10 | ✅ Complete |
| `getEntities()` | `world-state/entity/entity-view.ts` | 5 | ✅ Complete |
| `Lexicon` | `world-state/lexicon/lexicon.ts` | 5 | ✅ Complete |
| **Import** | | | |
| `importSillyTavernLorebook` | `import/silly-tavern-importer.ts` | 8 | ✅ Complete |
| **LLM Integration** | | | |
| `OpenRouter` | `llm/openrouter.ts` | 5 | ✅ Complete |
| **Validation** | | | |
| `Validator` | `validation/validator.ts` | 5 | ✅ Complete |
| `EntityExistsRule` | `validation/entity-exists-rule.ts` | 6 | ✅ Complete |
| `WorldBoundaryRule` | `validation/world-boundary-rule.ts` | 5 | ✅ Complete |
| **Retrieval (NEW)** | | | |
| `KeywordMatcher` | `retrieval/keyword-matcher.ts` | 5 | ✅ Complete |
| `EntityMatcher` | `retrieval/entity-matcher.ts` | 8 | ✅ Complete |
| `LorebookLoader` | `retrieval/lorebook-loader.ts` | - | ✅ Complete |
| **Analysis (NEW)** | | | |
| `PromptAnalyzer` | `analysis/prompt-analyzer.ts` | 8 | ✅ Complete |
| **UI (NEW)** | | | |
| Server & Routes | `ui/server/`, `ui/routes/` | 20 | ✅ Complete |
| Frontend Components | `ui/public/` | 13 | ✅ Complete (1 error) |
| **Integration** | | | |
| Integration tests | `integration.test.ts` | 7 | ✅ Complete |

**Total: 114 tests passing (113 pass, 1 error - missing 'marked' package)**

**Current Status:** M1 complete. Chat UI working with context injection (keyword + entity extraction + fuzzy matching).

**See also:** [current.md](../../current.md) for detailed current state.

#### Data Model Summary

**Fact** - Atomic unit of world knowledge:
```typescript
type Fact = {
  worldId: string;
  subject: string;
  property: string;
  value: string | number | boolean;
};
```

**Entity** - First-class entity with identity:
```typescript
type Entity = {
  id: string;
  name: string;
  aliases: string[];
  group: string;
  worldId: string;
};
```

**Key Design Decisions:**
- `worldId` on both Fact and Entity enables multi-world support
- EntityStore supports lookup by id, name, or alias (case-insensitive)
- Lexicon tracks valid terms per world (case-insensitive)
- All stores use simple closure-based state (no state management library)

#### Import API

**importSillyTavernLorebook** - Async function to parse SillyTavern lorebook JSON:
```typescript
type ImportResult = {
  entities: Entity[];
  lexiconTerms: string[];
  skipped: SkippedEntry[];
};

importSillyTavernLorebook(filePath: string, worldId: string): Promise<ImportResult>
```

**Behavior:**
- Parses SillyTavern lorebook JSON files
- Creates Entity from each entry (comment → name, keys → aliases, group → group)
- Generates UUIDs for entity IDs
- Adds all keys (or name if keys empty) to lexicon terms
- Skips disabled entries silently
- Skips entries missing both key and comment (with reason in `skipped`)
- Throws on file not found or invalid JSON

#### Validation API

**Rule** - Interface for pluggable validation rules:
```typescript
type Rule = {
  check: (prompt: string) => Promise<Violation[]>;
};
```

**Violation** - Describes a constraint failure:
```typescript
type Violation = {
  type: string;
  term: string;
  message: string;
  suggestion?: string;
};
```

**Key Design Decisions:**
- Rules capture dependencies via closures (EntityStore, Lexicon, LLM client)
- EntityExistsRule uses title word detection (prince, king, queen, etc.) + capitalization heuristics
- WorldBoundaryRule delegates semantic judgment to LLM (OpenRouter)
- LLM is configurable - default model: `xiaomi/mimo-v2-flash:free`

#### Deferred

- **Containment** - Hierarchy relationships (part-of, located-in)
  - May be needed for "Sunnarian Royal Gardens" → Sunnaria relationship
  - Could be deferred if entity grouping is sufficient

#### Next Steps

1. **Phase 4: Integration** - Clean API for external consumers, CLI

---

### 14.3 SillyTavern Format Analysis

The `src/example/Excelsia/` folder contains 11 lorebook JSON files.

#### Entry Structure

```typescript
type LorebookEntry = {
  uid: number;                    // Unique ID within lorebook
  key: string[];                  // Trigger keywords (names, aliases)
  keysecondary: string[];         // Secondary keywords (rarely used)
  comment: string;                // Entry title/display name
  content: string;                // Free-form prose description
  group: string;                  // Category (Characters, Kingdoms, etc.)
  disable: boolean;               // Whether entry is active
  // ... many SillyTavern-specific fields (injection control, matching options)
};
```

#### What Maps to Our Model

| SillyTavern | Our Model |
|-------------|-----------|
| `key[0]` or `comment` | Entity.name |
| `key[]` (all) | Entity.aliases + Lexicon terms |
| `group` | Entity.group |
| `uid` | Entity.id (with world prefix) |
| `content` | Stored for future parsing |
| `disable: true` | Skip during import |

#### What Requires Future Work

- **Relationship extraction** from `content` prose (e.g., "daughter of King Alaric")
- **Structured sections** parsing (some entries have `[Character Identity]` blocks)
- **Injection control** fields are SillyTavern-specific, not needed for constraint checking

---

### 14.4 Architectural Considerations

#### Multi-World Support

The system manages **multiple worlds**, not just one. Each world is a self-contained dataset with its own facts, entities, lexicon, and containment hierarchy.

Examples:
- "Excelsia" is one world
- A user might have multiple worlds for different stories
- Each world can be loaded, saved, and exported independently

**Implementation:**
- `worldId` field on Fact and Entity
- Store methods filter by worldId
- Lexicon maintains separate term sets per world

#### Persistence (Deferred)

Not implemented in MVP, but the architecture must support:

| Operation | Description |
|-----------|-------------|
| **Load** | Load a world from storage (file, database) |
| **Save** | Persist current world state |
| **Export** | Export to various formats (JSON, SillyTavern, etc.) |

#### Extensible Systems (Deferred)

The full architecture includes systems that add dimensions to the world model:

| System | What it adds |
|--------|--------------|
| **Timeline** | Temporal bounds, events, "what was true when" |
| **Geography** | Coordinates, routes, travel time, spatial validation |
| **Calendar** | Time granularity, seasons, time-of-day constraints |

These are added as top-level modules when implemented, not pre-created.

---

### 14.5 Folder Structure

```
src/
├── world-state/                      # THE WORLD - core data model
│   │
│   ├── fact/                         # Facts: the atomic unit
│   │   ├── fact.ts                   # ✅ Fact type definition
│   │   ├── fact-store.ts             # ✅ Store and query facts
│   │   └── fact-store.test.ts        # ✅ 4 tests
│   │
│   ├── entity/                       # Entities: first-class objects
│   │   ├── entity.ts                 # ✅ Entity type definition
│   │   ├── entity-store.ts           # ✅ Store and query entities
│   │   ├── entity-store.test.ts      # ✅ 10 tests
│   │   ├── entity-view.ts            # ✅ Compute entities from facts
│   │   └── entity-view.test.ts       # ✅ 5 tests
│   │
│   ├── lexicon/                      # Vocabulary: what belongs here
│   │   ├── lexicon.ts                # ✅ Lexicon store
│   │   └── lexicon.test.ts           # ✅ 5 tests
│   │
│   └── containment/                  # 🔜 Hierarchy: part-of relationships
│       └── (deferred)
│
├── import/                           # IMPORT - getting data in
│   ├── silly-tavern-importer.ts      # ✅ SillyTavern JSON importer
│   ├── silly-tavern-importer.test.ts # ✅ 8 tests
│   └── __fixtures__/                 # ✅ Test fixture files
│
├── llm/                              # LLM - external AI integration
│   ├── openrouter.ts                 # ✅ OpenRouter API client
│   └── openrouter.test.ts            # ✅ 5 tests
│
├── validation/                       # CONSTRAINTS - checking consistency
│   ├── validator.ts                  # ✅ Rule runner
│   ├── validator.test.ts             # ✅ 5 tests
│   ├── entity-exists-rule.ts         # ✅ Unknown entity detection
│   ├── entity-exists-rule.test.ts    # ✅ 6 tests
│   ├── world-boundary-rule.ts        # ✅ Anachronism detection (LLM)
│   └── world-boundary-rule.test.ts   # ✅ 5 tests
│
├── api/                              # 🔜 API - external interface
│   └── (Phase 4)
│
├── integration.test.ts               # ✅ MVP integration tests (7 tests)
├── validate-prompt.ts                # ✅ CLI validation script
│
└── example/                          # Test data
    └── Excelsia/                     # ✅ 11 SillyTavern lorebook files
```

**Legend:** ✅ Complete | 🔜 Not yet implemented

---

### 14.6 Four Phases

#### Phase 1: Data Model ✅

Core types that everything else builds on.

- ✅ `Fact` type with subject, property, value, worldId
- ✅ `FactStore` for storing and querying facts
- ✅ `Entity` type with id, name, aliases, group, worldId
- ✅ `EntityStore` for storing and querying entities
- ✅ `getEntities()` for computing entity list from facts
- ✅ `Lexicon` for tracking valid terms per world
- 🔜 `Containment` for hierarchy relationships (deferred)

#### Phase 2: Import ✅

Get SillyTavern data into the system.

- ✅ `importSillyTavernLorebook()` async function
- ✅ Parse lorebook JSON structure
- ✅ Create Entity from each entry (comment → name, keys → aliases, group → group)
- ✅ Generate UUIDs for entity IDs
- ✅ Add all keys to lexicon terms (or name if keys empty)
- ✅ Skip disabled entries
- ✅ Track skipped entries with reasons
- ✅ Error handling for file not found / invalid JSON

#### Phase 3: Constraint Checking ✅

The core value: catch world-inconsistent input.

**Deliverables:**
- ✅ `Rule` interface for pluggable validation rules
- ✅ `Violation` type for constraint failures
- ✅ `Validator` to run rules and collect violations
- ✅ `EntityExistsRule` - flags unknown entities with suggestions
- ✅ `WorldBoundaryRule` - flags out-of-place concepts (LLM-powered)
- ✅ `OpenRouter` client for LLM integration
- ✅ The "prince/snorkeling" test passes

#### Phase 4: Integration

Connect to actual usage.

**Deliverables:**
- Clean API for external consumers
- CLI for testing
- Documentation for integration

---

### 14.7 Testing Strategy

This project follows strict TDD with ZOMBIES methodology:

- **Z**ero - Empty/null/zero inputs
- **O**ne - Single item behavior
- **M**any - Multiple items, collections
- **B**oundary - Edge cases, limits
- **I**nterface - Is the API ergonomic?
- **E**xceptions - Error cases
- **S**imple - Happy path scenarios

**Workflow:**
1. Identify what behavior needs testing
2. Apply ZOMBIES to enumerate test cases
3. Capture planned tests with `test.todo("description")`
4. Implement ONE test at a time: `test.todo` → `test` → pass → refactor

**Commands:**
```bash
bun test          # Run all tests
bun run check     # Lint + format (auto-fix)
```

---

### 14.8 Deferred (Full Architecture)

These are documented in the architecture but not in MVP scope:

**Persistence:**
- Load/save worlds to storage
- Export to various formats

**Timeline System (§2, §6):**
- Temporal bounds (validFrom/validTo)
- Events as source of truth
- Transaction time (undo/audit)
- Conflict detection for overlapping facts

**Geography System (§4, §16):**
- 2D coordinates
- Route calculation and pathfinding
- Travel time validation
- Terrain and weather systems

**Calendar System (§15):**
- Full temporal granularity (epoch → minute)
- Custom calendar systems
- Season and time-of-day constraints

**Epistemic (§8):**
- Event participation tracking
- Visibility levels
- Character knowledge isolation
- POV-scoped retrieval

**Effects (§3):**
- Sticky vs cascading propagation
- LLM-assisted effect generation
- Effect templates

**Scene Execution (§9):**
- Multi-agent orchestration
- Ambient generation
- Dialogue flow strategies

**Import Pipeline (§10):**
- NLP extraction (spaCy, etc.)
- Confidence tiers
- LLM fallback for complex cases

**Query Pipeline (§11):**
- Focus-based priority
- Depth-bounded traversal
- Token budget filtering

---

### 14.9 Test Data

The `src/example/Excelsia/` folder contains 11 SillyTavern lorebook JSON files:

- Characters (King Alaric, Queen Elara, Princess Aradia, etc.)
- Kingdoms (Sunnaria, Limaria, Ilaria, etc.)
- Geography, History, Factions, Religion, Magic System, etc.

This provides rich test data for validation.

**Key entities for MVP test:**
- Sunnaria (kingdom) - has King, Queen, Princess but NO Prince
- Princess Aradia - the "Did you mean?" suggestion

---

### 14.10 Definition of Done

MVP is complete when:

1. ☑ Excelsia lorebooks can be imported into the system
2. ☑ Entities are queryable (who is in Sunnaria's royal family?)
3. ☑ World lexicon is seeded from import
4. ☑ Prompts can be analyzed for entity/concept mentions
5. ☑ The "prince snorkeling" test passes with correct violations
6. ☑ All tests pass (`bun test`) - 60 tests
7. ☑ Code passes lint/format (`bun run check`)

**MVP COMPLETE** ✅

---
