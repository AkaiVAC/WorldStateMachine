---
title: "Prior Art"
status: "reference"
keywords:
  - "prior art"
  - "related systems"
  - "temporal knowledge graphs"
  - "multi-agent narratives"
  - "tool-calling comparison"
  - "research references"
related:
  - "../../vision.md"
  - "../../roadmap.md"
  - "../../decisions.md"
  - "../core/01-problem.md"
---
# Prior Art

## 12. Relationship to Prior Art

### 12.1 Foundational Concepts

#### 12.1.1 Temporal Knowledge Graph

Our fact model mirrors RDF with temporal extension:
```
RDF:  Subject → Predicate → Object
Ours: Subject → Property  → Value (+ time range)
```

#### 12.1.2 Bi-Temporal Modeling

- **Valid time:** When a fact is true in the story world (our validFrom/validTo)
- **Transaction time:** When a fact was recorded (for undo/audit - future feature)

SQL:2011 has standard constructs. Our approach aligns with established patterns.

#### 12.1.3 Event Sourcing

State is stored as events. Current state = derived view. Our timeline is the event log.

#### 12.1.4 The Screenwriting Parallel

| Our Concept | Film/TV Equivalent |
|-------------|-------------------|
| Timeline | Continuity bible |
| Scene | Script page |
| Retrieval | Script supervisor |
| Fact | Continuity note |
| Entity view | Character bible entry |

We're building a digital continuity system for AI-assisted storytelling.

---

### 12.2 Open Source Projects (2024-2025)

#### 12.2.1 rpg-mcp - D&D Dungeon Master with Tool-Calling

**Repository:** https://github.com/Mnehmos/rpg-mcp
**License:** ISC (permissive)
**Status:** Active, production-ready (800+ tests)

