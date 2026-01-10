## 17. Constraint and Validation System

### 17.1 Generic Constraint Framework

**The system uses a generic constraint framework, not hardcoded physics rules.**

Constraints are defined by type and can be extended without modifying core logic.

```typescript
type ConstraintType =
  | "temporal"     // Timeline consistency
  | "spatial"      // Geography and travel physics
  | "epistemic"    // Knowledge isolation
  | "factual"      // Direct contradictions
  | "world-boundary" // Real-world references
  | "custom"       // User-defined rules

type Constraint = {
  type: ConstraintType
  rule: string
  validator: (world: WorldState, candidate: Event | Fact) => ValidationResult
}

type ValidationResult = {
  valid: boolean
  severity: "error" | "warning" | "info"
  message?: string
  suggestions?: string[]
}
```

### 17.2 Built-in Constraint Types

**Temporal constraints:**
```
- fact-no-overlap: Same property can't have conflicting values at same time
- entity-alive: Can't interact with dead entities (unless flashback)
- temporal-order: Birth before death, cause before effect
```

**Spatial constraints:**
```
- entity-location-unique: Can't be in two places at once
- travel-time-realistic: Travel requires minimum time based on distance
- route-exists: Path between locations must be possible
```

**Epistemic constraints:**
```
- character-knows: Can only reference events they witnessed or were told
- visibility-respected: Private events excluded from non-participants
- revelation-chain: Knowledge must have plausible transmission path
```

**Factual constraints:**
```
- no-contradiction: New facts can't directly contradict existing facts
- type-consistency: Property values must match expected types
```

**World-boundary constraints (§2.6):**
```
- no-earth-references: Real place names, historical figures flagged
- lexicon-compliance: Species/items match world lexicon when defined
```

### 17.3 Validation Flow

```
┌──────────────────────────────┐
│   LLM generates prose        │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│   Extract events/facts       │
│   (NLP pipeline)             │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│   Run constraints            │
├──────────────────────────────┤
│ For each extracted fact:     │
│   - Temporal validation      │
│   - Spatial validation       │
│   - Epistemic validation     │
│   - Factual validation       │
│   - Custom validations       │
└──────────────┬───────────────┘
               ↓
         ┌─────┴─────┐
         ↓           ↓
     Violations   No violations
         │           │
         ↓           ↓
    ┌────────┐  ┌────────┐
    │ Review │  │ Commit │
    │ /Fix   │  │   to   │
    │ /Retry │  │Timeline│
    └────────┘  └────────┘
```

### 17.4 Constraint Package for Generation

**Before LLM generation, build constraint package:**

```typescript
function buildConstraintPackage(
  directive: AuthorDirective
): ConstraintPackage {
  return {
    // Timeline constraints
    timeline: {
      currentTime: directive.time,
      activeFacts: getFactsAt(directive.time),
      recentEvents: getRecentEvents(directive.time, window: 10),
    },

    // Map constraints
    spatial: {
      location: getLocationState(directive.location, directive.time),
      weather: getWeather(directive.location, directive.time),
      geography: getGeography(directive.location),
      nearbyEntities: getEntitiesAt(directive.location, directive.time),
    },

    // Calendar constraints
    temporal: {
      timeOfDay: directive.time.hour,  // Dawn, afternoon, night
      season: getSeason(directive.time),
      calendarEvents: getCalendarEvents(directive.time),
    },

    // Epistemic constraints
    knowledge: {
      pov: directive.povCharacter,
      knownEvents: getKnownEvents(directive.povCharacter, directive.time),
      knownFacts: getKnownFacts(directive.povCharacter, directive.time),
      secrets: getSecrets(directive.povCharacter, directive.time),
    },

    // Physical constraints
    physics: {
      presentEntities: getEntitiesAt(directive.location, directive.time),
      impossibleEntities: getImpossiblePresences(directive.location, directive.time),
        // e.g., entities who can't travel there in time
    },
  }
}
```

**This package becomes LLM context.** The LLM is architecturally prevented from violating constraints because the information isn't in the context.

### 17.5 Complex Constraint Resolution

Some constraints require reasoning, not just lookups:

**Example: Alibi validation**
```
Question: "Where was Princess at Year 5, Day 14?"
Known: Princess in Sunnaria at Day 10, in Ilaria at Day 17

Constraint: Entity location must be plausible given travel time
Route: Sunnaria → Ilaria, 7 days

Resolution:
- Day 14 is 4 days into 7-day journey
- Princess is traveling, approximately 57% along route
- Route waypoints: [Sunnaria, Forest-of-Veil, Border-Town, Ilaria]
- Position: Likely at Border-Town (waypoint 2/3)

Result: AMBIGUOUS - "Traveling, likely near Border-Town"
→ Author confirms or specifies exact location
```

**For complex physics:**
- System flags ambiguous cases
- LLM-assisted reasoning provides plausibility check
- Author makes final decision

### 17.6 Custom Constraints

Users can define world-specific rules:

```typescript
const worldConstraints: Constraint[] = [
  {
    type: "custom",
    rule: "magic-exhaustion",
    validator: (world, candidate) => {
      // If character used magic in last 24 hours, flag fatigue
      const recentMagicUse = world.timeline.getEvents({
        participant: candidate.subject,
        type: "magic-casting",
        since: candidate.time - HOURS(24)
      })

      if (recentMagicUse.length > 0) {
        return {
          valid: true,
          severity: "warning",
          message: "Character recently used magic - consider exhaustion effects"
        }
      }
      return { valid: true }
    }
  }
]
```

### 17.7 Validation Timing (from §2.7)

- **Real-time (while typing):** Lightweight, non-blocking
- **Pre-generation:** Build constraint package, exclude impossibilities
- **Post-generation:** Validate extracted facts, flag violations
- **At commit:** Full validation suite before committing to timeline

### 17.8 Handling Violations

**Errors (blocking):**
- Temporal contradictions (dead character present)
- Spatial impossibilities (can't reach location in time)
- Factual contradictions (directly contradicts existing fact)

**Warnings (advisory):**
- Unusual but possible (travel barely feasible)
- World-boundary flags (real-world references)
- Ambiguous knowledge (character might or might not know)

**Info (suggestions):**
- Style recommendations
- Missed opportunities (relevant facts not mentioned)
- Consistency suggestions (mention established details)

---
