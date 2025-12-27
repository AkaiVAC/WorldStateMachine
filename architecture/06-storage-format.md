## 6. Storage vs. Context Format

### 6.1 Store Verbose, Render Compact

The internal storage format is structured for queryability. The context format sent to LLMs is compact for token efficiency.

```
Storage (queryable):
{ subject: "Aldric", property: "title", value: "King", validFrom: 0 }
{ subject: "Aldric", property: "arm-count", value: 1, validFrom: 20 }
{ subject: "Aldric", property: "voice", value: "deep, gravelly" }

Context (token-efficient):
"Aldric: King. One arm (lost year 20). Voice: deep, gravelly."

Or structured but compact:
"ALDRIC | King | 1 arm | deep voice"
```

Storage format is an implementation detail. The retrieval pipeline queries timeline, filters by relevance, then renders to compact format.

### 6.2 Event-Centric Storage

Events are the source of truth. Entity attributes are derived.

```
Event: Battle of Thornfield (year 20)
├── participants: [Aldric, Katherine, ...]
├── injuries: [{target: Aldric, type: arm-loss, side: right, by: Katherine}]
└── outcome: victory for Sunnaria

Derived fact:
{ subject: "Aldric", property: "arm-count", value: 1, validFrom: 20 }
```

This groups related facts and provides context (which hand, when, by whom, in what event).

### 6.3 Prose Storage

**Original prose is preserved alongside extracted facts.**

```typescript
Event {
  id: "coronation-evt",
  type: "coronation",
  time: { year: 50, month: 3, day: 1 },
  location: "Great Hall, Sunnaria",
  participants: ["Aldric", "High-Priest", "Nobles"],
  visibility: "public",

  // Original narrative (preserved)
  prose: `The coronation took place on a cold, clear morning.
          Thousands gathered in the Great Hall as Aldric, clad in
          ancestral armor, knelt before the High Priest...`,

  // Extracted for querying (enables fast lookups)
  details: {
    weather: "cold, clear morning",
    attire: { Aldric: "ancestral armor" },
    attendance: "thousands"
  },

  // Derived facts (for consistency checking)
  outcomes: [
    { subject: "Aldric", property: "title", value: "King", validFrom: 50 }
  ]
}
```

**Why preserve prose:**
1. **Original context** - Extracted facts might miss narrative nuance
2. **Re-extraction** - Better NLP tools later can re-process without data loss
3. **Human reference** - Timeline browser shows actual story, not just structured data
4. **Style learning** - Train/fine-tune on author's prose patterns

**Why extract details:**
1. **Fast queries** - "What was the weather?" without parsing prose
2. **Consistency checking** - Compare structured facts
3. **LLM context** - Include relevant details without full prose

**Both, not either/or.** Prose is archival truth, extracted details enable computation.

---

