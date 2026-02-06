# CLAUDE.md

This file provides context for AI assistants working on the WorldStateMachine project.

## Project Overview

WorldStateMachine is a **world state constraint engine** that prevents LLMs from generating inconsistent roleplay prose. It maintains external timeline, map, and calendar state as structured data, enabling deterministic fact queries instead of hallucinated values.

**Core idea:** Transform lorebook prose blobs into structured entities, facts, and relationships, then enforce consistency constraints during LLM scene generation.

## Tech Stack

- **Runtime:** Bun (use `bun` for everything - testing, running, package management)
- **Language:** TypeScript (strict mode, ESNext target)
- **Linting/Formatting:** Biome (replaces ESLint + Prettier)
- **Testing:** Bun's native test runner (`bun:test`)
- **Git hooks:** Husky (pre-commit runs format, typecheck, test, lint)
- **CI:** GitHub Actions on PRs and pushes to main
- **Frontend:** Vanilla JS/TS (no framework)
- **LLM integration:** OpenRouter API

## Quick Reference Commands

```bash
bun test                # Run all tests
bun run check           # Lint + format with auto-fix (biome check --write)
bun run typecheck       # TypeScript type checking (tsc --noEmit)
bun run lint            # Linter only
bun run format          # Formatter only
bun run start           # Run bootstrap (activate extensions)
bun run ui              # Start dev chat UI server
```

**Pre-commit hook runs (in order):** format -> typecheck -> test -> lint

**CI runs:** `bun install --frozen-lockfile` -> `bunx @biomejs/biome ci .` -> `bun run typecheck` -> `bun test`

## Project Structure

```
src/
  core-types/              # Fundamental data models (Entity, Event, Fact, Relationship)
  extension-system/        # Extension loading, bootstrap, config management
    types.ts               # Core extension/config type definitions
    bootstrap.ts           # Activation orchestrator (dependency-aware waves)
    bootstrap-runner.ts    # CLI entrypoint for `bun run start`
    define-extension.ts    # Extension definition helper
    config-loader/         # Load and validate extensions.json
    config-writer/         # Persist normalized config
  example/
    Excelsia/              # Sample world test data (11 JSON lorebook files)
  integration.test.ts      # End-to-end integration tests

extensions/
  core/
    1-load-world-data/     # Data importers (SillyTavern lorebook)
    2-store-timeline/      # In-memory stores (fact, event, entity, relationship, lexicon)
    3-validate-consistency/ # Validation rules (entity-exists, world-boundary)
    4-build-scene-context/  # Context building (keyword/entity matching, graph expansion)
    5-send-scene-context/   # LLM clients (OpenRouter)
    6-provide-ui/           # Dev chat web interface

docs/                      # Architecture documentation (35+ files)
  vision.md                # Complete system vision
  current.md               # Current implementation status
  roadmap.md               # M1-M11 milestones
  decisions.md             # Design rationale
  architecture/
    core/                  # Current architecture docs
    future/                # Planned architecture docs

extensions.json            # Central config listing enabled extensions per stage
```

### Path Aliases (defined in tsconfig.json)

- `@core/*` -> `src/core-types/*` (Entity, Event, Fact, Relationship)
- `@ext/*` -> `extensions/*` (all extensions)
- `@ext-system/*` -> `src/extension-system/*` (bootstrap, types, config)

## Architecture

### Six-Stage Extension Pipeline

Extensions are organized into 6 ordered stages, configured in `extensions.json`:

| Stage | Key | Purpose | Model |
|-------|-----|---------|-------|
| 1 | stores | Storage backends (memory, future: postgres/sqlite) | Slot-based (required) |
| 2 | loaders | Import data (SillyTavern JSON, future: CSV, DB) | Additive |
| 3 | validators | Consistency validation rules | Additive |
| 4 | contextBuilders | Build LLM context from world state | Additive |
| 5 | senders | Send to LLM or export | Slot-based |
| 6 | ui | User interfaces | Additive |

Stage N only depends on stages 1 to N-1. No cross-stage circular dependencies.

### Core Types

```
Entity   - World object with identity (id, worldId, name, aliases, group)
Fact     - Atomic state assertion with temporal bounds (subject, property, value, validFrom/validTo)
Event    - Timeline milestone (timestamp, participants, visibility, outcomes, prose)
Relationship - Typed connection between entities (from, type, to, validFrom/validTo)
```

### Extension Definition Pattern

