## 14. MVP Scope

### 12.1 Build First

1. Fact and Timeline types
2. Basic queries (getEntityAt, getAllEntities)
3. Import from SillyTavern (extract facts, detect inconsistencies)
4. Visualization (timeline view, entity views)
5. Containment hierarchy

### 12.2 Defer

- Transaction time (undo/audit)
- Scene state management
- Fine-grained focus-based retrieval
- LLM-assisted extraction (start with classical + simple patterns)
- Template effects for common events

---

## 13. File Structure

```
src/
├── timeline/
│   ├── fact.ts           # Fact type
│   ├── timeline.ts       # Timeline operations
│   └── consistency.ts    # Conflict detection
├── entity/
│   └── view.ts           # Compute entity view from facts
├── importer/
│   └── sillytavern/
│       └── parser.ts     # Parse SillyTavern JSON to facts
├── retrieval/
│   └── context.ts        # Context retrieval for LLM prompts
└── explorer/
    ├── tree/             # Hierarchical navigation
    └── graph/            # Visual relationship graph
```

---
