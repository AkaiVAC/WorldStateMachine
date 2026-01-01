# Extension Architecture Implementation

**Date Started:** 2026-01-01
**Status:** Phase 1, 2, & 3 Complete ✅ | Phase 4 Starting 🚧
**Progress:** 3 of 5 phases complete | 230 tests passing

---

## ✅ Completed Phases

### **Phase 1: Extension System Core** (Complete)
- ✅ Created `src/core-types/` with fundamental types
- ✅ Created `src/extension-system/interfaces/` (all using `unknown` for type safety)
- ✅ Implemented `defineExtension()` helper with full type inference
- ✅ Implemented extension registry with dependency validation
- ✅ Implemented extension loader with **TS + JSON hybrid support**
- ✅ Implemented lifecycle hook system with execution control
- ✅ Added 33 comprehensive tests for extension system
- ✅ All 230 tests passing

### **Phase 2: Migrate to Extensions** (Complete)
- ✅ Created `extensions/core/extension.config.ts`
- ✅ Migrated all code to `extensions/core/`:
  - `src/world-state/` → `extensions/core/store-timeline/`
  - `src/import/` → `extensions/core/load-world-data/`
  - `src/validation/` → `extensions/core/validate-consistency/`
  - `src/retrieval/` + `src/analysis/` → `extensions/core/build-scene-context/`
  - `src/llm/` → `extensions/core/send-scene-context/`
  - `src/ui/` → `extensions/core/provide-ui/`
- ✅ Updated all imports with **path aliases** (`@core/*`, `@ext/*`)
- ✅ All 230 tests passing

### **Phase 3: Runtime** (Complete)
- ✅ Created `src/runtime/boot.ts` (load extensions, wire system)
- ✅ Created `src/runtime/orchestrate.ts` (execute with hooks)
- ✅ Tested full boot sequence
- ✅ Verified core extension loading

### **Next: Phase 4 - Example Extensions** (In Progress)
Create example extensions to prove the architecture!

---

## What We Decided

### **Complete Architectural Pivot to Extension System**

We're moving from a traditional monolithic structure to a **plugin-first architecture** where:
- ✅ **Everything is an extension** (including core functionality)
- ✅ **Zero codebase changes needed** to add features
- ✅ **Extensions can hook into lifecycle** (before/after any operation)
- ✅ **Extensions can replace core behavior** (with validation)
- ✅ **Auto-discovery** (drop folder, restart, it works)

---

## Final Architecture

### **Directory Structure**

```
src/
├── core-types/                       # Fundamental contracts (unchangeable)
│   ├── event.ts                      # Event type definition
│   ├── fact.ts                       # Fact type definition
│   ├── entity.ts                     # Entity type definition
│   └── relationship.ts               # Relationship type definition
│
├── extension-system/                 # Plugin infrastructure
│   ├── registry.ts                   # Manages loaded extensions
│   ├── loader.ts                     # Scans, loads, validates extensions
│   ├── hooks.ts                      # Lifecycle hook system
│   └── interfaces/                   # Contracts for extensions
│       ├── extension.ts              # Extension manifest interface
│       ├── store.ts                  # FactStore, EventStore interfaces
│       ├── loader.ts                 # WorldDataLoader interface
│       ├── validator.ts              # Validator interface
│       ├── context-builder.ts        # ContextBuilder interface
│       ├── sender.ts                 # Sender interface
│       └── ui.ts                     # UIComponent interface
│
└── runtime/                          # Minimal boot loader
    ├── boot.ts                       # Load extensions, wire hooks
    └── orchestrate.ts                # Execute system with extensions

extensions/
├── core/                             # ALL CURRENT FUNCTIONALITY
│   ├── load-world-data/
│   │   └── from-sillytavern/
│   │       ├── parse-lorebook-json.ts
│   │       ├── extract-entities.ts
│   │       └── sillytavern-loader.ts
│   │
│   ├── store-timeline/
│   │   ├── memory-fact-store/
│   │   │   ├── fact-store.ts
│   │   │   └── fact-store.test.ts
│   │   ├── memory-event-store/
│   │   │   ├── event-store.ts
│   │   │   └── event-store.test.ts
│   │   └── memory-entity-store/
│   │       ├── entity-store.ts
│   │       └── entity-store.test.ts
│   │
│   ├── validate-consistency/
│   │   ├── check-entity-exists/
│   │   │   ├── check-entity-exists.ts
│   │   │   └── entity-exists-rule.test.ts
│   │   ├── check-world-boundary/
│   │   │   ├── check-world-boundary.ts
│   │   │   └── world-boundary-rule.test.ts
│   │   └── validation-framework/
│   │       ├── validator.ts
│   │       └── validator.test.ts
│   │
│   ├── build-scene-context/
│   │   ├── match-keywords/
│   │   │   ├── keyword-matcher.ts
│   │   │   └── keyword-matcher.test.ts
│   │   ├── match-entities/
│   │   │   ├── entity-matcher.ts
│   │   │   └── entity-matcher.test.ts
│   │   ├── expand-relationships/
│   │   │   ├── relationship-retrieval.ts
│   │   │   └── relationship-retrieval.test.ts
│   │   └── analyze-prompt/
│   │       ├── prompt-analyzer.ts
│   │       └── prompt-analyzer.test.ts
│   │
│   ├── send-scene-context/
│   │   └── to-llm/
│   │       ├── openrouter-client.ts
│   │       └── openrouter-client.test.ts
│   │
│   ├── provide-ui/
│   │   └── dev-chat/
│   │       ├── server/
│   │       ├── routes/
│   │       └── public/
│   │
│   └── extension.config.ts           # TypeScript config (not JSON!)
│
├── worldanvil-importer/              # Example user extension
│   ├── load-world-data/
│   │   └── from-worldanvil/
│   └── extension.config.ts
│
├── postgres-timeline/                # Example: Replace storage
│   ├── store-timeline/
│   │   ├── postgres-fact-store/
│   │   └── postgres-event-store/
│   └── extension.config.ts
│
└── advanced-validators/              # Example: Add validators
    ├── validate-consistency/
    │   ├── check-temporal-consistency/
    │   └── check-spatial-validity/
    └── extension.config.ts

extensions.config.json                # Optional config
lorebooks/
└── excelsia/
    ├── characters.json
    ├── kingdoms.json
    └── README.md
```

