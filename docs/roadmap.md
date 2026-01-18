---
title: "Roadmap: From Current to Vision"
status: "current"
keywords:
  - "project roadmap"
  - "milestones M1-M11"
  - "epistemic state M5"
  - "multi-agent orchestration M6"
  - "extension system redesign"
  - "proof of concept"
  - "implementation plan"
related:
  - "./current.md"
  - "./vision.md"
  - "./decisions.md"
  - "./architecture/core/08-epistemic-state.md"
  - "./architecture/future/16-map-spatial-system.md"
---
# Roadmap: From Current to Vision

**Current position:** M4 complete, ready for M5
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

| # | Milestone | Focus | Status |
|---|-----------|-------|--------|
| 1 | Basic Validation | Entity checking, world boundary | ✅ DONE |
| 2 | Relationship Graph | Entity relationships, graph traversal | ✅ DONE |
| 3 | Timeline Foundation | Chapter-based chronology | ✅ DONE |
| 4 | Events | Source of truth, participation tracking | ✅ DONE |
| 5 | Epistemic State | POV-filtered knowledge | 🎯 NEXT ⭐ |
| 6 | Multi-Agent Orchestration | Separate contexts, secrets | 🔜 ⭐ |
| 7 | Basic Geography | Containment, proximity | 🔜 |
| 8 | Travel Validation | Routes, travel time | 🔜 |
| 9 | Full Map System | 2D coordinates, terrain, weather | 🔜 |
| 10 | Calendar System | Full temporal granularity | 🔜 |
| 11 | Effect Propagation | Cascading effects, ambient | 🔜 |

---

## Phase 1: Character Knowledge (M2-M6)

**Goal:** Enable realistic character knowledge boundaries in roleplay scenarios.

### M2: Relationship Graph ✅ DONE

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

**Goal:** Track events that generate facts, record participation, preserve original prose.

**What was built:**
- `Event` type: id, worldId, timestamp, title, location, participants, visibility, outcomes, prose
- `EventStore` with queries by participant, timestamp, location, visibility
- Fact generation from events (`getFactsFromEvent`)
- Visibility levels: private, restricted, public

**Deliverables:**
- `src/world-state/event/event.ts` - Event type
- `src/world-state/event/event-store.ts` - Store, query, and fact generation
- `src/world-state/event/event-store.test.ts` - Tests
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

**Character-Specific Extraction (Complete Person Model):**

**Core principle:** Characters are not stat blocks. They are people with desires, fears, and motivations. Without these, they're just caricatures bound to their roles.

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

**5. Goals & Desires (WHO they are):**
```typescript
// Primary goals - what they want
{subject: "aradia", property: "primary-goal", value: "achieve-peace-with-lunaria"}
{subject: "aradia", property: "secondary-goal", value: "prove-worth-to-father"}

// Motivations - why they want it
{subject: "aradia", property: "motivation.peace", value: "haunted-by-war-casualties"}
{subject: "aradia", property: "motivation.prove-worth", value: "dismissed-as-naive-idealist"}

// What drives their decisions
{subject: "alaric", property: "primary-goal", value: "protect-sunnaria"}
{subject: "alaric", property: "motivation", value: "honor-ancestors-legacy"}
```

**6. Fears & Internal Conflicts:**
```typescript
// What they fear
{subject: "aradia", property: "fears", value: "failing-her-people"}
{subject: "aradia", property: "fears.secondary", value: "fathers-disappointment"}

// Internal conflicts that create tension
{subject: "aradia", property: "internal-conflict", value: "duty-to-father-vs-moral-conviction"}
{subject: "alaric", property: "internal-conflict", value: "peace-vs-strength-dilemma"}
```

**7. Values & Beliefs:**
```typescript
// Core values that guide behavior
{subject: "aradia", property: "values.primary", value: "compassion-over-conquest"}
{subject: "aradia", property: "values.secondary", value: "dialogue-before-force"}

// Beliefs about the world
{subject: "alaric", property: "belief.leadership", value: "strength-earns-respect"}
{subject: "alaric", property: "belief.peace", value: "won-through-power-not-words"}
```

