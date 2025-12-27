## 16. Map and Spatial System

### 16.1 Map as First-Class World State

The map is not just metadata—it's a foundational system alongside Timeline and Calendar.

**Map provides:**
- Geographic positioning (2D coordinates)
- Terrain and elevation
- Travel routes and distances
- Weather systems
- Spatial validation (travel time, line-of-sight, proximity)

### 16.2 Map Structure

```typescript
type MapTile = {
  coordinates: [number, number]  // Grid or lat/long equivalent
  terrain: string                // forest, mountain, plains, water
  elevation: number              // For line-of-sight, climate
  climate: string                // temperate, arctic, desert
  parentRegion?: string          // Containment hierarchy
}

type Location = {
  id: string
  name: string
  coordinates: [number, number]
  type: string                   // city, village, ruins, landmark, structure

  // Containment (from §4)
  parent?: string                // Which region/kingdom

  // Location persists; state at time T is queried from timeline
}

type Route = {
  from: string
  to: string
  path: [number, number][]       // Waypoints
  distance: number               // In time units (days of travel)
  terrain: string[]              // Affects travel speed
  difficulty?: string            // Easy, moderate, treacherous
}

type WeatherState = {
  region: string                 // Or specific coordinates
  time: TimePoint
  conditions: string             // clear, rainy, stormy, snowing
  temperature: number
  wind?: string
  visibility?: number
}
```

### 16.3 Spatial Queries

**Travel time validation:**
```typescript
function canTravel(
  entity: string,
  fromLocation: string,
  toLocation: string,
  startTime: TimePoint,
  arrivalTime: TimePoint
): { valid: boolean, reason?: string }

// Checks:
// 1. Route exists or can be calculated
// 2. Available time >= required time
// 3. Terrain penalties applied
// 4. Weather/season effects (winter slows travel, storms block)
```

**Alibi/position interpolation:**
```typescript
function whereWas(
  entity: string,
  time: TimePoint
): { location: string, state: "stationary" | "traveling", route?: Route }

// If traveling, compute position along route
// Based on start time, end time, progress fraction
// Returns approximate location or waypoint
```

**Visibility/proximity:**
```typescript
function canSee(
  fromLocation: string,
  toLocation: string
): boolean

// Uses terrain, elevation, distance
// "Can you see mountains from Royal Gardens?"
```

### 16.4 Integration with Timeline

**Events include location:**
```typescript
Event {
  id: "coronation",
  time: { year: 50, month: 3, day: 1 },
  location: "Great Hall, Sunnaria",
  participants: ["Aldric", ...],

  // Map provides context
  weather: queryWeather("Sunnaria", time),
  // → "cold, clear morning" (month 3 = late winter)
}
```

**Location facts are temporal:**
```typescript
{ subject: "Princess", property: "location", value: "Sunnaria",
  validFrom: {year: 5, day: 1}, validTo: {year: 5, day: 10} }

{ subject: "Princess", property: "location", value: "traveling:Sunnaria→Ilaria",
  validFrom: {year: 5, day: 10}, validTo: {year: 5, day: 17} }

{ subject: "Princess", property: "location", value: "Ilaria",
  validFrom: {year: 5, day: 17}, validTo: null }
```

### 16.5 Weather Systems

Weather is NOT ephemeral—it's stored as world state:

**Regional climate (persistent):**
```typescript
Region: "Ilaria"
  climate: "temperate"
  rainy_season: [Month 6, 7, 8]
  temperature_range: { summer: [20, 30], winter: [-5, 10] }
```

**Weather events (temporal):**
```typescript
WeatherEvent {
  region: "Ilaria",
  time: { year: 5, month: 7, day: 12, hour: 20 },
  conditions: "heavy rain",
  duration: 4  // hours
}
```

**Why store weather:**
- Narrative recall: "I remember it was raining that night"
- Consistency: Same scene can't have conflicting weather
- Generation constraint: Weather affects what can happen (mud, visibility, travel)

### 16.6 Constraint Generation for LLM

```
Scene: Princess in Royal Gardens, Ilaria
Time: Year 5, Summer, Afternoon
Map query results:

Geographic context:
├─ Coordinates: [45.2, 18.7]
├─ Terrain: manicured gardens, elevated terraces
├─ Elevation: 120m above sea level
├─ Visible: Mountains to north (elevation + distance check)
├─ Climate: temperate
├─ Weather: warm, partly cloudy (summer + climate)
├─ Flora: roses, hedges, willows (gardens + season)
├─ Fauna: songbirds, koi (location type)
└─ Surfaces: cobblestone paths, grass, water

→ LLM generates scene WITH this baked in
→ Cannot invent "snow falling" (wrong season)
→ Cannot mention "desert heat" (wrong climate)
→ Cannot describe "mountains to the south" (wrong geography)
```

### 16.7 Pathfinding and Route Calculation

For complex worlds, calculate routes on-demand:

```typescript
function calculateRoute(from: Location, to: Location): Route {
  // A* or similar pathfinding on map grid
  // Account for terrain (water = impassable without boat)
  // Calculate distance in time units
  // Return waypoints for interpolation
}
```

**Urgency affects route:**
- Normal travel: Use roads, 7 days
- Urgent: Cross-country, 5 days
- Desperate: Forced march, 4 days (with exhaustion penalties)

System can validate: "Given urgency level, is this travel time plausible?"

### 16.8 Integration with Containment Hierarchy

Map coordinates don't replace containment (§4)—they complement it:

**Containment:** "Royal Gardens is part of Ilaria" (political/administrative)
**Map:** "Royal Gardens at coordinates [45.2, 18.7], 2km from city center"

Both provide value:
- Containment: Inherit regional properties (climate, culture)
- Map: Calculate distances, validate travel, provide geography

---
