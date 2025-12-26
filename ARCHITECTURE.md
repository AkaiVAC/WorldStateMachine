# Lorebook Manager - Architecture Design Document

This document captures the architectural decisions for building a world state management system for AI-assisted storytelling.

---

## 1. Problem Statement

### 1.1 The Core Problem

When using LLMs for story generation, they invent random names, events, and details that don't fit the established world. This breaks immersion and creates inconsistencies.

**Example:** If kingdom A receives envoys from kingdom B, we should know:
- Why are they being sent?
- Who specifically would be chosen, and why them?
- What are their motivations, personalities, histories?
- What are they wearing? (fashion is culture-dependent)
- How would they travel? What route?

Once these decisions are made, they should be frozen as canon.

### 1.2 Secondary Problems

**Temporal awareness:** If a character is dead, in a different location, or not yet born, interactions with them should be flagged as impossible.

**Context budget:** LLMs have limited context windows. We can't dump an entire world bible into every prompt. We need smart retrieval that surfaces only what's relevant.

**Spatial consistency:** LLMs struggle with spatial relationships. "The queen sat next to the king" is ambiguous. Without tracking that she's on his RIGHT, she might bump him from the left later.

**Cascading effects:** When a dam is built on a river, downstream kingdoms are affected. When ruins are discovered, nearby settlements change. Effects ripple through the world.

---

## 2. Core Principle: Timeline-Centric

**The Timeline is the database. Entities are derived views.**

Instead of storing "entities" (characters, places, etc.) as objects with properties, we store **facts with temporal bounds**. An entity is just the collection of all facts that reference it.

### 2.1 What is a Fact?

A Fact is a statement about the world with a time range during which it's true.

```
Fact:
  - subject: What entity this is about (e.g., "Aldric")
  - property: What aspect (e.g., "title", "arm-count", "located-in")
  - value: The value (e.g., "King", 1, "Sunnaria")
  - validFrom: When this became true (e.g., year 10)
  - validTo: When this stopped being true (null = still true)
  - tier: Retrieval priority (lead, supporting, role, ambient)
  - source: Where this fact came from (for tracing)
```

### 2.2 Entities Emerge from Facts

There is no "create entity" step. An entity exists once facts reference it.

To add a new character, just add facts about them. To expand a character, add more facts. Even retroactively.

### 2.3 Relationships Are Also Facts

```
{ subject: "Aldric", property: "rules", value: "Sunnaria", validFrom: 10 }
{ subject: "Sunnaria", property: "allied-with", value: "Limaria", validFrom: 5, validTo: 15 }
{ subject: "Sera", property: "daughter-of", value: "Aldric", validFrom: 5 }
```

### 2.4 Consistency Checking

The system validates new facts against existing ones:
- "Aldric meets Elara in year 25" → **Error:** Elara died in year 18
- "Sera rules in year 15" → **Error:** She wasn't queen until year 20

This directly supports the core goal: preventing impossible interactions.

### 2.5 Flags Are for Contradictions, Not Variations

The system flags **actual conflicts**, not unusual choices.

