# Design Decisions

This document captures the "why" behind key architectural decisions.

---

## Core Philosophy

### TypeScript-Only Extensions (2026-01-05)

**Decision:** Extensions are TypeScript-only. No JSON config support.

**Why:**
- **YAGNI:** JSON configs can't define `activate()` functions, so you'd need a separate TS file anyway
- **Simpler:** One file does everything (metadata + activation logic)
- **Type safety:** Full TypeScript inference and validation
- **Future-proof:** If we want multi-language extensions later (Rust, Go via WASM/IPC), that's a separate concern from config format

**Design:**
- Extensions have `extension.config.ts` that exports metadata and `activate()` function
- No `extension.config.json` support
- Discovery looks only for `.ts` configs

**Alternative considered:** Support both TS and JSON
- Rejected: JSON can't handle `activate()`, adds complexity for no benefit

**Source:** Discussion on 2026-01-05 about extension config formats

---

### Three-Stage Extension Pipeline (2026-01-05)

**Decision:** Extension system has 3 stages: discover, load, activate. Not 6 separate stages.

**Why (through SOLID + Simple Design lens):**
- **Single Responsibility:** Group by "reason to change"
  - `1-discover` changes if filesystem structure changes
  - `2-load` changes if config structure changes (validate, sort, register all coupled to Extension type)
  - `3-activate` changes if runtime behavior changes (activate + hooks both about "starting")
- **Fewest Elements:** 3 < 6. Simpler.
- **Cohesion:** Validation, sorting, and registration are all about "preparing configs" - they belong together

**Design:**
```
src/extension-system/
├── 1-discover/    # Find extension directories
├── 2-load/        # Import, validate, sort, register
├── 3-activate/    # Call activate(), wire hooks
└── index.ts       # Orchestrator
```

**Internal functions within stages are still testable** - they're just not separate pipeline stages.

**Alternative considered:** 6 granular stages (discover, validate, sort, register, activate, wire-hooks)
- Rejected: Over-engineering. Stages that change together should be together.

**Source:** Discussion on 2026-01-05 about extension system architecture

---

### Plugin-First Architecture

**Decision:** Move from a monolithic structure to a plugin-first extension system where everything (including core functionality) is an extension.

**Why:**
- **Zero-touch extensibility:** Users can add features by dropping a folder into `extensions/`, without modifying core code.
- **Isolation:** Features are isolated, making testing and debugging easier.
- **Replaceability:** Users can replace core components (like the storage engine) with custom implementations (e.g., PostgreSQL instead of memory) via configuration.
- **Maintenance:** "Core" is just another extension, enforcing clean interfaces and contracts.

**Design:**
- **`extensions/` directory:** Auto-discovered plugins.
- **`defineExtension()` helper:** TypeScript-based configuration with type inference.
- **Lifecycle Hooks:** Extensions can intercept system events (before/after/on).
- **Core as Extension:** The default system features live in `extensions/core/`.

**Alternative considered:** Monolith with optional plugins
- Rejected: Creates a "second-class citizen" problem for plugins. By making core an extension, the API is proven robust.

**Source:** Extension Architecture design in [roadmap.md](roadmap.md)

---

### Extension Activate Pattern

**Decision:** Extensions use `defineExtension()` helper that returns an object containing both metadata and an `activate(context)` function.

**Why:**
- **Dependency Injection:** Stores and services (like EntityStore) need to be passed to consumers (like Validators). Static configuration can't handle this.
- **Single File:** Everything in one place - metadata and activation logic together.
- **No Circularity:** Metadata is in the object literal (readable without calling activate), while activate is called after dependency resolution.
- **Type Inference:** The `defineExtension()` helper provides full TypeScript type checking and autocomplete.
- **Standardization:** Follows VS Code's activate pattern but adapted to TypeScript's strengths.

**Design:**
```typescript
// extensions/my-ext/index.ts
import { defineExtension } from '@core/extension-system'

export default defineExtension({
  name: 'my-extension',
  version: '1.0.0',
  dependencies: ['core'],

  activate: async (context) => {
    const store = createStore()
    context.registerStore('my-store', store)

    context.registerValidator({
      name: 'my-validator',
      check: createValidator(store).check // Inject dependencies!
    })
  }
})
```

**Loading Flow:**
1. Import default export from extension
2. Read `.name`, `.version`, `.dependencies` from object (no execution)
3. Resolve dependency graph
4. Call `.activate(context)` in dependency order

