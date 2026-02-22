---
name: create-pr
description: Create a pull request from the current branch with auto-generated title and description
---

# Create Pull Request

You are creating a pull request from the current branch. Run this as a background task and report the result.

## Step 1: Gather Context

Run these in parallel:
- `git branch --show-current` (current branch name)
- `git log main..HEAD --oneline` (all commits since diverging from main)
- `git diff main...HEAD --stat` (summary of all changes)
- `git remote -v` (verify remote exists)
- Check if branch is pushed: `git rev-parse --abbrev-ref @{upstream}` (if this fails, push first with `git push -u origin HEAD`)

## Step 2: Analyze Changes

Look at ALL commits on the branch (not just the latest). Understand:
- What was built or changed across the full branch
- The scope of the work (single feature? multiple related changes?)
- Any test additions or modifications

## Step 3: Draft PR

- **Title:** Short, under 70 chars, describes the overall change (not individual commits)
- **Body:** Use this format:

```
## Summary
<1-3 bullet points covering the key changes>
```

## Step 4: Create

Run `gh pr create` with the drafted title and body. Use a HEREDOC for the body to preserve formatting:

```
gh pr create --title "the title" --body "$(cat <<'EOF'
## Summary
...

## Test plan
...
EOF
)"
```

## Step 5: Report

Report the result to the user:
- Success: PR URL
- Failure: error message and suggested fix (e.g., "branch not pushed", "gh not authenticated")

## Rules

- NEVER force-push before creating the PR
- If the branch is not pushed to remote, push it first with `git push -u origin HEAD`
- If already on main, stop and tell the user to create a feature branch first
- Base branch is always `main` unless the user specifies otherwise
