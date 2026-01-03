# Roadmap: From Current to Vision

**Last updated:** 2026-01-01
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

**Character-Specific Extraction (RPG Model):**

Characters get comprehensive state extraction across categories:

**1. Physical Attributes:**
```typescript
{subject: "reacher", property: "height", value: 185}  // cm
{subject: "reacher", property: "strength", value: 7.5}  // 0-10 scale
{subject: "reacher", property: "dexterity", value: 6.0}
{subject: "reacher", property: "age", value: 34}
```

**2. Equipment State:**
```typescript
{subject: "reacher", property: "equipment.shoe-left.condition", value: "worn"}
{subject: "reacher", property: "equipment.tunic.color", value: "red"}
{subject: "reacher", property: "equipment.sword", value: "standard-steel-blade"}
```

**3. Appearance:**
```typescript
{subject: "reacher", property: "appearance.clothing.tunic.color", value: "red"}
{subject: "reacher", property: "appearance.hair.style", value: "short-unkempt"}
{subject: "reacher", property: "appearance.visible-injuries", value: "scar-left-cheek"}
```

**4. Capabilities:**
```typescript
{subject: "reacher", property: "skill.aspect-theory", value: 9.5}  // 0-10
{subject: "reacher", property: "skill.combat", value: 7.0}
{subject: "reacher", property: "can-swim", value: true}
```

**5. Social/Emotional Baseline:**
```typescript
{subject: "reacher", property: "attitude-toward.academy", value: 7.0}
{subject: "reacher", property: "trust-level.council", value: 3.5}
```

**LLM Requirements:**
- High-quality model for comprehensive extraction (Opus-tier recommended)
- Must infer missing numeric values from context
- Must maintain consistency across similar entities
- Must extract ALL character attributes (treat characters as RPG stat sheets)

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

#### Part 6: Comprehensive Character State Extraction from Scenes

**Files to create:**
- `src/extraction/character-state-extractor.ts` - Extract state changes from prose
- `src/extraction/validation-rules.ts` - Consistency validation rules
- `src/extraction/character-state-extractor.test.ts` - Tests

**What to extract from scene prose:**

**Physical Condition (Temporal):**
```typescript
// Injuries, exhaustion, environmental effects
{subject: "reacher", property: "health.current", value: 85, validFrom: 43}
{subject: "reacher", property: "stamina.current", value: 60, validFrom: 43}
{subject: "reacher", property: "condition.wetness", value: "waist-down", validFrom: 43, validTo: 48}
{subject: "reacher", property: "condition.exhaustion", value: 6.5, validFrom: 43, validTo: 50}
```

**Equipment Changes (Temporal):**
```typescript
// Damage, acquisition, loss
{subject: "reacher", property: "equipment.shoe-left.condition", value: "damaged-toe-exposed", validFrom: 43}
{subject: "reacher", property: "equipment.tunic.condition", value: "torn-shoulder", validFrom: 43}
{subject: "reacher", property: "equipment.sword", value: "lost-in-river", validFrom: 43}
```

**Appearance Changes (Temporal):**
```typescript
// Clothing changes, visible wounds
{subject: "reacher", property: "appearance.clothing.tunic.color", value: "red", validFrom: 1}  // Consistency check
{subject: "reacher", property: "appearance.visible-injuries", value: "cut-left-arm", validFrom: 43}
```

**Social/Emotional Changes (Temporal):**
```typescript
// Attitude shifts, mood changes
{subject: "reacher", property: "mood", value: "irritable", validFrom: 43, validTo: 50}
{subject: "reacher", property: "attitude-toward.violet-elf", value: "impressed", validFrom: 43}
```

**Status Effects (Temporal):**
```typescript
// Buffs, debuffs, conditions
{subject: "reacher", property: "status.poisoned", value: true, validFrom: 43, validTo: 50}
{subject: "reacher", property: "status.blessed", value: "aspect-ward", validFrom: 43, validTo: 100}
```

**Extraction Process:**

1. **Post-Scene Analysis:**
   - LLM analyzes prose for state changes
   - Extracts all changes per character
   - Returns candidate facts with timestamps

2. **Human Review:**
   - Show extracted facts to user
   - "Extracted from Scene 43: Reacher's shoe damaged (toe exposed), wet waist-down, exhausted (6.5/10)"
   - User approves/edits/rejects

3. **Consistency Validation:**
   - Check for contradictions (red tunic → green tunic without clothing-change event)
   - Check for impossible changes (height changes, capabilities lost without cause)
   - Flag warnings for review

4. **Commit to Timeline:**
   - Add approved facts to SQLite
   - Update JSON snapshot
   - Facts now queryable in future scenes

**Validation Rules:**

