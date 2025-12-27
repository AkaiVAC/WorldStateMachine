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

### 14.2 Architectural Considerations

#### Multi-World Support

The system manages **multiple worlds**, not just one. Each world is a self-contained dataset with its own facts, entities, lexicon, and containment hierarchy.

Examples:
- "Excelsia" is one world
- A user might have multiple worlds for different stories
- Each world can be loaded, saved, and exported independently

**Implications for MVP:**
- Facts belong to a world (world identifier in data model)
- API operations specify which world to query
- Persistence is deferred but the model accommodates it

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

### 14.3 Folder Structure

```
src/
├── world-state/                      # THE WORLD - core data model
│   │
│   ├── fact/                         # Facts: the atomic unit
│   │   ├── fact.ts                   # Fact type definition
│   │   └── fact-store.ts             # Store and query facts
│   │
│   ├── entity/                       # Entities: derived from facts
│   │   ├── entity.ts                 # Entity type definition
│   │   └── entity-view.ts            # Compute entity from facts
│   │
│   ├── lexicon/                      # Vocabulary: what belongs here
│   │   ├── lexicon.ts                # Lexicon type definition
│   │   └── lexicon-entry.ts          # Individual entries
│   │
│   └── containment/                  # Hierarchy: part-of relationships
│       └── containment.ts            # Containment graph
│
├── validation/                       # CONSTRAINTS - checking consistency
│   │
│   ├── rule.ts                       # Rule interface (pluggable)
│   ├── violation.ts                  # Violation type
│   ├── validator.ts                  # Runs rules, collects violations
│   │
│   └── rules/                        # Individual rules (extensible)
│       ├── entity-exists.ts          # "Does this entity exist?"
│       └── world-boundary.ts         # "Does this belong in the world?"
│
├── import/                           # IMPORT - getting data in
│   │
│   ├── importer.ts                   # Importer interface (pluggable)
│   ├── import-result.ts              # Result type
│   │
│   └── adapters/                     # Source-specific (extensible)
│       └── sillytavern/
│           ├── sillytavern-importer.ts
│           └── sillytavern-parser.ts
│
├── prompt-analysis/                  # ANALYSIS - understanding input
│   │
│   ├── extractor.ts                  # Extractor interface (pluggable)
│   ├── extracted-reference.ts        # What was found in prompt
│   │
│   └── strategies/                   # Extraction strategies (swappable)
│       └── keyword-extractor.ts      # Simple keyword matching
│
├── api/                              # API - external interface
│   └── check-prompt.ts               # Main entry: prompt → violations
│
└── example/                          # Test data
    └── Excelsia/                     # SillyTavern lorebook files
```

**Extension points:**
- `validation/rules/` - add new validation rules
- `import/adapters/` - add new import sources
- `prompt-analysis/strategies/` - swap extraction strategies
- Top-level folders for Timeline, Geography, Calendar systems when built

---

### 14.4 Four Phases

#### Phase 1: Data Model

Core types that everything else builds on.

**Deliverables:**
- `Fact` type with subject, property, value, worldId
- `FactStore` for storing and querying facts
- `Entity` type and `EntityView` for computing entity state
- `Lexicon` and `LexiconEntry` types
- `Containment` for hierarchy relationships
- Basic queries (get entity, get facts about X)

#### Phase 2: Import

Get SillyTavern data into the system.

**Deliverables:**
- `Importer` interface for pluggable import sources
- `SillyTavernImporter` implementation
- Parse lorebook JSON structure
- Extract entities from entry names/keywords
- Build containment from groups
- Seed lexicon from content

#### Phase 3: Constraint Checking

The core value: catch world-inconsistent input.

**Deliverables:**
- `Rule` interface for pluggable validation rules
- `Violation` type for constraint failures
- `Validator` to run rules and collect violations
- `EntityExists` rule - flags unknown entities
- `WorldBoundary` rule - flags out-of-place concepts
- `Extractor` interface for prompt analysis
- `KeywordExtractor` implementation
- The "prince/snorkeling" test passes

#### Phase 4: Integration

Connect to actual usage.

**Deliverables:**
- Clean API for external consumers
- CLI for testing
- Documentation for integration

---

### 14.5 Deferred (Full Architecture)

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

### 14.6 Test Data

The `src/example/Excelsia/` folder contains 11 SillyTavern lorebook JSON files:

- Characters (King Alaric, Queen Elara, Princess Aradia, etc.)
- Kingdoms (Sunnaria, Limaria, Ilaria, etc.)
- Geography, History, Factions, Religion, Magic System, etc.

This provides rich test data for validation.

---

### 14.7 Definition of Done

MVP is complete when:

1. ✓ Excelsia lorebooks are imported into the system
2. ✓ Entities are queryable (who is in Sunnaria's royal family?)
3. ✓ World lexicon is seeded from content
4. ✓ Prompts can be analyzed for entity/concept mentions
5. ✓ The "prince snorkeling" test passes with correct violations
6. ✓ All tests pass (`bun test`)
7. ✓ Code passes lint/format (`bun run check`)

---
