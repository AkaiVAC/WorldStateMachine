## 4. Containment Hierarchy (Automatic Proximity)

### 4.1 Geographic Inheritance

Entities in the same region share context automatically through containment.

```
Region: Northern Wastes
├── contains: Ruins of Karthage
├── contains: Millbrook
├── contains: Trader's Rest
└── properties: harsh-climate, ancient-magic-residue

Query: "What's relevant to Millbrook?"
→ Millbrook facts
→ Northern Wastes facts (inherited via containment)
→ Siblings in same region as potential context
```

No explicit "proximity" rules needed - containment provides it.

### 4.2 Relationship Types Define Propagation

For relationships that need traversal behavior (rivers, trade routes, political hierarchies), we define behavior per **relationship type**, not per event type.

```
Relationship types with propagation:
├── flows-through: sequential (downstream)
├── borders: adjacent (bidirectional)
├── contains/part-of: hierarchical (up/down)
├── rules/subject-of: domain membership
├── trade-route: along path
└── allied-with/enemy-of: political graph
```

There are maybe 20-30 relationship types. This is manageable.

### 4.3 Environmental Properties

Locations have environmental data that affects narrative and enables consistency checking.

**Climate (regional, persistent):**
```
Ilaria:
├── climate: temperate
├── rainy-months: [6, 7, 8]
├── terrain: rolling-hills, river-valleys
├── flora: [deciduous-forests, wildflower-meadows]
└── fauna: [deer, songbirds, river-fish]

Northern Wastes:
├── climate: arctic
├── terrain: frozen-tundra, ice-fields
├── flora: [hardy-lichens, frost-moss]
└── fauna: [ice-wolves, snow-bears]
```

**Location-specific features:**
```
Royal Gardens of Ilaria:
├── terrain: stone-paths, manicured-lawns, elevated-terraces
├── flora: [roses, hedges, ancient-willows]
├── fauna: [ornamental-koi, songbirds]
├── features: [pond, fountain, gazebo]
└── surfaces: [cobblestone, grass, water]
```

**Why this matters:**

Weather is NOT ephemeral scene color—it's essential data for narrative recall:

> "I-I don't remember much... I do remember that it was raining that night. I slipped on a puddle and fell unconscious..."

That retrieval only works if the system *knows* it was raining. Terrain, flora, and fauna inform what can happen: "What could someone slip on here when wet?" → cobblestone, wet grass.

**Weather in scenes:**
- Climate data enables suggestions: "July in Ilaria (rainy season). Weather?"
- Author states weather explicitly → stored with the event
- System accepts any weather without warning (see §2.5)
- Climate is probability, not prescription

---

