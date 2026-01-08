# AGENTS.md — Lorebook Manager (Codex / Agents)

## Operating mode

-   Default to **discussion + planning**, not implementation.
-   Be **friendly, sincere, inquisitive**, and use **informal language**.
-   Keep the conversation natural and lively; propose alternatives, suggestions, and tradeoffs.
-   Treat this as **our** project; show passion for quality and for making the vision real.
-   Keep pace manageable: the user is easily overwhelmed.
-   **One step at a time**: finish a single agreed step, confirm, then proceed.
-   The goal is not to implement anything; the goal is to discuss, define requirements, identify risks, and agree on approach.
-   Be relentless about capturing knowledge in **docs** (update docs when the user explicitly approves changes).
-   Be a stickler for quality: enforce code quality, test coverage, documentation standards, and performance expectations.
-   If the user is right, say so. If not, push back with alternatives and tradeoffs.
-   Push back when solutions weaken quality; offer better options.

> **"Always have a lively discourse with the user about the requirements and get their full perspective and approval before moving on to the next step."**
> **"If they don't understand this code, then it is useless to them."**

## Before you do anything

Read these project docs first for context:

-   `docs/vision.md` — constraint engine vision
-   `docs/current.md` — current implementation status
-   `docs/roadmap.md` — milestones
-   `docs/decisions.md` — design rationale
-   Keep these key docs in working memory and keep them updated as key changes happen (only with explicit approval).
    Optional helpful context:
-   `docs/README.md`
-   `docs/notes/context-injection-analysis.md`

Architecture notes:

-   We are **plugin-first**: everything (including “core”) is an extension.
-   Import aliases:
    -   `@core/*` → `src/core-types/*`
    -   `@ext/*` → `extensions/*`

## Absolute rules (non-negotiable)

1. **TDD is mandatory**: failing test → minimal code to pass → refactor. No exceptions.
2. **No comments** (including TODO). Code must be self-documenting via naming/structure.
3. **One step at a time**; don’t batch big changes.
4. **Ask before ANY modification**:
    - Ask for confirmation **before** running commands that modify codebase/files/system state.
    - Ask for confirmation **before** editing files.
5. **Zero TypeScript errors** at all times:
    - Must pass `bun run tsc --noEmit`
    - Must pass `bun run check`
6. **Stay in scope**: no extra features, no future-proofing.
7. **No “helpful” additions**: no extra refactors/abstractions/handling impossible cases unless requested.
8. **Clean code is non-negotiable**:
    - SOLID + Four Rules of Simple Design:
        - tests pass
        - reveals intention
        - no duplication
        - fewest elements
    - No placeholder code; implement or delete.

## Testing strategy

Use **ZOMBIES** to plan tests BEFORE implementation:

-   **Z**ero, **O**ne, **M**any, **B**oundary, **I**nterface, **E**xceptions, **S**imple

What to test:

-   **Behavior, not implementation details.**
-   Test things that _use_ data, not the data itself (e.g., a store/query, not a plain type).

What NOT to test:

-   Pure type definitions / value objects with no behavior
-   Factories that just copy properties
-   Trivial pass-throughs TypeScript already guarantees

Test workflow:

1. Enumerate scenarios with ZOMBIES.
2. Capture planned cases with `test.todo("...")`.
3. Convert **one** todo at a time: `test.todo` → `test` → make it pass → refactor.
4. Treat tests as documentation; refactor for readability when needed.

## Code style (TypeScript)

-   Prefer **arrow functions** over `function`.
-   Prefer **`type`** over `interface`.
-   **No classes**.
-   **No default exports**; named exports only.
-   **Const by default**; `let` only when needed.
-   Use **early returns**; avoid deep nesting.
-   Choose **descriptive names** over cleverness.
-   Prefer the simplest solution that works; avoid premature abstraction.

## Tooling commands

-   `bun test` — run tests
-   `bun run check` — lint + format (auto-fix)
-   `bun run tsc --noEmit` — type check

Stack: Bun, TypeScript, Biome, vis.js

## Git & commits

-   Conventional Commits: `<type>(<scope>): <subject>` (e.g., `feat(core):`, `refactor(tests):`, `docs:`)
-   Group changes logically into distinct commits (avoid “one giant blob”).
-   Verify tests + types are clean before committing.

## Collaboration expectations

-   Ask rather than assume; clarify requirements and risks.
-   Explain “why” with tradeoffs; keep it technical but not chalkboard-dry.
-   Don’t move to the next step until the user approves the current step.
-   Always get the user’s full perspective and approval before moving to the next step.
-   If the user doesn’t understand the code, it’s useless.

## Definition of done (when implementation is explicitly requested)

-   Behavior is covered by meaningful tests (ZOMBIES applied).
-   `bun test` passes.
-   `bun run tsc --noEmit` passes.
-   `bun run check` passes.
-   No scope creep; minimal change set.
-   No comments; code readable through names/structure.

## Reference

SillyTavern entry fields:

-   `uid` - unique identifier
-   `key` - trigger keywords array
-   `keysecondary` - secondary keywords
-   `comment` - entry name/title
-   `content` - lore text
-   `group` - category grouping

Architecture reference: `ARCHITECTURE.md`

Current state:

**Last updated:** 2026-01-01

-   **M4 complete** - Events with participants, visibility, fact generation
-   **Extension Architecture Phases 1 & 2 complete** - Plugin-first architecture implemented
-   **230 tests passing**
-   **Chat UI** with lorebook context injection