---

## Extension Configuration (TypeScript!)

### **Why TypeScript instead of JSON?**

✅ **Full type inference** - VS Code autocomplete for all fields
✅ **Type checking** - Catch errors at development time
✅ **Import types** - Can import interfaces from extension-system
✅ **No build step** - Bun imports `.ts` files directly
✅ **Better DX** - Validation, refactoring, inline docs

### **Minimal Extension**

```typescript
// extensions/worldanvil-importer/extension.config.ts
import { defineExtension } from '../../src/extension-system'

export default defineExtension({
  name: 'worldanvil-importer',
  version: '1.0.0',
  description: 'Import from World Anvil',
  author: 'Your Name'
  // ↑ VS Code provides autocomplete!
})
```

**Notes:**
- `id` is **auto-generated** on first load (UUID)
- `defineExtension()` provides full type inference
- All fields validated at development time

### **Full Extension with All Features**

```typescript
// extensions/advanced-validators/extension.config.ts
import { defineExtension } from '../../src/extension-system'

export default defineExtension({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'advanced-validators',
  version: '2.1.0',
  description: 'Advanced temporal and spatial validators',
  author: 'Community',

  dependencies: ['core'],  // ← Autocomplete shows available extensions

  provides: {
    validators: ['temporal-consistency', 'spatial-validity']
  },

  replaces: {
    'core/stores/fact-store': {
      reason: 'PostgreSQL backend for scalability',
      interface: 'FactStore',    // ← Type-checked against interfaces
      compatible: true
    }
  },

  hooks: {
    'before-validation': ['pre-check-optimization'],
    'after-validation': ['detailed-error-reporting'],
    'on-fact-extracted': ['augment-metadata']
    // ↑ Autocomplete shows all available hooks
  },

  config: {
    postgresUrl: 'postgresql://localhost:5432/timeline'
  }
})
```

---

## Extension Capabilities

Each extension can provide capabilities in these directories:

| Directory | Purpose | Example |
|-----------|---------|---------|
| `load-world-data/` | Import/create data | SillyTavern, World Anvil, CSV |
| `store-timeline/` | Storage backends | Memory, SQLite, PostgreSQL |
| `validate-consistency/` | Validation rules | Entity exists, temporal consistency |
| `build-scene-context/` | Context retrieval | Keyword matching, graph expansion |
| `send-scene-context/` | Output targets | LLM, inspector, file export |
| `provide-ui/` | UI components | Chat interface, graph visualizer |
| `hooks/` | Lifecycle hooks | Before/after any operation |

**Extensions only include what they provide!**

---

## Lifecycle Hooks

Extensions can hook into these lifecycle events:

```typescript
type Hook =
  // Data loading
  | 'before-load-data'
  | 'after-load-data'

  // Validation
  | 'before-validation'
  | 'after-validation'

  // Context building
  | 'before-build-context'
  | 'after-build-context'

  // Sending
  | 'before-send-context'
  | 'after-send-context'

  // Timeline events
  | 'on-timeline-update'
  | 'on-entity-created'
  | 'on-fact-extracted'
  | 'on-event-created'
  | 'on-relationship-added'

interface HookContext {
  data: unknown                      // Current data (use `unknown`, not `any`!)
  metadata: Record<string, unknown>  // Metadata
  skip?: boolean                     // Skip default behavior
  augment?: unknown                  // Add to result
}
```

