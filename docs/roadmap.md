---
title: "Roadmap: From Current to Vision"
status: "current"
keywords:
  - "project roadmap"
  - "milestones M1-M18"
  - "validation spikes"
  - "epistemic state M7"
  - "multi-agent orchestration M13"
  - "tool-calling spike M5"
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

**Last updated:** 2026-02-07

**Current position:** M4 complete, extension system complete, ready for validation spikes
**Proof-of-concept target:** M13 (multi-agent orchestration)

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

**This enables M7 (Epistemic State Queries):**
- `getKnowledge(entityId, timestamp)` → facts this entity knows
- No ambiguity about "which Elara"
- Clean foundation for multi-agent (M13)

---

## Milestone Sequencing Strategy

**Priority:** Validate risky assumptions first (spikes), then build epistemic state, then physical constraints.

**Why spikes before building:**
The roadmap previously treated the entire epistemic + tool-calling + ETL + scene generation stack as a single milestone. Analysis revealed two critical unvalidated assumptions that the entire architecture depends on:
1. LLMs will reliably call tools instead of hallucinating values
2. LLMs can reliably extract structured psychological attributes from prose

If either assumption fails, the implementation approach needs fundamental rethinking. Cheap spikes (1-2 days each) validate these before committing months of architecture work. See `decisions.md` for full rationale.

**Critical path to proof-of-concept:**
1. M5: Tool-Calling Spike (validate architecture)
2. M6: Character Extraction Spike (validate ETL quality)
3. M7: Epistemic State Queries ⭐ **FIRST BIG WIN**
4. M8-M12: Tool infrastructure, persistence, ETL, scene generation
5. M13: Multi-Agent Orchestration ⭐ **PROOF-OF-CONCEPT COMPLETE**

**After proof-of-concept:** Add physical constraints, then richness.

---

## Milestone Overview

| # | Milestone | Focus | Status |
|---|-----------|-------|--------|
| 1 | Basic Validation | Entity checking, world boundary | ✅ DONE |
| 2 | Relationship Graph | Entity relationships, graph traversal | ✅ DONE |
| 3 | Timeline Foundation | Chapter-based chronology | ✅ DONE |
| 4 | Events | Source of truth, participation tracking | ✅ DONE |
| 5 | Tool-Calling Spike | Validate LLM tool-calling reliability | 🎯 NEXT |
| 6 | Character Extraction Spike | Validate structured extraction from prose | 🔜 |
| 7 | Epistemic State Queries | POV-filtered knowledge | 🔜 ⭐ |
| 8 | Tool-Calling Infrastructure | getFacts, getKnowledge tools | 🔜 |
| 9 | SQLite Persistence | Durable storage for world state | 🔜 |
| 10 | Lorebook ETL Pipeline | Multi-pass structured extraction | 🔜 |
| 11 | Scene Generation Loop | Generate → validate → extract → commit | 🔜 |
| 12 | Character State Extraction | Equipment, conditions, attitudes from prose | 🔜 |
| 13 | Multi-Agent Orchestration | Separate POV contexts, secrets | 🔜 ⭐ |
| 14 | Basic Geography | Containment, proximity | 🔜 |
| 15 | Travel Validation | Routes, travel time | 🔜 |
| 16 | Full Map System | 2D coordinates, terrain, weather | 🔜 |
| 17 | Calendar System | Full temporal granularity | 🔜 |
| 18 | Unified World Tick | Tiered simulation, ambient progression | 🔜 |

---

## Completed Milestones (M1-M4)

### M1: Basic Validation ✅ DONE

Entity existence checking with fuzzy suggestions, world boundary (anachronism) detection via LLM, validation framework with pluggable rules.

### M2: Relationship Graph ✅ DONE

Bidirectional relationship store, BFS graph traversal with depth/type/direction filtering, integration with context retrieval.

### M3: Timeline Foundation ✅ DONE

Temporal facts with `validFrom`/`validTo`, half-open interval semantics, `getFactsAt(timestamp)` queries.

### M4: Events as Source of Truth ✅ DONE

Events with participants, visibility levels (private/restricted/public), outcomes linking to facts, `getFactsFromEvent` extraction.

### Extension System ✅ DONE

Config-driven 6-stage pipeline, dependency-aware wave activation, config write-back, contribution aggregation, required slot validation. See `decisions.md` for architecture details.

---

## Phase 0: Validate Assumptions (M5-M6)

