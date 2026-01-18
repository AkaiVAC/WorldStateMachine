# Docs Findability + Truncation Hardening Plan

## Phase A Outputs
- Generated inventory: `docs/_generated/docs_inventory.json`
- Generated big-block scan: `docs/_generated/big_blocks_report.md`

## Phase B Plan (No changes executed yet)

### Commit 1 — "docs: add navigational indexes"
**Index README files to create/update:**
- `docs/README.md` (Docs Map)
- `docs/architecture/README.md`
- `docs/architecture/core/README.md`
- `docs/architecture/future/README.md`
- `docs/architecture/reference/README.md`
- `docs/notes/README.md`
- `docs/requirements/README.md`

### Commit 2 — "docs: add frontmatter metadata"
**Decision:** Exclude all `README.md` files from frontmatter (consistent across repo).

**Docs to modify (frontmatter added):**
- `docs/current.md`
- `docs/decisions.md`
- `docs/roadmap.md`
- `docs/vision.md`
- `docs/notes/context-injection-analysis.md`
- `docs/requirements/extensions-systems-requirements.md`
- `docs/architecture/core/01-problem.md`
- `docs/architecture/core/02-timeline-centric.md`
- `docs/architecture/core/04-containment.md`
- `docs/architecture/core/06-storage-format.md`
- `docs/architecture/core/08-epistemic-state.md`
- `docs/architecture/core/11-query-pipeline.md`
- `docs/architecture/core/14-mvp-scope.md`
- `docs/architecture/core/17-constraint-validation-system.md`
- `docs/architecture/future/03-effects.md`
- `docs/architecture/future/05-world-scene-state.md`
- `docs/architecture/future/07-entity-tiers.md`
- `docs/architecture/future/09-scene-execution.md`
- `docs/architecture/future/10-import-pipeline.md`
- `docs/architecture/future/15-calendar-time-system.md`
- `docs/architecture/future/16-map-spatial-system.md`
- `docs/architecture/reference/12-prior-art.md`
- `docs/architecture/reference/13-open-questions.md`

#### Proposed frontmatter + related links

**`docs/current.md`**
```yaml
---
title: "Current Implementation State"
status: "current"
keywords:
  - "current implementation status"
  - "project status"
  - "extension system redesign"
  - "config-driven extensions"
  - "milestone M4 complete"
  - "bootstrap activation next"
  - "timeline stores"
related:
  - "./roadmap.md"
  - "./vision.md"
  - "./decisions.md"
  - "./README.md"
  - "./architecture/core/02-timeline-centric.md"
---
```

**`docs/decisions.md`**
```yaml
---
title: "Design Decisions"
status: "current"
keywords:
  - "design decisions"
  - "architecture rationale"
  - "config-driven extension system"
  - "tool-calling over context"
  - "timeline facts"
  - "epistemic isolation"
  - "validation framework"
related:
  - "./vision.md"
  - "./roadmap.md"
  - "./current.md"
  - "./architecture/core/02-timeline-centric.md"
  - "./architecture/core/17-constraint-validation-system.md"
---
```

**`docs/roadmap.md`**
```yaml
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
```

**`docs/vision.md`**
```yaml
---
title: "Vision: World State Constraint Engine"
status: "current"
keywords:
  - "world state constraint engine"
  - "timeline map calendar"
  - "epistemic isolation"
  - "multi-agent orchestration"
  - "constraint package"
  - "tool-calling architecture"
  - "validation pipeline"
related:
  - "./roadmap.md"
  - "./current.md"
  - "./decisions.md"
  - "./architecture/core/01-problem.md"
  - "./architecture/future/09-scene-execution.md"
---
```

**`docs/notes/context-injection-analysis.md`**
```yaml
---
title: "Context Injection Analysis"
status: "notes"
keywords:
  - "context injection analysis"
  - "keyword matching failures"
  - "entity extraction"
  - "relationship graph retrieval"
  - "prompt analysis"
  - "lorebook matching"
  - "Sunnarian princess test"
related:
  - "../current.md"
  - "../vision.md"
  - "../roadmap.md"
  - "../decisions.md"
  - "../architecture/core/11-query-pipeline.md"
---
```

**`docs/requirements/extensions-systems-requirements.md`**
```yaml
---
title: "Extension Systems Requirements"
status: "requirements"
keywords:
  - "extension system requirements"
  - "config-driven extensions"
  - "activation runtime"
  - "dependency handling"
  - "extension context"
  - "stage pipeline"
  - "validation rules"
related:
  - "../current.md"
  - "../decisions.md"
  - "../roadmap.md"
  - "../architecture/core/11-query-pipeline.md"
---
```

