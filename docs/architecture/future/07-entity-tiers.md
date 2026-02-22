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
# Entity Tiers

## 7. Entity Tiers (Store Everything, Retrieve Smartly)

### 7.1 The Approach

Store every detail. Use tiers to prioritize retrieval.

```
Entity Tiers:
├── lead: Full tracking (main characters)
├── supporting: Position, key facts (named NPCs)
├── role: Group treatment ("the guards")
└── ambient: Minimal (crowd, background)
```

### 7.2 Promotion

When Guard #3 becomes plot-relevant (stops an assassin):
1. They already exist (facts stored when the scene was written)
2. Update their tier from "ambient" to "supporting" or "lead"
3. Add more facts as needed

Everything persists. Tier affects retrieval priority, not storage.

---

## See also
- [09-scene-execution.md](./09-scene-execution.md)
- [11-query-pipeline.md](../core/11-query-pipeline.md)
- [vision.md](../../vision.md)
- [roadmap.md](../../roadmap.md)
