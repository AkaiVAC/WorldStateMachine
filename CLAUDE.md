# Lorebook Manager

## 🚨 NEXT SESSION START HERE

**[docs/NEXT_SESSION.md](docs/NEXT_SESSION.md)** - **Extension Architecture Implementation Plan**

We're pivoting to a plugin-first architecture where everything (including core) is an extension. Read this document first to understand the new structure and implementation plan!

---

## Essential Context for Each Session

**Read these docs to understand the project:**

1. **[docs/vision.md](docs/vision.md)** - Complete constraint engine vision (what we're building)
2. **[docs/current.md](docs/current.md)** - Current implementation status (M4 complete, 192 tests)
3. **[docs/roadmap.md](docs/roadmap.md)** - M1-M11 milestones (proof-of-concept at M6)
4. **[docs/decisions.md](docs/decisions.md)** - Design rationale and principles

**Additional context:**
- **[docs/README.md](docs/README.md)** - Architecture overview and index
- **[docs/notes/context-injection-analysis.md](docs/notes/context-injection-analysis.md)** - Latest research and testing

---

## Hard Rules

1. **TDD is mandatory.** Failing test first → minimum code to pass → refactor. No exceptions.
2. **No comments.** Code must be self-documenting through naming and structure.
3. **One step at a time.** Complete one thing, confirm it works, then move to the next.
4. **Ask before ANY modification.** Always ask for confirmation before executing commands that modify the codebase, file system, or system state.
5. **Zero TypeScript errors.** The project must always pass `bun run tsc --noEmit` and `bun run check`.
6. **Stay in scope.** No future features unless explicitly requested.
7. **No "helpful" additions.** No extra features, refactoring, error handling for impossible cases, or abstractions "for later."

---

## Git & Commits

- **Conventional Commits:** Use the format `<type>(<scope>): <subject>` (e.g., `feat(core):`, `refactor(tests):`, `docs:`).
- **Logical Grouping:** Group similar changes into distinct commits rather than one giant blob.
- **Verify before Commit:** Ensure all tests pass and types are clean before committing.

---

## Testing Strategy

### ZOMBIES

Use ZOMBIES to determine what tests to write BEFORE implementation:

- **Z**ero - Empty/null/zero inputs
- **O**ne - Single item behavior
- **M**any - Multiple items, collections
- **B**oundary - Edge cases, limits
- **I**nterface - Is the API ergonomic?
- **E**xceptions - Error cases
- **S**imple - Happy path scenarios

### What to Test

- **Test behavior, not implementation.** If a test just verifies a function returns what you pass in, it's useless.
- **Value objects (types with no behavior) don't need tests.** The type system handles that.
- **Test things that USE data, not the data itself.** A `Fact` type needs no tests; a `FactStore` that queries facts does.

### What NOT to Test

- Factory functions that just copy properties
- Type definitions
- Simple data transformations that TypeScript already validates

### Test Workflow

1. Identify what behavior needs testing
2. Apply ZOMBIES to enumerate test cases
3. Capture planned tests with `test.todo("description")`
4. Implement ONE test at a time: `test.todo` → `test` → pass → refactor
5. Refactor tests for readability as the suite grows

### Test Readability

- Tests are documentation. Keep them readable.
- Extract helpers if setup becomes repetitive (after 3+ similar setups)
- Use descriptive test names that explain the scenario
- Refactor tests alongside production code

---

## Code Style

### TypeScript Conventions

- **Arrow functions over function declarations**
- **Types over interfaces** (use `type X = {...}` not `interface X {...}`)
- **No ES6 classes** - use plain objects and functions
- **No comments** - if code needs explanation, rename or restructure
- **No default exports** - use named exports only
- **Const by default** - use `let` only when reassignment is necessary
- **Early returns** - avoid deep nesting with guard clauses
- **Descriptive names** - longer names are fine if they're clearer

### Philosophy

- Simplest solution that works
- Three similar lines beats a premature abstraction
- Types are documentation
- Build only what's needed now

---

## Tooling

```bash
bun test              # Run tests
bun run check         # Lint + format (auto-fix)
bun run tsc --noEmit  # Type check
```

Stack: Bun, TypeScript, Biome, vis.js

---

## Reference

### SillyTavern Entry Fields

- `uid` - unique identifier
- `key` - trigger keywords array
- `keysecondary` - secondary keywords
- `comment` - entry name/title
- `content` - lore text
- `group` - category grouping

Test data: `Excelsia/` (11 JSON files)

### Architecture

See **ARCHITECTURE.md** for the full design (timeline-centric model, facts, retrieval, etc.)

---

## Working Style

This is a collaboration. Discuss approaches, explain reasoning, consider alternatives. The user wants to understand *why*, not just *what*.

**Ask** rather than assume. **Confirm** before implementing.

---

## Current State

**Last updated:** 2026-01-01

- **M4 complete** - Events with participants, visibility, fact generation
- **Extension Architecture Phases 1 & 2 complete** - Plugin-first architecture implemented
- **230 tests passing**
- **Chat UI** with lorebook context injection
- **Next:** Phase 3 (Runtime boot system) - see [docs/NEXT_SESSION.md](docs/NEXT_SESSION.md)

**For details:** See the Essential Context section above

### Path Aliases

Use these import aliases (defined in `tsconfig.json`):
- `@core/*` → `src/core-types/*` (fundamental types: Event, Fact, Entity, Relationship)
- `@ext/*` → `extensions/*` (all extensions including core)
