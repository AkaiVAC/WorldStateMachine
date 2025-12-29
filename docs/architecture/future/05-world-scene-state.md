## 5. World State vs. Scene State

### 5.1 The Distinction

**World State (persistent, lives in Timeline):**
- Aldric is King
- Aldric has one arm
- Aldric's voice is deep and gravelly
- These are facts about the world

**Scene State (ephemeral, lives in the Scene):**
- Location: Throne Room
- Time: Year 20, afternoon
- Aldric: seated on throne, center
- Elara: seated to his RIGHT
- Guards: lining the walls
- Focus: diplomatic audience

Scene state is spatial arrangement. It changes as the scene progresses.

### 5.2 How They Interact

1. Scene specifies location, time, and entities present
2. System queries Timeline for world facts about those entities at that time
3. Scene adds spatial/situational arrangement
4. Retrieval prioritizes facts based on scene focus

### 5.3 Scenes as Commit Unit (Staging Model)

Scenes are the unit of "saving" to the timeline. Like git, facts go through staging before commit.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Incoming   │ ──► │   Staging   │ ──► │  Committed  │
│   Prose     │     │   (Draft)   │     │  Timeline   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    Human review
                    Accept / Edit / Reject
```

**When a scene is committed, it becomes an Event in the timeline:**

```
Event: "The Night in the Gardens"
├── location: Royal Gardens of Ilaria
├── time: Year 20, Month 7, Night
├── weather: raining
├── participants: [Narrator (guard), Assassin, ...]
├── sub-events: [assassination attempt, narrator falls]
├── outcomes: [narrator unconscious, assassin escapes]
└── sensory: [wet stone, cold, dark]
```

**Staging enables:**
- Batch review of extracted facts
- Diff view: "Here's what this scene would add to the timeline"
- Reject individual facts while accepting others
- Edit before committing
- No unverified facts polluting the canonical timeline

This is **git for world state**.

---

