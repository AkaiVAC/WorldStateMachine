# Design Decisions

**Last updated:** 2025-12-30

This document captures the "why" behind key architectural decisions.

---

## Core Philosophy

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

### The LLM Is Not the State Keeper

**Decision:** External world state (Timeline, Map, Calendar) maintains consistency. The LLM just generates language.

**Why:**
- LLMs hallucinate when information is missing
- LLMs can't remember details reliably across long contexts
- LLMs make logical errors in complex reasoning

**Instead:**
- State is deterministic (Timeline, Map, Calendar)
- Constraint package is pre-computed (not LLM reasoning)
- LLM generates prose that fits pre-built constraints
- Validation catches mistakes

**Trade-off:** More complexity (build a state engine), but reliable consistency.

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
| Lorebook is import format | Entity IDs solve name disambiguation |
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