**`docs/architecture/core/01-problem.md`**
```yaml
---
title: "Problem Statement"
status: "core"
keywords:
  - "problem statement"
  - "LLM consistency constraints"
  - "world state management"
  - "constraint engine goals"
  - "context reliability"
  - "hallucination prevention"
related:
  - "../../vision.md"
  - "../../roadmap.md"
  - "./02-timeline-centric.md"
  - "./17-constraint-validation-system.md"
---
```

**`docs/architecture/core/02-timeline-centric.md`**
```yaml
---
title: "Timeline-Centric World State"
status: "core"
keywords:
  - "timeline-centric design"
  - "facts with temporal bounds"
  - "event sourcing"
  - "world state queries"
  - "temporal consistency"
  - "fact validity"
related:
  - "./06-storage-format.md"
  - "./08-epistemic-state.md"
  - "../../decisions.md"
  - "../../roadmap.md"
  - "../future/09-scene-execution.md"
---
```

**`docs/architecture/core/04-containment.md`**
```yaml
---
title: "Containment and Spatial Relationships"
status: "core"
keywords:
  - "containment hierarchy"
  - "spatial relationships"
  - "location graph"
  - "map constraints"
  - "place containment"
  - "geographic queries"
related:
  - "../future/16-map-spatial-system.md"
  - "../future/09-scene-execution.md"
  - "./11-query-pipeline.md"
  - "../../vision.md"
---
```

**`docs/architecture/core/06-storage-format.md`**
```yaml
---
title: "Storage Format"
status: "core"
keywords:
  - "storage format"
  - "verbose storage"
  - "compact rendering"
  - "fact schema"
  - "event storage"
  - "context serialization"
related:
  - "./02-timeline-centric.md"
  - "./11-query-pipeline.md"
  - "../../decisions.md"
  - "../future/09-scene-execution.md"
---
```

**`docs/architecture/core/08-epistemic-state.md`**
```yaml
---
title: "Epistemic State"
status: "core"
keywords:
  - "epistemic state"
  - "knowledge isolation"
  - "event visibility"
  - "character knowledge"
  - "POV filtering"
  - "secret handling"
related:
  - "./02-timeline-centric.md"
  - "../future/09-scene-execution.md"
  - "../../roadmap.md"
  - "../../vision.md"
  - "../../decisions.md"
---
```

**`docs/architecture/core/11-query-pipeline.md`**
```yaml
---
title: "Query Pipeline"
status: "core"
keywords:
  - "query pipeline"
  - "context retrieval"
  - "entity matching"
  - "graph traversal"
  - "token budgeting"
  - "prompt analysis"
related:
  - "./02-timeline-centric.md"
  - "./06-storage-format.md"
  - "../../notes/context-injection-analysis.md"
  - "../future/09-scene-execution.md"
---
```

**`docs/architecture/core/14-mvp-scope.md`**
```yaml
---
title: "MVP Scope"
status: "core"
keywords:
  - "MVP scope"
  - "minimum viable product"
  - "scope boundaries"
  - "initial milestones"
  - "feature exclusions"
  - "project constraints"
related:
  - "../../roadmap.md"
  - "../../vision.md"
  - "../../decisions.md"
  - "./01-problem.md"
---
```

**`docs/architecture/core/17-constraint-validation-system.md`**
```yaml
---
title: "Constraint Validation System"
status: "core"
keywords:
  - "constraint validation"
  - "rule framework"
  - "consistency checks"
  - "validation timing"
  - "violation reporting"
  - "world boundary rules"
related:
  - "./02-timeline-centric.md"
  - "../../decisions.md"
  - "../../vision.md"
  - "../future/09-scene-execution.md"
---
```

**`docs/architecture/future/03-effects.md`**
```yaml
---
title: "Effects and Propagation"
status: "future"
keywords:
  - "effects propagation"
  - "sticky effects"
  - "cascading effects"
  - "world simulation"
  - "event consequences"
  - "branching outcomes"
related:
  - "../../vision.md"
  - "../../roadmap.md"
  - "../core/02-timeline-centric.md"
  - "./09-scene-execution.md"
---
```

