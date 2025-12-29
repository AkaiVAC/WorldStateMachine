# World State Constraint Engine - Architecture

**Last updated:** 2025-12-29

This repository contains the architecture and implementation for a constraint engine that enables LLMs to generate world-consistent prose for roleplay and storytelling.

**The system is a digital script supervisor:** It maintains external world state (Timeline, Map, Calendar) and builds constraint packages that prevent LLMs from generating impossible or inconsistent prose.

---

## Quick Start

**New to this project?** Start here:

1. **[VISION.md](vision.md)** - What we're building (the full constraint engine)
2. **[CURRENT.md](current.md)** - Where we are now (M1 complete, 114 tests)
3. **[ROADMAP.md](roadmap.md)** - How we get there (M1-M11 milestones)
4. **[DECISIONS.md](decisions.md)** - Why we made key design choices

**Development guidelines:** See [CLAUDE.md](../CLAUDE.md) for TDD workflow, code style, testing strategy.

---

## Project Status

**Current milestone:** M1 complete, starting M2 (Relationship Graph)
**Tests passing:** 114 (113 pass, 1 error)
**Timeline to vision:** 5-7 months
**Proof-of-concept target:** M6 (epistemic state + multi-agent orchestration) - 2.5-4 months

See **[CURRENT.md](current.md)** for detailed implementation status.

---

## The Three Pillars

The system rests on three foundational pillars that work together to constrain LLM generation:

1. **Timeline** (§2, §6, §8) - Events with epistemic state, facts with temporal bounds
2. **Map** (§4, §16) - 2D geography, routes, travel physics, weather systems
3. **Calendar** (§15) - Full temporal granularity (chapter → year → day → hour)

These pillars feed into a **constraint package** that ensures LLM output is world-consistent.

See **[VISION.md](vision.md)** for how these pillars work together.

---

## Key Architectural Decisions (Summary)

1. **Primary use case: Constrain LLM generation** - System builds constraint packages that prevent impossible/inconsistent prose
2. **Timeline is the database** - Entities are derived views from facts with temporal bounds
3. **Events are source of truth** - Facts are materialized views from events; original prose preserved alongside extracted data
4. **Map is first-class** - 2D geography with coordinates, routes, terrain, weather—not just metadata
5. **Calendar provides temporal fidelity** - Chapter-based initially, expandable to full granularity
6. **Effects: sticky vs cascading** - Computable effects at query-time (sticky), narrative effects at write-time (cascading)
7. **Epistemic state via events, always query** - Never cache knowledge state; compute fresh from participation + visibility
8. **Generic constraint framework** - Extensible validation rules, not hardcoded physics
9. **Containment provides proximity** - Geographic hierarchy handles "nearby" relationships automatically
10. **Store everything, tier for retrieval** - Lead/supporting/role/ambient priorities
11. **Store verbose, render compact** - Internal structure for queries, token-efficient format for LLM
12. **Environmental data is first-class** - Climate, weather, terrain, flora, fauna enable consistency and recall
13. **Scenes are commit units** - Facts go through staging before entering canonical timeline (git for world state)
14. **Partial inference** - Structural relationships auto-accept, semantic implications ask first, causal never inferred
15. **Flags for contradictions, not variations** - Author's prose is source of truth
16. **World-boundary consistency** - Catches real-world references via World Lexicon
17. **Validation timing is configurable** - Lightweight real-time, full at commit, pre/post generation
18. **Scene execution supports isolation** - POV-driven for most scenes, multi-agent for secret-heavy scenes
19. **Alive world through constrained randomness** - Ambient generation adds flavor within timeline constraints
20. **Profile-driven optimization** - Brute force + basic indexing first, optimize bottlenecks after measurement

See **[DECISIONS.md](decisions.md)** for rationale behind key decisions.

---

## Quick Reference

### Fact Structure
```
{
  subject: "Aldric",
  property: "title",
  value: "King",
  validFrom: "Chapter 1",
  validTo: null,
  tier: "lead",
  source: "coronation-event"
}
```

### Event Structure
```
Event: "Council Meeting"
├── participants: [King, Advisor]
├── hidden-participants: [Spy]
├── location: Throne Room
├── time: Chapter 5
├── visibility: private | court | public | [group-name]
├── concealed-from: [Princess]
├── reveals: [prior-event-refs]
└── outcomes: [extracted facts]
```

### Visibility Levels
| Level | Who Knows |
|-------|-----------|
| private | Only participants |
| [group] | Group members (e.g., war-council) |
| court | Anyone at court |
| public | Common knowledge |

### Entity Tiers
| Tier | Examples | Retrieval Priority |
|------|----------|-------------------|
| lead | Main characters | Always included |
| supporting | Named NPCs | High priority |
| role | "The guards" | Medium priority |
| ambient | Crowd, background | Low priority |

---

## Current File Structure (Actual Implementation)

