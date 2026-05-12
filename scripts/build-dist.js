#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEAM_SKILLS_DIR = path.join(ROOT, "team-skills");
const DIST_DIR = path.join(ROOT, "dist");

const TOOLS = ["codex", "cursor", "claude-code"];

const WORKFLOW_DIRS = fs.readdirSync(TEAM_SKILLS_DIR).filter(d => {
  const full = path.join(TEAM_SKILLS_DIR, d);
  return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, "workflow.yaml"));
});

const BUNDLE_MAP = {
  "openspec-superpowers-workflow": "openspec-superpowers",
  "superpowers-openspec-execution-workflow": "superpowers-openspec-execution",
  "superpowers-feature-workflow": "superpowers-feature",
  "openspec-feature-workflow": "openspec-feature",
  "superpowers-learning-workflow": "superpowers-learning",
};

function parseWorkflowYaml(yamlPath) {
  const content = fs.readFileSync(yamlPath, "utf8");
  const result = {};
  let currentArrayKey = null;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") && currentArrayKey) {
      result[currentArrayKey].push(trimmed.slice(2).trim());
      continue;
    }

    currentArrayKey = null;

    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === "" || val === "[]") {
        result[key] = [];
      } else {
        result[key] = val;
      }
      // If the next lines might be array items, peek ahead
      // We'll set currentArrayKey only if value is empty (implies YAML block sequence)
      if (val === "") {
        currentArrayKey = key;
      }
    }
  }

  return result;
}

