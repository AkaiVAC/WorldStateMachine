---
title: "Effects and Propagation"
status: "future"
keywords:
  - "effects propagation"
  - "sticky effects"
  - "cascading effects"
  - "world simulation"
  - "event consequences"
  - "branching outcomes"
related:
  - "../../vision.md"
  - "../../roadmap.md"
  - "../core/02-timeline-centric.md"
  - "./09-scene-execution.md"
---
# Effects and Propagation

## 3. Key Insight: Effects Are Data, Not Inference

### 3.1 The Problem with Runtime Inference

We initially considered inferring cascading effects at query time: "dam built at A → system infers B, C, D, E are affected."

This doesn't scale. There are hundreds of possible event types with unpredictable effects. A dam affects downstream. Ruins might attract treasure hunters, emanate dark magic, or become pilgrimage sites - we can't know without context.

### 3.2 The Solution: Capture Effects at Import/Write Time

Effects are extracted and stored as explicit facts during import or authoring, not computed at query time.

```
Input prose:
"The Ruins of Karthage lie three days north of Millbrook.
Since its discovery, the village has been plagued by
strange disappearances and an influx of relic hunters."

Extracted facts:
├── Ruins-of-Karthage.type = ancient-ruin
├── Ruins-of-Karthage.location = 3-days-north-of-Millbrook
├── Millbrook.affected-by = Ruins-of-Karthage [since discovery]
├── Millbrook.experiences = strange-disappearances [since discovery]
├── Millbrook.experiences = relic-hunter-influx [since discovery]
```

The prose already describes the effects - we just structure them.

### 3.3 Pipeline

```
IMPORT/AUTHORING (intelligence lives here)
├── Prose → Extract entities, relationships, AND effects
├── Human reviews extracted facts
├── Effects stored as explicit facts
└── One-time cost, human-verified

QUERY (deterministic)
├── Graph traversal
├── No guessing, no inference
└── Effects already stored as facts
```

### 3.4 Effect Propagation and Generation

When a significant event occurs, the system assists with effect generation while keeping humans in control.

**Example: "The evil mage poisons the River Verath"**

**Step 1: System identifies affected entities (via relationships)**
```
River Verath flows-through: [Verath, Sunnaria, Kalmoor]
Downstream order: Verath → Sunnaria → Kalmoor
Relationship type: flows-through (sequential propagation)
```

**Step 2: System generates possibility branches**
```
Branch A: Unchecked Spread (50%)
├── Verath: severe health crisis, 20% population affected
├── Sunnaria: moderate impact, delayed onset
├── Kalmoor: minor impact, had time to prepare
└── Secondary: economic collapse, refugee crisis, blame

Branch B: Sunnaria Contains It (30%)
├── Verath: devastated (upstream, no warning)
├── Sunnaria: builds dam/filter, stops spread
├── Kalmoor: unaffected
└── Secondary: Sunnaria gains reputation, Verath resents them

Branch C: Poison Fails (20%)
├── Natural purification, divine intervention, etc.
└── Secondary: minimal impact, but mage is now a known threat
```

**Step 3: Author selects (or rolls dice)**

Options: [Choose Branch] [Roll with weights] [Custom]

**Step 4: Selected effects become committed facts**
```
{ subject: "Verath", property: "experiencing", value: "health-crisis", validFrom: year 20, cause: "river-poisoning", severity: "severe" }
{ subject: "Verath", property: "population-change", value: "-20%", validFrom: year 20 }
{ subject: "Sunnaria", property: "experiencing", value: "health-crisis", validFrom: year 20, severity: "moderate" }
...
```

**Step 5: Secondary effects may cascade further**

"Economic collapse in Verath" → system identifies: trade routes affected, refugee flow, political tensions.

Author can continue the cascade or stop at any level.

### 3.5 The "Sentence Changes the World" Pattern

One authored event triggers cascading world state changes:

```
Author writes: "The evil mage poisons the river."
        ↓
System generates + author selects effects
        ↓
Facts committed to timeline
        ↓
Later: Protagonist enters Verath

CONTEXT RETRIEVAL for Verath:
├── Health crisis (river poisoning)
├── Economy: collapsed
├── Government: martial law, rationing
├── Population: fearful, dying
├── Visible effects: sick people, closed markets, guard checkpoints
└── Atmosphere: desperation, blame, prayer

LLM generates scene with all of this baked in automatically.
```

The protagonist doesn't need to be told "there was a poisoning." They experience a kingdom in crisis because every detail flows from stored facts.

### 3.6 What This Requires

1. **Relationship-based propagation rules**: Rivers flow downstream, borders are adjacent, political hierarchies transmit orders, etc. (see §4.2)

2. **Effect template library**: Common event types with typical consequence patterns.
   - Poison → health, economic, political effects
   - War → destruction, refugees, resource scarcity
   - Natural disaster → damage, displacement, reconstruction

3. **LLM-assisted generation**: For creative/novel effects beyond templates.

4. **Selection mechanism**: Author choice, weighted dice roll, or pure random.

5. **Recursive cascading**: Effects can trigger further effects, with human checkpoints at each level.

### 3.7 Core Principle Maintained

Effects are still DATA, not runtime inference. The difference:
- Generation happens at **write time** (when event is authored)
- Human selects which branch becomes canon
- Selected effects are stored as **explicit facts**
- Query time remains **deterministic** (just reads stored facts)

### 3.8 Sticky Facts: Query-Time Effects

An alternative to cascading writes is **sticky facts** that affect retrieval without propagating:

```
Event: "King Aldric dies" (Year 100)
{ subject: "Aldric", property: "alive", value: false, validFrom: 100 }

Query at Year 101: "Who rules Sunnaria?"
→ Check succession rules + timeline state
→ Compute current ruler from facts
→ No need to write "Heir becomes king" fact
```

**When to use sticky vs. cascading:**

| Pattern | Approach | Example |
|---------|----------|---------|
| **Sticky** | Computable from existing facts | Death → succession (deterministic) |
| **Cascading** | Creates new narrative state | Poison river → health crisis (author choice) |
| **Sticky** | Affects queries in bounded way | Location change → spatial constraints |
| **Cascading** | Ripples unpredictably | Assassination → political chaos |

**Benefits of sticky facts:**
- Moves cost from write-time (unpredictable cascade) to read-time (already bounded by token budget)
- Prevents effect explosion (50 relationships don't need 50 new facts)
- Computable effects stay fresh (succession rules can change without rewriting history)

**When cascading is still needed:**
- Effects require author/dice selection (not deterministic)
- New narrative state emerges (not just querying existing rules)
- Secondary effects create story opportunities

Both approaches coexist: sticky facts for mechanical propagation, cascading for narrative richness.

---

## See also
- [vision.md](../../vision.md)
- [roadmap.md](../../roadmap.md)
- [02-timeline-centric.md](../core/02-timeline-centric.md)
- [09-scene-execution.md](./09-scene-execution.md)
