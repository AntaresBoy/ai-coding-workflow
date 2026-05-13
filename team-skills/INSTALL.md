# Source Workflow Installation Notes

`team-skills/` contains the source workflow definitions maintained by this repository.

These folders are not the primary end-user installation target anymore.

## When To Use `team-skills/`

Use `team-skills/` directly only when you are:

- maintaining the source workflows
- adapting the workflows to a new tool
- building new bundles under `dist/`
- reading the original workflow definitions

## End User Installation

### Via npm (recommended)

```bash
npm install @axlpq/ai-coding-workflow

# Install a workflow bundle into your project
npx spec claude-code --bundle openspec-superpowers --project-root <project-root>
npx spec cursor --bundle openspec-superpowers --project-root <project-root>
npx spec codex --bundle openspec-superpowers --codex-home ~/.codex
```

### Via install scripts (alternative)

If you cloned this repo or have it as a local copy, use the prebuilt bundles and install scripts:

- Codex: `dist/codex/bundles/` or `scripts/install-codex.ps1`
- Cursor: `dist/cursor/bundles/` or `scripts/install-cursor.ps1`
- Claude Code: `dist/claude-code/bundles/` or `scripts/install-claude-code.ps1`

Optional memory scaffold for Superpowers workflows:

- `scripts/install-superpowers-memory.ps1 -ProjectRoot <project-root>`
- `scripts/install-superpowers-memory-integration.ps1 -Tool all -ProjectRoot <project-root>`

This creates `.superpowers-memory/` in the target project so Superpowers-based workflows can read stable project context and persist session summaries for future sessions.
It can also update project-level tool instructions so Codex, Cursor, and Claude Code read that memory at the start of new sessions.

## Why Not Copy Source Workflows Directly

Some source workflows are orchestrators. They are designed for maintainability and may depend on other workflows or external skills.

That modular design is useful for maintainers, but it can confuse users who expect a single copied folder to be immediately usable.

The `dist/` bundles are the supported installation path for real usage.

## Install Script Parameters

All install scripts (`.sh` and `.ps1`) support these parameters:

| Shell flag | PowerShell flag | Description |
|---|---|---|
| `--bundle <name>` | `-Bundle <name>` | Select bundle to install |
| `--project-root <path>` | `-ProjectRoot <path>` | Target project root directory |
| `--codex-home <path>` | `-CodexHome <path>` | Codex home directory |
| `--dry-run` | `-DryRun` | Preview only, do not copy files |
| `--backup` | `-Backup` | Backup existing files before overwriting |
| `--force` | `-Force` | Skip confirmation prompts |
| `--merge` | `-Merge` | Merge into existing directories instead of replacing them (keeps files only in target, overwrites same-name files, default on) |
| `--no-merge` | `-NoMerge` | Replace existing directories instead of merging |
| `--check-dependencies` | `-CheckDependencies` | Only check runtime dependencies |

## Generating a Usage README

Use the `readme` command to generate a quick-start `README.md` in the target project directory:

```bash
npx spec readme --project-root ./my-project
```

If `README.md` already exists, it will not be overwritten.