**Alternative considered:** Separate config file + activate function
- Rejected: Two files when one suffices, and metadata extraction is simple with object literal.

**Alternative considered:** Metadata in activate return value
- Rejected: Creates circular dependency (need metadata to build context, need context to call activate).

**Source:** Discussion on 2026-01-01 about extension architecture and activate patterns.

---

### Lorebook Is Import Format, Not Runtime Model

**Decision:** Lorebook entries are imported and transformed into structured Entities, Facts, and Relationships. Runtime queries use entity IDs, not keyword matching.

**Why:**
- **Name collisions**: Keyword matching "Elara" can't distinguish Queen Elara from a student named Elara
- **No disambiguation**: Prose blobs searched by strings have no identity concept
- **No structure**: Can't query "what title does entity X have?"
- **No temporal awareness**: Lorebook entries are static text

**Design:**
```
LOREBOOK (Import)              →  RUNTIME MODEL
┌─────────────────────────┐       ┌──────────────────────────────────────┐
│ "Queen Elara of         │       │ Entity: elara-sunnaria-queen         │
│  Sunnaria rules         │  ETL  │   displayName: "Elara"               │
│  alongside King Alaric" │  ──►  │   facts:                             │
│                         │       │     - {attr: "title", val: "Queen"}  │
│  keys: ["Elara",        │       │     - {attr: "spouse", val: "alaric"}│
│         "Queen Elara"]  │       │   relationships:                     │
└─────────────────────────┘       │     - {type: "rules", to: "sunnaria"}│
                                  └──────────────────────────────────────┘
```

**Benefits:**
1. **No collisions**: Different entities have different IDs regardless of name
2. **Structured queries**: `getFacts(entityId)` returns structured data
3. **Temporal bounds**: Facts have validFrom/validTo
4. **True epistemic isolation**: Knowledge is per-entity-ID

**Implications:**
- Retrieval works by entity ID, not keyword search
- Scene setup binds names to entity IDs (or creates new entities)
- The LLM/author maintains bindings within a session
- displayName is just an attribute, not the identity

**Alternative considered:** Fix keyword matching (secondary keys, corroborating evidence)
- Rejected: Fundamentally can't disambiguate two entities with same name in same scene

**Source:** Discussion on 2025-12-30 about "Elara problem" - student vs Queen with same name

---

### World State as RPG Stats (Not Prose)

**Decision:** All entities (characters, kingdoms, economies, weather systems) have queryable numeric attributes. Abstract concepts like "Sunnarian Economy" or "Continental Trade" are entities with facts, not just prose.

**Why:**
- **Deterministic state**: Grain tariff is exactly 0.15, not "approximately 15%" that LLM might misremember
- **No hardcoded schemas**: Facts are arbitrary key-value pairs - works for fantasy kingdoms, sci-fi colonies, horror scenarios
- **Trackable change**: Every numeric value is a "knob" that can be turned and tracked over time
- **Outlier detection**: All entities in a category have same attributes, outliers are notable (story beats)

**Design:**
```
Character (concrete entity):
  { subject: "aradia-princess", property: "age", value: 20 }
  { subject: "aradia-princess", property: "height", value: 170 }
  { subject: "aradia-princess", property: "combat.skill", value: 4.5 }  // 0-10 scale

Kingdom (concrete entity):
  { subject: "sunnaria-kingdom", property: "population", value: 7000000 }
  { subject: "sunnaria-kingdom", property: "borders-count", value: 6 }
  { subject: "sunnaria-kingdom", property: "military-strength", value: 6.5 }

Economy (abstract entity):
  { subject: "sunnaria-economy", property: "grain-tariff", value: 0.15 }
  { subject: "sunnaria-economy", property: "trade-volume", value: 8500 }
  { subject: "sunnaria-economy", property: "gold-reserves", value: 45000 }

Weather (environmental entity):
  { subject: "sunnaria-weather", property: "condition", value: "drought" }
  { subject: "sunnaria-weather", property: "severity", value: 7.5 }
```

**Benefits:**
1. **Genre-agnostic**: No hardcoded kingdom schema - facts adapt to any world
2. **Comprehensive extraction**: ETL extracts EVERY measurable attribute, including inferred values
3. **Consistent entities**: All kingdoms have same set of attributes (population, military-strength, etc.)
4. **Story significance**: Outliers are meaningful (Sunnaria has 6 borders vs avg of 3)