**Appearance Consistency:**
```typescript
// If clothing color changes without explicit change event, flag it
validateAppearanceConsistency(newFact, existingFacts) {
  if (newFact.property === "appearance.clothing.tunic.color") {
    const previous = existingFacts.find(f => f.property === newFact.property)
    if (previous && previous.value !== newFact.value) {
      return {
        warning: "Clothing color changed without explicit event",
        previous: previous.value,
        new: newFact.value,
        suggestion: "Create clothing-change event or correct color"
      }
    }
  }
}
```

**Physical Constraints:**
```typescript
// Characters can't exceed reach height, strength limits, etc.
validatePhysicalConstraints(action, characterFacts) {
  if (action === "reach-high-table") {
    const height = characterFacts["height"]
    const reach = characterFacts["can-reach-height"] || (height + 30)
    const tableHeight = 180

    if (reach < tableHeight) {
      return {
        violation: "Impossible action - cannot reach",
        characterReach: reach,
        requiredHeight: tableHeight,
        suggestion: "Character needs to climb or get help"
      }
    }
  }
}
```

**Equipment State Constraints:**
```typescript
// Can't use broken equipment
validateEquipmentUsage(action, equipmentState) {
  if (action === "sword-attack" && equipmentState["equipment.sword"] === "broken") {
    return {
      violation: "Cannot use broken equipment",
      suggestion: "Repair sword or use different weapon"
    }
  }
}
```

**Benefits:**

