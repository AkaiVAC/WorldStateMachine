## 1. Problem Statement

### 1.1 The Core Problem: Constraining LLM Generation

**The system exists primarily to constrain LLM generation, ensuring output matches established world state.**

When using LLMs for story generation, they invent random names, events, and details that don't fit the established world. This breaks immersion and creates inconsistencies.

**The solution:** Build a constraint package from world state (timeline, map, calendar) that prevents the LLM from generating impossible or inconsistent prose.

**Example:** If kingdom A receives envoys from kingdom B, we should know:
- Why are they being sent?
- Who specifically would be chosen, and why them?
- What are their motivations, personalities, histories?
- What are they wearing? (fashion is culture-dependent)
- How would they travel? What route?

Once these decisions are made, they become **constraints** on future generation. The LLM cannot contradict them.

### 1.2 Secondary Problems

**Temporal awareness:** If a character is dead, in a different location, or not yet born, interactions with them should be flagged as impossible. The LLM must not generate scenes with dead characters unless explicitly a flashback.

**Spatial consistency:** Characters cannot teleport. Travel takes time. If Princess is in Sunnaria at Day 10, she cannot reach Ilaria (7 days away) by Day 12. The system must validate and enforce spatial physics.

**Epistemic isolation:** Characters can only reference information they would know. If Princess wasn't at the war council, generated prose from her POV cannot mention council discussions. The LLM literally cannot access that information.

**Context budget:** LLMs have limited context windows. We can't dump an entire world bible into every prompt. We need smart retrieval that surfaces only what's relevant for the current scene.

**Cascading effects:** When a dam is built on a river, downstream kingdoms are affected. When ruins are discovered, nearby settlements change. Effects ripple through the world.

### 1.3 The Generative Flow

```
Author directive: "Princess arrives in Ilaria for peace talks"
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

**This is a constraint engine for world-consistent generation.**

---

