## 11. Query Pipeline (Fully Deterministic)

### 9.1 Retrieval Strategy

```
Scene Context
    ↓
Graph Traversal (direct entities, relationships, containment)
    ↓
Relevance Scoring (tier, proximity to focus, recency)
    ↓
Token Budget Filtering
    ↓
Compact Rendering
    ↓
Context for LLM
```

### 9.2 Focus-Based Priority

| Scene Type | Prioritizes |
|------------|-------------|
| Battle | Injuries, combat skills, weapons |
| Court | Titles, relationships, attire |
| Intimate | Personality, emotional history |
| Trade | Economics, goods, routes |

### 9.3 Depth-Bounded Traversal

When retrieving "Aldric," how far do we traverse?

- **Depth 0:** Direct facts about Aldric (high priority)
- **Depth 1:** Entities directly linked (medium priority)
- **Depth 2:** Context of those entities (lower priority)
- **Beyond:** Not retrieved unless scene focus demands

---