function parseSkillMd(skillPath) {
  const content = fs.readFileSync(skillPath, "utf8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let description = "";
  if (frontmatterMatch) {
    const descMatch = frontmatterMatch[1].match(/^description:\s*(.+)$/m);
    if (descMatch) description = descMatch[1].trim();
  }
  return { description };
}

function buildManifest(bundleName, tool, runtimeRequirements, contents) {
  const installTarget = tool === "codex" ? ".codex/skills" : "project-root";
  const manifest = {
    name: bundleName,
    tool,
    type: "bundle",
    installTarget,
  };
  if (tool === "codex") {
    manifest.description = `Standalone Codex skill bundle for the ${bundleName} workflow.`;
  }
  if (runtimeRequirements && runtimeRequirements.length > 0) {
    manifest.runtimeRequirements = runtimeRequirements;
  }
  manifest.contents = contents;
  return manifest;
}

function generateCodexBundle(workflowDir, workflowName, bundleName, meta) {
  const skillMdPath = path.join(workflowDir, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) {
    console.warn(`  SKIP: SKILL.md not found in ${workflowDir}`);
    return;
  }

  const skillContent = fs.readFileSync(skillMdPath, "utf8");
  const runtimeReqs = meta.runtime_requirements || [];
  const skillDirName = workflowName;

  const bundleDir = path.join(DIST_DIR, "codex", "bundles", bundleName);
  const skillsDir = path.join(bundleDir, "skills", skillDirName);

  fs.mkdirSync(skillsDir, { recursive: true });
  fs.writeFileSync(path.join(skillsDir, "SKILL.md"), skillContent);

  const contents = [`skills/${skillDirName}`];
  const manifest = buildManifest(bundleName, "codex", runtimeReqs, contents);
  fs.writeFileSync(path.join(bundleDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  const readme = `# Codex Bundle: ${bundleName}\n\nInstall this bundle when you want the \`${workflowName}\` Codex skill.\n\nInstall target:\n\n\`\`\`text\n.codex/skills/\n\`\`\`\n\nAfter installation, invoke:\n\n\`\`\`text\nUse $${workflowName} to run this feature.\n\`\`\`\n`;
  fs.writeFileSync(path.join(bundleDir, "README.md"), readme);
}

function generateCursorBundle(workflowDir, workflowName, bundleName, meta) {
  const skillMdPath = path.join(workflowDir, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) {
    console.warn(`  SKIP: SKILL.md not found in ${workflowDir}`);
    return;
  }

  const skillContent = fs.readFileSync(skillMdPath, "utf8");
  const bodyContent = skillContent.replace(/^---[\s\S]*?---\n*/, "").trim();
  const runtimeReqs = meta.runtime_requirements || [];

  const bundleDir = path.join(DIST_DIR, "cursor", "bundles", bundleName);
  const rulesDir = path.join(bundleDir, ".cursor", "rules");

  fs.mkdirSync(rulesDir, { recursive: true });

  const mdc = `---\ndescription: Route explicit ${workflowName} requests.\nalwaysApply: false\n---\n\n${bodyContent}\n`;
  fs.writeFileSync(path.join(rulesDir, `${workflowName}.mdc`), mdc);

  const agentsMd = generateCursorAgentsMd(workflowName, bodyContent);
  fs.writeFileSync(path.join(bundleDir, "AGENTS.md"), agentsMd);

  const contents = [`.cursor/rules/${workflowName}.mdc`, "AGENTS.md"];
  const manifest = buildManifest(bundleName, "cursor", runtimeReqs, contents);
  fs.writeFileSync(path.join(bundleDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  const readme = `# Cursor Bundle: ${bundleName}\n\nCopy this bundle into the target repository root. It provides a Cursor rule plus \`AGENTS.md\` guidance for the \`${workflowName}\` workflow.\n`;
  fs.writeFileSync(path.join(bundleDir, "README.md"), readme);
}

function generateCursorAgentsMd(workflowName, bodyContent) {
  const lines = [
    "# Agent Workflow\n",
    "This workflow is explicit opt-in. Do not apply it by default. Only apply it when the user explicitly asks for this workflow or names it in chat.\n",
  ];

  const firstLine = bodyContent.split("\n").find(l => l.trim().length > 0) || "";
  if (firstLine.startsWith("#")) {
    lines.push(`When the user asks for the \`${workflowName}\` workflow:\n`);
  }

  lines.push(`See \`.cursor/rules/${workflowName}.mdc\` for the full workflow definition.\n`);
  return lines.join("\n");
}

function generateClaudeCodeBundle(workflowDir, workflowName, bundleName, meta) {
  const skillMdPath = path.join(workflowDir, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) {
    console.warn(`  SKIP: SKILL.md not found in ${workflowDir}`);
    return;
  }

  const skillContent = fs.readFileSync(skillMdPath, "utf8");
  const bodyContent = skillContent.replace(/^---[\s\S]*?---\n*/, "").trim();
  const runtimeReqs = meta.runtime_requirements || [];

  const bundleDir = path.join(DIST_DIR, "claude-code", "bundles", bundleName);
  const commandsDir = path.join(bundleDir, ".claude", "commands");

  fs.mkdirSync(commandsDir, { recursive: true });

  fs.writeFileSync(path.join(commandsDir, `${workflowName}.md`), bodyContent);

  const claudeMd = generateClaudeMd(workflowName, bodyContent);
  fs.writeFileSync(path.join(bundleDir, "CLAUDE.md"), claudeMd);

  const contents = [`.claude/commands/${workflowName}.md`, "CLAUDE.md"];
  const manifest = buildManifest(bundleName, "claude-code", runtimeReqs, contents);
  fs.writeFileSync(path.join(bundleDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  const readme = `# Claude Code Bundle: ${bundleName}\n\nCopy this bundle into the target repository root, then invoke \`/${workflowName}\`.\n`;
  fs.writeFileSync(path.join(bundleDir, "README.md"), readme);
}

function generateClaudeMd(workflowName, bodyContent) {
  const lines = [
    "# Project Workflow\n",
    "These workflow instructions are explicit opt-in. Do not apply them by default. Only apply them when the user explicitly asks for the workflow or invokes its command.\n",
    `Prefer the \`${workflowName}\` command when this workflow should be active.\n`,
  ];

  if (bodyContent.includes("superpowers-memory")) {
    lines.push("If `.superpowers-memory/` exists in the repository, treat it as shared project memory and keep it up to date during the workflow.\n");
  }

  return lines.join("\n");
}

// Main
console.log("Building dist/ from team-skills/ source...\n");

let errorCount = 0;

for (const workflowDirName of WORKFLOW_DIRS) {
  const workflowDir = path.join(TEAM_SKILLS_DIR, workflowDirName);
  const yamlPath = path.join(workflowDir, "workflow.yaml");
  const meta = parseWorkflowYaml(yamlPath);
  const workflowName = meta.name || workflowDirName;
  const bundleName = BUNDLE_MAP[workflowName] || workflowName.replace(/-workflow$/, "");

  console.log(`  ${workflowName} -> bundle: ${bundleName}`);

  const toolSupport = meta.tool_support || TOOLS;

  for (const tool of TOOLS) {
    if (!toolSupport.includes(tool)) {
      console.log(`    ${tool}: skipped (not in tool_support)`);
      continue;
    }

    try {
      switch (tool) {
        case "codex":
          generateCodexBundle(workflowDir, workflowName, bundleName, meta);
          break;
        case "cursor":
          generateCursorBundle(workflowDir, workflowName, bundleName, meta);
          break;
        case "claude-code":
          generateClaudeCodeBundle(workflowDir, workflowName, bundleName, meta);
          break;
      }
      console.log(`    ${tool}: OK`);
    } catch (e) {
      console.error(`    ${tool}: FAILED - ${e.message}`);
      errorCount++;
    }
  }
}

console.log(`\nBuild complete.${errorCount > 0 ? ` ${errorCount} error(s).` : ""}`);
process.exit(errorCount > 0 ? 1 : 0);
