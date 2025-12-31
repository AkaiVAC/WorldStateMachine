# Roadmap: From Current to Vision

**Last updated:** 2025-12-30
**Current position:** M4 complete, ready for M5
**Estimated timeline:** 5-7 months to full vision
**Proof-of-concept target:** M6 (epistemic state + multi-agent)

---

## Architectural Foundation: Fact-Based Runtime Model

**Key Insight (2025-12-30):** The lorebook is an *import format*, not the runtime model.

### The Problem with Keyword Matching

Lorebook entries are prose blobs matched by keywords. This causes:
- **Name collisions**: "Elara" the student triggers Queen Elara's entry
- **No disambiguation**: Can't distinguish entities with same name
- **No structure**: Prose isn't queryable
- **No temporal awareness**: Static text, no "when" information

### The Solution: Entity IDs + Structured Facts

```
LOREBOOK (Import)              RUNTIME MODEL
┌─────────────────┐            ┌─────────────────────────────────────┐
│ Prose blob with │   ──ETL──► │ Entity: elara-sunnaria-queen        │
│ keywords        │            │   displayName: "Elara"              │
│ "Queen Elara    │            │   facts:                            │
│  rules with..." │            │     - { attr: "title", val: "Queen" }│
└─────────────────┘            │     - { attr: "spouse", val: "alaric" }│
                               │   relationships:                     │
                               │     - { type: "rules", to: "sunnaria" }│
                               └─────────────────────────────────────┘
```

**Benefits:**
1. **No collisions**: Different entities have different IDs
2. **Structured queries**: "What facts does entity X know?"
3. **Temporal bounds**: Facts have validFrom/validTo
4. **True epistemic isolation**: Knowledge is per-entity-ID, not per-keyword

**Implications for Retrieval:**
- OLD: "Elara" in text → keyword search → inject matching prose
- NEW: Entity ID in scene → query facts for that entity → construct context

**Implications for Scene Setup:**
- Entities in a scene are identified by ID (or unambiguous reference)
- New entities (not in lorebook) get fresh IDs
- The LLM/author maintains entity→ID bindings within a session

**This enables M5 (Epistemic State):**
- `getKnowledge(entityId, timestamp)` → facts this entity knows
- No ambiguity about "which Elara"
- Clean foundation for multi-agent (M6)

---

## Milestone Sequencing Strategy

**Priority:** Realistic character knowledge first (epistemic state + multi-agent orchestration), then physical constraints (geography, travel), then advanced features.

**Critical path to proof-of-concept:**
1. M2: Relationship Graph (foundation)
2. M3: Timeline Foundation (temporal ordering)
3. M4: Events (track "who was there")
4. M5: Epistemic State ⭐ **FIRST BIG WIN**
5. M6: Multi-Agent Orchestration ⭐ **PROOF-OF-CONCEPT COMPLETE**

**After proof-of-concept:** Add physical constraints, then richness.

---

## Milestone Overview

| # | Milestone | Focus | Effort | Status |
|---|-----------|-------|--------|--------|
| 1 | Basic Validation | Entity checking, world boundary | 3-4 weeks | ✅ DONE |
| 2 | Relationship Graph | Entity relationships, graph traversal | 2-3 weeks | ✅ DONE |
| 3 | Timeline Foundation | Chapter-based chronology | 1-2 weeks | ✅ DONE |
| 4 | Events | Source of truth, participation tracking | 2-3 weeks | ✅ DONE |
| 5 | Epistemic State | POV-filtered knowledge | 3-4 weeks | 🎯 NEXT ⭐ |
| 6 | Multi-Agent Orchestration | Separate contexts, secrets | 2-3 weeks | 🔜 ⭐ |
| 7 | Basic Geography | Containment, proximity | 2 weeks | 🔜 |
| 8 | Travel Validation | Routes, travel time | 1-2 weeks | 🔜 |
| 9 | Full Map System | 2D coordinates, terrain, weather | 3-4 weeks | 🔜 |
| 10 | Calendar System | Full temporal granularity | 2-3 weeks | 🔜 |
| 11 | Effect Propagation | Cascading effects, ambient | 3-4 weeks | 🔜 |

