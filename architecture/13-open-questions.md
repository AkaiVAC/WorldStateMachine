## 13. Open Questions

### 13.1 Resolved

- **Cascading effects:** Captured at import/write time with LLM-assisted generation; author selects branch (§3.4-3.7)
- **Rules engine:** Not needed; effects are data with suggestion system
- **Storage verbosity:** Store structured, render compact
- **What to store:** Everything; tier for retrieval priority
- **ML vs determinism:** Hybrid pipeline with human review
- **Environmental data:** Climate, weather, terrain, flora, fauna are first-class location properties (§4.3)
- **Weather storage:** Weather is stored with events, not ephemeral; essential for narrative recall
- **Staging model:** Scenes are commit units; facts go staging → review → committed timeline (§5.3)
- **Inference granularity:** Partial inference with confidence tiers; structural auto-accepts, semantic asks first (§10.5)
- **Consistency flags:** Flags are for contradictions, not variations; author's word is truth (§2.5)
- **World-boundary consistency:** Catches real-world references via World Lexicon; grows stricter as world is defined (§2.6)
- **Validation timing:** Real-time (lightweight, while typing) + at-commit (full validation); configurable (§2.7)
- **Entity-level knowledge:** Epistemic state tracked via event participation + visibility levels (§8)
- **Character knowledge isolation:** Retrieval is POV-scoped; LLM only sees what POV character knows (§8.8)
- **State secrets / group knowledge:** Group-based visibility levels with membership tracking (§8.4)
- **Information revelation:** Explicit reveals linking events to characters who learned about them (§8.5)
- **Effect propagation:** LLM generates possibility branches, author/dice selects, effects become facts (§3.4-3.5)
- **Alive world:** Ambient generation with constrained randomness + dice mechanics (§9.5-9.6)
- **Multi-character secrets:** Multi-agent orchestration for secret-heavy scenes; POV-driven for normal scenes (§9.3-9.4)

### 13.2 Still Open

- **Fact granularity:** Trait-level vs paragraph-level (lean toward event-centric)
- **Fuzzy temporal bounds:** "Sometime in his youth" (use null, resolve later)
- **Validation rules:** How to define and check consistency constraints
- **Spatial consistency:** Scene-level spatial model (who is where, relative positions) - acknowledged but not yet designed
- **Meta-state:** Prose style, tone, detail level (shelved for now)
- **Performance at scale:** Indexing strategy for large worlds (1000+ entities)
- **Image attachments:** How multimodal content integrates
- **Dialogue flow in multi-agent:** Turn-based vs structure-first approaches need experimentation
- **Fact extraction UX:** Reducing cognitive load of constant human review
- **Protagonist system:** Separate focus on main character's journey through the world (future companion piece)

---