**What they do:**
- 145+ MCP Tools for RPG mechanics (dice rolls, AC checks, damage calculation, HP tracking)
- Deterministic rule enforcement via tool-calling (LLM can't hallucinate stats)
- Real database persistence (SQLite-backed state)
- D&D 5e combat system (initiative, death saves, spell slots)
- Procedural world generation (28+ biome types, 1100+ creature presets)

**Architecture similarities:**
- ✅ Tool-calling over context-stuffing (same as our M5 design)
- ✅ Database-backed deterministic facts
- ✅ Extensive test coverage (800+ tests)
- ✅ State persistence patterns we can learn from

**Differences:**
- ❌ D&D-specific (not general worldbuilding)
- ❌ No epistemic isolation (all players share knowledge view)
- ❌ No temporal facts (no "what was true at timestamp X?")
- ❌ No multi-agent orchestration with conflicting knowledge

**Key learnings:**
- Tool implementation patterns (composite tools that reduce token overhead 80-95%)
- Database schema for game state
- Testing strategies for deterministic mechanics
- MCP (Model Context Protocol) integration

**Related repositories:**
- https://github.com/Mnehmos/rpg-mcp-servers (MCP server implementations)
- https://github.com/Mnehmos/AI-Dungeon-Experiment (campaign management)

---

#### 12.2.2 HAMLET - Multi-Agent Narrative Orchestration

**Repository:** https://github.com/HAMLET-2025/HAMLET
**Paper:** https://arxiv.org/html/2507.15518v1
**Published:** ArXiv 2025 (very recent)
**Authors:** Sizhou Chen, Shufan Jiang, Chi Zhang, Xiao-Lei Zhang, Xuelong Li

**What they do:**
- Multi-agent framework for theatrical narrative generation
- Two-stage workflow: offline planning → online performance
- Each actor agent maintains profile, memory, decision-making
- Generates structured narrative blueprint from simple topics

**Architecture similarities:**
- ✅ Multi-agent orchestration (similar to our M6 goals)
- ✅ Agent-specific memory/profiles (like our epistemic state)
- ✅ Character decision-making framework

**Differences:**
- ❌ Theatrical performance focus (not persistent world state)
- ❌ No world consistency constraints
- ❌ No epistemic isolation (secrets, knowledge boundaries)
- ❌ No temporal/spatial constraints

**Key learnings:**
- Multi-agent coordination patterns
- Character profile + memory architecture
- Narrative planning strategies

---

#### 12.2.3 RoleKE-Bench - Epistemic Knowledge Error Detection

**Repository:** https://github.com/WYRipple/rp_kw_errors
**Paper:** https://arxiv.org/abs/2409.11726
**Published:** EMNLP 2025
**Authors:** Wenyuan Zhang et al.

**What they do:**
- Benchmark for detecting character knowledge errors in LLM role-playing
- Tests two error types:
  - **KKE (Known Knowledge Errors):** Character knows things they shouldn't
  - **UKE (Unknown Knowledge Errors):** Anachronisms, out-of-character knowledge
- 990 probing queries across 9 characters
- Memory types: event, relation, attitudinal, identity

**Critical finding:**
- Off-the-shelf LLMs score ≤45% on KKE, ≤65% on UKE
- **This validates our epistemic isolation approach** - LLMs fail without architectural support

**Architecture similarities:**
- ✅ Epistemic error taxonomy (what we're solving with M5)
- ✅ Memory type categorization
- ✅ Testing methodology for knowledge boundaries

**Differences:**
- ❌ Benchmark only (measures problem, doesn't solve it)
- ❌ No implementation of solution architecture

**Key learnings:**
- Test cases for epistemic isolation validation
- Error taxonomy (KKE vs UKE)
- How to measure epistemic isolation success

---

#### 12.2.4 crewAI - General Multi-Agent Framework

**Repository:** https://github.com/crewAIInc/crewAI
**Status:** Very popular (23k+ stars)

**What they do:**
- General-purpose multi-agent orchestration
- Role-based agent collaboration
- Task delegation and coordination

**Differences:**
- ❌ No worldbuilding focus
- ❌ No epistemic isolation
- ❌ No world consistency constraints

**Key learnings:**
- Production-ready framework structure
- Agent coordination patterns
- API design for multi-agent systems

---

### 12.3 Research Projects (No Open Source)

#### 12.3.1 CharacterBox - BDI Agent Roleplay Evaluation

**Paper:** https://aclanthology.org/2025.naacl-long.323.pdf
**Published:** NAACL 2025
**Authors:** Lei Wang et al.
**Status:** Evaluation framework (not a tool)

**What they do:**
- BDI (Belief-Desire-Intention) modeling for LLM role-playing
- Vector-database memory for character knowledge
- Narrator agent for coordination
- Environment state tracking

**Key concept:**
- Characters as BDI agents (similar to our entity state model)
- Coordinator/narrator pattern for multi-agent scenes

**Note:** No code repository found. Paper focuses on evaluation, not implementation.

---

#### 12.3.2 Patchview - LLM Worldbuilding Visualization

**Paper:** https://dl.acm.org/doi/10.1145/3654777.3676352
**Published:** ACM UIST 2024
**Authors:** John Joon Young Chung, Max Kreminski

**What they do:**
- Worldbuilding tool with "Dust and Magnet" visualization
- LLM-generated world elements (characters, props, places)
- Visual sensemaking and steering of AI generations

**Focus:**
- Visualization and UI for worldbuilding
- Generative exploration

**Note:** No code repository found. Focus is visualization, not constraint enforcement.

---

### 12.4 Related AI DM Tools

**Landscape (2024-2025):**
- ChromaDB for persistent memory (vector-based)
- Neo4j for entity relationship graphs
- MCP (Model Context Protocol) for state management
- Tool-calling for game mechanics (dice, combat)

**Common pattern:**
- Vector DB for semantic memory (prose, descriptions)
- Graph DB for structured relationships
- Tool-calling for deterministic mechanics

**Our approach differs:**
- SQLite + JSON (not vector DB) - we need exact values, not embeddings
- Timeline-first (temporal queries as core feature)
- Epistemic isolation (character knowledge boundaries)

---

### 12.5 Comparison Matrix

| Feature | rpg-mcp | HAMLET | RoleKE | CharacterBox | Our Project |
|---------|---------|--------|--------|--------------|-------------|
| **Tool-calling** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Multi-agent** | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Epistemic isolation** | ❌ | ❌ | 📊 (measures) | ❌ | ✅ |
| **Temporal facts** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Living world simulation** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **General-purpose** | ❌ (D&D) | ❌ (theater) | ❌ (benchmark) | ❌ (eval) | ✅ |
| **Open source** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Production-ready** | ✅ | ❌ | ❌ | ❌ | 🚧 |

---

### 12.6 Key Insights from Prior Work

#### Tool-Calling is Proven (rpg-mcp)
- Deterministic mechanics work better than context-stuffing
- Composite tools reduce token overhead dramatically
- MCP provides clean abstraction layer
- **Validates our M5 architecture decision**

#### Epistemic Isolation is an Unsolved Problem (RoleKE-Bench)
- LLMs fail at knowledge boundaries without architectural support
- Even latest models score <50% on epistemic tests
- **Validates that our approach is needed**

#### Multi-Agent Orchestration is Active Research (HAMLET, CharacterBox)
- Character memory + profile patterns are established
- Coordinator/narrator patterns work
- **We can learn from their architectures**

---

### 12.7 What Makes This Project Unique

**No existing tool combines:**
1. Timeline-centric temporal facts ("what was true when?")
2. Tool-calling for deterministic world state (exact values)
3. Epistemic isolation (character knowledge boundaries)
4. Multi-agent orchestration with conflicting knowledge
5. Living world simulation (off-screen progression)
6. General-purpose (any world, not just D&D/theater)
7. Plugin architecture (user-extensible)

**The closest is rpg-mcp (tool-calling + state management), but it's D&D-specific and lacks epistemic isolation and temporal queries.**

---

### 12.8 Recommended Reading

**For M5 (Epistemic State):**
- RoleKE-Bench paper (epistemic error taxonomy)
- CharacterBox paper (BDI modeling for characters)

**For M5 (Tool-Calling):**
- rpg-mcp codebase (tool implementation patterns)
- MCP documentation (protocol understanding)

**For M6 (Multi-Agent):**
- HAMLET paper (multi-agent coordination)
- crewAI codebase (production framework patterns)

---

## See also
- [vision.md](../../vision.md)
- [roadmap.md](../../roadmap.md)
- [decisions.md](../../decisions.md)
- [01-problem.md](../core/01-problem.md)
