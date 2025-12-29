## 12. Relationship to Prior Art

### 10.1 Temporal Knowledge Graph

Our fact model mirrors RDF with temporal extension:
```
RDF:  Subject → Predicate → Object
Ours: Subject → Property  → Value (+ time range)
```

### 10.2 Bi-Temporal Modeling

- **Valid time:** When a fact is true in the story world (our validFrom/validTo)
- **Transaction time:** When a fact was recorded (for undo/audit - future feature)

SQL:2011 has standard constructs. Our approach aligns with established patterns.

### 10.3 Event Sourcing

State is stored as events. Current state = derived view. Our timeline is the event log.

### 10.4 The Screenwriting Parallel

| Our Concept | Film/TV Equivalent |
|-------------|-------------------|
| Timeline | Continuity bible |
| Scene | Script page |
| Retrieval | Script supervisor |
| Fact | Continuity note |
| Entity view | Character bible entry |

We're building a digital continuity system for AI-assisted storytelling.

---

