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
const baseEnv = {
  ...process.env,
  SPEC_DISABLE_UPDATE_CHECK: "1",
};

const result = spawnSync(process.execPath, [
  specBin,
  "init",
  "--tools",
  "claude-code,codex,cursor",
  "--project-root",
  tmpRoot,
], {
  cwd: tmpRoot,
  env: baseEnv,
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
  env: baseEnv,
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
  env: baseEnv,
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

function makeFakeNpm(latestVersion) {
  const fakeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "spec-fake-npm-"));
  const logFile = path.join(fakeRoot, "npm.log");
  const fakeNpm = path.join(fakeRoot, process.platform === "win32" ? "npm.cmd" : "npm");
  const script = process.platform === "win32"
    ? `@echo off
node "%~dp0\\fake-npm.js" %*
`
    : `#!/bin/sh
exec "${process.execPath}" "$(dirname "$0")/fake-npm.js" "$@"
`;
  fs.writeFileSync(fakeNpm, script, "utf8");
  if (process.platform !== "win32") {
    fs.chmodSync(fakeNpm, 0o755);
  }
  fs.writeFileSync(path.join(fakeRoot, "fake-npm.js"), `
const fs = require("fs");
const logFile = ${JSON.stringify(logFile)};
fs.appendFileSync(logFile, process.argv.slice(2).join(" ") + "\\n");
const args = process.argv.slice(2);
if (args[0] === "view") {
  console.log(${JSON.stringify(latestVersion)});
  process.exit(0);
}
if (args[0] === "install" && args[1] === "-g") {
  process.exit(0);
}
process.exit(1);
`, "utf8");
  return { fakeNpm, logFile };
}

function readLog(logFile) {
  return fs.existsSync(logFile)
    ? fs.readFileSync(logFile, "utf8").trim().split(/\n/).filter(Boolean)
    : [];
}

const promptStateDir = fs.mkdtempSync(path.join(os.tmpdir(), "spec-update-state-"));
const yesNpm = makeFakeNpm("99.0.0");
const yesResult = spawnSync(process.execPath, [
  specBin,
  "list",
], {
  cwd: repoRoot,
  env: {
    ...process.env,
    SPEC_NPM_BIN: yesNpm.fakeNpm,
    SPEC_UPDATE_STATE_DIR: promptStateDir,
  },
  input: "y\n",
  encoding: "utf8",
});

assert.strictEqual(
  yesResult.status,
  0,
  `spec list should continue after accepting update\nstdout:\n${yesResult.stdout}\nstderr:\n${yesResult.stderr}`
);
assert.match(yesResult.stdout, /检测到 spec 新版本/, "outdated spec should show update prompt");
assert.deepStrictEqual(readLog(yesNpm.logFile), [
  "view @axlpq/ai-coding-workflow version",
  "install -g @axlpq/ai-coding-workflow@latest",
]);

const declineStateDir = fs.mkdtempSync(path.join(os.tmpdir(), "spec-update-decline-state-"));
const noNpm = makeFakeNpm("99.0.0");
const noResult = spawnSync(process.execPath, [
  specBin,
  "list",
], {
  cwd: repoRoot,
  env: {
    ...process.env,
    SPEC_NPM_BIN: noNpm.fakeNpm,
    SPEC_UPDATE_STATE_DIR: declineStateDir,
  },
  input: "n\n",
  encoding: "utf8",
});

assert.strictEqual(
  noResult.status,
  0,
  `spec list should continue after declining update\nstdout:\n${noResult.stdout}\nstderr:\n${noResult.stderr}`
);
assert.match(noResult.stdout, /已跳过本次更新/, "declining update should be acknowledged");
assert.deepStrictEqual(readLog(noNpm.logFile), [
  "view @axlpq/ai-coding-workflow version",
]);

const secondNoResult = spawnSync(process.execPath, [
  specBin,
  "list",
], {
  cwd: repoRoot,
  env: {
    ...process.env,
    SPEC_NPM_BIN: noNpm.fakeNpm,
    SPEC_UPDATE_STATE_DIR: declineStateDir,
  },
  encoding: "utf8",
});

assert.strictEqual(
  secondNoResult.status,
  0,
  `spec list should not prompt again after declining update\nstdout:\n${secondNoResult.stdout}\nstderr:\n${secondNoResult.stderr}`
);
assert.doesNotMatch(secondNoResult.stdout, /检测到 spec 新版本/, "declined update should not prompt again");
assert.deepStrictEqual(readLog(noNpm.logFile), [
  "view @axlpq/ai-coding-workflow version",
]);

const helpNpm = makeFakeNpm("99.0.0");
const helpResult = spawnSync(process.execPath, [
  specBin,
  "--help",
], {
  cwd: repoRoot,
  env: {
    ...process.env,
    SPEC_NPM_BIN: helpNpm.fakeNpm,
    SPEC_UPDATE_STATE_DIR: fs.mkdtempSync(path.join(os.tmpdir(), "spec-update-help-state-")),
  },
  encoding: "utf8",
});

assert.strictEqual(helpResult.status, 0, "spec --help should exit successfully");
assert.deepStrictEqual(readLog(helpNpm.logFile), [], "spec --help should not check npm version");