**8. Attitudes & Social Bonds (context-specific):**
```typescript
// How they feel about specific entities/situations
{subject: "reacher", property: "attitude-toward.academy", value: 7.0}  // 0-10 scale
{subject: "reacher", property: "trust-level.council", value: 3.5}
{subject: "aradia", property: "attitude-toward.war", value: "deeply-opposed"}
```

**LLM Requirements:**
- High-quality model for comprehensive extraction (Opus-tier recommended)
- Must infer missing numeric values from context
- Must maintain consistency across similar entities
- Must extract ALL character attributes (treat characters as complete people, not stat blocks)
- Must extract psychological depth: goals, motivations, fears, values, conflicts

**Critical distinction - M5 vs M11:**

**M5 extracts character ATTRIBUTES (WHO they are):**
- These are static or slow-changing facts about the character
- Goals, motivations, fears define their personality
- Example: `{subject: "aradia", property: "primary-goal", value: "achieve-peace"}`
- This is extracted from lorebook during ETL

**M11 Intent System tracks PURSUIT (HOW they act on goals):**
- Active, off-screen progression toward goals
- References M5 goal facts
- Example: `{characterId: "aradia", activeIntent: "negotiate-treaty", goal: "achieve-peace", progress: 0.6}`
- This is dynamic simulation, not character definition

**Without M5 goals/motivations, characters are just NPCs with no agency or depth.**

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

**Intent references character goals (M5 facts):**

M11 Intent system builds on M5 character goals. Characters pursue their goals off-screen.

**Declaring Intents (when character goes off-screen):**

```typescript
// First, retrieve character's goals from M5 facts
const characterGoals = getFacts("aradia", timestamp)
  .filter(f => f.property.startsWith("goal") || f.property.startsWith("motivation"))

// Example M5 facts:
// {subject: "aradia", property: "primary-goal", value: "achieve-peace"}
// {subject: "aradia", property: "motivation.peace", value: "haunted-by-war-casualties"}

// Declare intent based on character goals
declareIntent({
  character: "aradia",
  goal: "negotiate-peace-treaty",           // Active pursuit of M5 goal
  basedOnGoal: "achieve-peace",             // References M5 primary-goal
  motivation: "haunted-by-war-casualties",  // References M5 motivation
  estimatedDuration: 15,  // timestamps
  difficulty: 7.0,
  stakes: "war-continues-if-fails",         // What happens if intent fails
  consequenceScope: ["sunnaria", "lunaria", "diplomatic-relations"]
})

// Character moves to Tier 2 (intentional simulation)
setEntityTier("aradia", "intentional")
```

**Why goals matter for Intent:**
- Character goals (M5) define WHO they are
- Intents (M11) show HOW they pursue those goals
- Without M5 goals, we don't know what characters want or why they act

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

## Active Track: Extension System Redesign

**Date Started:** 2026-01-10
**Status:** Config Schema Finalized ✅ | Config Loader Implemented ✅ | Runtime Next 🎯

---

### Design Decision (2026-01-10)

We redesigned the extension system to be simpler and more explicit. Key changes:

1. **Config-driven loading** instead of auto-discovery
2. **Six-stage pipeline** instead of complex dependency graphs
3. **Simple ExtensionContext** as plain object instead of registry abstraction
4. **Required slots validation** instead of built-in defaults
5. **System-managed config** with automatic dependency tracking
6. **Parallel loading** via dependency DAG

**Config presence:**
- Default `extensions.json` is checked into the repo
- No auto-discovery or init command when config is missing
- Missing config fails fast with: `Config missing: extensions.json. Restore the default file.`

See [decisions.md](decisions.md) for full rationale.

---

### Config Schema

```typescript
type Status = "on" | "off" | `needs:${string}`

type ExtensionEntry = {
  name: string
  path: string
  status: Status
  options?: unknown
}

type LorebookConfig = {
  stores: ExtensionEntry[]
  loaders: ExtensionEntry[]
  validators: ExtensionEntry[]
  contextBuilders: ExtensionEntry[]
  senders: ExtensionEntry[]
  ui: ExtensionEntry[]
}
```