**Not flagged (author's choice):**
- "It was sunny in July" during Ilaria's rainy season → Allowed. Rainy season ≠ constant rain.
- "An unusually warm day" → The prose itself captures the unusualness.

**Flagged (contradiction):**
- Scene 1: "It was pouring rain all night"
- Scene 2 (same night, same location): "The dry dust swirled..."
- → **Conflict:** Contradictory weather in overlapping scenes. Intentional?

The author's words are the source of truth. If weather is notable, the prose will say so ("unusually warm"). The system doesn't second-guess creative choices—it catches mistakes.

### 2.6 World-Boundary Consistency

The system catches real-world references that don't belong in the fictional world.

**Consistency types:**

| Type | What it catches |
|------|-----------------|
| Temporal | Dead people appearing, events before birth |
| Spatial | Being in two places at once |
| Factual | Contradictory statements about the same thing |
| World-boundary | Real-world references that don't belong |

**Common-sense mode (default):**

```
Auto-allowed (universal basics):
├── Common animals: horses, dogs, cats, birds, fish...
├── Common plants: trees, grass, flowers...
├── Basic concepts: love, war, trade, family...
└── Generic terms: "syndrome", "tactics", "architecture"...

Flagged (Earth-specific):
├── Place names: Stockholm, Paris, Rome...
├── Historical figures: Napoleon, Caesar, Victoria...
├── Cultural epochs: Victorian, Renaissance, Medieval...
└── Species not in lexicon when category is defined

Explicitly absent (author-defined):
├── Technology: guns, gunpowder, electricity...
└── Whatever the author specifies
```

**Category-aware strictness:**

The system grows stricter as the world gets more defined:

```
Lexicon has fauna: [ice-wolves, shadow-voles, fire-drakes]
Prose mentions: "mouse"
→ Flag: "mouse" not in confirmed fauna. Add or replace?

Lexicon fauna: (empty)
Prose mentions: "mouse"
→ Allow: No fauna defined yet, assume Earth-defaults
```

**Example flags:**

```
⚠️ Real-world reference: "Stockholm Syndrome"
   Stockholm is not in the World Lexicon.
   Options: Add location | Replace term | Dismiss

⚠️ Unconfirmed fauna: "crocodile" (in "crocodile tears")
   Crocodiles not in confirmed fauna.
   Options: Add to fauna | Replace idiom | Dismiss
```

### 2.7 Validation Timing

Validation can run at two points, configurable by the author.

**Real-time (while typing):**
- Lightweight checks only (Earth place names, explicit absences)
- Subtle indicator (yellow underline, not red)
- Non-blocking, just awareness
- Requires running process (language server style)

**At commit (batch):**
- Full validation (all consistency types)
- Blocking if errors (temporal, spatial, factual contradictions)
- Advisory if warnings (world-boundary, suggestions)
- Diff view shows everything

**Hybrid approach (recommended):**

```
While typing:
├── Lightweight world-boundary checks
├── Subtle highlighting
└── Non-blocking

At commit:
├── Full validation suite
├── Error/warning summary
└── Review before finalizing
```

**Configuration:**

```
validation:
  real-time: true | false | "lightweight"
  at-commit: true  (always on)
  blocking: [temporal, spatial, factual]
  advisory: [world-boundary, suggestions]
```

---

## 3. Key Insight: Effects Are Data, Not Inference

### 3.1 The Problem with Runtime Inference

We initially considered inferring cascading effects at query time: "dam built at A → system infers B, C, D, E are affected."

This doesn't scale. There are hundreds of possible event types with unpredictable effects. A dam affects downstream. Ruins might attract treasure hunters, emanate dark magic, or become pilgrimage sites - we can't know without context.

### 3.2 The Solution: Capture Effects at Import/Write Time

Effects are extracted and stored as explicit facts during import or authoring, not computed at query time.

```
Input prose:
"The Ruins of Karthage lie three days north of Millbrook.
Since its discovery, the village has been plagued by
strange disappearances and an influx of relic hunters."

Extracted facts:
├── Ruins-of-Karthage.type = ancient-ruin
├── Ruins-of-Karthage.location = 3-days-north-of-Millbrook
├── Millbrook.affected-by = Ruins-of-Karthage [since discovery]
├── Millbrook.experiences = strange-disappearances [since discovery]
├── Millbrook.experiences = relic-hunter-influx [since discovery]
```

The prose already describes the effects - we just structure them.

### 3.3 Pipeline

```
IMPORT/AUTHORING (intelligence lives here)
├── Prose → Extract entities, relationships, AND effects
├── Human reviews extracted facts
├── Effects stored as explicit facts
└── One-time cost, human-verified

QUERY (deterministic)
├── Graph traversal
├── No guessing, no inference
└── Effects already stored as facts
```

### 3.4 Handling New Events Post-Import

When the story generates "A volcano erupts near Kingdom C":

1. **Author explicitly adds effects** - The human or generating LLM describes what happens. Effects become new facts.

2. **Suggestion engine** - System says: "Volcano near Kingdom C. Nearby entities: [D, E, F]. Would you like to add effects?" User picks and describes.

3. **Template effects** - Common event types have templates (volcano → fire damage, ash, evacuation). User selects applicable ones.

---

## 4. Containment Hierarchy (Automatic Proximity)

### 4.1 Geographic Inheritance

Entities in the same region share context automatically through containment.

```
Region: Northern Wastes
├── contains: Ruins of Karthage
├── contains: Millbrook
├── contains: Trader's Rest
└── properties: harsh-climate, ancient-magic-residue

Query: "What's relevant to Millbrook?"
→ Millbrook facts
→ Northern Wastes facts (inherited via containment)
→ Siblings in same region as potential context
```

No explicit "proximity" rules needed - containment provides it.

### 4.2 Relationship Types Define Propagation

For relationships that need traversal behavior (rivers, trade routes, political hierarchies), we define behavior per **relationship type**, not per event type.

```
Relationship types with propagation:
├── flows-through: sequential (downstream)
├── borders: adjacent (bidirectional)
├── contains/part-of: hierarchical (up/down)
├── rules/subject-of: domain membership
├── trade-route: along path
└── allied-with/enemy-of: political graph
```

There are maybe 20-30 relationship types. This is manageable.

### 4.3 Environmental Properties

Locations have environmental data that affects narrative and enables consistency checking.

**Climate (regional, persistent):**
```
Ilaria:
├── climate: temperate
├── rainy-months: [6, 7, 8]
├── terrain: rolling-hills, river-valleys
├── flora: [deciduous-forests, wildflower-meadows]
└── fauna: [deer, songbirds, river-fish]

Northern Wastes:
├── climate: arctic
├── terrain: frozen-tundra, ice-fields
├── flora: [hardy-lichens, frost-moss]
└── fauna: [ice-wolves, snow-bears]
```

**Location-specific features:**
```
Royal Gardens of Ilaria:
├── terrain: stone-paths, manicured-lawns, elevated-terraces
├── flora: [roses, hedges, ancient-willows]
├── fauna: [ornamental-koi, songbirds]
├── features: [pond, fountain, gazebo]
└── surfaces: [cobblestone, grass, water]
```

**Why this matters:**

Weather is NOT ephemeral scene color—it's essential data for narrative recall:

> "I-I don't remember much... I do remember that it was raining that night. I slipped on a puddle and fell unconscious..."

That retrieval only works if the system *knows* it was raining. Terrain, flora, and fauna inform what can happen: "What could someone slip on here when wet?" → cobblestone, wet grass.

**Weather in scenes:**
- Climate data enables suggestions: "July in Ilaria (rainy season). Weather?"
- Author states weather explicitly → stored with the event
- System accepts any weather without warning (see §2.5)
- Climate is probability, not prescription

---

## 5. World State vs. Scene State

### 5.1 The Distinction

**World State (persistent, lives in Timeline):**
- Aldric is King
- Aldric has one arm
- Aldric's voice is deep and gravelly
- These are facts about the world

**Scene State (ephemeral, lives in the Scene):**
- Location: Throne Room
- Time: Year 20, afternoon
- Aldric: seated on throne, center
- Elara: seated to his RIGHT
- Guards: lining the walls
- Focus: diplomatic audience

Scene state is spatial arrangement. It changes as the scene progresses.

### 5.2 How They Interact

1. Scene specifies location, time, and entities present
2. System queries Timeline for world facts about those entities at that time
3. Scene adds spatial/situational arrangement
4. Retrieval prioritizes facts based on scene focus

### 5.3 Scenes as Commit Unit (Staging Model)

Scenes are the unit of "saving" to the timeline. Like git, facts go through staging before commit.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Incoming   │ ──► │   Staging   │ ──► │  Committed  │
│   Prose     │     │   (Draft)   │     │  Timeline   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    Human review
                    Accept / Edit / Reject
```

**When a scene is committed, it becomes an Event in the timeline:**

```
Event: "The Night in the Gardens"
├── location: Royal Gardens of Ilaria
├── time: Year 20, Month 7, Night
├── weather: raining
├── participants: [Narrator (guard), Assassin, ...]
├── sub-events: [assassination attempt, narrator falls]
├── outcomes: [narrator unconscious, assassin escapes]
└── sensory: [wet stone, cold, dark]
```

**Staging enables:**
- Batch review of extracted facts
- Diff view: "Here's what this scene would add to the timeline"
- Reject individual facts while accepting others
- Edit before committing
- No unverified facts polluting the canonical timeline

This is **git for world state**.

---

## 6. Storage vs. Context Format

### 6.1 Store Verbose, Render Compact

The internal storage format is structured for queryability. The context format sent to LLMs is compact for token efficiency.

```
Storage (queryable):
{ subject: "Aldric", property: "title", value: "King", validFrom: 0 }
{ subject: "Aldric", property: "arm-count", value: 1, validFrom: 20 }
{ subject: "Aldric", property: "voice", value: "deep, gravelly" }

Context (token-efficient):
"Aldric: King. One arm (lost year 20). Voice: deep, gravelly."

Or structured but compact:
"ALDRIC | King | 1 arm | deep voice"
```

Storage format is an implementation detail. The retrieval pipeline queries timeline, filters by relevance, then renders to compact format.

### 6.2 Event-Centric Storage

Events are the source of truth. Entity attributes are derived.

```
Event: Battle of Thornfield (year 20)
├── participants: [Aldric, Katherine, ...]
├── injuries: [{target: Aldric, type: arm-loss, side: right, by: Katherine}]
└── outcome: victory for Sunnaria

Derived fact:
{ subject: "Aldric", property: "arm-count", value: 1, validFrom: 20 }
```

This groups related facts and provides context (which hand, when, by whom, in what event).

---

## 7. Entity Tiers (Store Everything, Retrieve Smartly)

### 7.1 The Approach

Store every detail. Use tiers to prioritize retrieval.

```
Entity Tiers:
├── lead: Full tracking (main characters)
├── supporting: Position, key facts (named NPCs)
├── role: Group treatment ("the guards")
└── ambient: Minimal (crowd, background)
```

### 7.2 Promotion

When Guard #3 becomes plot-relevant (stops an assassin):
1. They already exist (facts stored when the scene was written)
2. Update their tier from "ambient" to "supporting" or "lead"
3. Add more facts as needed

Everything persists. Tier affects retrieval priority, not storage.

---

## 8. Import Pipeline (Determinism Preference)

### 8.1 Guiding Principle

Prefer deterministic approaches. Use ML only where unavoidable. Always allow human review.

### 8.2 Hybrid Pipeline

```
┌─────────────────────────────────────────┐
│            Raw Prose Entry              │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│     Classical NLP (spaCy, etc.)         │
│     - Named Entity Recognition          │
│     - Temporal expression parsing       │
│     - Basic relation patterns           │
│     Deterministic, fast                 │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│     SLM / Fine-tuned small model        │
│     - Complex relations                 │
│     - Event extraction                  │
│     - Effect identification             │
│     Domain-adaptable, still fast        │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│         Confidence Scoring              │
└────────────────┬────────────────────────┘
                 ▼
         ┌──────┴──────┐
         ▼             ▼
    High conf.    Low conf.
         │             │
         ▼             ▼
    Auto-accept   Human review
                  (or escalate)
```

### 8.3 What Each Layer Handles

| Layer | Handles | Determinism |
|-------|---------|-------------|
| Classical NLP | Names, dates, places, basic relations | Fully deterministic |
| SLM | Complex relations, events, effects | Deterministic given same input |
| Human review | Ambiguous cases, corrections | Human judgment |
| Large LLM | "Can't parse this at all" (rare) | Optional fallback |

### 8.4 Quality Trade-offs

The quality gap between approaches matters less when:
- Human review is in the loop
- You can fine-tune on your domain (lorebook patterns)
- Determinism enables systematic debugging and improvement

### 8.5 Inference Tiers (Partial Inference)

Not all inferences require the same level of scrutiny. The system uses confidence tiers to auto-accept obvious extractions while flagging uncertain ones.

| Tier | Confidence | Action | Examples |
|------|------------|--------|----------|
| Structural | High | Auto-accept | Containment from "X of Y" patterns; "Royal Gardens of Ilaria" → child of Ilaria |
| Categorical | High | Auto-accept | Entity type from clear markers; "King Aldric" → person, ruler |
| Environmental | Medium | Auto-suggest | Weather based on climate/season; "July in Ilaria → rainy season, suggest rain" |
| Semantic | Medium | Ask first | Political implications; "Royal gardens" → Ilaria has monarchy? |
| Identity | Low | Ask first | "Who is the narrator?" → Create new character or link existing? |
| Causal | Never | Never infer | Why something happened; character motivations |

**Example extraction from prose:**

> "I was a guard in the royal gardens of Ilaria, overlooking a beautiful pond."

```
AUTO-ACCEPTED (structural, high confidence):
├── Royal Gardens of Ilaria → contained by Ilaria
├── Pond → contained by Royal Gardens
└── Narrator → stationed at Royal Gardens

SUGGESTED (needs confirmation):
├── Ilaria has royal/monarchical government? (inferred from "royal")
├── Create narrator as new character? (unnamed, role: guard)
└── Store "beautiful" as aesthetic property of pond?

NOT INFERRED:
├── Why the narrator was stationed there
├── The narrator's identity/name
└── Time period
```

This reduces friction for obvious relationships while keeping humans in control of meaningful world decisions.

---

## 9. Query Pipeline (Fully Deterministic)

### 9.1 Retrieval Strategy

```
Scene Context
    ↓
Graph Traversal (direct entities, relationships, containment)
    ↓
Relevance Scoring (tier, proximity to focus, recency)
    ↓
Token Budget Filtering
    ↓
Compact Rendering
    ↓
Context for LLM
```

### 9.2 Focus-Based Priority

| Scene Type | Prioritizes |
|------------|-------------|
| Battle | Injuries, combat skills, weapons |
| Court | Titles, relationships, attire |
| Intimate | Personality, emotional history |
| Trade | Economics, goods, routes |

### 9.3 Depth-Bounded Traversal

When retrieving "Aldric," how far do we traverse?

- **Depth 0:** Direct facts about Aldric (high priority)
- **Depth 1:** Entities directly linked (medium priority)
- **Depth 2:** Context of those entities (lower priority)
- **Beyond:** Not retrieved unless scene focus demands

---

## 10. Relationship to Prior Art

### 10.1 Temporal Knowledge Graph

Our fact model mirrors RDF with temporal extension:
```
RDF:  Subject → Predicate → Object
Ours: Subject → Property  → Value (+ time range)
```

### 10.2 Bi-Temporal Modeling

- **Valid time:** When a fact is true in the story world (our validFrom/validTo)
- **Transaction time:** When a fact was recorded (for undo/audit - future feature)

SQL:2011 has standard constructs. Our approach aligns with established patterns.

### 10.3 Event Sourcing

State is stored as events. Current state = derived view. Our timeline is the event log.

### 10.4 The Screenwriting Parallel

| Our Concept | Film/TV Equivalent |
|-------------|-------------------|
| Timeline | Continuity bible |
| Scene | Script page |
| Retrieval | Script supervisor |
| Fact | Continuity note |
| Entity view | Character bible entry |

We're building a digital continuity system for AI-assisted storytelling.

---

## 11. Open Questions

### 11.1 Resolved

- **Cascading effects:** Captured at import/write time, not inferred at query time
- **Rules engine:** Not needed; effects are data
- **Storage verbosity:** Store structured, render compact
- **What to store:** Everything; tier for retrieval priority
- **ML vs determinism:** Hybrid pipeline with human review
- **Environmental data:** Climate, weather, terrain, flora, fauna are first-class location properties (§4.3)
- **Weather storage:** Weather is stored with events, not ephemeral; essential for narrative recall
- **Staging model:** Scenes are commit units; facts go staging → review → committed timeline (§5.3)
- **Inference granularity:** Partial inference with confidence tiers; structural auto-accepts, semantic asks first (§8.5)
- **Consistency flags:** Flags are for contradictions, not variations; author's word is truth (§2.5)
- **World-boundary consistency:** Catches real-world references (Stockholm, Napoleon) via World Lexicon; common-sense mode default, grows stricter as world is defined (§2.6)
- **Validation timing:** Real-time (lightweight, while typing) + at-commit (full validation); configurable (§2.7)

### 11.2 Still Open

- **Fact granularity:** Trait-level vs paragraph-level (lean toward event-centric)
- **Fuzzy temporal bounds:** "Sometime in his youth" (use null, resolve later)
- **Validation rules:** How to define and check consistency constraints
- **Scene state tracking:** Spatial model details
- **Meta-state:** Prose style, tone, detail level (shelved for now)
- **Performance at scale:** Indexing strategy for large worlds
- **Image attachments:** How multimodal content integrates

---

## 12. MVP Scope

### 12.1 Build First

1. Fact and Timeline types
2. Basic queries (getEntityAt, getAllEntities)
3. Import from SillyTavern (extract facts, detect inconsistencies)
4. Visualization (timeline view, entity views)
5. Containment hierarchy

### 12.2 Defer

- Transaction time (undo/audit)
- Scene state management
- Fine-grained focus-based retrieval
- LLM-assisted extraction (start with classical + simple patterns)
- Template effects for common events

---

## 13. File Structure

```
src/
├── timeline/
│   ├── fact.ts           # Fact type
│   ├── timeline.ts       # Timeline operations
│   └── consistency.ts    # Conflict detection
├── entity/
│   └── view.ts           # Compute entity view from facts
├── importer/
│   └── sillytavern/
│       └── parser.ts     # Parse SillyTavern JSON to facts
├── retrieval/
│   └── context.ts        # Context retrieval for LLM prompts
└── explorer/
    ├── tree/             # Hierarchical navigation
    └── graph/            # Visual relationship graph
```

---

## 14. Summary

**Core insight:** The Timeline is the source of truth. Entities are views. Facts have temporal bounds.

**Key architectural decisions:**
1. Effects are data, not inference - captured at write time, not query time
2. Containment hierarchy provides automatic proximity context
3. Store everything, tier for retrieval priority
4. Deterministic query pipeline; ML only for import with human review
5. Store verbose (queryable), render compact (token-efficient)
6. Environmental data (climate, weather, terrain, flora, fauna) is first-class - weather affects narrative and enables recall
7. Scenes are the commit unit - facts go through staging before entering the canonical timeline (git for world state)
8. Partial inference - structural relationships auto-accept, semantic implications ask first, causal never inferred
9. Flags are for contradictions, not variations - the author's prose is the source of truth
10. World-boundary consistency - catches real-world references via World Lexicon; grows stricter as world is defined
11. Validation timing is configurable - lightweight real-time checks while typing, full validation at commit

**The system is a digital script supervisor:** It knows what's true when, surfaces what matters for each scene, and flags inconsistencies before they become story problems.