**ETL Implications:**
- High-quality LLM required for extraction
- Must infer missing values from qualitative prose ("thriving economy" → trade-volume: 8500)
- Must identify common schema across entity categories (all kingdoms get same attributes)

**Alternative considered:** Keep systems/economies as prose, only extract facts for characters
- Rejected: Can't track economic changes deterministically, LLM will hallucinate tariff rates

**Source:** Discussion on 2025-12-31 about world state management

---

### Tool-Calling Over Context-Stuffing

**Decision:** LLMs query facts via tools rather than receiving massive pre-built context packages.

**Why:**
- **No hallucination**: LLM can't make up grain-tariff value because it must QUERY it
- **Scalable**: Large worlds don't require stuffing 500KB of context into every request
- **On-demand**: Only fetch facts relevant to current scene
- **Deterministic**: Facts are source of truth, not LLM memory

**Design:**
```
OLD APPROACH (Context-Stuffing):
┌─────────────────────────────────────────┐
│ Context (500KB):                        │
│ - All lorebook entries for scene        │
│ - Character descriptions                │
│ - Kingdom details                       │
│ - Economic state                        │
│ - etc.                                  │
└─────────────────────────────────────────┘
         ↓
      LLM generates
         ↓
   (might misremember facts)

NEW APPROACH (Tool-Calling):
┌─────────────────────────────────────────┐
│ Minimal Context (50KB):                 │
│ - Scene setup (who, where, when)       │
│ - Entity ID list (just IDs, not facts) │
│ - World fundamentals                    │
│ - Available tools                       │
└─────────────────────────────────────────┘
         ↓
      LLM thinks: "Need economic context"
         ↓
      LLM calls: getFacts("sunnaria-economy")
         ↓
      Tool returns: {grain-tariff: 0.15, ...} (2KB)
         ↓
      LLM generates using EXACT values
```

**Tools provided:**
```typescript
getFacts(entityId, timestamp?)
  → Returns all facts for entity at given time

getKnowledge(characterId, timestamp)
  → Returns what this character knows (epistemic filtering)

getRelationships(entityId, types?)
  → Returns relationships for entity

searchEntities(query)
  → Discovery tool for finding relevant entities
```

**Enforcement:**
- System prompt: "MUST call tools before generating numeric values"
- Structured output / function calling to force tool usage
- Validation rejects outputs that don't use tools

**Benefits:**
1. **Deterministic facts**: LLM queries exact values, can't hallucinate
2. **Smaller context**: ~100KB total (minimal context + tool responses) vs 500KB
3. **True epistemic isolation**: getKnowledge() filters facts, LLM literally doesn't see secret info

**Challenges:**
- LLM must reliably call tools (prompt engineering + function calling)
- Validation needed to ensure tool usage
- Scene setup must provide relevant entity IDs

**Alternative considered:** Pre-build full context package like current system
- Rejected: Doesn't scale, LLM can still misremember values, no epistemic guarantee

**Source:** Discussion on 2025-12-31 about deterministic state management

---

### Unified World Tick (Everything Simulates)

**Decision:** ALL entities simulate forward every timestamp at varying detail levels. The world always ticks, whether characters are in focus or off-screen.

**Why:**
- **No freeze problem:** Off-screen characters continue to exist and act
- **No special cases:** Focus vs off-screen is just simulation granularity
- **World feels alive:** Economies drift, weather changes, NPCs age
- **Emergence:** World events arise naturally from ongoing simulation
- **Simplicity:** Single unified model, not separate "on-screen" vs "off-screen" logic

**Design:**
```
Every timestamp tick:

Tier 1 (Focus) → Full prose scenes
├─ Reacher: Full scene generation
├─ Extract comprehensive state changes
└─ Detailed Events with complete prose

Tier 2 (Intentional) → Off-screen active
├─ Aradia: Fighting necromancer
├─ State changes + brief summary
└─ Events with summary prose

Tier 3 (Passive) → Background
├─ NPCs: Minimal drift (location, routine)
└─ Events only if significant

Tier 4 (System) → Automatic
├─ Economies: Rule-based updates
├─ Weather: Seasonal changes
└─ Direct fact updates
```

**Tiers are dynamic:**
- Aradia: focus → intentional (goes off-screen) → focus (returns)
- NPC: passive → intentional (becomes relevant) → passive