**Total estimated effort:** 20-28 weeks (5-7 months)
**To proof-of-concept (M6):** 11-17 weeks (2.5-4 months)

---

## Phase 1: Character Knowledge (M2-M6)

**Goal:** Enable realistic character knowledge boundaries in roleplay scenarios.

### M2: Relationship Graph ✅ DONE

**Estimated effort:** 2-3 weeks

**Goal:** Add relationships between entities and enable graph traversal for context retrieval.

**What to build:**
- `Relationship` type: `{from: entityId, type: RelationType, to: entityId}`
- Relationship types: `daughter-of`, `son-of`, `rules`, `member-of`, `located-in`, etc.
- `RelationshipStore` with bidirectional queries
- Graph traversal: "Sunnaria" → `rules` → "Alaric", `member-of` → "Royal Family" → "Aradia"
- Integration with context retrieval

**Deliverables:**
- `src/world-state/relationship/relationship.ts` - Relationship type
- `src/world-state/relationship/relationship-store.ts` - Store and query
- `src/world-state/relationship/relationship-store.test.ts` - Tests
- `src/retrieval/graph-traversal.ts` - Context retrieval via graph
- `src/retrieval/graph-traversal.test.ts` - Tests

**Test cases (ZOMBIES):**
- Zero: Query entity with no relationships
- One: Single relationship lookup
- Many: Multiple relationships, multi-hop traversal
- Boundary: Circular relationships, deep graphs
- Interface: API ergonomics
- Exceptions: Unknown entity IDs
- Simple: "Sunnaria" → "Princess Aradia" via graph

**Success criteria:**
- User prompt: "Sunnarian Princess Comedy"
- Entity extraction: "Sunnarian" + "Princess"
- Graph traversal: "Sunnaria" → Royal Family → Aradia
- Context injection: ✅ Princess Aradia entry included

**Enables:** Better context injection, foundation for epistemic state

**Detailed design:** See `architecture/core/04-containment.md` (containment is a type of relationship)

---

### M3: Timeline Foundation ✅ DONE

**Estimated effort:** 1-2 weeks

**Goal:** Add temporal ordering to facts (chapter-based chronology).

**What to build:**
- Add `timestamp` field to `Fact` type (string: "Chapter 1", "Chapter 5", etc.)
- Add `validFrom` and `validTo` fields (nullable timestamps)
- Update `FactStore` to support temporal queries
- `getFactsAt(timestamp)` - query what was true at a specific time
- Chapter-based timeline (simple chronology)

**Deliverables:**
- Update `src/world-state/fact/fact.ts` - Add temporal fields
- Update `src/world-state/fact/fact-store.ts` - Temporal queries
- Update `src/world-state/fact/fact-store.test.ts` - Temporal test cases

**Test cases:**
- Fact created at Chapter 1, valid until Chapter 5 (then superseded)
- Query at Chapter 3: returns fact
- Query at Chapter 6: doesn't return fact
- Fact with validFrom but no validTo (still valid)
- Overlapping facts (conflict detection)

**Success criteria:**
- Can track "Alaric is King" from Chapter 1 onward
- Can track "Alaric is King" from Chapter 1 to Chapter 10 (then dies)
- Query "What was Alaric's title at Chapter 5?" → "King"

**Enables:** Events with temporal bounds, historical queries

**Detailed design:** See `architecture/core/02-timeline-centric.md`

---

### M4: Events as Source of Truth ✅ DONE

**Estimated effort:** 2-3 weeks

**Goal:** Track events that generate facts, record participation, preserve original prose.