These spikes are cheap experiments (1-2 days each) that validate the two riskiest architectural assumptions before committing to full implementation.

### M5: Tool-Calling Spike 🎯 NEXT

**Goal:** Determine whether LLMs reliably call world-state tools instead of hallucinating values.

**Why this matters:** The entire post-M7 architecture (tool-calling infrastructure, scene generation, validation) assumes LLMs will call `getFacts`/`getKnowledge` before generating numeric values. If they skip tools and hallucinate, the constraint engine concept needs a different enforcement mechanism.

**What to build:**
- Minimal tool definitions: `getFacts(entityId)` and `getRelationships(entityId)`
- Hard-coded fact data for 2-3 Excelsia entities (Sunnaria economy, Aradia, Alaric)
- Test harness that sends scene prompts requiring factual queries
- Metrics collection: tool call rate, accuracy, model comparison

**Test scenarios:**
1. "Aradia considers raising the grain tariff" → must call `getFacts("sunnaria-economy")` to get current rate
2. "Alaric reviews the kingdom's military readiness" → must call `getFacts("sunnaria-kingdom")`
3. "A merchant discusses trade routes" → should call `getRelationships("sunnaria-economy")`
4. Free-form scene with no obvious fact need → should NOT hallucinate specific numbers

**Measure across models:**
- OpenRouter free tier (current default)
- Claude Sonnet
- Claude Opus
- Any other models of interest

**Success criteria:**
- At least one model tier achieves >90% tool call rate for fact-dependent prompts
- Tool responses are used verbatim (not paraphrased with wrong values)
- Model tier needed for reliable tool-calling is identified and documented

**Failure response:**
- If no model reliably calls tools: investigate hybrid approach (pre-inject critical facts as context, use tools for secondary queries)
- If tool calls happen but values are paraphrased: investigate structured output enforcement
- Document findings in `decisions.md` regardless of outcome

**Enables:** M8 (Tool-Calling Infrastructure), M11 (Scene Generation Loop)

---

### M6: Character Extraction Spike

**Goal:** Determine whether LLMs can reliably extract structured psychological and physical attributes from lorebook prose.

**Why this matters:** The Lorebook ETL Pipeline (M10) assumes an LLM can extract goals, motivations, fears, values, physical attributes, and relationships from narrative prose. If extraction quality is too low, the entire multi-pass ETL approach needs rethinking.

**What to build:**
- Extraction prompt that requests structured JSON output for a single lorebook entry
- Test against 5-10 Excelsia entries spanning different categories (characters, kingdoms, economies)
- Quality evaluation framework (precision, recall, consistency across runs)

**Test scenarios:**
1. **Character extraction:** Princess Aradia entry → extract goals, motivations, fears, physical attributes, skills, relationships
2. **Kingdom extraction:** Sunnaria entry → extract population estimates, military strength, borders, political relationships
3. **Economy extraction:** Sunnarian Economy entry → extract trade volume, tariff rates, key resources
4. **Cross-entity consistency:** Extract all 8+ kingdoms → do they get consistent attribute schemas?
5. **Inferred values:** "thriving economy" → does the LLM produce reasonable numeric estimates?

**Evaluation criteria:**
- **Structural completeness:** Does it extract all major attributes mentioned in prose?
- **Factual accuracy:** Do extracted values match what the prose actually says?
- **Inference quality:** Are inferred numeric values reasonable and consistent?
- **Cross-run stability:** Same entry extracted twice → similar results?
- **Cross-entity consistency:** All kingdoms get population, military-strength, borders?

**Success criteria:**
- Character extraction captures >80% of attributes mentioned in prose
- Inferred numeric values are consistent across multiple runs (within 20% variance)
- Cross-entity schema consistency >70% (kingdoms share common attributes)

**Failure response:**
- If extraction is unreliable: investigate human-in-the-loop ETL (LLM proposes, human confirms)
- If schema consistency is poor: investigate providing schema templates per category
- If inference quality is low: investigate extracting only explicit facts, skip inferred values
- Document findings in `decisions.md` regardless of outcome

**Enables:** M10 (Lorebook ETL Pipeline), M12 (Character State Extraction)

---

## Phase 1: Character Knowledge (M7-M13)

**Goal:** Enable realistic character knowledge boundaries in roleplay scenarios.

### M7: Epistemic State Queries ⭐ FIRST BIG WIN