**`docs/architecture/future/05-world-scene-state.md`**
```yaml
---
title: "World Scene State"
status: "future"
keywords:
  - "world scene state"
  - "persistent vs ephemeral"
  - "scene assembly"
  - "context packaging"
  - "state transitions"
  - "scene lifecycle"
related:
  - "./09-scene-execution.md"
  - "../core/02-timeline-centric.md"
  - "../core/08-epistemic-state.md"
  - "../../vision.md"
---
```

**`docs/architecture/future/07-entity-tiers.md`**
```yaml
---
title: "Entity Tiers"
status: "future"
keywords:
  - "entity tiers"
  - "lead supporting ambient"
  - "retrieval priority"
  - "context weighting"
  - "scene relevance"
  - "entity classification"
related:
  - "./09-scene-execution.md"
  - "../core/11-query-pipeline.md"
  - "../../vision.md"
  - "../../roadmap.md"
---
```

**`docs/architecture/future/09-scene-execution.md`**
```yaml
---
title: "Scene Execution"
status: "future"
keywords:
  - "scene execution"
  - "multi-agent orchestration"
  - "POV isolation"
  - "scene generation"
  - "tool-calling workflow"
  - "context assembly"
related:
  - "../core/08-epistemic-state.md"
  - "../core/11-query-pipeline.md"
  - "./05-world-scene-state.md"
  - "../../vision.md"
  - "../../roadmap.md"
---
```

**`docs/architecture/future/10-import-pipeline.md`**
```yaml
---
title: "Import Pipeline"
status: "future"
keywords:
  - "import pipeline"
  - "lorebook ETL"
  - "fact extraction"
  - "relationship extraction"
  - "entity categorization"
  - "schema discovery"
related:
  - "../core/02-timeline-centric.md"
  - "../core/06-storage-format.md"
  - "../../vision.md"
  - "../../roadmap.md"
---
```

**`docs/architecture/future/15-calendar-time-system.md`**
```yaml
---
title: "Calendar and Time System"
status: "future"
keywords:
  - "calendar system"
  - "time granularity"
  - "chapter chronology"
  - "temporal context"
  - "seasons and time of day"
  - "custom calendars"
related:
  - "../../vision.md"
  - "../../roadmap.md"
  - "../core/02-timeline-centric.md"
  - "./16-map-spatial-system.md"
---
```

**`docs/architecture/future/16-map-spatial-system.md`**
```yaml
---
title: "Map and Spatial System"
status: "future"
keywords:
  - "map system"
  - "spatial validation"
  - "travel time"
  - "geography constraints"
  - "routes and proximity"
  - "environmental context"
related:
  - "../../vision.md"
  - "../../roadmap.md"
  - "../core/04-containment.md"
  - "./15-calendar-time-system.md"
  - "./09-scene-execution.md"
---
```

**`docs/architecture/reference/12-prior-art.md`**
```yaml
---
title: "Prior Art"
status: "reference"
keywords:
  - "prior art"
  - "related systems"
  - "temporal knowledge graphs"
  - "multi-agent narratives"
  - "tool-calling comparison"
  - "research references"
related:
  - "../../vision.md"
  - "../../roadmap.md"
  - "../../decisions.md"
  - "../core/01-problem.md"
---
```

**`docs/architecture/reference/13-open-questions.md`**
```yaml
---
title: "Open Questions"
status: "reference"
keywords:
  - "open questions"
  - "design tradeoffs"
  - "unresolved decisions"
  - "future investigation"
  - "architecture risks"
  - "research backlog"
related:
  - "../../roadmap.md"
  - "../../decisions.md"
  - "../../vision.md"
  - "../core/02-timeline-centric.md"
  - "../future/09-scene-execution.md"
---
```

### Commit 3 — "docs: normalize 'See also' crosslinks"
**Docs to modify:** Same list as Commit 2 (all non-README docs above).

**Planned “See also” links:** Mirror the `related` lists in Commit 2 for consistency.

### Commit 4 — "docs: extract oversized code blocks to examples"
**Big blocks detected:** None (no fenced blocks exceeded 120 lines or 10KB).

**Extraction mapping:**
- None required based on `docs/_generated/big_blocks_report.md`.

### Commit 5 — "docs: polish + validation"
**Planned checks/fixes:**
- Ensure exactly one H1 per non-README doc (add missing H1 derived from title where needed).
- Verify relative links after updates.
- Confirm no fenced blocks >120 lines remain.
- Ensure no references to `docs/_generated` appear in regular docs.