**What was built:**
- `Event` type: id, worldId, timestamp, title, location, participants, visibility, outcomes, prose
- `EventStore` with queries by participant, timestamp, location, visibility
- Fact generation from events (`getFactsFromEvent`)
- Visibility levels: private, restricted, public
- 30 tests passing

**Deliverables:**
- `src/world-state/event/event.ts` - Event type
- `src/world-state/event/event-store.ts` - Store, query, and fact generation
- `src/world-state/event/event-store.test.ts` - 30 tests
- `src/world-state/event/index.ts` - Exports

**Event structure:**
```typescript
type Event = {
  id: string;
  worldId: string;
  timestamp: number;          // numeric timestamp
  title: string;              // "Secret War Council"
  location?: string;          // Entity ID for location
  participants: string[];     // Entity IDs
  visibility: Visibility;     // "private" | "restricted" | "public"
  outcomes?: Fact[];          // Facts extracted from this event
  prose?: string;             // Original prose
};
```

**Enables:** Epistemic state (who was at which events)

**Detailed design:** See `architecture/core/02-timeline-centric.md` §2.2, `architecture/core/08-epistemic-state.md`

---

### M5: Epistemic State + Tool-Calling Architecture ⭐ FIRST BIG WIN

**Estimated effort:** 5-6 weeks

**Goal:** Track what each character knows based on event participation and visibility. Enable tool-calling LLM architecture with deterministic facts. Transform lorebooks into comprehensive structured data.

**Architectural Shift:** Moving from context-stuffing to tool-calling (see decisions.md: "Tool-Calling Over Context-Stuffing")

---

#### Part 1: Hybrid Persistence Layer (SQLite + JSON)

**Files to create:**
- `src/world-state/persistence/sqlite-store.ts` - SQLite database operations
- `src/world-state/persistence/json-snapshot.ts` - JSON export/import
- `src/world-state/persistence/persistence.test.ts` - Tests

**Schema:**
```sql
-- Single database per world: worlds/excelsia/excelsia.db
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  worldId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,  -- character, kingdom, economy, weather, etc.
  aliases TEXT    -- JSON array
);

CREATE TABLE facts (
  id TEXT PRIMARY KEY,
  worldId TEXT NOT NULL,
  subject TEXT NOT NULL,  -- entity ID
  property TEXT NOT NULL,
  value TEXT NOT NULL,    -- JSON for complex values
  validFrom INTEGER,
  validTo INTEGER,
  causedBy TEXT           -- entity ID that caused this fact
);

CREATE TABLE relationships (
  id TEXT PRIMARY KEY,
  worldId TEXT NOT NULL,
  fromEntity TEXT NOT NULL,
  type TEXT NOT NULL,
  toEntity TEXT NOT NULL,
  validFrom INTEGER,
  validTo INTEGER
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  worldId TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  title TEXT,
  location TEXT,          -- entity ID
  participants TEXT,      -- JSON array of entity IDs
  visibility TEXT,        -- private/restricted/public
  outcomes TEXT,          -- JSON array of facts
  prose TEXT
);
```

**File structure:**
```
worlds/
  excelsia/
    excelsia.db              # SQLite runtime database
    source/                  # Original lorebook files (read-only)
      characters.json
      kingdoms.json
      ...
    snapshots/               # Human-readable backups
      snapshot-2025-12-31.json
```

---

#### Part 2: Comprehensive Lorebook ETL

**Files to create:**
- `src/import/lorebook-etl.ts` - Main ETL pipeline
- `src/import/entity-categorizer.ts` - Classify entity types
- `src/import/fact-extractor.ts` - Extract ALL facts from prose
- `src/import/relationship-extractor.ts` - Extract relationships
- `src/import/schema-analyzer.ts` - Identify common attributes across categories
- `src/import/lorebook-etl.test.ts` - Tests

