# World State Machine

A constraint engine that prevents LLMs from generating inconsistent roleplay prose. Maintains external timeline, map, and calendar state as structured data, enabling deterministic fact queries instead of hallucinated values.

## Current Status

**Clean rewrite in progress.** Prior project completed M1–M4 with a custom extension system. This iteration rebuilds from the core data model on Neo4j + Mastra + MCP TypeScript SDK.

**Next step:** Initialize `mcp/` project (Bun, TypeScript, Biome, Podman compose for Neo4j).

## Docs

- [docs/vision.md](docs/vision.md) - End-state vision (three pillars, constraint packages, validation loop)
- [docs/roadmap.md](docs/roadmap.md) - M1–M11 milestone specs
- [docs/decisions.md](docs/decisions.md) - Design rationale (append-only)
- [docs/architecture/core/](docs/architecture/core/) - Core architecture (timeline, epistemic state, validation, storage)
- [docs/architecture/future/](docs/architecture/future/) - Planned architecture (effects, scene execution, calendar, map)
- [docs/architecture/reference/](docs/architecture/reference/) - Prior art and open questions
