---
title: "Extension Systems Requirements"
status: "requirements"
keywords:
  - "extension system requirements"
  - "config-driven extensions"
  - "activation bootstrap"
  - "dependency handling"
  - "extension context"
  - "stage pipeline"
  - "validation rules"
related:
  - "../current.md"
  - "../decisions.md"
  - "../roadmap.md"
  - "../architecture/core/11-query-pipeline.md"
---
# Extension Systems Requirements

## Goals
- Activate extensions in 6 stages ordered as stores → loaders → validators → contextBuilders → senders → ui.
- Enforce within-stage ordering using config list order plus `after` dependencies.
- Validate required store slots after activation.
- Normalize and write back config data.
- Enforce TDD: failing test first, minimal pass, then refactor to meet SOLID and Simple Design before proceeding.

## Inputs
- `extensions.json` at the project root.
- Extension modules referenced by config paths.
- Extension paths must resolve to module files with default exports.
- Extension exports with `name`, `kind`, `version`, `activate`, optional `after`, and optional `deactivate`.
- `activate` may return an ExtensionContribution object to append items to context collections.

## Outputs
- Activated ExtensionContext with required store slots populated and collections aggregated from extension returns.
- Updated `extensions.json` reflecting normalized paths and dependency status changes, even when bootstrap fails.

## Bootstrap Activation
### Stage execution
- Execute stages strictly in order: stores → loaders → validators → contextBuilders → senders → ui.
- Build the within-stage dependency graph for all entries before activating any extension.
- Activate only entries with `status: "on"`.

### Within-stage ordering
- Primary order matches config list order.
- `after` dependencies override ordering with a within-stage DAG.
- Dependency cycles or unknown dependencies must surface as bootstrap errors.
- Fail fast on the first ordering error.

### Extension kind validation
- Extension `kind` must match the stage it appears in.
- Mismatches must surface as bootstrap errors.
- Fail fast on the first kind mismatch.

### Parallelization
- Extensions within a stage may be activated in dependency-resolved waves.
- Each wave must complete before the next wave begins.
- Shared context mutation depends on the DAG order within the wave plan.

## Config Writer
### Path normalization
- Normalize all config paths to forward slashes.
- Write back normalization even when bootstrap fails.

### Dependency status updates
- If an extension depends on a disabled dependency, set status to `needs:<dep>` or `needs:depA,depB`.
- If dependencies are restored, reset status to `on` unless it was explicitly `off`.
- Write back dependency status updates even when bootstrap fails.

## Required Store Slots
- `factStore`, `eventStore`, and `entityStore` must be set after activation.
- Missing required slots must surface as bootstrap errors.

## Error Handling
- Missing config must fail fast with a direct error from the loader.
- Invalid extension path or missing entry point must surface as errors.
- Dependency cycles or unknown `after` targets must surface as errors.
- Stage and kind mismatches must surface as errors.
- Fail fast on the first bootstrap error.

## Potential Gaps To Validate
- Config `name` should match the extension's exported `name` and fail fast on mismatch.
- Extension export should be validated for required fields (`name`, `version`, `kind`, `activate`) with clear errors.
- `after` should be validated as an array of strings to avoid unclear ordering failures.

## Bootstrap Contract
- `path` points to a module file (no folder inference).
- Extension modules must default-export the extension object.

## Testing
- Tests must be comprehensive and focus on critical behaviors only.
- Use ZOMBIES to enumerate cases.
- Start with `test.todo` entries and implement one test at a time.
- Refactor tests and production code after the setup phase to enforce SOLID and Simple Design.
- No comments in tests or production code.

### Required coverage
- `after` ordering is enforced.
- Cycles are detected.
- Unknown dependencies error.
- Stage and kind mismatches error.
- Required store slots are validated.
- Config write-back updates dependency status.
- Path normalization updates config paths.

### Integration test
- End-to-end flow: load config → activate extensions across stages → validate required slots → write back config.

## Naming and Structure
- Folder and file names must follow existing directory patterns.
- Variable and method names must be explicit and purpose-driven.

## See also
- [current.md](../current.md)
- [decisions.md](../decisions.md)
- [roadmap.md](../roadmap.md)
- [11-query-pipeline.md](../architecture/core/11-query-pipeline.md)
