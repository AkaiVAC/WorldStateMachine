## 15. Calendar and Time System

### 15.1 Time Granularity

The timeline requires full temporal fidelity to support rich narrative generation and consistency checking.

**Time hierarchy:**
```
Epoch (optional)
  ↓
Era (optional)
  ↓
Year
  ↓
Season (world-specific or standard)
  ↓
Month
  ↓
Day
  ↓
Hour
  ↓
Minute
```

### 15.2 Time Structure

```typescript
type TimePoint = {
  epoch?: string      // "Age of Kings", "The Sundering"
  era?: string        // "The Long Peace", "The War Years"
  year: number        // Relative or absolute
  season?: string     // World-specific or Earth-standard
  month?: number
  day?: number
  hour?: number
  minute?: number
}
```

**Internal representation:** Convert to linear timeline units (e.g., minutes since story epoch) for fast comparison and arithmetic.

### 15.3 Why This Matters for Generation

Time-of-day, season, and calendar position affect generated content:

**Time-of-day:**
- Dawn: "golden light filtering through", "temple bells ring", "markets begin stirring"
- Afternoon: "harsh sunlight", "busy thoroughfares", "heat"
- Night: "torchlight", "empty streets", "guard patrols"

**Season:**
- Summer: flora in bloom, warm weather, festival season
- Winter: bare trees, cold, hearth-fires, reduced travel

**Calendar events:**
- Religious festivals, harvest times, royal ceremonies
- These constrain what's happening in the world at that moment

**Example constraint package:**
```
Scene: Royal Gardens, Ilaria
Time: Year 5, Summer (Month 7), Day 12, Afternoon (Hour 14)

Generated context:
├─ Lighting: "afternoon sun", "long shadows"
├─ Temperature: "warm" (summer + afternoon)
├─ Flora: "roses in full bloom" (summer + gardens)
├─ Activity: "courtiers strolling" (afternoon, good weather)
└─ Sounds: "distant market noise" (afternoon business hours)
```

The LLM doesn't invent time-of-day details—they're derived from the calendar.

### 15.4 Travel Time Calculations

With granular time, we can validate spatial physics:

```
Princess in Sunnaria at Year 5, Day 10
Distance to Ilaria: 7 days travel
Earliest arrival: Year 5, Day 17

Attempt: "Princess arrives in Ilaria at Day 12"
→ INVALID: Requires 7 days, only 2 available
```

### 15.5 Fuzzy Temporal Bounds

Not all facts have precise times:

```
{ subject: "Aldric", property: "childhood-trauma", value: "...",
  validFrom: { era: "youth", fuzzy: true }, validTo: null }
```

For MVP, use null or approximate year. Resolve precision later if needed.

### 15.6 Calendar Systems

Worlds may have custom calendars:

```
World: Excelsia
Calendar:
  - 12 months, 30 days each
  - Month names: [Primus, Secundus, ...]
  - Seasons: 4 (standard)
  - Week: 7 days
  - Leap years: none

Season mapping:
  - Spring: Months 1-3
  - Summer: Months 4-6
  - Autumn: Months 7-9
  - Winter: Months 10-12
```

System converts between calendar display (Month 7, Day 15) and internal linear time for calculations.

---