**Hook Execution:**
- `before-*`: Can skip/modify input
- `after-*`: Can augment/modify output
- `on-*`: React to events

**Type Safety:**
Extensions must narrow `unknown` types before use:
```typescript
hooks: {
  'on-fact-extracted': async (ctx: HookContext) => {
    // Must validate type before use
    if (isFact(ctx.data)) {
      const fact = ctx.data as Fact
      // Now type-safe!
    }
  }
}
```

---

## Extension Loading

### **Auto-Discovery (Default)**

System scans `extensions/` directory on boot:

```typescript
// Automatically loads:
extensions/
  ├── core/
  ├── worldanvil-importer/
  └── advanced-validators/
```

### **Optional Configuration**

```json
// extensions.config.json
{
  "order": ["core", "advanced-validators", "worldanvil-importer"],
  "disabled": ["worldanvil-importer"],
  "devMode": true
}
```

**Features:**
- `order`: Explicit load order (matters for hooks)
- `disabled`: Temporarily disable without deleting
- `devMode`: Enable hot reload

### **Extension Resolution**

1. Scan `extensions/` directory
2. Load `extension.json` from each folder
3. Auto-generate `id` if missing (save back to manifest)
4. Validate dependencies
5. Check for conflicts (name collisions, replacements)
6. Load in order (config or alphabetical)
7. Wire hooks
8. Boot system

---

## Core Types (Fundamental)

These types are **fundamental** and cannot be replaced:

```typescript
// src/core-types/event.ts
export type Event = {
  id: string
  worldId: string
  timestamp: number
  title: string
  location?: string
  participants: string[]
  visibility: 'private' | 'restricted' | 'public'
  outcomes?: Fact[]
  prose?: string
}

// src/core-types/fact.ts
export type Fact = {
  worldId: string
  subject: string
  property: string
  value: string | number | boolean
  validFrom?: number
  validTo?: number
  causedBy?: string
}

// src/core-types/entity.ts
export type Entity = {
  id: string
  worldId: string
  name: string
  aliases: string[]
  group?: string
}

// src/core-types/relationship.ts
export type Relationship = {
  worldId: string
  from: string
  type: string
  to: string
  validFrom?: number
  validTo?: number
}
```

---

## Extension Interfaces

**Important:** All interfaces use `unknown` instead of `any` for type safety. Extensions must narrow types before use.

### **Store Interface**

```typescript
// src/extension-system/interfaces/store.ts
export interface FactStore {
  add(fact: Fact): void
  getAll(): Fact[]
  getBySubject(subject: string, worldId: string): Fact[]
  getAt(subject: string, timestamp: number, worldId: string): Fact[]
}

export interface EventStore {
  add(event: Event): void
  getAll(): Event[]
  getByParticipant(entityId: string, worldId: string): Event[]
  getByTimestamp(timestamp: number, worldId: string): Event[]
  getByLocation(locationId: string, worldId: string): Event[]
  getByVisibility(visibility: Visibility, worldId: string): Event[]
}
```

### **Loader Interface**

```typescript
// src/extension-system/interfaces/loader.ts
export interface WorldDataLoader {
  name: string
  canHandle(filePath: string): boolean
  load(filePath: string, worldId: string): Promise<LoadResult>
}

export interface LoadResult {
  entities: Entity[]
  events?: Event[]
  facts?: Fact[]
  relationships?: Relationship[]
  skipped?: SkippedEntry[]
}
```

### **Validator Interface**

```typescript
// src/extension-system/interfaces/validator.ts
export interface Validator {
  name: string
  check(prompt: string, context: ValidationContext): Promise<Violation[]>
}

export interface Violation {
  type: string
  term: string
  message: string
  suggestion?: string
}
```

### **Context Builder Interface**

```typescript
// src/extension-system/interfaces/context-builder.ts
export interface ContextBuilder {
  name: string
  build(prompt: string, worldId: string): Promise<ContextPiece[]>
}

export interface ContextPiece {
  id: string
  content: string
  relevance: number
  reason: string
}
```

### **Sender Interface**

```typescript
// src/extension-system/interfaces/sender.ts
export interface Sender {
  name: string
  send(context: SceneContext, prompt: string): Promise<SendResult>
}

export interface SceneContext {
  worldId: string
  timestamp: number
  entities: string[]
  facts: Fact[]
  events: Event[]
}

export interface SendResult {
  response: string
  metadata?: Record<string, unknown>  // Use `unknown`, not `any`
}
```

---

## Implementation Plan

### **Phase 1: Extension System Core (Week 1)**

