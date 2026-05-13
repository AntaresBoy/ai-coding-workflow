#!/usr/bin/env node

const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const PKG_ROOT = path.resolve(__dirname, "..");
const SCRIPTS_DIR = path.join(PKG_ROOT, "scripts");
const PKG_JSON = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"));

function usage() {
  console.log(`
Usage: npx spec <command> [options]

Commands:
  list           List available workflow bundles and their descriptions
  claude-code    Install workflow bundle into Claude Code project
  cursor         Install workflow bundle into Cursor project
  codex          Install workflow bundle into Codex
  memory         Install AI coding workflow memory scaffold into project
  memory-integ   Install AI coding workflow memory integration into project tools
  readme         Generate usage guide README.md in target directory

Options:
  --version, -v         Print version and exit
  --bundle <name>        Bundle name (default: openspec-superpowers)
                         Available: openspec-superpowers, superpowers-openspec-execution,
                         superpowers-feature, openspec-feature, superpowers-learning
  --project-root <path>  Target project root directory (default: cwd)
  --codex-home <path>    Codex home directory (default: ~/.codex)
  --tool <tool>          Tool for memory-integ: codex|cursor|claude-code|all (default: all)
  --dry-run              Preview only, do not copy files
  --backup               Backup existing files before overwriting
  --force                Skip confirmation prompts
  --merge                Merge into existing directories (default behavior)
  --no-merge             Replace existing directories instead of merging
  --check-dependencies   Only check runtime dependencies
  -h, --help             Show this help message

Examples:
  npx spec list
  npx spec list --tool claude-code
  npx spec claude-code --bundle superpowers-openspec-execution --project-root ./my-project
  npx spec cursor --bundle openspec-superpowers --project-root ./my-project
  npx spec codex --bundle superpowers-feature --codex-home ~/.codex
  npx spec memory --project-root ./my-project
  npx spec memory-integ --tool all --project-root ./my-project
  npx spec readme --project-root ./my-project
`);
}

function findScript(name) {
  if (process.platform === "win32") {
    const ps1 = path.join(SCRIPTS_DIR, `${name}.ps1`);
    if (fs.existsSync(ps1)) return { type: "ps1", path: ps1 };
  }
  const sh = path.join(SCRIPTS_DIR, `${name}.sh`);
  if (fs.existsSync(sh)) return { type: "sh", path: sh };
  const ps1 = path.join(SCRIPTS_DIR, `${name}.ps1`);
  if (fs.existsSync(ps1)) return { type: "ps1", path: ps1 };
  console.error(`Script not found: ${name}.{sh,ps1} in ${SCRIPTS_DIR}`);
  process.exit(1);
}

function toPascalCase(kebab) {
  return kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase());
}

function runScript(scriptName, extraArgs) {
  const script = findScript(scriptName);

  if (script.type === "ps1") {
    const pwshArgs = ["-File", script.path];
    for (const arg of extraArgs) {
      if (arg.startsWith("--")) {
        const eqIdx = arg.indexOf("=");
        if (eqIdx !== -1) {
          const key = toPascalCase(arg.slice(2, eqIdx));
          pwshArgs.push(`-${key}`, arg.slice(eqIdx + 1));
        } else {
          pwshArgs.push(`-${toPascalCase(arg.slice(2))}`);
        }
      } else {
        pwshArgs.push(arg);
      }
    }

    const env = Object.assign({}, process.env, {
      SUPERPOWERS_PKG_ROOT: PKG_ROOT
    });

    try {
      execFileSync("pwsh", pwshArgs, { stdio: "inherit", env });
    } catch {
      try {
        execFileSync("powershell", pwshArgs, { stdio: "inherit", env });
      } catch (e) {
        console.error("Failed to run PowerShell script. Make sure pwsh or powershell is available.");
        process.exit(e.status || 1);
      }
    }
  } else {
    try {
      const env = Object.assign({}, process.env, {
        SUPERPOWERS_PKG_ROOT: PKG_ROOT
      });
      execFileSync("sh", [script.path, ...extraArgs], { stdio: "inherit", env });
    } catch (e) {
      process.exit(e.status || 1);
    }
  }
}

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
  usage();
  process.exit(0);
}

