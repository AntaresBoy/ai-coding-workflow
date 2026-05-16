#!/usr/bin/env sh

set -eu

DEPS_OPENSPEC_NAME="OpenSpec"
DEPS_OPENSPEC_REQUIREMENT="openspec-cli"
DEPS_OPENSPEC_CLI_CMD="openspec"
DEPS_OPENSPEC_INSTALL_HINT="npm install -g @fission-ai/openspec@latest"

DEPS_SUPERPOWERS_NAME="Superpowers"
DEPS_SUPERPOWERS_REQUIREMENT="superpowers"
DEPS_SUPERPOWERS_CHECK_PATH="writing-plans/SKILL.md"
DEPS_SUPERPOWERS_INSTALL_HINT="请在 Claude Code 中执行: /plugin install superpowers@claude-plugins-official"

has_runtime_requirement() {
  manifest_path=$1
  requirement=$2

  grep -q "\"$requirement\"" "$manifest_path"
}

superpowers_installed() {
  [ -f "$HOME/.claude/skills/$DEPS_SUPERPOWERS_CHECK_PATH" ] && return 0
  [ -f "$HOME/.agents/skills/$DEPS_SUPERPOWERS_CHECK_PATH" ] && return 0
  return 1
}

show_dependency_results() {
  manifest_path=$1
  missing=0
  found_any=0

  if has_runtime_requirement "$manifest_path" "$DEPS_OPENSPEC_REQUIREMENT"; then
    found_any=1
    if command -v "$DEPS_OPENSPEC_CLI_CMD" >/dev/null 2>&1; then
      echo "Runtime dependencies:"
      echo "- $DEPS_OPENSPEC_NAME ($DEPS_OPENSPEC_REQUIREMENT) [ok]"
    else
      echo "Runtime dependencies:"
      echo "- $DEPS_OPENSPEC_NAME ($DEPS_OPENSPEC_REQUIREMENT) [missing]"
      echo "  install: $DEPS_OPENSPEC_INSTALL_HINT"
      missing=1
    fi
  fi

  if has_runtime_requirement "$manifest_path" "$DEPS_SUPERPOWERS_REQUIREMENT"; then
    if [ "$found_any" -eq 0 ]; then
      echo "Runtime dependencies:"
    fi
    found_any=1
    if superpowers_installed; then
      echo "- $DEPS_SUPERPOWERS_NAME ($DEPS_SUPERPOWERS_REQUIREMENT) [ok]"
    else
      echo "- $DEPS_SUPERPOWERS_NAME ($DEPS_SUPERPOWERS_REQUIREMENT) [missing]"
      echo "  install: $DEPS_SUPERPOWERS_INSTALL_HINT"
      missing=1
    fi
  fi

  if [ "$found_any" -eq 1 ]; then
    echo ""
  fi

  return "$missing"
}