#### Example Config (`extensions.json`)

```json
{
  "stores": [
    { "name": "@core/memory-store", "path": "extensions/core/2-store-timeline/memory-store", "status": "on" }
  ],
  "loaders": [
    { "name": "@core/sillytavern-loader", "path": "extensions/core/1-load-world-data/from-sillytavern", "status": "on" }
  ],
  "validators": [
    { "name": "@core/entity-exists", "path": "extensions/core/3-validate-consistency/entity-exists", "status": "on" }
  ],
  "contextBuilders": [
    { "name": "@core/keyword-matcher", "path": "extensions/core/4-build-scene-context/keyword-matcher", "status": "off" },
    { "name": "@core/relationship-expander", "path": "extensions/core/4-build-scene-context/relationship-expander", "status": "needs:@core/keyword-matcher" }
  ],
  "senders": [
    { "name": "@core/openrouter", "path": "extensions/core/5-send-scene-context/openrouter", "status": "on" }
  ],
  "ui": [
    { "name": "@core/dev-chat", "path": "extensions/core/6-provide-ui/dev-chat", "status": "on" }
  ]
}
```

#### Extension Definition

```typescript
export default defineExtension({
  name: '@core/memory-store',
  version: '1.0.0',
  kind: 'store',
  after: [],  // within-stage dependencies (by name)

  activate: (context, options) => {
    context.factStore = createMemoryFactStore()
    context.eventStore = createMemoryEventStore()
    context.entityStore = createMemoryEntityStore()
  }
})
```

#### ExtensionContext (Simple Object)

```typescript
type ExtensionContext = {
  factStore?: FactStore
  eventStore?: EventStore
  entityStore?: EntityStore
  relationshipStore?: RelationshipStore

  loaders: WorldDataLoader[]
  validators: Validator[]
  contextBuilders: ContextBuilder[]
  senders: Sender[]
  uiComponents: UIComponent[]
}
```

---

### Implementation Plan

#### Phase 1: Core Types and Runtime
- ✅ Create `src/extension-system/types.ts` (config types)
- ✅ Create `src/extension-system/config-loader.ts` (load config, validate schema)
- 🎯 Create `src/extension-system/bootstrap.ts` (build DAG, parallel activation, validate required slots)
- 🎯 Create `src/extension-system/config-writer.ts` (write back normalizations, dependency status)
- 🎯 Tests for DAG building, parallel activation, config write-back

#### Phase 2: Migrate Extensions
- Update existing extensions to new format
- Create `extensions.json`
- Ensure all tests pass

#### Phase 3: Documentation
- Update extension authoring guide
- Add example extensions

### Previous Implementation (Superseded)

The extension system was previously designed with auto-discovery and complex dependency graphs. This has been superseded by the simpler config-driven approach above. See git history for details of the old implementation.

---

### Benefits of New Architecture

1. ✅ **Explicit config**: See exactly what's loaded and in what order
2. ✅ **Simple pipeline**: 6 stages, no complex dependency graphs
3. ✅ **GUI-friendly**: Config file easy to read/write programmatically
4. ✅ **Clear contracts**: Interfaces define what extensions can do
5. ✅ **Composable**: Multiple extensions enhance same functionality
6. ✅ **Testable**: Extensions isolated, easy to test
7. ✅ **Debuggable**: Know exactly which extension did what

---

## Next Steps

**Immediate:** Implement new extension system, then M5 (Epistemic State)

1. Design `getKnowledge(characterId, timestamp)` query interface
2. Implement participation-based knowledge (if you were there, you know)
3. Implement visibility-based knowledge (public vs private events)
4. Apply ZOMBIES, write `test.todo()` cases
5. Create POV-filtered context retrieval

**See also:**
- `vision.md` - What we're building toward
- `current.md` - Where we are now
- `decisions.md` - Why we made key design choices

## See also
- [current.md](./current.md)
- [vision.md](./vision.md)
- [decisions.md](./decisions.md)
- [08-epistemic-state.md](./architecture/core/08-epistemic-state.md)
- [16-map-spatial-system.md](./architecture/future/16-map-spatial-system.md)