if (args[0] === "-v" || args[0] === "--version") {
  console.log(PKG_JSON.version);
  process.exit(0);
}

const command = args[0];
const rest = args.slice(1);

function listBundles(toolFilter) {
  const distDir = path.join(PKG_ROOT, "dist");
  if (!fs.existsSync(distDir)) {
    console.error("dist/ directory not found. Package may be corrupted.");
    process.exit(1);
  }

  const tools = toolFilter
    ? [toolFilter]
    : fs.readdirSync(distDir).filter(d => fs.statSync(path.join(distDir, d)).isDirectory() && d !== ".DS_Store");

  const teamSkillsDir = path.join(PKG_ROOT, "team-skills");
  const descriptions = {};
  if (fs.existsSync(teamSkillsDir)) {
    for (const entry of fs.readdirSync(teamSkillsDir)) {
      const yamlPath = path.join(teamSkillsDir, entry, "workflow.yaml");
      if (fs.existsSync(yamlPath)) {
        const content = fs.readFileSync(yamlPath, "utf8");
        const descMatch = content.match(/^description:\s*(.+)$/m);
        if (descMatch) {
          descriptions[entry] = descMatch[1].trim();
        }
      }
    }
  }

  const bundleToWorkflow = {
    "openspec-superpowers": "openspec-superpowers-workflow",
    "superpowers-openspec-execution": "superpowers-openspec-execution-workflow",
    "superpowers-feature": "superpowers-feature-workflow",
    "openspec-feature": "openspec-feature-workflow",
    "superpowers-learning": "superpowers-learning-workflow",
  };

  const bundleDescriptions = {
    "openspec-superpowers": "从需求澄清到验证完成的完整功能交付流程",
    "superpowers-openspec-execution": "Superpowers 探索 → OpenSpec 固化 → Superpowers 执行验证 → OpenSpec 归档",
    "superpowers-feature": "设计、计划、TDD 和验证，不生成 OpenSpec 产物",
    "openspec-feature": "只做 OpenSpec proposal、design、specs、tasks，不负责实现",
    "superpowers-learning": "工作结束后沉淀项目记忆、会话结论和可复用经验",
  };

  for (const tool of tools) {
    const bundlesDir = path.join(distDir, tool, "bundles");
    if (!fs.existsSync(bundlesDir)) {
      console.log(`\n${tool}: no bundles found`);
      continue;
    }

    const bundles = fs.readdirSync(bundlesDir).filter(d => {
      const p = path.join(bundlesDir, d);
      return fs.statSync(p).isDirectory() && d !== ".DS_Store";
    });

    console.log(`\n${tool} (${bundles.length} bundle${bundles.length !== 1 ? "s" : ""}):`);
    console.log("-".repeat(60));

    for (const bundle of bundles.sort()) {
      const manifestPath = path.join(bundlesDir, bundle, "manifest.json");
      const workflowName = bundleToWorkflow[bundle] || `${bundle}-workflow`;
      const desc = bundleDescriptions[bundle] || descriptions[workflowName] || "";

      let reqs = [];
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          reqs = manifest.runtimeRequirements || [];
        } catch {}
      }

      const reqsTag = reqs.length > 0 ? ` [requires: ${reqs.join(", ")}]` : "";
      console.log(`  ${bundle}${reqsTag}`);
      if (desc) {
        console.log(`    \x1b[92m${desc}\x1b[0m`);
      }
    }
  }

  console.log("\nUsage:");
  console.log("  npx spec <tool> --bundle <bundle-name> --project-root <path>");
  console.log("\nExample:");
  console.log("  npx spec claude-code --bundle superpowers-openspec-execution --project-root ./my-project");
  console.log("\nTips:");
  console.log("  - Install memory first: npx spec memory --project-root <path>");
  console.log("  - Then install integration: npx spec memory-integ --tool all --project-root <path>");
  console.log("  - All workflows are opt-in: they only activate when explicitly invoked");
}

if (command === "list") {
  let toolFilter = null;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--tool" && rest[i + 1]) {
      toolFilter = rest[i + 1];
      break;
    }
  }

  if (toolFilter) {
    const validTools = ["claude-code", "cursor", "codex"];
    if (!validTools.includes(toolFilter)) {
      console.error(`Unknown tool: ${toolFilter}. Valid options: ${validTools.join(", ")}`);
      process.exit(1);
    }
  }

  listBundles(toolFilter);
  process.exit(0);
}

