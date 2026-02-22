# Excelsia Worldbook

## Project Overview

A world state constraint engine (in `mcp/`) that prevents LLMs from generating inconsistent roleplay prose. It maintains external timeline, map, and calendar state as structured data, enabling deterministic fact queries instead of hallucinated values.

**Core idea:** Transform lorebook prose into structured entities, facts, and relationships in a graph database, then enforce consistency constraints during LLM scene generation via MCP tools.

## Project Structure

- `world/` — Lorebook reference entries and stories (characters, geography, factions, vignettes)
- `docs/` — Architecture documents, design decisions, roadmap, vision (from prior project, kept current)
- `mcp/` — World state constraint engine (TypeScript, MCP server)

## How We Work

- **Nothing without approval.** Don't add content, create files, or make decisions without explicit user consent. Discuss first, act only when asked.
- **Brainstorm actively.** Propose ideas, suggest approaches, surface relevant context. Propose, don't prescribe.
- **Grounded and consistent.** When work needs detail that doesn't exist yet, stop and define it first with user approval. That definition becomes the source of truth going forward.
- **One step at a time.** The user can be overwhelmed easily. Discuss one element at a time with one option, get approval, then move to the next. Don't front-load all decisions.
- **Be conversational, not pushy.** Don't repeatedly ask "should I do it?" or "want me to start?" — let the discussion flow naturally. The user will say when they're ready.
- **Keep docs current.** When a decision is made, an approach changes, or something becomes outdated, update `docs/` immediately. Documentation must reflect reality at all times — stale docs are worse than no docs.
- **Single source of truth.** Each kind of information lives in exactly one file. Other files point to it, never duplicate it. See "Documentation Ownership" below.

## Tech Stack

- **Runtime:** Bun (testing, running, package management — use `bun` for everything)
- **Language:** TypeScript (strict mode)
- **Linting/Formatting:** Biome
- **Testing:** Bun's native test runner (`bun:test`)
- **Architecture tests:** `dependency-cruiser` (deferred — see Hard Rules below)
- **Graph database:** Neo4j Community Edition (GPLv3)
- **Containerization:** Podman (for Neo4j)
- **Agent orchestration:** Mastra
- **LLM integration:** MCP TypeScript SDK (Claude), OpenRouter API (other models)
- **Git hooks:** Husky (pre-commit: format, typecheck, test, lint)

## Architecture

### Core Data Model

Neo4j-native graph model (see `docs/decisions.md`):

- **Entity** — Node (`:Entity:<Category>`) with identity (id, name, aliases, category). Category maps to a Neo4j node label.
- **Fact** — Node (`:Fact`) connected to its subject Entity via `ABOUT` edge. Has temporal bounds (validFrom/validTo). Connected to source Event via `PRODUCED` edge.
- **Event** — Node (`:Event`) connected to participant Entities via `PARTICIPANT` edges. Produces Facts via `PRODUCED` edges.
- **Relationship** — Neo4j edge between Entity nodes using broad type categories (`:FAMILY`, `:POLITICAL`, `:SOCIAL`, `:GEOGRAPHIC`) with a `subtype` property and temporal bounds. Two-layer write validation: synonym normalization + canonical registry per world.

### Key Architectural Decisions

These are settled and non-negotiable (rationale in `docs/decisions.md`):

- **Lorebook is import format, not runtime model.** Prose is ETL'd into entities, facts, and relationships.
- **Tool-calling over context-stuffing.** LLMs query facts via MCP tools, not massive context injection.
- **The LLM is not the state keeper.** Neo4j maintains world state. The LLM just generates language.
- **Epistemic isolation is literal.** Characters' LLM contexts only contain facts they actually know.
- **Events are source of truth, facts are derived.** Preserves context and enables epistemic state.
- **World state as queryable attributes.** All entities (characters, kingdoms, economies) have structured facts — not just prose.
- **Characters are complete people.** Goals, motivations, fears, and values are queryable facts, not just physical stats.
- **Store verbose, render compact.** Storage is structured for queries. LLM context is token-efficient.

### MCP Tool Surface

```
getFacts(entityId, timestamp?)       → All facts for entity at given time
getKnowledge(characterId, timestamp) → POV-filtered facts (epistemic isolation)
getRelationships(entityId, types?)   → Relationships for entity
searchEntities(query)                → Fuzzy entity discovery
```

### Milestone Roadmap

Prior project completed M1–M4. This project is a clean rewrite starting from the core data model, now backed by Neo4j + Mastra + MCP.