**Goal:** Track what each character knows based on event participation and visibility. This is the core differentiator — no existing tool does this.

**What to build:**
- `getKnowledge(characterId, timestamp)` query function
- Participation-based filtering (events character was at)
- Visibility-based filtering (public events everyone knows)
- Reveal/conceal mechanism (told about something / hidden from)

**Algorithm:**
```
1. Get events character participated in (up to timestamp)
2. Get public events (everyone knows)
3. Get revealed events (someone told them)
4. Subtract concealed events
5. Extract facts and entity IDs from known events
```

**Test cases (ZOMBIES):**
- Zero: Character with no events → empty knowledge
- One: Character participated in one event → knows it
- Many: Character at multiple events → knows all
- Boundary: Event at exact timestamp, public vs private visibility
- Interface: API returns events, facts, entities in clean structure
- Exception: Unknown character ID
- Simple: Secret war council — King knows, Princess doesn't

**Success criteria:**
- Create private event (Secret War Council) with King as participant
- `getKnowledge("aradia", timestamp)` → doesn't include it
- `getKnowledge("alaric", timestamp)` → includes it
- Public events visible to all characters

**Enables:** M8 (tools wrap epistemic queries), M13 (multi-agent needs POV filtering)

**Detailed design:** See `architecture/core/08-epistemic-state.md`

---

### M8: Tool-Calling Infrastructure

**Goal:** Expose world-state queries as LLM tools with deterministic responses.

**Depends on:** M5 (spike validates approach), M7 (epistemic queries exist to wrap)

**What to build:**
- Tool definitions: `getFacts`, `getKnowledge`, `getRelationships`, `searchEntities`
- Tool execution layer (receives tool call, routes to store, returns result)
- Tool enforcement wrapper (system prompt + validation that tools were called)
- Integration with OpenRouter client

**Tools API:**
```typescript
getFacts(entityId, timestamp?) → { property: value } map
getKnowledge(characterId, timestamp) → { events, facts, entities }
getRelationships(entityId, types?) → Relationship[]
searchEntities(query) → EntitySummary[]
```

**Success criteria:**
- LLM calls `getFacts("sunnaria-economy")` → gets `{ "grain-tariff": 0.15, ... }`
- LLM uses exact returned values in generated prose
- Validation rejects outputs that reference numeric values without tool calls

**Enables:** M11 (scene generation uses tools), M13 (multi-agent uses filtered tools)

---

### M9: SQLite Persistence

**Goal:** Durable storage for world state. Replace in-memory stores with SQLite-backed stores.

**What to build:**
- SQLite schema for entities, facts, relationships, events
- SQLite store implementations (same interfaces as memory stores)
- JSON snapshot export/import for human inspection
- Migration utilities

**File structure:**
```
worlds/
  excelsia/
    excelsia.db              # SQLite runtime database
    source/                  # Original lorebook files (read-only)
    snapshots/               # Human-readable JSON backups
```

**Success criteria:**
- All existing tests pass with SQLite stores swapped in
- Fact queries perform <100ms
- JSON snapshot matches database content
- Data survives process restart

**Enables:** M10 (ETL needs persistent storage), M11 (scene loop commits to durable store)

**Detailed design:** See `architecture/core/06-storage-format.md`

---

### M10: Lorebook ETL Pipeline

**Goal:** Transform lorebook prose into comprehensive structured data via multi-pass LLM extraction.

**Depends on:** M6 (spike validates extraction quality), M9 (SQLite for persistence)

**What to build:**
- Pass 1: Entity categorization (character, kingdom, economy, etc.)
- Pass 2: Schema discovery (common attributes per category)
- Pass 3: Comprehensive fact extraction (explicit + inferred values)
- Pass 4: Relationship extraction (name → ID resolution)
- Pass 5: Persist to SQLite + create JSON snapshot

**Entity categories (auto-detected):**
- `character` — persons (Aradia, Alaric)
- `kingdom` — places (Sunnaria, Lunaria)
- `economy` — abstract systems (Sunnarian Economy)
- `weather` — environmental state
- `magic-system` — abstract concepts
- `faction` — groups (Merchant Guild)

**Character extraction includes psychological depth:**
- Physical attributes (height, strength, age)
- Goals and motivations (what they want, why)
- Fears and internal conflicts
- Values and beliefs
- Skills and capabilities

