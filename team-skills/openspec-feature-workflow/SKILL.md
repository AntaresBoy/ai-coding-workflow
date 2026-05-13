---
name: openspec-feature-workflow
description: Use when a feature needs an OpenSpec change with proposal, design, specs, and tasks completed before coding. Trigger when the repo policy requires OpenSpec for non-trivial features, when the user asks for proposal/design/tasks first, or when behavior changes need durable change artifacts.
---

# OpenSpec Feature Workflow

## Overview

Use this skill for the OpenSpec half of feature delivery. It creates and completes the change artifacts needed before implementation.

This is an explicit opt-in workflow. Do not use it by default. Only use it when the user explicitly asks for this workflow, names this skill, or a repository policy explicitly requires it.

## Start Here

Before creating or applying any OpenSpec change artifacts, run `openspec init` in the target repository. During initialization, select the supported agents by default: Claude Code, Codex, and Cursor.

If OpenSpec is already initialized, treat `openspec init` as an idempotent setup check that may refresh or complete missing OpenSpec configuration and skill files. Do not continue into the workflow until OpenSpec configuration and the selected agent support are present.

## Workflow

1. Run `openspec init` and default to Claude Code, Codex, and Cursor as the supported agents.
2. Derive or confirm a kebab-case change name.
3. Create the change under `openspec/changes/<change-name>/`.
4. Run `openspec status --change "<change-name>" --json` to inspect artifact order.
5. Read `openspec instructions <artifact> --change "<change-name>" --json` before writing each artifact.
6. Complete artifacts in dependency order:
   - `proposal.md`
   - `design.md`
   - `specs/.../spec.md`
   - `tasks.md`
7. Re-check status until all apply-required artifacts are done before implementation starts.

## When to Use

- The user explicitly asks for proposal/design/tasks before coding
- The user explicitly names `$openspec-feature-workflow`
- `AGENTS.md` or team policy explicitly requires this workflow

## Artifact Expectations

- `proposal.md`: why and what changed
- `design.md`: technical approach and trade-offs
- `specs/.../spec.md`: normative requirements and scenarios
- `tasks.md`: executable implementation checklist

## Guardrails

- Do not skip dependency order from `openspec status`
- Do not copy instruction metadata into artifact files
- Do not start coding until required artifacts are ready
