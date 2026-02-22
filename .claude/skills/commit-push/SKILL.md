---
name: commit-push
description: Analyze changes, group into micro-commits with conventional-commit messages, and push
---

# Commit and Push

You are creating scoped micro-commits from the current working tree changes. Follow this workflow exactly:

## Step 1: Analyze

Run these in parallel:
- `git status` (see all changed/untracked files)
- `git diff` (unstaged changes)
- `git diff --cached` (staged changes)
- `git log --oneline -10` (recent commit style reference)

## Step 2: Group

Organize all changes into logical micro-commits. Each commit should be one coherent unit:
- Type definitions together
- Tests together (or with their implementation if tightly coupled)
- Doc updates separate from code
- Config/tooling changes separate from features

## Step 3: Draft Messages

For each group, draft a conventional-commit message:
- Format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`
- Scope: the area of code (e.g., `core`, `store`, `tools`)
- Subject: imperative, lowercase, no period, explains the "why" not the "what"
- Keep the first line under 72 characters

## Step 4: Present Plan

Show the user the full commit plan before executing:
- List each commit group with: files included, commit message
- Show the order commits will be made
- Wait for explicit approval before proceeding

## Step 5: Execute

After approval, for each commit group:
1. Stage only the files for that group (`git add <specific files>`)
2. Commit with the approved message (use HEREDOC for message formatting)
3. If Husky pre-commit hook fails: fix the issue, re-stage, create a NEW commit (never amend)

## Step 6: Push

After all commits succeed:
1. Push to remote with `git push`
2. Report: number of commits made, branch, remote URL

## Step 7: Report

Summarize what was done:
- List of commits (hash + message)
- Any hook failures and how they were resolved
- Push status (success/failure)

## Rules

- NEVER use `git add -A` or `git add .` — always stage specific files
- NEVER skip hooks (`--no-verify`)
- NEVER amend existing commits
- NEVER commit files that contain secrets (.env, credentials, etc.)
- If there are no changes to commit, say so and stop
- If push fails, report the error — do not force push
