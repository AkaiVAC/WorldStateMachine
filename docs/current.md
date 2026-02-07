---
title: "Current Implementation Status"
status: "current"
keywords:
  - "current status"
  - "M4 complete"
  - "extension system complete"
  - "context building pipeline"
  - "what works"
  - "known issues"
related:
  - "./roadmap.md"
  - "./vision.md"
  - "./decisions.md"
---
# Current Implementation Status

**Last updated:** 2026-02-07

**Milestones completed:** M1-M4 + Extension System
**Next milestone:** M5 (Tool-Calling Spike)
**Tests:** 221 passing, 0 failures
**Lint:** Zero warnings, zero errors

---

## What Works Today

### Core Data Model

Four fundamental types in `src/core-types/`:

| Type | Purpose | Fields |
|------|---------|--------|
| Entity | World object with identity | id, worldId, name, aliases, group |
| Fact | Temporal state assertion | subject, property, value, validFrom/validTo, causedBy |
| Event | Timeline milestone | timestamp, participants, visibility, outcomes, prose |
| Relationship | Typed entity connection | from, type, to, validFrom/validTo |

### Extension System (Complete)

Config-driven 6-stage pipeline with 12 extensions:

| Stage | Extensions | Status |
|-------|-----------|--------|
| 1. stores | memory-fact-store, memory-entity-store, memory-event-store, memory-relationship-store | ✅ |
| 2. loaders | sillytavern-loader | ✅ |
| 3. validators | (wired directly in chat handler — see below) | ✅ |
| 4. contextBuilders | prompt-analyzer, entity-matcher, keyword-matcher, lorebook-loader, relationship-retrieval | ✅ |
| 5. senders | openrouter-client | ✅ |
| 6. ui | dev-chat | ✅ |

**Features:**
- Dependency-aware wave activation (parallel within stages)
- Config write-back with normalization
- Required slot validation (factStore, eventStore, entityStore)
- `needs:dependency` status tracking

### Context Building Pipeline (Working End-to-End)

The core value proposition is implemented and integrated:

```
User message: "The Sunnarian princess enters the garden"
    ↓
1. Prompt Analyzer (LLM) → extracts "princess" as entity reference
2. Entity Matcher (fuzzy) → "princess" matches Princess Aradia
3. Keyword Matcher (regex) → "Sunnarian" matches Sunnaria entry
4. Relationship Expansion → Sunnaria → Alaric (rules), Aradia (member)
5. Lorebook Injection → all matched entries added to system prompt
6. LLM Generation → response with full world context
```

**Tested with real scenarios** in `extensions/core/4-build-scene-context/integration-e2e.test.ts`.

### In-Memory Stores

| Store | Capabilities |
|-------|-------------|
| FactStore | Temporal queries with half-open intervals, fact supercession |
| EntityStore | Lookup by ID, name (case-insensitive), world filtering |
| EventStore | Temporal queries, participant/visibility filtering |
| RelationshipStore | Directional queries, type filtering |
| GraphTraversal | BFS with depth limiting, cycle detection, type/direction filters |
| Lexicon | Case-insensitive term matching |

### Validation Framework

Pluggable rule system with two rules:
- **EntityExistsRule:** Fuzzy matching with stemming (Sunnarian → Sunnaria), suggestions for unknown entities
- **WorldBoundaryRule:** LLM-powered anachronism detection

### Dev Chat UI

Working web interface with:
- Chat with lorebook context injection
- Session persistence (filesystem-backed)
- Model selection (OpenRouter)
- Manual entry inclusion/exclusion
- Lorebook browser with grouping

### SillyTavern Loader

Imports SillyTavern lorebook JSON format:
- Comment → name, keys → aliases
- Handles disabled entries, missing fields
- 11 Excelsia lorebook files as test data (106 entries)

---

## What Doesn't Work Yet

### Validators Are Libraries, Not Extensions

The validation framework, entity-exists rule, and world-boundary rule are pure library code, not extensions. They can't participate in the extension system because validators (stage 3) need the prompt analyzer (stage 4) — a cross-stage dependency that the pipeline architecture doesn't support.

**Current wiring:** The chat handler (`routes/chat.ts`) directly constructs validators using factory functions, with a cached analyzer to avoid double LLM calls. Validation runs on every chat message and violations are returned in the response.

### No Persistence

All stores are in-memory. Data is lost on restart. The SillyTavern loader re-imports on every bootstrap.

### No Epistemic State

Events track participants and visibility, but there's no `getKnowledge(characterId, timestamp)` query yet. This is M7.

### No Tool-Calling

The LLM receives context via prompt injection, not via tools. The LLM can still hallucinate values. This is M8, pending the M5 spike.

### No Fact Extraction from Scenes

Generated prose creates no new facts or events. The generate → extract → commit loop doesn't exist yet. This is M11.

---

## Test Coverage

**221 tests across 23 test files:**

| Area | Tests | Coverage |
|------|-------|----------|
| Core stores (fact, entity, event, relationship) | ~80 | Temporal queries, CRUD, edge cases |
| Graph traversal | ~25 | Depth, filtering, cycles, multi-hop |
| Context builders (analyzer, matcher, retrieval) | ~50 | Fuzzy matching, keyword extraction, expansion |
| Validation rules | ~15 | Entity exists, fuzzy suggestions |
| Extension system (bootstrap, config) | ~30 | Wave activation, config validation, write-back |
| Integration (end-to-end) | ~15 | Full pipeline, import, retrieval |
| UI (server, sessions, routes) | ~6 | Router, session CRUD |

**Methodology:** ZOMBIES applied consistently (Zero, One, Many, Boundary, Interface, Exception, Simple).

**Gaps:** No frontend DOM tests, no config-writer tests, no WorldBoundaryRule tests.

---

## Architecture Observations

### Strengths
- Clean 6-stage pipeline prevents architectural mistakes
- Test discipline is excellent (behavior-focused, ZOMBIES)
- Context building pipeline proves the concept works
- Extension system is well-designed and thoroughly tested

### Areas for Improvement
- `ExtensionContext` uses `unknown[]` for collection types, losing type safety at integration boundaries
- OpenRouter client lacks retry logic, timeouts, and streaming
- No cost/latency model for epistemic isolation (separate LLM calls per character)

---

## See also
- [roadmap.md](./roadmap.md) — M5-M18 implementation plan
- [vision.md](./vision.md) — Complete constraint engine vision
- [decisions.md](./decisions.md) — Design rationale
