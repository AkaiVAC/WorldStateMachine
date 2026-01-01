# Vision: World State Constraint Engine

**Last updated:** 2026-01-01

## The Goal

Build a constraint engine that enables LLMs to generate world-consistent prose for roleplay and storytelling.

**The core problem:** LLMs invent random names, events, and details that don't fit the established world. They have characters teleport, reference events they shouldn't know about, and contradict established facts.

**The solution:** Maintain external world state (Timeline, Map, Calendar) and build constraint packages that prevent the LLM from generating impossible or inconsistent prose.

**The living world:** The system simulates the entire world forward every timestamp - focus characters get full prose scenes, off-screen characters progress their goals with summaries, background entities drift minimally, and world systems (economies, weather) update automatically. The world is always alive, never frozen.

---

## How It Works

```
User: "Princess arrives in Ilaria for peace talks"
    ↓
System builds constraint package:
├─ Timeline: What's true at this time (facts, events)
├─ Map: Spatial context (location state, weather, geography)
├─ Calendar: Temporal context (season, time-of-day)
├─ Epistemic: What Princess knows (filtered events)
└─ Physics: Validation (can she be there? travel time?)
    ↓
LLM generates prose WITHIN constraints
    ↓
System validates output, flags violations
    ↓
Approved output becomes new events/facts (committed to timeline)
```

**The LLM doesn't maintain state, it just generates language. The system maintains state.**

---

## The Three Pillars

The system rests on three foundational pillars:

### 1. Timeline - "What Was True When"

**Core concept:** Facts have temporal bounds. The timeline is the database.

- **Events** are source of truth (what happened, who was there, who knows)
- **Facts** are derived from events (subject/property/value with validFrom/validTo)
- **Chapter-based chronology** for narrative structure
- **Query:** "What was true at Chapter 5?"

**Example:**
```
Event: "Coronation of King Alaric" (Chapter 1)
├─ participants: [Alaric, High Priest, Court]
├─ visibility: public
├─ outcomes:
│   ├─ Fact: {subject: "Alaric", property: "title", value: "King", validFrom: "Ch1"}
│   └─ Fact: {subject: "Alaric", property: "location", value: "Sunnaria", validFrom: "Ch1"}
```

### 2. Map - Spatial Relationships

**Core concept:** Geography is first-class, not metadata.

- **Containment hierarchy:** "Royal Gardens" is in "Sunnaria"
- **Routes and travel time:** "7 days from Sunnaria to Ilaria"
- **Coordinates:** 2D positioning for places
- **Environmental data:** Weather, terrain, climate

**Constraints enabled:**
- Characters can't teleport
- Travel takes time
- "Nearby" is computed, not guessed

### 3. Calendar - Temporal Structure

**Core concept:** Time has granularity and structure.

- **Chapter-based** for narrative (Chapter 1, Chapter 2, ...)
- **Can expand** to full fidelity (year → season → month → day → hour)
- **Custom calendars** supported (different worlds, different time systems)

**Constraints enabled:**
- Seasonal effects ("You can't farm in winter")
- Time-of-day context ("It's night, the market is closed")
- Historical depth ("This happened 200 years ago")

---

## The Constraint Package

When generating a scene, the system builds a constraint package:

```
Constraint Package for "Princess Aradia in Royal Gardens, Chapter 5"
├─ TEMPORAL CONTEXT (Timeline)
│   ├─ Current time: Chapter 5, Day 15, afternoon
│   ├─ Facts valid at this time:
│   │   ├─ Alaric is King
│   │   ├─ Aradia is Princess (age 20)
│   │   └─ War with Ilaria started (Chapter 3)
│
├─ SPATIAL CONTEXT (Map)
│   ├─ Location: Royal Gardens (inside Sunnaria)
│   ├─ Weather: Sunny, warm (spring)
│   ├─ Nearby: Palace, Market District
│   └─ Characters present: Aradia, [guards]
│
├─ EPISTEMIC CONTEXT (Knowledge)
│   ├─ What Aradia knows:
│   │   ├─ Public events (coronation, war declaration)
│   │   ├─ Events she participated in (Ch2 ball, Ch4 council)
│   │   └─ Events revealed to her (Queen told her about treaty)
│   └─ What Aradia DOESN'T know:
│       └─ Secret war council (Chapter 5, she wasn't invited)
│
├─ RELATIONSHIP CONTEXT (Graph)
│   ├─ Aradia's relationships:
│   │   ├─ daughter-of: King Alaric, Queen Elara
│   │   ├─ member-of: Royal Family, Court
│   │   └─ knows: [court nobles, servants, ...]
│
└─ VALIDATION RULES
    ├─ Entity exists check
    ├─ World boundary check (no real-world bleeding)
    ├─ Temporal consistency (can't reference future events)
    └─ Spatial consistency (can't reference distant places)
```

**This package goes to the LLM as context.** The LLM generates prose that fits.

---

## Key Constraints Enforced

### 1. Entity Consistency
- ✅ "Princess Aradia enters" - exists, correct
- ❌ "Prince Alaric enters" - Sunnaria has no prince, suggest Princess Aradia

### 2. World Boundary
- ✅ "She draws her sword" - swords exist in this world
- ❌ "She checks her smartphone" - anachronism, flag

