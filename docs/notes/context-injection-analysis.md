# Context Injection Analysis

## Date: 2025-12-28

## Problem Statement

Keyword-based context injection fails to provide relevant world context when user prompts use derivative forms, generic terms, or implicit references.

---

## Baseline Test Case

### Prompt
```
The Sunnarian Court Princess Comedy
```

### Expected Context
- **Sunnaria** - The Golden Delta kingdom (central trade hub, King Alaric, Queen Elara)
- **Princess Aradia** - Sunnarian princess (age 20, auburn hair, tsundere personality)
- Court/diplomatic protocols (general context)

### Actual Context Injected (Keyword Matching)
```
- Diplomatic Protocols and Royal Etiquette (auto: "court")
- Court Intrigue Mechanics and Political Manipulation (auto: "court")
```

### LLM Response (Sonnet 4)
The response invented:
- "Princess Aurelia" (not in lorebook - should be Aradia)
- References to Drakemoor, Verdania, Aetheria, Solmere, Pyrathi (kingdoms not in Excelsia lorebook)
- Generic fantasy court scene disconnected from actual world lore

---

## Root Cause Analysis

### 1. Adjective Forms Not in Keys
| User Term | Lorebook Keys | Match? |
|-----------|---------------|--------|
| "Sunnarian" | "Sunnaria", "Kingdom of Sunnaria" | No |
| "Lunarian" | "Lunaria", "Kingdom of Lunaria" | No |

### 2. Generic Terms Don't Match Specific Entries
| User Term | Available Entries | Issue |
|-----------|-------------------|-------|
| "Princess" | "Princess Aradia", "Sunnarian princess" | Too generic |
| "Court" | Multiple court entries | Matches wrong context |

### 3. No Semantic Understanding
- Keyword matcher is literal, not contextual
- "Sunnarian Court Princess" should imply Sunnaria + royalty + Princess Aradia
- Current system has no concept of relationships or inference

---

## Existing Infrastructure

| Component | Status | Location |
|-----------|--------|----------|
| Keyword Matching | Implemented, integrated | `src/retrieval/keyword-matcher.ts` |
| LLM Entity Extraction | Implemented, integrated | `src/analysis/prompt-analyzer.ts` |
| Fuzzy Entity Matching | Implemented, integrated | `src/retrieval/entity-matcher.ts` |
| Chat Integration | Implemented | `src/ui/routes/chat.ts` |
| Graph Traversal | Designed, not implemented | `ARCHITECTURE.md` |
| Token Budget | Designed, not implemented | `ARCHITECTURE.md` |

---

## Proposed Solution: Entity Extraction Pipeline

### Phase 1: Wire Existing Components (Option 2)

1. Extract entities from user prompt via LLM (prompt-analyzer.ts)
2. Fuzzy match extracted entities to lorebook entries
3. Combine with keyword matches
4. Inject merged context into system prompt

**Expected improvement:**
- "Sunnarian" → LLM extracts "Sunnaria" → fuzzy matches kingdom entry
- "Princess" + "Sunnarian" → LLM extracts "Sunnarian Princess" → fuzzy matches Aradia

### Phase 2: Full Query Pipeline (Option 3 - Future)

- Relationship graph traversal
- Tiered retrieval (Lead/Supporting/Role/Ambient)
- Token budget management
- Scene-focus-based prioritization

---

## Success Metrics

After implementing Option 2, re-test with same prompt:

| Metric | Baseline | Target |
|--------|----------|--------|
| Sunnaria entry injected | No | Yes |
| Princess Aradia injected | No | Yes |
| LLM uses correct character name | No (invented Aurelia) | Yes (Aradia) |
| LLM uses correct kingdoms | No (invented) | Yes (from lorebook) |

---

## Lorebook Key Coverage (for reference)

### Sunnaria
- Keys: "Sunnaria", "Kingdom of Sunnaria", "Golden Rivers", "Sunndor", "River Kingdom"
- Missing: "Sunnarian", "Sunnarians"

### Princess Aradia
- Keys: "Aradia", "Princess Aradia", "Princess of Sunnaria", "Sunnarian princess", "Sunnarian heiress"
- Missing: Generic "princess" alone won't match

### Available Kingdoms in Lorebook
Sunnaria, Lunaria, Ilaria, Limaria, Stuttgart, Lindward, Aeldrin, Ironforge, Zyronia

### Kingdoms NOT in Lorebook (invented by LLM)
Drakemoor, Verdania, Aetheria, Solmere, Pyrathi

---

## Test Results After Entity Extraction (Option 2)

### Date: 2025-12-28

### Context Injected
```
- Kingdom of Sunnaria - The Golden Delta (entity: "Sunnarian Court") ✅ NEW
- Diplomatic Protocols and Royal Etiquette (auto: "court")
- Court Intrigue Mechanics and Political Manipulation (auto: "court")
```

### Results

| Metric | Baseline | After Entity Extraction | Status |
|--------|----------|------------------------|--------|
| Sunnaria entry injected | No | Yes | ✅ Fixed |
| Princess Aradia injected | No | No | ❌ Still missing |
| LLM uses correct kingdoms | No | No (Drakmoor, Valenhall) | ❌ Still inventing |

### Analysis

**What worked:**
- Entity extraction identified "Sunnarian" and fuzzy-matched to "Sunnaria" kingdom entry
- The Sunnaria entry is now injected into context

**What still needs work:**
- "Princess" alone doesn't match "Princess Aradia" (too generic)
- Need relationship graph: "Sunnarian Princess" → Aradia
- LLM still invents foreign kingdoms when they're not injected

### Next Steps (Option 3)
1. Relationship graph traversal: Sunnaria → royalty → Aradia
2. Context-aware matching: "Sunnarian Princess" should fetch Aradia
3. Inject more kingdom entries to prevent invention

---

## Update: Graph Traversal + World Summary Integrated

### Date: 2025-12-29

### What Was Implemented

1. **Relationship Graph Integration**
   - Created `src/example/Excelsia/relationships.ts` with hardcoded relationships for Excelsia
   - Family relationships: daughter-of, spouse-of, member-of
   - Political relationships: rules, works-for
   - Geographic relationships: borders
   - Wired `createRelationshipRetrieval` into chat handler

2. **World Summary Context**
   - Added explicit kingdom list to system prompt:
     > "The continent of Excelsia contains exactly these kingdoms: Sunnaria, Lunaria, Ilaria, Limaria, Lindward, Stuttgart, Aeldrin, Ironforge, Zyronia. Do not invent or reference any other kingdoms."

3. **Chat Handler Updates**
   - After entity+keyword matching, expand via relationship graph (maxDepth: 2)
   - Related entries marked with `reason: "related"` in injectedEntries
   - World summary always included in system prompt

### Expected Improvement

| Prompt | Before | After |
|--------|--------|-------|
| "Sunnarian Princess" | Sunnaria injected | Sunnaria + Alaric + Aradia (via graph) |
| Any prompt | Kingdoms invented | Only valid kingdoms used (world summary) |

### Files Changed

- `src/example/Excelsia/relationships.ts` - Hardcoded relationships
- `src/ui/routes/lorebook.ts` - Added `getRelationshipStore()`, `getWorldSummary()`
- `src/ui/routes/chat.ts` - Integrated relationship retrieval and world summary

### Testing Needed

Manual testing recommended with prompts like:
- "The Sunnarian Court Princess Comedy"
- "A ball at the Lunarian palace"
- "Princess Aradia meets Princess Isabella"

Should now see related entries expanded via graph and no invented kingdoms.
