#!/usr/bin/env sh

set -eu

DEPS_OPENSPEC_NAME="OpenSpec"
DEPS_OPENSPEC_REQUIREMENT="openspec-cli"
DEPS_OPENSPEC_CLI_CMD="openspec"
DEPS_OPENSPEC_INSTALL_HINT="npm install -g @fission-ai/openspec@latest"
DEPS_OPENSPEC_AUTO_INSTALLABLE=1

DEPS_SUPERPOWERS_NAME="Superpowers"
DEPS_SUPERPOWERS_REQUIREMENT="superpowers"
DEPS_SUPERPOWERS_CHECK_PATH="writing-plans/SKILL.md"
DEPS_SUPERPOWERS_INSTALL_HINT="请在 Claude Code 中执行: /plugin install superpowers@claude-plugins-official"
DEPS_SUPERPOWERS_AUTO_INSTALLABLE=0

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

runtime_dependency_installed() {
  requirement=$1

  case "$requirement" in
    "$DEPS_OPENSPEC_REQUIREMENT")
      command -v "$DEPS_OPENSPEC_CLI_CMD" >/dev/null 2>&1
      ;;
    "$DEPS_SUPERPOWERS_REQUIREMENT")
      superpowers_installed
      ;;
    *)
      return 1
      ;;
  esac
}

dependency_display_name() {
  requirement=$1

  case "$requirement" in
    "$DEPS_OPENSPEC_REQUIREMENT") echo "$DEPS_OPENSPEC_NAME" ;;
    "$DEPS_SUPERPOWERS_REQUIREMENT") echo "$DEPS_SUPERPOWERS_NAME" ;;
    *) echo "$requirement" ;;
  esac
}

dependency_install_hint() {
  requirement=$1

  case "$requirement" in
    "$DEPS_OPENSPEC_REQUIREMENT") echo "$DEPS_OPENSPEC_INSTALL_HINT" ;;
    "$DEPS_SUPERPOWERS_REQUIREMENT") echo "$DEPS_SUPERPOWERS_INSTALL_HINT" ;;
    *) echo "" ;;
  esac
}

dependency_auto_installable() {
  requirement=$1

  case "$requirement" in
    "$DEPS_OPENSPEC_REQUIREMENT") return "$((1 - DEPS_OPENSPEC_AUTO_INSTALLABLE))" ;;
    "$DEPS_SUPERPOWERS_REQUIREMENT") return "$((1 - DEPS_SUPERPOWERS_AUTO_INSTALLABLE))" ;;
    *) return 1 ;;
  esac
}

manifest_runtime_requirements() {
  manifest_path=$1

  if has_runtime_requirement "$manifest_path" "$DEPS_OPENSPEC_REQUIREMENT"; then
    echo "$DEPS_OPENSPEC_REQUIREMENT"
  fi
  if has_runtime_requirement "$manifest_path" "$DEPS_SUPERPOWERS_REQUIREMENT"; then
    echo "$DEPS_SUPERPOWERS_REQUIREMENT"
  fi
}

show_dependency_results() {
  manifest_path=$1
  missing=0
  found_any=0

  for requirement in $(manifest_runtime_requirements "$manifest_path"); do
    if [ "$found_any" -eq 0 ]; then
      echo "Runtime dependencies:"
    fi
    found_any=1
    display_name=$(dependency_display_name "$requirement")
    install_hint=$(dependency_install_hint "$requirement")
    if runtime_dependency_installed "$requirement"; then
      echo "- ✅ $display_name ($requirement) [ok]"
    else
      echo "- ❌ $display_name ($requirement) [missing]"
      echo "  ⚠️ install: $install_hint"
      missing=1
    fi
  done

  if [ "$found_any" -eq 1 ]; then
    echo ""
  fi

  return "$missing"
}

offer_dependency_installs() {
  manifest_path=$1
  missing=0

  for requirement in $(manifest_runtime_requirements "$manifest_path"); do
    runtime_dependency_installed "$requirement" && continue

    missing=1
    display_name=$(dependency_display_name "$requirement")
    install_hint=$(dependency_install_hint "$requirement")

    echo "⚠️ Missing dependency: $display_name ($requirement)"

    if dependency_auto_installable "$requirement"; then
      printf "是否现在执行安装命令：%s ? (y/N) " "$install_hint"
      read ANSWER || ANSWER=""
      case "$ANSWER" in
        y|Y|yes|YES)
          if sh -c "$install_hint"; then
            echo "✅ $display_name installed."
          else
            echo "❌ $display_name install failed. Please run manually: $install_hint" >&2
          fi
          ;;
        *)
          echo "⚠️ Skipped $display_name install. Please run manually: $install_hint"
          ;;
      esac
    else
      printf "是否查看安装指令？(y/N) "
      read ANSWER || ANSWER=""
      case "$ANSWER" in
        y|Y|yes|YES)
          echo "⚠️ $display_name must be installed from the target tool:"
          echo "  $install_hint"
          ;;
        *)
          echo "⚠️ Skipped $display_name install. Install command: $install_hint"
          ;;
      esac
    fi
  done

  return "$missing"
}