### 3. Epistemic Isolation
- ✅ Aradia's POV can reference the public ball
- ❌ Aradia's POV can't reference the secret war council (she wasn't there)

### 4. Temporal Consistency
- ✅ At Chapter 5, reference Alaric as King (true since Ch1)
- ❌ At Chapter 2, reference the war (doesn't start until Ch3)

### 5. Spatial Consistency
- ✅ Aradia in Sunnaria at Day 10, in Ilaria at Day 18 (7 days travel + 1 day margin)
- ❌ Aradia in Sunnaria at Day 10, in Ilaria at Day 12 (impossible, too fast)

---

## The Loop: Generation → Validation → Extraction → Commit

```
1. USER INPUT
   "Princess Aradia discovers a secret passage"

2. BUILD CONSTRAINT PACKAGE
   - Current timeline state
   - Aradia's location (Royal Gardens)
   - Aradia's knowledge (POV-filtered)
   - Relationship context

3. LLM GENERATES PROSE
   "Princess Aradia was strolling through the Royal Gardens when she noticed
    an unusual carving on the old fountain..."

4. REAL-TIME VALIDATION (lightweight)
   ✅ "Princess Aradia" - entity exists
   ✅ "Royal Gardens" - location exists, she's there
   ✅ "fountain" - plausible, no violations

5. FACT EXTRACTION
   - New entity: "Secret Passage" (in Royal Gardens)
   - New event: "Discovery of Passage" (Chapter 5)
   - Participants: [Aradia]
   - Visibility: private (only she knows)

6. STAGING FOR REVIEW
   - Extracted facts shown to user
   - User confirms/rejects/edits

7. COMMIT TO TIMELINE
   - Facts added with temporal bounds (validFrom: Chapter 5)
   - Event recorded
   - World state updated

8. READY FOR NEXT SCENE
   - Future scenes can reference the secret passage
   - Only Aradia knows about it (epistemic constraint)
   - If she tells someone, create "reveal" event
```

---

## Multi-Agent Orchestration

For scenes with multiple characters who have conflicting knowledge:

```
Scene: King Alaric and Princess Aradia discuss the war (Chapter 6)

King's Context:
├─ Knows: Secret war council decision (attack Ilaria from the north)
├─ Knows: Treasury is depleted
└─ Goal: Don't reveal military strategy to Aradia

Aradia's Context:
├─ Knows: War started (public knowledge)
├─ Doesn't know: Secret council decisions
└─ Goal: Convince father to seek peace

System orchestrates:
1. Generate King's dialogue (with his full context)
2. Generate Aradia's dialogue (with her limited context)
3. Track what's revealed during conversation
4. If King mentions "northern strategy" → update Aradia's knowledge
5. Merge into coherent scene
```

**The LLM can't accidentally leak secrets because it literally doesn't see them in the wrong character's context.**

---

## Relationship Graph

Entities have relationships that enable graph traversal:

```
"Sunnarian Princess" (user input)
    ↓ (relationship graph traversal)
"Sunnaria" → is-ruled-by → King Alaric
          → contains → Royal Family
          → members: [Alaric, Elara, Aradia]
          → Aradia has-title "Princess"
    ↓
Match: Princess Aradia
```

**Relationship types:**
- Family: `daughter-of`, `son-of`, `married-to`, `sibling-of`
- Political: `rules`, `vassal-of`, `allied-with`, `at-war-with`
- Spatial: `located-in`, `part-of`, `connected-to`, `near`
- Social: `member-of`, `serves`, `knows`, `loves`, `hates`
- Functional: `owns`, `created-by`, `discovered-by`

---

## Effect Propagation

When significant events occur, effects ripple through the world:

```
Event: "Dam built on Great River" (Chapter 10)
    ↓
System identifies affected entities:
├─ River flows-through → [Sunnaria, Limaria, coastal regions]
├─ Kingdoms depend-on → water flow
└─ Downstream settlements → flooding risk
    ↓
LLM generates possibility branches:
├─ Branch A: Catastrophic flooding (30% probability)
├─ Branch B: Controlled flow, minor impact (50%)
└─ Branch C: Unexpected benefit, better irrigation (20%)
    ↓
User/dice selects branch
    ↓
Effects become facts:
├─ If A: Limaria suffers flood damage (new facts)
├─ If B: Diplomatic tension, but manageable (new facts)
└─ If C: Improved agriculture in Sunnaria (new facts)
```

**The system doesn't auto-cascade. It proposes, user decides.**

---

## Validation Timing

**Real-time (while typing):**
- Lightweight checks
- Entity names exist?
- Obvious contradictions?

**Pre-generation:**
- Full constraint package build
- All rules checked
- Context assembled

**Post-generation:**
- Validate LLM output
- Flag violations
- Extract new facts

**At-commit:**
- Full consistency check
- Temporal paradoxes?
- Relationship integrity?
- World lexicon compliance?

---

## What This Enables

**For Roleplay:**
- Characters have realistic knowledge boundaries
- Secrets are actually secret
- Multi-character scenes feel authentic

**For Storytelling:**
- Continuity is enforced
- World feels coherent and deep
- No accidental contradictions

**For World-Building:**
- Geography matters
- Time matters
- Relationships matter
- Effects propagate logically

**For the Author:**
- Focus on creativity, not continuity
- System catches mistakes
- World grows organically
- Staging area prevents accidents

---

## Technology Stack

- **State:** Timeline (events, facts), Map (locations, routes), Calendar
- **Retrieval:** Relationship graph traversal, POV filtering, token budget
- **LLM:** OpenRouter (configurable model)
- **Validation:** Generic rule framework, pluggable validators
- **Storage:** JSON (verbose internal, compact for LLM)
- **UI:** Chat interface, staging area, world explorer

---

## This Is the Vision

A complete constraint engine for world-consistent LLM generation.

See **ROADMAP.md** for how we get there, step by step.
See **CURRENT.md** for where we are now.
See **DECISIONS.md** for why we made key design choices.

Detailed architecture: `/architecture/` folder.
