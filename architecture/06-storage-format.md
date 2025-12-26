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

---

