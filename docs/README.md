# World State Constraint Engine - Architecture

This repository contains the architecture and implementation for a constraint engine that enables LLMs to generate world-consistent prose for roleplay and storytelling.

**The system is a digital script supervisor:** It maintains external world state (Timeline, Map, Calendar) and builds constraint packages that prevent LLMs from generating impossible or inconsistent prose.

---

## Quick Start

**New to this project?** Start here:

1. **[vision.md](vision.md)** - What we're building (the full constraint engine)
2. **[current.md](current.md)** - Where we are now (implementation status)
3. **[roadmap.md](roadmap.md)** - How we get there (M1-M11 milestones)
4. **[decisions.md](decisions.md)** - Why we made key design choices

**Development guidelines:** See [CLAUDE.md](../CLAUDE.md) for TDD workflow, code style, testing strategy.

**Run tests:** `bun test`

---

## The Three Pillars

The system rests on three foundational pillars that work together to constrain LLM generation:

1. **Timeline** - Events with epistemic state, facts with temporal bounds
2. **Map** - 2D geography, routes, travel physics, weather systems
3. **Calendar** - Full temporal granularity (chapter → year → day → hour)

These pillars feed into a **constraint package** that ensures LLM output is world-consistent.

See **[vision.md](vision.md)** for how these pillars work together.

---

## Architecture

The project uses a **config-driven extension architecture** where extensions are organized into 6 stages.

```
extensions.json                # Central config listing enabled extensions per stage

extensions/
└── core/                    # Standard implementation (split by stage)
    ├── 1-load-world-data/       # SillyTavern and other data loaders
    ├── 2-store-timeline/        # Fact, Event, Entity, Relationship stores
    ├── 3-validate-consistency/  # Entity exists, world boundary validation
    ├── 4-build-scene-context/   # Keyword/entity matching, graph expansion
    ├── 5-send-scene-context/    # OpenRouter / LLM clients
    └── 6-provide-ui/            # Dev Chat interface

src/
├── extension-system/        # Extension loading, activation, validation
└── core-types/              # Shared type definitions (Event, Fact, Entity, Relationship)
```

The default `extensions.json` is checked into the repo. If it is missing, the system fails fast with a direct error and does not auto-discover extensions.

The config loader is implemented; bootstrap activation and config write-back are the next steps.

**The 6 Stages:** stores → loaders → validators → contextBuilders → senders → ui

See **[current.md](current.md)** for detailed implementation status.

---

## Quick Reference

### Fact (conceptual)
```
subject: "Aldric"
property: "title"
value: "King"
validFrom: Chapter 1
validTo: null
source: coronation-event
```

### Event (conceptual)
```
Event: "Council Meeting"
├── participants: [King, Advisor]
├── hidden-participants: [Spy]
├── location: Throne Room
├── time: Chapter 5
├── visibility: private | court | public | [group]
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

## Key Decisions (Summary)

1. **Config-driven extensions** - Explicit loading via JSON config, 6-stage pipeline
2. **Constrain LLM generation** - Build constraint packages that prevent impossible prose
3. **Timeline is the database** - Entities are derived views from facts with temporal bounds
4. **Events are source of truth** - Facts are materialized views from events
5. **Map is first-class** - 2D geography with coordinates, routes, terrain, weather
6. **Epistemic state via events** - Never cache knowledge; compute from participation + visibility
7. **Generic constraint framework** - Extensible validation rules, not hardcoded physics
8. **Store verbose, render compact** - Internal structure for queries, token-efficient for LLM

See **[decisions.md](decisions.md)** for full rationale.

---

## Architecture Documentation

The `architecture/` folder contains detailed design documents:

| Document | Description |
|----------|-------------|
| [01-problem.md](architecture/core/01-problem.md) | Core problem: constraining LLM generation |
| [02-timeline-centric.md](architecture/core/02-timeline-centric.md) | Facts, temporal bounds, consistency checking |
| [03-effects.md](architecture/core/03-effects.md) | Effects as data, sticky vs cascading propagation |
| [04-containment.md](architecture/core/04-containment.md) | Geographic hierarchy, environmental properties |
| [05-world-scene-state.md](architecture/core/05-world-scene-state.md) | Persistent vs ephemeral, staging model |
| [06-storage-format.md](architecture/core/06-storage-format.md) | Store verbose, render compact |
| [07-entity-tiers.md](architecture/core/07-entity-tiers.md) | Lead, supporting, role, ambient |
| [08-epistemic-state.md](architecture/core/08-epistemic-state.md) | Who knows what, always query |
| [09-scene-execution.md](architecture/core/09-scene-execution.md) | POV-driven, multi-agent, ambient generation |
| [10-import-pipeline.md](architecture/core/10-import-pipeline.md) | NLP, inference tiers, human review |
| [11-query-pipeline.md](architecture/core/11-query-pipeline.md) | Deterministic retrieval, focus-based priority |
| [12-prior-art.md](architecture/core/12-prior-art.md) | Temporal knowledge graphs, event sourcing |
| [13-open-questions.md](architecture/core/13-open-questions.md) | Resolved and still open |
| [14-mvp-scope.md](architecture/core/14-mvp-scope.md) | Original MVP scope (historical) |

---

## See Also

- **[vision.md](vision.md)** - Complete vision for the constraint engine
- **[current.md](current.md)** - Current implementation status
- **[roadmap.md](roadmap.md)** - Milestone-by-milestone path
- **[decisions.md](decisions.md)** - Design rationale
- **[CLAUDE.md](../CLAUDE.md)** - Development workflow
