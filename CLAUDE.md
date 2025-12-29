# Lorebook Manager

## Hard Rules

1. **TDD is mandatory.** Failing test first → minimum code to pass → refactor. No exceptions.
2. **No comments.** Code must be self-documenting through naming and structure.
3. **One step at a time.** Complete one thing, confirm it works, then move to the next.
4. **Ask before large changes.** Confirm with user before modifying multiple files or making architectural decisions.
5. **Stay in scope.** No future features unless explicitly requested.
6. **No "helpful" additions.** No extra features, refactoring, error handling for impossible cases, or abstractions "for later."

Run tests: `bun test`

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
bun test          # Run tests
bun run check     # Lint + format (auto-fix)
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

**Last updated:** 2025-12-29

- **M1 complete** - Basic validation and context injection working
- **114 tests passing** (113 pass, 1 error)
- **Chat UI** with lorebook context injection
- **Next:** M2 (Relationship Graph) - see ROADMAP.md

**For current implementation status:** See CURRENT.md
**For full vision:** See VISION.md
**For implementation path:** See ROADMAP.md
