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
# Open Questions

## 13. Open Questions

### 13.1 Resolved

- **Primary use case:** Constraining LLM generation (constraint package prevents impossible prose) (§1)
- **Timeline granularity:** Full calendar fidelity (epoch → era → year → season → month → day → hour → minute) (§15)
- **Map system:** First-class 2D geography with coordinates, routes, travel physics, weather (§16)
- **Prose storage:** Original prose preserved alongside extracted facts (§6.3)
- **Constraint framework:** Generic, extensible validation system (not hardcoded) (§17)
- **Fact granularity:** Events are source of truth, facts are materialized views (§6.2)
- **Cascading effects:** Sticky (query-time) vs cascading (write-time) coexist (§3.7-3.8)
- **Rules engine:** Not needed; effects are data with suggestion system
- **Storage verbosity:** Store structured, render compact
- **What to store:** Everything; tier for retrieval priority
- **ML vs determinism:** Hybrid pipeline with human review
- **Environmental data:** Climate, weather, terrain, flora, fauna are first-class location properties (§4.3, §16)
- **Weather storage:** Weather is stored with events, not ephemeral; essential for narrative recall
- **Staging model:** Scenes are commit units; facts go staging → review → committed timeline (§5.3)
- **Inference granularity:** Partial inference with confidence tiers; structural auto-accepts, semantic asks first (§10.5)
- **Consistency flags:** Flags are for contradictions, not variations; author's word is truth (§2.5)
- **World-boundary consistency:** Catches real-world references via World Lexicon; grows stricter as world is defined (§2.6)
- **Validation timing:** Real-time (lightweight) + pre/post generation + at-commit (full); configurable (§2.7, §17.7)
- **Entity-level knowledge:** Epistemic state tracked via event participation + visibility levels (§8)
- **Character knowledge isolation:** Retrieval is POV-scoped; LLM only sees what POV character knows (§8.8)
- **No epistemic caching:** Always query from timeline; never snapshot/cache (§8.7)
- **State secrets / group knowledge:** Group-based visibility levels with membership tracking (§8.4)
- **Information revelation:** Explicit reveals linking events to characters who learned about them (§8.5)
- **Effect propagation:** LLM generates possibility branches, author/dice selects, effects become facts (§3.4-3.5)
- **Alive world:** Ambient generation with constrained randomness + dice mechanics (§9.5-9.6)
- **Multi-character secrets:** Multi-agent orchestration for secret-heavy scenes; POV-driven for normal scenes (§9.3-9.4)
- **Performance strategy:** Profile-driven; brute force + indexing first, optimize after measuring real usage

### 13.2 Still Open

- **Fuzzy temporal bounds:** "Sometime in his youth" (use null/approximate year, resolve later if needed) (§15.5)
- **Scene-level spatial positioning:** Within-scene entity positions (who's on whose RIGHT, exact arrangement) - deferred for now
- **Meta-state:** Prose style, tone, detail level (shelved for now)
- **Image attachments:** How multimodal content integrates (maps, character art, scene illustrations)
- **Dialogue flow in multi-agent:** Turn-based vs structure-first approaches need experimentation (§9.8)
- **Fact extraction UX:** Reducing cognitive load of constant human review during import
- **Protagonist system:** Separate focus on main character's journey through the world (future companion piece)
- **Route calculation details:** A* pathfinding vs pre-computed routes, terrain penalties, urgency modifiers (§16.7)
- **Custom calendar support:** How to handle non-standard calendars (different month lengths, week structures) (§15.6)
- **Weather generation:** Procedural weather systems vs manually specified weather events (§16.5)
- **Constraint prioritization:** When multiple constraints conflict, which takes precedence? (§17)

---

## See also
- [roadmap.md](../../roadmap.md)
- [decisions.md](../../decisions.md)
- [vision.md](../../vision.md)
- [02-timeline-centric.md](../core/02-timeline-centric.md)
- [09-scene-execution.md](../future/09-scene-execution.md)