Extensions use `defineExtension` and are registered in `extensions.json`:

```typescript
export default defineExtension({
    name: "@core/memory-fact-store",
    version: "1.0.0",
    kind: "store",
    after: [],  // within-stage ordering dependencies
    activate: (context, options?) => {
        context.factStore = createFactStore();
        return undefined;
    },
});
```

### Bootstrap Flow

1. Load `extensions.json` -> validate stages -> dynamic import modules
2. Validate extension kind matches stage -> register in stage maps
3. Build activation order (dependency-aware) -> activate in parallel waves
4. Aggregate contributions into ExtensionContext -> validate required slots
5. Persist normalized config (write-back)

## Hard Rules

1. **TDD is mandatory.** Failing test first -> minimum code to pass -> refactor. No exceptions.
2. **No comments.** Code must be self-documenting through naming and structure.
3. **Zero TypeScript errors.** Must always pass `bun run typecheck` and `bun run check`.
4. **Clean code is non-negotiable.** SOLID principles + Four Rules of Simple Design (passes tests, reveals intention, no duplication, fewest elements). No placeholder code or TODO comments.

## Code Style

- **Arrow functions** over function declarations
- **Types** over interfaces (`type X = {...}` not `interface X {...}`)
- **No ES6 classes** - use plain objects and functions
- **No comments** - rename or restructure instead
- **No default exports** - named exports only (exception: extension definitions use `export default defineExtension`)
- **Const by default** - use `let` only when reassignment is necessary
- **Early returns** - guard clauses to avoid deep nesting
- **Descriptive names** - longer names are fine if clearer

### Formatting (Biome)

- 4-space indentation
- 80-character line width
- Double quotes for strings
- Organized imports (auto-sorted)

## Testing

### Framework

Tests use Bun's native test module (`bun:test`) and are co-located with source files using `.test.ts` suffix.

### ZOMBIES Method

Apply ZOMBIES to determine what tests to write BEFORE implementation:

- **Z**ero - Empty/null/zero inputs
- **O**ne - Single item behavior
- **M**any - Multiple items, collections
- **B**oundary - Edge cases, limits
- **I**nterface - Is the API ergonomic?
- **E**xceptions - Error cases
- **S**imple - Happy path scenarios

### What to Test

- **Behavior, not implementation.** If a test just verifies a function returns what you pass in, it's useless.
- **Things that USE data, not data itself.** A `Fact` type needs no tests; a `FactStore` that queries facts does.

### What NOT to Test

- Factory functions that just copy properties
- Type definitions
- Simple data transformations that TypeScript already validates
- Value objects (types with no behavior)

### Test Workflow

1. Identify what behavior needs testing
2. Apply ZOMBIES to enumerate test cases
3. Capture planned tests with `test.todo("description")`
4. Implement ONE test at a time: `test.todo` -> `test` -> pass -> refactor
5. Refactor tests for readability as the suite grows

## Git & Commits

- **Conventional Commits:** `<type>(<scope>): <subject>` (e.g., `feat(core):`, `refactor(tests):`, `docs:`)
- **Logical Grouping:** Group similar changes into distinct commits
- **Verify before commit:** All tests pass and types are clean

## Current Project Status

**Last updated:** 2026-02-06

- **Milestones M1-M4:** Complete (basic validation, relationship graph, temporal facts, events)
- **Extension system redesign:** Complete (config-driven 6-stage pipeline, bootstrap, config write-back)
- **Next milestone:** M5 - Epistemic State (POV-filtered knowledge, tool-calling architecture)
- **Proof-of-concept target:** M6 - Multi-Agent Orchestration

### Milestone Dependency Chain

```
M1 (Validation) -> M2 (Relationships) -> M3 (Timeline) -> M4 (Events)
  -> M5 (Epistemic State) -> M6 (Multi-Agent) [proof-of-concept]
  -> M7 (Geography) -> M8 (Travel) -> M9 (Map) -> M10 (Calendar) -> M11 (Effects)
```

## Essential Reading

Before starting significant work, read these docs:

1. **[docs/vision.md](docs/vision.md)** - Complete constraint engine vision
2. **[docs/current.md](docs/current.md)** - Current implementation status
3. **[docs/roadmap.md](docs/roadmap.md)** - M1-M11 milestones (proof-of-concept at M6)
4. **[docs/decisions.md](docs/decisions.md)** - Design rationale and principles
5. **[AGENTS.md](AGENTS.md)** - Detailed coding conventions and testing strategy