```
M1 (Validation) → M2 (Relationships) → M3 (Timeline) → M4 (Events)
  → M5 (Epistemic State) → M6 (Multi-Agent) [proof-of-concept]
  → M7 (Geography) → M8 (Travel) → M9 (Map) → M10 (Calendar) → M11 (Effects)
```

## Hard Rules

### Driving Principle

**If I don't understand the code, it's useless to me.** This applies even if the code works. Clarity is not optional — it is the product.

### Non-Negotiable

1. **TDD is mandatory.** Failing test first → minimum code to pass → refactor. No exceptions.
2. **ZOMBIES method is mandatory.** Apply it to enumerate test cases before implementation. Zero, One, Many, Boundary, Interface, Exceptions, Simple.
3. **Four Rules of Simple Design.** Passes tests, reveals intention, no duplication, fewest elements.
4. **SOLID principles.** Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion.
5. **Architecture tests.** Enforce layer boundaries and structural rules as automated tests. No circular dependencies. Core types import nothing. Layers respect their boundaries. **Tooling deferred** — neither ArchUnitTS nor ts-arch supports Bun's test runner. Add `dependency-cruiser` once there are enough layers to enforce (target: when the first store layer lands).
6. **Zero TypeScript errors.** Must always pass typecheck.
7. **No comments.** Code must be self-documenting through naming and structure. If code needs a comment, rename or restructure.

## Code Style

- **Arrow functions** over function declarations
- **Types** over interfaces (`type X = {...}` not `interface X {...}`)
- **No ES6 classes** — plain objects and functions
- **Const by default** — `let` only when reassignment is necessary
- **Early returns** — guard clauses to avoid deep nesting
- **Descriptive names** — longer is fine if clearer
- **Named exports only** — no default exports

### Formatting (Biome)

- 2-space indentation
- 80-character line width
- Double quotes for strings
- Organized imports (auto-sorted)

## Testing

### What to Test

- Behavior, not implementation
- Things that USE data, not data itself
- A `Fact` type needs no tests; a store that queries facts does

### What NOT to Test

- Factory functions that just copy properties
- Type definitions
- Simple data transformations TypeScript already validates
- Value objects with no behavior

### Test Workflow

1. Identify what behavior needs testing
2. Apply ZOMBIES to enumerate test cases
3. Capture planned tests with `test.todo("description")`
4. Implement ONE test at a time: `test.todo` → `test` → pass → refactor
5. Refactor tests for readability as the suite grows

## Git & Commits

- **Conventional Commits:** `<type>(<scope>): <subject>` (e.g., `feat(core):`, `refactor(tests):`, `docs:`)
- **Logical grouping:** Similar changes in distinct commits
- **Verify before commit:** All tests pass, types clean

## Documentation Ownership

Each kind of information has exactly one source of truth. Other files may point to it but must never duplicate it.

| What | Source of truth |
|------|----------------|
| Rules, conventions, code style | `CLAUDE.md` (this file) |
| Current status and next step | `README.md` |
| Milestone specs (detailed) | `docs/roadmap.md` |
| Design rationale (append-only) | `docs/decisions.md` |
| End-state vision | `docs/vision.md` |

**When progress happens:** Update `README.md` "Current Status" section. That's it — don't duplicate the status elsewhere.

**When a decision is made:** Append to `docs/decisions.md` and update the summary table. If it affects the core data model or rules, update the relevant section in this file.

**When a milestone spec changes:** Update `docs/roadmap.md`. Don't copy spec details into other files.

## Development Tools

These tools are configured in `.claude/` and available in every session.

### Always Active

- **Test guardian** — Async hook that runs `bun tsc --noEmit` and `bun test` after every file edit. Failures surface automatically. Config: `.claude/settings.json`.

### Slash Commands

- **`/commit-push`** — Analyzes changes, groups into scoped micro-commits with conventional-commit messages, presents plan for review, then commits and pushes. Skill: `.claude/skills/commit-push/`.
- **`/create-pr`** — Creates a pull request from the current branch. Analyzes all commits vs main, drafts title and summary, creates via `gh`. Skill: `.claude/skills/create-pr/`.

### Background Agents

- **doc-updater** — After a decision or progress is made, launch this in the background to update all relevant docs per ownership rules. Review changes via `git diff`. Agent: `.claude/agents/doc-updater.md`.

## Essential Reading

Before starting significant engine work, read `README.md` for current status, then these reference documents:

1. **[docs/vision.md](docs/vision.md)** — Constraint engine vision (three pillars, constraint packages, validation loop)
2. **[docs/roadmap.md](docs/roadmap.md)** — M1–M11 milestones with detailed specs
3. **[docs/decisions.md](docs/decisions.md)** — Design rationale and settled principles
