#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const specBin = path.join(repoRoot, "bin", "spec.js");
const installCodexScript = path.join(repoRoot, "scripts", "install-codex.sh");
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "spec-init-"));

const result = spawnSync(process.execPath, [
  specBin,
  "init",
  "--tools",
  "claude-code,codex,cursor",
  "--project-root",
  tmpRoot,
], {
  cwd: tmpRoot,
  encoding: "utf8",
});

assert.strictEqual(
  result.status,
  0,
  `spec init should exit 0\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
);

assert.ok(
  fs.existsSync(path.join(tmpRoot, ".claude", "commands", "openspec-superpowers-workflow.md")),
  "claude-code files should be generated under project .claude"
);
assert.ok(
  fs.existsSync(path.join(tmpRoot, ".codex", "skills", "openspec-superpowers-workflow", "SKILL.md")),
  "codex files should be generated under project .codex"
);
assert.ok(
  fs.existsSync(path.join(tmpRoot, ".cursor", "rules", "openspec-superpowers-workflow.mdc")),
  "cursor files should be generated under project .cursor"
);

console.log(`spec init generated tool files under ${tmpRoot}`);

const aliasRoot = fs.mkdtempSync(path.join(os.tmpdir(), "spec-init-alias-"));
const aliasResult = spawnSync(process.execPath, [
  specBin,
  "init",
  "--tools",
  "calude-code",
  "--project-root",
  aliasRoot,
], {
  cwd: aliasRoot,
  encoding: "utf8",
});

assert.strictEqual(
  aliasResult.status,
  0,
  `spec init should accept calude-code alias\nstdout:\n${aliasResult.stdout}\nstderr:\n${aliasResult.stderr}`
);
assert.ok(
  fs.existsSync(path.join(aliasRoot, ".claude", "commands", "openspec-superpowers-workflow.md")),
  "calude-code alias should generate claude-code files"
);

const cwdRoot = fs.mkdtempSync(path.join(os.tmpdir(), "spec-init-cwd-"));
const cwdResult = spawnSync(process.execPath, [
  specBin,
  "init",
  "--tools",
  "cursor",
], {
  cwd: cwdRoot,
  encoding: "utf8",
});

assert.strictEqual(
  cwdResult.status,
  0,
  `spec init should default project root to cwd\nstdout:\n${cwdResult.stdout}\nstderr:\n${cwdResult.stderr}`
);
assert.ok(
  fs.existsSync(path.join(cwdRoot, ".cursor", "rules", "openspec-superpowers-workflow.mdc")),
  "when --project-root is omitted, cursor files should be generated under cwd"
);

const missingHome = fs.mkdtempSync(path.join(os.tmpdir(), "spec-init-missing-home-"));
const missingTarget = fs.mkdtempSync(path.join(os.tmpdir(), "spec-init-missing-target-"));
const missingResult = spawnSync("sh", [
  installCodexScript,
  "--bundle",
  "openspec-superpowers",
  "--codex-home",
  path.join(missingTarget, ".codex"),
  "--force",
], {
  cwd: repoRoot,
  env: {
    ...process.env,
    HOME: missingHome,
    PATH: "/usr/bin:/bin",
    SUPERPOWERS_PKG_ROOT: repoRoot,
  },
  input: "n\nn\n",
  encoding: "utf8",
});

assert.strictEqual(
  missingResult.status,
  0,
  `install should continue after declining dependency installs\nstdout:\n${missingResult.stdout}\nstderr:\n${missingResult.stderr}`
);
assert.match(missingResult.stdout, /❌ OpenSpec/, "missing OpenSpec should be marked with a red icon");
assert.match(missingResult.stdout, /❌ Superpowers/, "missing Superpowers should be marked with a red icon");
assert.match(missingResult.stdout, /⚠️ install:/, "missing dependencies should show warning install hints");
assert.match(missingResult.stdout, /是否现在执行安装命令/, "auto-installable dependency should ask before executing install command");
assert.match(missingResult.stdout, /是否查看安装指令/, "manual dependency should ask before showing install instruction");