```
src/
├── world-state/          # Core data model
│   ├── fact/             # Facts: subject/property/value (NO temporal bounds yet)
│   │   ├── fact.ts
│   │   ├── fact-store.ts
│   │   └── fact-store.test.ts
│   ├── entity/           # Entities: id/name/aliases/group
│   │   ├── entity.ts
│   │   ├── entity-store.ts
│   │   ├── entity-store.test.ts
│   │   ├── entity-view.ts
│   │   └── entity-view.test.ts
│   └── lexicon/          # World vocabulary tracking
│       ├── lexicon.ts
│       └── lexicon.test.ts
│
├── import/               # Getting data in
│   ├── silly-tavern-importer.ts
│   ├── silly-tavern-importer.test.ts
│   └── __fixtures__/
│
├── validation/           # Constraint checking
│   ├── validator.ts
│   ├── validator.test.ts
│   ├── entity-exists-rule.ts
│   ├── entity-exists-rule.test.ts
│   ├── world-boundary-rule.ts
│   └── world-boundary-rule.test.ts
│
├── llm/                  # LLM integration
│   ├── openrouter.ts
│   └── openrouter.test.ts
│
├── retrieval/            # Context retrieval
│   ├── keyword-matcher.ts
│   ├── keyword-matcher.test.ts
│   ├── entity-matcher.ts
│   ├── entity-matcher.test.ts
│   ├── lorebook-entry.ts
│   └── lorebook-loader.ts
│
├── analysis/             # Prompt analysis
│   ├── prompt-analyzer.ts
│   └── prompt-analyzer.test.ts
│
├── ui/                   # Chat interface
│   ├── server/           # HTTP server, routing
│   ├── routes/           # API routes (chat, models, lorebook, sessions)
│   └── public/           # Frontend (components, utilities)
│
└── integration.test.ts   # Full pipeline tests
```

**Note:** This is the ACTUAL structure. The architecture docs describe a PLANNED structure that's more comprehensive.

---

## Detailed Architecture Documentation

The `architecture/` folder contains detailed design documents for all system components.

**Note:** Many of these describe **future systems** not yet implemented. See **[CURRENT.md](current.md)** for what actually works now.

| Section | File | Description | Status |
|---------|------|-------------|--------|
| 1. Problem Statement | [01-problem.md](architecture/core/01-problem.md) | Core problem: constraining LLM generation | 📖 Reference |
| 2. Timeline-Centric | [02-timeline-centric.md](architecture/core/02-timeline-centric.md) | Facts, temporal bounds, consistency checking | 🟡 Partial (facts yes, temporal no) |
| 3. Effects | [03-effects.md](architecture/core/03-effects.md) | Effects as data, sticky vs cascading propagation | 🔜 Future |
| 4. Containment | [04-containment.md](architecture/core/04-containment.md) | Geographic hierarchy, environmental properties | 🔜 Future |
| 5. World vs Scene State | [05-world-scene-state.md](architecture/core/05-world-scene-state.md) | Persistent vs ephemeral, staging model | 🔜 Future |
| 6. Storage Format | [06-storage-format.md](architecture/core/06-storage-format.md) | Store verbose, render compact, prose preservation | 🟡 Partial |
| 7. Entity Tiers | [07-entity-tiers.md](architecture/core/07-entity-tiers.md) | Lead, supporting, role, ambient | 🔜 Future |
| 8. Epistemic State | [08-epistemic-state.md](architecture/core/08-epistemic-state.md) | Who knows what, always query (no cache) | 🔜 Future |
| 9. Scene Execution | [09-scene-execution.md](architecture/core/09-scene-execution.md) | POV-driven, multi-agent, ambient generation | 🔜 Future |
| 10. Import Pipeline | [10-import-pipeline.md](architecture/core/10-import-pipeline.md) | NLP, inference tiers, human review | 🟡 Partial (SillyTavern only) |
| 11. Query Pipeline | [11-query-pipeline.md](architecture/core/11-query-pipeline.md) | Deterministic retrieval, focus-based priority | 🟡 Partial (basic retrieval) |
| 12. Prior Art | [12-prior-art.md](architecture/core/12-prior-art.md) | Temporal knowledge graphs, event sourcing | 📖 Reference |
| 13. Open Questions | [13-open-questions.md](architecture/core/13-open-questions.md) | Resolved and still open | 📖 Reference |
| 14. MVP Scope | [14-mvp-scope.md](architecture/core/14-mvp-scope.md) | Initial implementation scope | ✅ Complete (needs update) |
| 15. Calendar & Time | [15-calendar-time-system.md](architecture/core/15-calendar-time-system.md) | Time granularity, calendar systems, temporal fidelity | 🔜 Future |
| 16. Map & Spatial | [16-map-spatial-system.md](architecture/core/16-map-spatial-system.md) | 2D maps, routes, travel physics, weather systems | 🔜 Future |
| 17. Constraints & Validation | [17-constraint-validation-system.md](architecture/core/17-constraint-validation-system.md) | Generic constraint framework, validation pipeline | 🟡 Partial |

**Legend:**
- ✅ Complete and implemented
- 🟡 Partially implemented
- 🔜 Future (not yet started)
- 📖 Reference (background material)

---

## See Also

- **[VISION.md](vision.md)** - Complete vision for the constraint engine
- **[CURRENT.md](current.md)** - Current implementation status (what actually works)
- **[ROADMAP.md](roadmap.md)** - Milestone-by-milestone path from current to vision
- **[DECISIONS.md](decisions.md)** - Rationale behind key design decisions
- **[CLAUDE.md](../CLAUDE.md)** - Development workflow, TDD, code style
- **[notes/context-injection-analysis.md](notes/context-injection-analysis.md)** - Latest testing and analysis
