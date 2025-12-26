## 2. Core Principle: Timeline-Centric

**The Timeline is the database. Entities are derived views.**

Instead of storing "entities" (characters, places, etc.) as objects with properties, we store **facts with temporal bounds**. An entity is just the collection of all facts that reference it.

### 2.1 What is a Fact?

A Fact is a statement about the world with a time range during which it's true.

```
Fact:
  - subject: What entity this is about (e.g., "Aldric")
  - property: What aspect (e.g., "title", "arm-count", "located-in")
  - value: The value (e.g., "King", 1, "Sunnaria")
  - validFrom: When this became true (e.g., year 10)
  - validTo: When this stopped being true (null = still true)
  - tier: Retrieval priority (lead, supporting, role, ambient)
  - source: Where this fact came from (for tracing)
```

### 2.2 Entities Emerge from Facts

There is no "create entity" step. An entity exists once facts reference it.

To add a new character, just add facts about them. To expand a character, add more facts. Even retroactively.

### 2.3 Relationships Are Also Facts

```
{ subject: "Aldric", property: "rules", value: "Sunnaria", validFrom: 10 }
{ subject: "Sunnaria", property: "allied-with", value: "Limaria", validFrom: 5, validTo: 15 }
{ subject: "Sera", property: "daughter-of", value: "Aldric", validFrom: 5 }
```

### 2.4 Consistency Checking

The system validates new facts against existing ones:
- "Aldric meets Elara in year 25" → **Error:** Elara died in year 18
- "Sera rules in year 15" → **Error:** She wasn't queen until year 20

This directly supports the core goal: preventing impossible interactions.

### 2.5 Flags Are for Contradictions, Not Variations

The system flags **actual conflicts**, not unusual choices.

**Not flagged (author's choice):**
- "It was sunny in July" during Ilaria's rainy season → Allowed. Rainy season ≠ constant rain.
- "An unusually warm day" → The prose itself captures the unusualness.

**Flagged (contradiction):**
- Scene 1: "It was pouring rain all night"
- Scene 2 (same night, same location): "The dry dust swirled..."
- → **Conflict:** Contradictory weather in overlapping scenes. Intentional?

The author's words are the source of truth. If weather is notable, the prose will say so ("unusually warm"). The system doesn't second-guess creative choices—it catches mistakes.

### 2.6 World-Boundary Consistency

The system catches real-world references that don't belong in the fictional world.

**Consistency types:**

| Type | What it catches |
|------|-----------------|
| Temporal | Dead people appearing, events before birth |
| Spatial | Being in two places at once |
| Factual | Contradictory statements about the same thing |
| World-boundary | Real-world references that don't belong |

**Common-sense mode (default):**

```
Auto-allowed (universal basics):
├── Common animals: horses, dogs, cats, birds, fish...
├── Common plants: trees, grass, flowers...
├── Basic concepts: love, war, trade, family...
└── Generic terms: "syndrome", "tactics", "architecture"...

Flagged (Earth-specific):
├── Place names: Stockholm, Paris, Rome...
├── Historical figures: Napoleon, Caesar, Victoria...
├── Cultural epochs: Victorian, Renaissance, Medieval...
└── Species not in lexicon when category is defined

Explicitly absent (author-defined):
├── Technology: guns, gunpowder, electricity...
└── Whatever the author specifies
```

**Category-aware strictness:**

The system grows stricter as the world gets more defined:

```
Lexicon has fauna: [ice-wolves, shadow-voles, fire-drakes]
Prose mentions: "mouse"
→ Flag: "mouse" not in confirmed fauna. Add or replace?

Lexicon fauna: (empty)
Prose mentions: "mouse"
→ Allow: No fauna defined yet, assume Earth-defaults
```

**Example flags:**

```
⚠️ Real-world reference: "Stockholm Syndrome"
   Stockholm is not in the World Lexicon.
   Options: Add location | Replace term | Dismiss

⚠️ Unconfirmed fauna: "crocodile" (in "crocodile tears")
   Crocodiles not in confirmed fauna.
   Options: Add to fauna | Replace idiom | Dismiss
```

### 2.7 Validation Timing

Validation can run at two points, configurable by the author.

**Real-time (while typing):**
- Lightweight checks only (Earth place names, explicit absences)
- Subtle indicator (yellow underline, not red)
- Non-blocking, just awareness
- Requires running process (language server style)

**At commit (batch):**
- Full validation (all consistency types)
- Blocking if errors (temporal, spatial, factual contradictions)
- Advisory if warnings (world-boundary, suggestions)
- Diff view shows everything

**Hybrid approach (recommended):**

```
While typing:
├── Lightweight world-boundary checks
├── Subtle highlighting
└── Non-blocking

At commit:
├── Full validation suite
├── Error/warning summary
└── Review before finalizing
```

**Configuration:**

```
validation:
  real-time: true | false | "lightweight"
  at-commit: true  (always on)
  blocking: [temporal, spatial, factual]
  advisory: [world-boundary, suggestions]
```

---

