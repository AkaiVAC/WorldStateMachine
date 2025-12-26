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

- Project scaffolded (Bun + TypeScript + Biome)
- Architecture documented in ARCHITECTURE.md
- Ready to begin implementation