**Benefits:**
1. **Consistent world state:** No entity is ever "frozen"
2. **Off-screen continuity:** Aradia's quest progresses while following Reacher
3. **Seamless focus shifts:** Switch protagonists mid-story, both have continuous state
4. **Scalable:** Relevance filtering (only simulate graph-neighbors within radius 3)

**Implementation:**
```typescript
worldTick(timestamp: number) {
  const entities = getAllEntities()
  const byTier = groupByTier(entities)

  const updates = [
    ...simulateFocusTier(byTier.focus, timestamp),
    ...simulateIntentionalTier(byTier.intentional, timestamp),
    ...simulatePassiveTier(byTier.passive, timestamp),
    ...simulateSystemTier(byTier.system, timestamp)
  ]

  commitAllUpdates(updates, timestamp)
}
```

**Example:**
- T30: Aradia declares "I'm going to stop the necromancer" (moves to Tier 2)
- T31-45: Reacher scenes (Tier 1) while Aradia simulates off-screen (Tier 2)
- T45: Aradia's intent resolves (LLM branches, user selects outcome)
- T48: Reacher asks about north → Facts updated (necromancer defeated)

**Alternative considered:** Freeze off-screen characters, only simulate when queried
- Rejected: Unrealistic, breaks immersion, requires retroactive generation (retcon feel)

**Source:** Discussion on 2026-01-01 about off-screen world simulation

---

### Characters Are Complete People, Not Just Stat Blocks

**Decision:** Characters have comprehensive queryable state across ALL attributes: physical, equipment, appearance, skills, AND psychological (goals, motivations, fears, values, conflicts). Treat characters as complete people with agency and depth.

**Core principle:** "What is a character if not a bundle of desires and motivations? They would just be caricatures bound to their roles and titles."