**ETL Pipeline:**
```
PASS 1: Entity Categorization
  → Parse all lorebook entries
  → LLM classifies each: character, kingdom, economy, magic-system, etc.
  → Generate entity IDs: "aradia-princess", "sunnaria-kingdom", "sunnaria-economy"
  → Result: Entity registry with categories

PASS 2: Schema Discovery
  → Group entities by category (all kingdoms, all characters, etc.)
  → Identify common attributes across category
  → Example: All kingdoms have [population, borders-count, military-strength, ...]
  → Result: Schema templates per category

PASS 3: Comprehensive Fact Extraction (per entity)
  → For each entity, extract ALL measurable attributes
  → Use schema from Pass 2 as guide
  → Infer missing values from qualitative prose:
    - "thriving economy" → trade-volume: 8500
    - "defense-focused" → military-strength: 6.5/10
  → Extract both explicit and implicit facts
  → Result: Complete fact set per entity

PASS 4: Relationship Extraction
  → Identify relationships in prose
  → Use entity registry for name→ID resolution
  → Extract: daughter-of, rules, borders, allied-with, etc.
  → Result: Relationship graph

PASS 5: Store in SQLite + Create JSON Snapshot
  → Insert all entities, facts, relationships into SQLite
  → Generate JSON snapshot for human inspection
  → Preserve original prose in metadata
```

**Entity Categories (auto-detected):**
- `character` - Concrete persons (Aradia, Alaric, Elara)
- `kingdom` - Concrete places (Sunnaria, Lunaria)
- `economy` - Abstract systems (Sunnarian Economy, Continental Trade)
- `weather` - Environmental state (Sunnaria Weather)
- `magic-system` - Abstract concepts (Circle 1, Circle 2)
- `race` - Categories (Humans, Elves)
- `faction` - Groups (Merchant Guild, Military Order)
- `constant` - World fundamentals (always in context)

**LLM Requirements:**
- High-quality model for comprehensive extraction (Opus-tier recommended)
- Must infer missing numeric values from context
- Must maintain consistency across similar entities

---

#### Part 3: Tool-Calling Infrastructure

**Files to create:**
- `src/tools/world-tools.ts` - Tool definitions for LLMs
- `src/tools/fact-query.ts` - getFacts implementation
- `src/tools/knowledge-query.ts` - getKnowledge implementation
- `src/tools/relationship-query.ts` - getRelationships implementation
- `src/tools/entity-search.ts` - searchEntities implementation
- `src/tools/tools.test.ts` - Tests

**Tools API:**
```typescript
// Tool 1: Query all facts for an entity
getFacts(entityId: string, timestamp?: number): FactMap
  → Returns: { property: value } map for all facts
  → Example: { "grain-tariff": 0.15, "trade-volume": 8500, ... }

// Tool 2: Epistemic query - what does character know?
getKnowledge(characterId: string, timestamp: number): Knowledge
  → Returns: { events, facts, entities } character is aware of
  → Filters by event participation and visibility

// Tool 3: Relationship query
getRelationships(entityId: string, types?: string[]): Relationship[]
  → Returns: All relationships for entity
  → Optional filter by relationship type

// Tool 4: Entity discovery
searchEntities(query: string): EntitySummary[]
  → Fuzzy search across entity names/categories
  → Returns: ID list with brief descriptions
```

**Enforcement Strategy:**
- System prompt with strict tool usage requirements
- Function calling / structured output mode
- Validation rejects outputs without tool calls
- Lightweight LLM wrapper that enforces tool protocol

---

#### Part 4: Epistemic State Queries

**Files to create:**
- `src/world-state/epistemic/knowledge-query.ts` - Core epistemic logic
- `src/world-state/epistemic/knowledge-query.test.ts` - Tests

