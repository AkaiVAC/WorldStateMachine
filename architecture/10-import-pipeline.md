## 10. Import Pipeline (Determinism Preference)

### 8.1 Guiding Principle

Prefer deterministic approaches. Use ML only where unavoidable. Always allow human review.

### 8.2 Hybrid Pipeline

```
┌─────────────────────────────────────────┐
│            Raw Prose Entry              │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│     Classical NLP (spaCy, etc.)         │
│     - Named Entity Recognition          │
│     - Temporal expression parsing       │
│     - Basic relation patterns           │
│     Deterministic, fast                 │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│     SLM / Fine-tuned small model        │
│     - Complex relations                 │
│     - Event extraction                  │
│     - Effect identification             │
│     Domain-adaptable, still fast        │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│         Confidence Scoring              │
└────────────────┬────────────────────────┘
                 ▼
         ┌──────┴──────┐
         ▼             ▼
    High conf.    Low conf.
         │             │
         ▼             ▼
    Auto-accept   Human review
                  (or escalate)
```

### 8.3 What Each Layer Handles

| Layer | Handles | Determinism |
|-------|---------|-------------|
| Classical NLP | Names, dates, places, basic relations | Fully deterministic |
| SLM | Complex relations, events, effects | Deterministic given same input |
| Human review | Ambiguous cases, corrections | Human judgment |
| Large LLM | "Can't parse this at all" (rare) | Optional fallback |

### 8.4 Quality Trade-offs

The quality gap between approaches matters less when:
- Human review is in the loop
- You can fine-tune on your domain (lorebook patterns)
- Determinism enables systematic debugging and improvement

### 8.5 Inference Tiers (Partial Inference)

Not all inferences require the same level of scrutiny. The system uses confidence tiers to auto-accept obvious extractions while flagging uncertain ones.

| Tier | Confidence | Action | Examples |
|------|------------|--------|----------|
| Structural | High | Auto-accept | Containment from "X of Y" patterns; "Royal Gardens of Ilaria" → child of Ilaria |
| Categorical | High | Auto-accept | Entity type from clear markers; "King Aldric" → person, ruler |
| Environmental | Medium | Auto-suggest | Weather based on climate/season; "July in Ilaria → rainy season, suggest rain" |
| Semantic | Medium | Ask first | Political implications; "Royal gardens" → Ilaria has monarchy? |
| Identity | Low | Ask first | "Who is the narrator?" → Create new character or link existing? |
| Causal | Never | Never infer | Why something happened; character motivations |

**Example extraction from prose:**

> "I was a guard in the royal gardens of Ilaria, overlooking a beautiful pond."

```
AUTO-ACCEPTED (structural, high confidence):
├── Royal Gardens of Ilaria → contained by Ilaria
├── Pond → contained by Royal Gardens
└── Narrator → stationed at Royal Gardens

SUGGESTED (needs confirmation):
├── Ilaria has royal/monarchical government? (inferred from "royal")
├── Create narrator as new character? (unnamed, role: guard)
└── Store "beautiful" as aesthetic property of pond?

NOT INFERRED:
├── Why the narrator was stationed there
├── The narrator's identity/name
└── Time period
```

This reduces friction for obvious relationships while keeping humans in control of meaningful world decisions.

---

