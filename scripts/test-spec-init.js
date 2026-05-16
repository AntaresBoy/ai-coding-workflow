#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const specBin = path.join(repoRoot, "bin", "spec.js");
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
