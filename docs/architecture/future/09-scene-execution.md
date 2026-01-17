---
title: "Scene Execution"
status: "future"
keywords:
  - "scene execution"
  - "multi-agent orchestration"
  - "POV isolation"
  - "scene generation"
  - "tool-calling workflow"
  - "context assembly"
related:
  - "../core/08-epistemic-state.md"
  - "../core/11-query-pipeline.md"
  - "./05-world-scene-state.md"
  - "../../vision.md"
  - "../../roadmap.md"
---
# Scene Execution

## 10. Scene Execution Model

### 10.1 The Challenge

A scene with multiple characters, each with secrets, requires careful context management. The goal: epistemic isolation (characters can't leak what they don't know) while maintaining natural dialogue flow and a living world.

### 10.2 Tiers of Agency

Not every entity needs full agent treatment:

| Tier | Examples | Epistemic Needs | Generation Approach |
|------|----------|-----------------|---------------------|
| **Lead** | Protagonist, antagonist, key NPCs | Full secrets, complex knowledge | Separate context if secrets conflict |
| **Supporting** | Named advisor, guard captain | Some knowledge tracking | Shared context usually sufficient |
| **Ambient** | Page, courtiers, birds, weather | No secrets, pure flavor | World constraints + LLM randomness |

### 10.3 POV-Driven Generation (Default)

For most scenes, single-agent with POV-filtered context:

```
Scene POV: Character A
Context: [public facts] + [A's knowledge only]

A observes B and C's external behavior (dialogue, actions).
A does NOT see B or C's internal thoughts or secrets.
```

**Benefits:**
- Simple, deterministic retrieval
- Architecturally enforced isolation
- Works for most fiction (single perspective)

**Limitation:**
- Doesn't support omniscient narration
- Can't show multiple characters' internal states simultaneously

### 10.4 Multi-Agent Orchestration (Secret-Heavy Scenes)

When multiple leads have conflicting secrets that matter to the scene:

```
Scene: A, B, C in tense negotiation. Each has a secret.

Round 1:
├── Agent_A context: [public + secret_A + scene setup]
├── A speaks: "Your Majesty, the reports are troubling."
└── A's utterance → shared transcript

Round 2:
├── Agent_B context: [public + secret_B + transcript]
├── B responds: "Indeed. But there's something you don't know..."
└── B's utterance → shared transcript

Round 3:
├── Agent_C context: [public + secret_C + transcript]
└── ...continues
```

**Each agent:**
- Sees what's been said/done (public transcript)
- Thinks with only their own knowledge
- Cannot accidentally reference others' secrets

**Cost:** N agents × M rounds = expensive. Reserve for high-stakes scenes.

### 10.5 The Alive World (Ambient Generation)

For background elements that add life without plot complexity:

```
Scene constraints (from timeline):
├── Location: Royal Court, Sunnaria
├── Time: Afternoon, summer
├── Fauna: songbirds in gardens
├── Present: [12 courtiers, 3 servants]
├── Atmosphere: tense (recent bad news)

Ambient generation prompt:
"Add environmental flavor within these constraints."

LLM generates:
├── Dust motes drift in afternoon light
├── A servant adjusts a tapestry nervously
├── Distant birdsong from the gardens
├── Courtiers exchange glances after the king speaks
```

**No epistemic isolation needed.** These elements don't have secrets. They're constrained randomness—the "spice" that makes the world feel alive.

### 10.6 Dice Mechanics for Ambient Events

Random events within defined parameters:

```
Dice roll: "Minor unexpected event in court scene"

Possible outcomes (weighted):
├── 40%: Someone coughs/sneezes
├── 25%: A servant stumbles
├── 20%: A courtier whispers to neighbor
├── 10%: A bird flies in through window
├── 5%: Something falls/breaks

Roll result: Servant stumbles

LLM elaborates within constraints:
"A young page, arms laden with scrolls, catches their foot on
the carpet's edge and stumbles. Scrolls scatter. The momentary
chaos draws every eye, breaking the tension—or deepening it."
```

### 10.7 Hybrid Approach (Recommended)

| Scene Type | Approach | Cost |
|------------|----------|------|
| Single POV, normal scene | Single agent, POV context | 1x |
| Ensemble, no secrets | Single agent, full context | 1x |
| Ensemble, minor secrets | Single agent + careful prompting | 1x |
| Ensemble, critical secrets | Multi-agent, turn-based | Nx |
| Any scene | + Ambient generation for flavor | +1x |

**Decision flow:**
1. Are there conflicting secrets that matter to this scene?
   - No → Single agent
   - Yes → Multi-agent
2. Should the world feel alive?
   - Yes → Add ambient generation pass
3. Should random events occur?
   - Yes → Roll dice, elaborate result

### 10.8 Dialogue Flow Strategies

**Turn-based with shared transcript** (described above):
- Pro: Clean isolation
- Con: Dialogue may feel stilted

**Structure-first, then fill:**
1. Generate scene structure: "A raises concern, B deflects, C interjects..."
2. Fill each beat with character-specific generation
3. Polish pass for coherence

**Selective isolation:**
- Trust single agent for most scenes
- Only use multi-agent for secret-reveal moments

### 10.9 Context Assembly for Scene

```
SCENE SETUP
├── Location: Royal Gardens
├── Time: Year 20, Month 7, Night
├── Weather: Light rain
├── POV: Princess Aradia

CHARACTER CONTEXT (Aradia's knowledge)
├── Self: [all facts about Aradia]
├── Present entities: [Reacher - what Aradia knows about him]
├── Location facts: [gardens features, flora, fauna]
├── Recent events: [only events Aradia knows about]

EXCLUDED (Aradia doesn't know)
├── Reacher's secret mission
├── Queen's private concerns
├── Council discussions Aradia wasn't part of

AMBIENT CONSTRAINTS
├── Aurals may be singing (night, summer, Limaria)
├── Fireflies possible (gardens, night)
├── Rain affects visibility, sound

→ Context sent to LLM for generation
```

## See also
- [08-epistemic-state.md](../core/08-epistemic-state.md)
- [11-query-pipeline.md](../core/11-query-pipeline.md)
- [05-world-scene-state.md](./05-world-scene-state.md)
- [vision.md](../../vision.md)
- [roadmap.md](../../roadmap.md)
