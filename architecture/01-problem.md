## 1. Problem Statement

### 1.1 The Core Problem

When using LLMs for story generation, they invent random names, events, and details that don't fit the established world. This breaks immersion and creates inconsistencies.

**Example:** If kingdom A receives envoys from kingdom B, we should know:
- Why are they being sent?
- Who specifically would be chosen, and why them?
- What are their motivations, personalities, histories?
- What are they wearing? (fashion is culture-dependent)
- How would they travel? What route?

Once these decisions are made, they should be frozen as canon.

### 1.2 Secondary Problems

**Temporal awareness:** If a character is dead, in a different location, or not yet born, interactions with them should be flagged as impossible.

**Context budget:** LLMs have limited context windows. We can't dump an entire world bible into every prompt. We need smart retrieval that surfaces only what's relevant.

**Spatial consistency:** LLMs struggle with spatial relationships. "The queen sat next to the king" is ambiguous. Without tracking that she's on his RIGHT, she might bump him from the left later.

**Cascading effects:** When a dam is built on a river, downstream kingdoms are affected. When ruins are discovered, nearby settlements change. Effects ripple through the world.

---