**Algorithm:**
```typescript
getKnowledge(characterId: string, timestamp: number) {
  // 1. Events character participated in
  const participatedEvents = eventStore.getByParticipant(characterId)
    .filter(e => e.timestamp <= timestamp);

  // 2. Public events (everyone knows)
  const publicEvents = eventStore.getByVisibility("public")
    .filter(e => e.timestamp <= timestamp);

  // 3. Revealed events (told about it)
  const revealedEvents = findReveals(characterId, timestamp);

  // 4. Combine (minus concealed events)
  const knownEvents = [...participatedEvents, ...publicEvents, ...revealedEvents]
    .filter(e => !isConcealedFrom(e, characterId));

  // 5. Extract facts and entity IDs from known events
  const knownFacts = knownEvents.flatMap(e => getFactsFromEvent(e));
  const knownEntities = extractEntityIds(knownEvents);

  return { events: knownEvents, facts: knownFacts, entities: knownEntities };
}
```

---

#### Part 5: Scene Generation with Tools

**Files to create:**
- `src/scene/tool-calling-generator.ts` - LLM wrapper with tool enforcement
- `src/scene/scene-setup.ts` - Scene configuration
- `src/scene/validation.ts` - Output validation
- `src/scene/scene.test.ts` - Tests

**Scene Flow:**
```typescript
1. Scene Setup (human or LLM-assisted)
   → participants: ["aradia-princess", "alaric-king"]
   → location: "sunnaria-throne-room"
   → timestamp: Chapter 5, Scene 3
   → povCharacter: "aradia-princess" (optional)

2. Build Minimal Context
   → Scene setup details
   → Entity ID list (relevant entities for this scene)
   → World fundamentals (kingdoms, magic rules)
   → Available tools

3. LLM Generation (with tool calling)
   → LLM must call getFacts/getKnowledge before generating
   → Tools return deterministic values
   → LLM generates prose using exact facts

4. Validation
   → Structural: Valid output format?
   → Fact consistency: Contradicts existing facts?
   → World boundary: Invalid entities/concepts?
   → Epistemic: Character knows information they shouldn't?

5. Extract New Facts from Output
   → Parse prose for new facts/events
   → Store with timestamp in SQLite

6. User Response
   → Parse user message for facts/events
   → Update world state
   → Continue loop
```

---

**Deliverables:**

**Persistence:**
- SQLite schema + operations
- JSON snapshot export/import
- Migration utilities

**ETL:**
- Multi-pass extraction pipeline
- Entity categorization (LLM-powered)
- Schema discovery across categories
- Comprehensive fact extraction (including inferred values)
- Relationship extraction

**Tools:**
- getFacts, getKnowledge, getRelationships, searchEntities
- Tool enforcement wrapper
- Validation pipeline

**Epistemic:**
- Knowledge query algorithm
- Participation + visibility filtering
- Reveal/conceal mechanisms

**Scene Generation:**
- Tool-calling LLM integration
- Scene setup utilities
- Output validation
- Fact extraction from generated prose

---

**Test Cases:**

**ETL:**
- Extract Aradia → ALL attributes (age, height, personality, combat-skill, etc.)
- Extract Sunnaria → ALL attributes (population, borders, military-strength, trade-volume, etc.)
- All 9 kingdoms have same schema (consistent attributes)
- Abstract entities (economy, weather) extracted as entities with facts

**Persistence:**
- Save/load world to SQLite
- JSON snapshot matches database
- Query performance acceptable (<100ms for fact queries)

**Epistemic:**
- Character participated in event → knows about it
- Character didn't participate, event is public → knows about it
- Character didn't participate, event is private → doesn't know
- getKnowledge filters correctly

**Tool-Calling:**
- LLM calls getFacts before generating economic data
- LLM calls getKnowledge before writing character dialogue
- Tool returns match database exactly (deterministic)

---

**Success Criteria:**

1. **Excelsia ETL Complete:**
   - All 106 lorebook entries → entities in SQLite
   - ~500-1000 facts extracted (comprehensive)
   - Relationship graph populated
   - JSON snapshot readable and accurate