**Why:**
- **Characters need agency:** Without goals/motivations, they're just NPCs following scripts
- **Complete continuity:** Physical ("I was wearing red") AND psychological ("I fear failure") both persist
- **Physical constraints:** Damaged shoe affects mud navigation, height affects reach
- **Psychological depth:** Goals drive behavior, fears create tension, conflicts make characters real
- **Consistency enforcement:** Appearance, equipment, AND motivations can't change without cause
- **Emergence:** Status effects combine (exhausted + wounded = can't run), motivations conflict (duty vs morality)

**Design:**
```typescript
// Physical Attributes
{subject: "reacher", property: "height", value: 185}
{subject: "reacher", property: "strength", value: 7.5}

// Equipment State (temporal)
{subject: "reacher", property: "equipment.shoe-left.condition", value: "damaged-toe-exposed", validFrom: 43}
{subject: "reacher", property: "equipment.tunic.color", value: "red", validFrom: 1}

// Appearance (temporal)
{subject: "reacher", property: "appearance.clothing.tunic.color", value: "red", validFrom: 1}
{subject: "reacher", property: "appearance.visible-injuries", value: "scar-left-cheek", validFrom: 20}

// Condition (temporal)
{subject: "reacher", property: "health.current", value: 85, validFrom: 43}
{subject: "reacher", property: "condition.wetness", value: "waist-down", validFrom: 43, validTo: 48}

// Skills/Capabilities
{subject: "reacher", property: "skill.aspect-theory", value: 9.5}
{subject: "reacher", property: "can-reach-height", value: 150}

// Goals & Motivations (WHO they are - M5)
{subject: "aradia", property: "primary-goal", value: "achieve-peace-with-lunaria"}
{subject: "aradia", property: "motivation.peace", value: "haunted-by-war-casualties"}
{subject: "alaric", property: "primary-goal", value: "protect-sunnaria"}
{subject: "alaric", property: "motivation", value: "honor-ancestors-legacy"}

// Fears & Internal Conflicts
{subject: "aradia", property: "fears", value: "failing-her-people"}
{subject: "aradia", property: "internal-conflict", value: "duty-to-father-vs-moral-conviction"}
{subject: "alaric", property: "internal-conflict", value: "peace-vs-strength-dilemma"}

// Values & Beliefs
{subject: "aradia", property: "values.primary", value: "compassion-over-conquest"}
{subject: "alaric", property: "belief.leadership", value: "strength-earns-respect"}

// Attitudes (temporal)
{subject: "reacher", property: "attitude-toward.violet-elf", value: "impressed", validFrom: 43}
```

**Extraction strategy:**

**From lorebooks (M5 ETL - one-time):**
- All physical attributes (height, strength, age)
- Base skills/capabilities
- Default appearance
- **Goals & motivations** (what they want, why they want it)
- **Fears & conflicts** (what holds them back, internal struggles)
- **Values & beliefs** (what guides their behavior)

**From scenes (ongoing extraction):**
- Equipment changes (damage, acquisition, loss)
- Condition changes (injuries, exhaustion, wetness)
- Appearance changes (clothing, visible wounds)
- Attitude changes (how they feel about specific entities)
- Status effects (poisoned, blessed, cursed)
- **Goal evolution** (rare - major character development events only)

**Validation rules:**

**Appearance consistency:**
```typescript
// Red tunic → green tunic without clothing-change event → Flag warning
validateAppearanceConsistency(newFact, existingFacts)
```

**Physical constraints:**
```typescript
// Character height 120cm can't reach table height 180cm → Flag violation
validatePhysicalConstraints(action, characterFacts)
```

**Equipment constraints:**
```typescript
// Can't use broken sword → Flag violation
validateEquipmentUsage(action, equipmentState)
```

**Benefits:**
1. **Everything that can contradict is tracked:** Physical, equipment, appearance, AND psychological
2. **Character state = queryable facts:** Just like economies have grain-tariff, characters have shoe-condition AND primary-goal
3. **Validation catches contradictions:** System flags "red tunic became green" AND "pacifist became warmonger" without explanation
4. **No hallucination:** LLM queries character state for both physical attributes AND motivations
5. **Characters have agency:** Goals/motivations drive behavior, making characters active participants (not NPCs)
6. **Depth without complexity:** Single fact model handles both "height: 185cm" and "primary-goal: achieve-peace"

**Critical distinction - M5 vs M11:**
- **M5 character facts** define WHO they are (goals, motivations, fears) - static or slow-changing
- **M11 Intent system** tracks HOW they pursue goals (active off-screen progression) - dynamic
- Example: Aradia's goal "achieve-peace" (M5 fact) drives her intent "negotiate-treaty" (M11 active pursuit)
- Without M5 psychological facts, M11 Intent would have nothing to build on

**Alternative considered:** Only track physical attributes, let LLM handle psychology
- Rejected: Characters become stat blocks without agency or depth. Goals are just as important as height.

**Source:** Discussion on 2026-01-03 about character depth and agency

---

### The LLM Is Not the State Keeper

**Decision:** External world state (Timeline, Map, Calendar) maintains consistency. The LLM just generates language.

**Why:**
- LLMs hallucinate when information is missing
- LLMs can't remember details reliably across long contexts
- LLMs make logical errors in complex reasoning

**Instead:**
- State is deterministic (Timeline, Map, Calendar)
- LLM queries state via tools (see "Tool-Calling Over Context-Stuffing")
- LLM generates prose that fits queried constraints
- Validation catches mistakes

**Trade-off:** More complexity (build a state engine + tool infrastructure), but reliable consistency.

---

## Data Model

### Timeline Is the Database

**Decision:** Facts have temporal bounds (validFrom/validTo). Entities are derived views.

**Why:**
- World changes over time (Aldric is Prince → King → Dead)
- Need to query "What was true at Chapter 5?"
- Entities-as-objects can't handle temporal state elegantly

**Design:**
```
Fact: {subject: "Aldric", property: "title", value: "King", validFrom: "Ch1", validTo: "Ch10"}

Query at Ch5: "Aldric is King" ✅
Query at Ch15: "Aldric is King" ❌ (died at Ch10)
```

**Alternative considered:** Entity objects with version history
- Rejected: Complex, harder to query, less flexible

**Source:** `architecture/core/02-timeline-centric.md`

---

### Events Are Source of Truth, Facts Are Derived

**Decision:** Store events (what happened, who was there, when). Facts are extracted from events.

**Why:**
- Groups related facts (context preserved)
- Enables epistemic state (track who participated)
- Preserves original prose alongside structured data
- Supports "why" questions (which event caused this fact?)

**Design:**
```
Event: "Coronation of King Aldric" (Ch1)
├─ participants: [Aldric, High Priest, Court]
├─ visibility: public
├─ prose: "The crown was placed upon Aldric's head..."
└─ outcomes:
    ├─ Fact: {subject: "Aldric", property: "title", value: "King", validFrom: "Ch1"}
    └─ Fact: {subject: "Aldric", property: "location", value: "Great Hall", at: "Ch1"}
```

**Alternative considered:** Facts only (no events)
- Rejected: Loses context, can't do epistemic state, no prose preservation

**Source:** `architecture/core/02-timeline-centric.md` §2.2, `architecture/core/06-storage-format.md` §6.2

---

### Relationships Are Facts (Not Separate)

**Decision:** Relationships use the same Fact structure (subject/property/value).

**Why:**
- Relationships change over time (same as other facts)
- Unified data model (simpler)
- Same query mechanisms

**Design:**
```
Fact: {subject: "Aldric", property: "daughter-of", value: "Aradia", validFrom: "Ch1"}
Fact: {subject: "Sunnaria", property: "allied-with", value: "Limaria", validFrom: "Ch2", validTo: "Ch8"}
```

**Alternative considered:** Separate Relationship table
- Rejected: Duplication (same temporal bounds, same queries)

**Source:** `architecture/core/02-timeline-centric.md` §2.3

---

## Storage

### Store Verbose, Render Compact

**Decision:** Internal storage is structured and verbose. LLM context is compact and token-efficient.

**Why:**
- Storage: Optimized for queries (structured fields, indexable)
- Context: Optimized for tokens (compact, readable)
- Different goals, different formats

**Design:**
```
Storage (queryable):
{subject: "Aldric", property: "title", value: "King", validFrom: "Ch1"}
{subject: "Aldric", property: "arm-count", value: 1, validFrom: "Ch10"}

Context (token-efficient):
"Aldric: King. One arm (lost Ch10)."
```

**Alternative considered:** Same format for both
- Rejected: Verbose format wastes tokens, compact format hard to query

**Source:** `architecture/core/06-storage-format.md` §6.1

---

### Original Prose Is Preserved

**Decision:** Store original prose alongside extracted facts.

**Why:**
- Prose has nuance that facts can't capture
- Author's exact words are reference material
- Extraction isn't perfect (fallback to prose if needed)
- Audit trail (where did this fact come from?)

**Design:**
```
Event {
  prose: "The crown was placed upon Aldric's head as the crowd roared...",
  outcomes: [
    {subject: "Aldric", property: "title", value: "King", validFrom: "Ch1"}
  ]
}
```

**Alternative considered:** Facts only (discard prose)
- Rejected: Loses author's voice, loses nuance

**Source:** `architecture/core/06-storage-format.md` §6.3

---

## Validation

### Generic Constraint Framework

**Decision:** Validation is a pluggable rule system, not hardcoded physics.

**Why:**
- Different worlds have different rules
- Rules evolve as world is defined
- Extensibility (add new rules without changing core)

**Design:**
```typescript
type Rule = {
  check: (prompt: string) => Promise<Violation[]>;
};

type Violation = {
  type: string;
  term: string;
  message: string;
  suggestion?: string;
};
```

Rules capture dependencies via closures (EntityStore, Lexicon, LLM).

**Alternative considered:** Hardcoded validation
- Rejected: Not flexible, can't handle custom worlds

**Source:** `architecture/core/17-constraint-validation-system.md`

---

### Flags Are for Contradictions, Not Variations

**Decision:** The system flags actual conflicts, not unusual author choices.

**Why:**
- Author's prose is source of truth
- System shouldn't second-guess creative decisions
- "Unusual" doesn't mean "wrong"

**Examples:**

**Not flagged:**
- "Unusually warm day" during winter (prose says it's unusual)
- Rainy season with sunny day (rainy season ≠ constant rain)

**Flagged:**
- Scene 1: "Pouring rain all night"
- Scene 2 (same night, location): "Dry dust swirled..."
- → Contradiction, flag for review

**Alternative considered:** Flag all statistical outliers
- Rejected: Too noisy, undermines author autonomy

**Source:** `architecture/core/02-timeline-centric.md` §2.5

---

### Validation Timing Is Configurable

**Decision:** Multiple validation phases, each with different goals.

**Why:**
- Real-time: Lightweight, while typing (UX)
- Pre-generation: Full checks before LLM runs (prevent bad input)
- Post-generation: Validate LLM output (catch mistakes)
- At-commit: Full consistency check (prevent timeline corruption)

**Design:**
```
Real-time: Entity names exist? Obvious contradictions?
Pre-gen:   Build constraint package, check all rules
Post-gen:  Validate LLM output, flag violations
At-commit: Temporal consistency, relationship integrity
```

**Alternative considered:** Single validation phase
- Rejected: Too slow for real-time, too shallow for commit

**Source:** `architecture/core/02-timeline-centric.md` §2.7, `architecture/core/17-constraint-validation-system.md` §17.7

---

## Epistemic State

### Never Cache, Always Query

**Decision:** Character knowledge is computed fresh from timeline, never cached.

**Why:**
- Knowledge changes as events occur (can't stale cache)
- Reveals/conceals change knowledge mid-scene
- Query is source of truth

**Design:**
```typescript
getKnowledge(characterId, timestamp) {
  // Query timeline for:
  // - Events character participated in
  // - Events with visibility character has access to
  // - Reveals linking to this character
  // - Minus concealed-from
}
```

**Alternative considered:** Cache knowledge per character/timestamp
- Rejected: Cache invalidation is hard, correctness is critical

**Source:** `architecture/core/08-epistemic-state.md` §8.7

---

### Epistemic Isolation Is Literal

**Decision:** In multi-agent scenes, each character's LLM literally doesn't see information they don't know.

**Why:**
- LLMs can't reliably "pretend not to know" if info is in context
- Only way to guarantee secrets stay secret
- Forces realistic knowledge boundaries

**Design:**
```
King's context:    [Public events] + [War council details] + [Treasury info]
Aradia's context:  [Public events only]

System sends separate prompts to LLM with filtered contexts.
```

**Alternative considered:** Single context with "Character X doesn't know Y"
- Rejected: LLMs leak information even with instructions

**Source:** `architecture/core/08-epistemic-state.md` §8.8, `architecture/core/09-scene-execution.md` §9.3

---

## World Boundary

### World Lexicon Grows Stricter Over Time

**Decision:** Early in world-building, allow generic terms. As world is defined, get stricter.

**Why:**
- Bootstrap problem: Can't validate against empty lexicon
- Author needs creative freedom early
- As world grows, consistency becomes more important

**Design:**
```
Phase 1 (Early): Auto-allow common terms (horses, swords, love, war)
Phase 2 (Building): Flag unknown terms, suggest adding to lexicon
Phase 3 (Mature): Strict mode, flag anything not in lexicon
```

**Alternative considered:** Strict from day one
- Rejected: Too hostile, blocks creative flow

**Source:** `architecture/core/02-timeline-centric.md` §2.6

---

## Effects

### Sticky vs Cascading

**Decision:** Computable effects at query-time (sticky), narrative effects at write-time (cascading).

**Why:**
- Some effects are deterministic (location affects weather, age affects appearance)
- Some effects are creative (dam breaks → what happens downstream?)
- Different mechanisms for different needs

**Sticky (query-time):**
```
Location: Ilaria (rainy climate)
→ Query-time: "It's probably raining"
```

**Cascading (write-time):**
```
Event: Dam built on river
→ LLM generates branches: [flooding, controlled, beneficial]
→ Author selects
→ Effects become facts
```

**Alternative considered:** All effects query-time OR all effects write-time
- Rejected: Some effects are computable, some need author input

**Source:** `architecture/core/03-effects.md` §3.7-3.8

---

### LLM Proposes, Author Decides

**Decision:** For cascading effects, LLM generates possibility branches with probabilities. Author/dice selects.

**Why:**
- LLM is creative (generate possibilities)
- Author is authoritative (choose outcome)
- Prevents auto-cascading accidents

**Design:**
```
Event: "King dies"
LLM branches:
  A: Civil war (40%)
  B: Smooth succession (30%)
  C: Foreign invasion (20%)
  D: Regency council (10%)

Author selects B
→ Facts: Princess Aradia becomes Queen (Ch11)
```

**Alternative considered:** Auto-cascade based on rules
- Rejected: Too deterministic, removes author agency

**Source:** `architecture/core/03-effects.md` §3.4-3.5

---

## Import

### Partial Inference with Confidence Tiers

**Decision:** Auto-accept structural relationships, ask about semantic, never infer causal.

**Why:**
- Some inferences are safe ("X is in Y" from structure)
- Some need confirmation ("X loves Y" from prose)
- Some are too risky ("X caused Y")

**Tiers:**
```
Structural (auto-accept):
  "Royal Gardens is in Sunnaria" (from containment)
  "Aradia is daughter of Alaric" (from family tree)

Semantic (ask first):
  "Aradia loves the gardens" (from prose description)
  "King is wise" (from character traits)

Causal (never infer):
  "The drought caused the war" (requires author decision)
```

**Alternative considered:** LLM infers everything, author reviews
- Rejected: Too many false positives for causal relationships

**Source:** `architecture/core/10-import-pipeline.md` §10.5

---

## Multi-World Support

### WorldId on Facts and Entities

**Decision:** Facts and Entities have `worldId` field. System can manage multiple worlds.

**Why:**
- Users might have multiple stories/worlds
- Each world is self-contained
- Prevents cross-contamination

**Design:**
```typescript
type Fact = {
  worldId: string;
  subject: string;
  property: string;
  value: string | number | boolean;
  ...
};
```

All queries filter by worldId.

**Alternative considered:** Single world only
- Rejected: Limiting, users want multiple projects

**Source:** `architecture/core/14-mvp-scope.md` §14.4

---

## Code Style

### TDD Is Mandatory

**Decision:** Failing test first → minimum code to pass → refactor. No exceptions.

**Why:**
- Prevents over-engineering
- Tests document behavior
- Refactoring is safe

**Workflow:**
1. Apply ZOMBIES to enumerate test cases
2. Write `test.todo()` for planned tests
3. Convert one test at a time: `test.todo` → `test` → pass → refactor

**Alternative considered:** Write code first, test later
- Rejected: Leads to untestable code, over-engineering

**Source:** `CLAUDE.md`

---

### No Comments

**Decision:** Code must be self-documenting through naming and structure.

**Why:**
- Comments go stale
- Good names > explanations
- If code needs comments, refactor

**Exceptions:** None. If unclear, rename or restructure.

**Alternative considered:** Allow comments for complex logic
- Rejected: Slippery slope, encourages unclear code

**Source:** `CLAUDE.md`

---

### Types Over Interfaces, No Classes

**Decision:** Use `type X = {...}` not `interface X {...}`. Use plain objects and functions, not ES6 classes.

**Why:**
- Types are more flexible (unions, intersections)
- Functional style is simpler
- No OOP overhead

**Design:**
```typescript
type Entity = {
  id: string;
  name: string;
  aliases: string[];
};

const createEntityStore = () => {
  const entities: Entity[] = [];
  return {
    add: (entity: Entity) => { ... },
    find: (id: string) => { ... },
  };
};
```

**Alternative considered:** Classes with methods
- Rejected: Unnecessary complexity, OOP baggage

**Source:** `CLAUDE.md`

---

## Performance

### Profile-Driven Optimization

**Decision:** Brute force + basic indexing first. Optimize bottlenecks after measurement.

**Why:**
- Premature optimization wastes time
- Don't know where bottlenecks are until profiling
- Simple code first, fast code when needed

**Strategy:**
1. Build with simple implementations
2. Profile with real usage
3. Optimize measured bottlenecks
4. Repeat

**Alternative considered:** Optimize everything up front
- Rejected: Wastes time, often optimizes wrong things

**Source:** `architecture/core/13-open-questions.md`

---

## Summary of Key Decisions

| Decision | Rationale |
|----------|-----------|
| Plugin-first architecture | Everything is an extension, core included |
| Lorebook is import format | Entity IDs solve name disambiguation |
| World state as RPG stats | All entities have queryable numeric attributes |
| Tool-calling over context-stuffing | Deterministic facts, no hallucination, scalable |
| Unified world tick | Everything simulates (focus/off-screen just detail level) |
| Characters are RPG stat sheets | Complete continuity (clothing, equipment, conditions) |
| Timeline is database | Handle temporal state elegantly |
| Events → Facts | Preserve context, enable epistemic state |
| Store verbose, render compact | Different goals (query vs tokens) |
| Generic validation framework | Flexibility, extensibility |
| Never cache epistemic state | Correctness over performance |
| LLM proposes, author decides | Creative generation + author control |
| Partial inference tiers | Balance automation with safety |
| TDD mandatory | Quality, prevent over-engineering |
| No comments | Force clear code |

---

**See also:**
- `vision.md` - What we're building
- `current.md` - Where we are
- `roadmap.md` - How we get there
- `architecture/` - Detailed design docs