1. **Complete Continuity:** "I was wearing red" stays red across scenes
2. **Physical Consistency:** Damaged shoe affects future actions (mud avoidance)
3. **RPG-Style State:** Characters have queryable stats like any entity
4. **Emergence:** Status effects combine (exhausted + wounded = can't run)

---

**Test Cases:**

**ETL:**
- Extract Aradia → ALL attributes (age, height, personality, combat-skill, etc.)
- Extract Sunnaria → ALL attributes (population, borders, military-strength, trade-volume, etc.)
- All 9 kingdoms have same schema (consistent attributes)
- Abstract entities (economy, weather) extracted as entities with facts
- Characters extracted with full RPG stats (appearance, equipment, skills, etc.)

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

**Character State Extraction:**
- Scene: Character's shoe damaged → Extract equipment.shoe-left.condition fact
- Scene: Character wearing red tunic → Later scene with green tunic → Flag contradiction
- Scene: Character exhausted and wet → Facts persist into next scene
- Validation: Short character can't reach high table → Flag violation

---

**Success Criteria:**

1. **Excelsia ETL Complete:**
   - All 106 lorebook entries → entities in SQLite
   - ~500-1000 facts extracted (comprehensive, including all character RPG stats)
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

4. **Character State Continuity Works:**
   - Scene 43: Reacher's shoe damaged (extracted as fact)
   - Scene 50: LLM queries getFacts("reacher"), sees damaged shoe
   - LLM generates: "Reacher avoided the mud, mindful of his exposed toe"
   - Validation catches clothing color contradictions

5. **Round-Trip Works:**
   - Generate scene → extract character state changes → store in DB
   - Next scene queries updated facts (equipment, conditions, appearance)
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

### M11: Unified World Tick & Ambient Simulation

**Estimated effort:** 4-5 weeks

**Goal:** Implement unified world tick architecture where ALL entities simulate forward (at varying detail levels). The world always progresses, whether characters are in focus or off-screen.

**Core Principle:** Everything ticks forward every timestamp. The difference isn't IF entities update, it's HOW MUCH DETAIL.

---

**What to build:**

**1. Simulation Tier System**

Entities are assigned simulation tiers based on focus:

```typescript
type SimulationTier = "focus" | "intentional" | "passive" | "system"

type Entity = {
  id: string
  tier: SimulationTier  // Changes dynamically
  lastSimulated: number
  activeIntent?: Intent
}
```

**Tier 1: Focus (Full Scenes)**
- Characters currently in focus
- Full prose generation (user-driven or LLM)
- Complete state extraction
- Detailed Events with full prose

**Tier 2: Intentional (Off-Screen Active)**
- Characters with active goals/intents
- State changes + brief summaries
- Events with summary prose
- Example: Aradia fighting necromancer off-screen

**Tier 3: Passive (Background)**
- Inactive characters, minor NPCs
- Minimal state drift (location changes, routine activities)
- Events only for significant changes
- Example: Guards patrolling, students studying

**Tier 4: System (Automatic)**
- Non-character entities (economies, weather, kingdoms)
- Rule-based or stochastic updates
- Direct fact updates (no Events unless significant)
- Example: Grain tariff drifts, seasons change

---

**2. Unified Tick Function**

**Files to create:**
- `src/simulation/world-tick.ts` - Main tick orchestrator
- `src/simulation/tier-simulators.ts` - Tier-specific simulation logic
- `src/simulation/intent-manager.ts` - Off-screen intent tracking
- `src/simulation/relevance-filter.ts` - Determine which entities to simulate
- `src/simulation/world-tick.test.ts` - Tests

**Core Algorithm:**
```typescript
worldTick(timestamp: number) {

  // Get all entities in world
  const entities = getAllEntities()

  // Group by simulation tier
  const byTier = groupByTier(entities)

  // Simulate each tier with appropriate detail level
  const updates = [
    ...simulateFocusTier(byTier.focus, timestamp),        // Full scenes
    ...simulateIntentionalTier(byTier.intentional, timestamp),  // Summaries
    ...simulatePassiveTier(byTier.passive, timestamp),    // Minimal
    ...simulateSystemTier(byTier.system, timestamp)       // Automatic
  ]

  // Commit all changes to timeline
  commitAllUpdates(updates, timestamp)

  // World is now at timestamp+1
}
```

**Tier Simulators:**

```typescript
// Tier 1: Full scene generation
simulateFocusTier(characters: Entity[], timestamp: number) {
  const events = []

  for (const char of characters) {
    // User-driven or LLM prose generation
    const scene = generateFullScene({
      character: char,
      timestamp: timestamp,
      userPrompt: currentPrompt
    })

    // Extract comprehensive state changes
    const stateChanges = extractCharacterState(scene.prose)

    // Create full Event
    events.push({
      timestamp: timestamp,
      participants: [char.id],
      prose: scene.prose,  // FULL PROSE
      outcomes: stateChanges,
      type: "focus"
    })
  }

  return events
}

// Tier 2: Intentional simulation (off-screen active)
simulateIntentionalTier(characters: Entity[], timestamp: number) {
  const events = []

  for (const char of characters) {
    if (!char.activeIntent) continue

    // Generate state changes based on intent progress
    const update = progressIntent({
      character: char,
      intent: char.activeIntent,
      timestamp: timestamp
    })

    // Create Event with SUMMARY prose
    events.push({
      timestamp: timestamp,
      participants: [char.id],
      prose: update.summary,  // BRIEF: "Aradia pressed deeper into crypts..."
      outcomes: update.stateChanges,
      type: "intentional"
    })

    // Check if intent resolves
    if (update.progress >= 1.0) {
      const resolution = resolveIntent(char.activeIntent, timestamp)
      events.push(resolution.event)
      char.activeIntent = null  // Clear completed intent
    }
  }

  return events
}

// Tier 3: Passive simulation (background)
simulatePassiveTier(characters: Entity[], timestamp: number) {
  const updates = []

  for (const char of characters) {
    // Minimal automatic changes
    const drift = simulatePassiveDrift(char, timestamp)

    // Only create Event if something significant
    if (drift.significant) {
      updates.push({
        timestamp: timestamp,
        participants: [char.id],
        prose: null,  // NO PROSE (just state change)
        outcomes: drift.stateChanges,
        type: "passive"
      })
    }
  }

  return updates
}

// Tier 4: System simulation (economies, weather, etc.)
simulateSystemTier(systems: Entity[], timestamp: number) {
  const updates = []

  for (const system of systems) {
    // Rule-based updates
    const changes = simulateSystemRules(system, timestamp)

    // Direct fact updates (no Event needed)
    updates.push({
      factUpdates: changes,
      type: "system"
    })
  }

  return updates
}
```

---

**3. Intent Management**

**Declaring Intents (when character goes off-screen):**

```typescript
declareIntent({
  character: "aradia",
  goal: "defeat-necromancer-lord",
  estimatedDuration: 15,  // timestamps
  difficulty: 8.0,
  consequenceScope: ["northern-provinces", "undead-activity"]
})

// Character moves to Tier 2 (intentional simulation)
setEntityTier("aradia", "intentional")
```

**Intent Resolution (LLM-generated branches):**

```typescript
resolveIntent(intent: Intent, timestamp: number) {

  // LLM generates outcome branches
  const branches = generateOutcomeBranches({
    character: intent.character,
    goal: intent.goal,
    difficulty: intent.difficulty,
    characterStats: getFacts(intent.character, timestamp)
  })

  // Example branches:
  // [60%] Complete Success - Necromancer defeated
  // [30%] Partial Success - Necromancer wounded
  // [10%] Failure - Aradia captured

  // User selects or dice roll
  const selected = selectBranch(branches)

  // Create resolution Event
  return {
    event: {
      timestamp: timestamp,
      title: `${intent.goal} - ${selected.outcome}`,
      participants: [intent.character],
      prose: selected.summary,
      outcomes: selected.effects,
      type: "intent-resolution"
    }
  }
}
```

---

**4. Relevance-Based Optimization**

Don't simulate ALL 10,000 NPCs every tick:

```typescript
// Only simulate entities relevant to current focus
getRelevantEntities(focusCharacters: string[], radius: number) {

  const relevant = new Set(focusCharacters)

  // Expand by graph distance
  for (let i = 0; i < radius; i++) {
    for (const entity of relevant) {
      const neighbors = getGraphNeighbors(entity)
      neighbors.forEach(n => relevant.add(n))
    }
  }

  return Array.from(relevant)
}

worldTick(timestamp: number) {
  const focusChars = getFocusCharacters()
  const relevantEntities = getRelevantEntities(focusChars, radius: 3)

  // Only simulate relevant subset
  simulateEntities(relevantEntities, timestamp)

  // Systems always simulate (cheap)
  simulateAllSystems(timestamp)
}
```

**Relevance radius:**
- Radius 0: Just focus characters
- Radius 1: Same location, direct relationships
- Radius 2: 1-hop connections
- Radius 3: Broader context
- Beyond radius: Frozen until relevant

---

**5. Dynamic Tier Changes**

Characters move between tiers as focus shifts:

```typescript
// Aradia goes off-screen with intent
setEntityTier("aradia", "intentional")
declareIntent({character: "aradia", goal: "defeat-necromancer", ...})

// Later: Aradia returns to scene
setEntityTier("aradia", "focus")
// Now generates full prose again

// Character becomes inactive
setEntityTier("background-npc-7", "passive")
// Minimal simulation

// Character becomes relevant again
setEntityTier("background-npc-7", "intentional")
// Resume active simulation
```

---

**Deliverables:**

- Unified tick orchestrator
- Tier-specific simulators
- Intent declaration/management system
- Intent resolution with LLM branches
- Relevance filtering
- Dynamic tier assignment
- Tests for all tiers

---

**Test Cases:**

**Unified Tick:**
- T48: Reacher (focus) + Aradia (intentional) + NPCs (passive) + Economy (system) all update
- All entities have state at T49 (no frozen entities)

**Off-Screen Progression:**
- T30: Aradia declares necromancer intent (15 timestamps)
- T31-44: Reacher scenes (Aradia simulating off-screen)
- T45: Aradia's intent resolves (LLM branches, user selects)
- T48: Reacher asks about north → gets updated facts (necromancer defeated)

**Tier Transitions:**
- Aradia: focus → intentional → focus (smooth state continuity)
- NPC: passive → intentional (becomes relevant) → passive (returns to background)

**Relevance Filtering:**
- 10,000 entities in world
- Only ~100 simulated per tick (radius 3 from focus)
- Performance acceptable (<500ms per tick)

---

**Success Criteria:**

1. **Off-Screen Continuity Works:**
   - Aradia defeats necromancer off-screen (T31-45)
   - Reacher at T48 sees effects (northern provinces safe)
   - Timeline consistent

2. **World Feels Alive:**
   - Economies drift
   - Weather changes seasonally
   - Background characters age, move locations
   - All automatic, no manual updates

3. **Focus Changes Smoothly:**
   - Switch focus from Reacher → Aradia mid-story
   - Both characters have continuous state
   - No jarring gaps or inconsistencies

4. **Performance Acceptable:**
   - 10,000 entities in world
   - Tick completes in <500ms
   - Relevance filtering works

5. **Intent System Works:**
   - Declare intent → simulate progress → resolve with branches
   - User/dice selects outcome
   - Effects propagate to world state

**Enables:** True living world simulation, seamless focus shifts, emergent world events

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

## Active Track: Extension Architecture Implementation

**Date Started:** 2026-01-01
**Status:** Phases 1, 2, & 3 Complete ✅ | Phase 4 Next 🎯
**Progress:** 3 of 5 phases complete | 251 tests passing

---

### ✅ Completed Phases

#### **Phase 1: Extension System Core** (Complete)
- ✅ Created `src/core-types/` with fundamental types
- ✅ Created `src/extension-system/interfaces/` (all using `unknown` for type safety)
- ✅ Implemented `defineExtension()` helper with full type inference
- ✅ Implemented extension registry with dependency validation
- ✅ Implemented extension loader with **TS + JSON hybrid support**
- ✅ Implemented lifecycle hook system with execution control
- ✅ Added 33 comprehensive tests for extension system
- ✅ All 230 tests passing

#### **Phase 2: Migrate to Extensions** (Complete)
- ✅ Created `extensions/core/extension.config.ts`
- ✅ Migrated all code to `extensions/core/`:
  - `src/world-state/` → `extensions/core/store-timeline/`
  - `src/import/` → `extensions/core/load-world-data/`
  - `src/validation/` → `extensions/core/validate-consistency/`
  - `src/retrieval/` + `src/analysis/` → `extensions/core/build-scene-context/`
  - `src/llm/` → `extensions/core/send-scene-context/`
  - `src/ui/` → `extensions/core/provide-ui/`
- ✅ Updated all imports with **path aliases** (`@core/*`, `@ext/*`)
- ✅ All 230 tests passing

#### **Phase 3: Runtime & Activation** ✅ Complete

1. ✅ **Activation System**:
   - Implemented `activate(context)` pattern with ExtensionContext
   - Created typed context with generic StoreTypeMap
   - Extensions register services dynamically via context
   - 12 new tests for activation pattern

2. ✅ **Runtime System**:
   - Renamed `boot.ts` → `createRuntime.ts` (better semantics)
   - Integrated activate calls into loader (dependency order)
   - All 251 tests passing

3. ✅ **Architecture Decisions**:
   - Added SOLID + Simple Design as Hard Rule #8
   - Core extension directories numbered 1-6 for clarity
   - Clean separation: createRuntime (system init) vs loadExtensions (extension management)

#### **Next: Phase 4 - Example Extensions** 🎯
Create example extensions to prove the architecture!

---

### What We Decided

#### **Complete Architectural Pivot to Extension System**

We're moving from a traditional monolithic structure to a **plugin-first architecture** where:
- ✅ **Everything is an extension** (including core functionality)
- ✅ **Zero codebase changes needed** to add features
- ✅ **Extensions can hook into lifecycle** (before/after any operation)
- ✅ **Extensions can replace core behavior** (with validation)
- ✅ **Auto-discovery** (drop folder, restart, it works)

---

### Final Architecture

#### **Directory Structure**

```
src/
├── core-types/                       # Fundamental contracts (unchangeable)
│   ├── event.ts                      # Event type definition
│   ├── fact.ts                       # Fact type definition
│   ├── entity.ts                     # Entity type definition
│   └── relationship.ts               # Relationship type definition
│
├── extension-system/                 # Plugin infrastructure
│   ├── registry.ts                   # Manages loaded extensions
│   ├── loader.ts                     # Scans, loads, validates extensions
│   ├── hooks.ts                      # Lifecycle hook system
│   └── interfaces/                   # Contracts for extensions
│       ├── extension.ts              # Extension manifest interface
│       ├── store.ts                  # FactStore, EventStore interfaces
│       ├── loader.ts                 # WorldDataLoader interface
│       ├── validator.ts              # Validator interface
│       ├── context-builder.ts        # ContextBuilder interface
│       ├── sender.ts                 # Sender interface
│       └── ui.ts                     # UIComponent interface
│
└── runtime/                          # Runtime system
    ├── createRuntime.ts              # Load extensions, wire hooks
    └── orchestrate.ts                # Execute system with extensions

extensions/
├── core/                             # ALL CURRENT FUNCTIONALITY
│   ├── 1-load-world-data/
│   │   └── from-sillytavern/
│   │       ├── parse-lorebook-json.ts
│   │       ├── extract-entities.ts
│   │       └── sillytavern-loader.ts
│   │
│   ├── 2-store-timeline/
│   │   ├── memory-fact-store/
│   │   │   ├── fact-store.ts
│   │   │   └── fact-store.test.ts
│   │   ├── memory-event-store/
│   │   │   ├── event-store.ts
│   │   │   └── event-store.test.ts
│   │   └── memory-entity-store/
│   │       ├── entity-store.ts
│   │       └── entity-store.test.ts
│   │
│   ├── 3-validate-consistency/
│   │   ├── check-entity-exists/
│   │   │   ├── check-entity-exists.ts
│   │   │   └── entity-exists-rule.test.ts
│   │   ├── check-world-boundary/
│   │   │   ├── check-world-boundary.ts
│   │   │   └── world-boundary-rule.test.ts
│   │   └── validation-framework/
│   │       ├── validator.ts
│   │       └── validator.test.ts
│   │
│   ├── 4-build-scene-context/
│   │   ├── match-keywords/
│   │   │   ├── keyword-matcher.ts
│   │   │   └── keyword-matcher.test.ts
│   │   ├── match-entities/
│   │   │   ├── entity-matcher.ts
│   │   │   └── entity-matcher.test.ts
│   │   ├── expand-relationships/
│   │   │   ├── relationship-retrieval.ts
│   │   │   └── relationship-retrieval.test.ts
│   │   └── analyze-prompt/
│   │       ├── prompt-analyzer.ts
│   │       └── prompt-analyzer.test.ts
│   │
│   ├── 5-send-scene-context/
│   │   └── to-llm/
│   │       ├── openrouter-client.ts
│   │       └── openrouter-client.test.ts
│   │
│   ├── 6-provide-ui/
│   │   └── dev-chat/
│   │       ├── server/
│   │       ├── routes/
│   │       └── public/
│   │
│   └── extension.config.ts           # TypeScript config (not JSON!)
│
├── worldanvil-importer/              # Example user extension
│   ├── load-world-data/
│   │   └── from-worldanvil/
│   └── extension.config.ts
│
├── postgres-timeline/                # Example: Replace storage
│   ├── store-timeline/
│   │   ├── postgres-fact-store/
│   │   └── postgres-event-store/
│   └── extension.config.ts
│
└── advanced-validators/              # Example: Add validators
    ├── validate-consistency/
    │   ├── check-temporal-consistency/
    │   └── check-spatial-validity/
    └── extension.config.ts

extensions.config.json                # Optional config
lorebooks/
└── excelsia/
    ├── characters.json
    ├── kingdoms.json
    └── README.md
```

---

### Extension Configuration (TypeScript!)

#### **Why TypeScript instead of JSON?**

✅ **Full type inference** - VS Code autocomplete for all fields
✅ **Type checking** - Catch errors at development time
✅ **Import types** - Can import interfaces from extension-system
✅ **No build step** - Bun imports `.ts` files directly
✅ **Better DX** - Validation, refactoring, inline docs

#### **Minimal Extension**

```typescript
// extensions/worldanvil-importer/extension.config.ts
import { defineExtension } from '../../src/extension-system'

export default defineExtension({
  name: 'worldanvil-importer',
  version: '1.0.0',
  description: 'Import from World Anvil',
  author: 'Your Name'
  // ↑ VS Code provides autocomplete!
})
```

**Notes:**
- `id` is **auto-generated** on first load (UUID)
- `defineExtension()` provides full type inference
- All fields validated at development time

#### **Full Extension with All Features**

```typescript
// extensions/advanced-validators/extension.config.ts
import { defineExtension } from '../../src/extension-system'

export default defineExtension({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'advanced-validators',
  version: '2.1.0',
  description: 'Advanced temporal and spatial validators',
  author: 'Community',

  dependencies: ['core'],  // ← Autocomplete shows available extensions

  provides: {
    validators: ['temporal-consistency', 'spatial-validity']
  },

  replaces: {
    'core/stores/fact-store': {
      reason: 'PostgreSQL backend for scalability',
      interface: 'FactStore',    // ← Type-checked against interfaces
      compatible: true
    }
  },

  hooks: {
    'before-validation': ['pre-check-optimization'],
    'after-validation': ['detailed-error-reporting'],
    'on-fact-extracted': ['augment-metadata']
    // ↑ Autocomplete shows all available hooks
  },

  config: {
    postgresUrl: 'postgresql://localhost:5432/timeline'
  }
})
```

---

### Extension Capabilities

Each extension can provide capabilities in these directories:

| Directory | Purpose | Example |
|-----------|---------|---------|
| `load-world-data/` | Import/create data | SillyTavern, World Anvil, CSV |
| `store-timeline/` | Storage backends | Memory, SQLite, PostgreSQL |
| `validate-consistency/` | Validation rules | Entity exists, temporal consistency |
| `build-scene-context/` | Context retrieval | Keyword matching, graph expansion |
| `send-scene-context/` | Output targets | LLM, inspector, file export |
| `provide-ui/` | UI components | Chat interface, graph visualizer |
| `hooks/` | Lifecycle hooks | Before/after any operation |

**Extensions only include what they provide!**

---

### Lifecycle Hooks

Extensions can hook into these lifecycle events:

```typescript
type Hook =
  // Data loading
  | 'before-load-data'
  | 'after-load-data'

  // Validation
  | 'before-validation'
  | 'after-validation'

  // Context building
  | 'before-build-context'
  | 'after-build-context'

  // Sending
  | 'before-send-context'
  | 'after-send-context'

  // Timeline events
  | 'on-timeline-update'
  | 'on-entity-created'
  | 'on-fact-extracted'
  | 'on-event-created'
  | 'on-relationship-added'

interface HookContext {
  data: unknown                      // Current data (use `unknown`, not `any`!)
  metadata: Record<string, unknown>  // Metadata
  skip?: boolean                     // Skip default behavior
  augment?: unknown                  // Add to result
}
```

**Hook Execution:**
- `before-*`: Can skip/modify input
- `after-*`: Can augment/modify output
- `on-*`: React to events

**Type Safety:**
Extensions must narrow `unknown` types before use:
```typescript
hooks: {
  'on-fact-extracted': async (ctx: HookContext) => {
    // Must validate type before use
    if (isFact(ctx.data)) {
      const fact = ctx.data as Fact
      // Now type-safe!
    }
  }
}
```

---

### Extension Activation (New Pattern)

Extensions use an `activate(context)` entry point to register dynamic services with dependencies.

```typescript
// extensions/my-ext/index.ts
import type { ExtensionContext } from "../../src/runtime";

export async function activate(context: ExtensionContext) {
  // 1. Create dependencies
  const store = createMyStore();

  // 2. Register services with dependencies injected
  context.registerValidator({
    name: "my-validator",
    check: createValidator(store).check 
  });
}
```

This solves the dependency injection problem that static JSON config cannot handle.

System scans `extensions/` directory on boot:

```typescript
// Automatically loads:
extensions/
  ├── core/
  ├── worldanvil-importer/
  └── advanced-validators/
```

#### **Optional Configuration**

```json
// extensions.config.json
{
  "order": ["core", "advanced-validators", "worldanvil-importer"],
  "disabled": ["worldanvil-importer"],
  "devMode": true
}
```

**Features:**
- `order`: Explicit load order (matters for hooks)
- `disabled`: Temporarily disable without deleting
- `devMode`: Enable hot reload

#### **Extension Resolution**

1. Scan `extensions/` directory
2. Load `extension.json` from each folder
3. Auto-generate `id` if missing (save back to manifest)
4. Validate dependencies
5. Check for conflicts (name collisions, replacements)
6. Load in order (config or alphabetical)
7. Wire hooks
8. Boot system

---

### Core Types (Fundamental)

These types are **fundamental** and cannot be replaced:

```typescript
// src/core-types/event.ts
export type Event = {
  id: string
  worldId: string
  timestamp: number
  title: string
  location?: string
  participants: string[]
  visibility: 'private' | 'restricted' | 'public'
  outcomes?: Fact[]
  prose?: string
}

// src/core-types/fact.ts
export type Fact = {
  worldId: string
  subject: string
  property: string
  value: string | number | boolean
  validFrom?: number
  validTo?: number
  causedBy?: string
}

// src/core-types/entity.ts
export type Entity = {
  id: string
  worldId: string
  name: string
  aliases: string[]
  group?: string
}

// src/core-types/relationship.ts
export type Relationship = {
  worldId: string
  from: string
  type: string
  to: string
  validFrom?: number
  validTo?: number
}
```

---

### Extension Interfaces

**Important:** All interfaces use `unknown` instead of `any` for type safety. Extensions must narrow types before use.

#### **Store Interface**

```typescript
// src/extension-system/interfaces/store.ts
export interface FactStore {
  add(fact: Fact): void
  getAll(): Fact[]
  getBySubject(subject: string, worldId: string): Fact[]
  getAt(subject: string, timestamp: number, worldId: string): Fact[]
}

export interface EventStore {
  add(event: Event): void
  getAll(): Event[]
  getByParticipant(entityId: string, worldId: string): Event[]
  getByTimestamp(timestamp: number, worldId: string): Event[]
  getByLocation(locationId: string, worldId: string): Event[]
  getByVisibility(visibility: Visibility, worldId: string): Event[]
}
```

#### **Loader Interface**

```typescript
// src/extension-system/interfaces/loader.ts
export interface WorldDataLoader {
  name: string
  canHandle(filePath: string): boolean
  load(filePath: string, worldId: string): Promise<LoadResult>
}

export interface LoadResult {
  entities: Entity[]
  events?: Event[]
  facts?: Fact[]
  relationships?: Relationship[]
  skipped?: SkippedEntry[]
}
```

#### **Validator Interface**

```typescript
// src/extension-system/interfaces/validator.ts
export interface Validator {
  name: string
  check(prompt: string, context: ValidationContext): Promise<Violation[]>
}

export interface Violation {
  type: string
  term: string
  message: string
  suggestion?: string
}
```

#### **Context Builder Interface**

```typescript
// src/extension-system/interfaces/context-builder.ts
export interface ContextBuilder {
  name: string
  build(prompt: string, worldId: string): Promise<ContextPiece[]>
}

export interface ContextPiece {
  id: string
  content: string
  relevance: number
  reason: string
}
```

#### **Sender Interface**

```typescript
// src/extension-system/interfaces/sender.ts
export interface Sender {
  name: string
  send(context: SceneContext, prompt: string): Promise<SendResult>
}

export interface SceneContext {
  worldId: string
  timestamp: number
  entities: string[]
  facts: Fact[]
  events: Event[]
}

export interface SendResult {
  response: string
  metadata?: Record<string, unknown>  // Use `unknown`, not `any`
}
```

---

### Implementation Plan

#### **Phase 1: Extension System Core (Week 1)**

1. Create `src/core-types/` with fundamental types (Event, Fact, Entity, Relationship)
2. Create `src/extension-system/interfaces/` with all interfaces (all use `unknown`, not `any`)
3. Create `src/extension-system/define-extension.ts` (Extension type + defineExtension helper)
4. Create `src/extension-system/registry.ts` (extension registry)
5. Create `src/extension-system/loader.ts` (auto-discovery, loads .ts configs)
6. Create `src/extension-system/hooks.ts` (lifecycle hook system)
7. Tests for extension loading and validation

**Key files:**
```typescript
// src/extension-system/define-extension.ts
export type Extension = {
  id?: string
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: string[]
  provides?: { /* ... */ }
  replaces?: Record<string, { /* ... */ }>
  hooks?: Partial<Record<Hook, string[]>>
  config?: Record<string, unknown>  // ← `unknown`, not `any`!
}

export const defineExtension = (ext: Extension): Extension => ext
```

#### **Phase 2: Migrate to Extensions (Week 2)**

1. Create `extensions/core/extension.config.ts` (TypeScript, not JSON!)
2. Move all current code to `extensions/core/`
   - `src/world-state/` → `extensions/core/store-timeline/`
   - `src/import/` → `extensions/core/load-world-data/`
   - `src/validation/` → `extensions/core/validate-consistency/`
   - `src/retrieval/` + `src/analysis/` → `extensions/core/build-scene-context/`
   - `src/llm/` → `extensions/core/send-scene-context/`
   - `src/ui/` → `extensions/core/provide-ui/`
3. Update all imports
4. Ensure tests pass

#### **Phase 3: Runtime (Week 2)** ✅ Complete

1. ✅ Created `src/runtime/createRuntime.ts` (load extensions, wire system)
2. ✅ Created `src/runtime/orchestrate.ts` (execute with hooks)
3. ✅ Implemented activate pattern with ExtensionContext
4. ✅ Full boot sequence tested (251 tests passing)

#### **Phase 4: Example Extensions (Week 3)**

1. Create example extension templates
2. Document extension creation process
3. Test hot reload (dev mode)
4. Test extension replacement (postgres-timeline example)

#### **Phase 5: Documentation & Cleanup**

1. Update all docs to reflect new structure
2. Create extension authoring guide
3. Remove unused dependencies (vis-data, vis-network)
4. Move `src/example/Excelsia/` to `lorebooks/excelsia/`
5. Add README files throughout

---

### Migration Strategy

#### **Why Not Gradual?**

We considered gradual migration but decided against it because:
- Extension system is foundational (affects everything)
- Half-migrated state would be confusing
- Better to do it all at once, test thoroughly

#### **Safety Measures**

1. ✅ All changes on feature branch
2. ✅ Tests must pass at each phase
3. ✅ Commit after each phase completes
4. ✅ Keep old structure in git history (can revert)

---

### Testing Strategy

#### **Extension System Tests**

```typescript
// Test extension loading
test('auto-discovers extensions in directory')
test('generates UUID for new extensions')
test('validates extension manifests')
test('detects dependency conflicts')
test('loads extensions in correct order')
test('handles circular dependencies')

// Test hook system
test('executes before hooks')
test('executes after hooks')
test('allows skipping default behavior')
test('allows augmenting results')

// Test replacement
test('validates interface compatibility')
test('warns on core replacement')
test('falls back to core on error')
```

#### **Integration Tests**

```typescript
// Test full pipeline with extensions
test('load data → validate → build context → send')
test('multiple validators augment violations')
test('context builders compose results')
test('hooks intercept at correct points')
```

---

### Open Questions

#### **Resolved:**
- ✅ Timeline extensibility: Yes (stores are pluggable)
- ✅ Extension IDs: Auto-generate UUIDs on first load
- ✅ Extension loading: Auto-scan + optional config
- ✅ Replacement: Allowed with validation
- ✅ Directory naming: Verbose, readable names

#### **Still to Decide:**
- ⚠️ Hot reload implementation details
- ⚠️ Extension marketplace/registry (future)
- ⚠️ Extension versioning/updates
- ⚠️ Extension sandboxing/security

---

### Benefits of This Architecture

1. ✅ **Zero-touch extensibility**: Drop folder, restart, done
2. ✅ **Core as extension**: We maintain it like any other extension
3. ✅ **Clear contracts**: Interfaces define what extensions can do
4. ✅ **Composable**: Multiple extensions enhance same functionality
5. ✅ **Future-proof**: New extension types easy to add
6. ✅ **Testable**: Extensions isolated, easy to test
7. ✅ **Debuggable**: Know exactly which extension did what

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
- `decisions.md` - Why we made key design choices