**Success criteria:**
- All 106 Excelsia lorebook entries → entities in SQLite
- ~500-1000 facts extracted (including inferred values)
- Relationship graph populated
- All kingdoms share consistent attribute schema
- JSON snapshot readable and accurate

**Enables:** M11 (rich data for scene generation), M12 (character model for extraction)

**Detailed design:** See `architecture/future/10-import-pipeline.md`

---

### M11: Scene Generation Loop

**Goal:** Close the generate → validate → extract → commit loop.

**Depends on:** M8 (tools), M9 (persistence), M10 (rich data)

**What to build:**
- Scene setup (participants, location, timestamp, POV character)
- Minimal context assembly (entity IDs + tools, not full prose)
- LLM generation with tool calling
- Output validation (fact consistency, world boundary, epistemic)
- Fact extraction from generated prose
- Staging area for human review
- Commit approved facts to timeline

**Scene flow:**
```
1. Scene Setup → participants, location, timestamp
2. Build Minimal Context → entity IDs, tools, world fundamentals
3. LLM Generates (with tool calls) → prose
4. Validate → fact consistency, world boundary, epistemic
5. Extract New Facts → parse prose for state changes
6. Stage for Review → user approves/rejects
7. Commit to Timeline → facts with temporal bounds
```

**Success criteria:**
- Scene: "Aradia considers raising tariffs"
- LLM calls `getFacts("sunnaria-economy")` → gets `grain-tariff: 0.15`
- LLM generates prose using 0.15, not hallucinated value
- New facts extracted and committed to timeline
- Round-trip works: next scene queries updated facts

**Enables:** M12 (character state extraction post-scene), M13 (multi-agent scenes)

**Detailed design:** See `architecture/future/09-scene-execution.md`

---

### M12: Character State Extraction

**Goal:** Extract comprehensive character state changes from scene prose.

**Depends on:** M6 (spike validates extraction), M11 (scenes to extract from)

**What to build:**
- Post-scene analysis: LLM extracts state changes per character
- Categories: physical condition, equipment, appearance, mood, attitudes
- Human review workflow (show extracted facts, approve/edit/reject)
- Consistency validation (clothing color changes, physical constraints)
- Commit approved changes to timeline

**What to extract:**
- Physical condition (injuries, exhaustion, environmental effects)
- Equipment changes (damage, acquisition, loss)
- Appearance changes (clothing, visible wounds)
- Social/emotional changes (attitude shifts, mood)
- Status effects (poisoned, blessed, cursed)

**Success criteria:**
- Scene: Character's shoe damaged → equipment fact extracted
- Scene: Red tunic → later green tunic → contradiction flagged
- Scene: Character exhausted → fact persists into next scene
- Validation: Short character can't reach high table → violation flagged

**Enables:** M13 (character state feeds multi-agent context)

---

### M13: Multi-Agent Orchestration ⭐ PROOF-OF-CONCEPT COMPLETE

**Goal:** Generate scenes with multiple characters who have different knowledge. Each character gets POV-filtered context.

**Depends on:** M7 (epistemic queries), M8 (tools), M11 (scene generation)