2. **Epistemic Isolation Works:**
   - Create private event (Secret War Council)
   - Query Aradia's knowledge → doesn't include it
   - Query King's knowledge → includes it
   - Tool calls respect epistemic boundaries

3. **Tool-Calling Generation Works:**
   - Scene: Aradia considers raising tariffs
   - LLM calls getFacts("sunnaria-economy")
   - Tool returns grain-tariff: 0.15 (exact value)
   - LLM generates prose using 0.15, not hallucinated value

4. **Round-Trip Works:**
   - Generate scene → extract new facts → store in DB
   - Next scene queries updated facts
   - Changes persist across sessions (SQLite)

**Enables:** Multi-agent orchestration (M6), deterministic world state, true epistemic isolation

**Detailed design:** See `architecture/core/08-epistemic-state.md` and decisions.md

---

### M6: Multi-Agent Orchestration ⭐ PROOF-OF-CONCEPT COMPLETE

**Estimated effort:** 2-3 weeks

**Goal:** Generate scenes with multiple characters who have different knowledge. Each character gets POV-filtered context.

**What to build:**
- Multi-agent scene setup (multiple characters, each with POV context)
- Orchestrated dialogue generation (character A speaks, character B responds)
- Knowledge tracking during scene (if A reveals X to B, update B's knowledge)
- Merge individual outputs into coherent scene
- UI for multi-agent scene setup

**Deliverables:**
- `src/scene/multi-agent.ts` - Multi-agent orchestration
- `src/scene/multi-agent.test.ts` - Tests
- `src/ui/routes/scene.ts` - Scene setup UI
- Integration with epistemic state

**Test cases:**
- Two-character scene, both know same information → normal dialogue
- Two-character scene, A knows secret, B doesn't → A's context includes secret, B's doesn't
- During dialogue, A reveals secret to B → B's context updated
- Three-character scene with mixed knowledge

**Success criteria:**
- Scene: King Alaric and Princess Aradia discuss the war (Chapter 6)
- King knows: Secret war council decision (attack from north)
- Aradia knows: War started (public knowledge), but not strategy
- System generates:
  - King's dialogue with full context (including secret)
  - Aradia's dialogue with limited context (no secret)
  - LLM for King can reference strategy, LLM for Aradia cannot
- If King mentions "northern strategy" in dialogue → system flags as "revealed to Aradia"

**Enables:** Realistic roleplay with secrets, complex multi-character scenes

**Proof-of-concept target:** If this works, the core vision is validated.

**Detailed design:** See `architecture/core/09-scene-execution.md` §9.3-9.4

---

## Phase 2: Physical Constraints (M7-M8)

**Goal:** Add spatial validation and prevent impossible character movement.

### M7: Basic Geography

**Estimated effort:** 2 weeks

**Goal:** Locations with containment hierarchy. "X is in Y" relationships.

**What to build:**
- `Location` type (entity subtype with spatial properties)
- Containment relationships (`part-of`, `located-in`)
- Proximity queries ("what's near X?")
- Location context for scenes

**Deliverables:**
- `src/world-state/geography/location.ts`
- `src/world-state/geography/containment.ts`
- Tests

**Success criteria:**
- "Royal Gardens" is `part-of` "Sunnaria"
- Query "What's in Sunnaria?" → [Palace, Royal Gardens, Market District, ...]
- Scene in Royal Gardens → context includes Sunnaria

**Enables:** Travel validation

**Detailed design:** See `architecture/core/04-containment.md`

---

### M8: Travel Validation

**Estimated effort:** 1-2 weeks

**Goal:** Routes between locations, travel time validation. Characters can't teleport.

**What to build:**
- `Route` type: from/to locations, travel time
- Travel time calculation
- Validation rule: "Can character X be at location Y at timestamp Z?"

**Deliverables:**
- `src/world-state/geography/route.ts`
- `src/validation/travel-rule.ts`
- Tests

**Success criteria:**
- Route: Sunnaria ↔ Ilaria (7 days)
- Aradia in Sunnaria at Chapter 5, Day 1
- Aradia in Ilaria at Chapter 5, Day 9
- Validation: ✅ (7 days + margin, plausible)
- Aradia in Ilaria at Chapter 5, Day 3
- Validation: ❌ (only 2 days, impossible)

**Enables:** Spatial consistency constraints

**Detailed design:** See `architecture/core/16-map-spatial-system.md` §16.7

---

## Phase 3: Advanced Features (M9-M11)

**Goal:** Add richness and depth to the world model.

### M9: Full Map System

**Estimated effort:** 3-4 weeks

**Goal:** 2D coordinates, terrain, weather, advanced travel physics.

**What to build:**
- 2D coordinates for locations
- Terrain types (plains, mountains, forest, etc.)
- Weather system (per location, per timestamp)
- Advanced route calculation (terrain affects travel time)
- Map visualization (optional)

**Deliverables:**
- `src/world-state/map/coordinates.ts`
- `src/world-state/map/terrain.ts`
- `src/world-state/map/weather.ts`
- Tests

**Success criteria:**
- Locations have (x, y) coordinates
- Route calculation considers terrain (mountains slower than plains)
- Weather at location/timestamp ("Sunnaria, Chapter 5, Day 3" → "Rainy")
- Context injection includes weather/terrain

**Detailed design:** See `architecture/core/16-map-spatial-system.md`

---

### M10: Calendar System

**Estimated effort:** 2-3 weeks

**Goal:** Full temporal granularity (year → season → month → day → hour).

**What to build:**
- Calendar structure (epochs, eras, years, seasons, months, days, hours)
- Custom calendar support (configurable per world)
- Time-of-day and seasonal constraints
- Temporal math (duration, interval, comparison)

**Deliverables:**
- `src/world-state/calendar/calendar.ts`
- `src/world-state/calendar/timestamp.ts`
- Tests

**Success criteria:**
- Define custom calendar (12 months, 30 days each, 4 seasons)
- Timestamps have full granularity: "Year 20, Summer, Month 3, Day 15, Hour 14"
- Constraints: "Can't farm in winter" (season check)
- Context: "It's night, the market is closed" (time-of-day check)

**Detailed design:** See `architecture/core/15-calendar-time-system.md`

---

### M11: Effect Propagation

**Estimated effort:** 3-4 weeks

**Goal:** Cascading effects, LLM-generated possibility branches, ambient generation.

**What to build:**
- Effect identification (which entities affected by event?)
- Relationship-based propagation ("flows-through", "depends-on", etc.)
- LLM-generated effect branches with probabilities
- Author/dice selection of branch
- Recursive effect propagation (with checkpoints)
- Ambient generation (background events within constraints)

**Deliverables:**
- `src/world-state/effects/propagation.ts`
- `src/world-state/effects/branches.ts`
- `src/scene/ambient.ts`
- Tests

**Success criteria:**
- Event: "Dam built on Great River"
- System identifies affected: Downstream kingdoms (via `flows-through` relationships)
- LLM generates branches:
  - A: Catastrophic flooding (30%)
  - B: Controlled flow (50%)
  - C: Improved irrigation (20%)
- Author selects branch B
- Effects become facts: Diplomatic tension increases, but manageable

**Detailed design:** See `architecture/core/03-effects.md`, `architecture/core/09-scene-execution.md` §9.5-9.6

---

## Milestone Dependencies

```
M1 ✅
 │
 └─► M2 (Relationship Graph)
      │
      └─► M3 (Timeline)
           │
           └─► M4 (Events)
                │
                ├─► M5 (Epistemic State) ⭐
                │    │
                │    └─► M6 (Multi-Agent) ⭐ PROOF-OF-CONCEPT
                │
                └─► M7 (Basic Geography)
                     │
                     └─► M8 (Travel Validation)
                          │
                          ├─► M9 (Full Map)
                          │
                          └─► M10 (Calendar)
                               │
                               └─► M11 (Effects)
```

**Critical path:** M1 → M2 → M3 → M4 → M5 → M6 (epistemic + multi-agent)
**Parallel track:** M7 → M8 → M9 (geography)
**Final integration:** M10 (calendar) + M11 (effects)

---

## Evaluation Points

### After M6 (Proof-of-Concept) - CRITICAL DECISION POINT

**Test scenarios:**
1. Secret war council (3 characters know, Princess doesn't)
2. Later scene where Princess talks to King
3. Does LLM respect knowledge constraint?

**Evaluate:**
- Does epistemic isolation work?
- Does multi-agent feel natural?
- Is validation catching mistakes?
- Is the system worth continuing?

**Decisions:**
- ✅ If successful: Continue to M7-M11
- ⚠️ If mixed: Adjust approach, iterate on M5-M6
- ❌ If unsuccessful: Pivot architecture or tooling

### After M8 (Physical Constraints)

**Test:** Travel validation working?
- Character movement makes sense?
- No teleporting?

**Evaluate:** Is spatial validation adding value?

### After M11 (Full Vision)

**Test:** Full constraint package working?
- All three pillars (Timeline, Map, Calendar)?
- LLM generating world-consistent prose?

**Evaluate:** Production-ready?

---

## Iteration Strategy

**Each milestone:**
1. **Plan:** Apply ZOMBIES to enumerate test cases
2. **Write tests:** Start with `test.todo()`, convert one at a time
3. **Implement:** Minimum code to pass tests
4. **Refactor:** Clean up, improve
5. **Integrate:** Wire into existing system
6. **Validate:** Test with real scenarios

**One milestone at a time.** No skipping ahead.

---

## Timeline Estimates

| Milestone | Weeks | Cumulative |
|-----------|-------|------------|
| M1 | - | ✅ DONE |
| M2 | 2-3 | 2-3 weeks |
| M3 | 1-2 | 3-5 weeks |
| M4 | 2-3 | 5-8 weeks |
| M5 | 3-4 | 8-12 weeks |
| **M6** | **2-3** | **10-15 weeks** ⭐ **PROOF-OF-CONCEPT** |
| M7 | 2 | 12-17 weeks |
| M8 | 1-2 | 13-19 weeks |
| M9 | 3-4 | 16-23 weeks |
| M10 | 2-3 | 18-26 weeks |
| M11 | 3-4 | 21-30 weeks |

**To proof-of-concept:** 2.5-4 months
**To full vision:** 5-7.5 months

---

## Future Features (Post-M11)

### Anticipatory Context Injection

**Problem:** If a scene is *leading toward* a topic (e.g., trade negotiations about tariffs) without explicitly mentioning it, how can we preemptively inject relevant context?

**Potential approaches:**

1. **Scene Classification**
   - LLM analyzes conversation trajectory: "This looks like a diplomatic scene building toward trade discussion"
   - Pre-inject trade/economic entries before they're explicitly mentioned

2. **Topic Momentum Tracking**
   - Track topic mentions across conversation history
   - When a topic gains momentum (multiple related mentions), anticipate and inject

3. **Narrative Arc Templates**
   - Define common story beats: "Diplomatic meeting" → likely leads to treaties, trade, alliances
   - Pre-inject related context based on scene type

**Status:** Deferred. Requires conversation history analysis and scene classification. Consider after M6.

---

## Next Steps

**Immediate:** Start M5 (Epistemic State)

1. Design `getKnowledge(characterId, timestamp)` query interface
2. Implement participation-based knowledge (if you were there, you know)
3. Implement visibility-based knowledge (public vs private events)
4. Apply ZOMBIES, write `test.todo()` cases
5. Create POV-filtered context retrieval

**See also:**
- `vision.md` - What we're building toward
- `current.md` - Where we are now
- `DECISIONS.md` - Why we made key design choices
