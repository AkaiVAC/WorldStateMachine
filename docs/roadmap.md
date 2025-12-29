# Roadmap: From Current to Vision

**Last updated:** 2025-12-29
**Current position:** M1 complete, starting M2
**Estimated timeline:** 5-7 months to full vision
**Proof-of-concept target:** M6 (epistemic state + multi-agent)

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
| 2 | Relationship Graph | Entity relationships, graph traversal | 2-3 weeks | 🎯 NEXT |
| 3 | Timeline Foundation | Chapter-based chronology | 1-2 weeks | 🔜 |
| 4 | Events | Source of truth, participation tracking | 2-3 weeks | 🔜 |
| 5 | Epistemic State | POV-filtered knowledge | 3-4 weeks | 🔜 ⭐ |
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

### M2: Relationship Graph 🎯 NEXT

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

### M3: Timeline Foundation

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

### M4: Events as Source of Truth

**Estimated effort:** 2-3 weeks

**Goal:** Track events that generate facts, record participation, preserve original prose.

**What to build:**
- `Event` type: timestamp, participants, location, visibility, outcomes (facts)
- `EventStore` with queries by time, participant, location
- Original prose storage (prose → event → facts)
- Fact generation from events
- Participation tracking

**Deliverables:**
- `src/world-state/event/event.ts` - Event type
- `src/world-state/event/event-store.ts` - Store and query
- `src/world-state/event/event-store.test.ts` - Tests
- Integration: Events generate facts

**Event structure:**
```typescript
type Event = {
  id: string;
  worldId: string;
  timestamp: string;          // "Chapter 5"
  title: string;              // "Secret War Council"
  location: string;           // Entity ID for location
  participants: string[];     // Entity IDs
  hiddenParticipants: string[]; // Observers not known to others
  visibility: Visibility;     // "private" | "court" | "public" | group name
  concealedFrom: string[];    // Entity IDs who shouldn't know
  reveals: string[];          // Event IDs revealed during this event
  outcomes: Fact[];           // Facts extracted from this event
  prose: string;              // Original prose
};
```

**Test cases:**
- Create event with participants
- Query events by participant
- Query events at specific timestamp
- Event generates facts with correct temporal bounds
- Visibility levels (private, court, public)

**Success criteria:**
- Event: "Coronation of King Alaric" (Chapter 1, public)
- Participants: [Alaric, High Priest, Court]
- Outcomes: [{subject: "Alaric", property: "title", value: "King", validFrom: "Chapter 1"}]
- Query: "What events was Alaric in?" → includes Coronation

**Enables:** Epistemic state (who was at which events)

**Detailed design:** See `architecture/core/02-timeline-centric.md` §2.2, `architecture/core/08-epistemic-state.md`

---

### M5: Epistemic State ⭐ FIRST BIG WIN

**Estimated effort:** 3-4 weeks

**Goal:** Track what each character knows based on event participation and visibility. Enable POV-filtered context retrieval.

**What to build:**
- Knowledge queries: `getKnowledge(characterId, timestamp)` → events + facts they know
- Participation-based knowledge (if you were there, you know)
- Visibility-based knowledge (public events, court events, group events)
- `reveals` mechanism (learning about past events)
- `concealedFrom` mechanism (explicitly hiding from someone)
- POV-filtered context retrieval

**Deliverables:**
- `src/world-state/epistemic/knowledge-query.ts` - Knowledge retrieval
- `src/world-state/epistemic/knowledge-query.test.ts` - Tests
- `src/retrieval/pov-filter.ts` - POV-filtered context for LLM
- `src/retrieval/pov-filter.test.ts` - Tests

**Test cases:**
- Character participated in event → knows about it
- Character didn't participate, event is public → knows about it
- Character didn't participate, event is private → doesn't know
- Event reveals prior event → character learns about past
- Event concealed-from character → doesn't know even if public

**Success criteria:**
- Event 1: "Secret War Council" (Chapter 5, private, participants: [King, General])
- Event 2: "Ball" (Chapter 5, public)
- Query: "What does Princess Aradia know at Chapter 6?"
  - ✅ Includes Ball (public)
  - ❌ Doesn't include War Council (private, she wasn't there)
- Generate scene from Aradia's POV → LLM context doesn't include War Council

**Enables:** Multi-agent orchestration, realistic roleplay

**Detailed design:** See `architecture/core/08-epistemic-state.md`

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

## Next Steps

**Immediate:** Start M2 (Relationship Graph)

1. Read `architecture/core/04-containment.md` (containment is a relationship type)
2. Design `Relationship` type and `RelationshipStore`
3. Apply ZOMBIES, write `test.todo()` cases
4. Implement one test at a time
5. Integrate with context retrieval

**See also:**
- `vision.md` - What we're building toward
- `current.md` - Where we are now
- `DECISIONS.md` - Why we made key design choices
