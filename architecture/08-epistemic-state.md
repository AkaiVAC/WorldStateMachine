## 9. Epistemic State (Who Knows What)

### 9.1 The Problem

World state tracks what IS true. Epistemic state tracks what each character KNOWS.

```
World fact: "Grain tariffs were discussed in council"
Character knowledge:
├── King: knows (was present)
├── Advisor: knows (was present)
├── Princess: doesn't know (wasn't present)
└── Spy: knows (was hidden, listening)
```

When generating from the Princess's POV, the grain tariff discussion should not appear in context. She can't reference what she doesn't know.

### 9.2 Events as Knowledge Units

Rather than tracking abstract "knowledge items," we use events as the unit of knowledge. Characters know about events they participated in.

```
Event: "Council Meeting - Year 20, Day 15"
├── participants: [King, Advisor, Scribe]
├── hidden-participants: [Spy]
├── visibility: private
├── topics: [grain-tariffs, border-dispute]
```

**Query: "What does Princess know?"**
→ Filter events where Princess ∈ participants OR visibility = public
→ Council meeting excluded (she wasn't there, it's private)

### 9.3 Visibility Levels

Instead of per-character tracking, events have visibility levels:

| Level | Who knows |
|-------|-----------|
| **private** | Only participants |
| **[group]** | Members of named group (e.g., "war-council") |
| **court** | Anyone at court would hear |
| **public** | Common knowledge |

This reduces cognitive load. Most scenes are either private (only those present know) or public (everyone knows).

### 9.4 Group-Based Knowledge (State Secrets)

Some knowledge is tied to roles, not scene participation:

```
Group: "War Council"
├── members: [King, General, Spymaster]
├── member-since: {King: year 1, General: year 15, Spymaster: year 10}

Event: "Invasion Planning"
├── visibility: war-council
```

**Marcus joins war council in Year 15:**
→ He can access war-council events from Year 15 onward
→ Earlier secrets require explicit briefing (revelation event)

### 9.5 Explicit Revelations

When information transfers outside normal channels:

```
Event: "King Confides in Princess"
├── participants: [King, Princess]
├── reveals: ["Council Meeting - Year 20, Day 15"]
```

Now Princess's knowledge includes that council meeting—not because she was there, but because it was revealed to her.

### 9.6 Concealment Constraints

For active secrets:

```
Event: "Conspiracy Discussion"
├── participants: [A, B, C]
├── visibility: private
├── concealed-from: [Lucius]
```

If Lucius later learns about this event, the system flags it:
→ "Lucius shouldn't know this. Was this intentional?"

### 9.7 Lazy Evaluation

We don't pre-compute every character's complete knowledge state. We track constraints and resolve "does X know Y?" when the story asks.

**Query returns:**
- **Definitely yes**: X was present, or was explicitly told
- **Definitely no**: X explicitly excluded, or no plausible path
- **Ambiguous**: Could go either way → author decides (or rolls dice)

```
Query: "Does Marcus know about the Year 12 treaty?"
├── Marcus joined war council: Year 15
├── Treaty discussed: Year 12
├── No explicit briefing recorded
└── Result: AMBIGUOUS - author decides
```

### 9.8 Retrieval Implications

Context retrieval becomes character-scoped:

```
Retrieving context for: Princess's POV at Year 20

INCLUDED:
├── Events where Princess was participant
├── Events with visibility: public
├── Events explicitly revealed to Princess
├── World facts (titles, relationships, locations)

EXCLUDED:
├── Private events she didn't attend
├── Group-scoped events (war-council) she's not part of
├── Events with concealed-from: Princess
```

The LLM literally cannot reference excluded information—it's not in the context.
