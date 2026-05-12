#!/usr/bin/env node

const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const PKG_ROOT = path.resolve(__dirname, "..");
const SCRIPTS_DIR = path.join(PKG_ROOT, "scripts");

function usage() {
  console.log(`
Usage: npx superpowers-install <command> [options]

Commands:
  list           List available workflow bundles and their descriptions
  claude-code    Install workflow bundle into Claude Code project
  cursor         Install workflow bundle into Cursor project
  codex          Install workflow bundle into Codex
  memory         Install Superpowers memory scaffold into project
  memory-integ   Install Superpowers memory integration into project tools

Options:
  --bundle <name>        Bundle name (default: openspec-superpowers)
                         Available: openspec-superpowers, superpowers-openspec-execution,
                         superpowers-feature, openspec-feature, superpowers-learning
  --project-root <path>  Target project root directory (default: cwd)
  --codex-home <path>    Codex home directory (default: ~/.codex)
  --tool <tool>          Tool for memory-integ: codex|cursor|claude-code|all (default: all)
  --dry-run              Preview only, do not copy files
  --backup               Backup existing files before overwriting
  --force                Skip confirmation prompts
  --check-dependencies   Only check runtime dependencies
  -h, --help             Show this help message

Examples:
  npx superpowers-install list
  npx superpowers-install list --tool claude-code
  npx superpowers-install claude-code --bundle superpowers-openspec-execution --project-root ./my-project
  npx superpowers-install cursor --bundle openspec-superpowers --project-root ./my-project
  npx superpowers-install codex --bundle superpowers-feature --codex-home ~/.codex
  npx superpowers-install memory --project-root ./my-project
  npx superpowers-install memory-integ --tool all --project-root ./my-project
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
      const desc = descriptions[workflowName] || "";

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
  console.log("  npx superpowers-install <tool> --bundle <bundle-name> --project-root <path>");
  console.log("\nExample:");
  console.log("  npx superpowers-install claude-code --bundle superpowers-openspec-execution --project-root ./my-project");
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
