# Lorebook Manager - Architecture Design Document

This document captures the architectural decisions for building a world state management system for AI-assisted storytelling.

**The system is a digital script supervisor:** It knows what's true when, surfaces what matters for each scene, and flags inconsistencies before they become story problems.

---

## Document Structure

| Section | File | Description |
|---------|------|-------------|
| 1. Problem Statement | [01-problem.md](architecture/01-problem.md) | Core problem: constraining LLM generation |
| 2. Timeline-Centric | [02-timeline-centric.md](architecture/02-timeline-centric.md) | Facts, temporal bounds, consistency checking |
| 3. Effects | [03-effects.md](architecture/03-effects.md) | Effects as data, sticky vs cascading propagation |
| 4. Containment | [04-containment.md](architecture/04-containment.md) | Geographic hierarchy, environmental properties |
| 5. World vs Scene State | [05-world-scene-state.md](architecture/05-world-scene-state.md) | Persistent vs ephemeral, staging model |
| 6. Storage Format | [06-storage-format.md](architecture/06-storage-format.md) | Store verbose, render compact, prose preservation |
| 7. Entity Tiers | [07-entity-tiers.md](architecture/07-entity-tiers.md) | Lead, supporting, role, ambient |
| 8. Epistemic State | [08-epistemic-state.md](architecture/08-epistemic-state.md) | Who knows what, always query (no cache) |
| 9. Scene Execution | [09-scene-execution.md](architecture/09-scene-execution.md) | POV-driven, multi-agent, ambient generation |
| 10. Import Pipeline | [10-import-pipeline.md](architecture/10-import-pipeline.md) | NLP, inference tiers, human review |
| 11. Query Pipeline | [11-query-pipeline.md](architecture/11-query-pipeline.md) | Deterministic retrieval, focus-based priority |
| 12. Prior Art | [12-prior-art.md](architecture/12-prior-art.md) | Temporal knowledge graphs, event sourcing |
| 13. Open Questions | [13-open-questions.md](architecture/13-open-questions.md) | Resolved and still open |
| 14. MVP Scope | [14-mvp-scope.md](architecture/14-mvp-scope.md) | What to build first, file structure |
| 15. Calendar & Time | [15-calendar-time-system.md](architecture/15-calendar-time-system.md) | Time granularity, calendar systems, temporal fidelity |
| 16. Map & Spatial | [16-map-spatial-system.md](architecture/16-map-spatial-system.md) | 2D maps, routes, travel physics, weather systems |
| 17. Constraints & Validation | [17-constraint-validation-system.md](architecture/17-constraint-validation-system.md) | Generic constraint framework, validation pipeline |

---

## Three Pillars

The system rests on three foundational pillars that work together to constrain LLM generation:

1. **Timeline** (§2, §6, §8) - Events with epistemic state, facts with temporal bounds
2. **Map** (§4, §16) - 2D geography, routes, travel physics, weather systems
3. **Calendar** (§15) - Full temporal granularity (epochs → years → days → minutes)

These pillars feed into a **constraint package** that ensures LLM output is world-consistent.

## Key Architectural Decisions (Summary)

1. **Primary use case: Constrain LLM generation** - System builds constraint packages that prevent impossible/inconsistent prose
2. **Timeline is the database** - Entities are derived views from facts with temporal bounds
3. **Events are source of truth** - Facts are materialized views from events; original prose preserved alongside extracted data
4. **Map is first-class** - 2D geography with coordinates, routes, terrain, weather—not just metadata
5. **Calendar provides temporal fidelity** - Full granularity (epoch → era → year → season → month → day → hour → minute)
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

---

## Quick Reference

### Fact Structure
```
{
  subject: "Aldric",
  property: "title",
  value: "King",
  validFrom: 10,
  validTo: null,
  tier: "lead",
  source: "chapter-1"
}
```

### Event Structure
```
Event: "Council Meeting"
├── participants: [King, Advisor]
├── hidden-participants: [Spy]
├── location: Throne Room
├── time: Year 20, Day 15
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

## File Structure (Implementation)

```
src/
├── timeline/
│   ├── fact.ts           # Fact type
│   ├── timeline.ts       # Timeline operations
│   └── consistency.ts    # Conflict detection
├── entity/
│   └── view.ts           # Compute entity view from facts
├── epistemic/
│   ├── knowledge.ts      # Character knowledge queries
│   └── visibility.ts     # Visibility level logic
├── importer/
│   └── sillytavern/
│       └── parser.ts     # Parse SillyTavern JSON to facts
├── retrieval/
│   ├── context.ts        # Context retrieval for LLM prompts
│   └── pov.ts            # POV-scoped filtering
├── effects/
│   ├── propagation.ts    # Identify affected entities
│   └── templates.ts      # Common effect patterns
└── explorer/
    ├── tree/             # Hierarchical navigation
    └── graph/            # Visual relationship graph
```