**What to build:**
- Multi-agent scene setup (multiple characters, each with POV context)
- Orchestrated dialogue generation (character A speaks, B responds)
- Knowledge tracking during scene (A reveals X to B → update B's knowledge)
- Merge individual outputs into coherent scene

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
- If King mentions "northern strategy" → system flags as revealed to Aradia

**This is the proof-of-concept decision point.** If epistemic isolation works in multi-agent scenes, the core vision is validated.

**Enables:** Realistic roleplay with secrets, complex multi-character scenes

**Detailed design:** See `architecture/future/09-scene-execution.md` §9.3-9.4

---

## Phase 2: Physical Constraints (M14-M15)

**Goal:** Add spatial validation and prevent impossible character movement.

### M14: Basic Geography

**Goal:** Locations with containment hierarchy. "X is in Y" relationships.

**What to build:**
- Location type (entity subtype with spatial properties)
- Containment relationships (`part-of`, `located-in`)
- Proximity queries ("what's near X?")
- Location context for scenes

**Success criteria:**
- "Royal Gardens" is `part-of` "Sunnaria"
- Query "What's in Sunnaria?" → [Palace, Royal Gardens, Market District, ...]
- Scene in Royal Gardens → context includes Sunnaria

**Detailed design:** See `architecture/core/04-containment.md`

---

### M15: Travel Validation

**Goal:** Routes between locations, travel time validation. Characters can't teleport.

**What to build:**
- Route type: from/to locations, travel time
- Travel time calculation
- Validation rule: "Can character X be at location Y at timestamp Z?"

**Success criteria:**
- Route: Sunnaria ↔ Ilaria (7 days)
- Aradia in Sunnaria Day 1, in Ilaria Day 9 → ✅ (plausible)
- Aradia in Sunnaria Day 1, in Ilaria Day 3 → ❌ (impossible)

**Detailed design:** See `architecture/future/16-map-spatial-system.md` §16.7

---

## Phase 3: Advanced Features (M16-M18)

**Goal:** Add richness and depth to the world model.

### M16: Full Map System

2D coordinates, terrain types, weather system, advanced route calculation. See `architecture/future/16-map-spatial-system.md`.

### M17: Calendar System

Full temporal granularity (year → season → month → day → hour), custom calendars per world, seasonal constraints. See `architecture/future/15-calendar-time-system.md`.

### M18: Unified World Tick & Ambient Simulation

Tiered simulation where ALL entities progress every timestamp at varying detail levels:
- **Focus** (full scenes), **Intentional** (off-screen with goals), **Passive** (background drift), **System** (automatic rules)
- Intent management for off-screen goal pursuit
- Relevance-based optimization (only simulate graph neighbors)
- Dynamic tier transitions

See `architecture/future/03-effects.md`, `architecture/future/09-scene-execution.md` §9.5-9.6, and `decisions.md` (Unified World Tick).

---

## Milestone Dependencies

```
M1 ✅ ─► M2 ✅ ─► M3 ✅ ─► M4 ✅
                               │
                     ┌─────────┼─────────┐
                     ▼         ▼         ▼
                M5 (Tool      M6 (Char   M7 (Epistemic
                Spike) 🎯     Extract    Queries) ⭐
                     │        Spike)          │
                     ▼         │              │
                M8 (Tool       │         ┌────┘
                Infra)         ▼         │
                     │    M9 (SQLite) ◄──┘
                     │         │
                     │    M10 (ETL) ◄── M6
                     │         │
                     ▼         ▼
                M11 (Scene Generation) ◄── M8
                     │
                     ▼
                M12 (Char State Extraction) ◄── M6
                     │
                     ▼
                M13 (Multi-Agent) ⭐ PROOF-OF-CONCEPT
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
      M14 (Geography)    M16 (Map)
           │                   │
           ▼                   ▼
      M15 (Travel)       M17 (Calendar)
                               │
                               ▼
                          M18 (World Tick)
```

**Critical path:** M4 → M5 → M8 → M11 → M13
**Parallel tracks:**
- M6 can run alongside M5
- M7 can start after M4 (doesn't need spikes)
- M9 can start after M7
- M14-M15 and M16-M18 are independent tracks after M13

---

## Evaluation Points

### After M5-M6 (Spikes) — ARCHITECTURE DECISION POINT

**Evaluate:**
- Does tool-calling work reliably? At what model tier?
- Does character extraction produce usable structured data?
- Do we proceed as planned, adjust approach, or pivot?

**Decisions:**
- ✅ Both spikes succeed: Proceed with M7-M13
- ⚠️ Tool-calling unreliable: Investigate hybrid context-stuffing + tools
- ⚠️ Extraction poor: Investigate human-in-the-loop ETL
- ❌ Both fail: Fundamental architecture rethink needed

### After M13 (Proof-of-Concept) — CRITICAL DECISION POINT

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
- ✅ If successful: Continue to M14-M18
- ⚠️ If mixed: Adjust approach, iterate on M7-M13
- ❌ If unsuccessful: Pivot architecture or tooling

### After M15 (Physical Constraints)

**Evaluate:** Is spatial validation adding value? Travel time working?

### After M18 (Full Vision)

**Evaluate:** Full constraint package working? Production-ready?

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

## Future Features (Post-M18)

### Anticipatory Context Injection

Pre-inject context based on conversation trajectory before topics are explicitly mentioned. Requires conversation history analysis and scene classification. Consider after M13.

---

## See also
- [current.md](./current.md)
- [vision.md](./vision.md)
- [decisions.md](./decisions.md)
- [08-epistemic-state.md](./architecture/core/08-epistemic-state.md)
- [16-map-spatial-system.md](./architecture/future/16-map-spatial-system.md)