1. Create `src/core-types/` with fundamental types (Event, Fact, Entity, Relationship)
2. Create `src/extension-system/interfaces/` with all interfaces (all use `unknown`, not `any`)
3. Create `src/extension-system/define-extension.ts` (Extension type + defineExtension helper)
4. Create `src/extension-system/registry.ts` (extension registry)
5. Create `src/extension-system/loader.ts` (auto-discovery, loads .ts configs)
6. Create `src/extension-system/hooks.ts` (lifecycle hook system)
7. Tests for extension loading and validation

**Key files:**
```typescript
// src/extension-system/define-extension.ts
export type Extension = {
  id?: string
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: string[]
  provides?: { /* ... */ }
  replaces?: Record<string, { /* ... */ }>
  hooks?: Partial<Record<Hook, string[]>>
  config?: Record<string, unknown>  // ← `unknown`, not `any`!
}

export const defineExtension = (ext: Extension): Extension => ext
```

### **Phase 2: Migrate to Extensions (Week 2)**

1. Create `extensions/core/extension.config.ts` (TypeScript, not JSON!)
2. Move all current code to `extensions/core/`
   - `src/world-state/` → `extensions/core/store-timeline/`
   - `src/import/` → `extensions/core/load-world-data/`
   - `src/validation/` → `extensions/core/validate-consistency/`
   - `src/retrieval/` + `src/analysis/` → `extensions/core/build-scene-context/`
   - `src/llm/` → `extensions/core/send-scene-context/`
   - `src/ui/` → `extensions/core/provide-ui/`
3. Update all imports
4. Ensure tests pass

### **Phase 3: Runtime (Week 2)**

1. Create `src/runtime/boot.ts` (load extensions, wire system)
2. Create `src/runtime/orchestrate.ts` (execute with hooks)
3. Test full boot sequence
4. Test extension loading/unloading

### **Phase 4: Example Extensions (Week 3)**

1. Create example extension templates
2. Document extension creation process
3. Test hot reload (dev mode)
4. Test extension replacement (postgres-timeline example)

### **Phase 5: Documentation & Cleanup**

1. Update all docs to reflect new structure
2. Create extension authoring guide
3. Remove unused dependencies (vis-data, vis-network)
4. Move `src/example/Excelsia/` to `lorebooks/excelsia/`
5. Add README files throughout

---

## Migration Strategy

### **Why Not Gradual?**

We considered gradual migration but decided against it because:
- Extension system is foundational (affects everything)
- Half-migrated state would be confusing
- Better to do it all at once, test thoroughly

### **Safety Measures**

1. ✅ All changes on feature branch
2. ✅ Tests must pass at each phase
3. ✅ Commit after each phase completes
4. ✅ Keep old structure in git history (can revert)

---

## Testing Strategy

### **Extension System Tests**

```typescript
// Test extension loading
test('auto-discovers extensions in directory')
test('generates UUID for new extensions')
test('validates extension manifests')
test('detects dependency conflicts')
test('loads extensions in correct order')
test('handles circular dependencies')

// Test hook system
test('executes before hooks')
test('executes after hooks')
test('allows skipping default behavior')
test('allows augmenting results')

// Test replacement
test('validates interface compatibility')
test('warns on core replacement')
test('falls back to core on error')
```

### **Integration Tests**

```typescript
// Test full pipeline with extensions
test('load data → validate → build context → send')
test('multiple validators augment violations')
test('context builders compose results')
test('hooks intercept at correct points')
```

---

## Open Questions

### **Resolved:**
- ✅ Timeline extensibility: Yes (stores are pluggable)
- ✅ Extension IDs: Auto-generate UUIDs on first load
- ✅ Extension loading: Auto-scan + optional config
- ✅ Replacement: Allowed with validation
- ✅ Directory naming: Verbose, readable names

### **Still to Decide:**
- ⚠️ Hot reload implementation details
- ⚠️ Extension marketplace/registry (future)
- ⚠️ Extension versioning/updates
- ⚠️ Extension sandboxing/security

---

## Benefits of This Architecture

1. ✅ **Zero-touch extensibility**: Drop folder, restart, done
2. ✅ **Core as extension**: We maintain it like any other extension
3. ✅ **Clear contracts**: Interfaces define what extensions can do
4. ✅ **Composable**: Multiple extensions enhance same functionality
5. ✅ **Future-proof**: New extension types easy to add
6. ✅ **Testable**: Extensions isolated, easy to test
7. ✅ **Debuggable**: Know exactly which extension did what

---

## Next Steps

1. Review this document
2. Confirm we're ready to proceed
3. Start Phase 1: Extension System Core
4. Test thoroughly at each phase
5. Document as we go

---

**Status:** Ready to implement! 🚀