if (command === "readme") {
  let targetDir = process.cwd();
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--project-root" && rest[i + 1]) {
      targetDir = rest[i + 1];
      break;
    }
  }

  const readmeContent = `# AI Coding Workflow 使用说明

本项目已安装 [@axlpq/ai-coding-workflow](https://www.npmjs.com/package/@axlpq/ai-coding-workflow) 工作流技能库。

## 可用命令

\`\`\`bash
# 查看可用工作流
npx spec list

# 安装 workflow bundle
npx spec claude-code --bundle <bundle-name> --project-root .
npx spec cursor --bundle <bundle-name> --project-root .
npx spec codex --bundle <bundle-name> --codex-home ~/.codex

# 安装记忆脚手架
npx spec memory --project-root .

# 安装记忆集成
npx spec memory-integ --tool all --project-root .
\`\`\`

## 可用 Bundle

| Bundle | 说明 |
|---|---|
| openspec-superpowers | 从需求澄清到验证完成的完整功能交付流程 |
| superpowers-openspec-execution | Superpowers 探索 → OpenSpec 固化 → Superpowers 执行验证 → OpenSpec 归档 |
| superpowers-feature | 设计、计划、TDD 和验证，不生成 OpenSpec 产物 |
| openspec-feature | 只做 OpenSpec proposal、design、specs、tasks，不负责实现 |
| superpowers-learning | 工作结束后沉淀项目记忆、会话结论和可复用经验 |

## 安装参数

| 参数 | 说明 |
|---|---|
| --bundle \<name\> | 选择要安装的 bundle |
| --project-root \<path\> | 目标项目根目录 |
| --codex-home \<path\> | Codex home 目录（仅 Codex） |
| --tool \<tool\> | 工具选择：codex / cursor / claude-code / all（仅 memory-integ） |
| --dry-run | 只预览，不实际复制 |
| --backup | 覆盖前先备份 |
| --force | 跳过覆盖确认 |
| --no-merge | 替换已有目录而非合并（默认合并） |
| --check-dependencies | 只检查运行时依赖 |

## 显式启用规则

这些 workflow 都是**显式启用型**，不会自动变成默认行为。只有在以下情况才会启用：

- 用户明确点名某个 workflow
- 用户明确要求按该流程来做
- 仓库策略文件明确要求

### Claude Code 调用方式

\`\`\`
/<workflow-name>
<描述你的功能需求>
\`\`\`

### Cursor / Codex 调用方式

\`\`\`text
Use $<workflow-name> for this feature.
\`\`\`

## 项目记忆（可选）

如果需要跨会话记忆，需要额外安装：

1. 安装记忆脚手架：\`npx spec memory --project-root .\`
2. 安装记忆集成：\`npx spec memory-integ --tool all --project-root .\`
3. 填写 \`PROJECT_CONTEXT.md\` 和 \`CURRENT_STATE.md\` 的最小内容
4. 重开或刷新项目

## 详细文档

- [完整使用文档](https://github.com/axlpq/ai-coding-workflow)
`;

  const targetFile = path.join(targetDir, "README.md");
  if (fs.existsSync(targetFile)) {
    console.log(`README.md already exists at: ${targetFile}`);
    console.log("Skipping to avoid overwriting existing file.");
    console.log("If you want to regenerate, remove the existing README.md first.");
    process.exit(0);
  }

  fs.writeFileSync(targetFile, readmeContent, "utf8");
  console.log(`Generated README.md at: ${targetFile}`);
  process.exit(0);
}

const scriptMap = {
  "claude-code": "install-claude-code",
  "cursor": "install-cursor",
  "codex": "install-codex",
  "memory": "install-superpowers-memory",
  "memory-integ": "install-superpowers-memory-integration",
};

const scriptName = scriptMap[command];
if (!scriptName) {
  console.error(`Unknown command: ${command}`);
  console.error(`Available commands: ${Object.keys(scriptMap).join(", ")}`);
  process.exit(1);
}

runScript(scriptName, rest);
