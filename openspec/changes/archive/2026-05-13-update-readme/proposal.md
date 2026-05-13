## Why

项目最近新增了 `--merge`/`--no-merge` 安装参数、`npx spec readme` 命令、`--version` 标志，以及版本号更新到 1.0.5，但三份 README（README.md、README.cn.md、README.zh.md）和相关文档尚未同步这些变更。用户看到的文档和实际功能已经不一致，容易导致误解或遗漏。

## What Changes

- 在 README.md（英文）中补充 `--merge`/`--no-merge` 参数说明、`npx spec readme` 命令、`--version` 标志
- 在 README.cn.md（中文）中补充同样的内容，与英文版保持一致
- 在 README.zh.md（详细中文）中补充 `--merge`/`--no-merge` 参数说明、`npx spec readme` 命令、`--version` 标志
- 在 `项目介绍与使用文档.md` 中补充 `npx spec readme` 命令和 `--version` 标志说明
- 确保三份 README 和详细文档对齐当前 package.json 版本号 1.0.5

## Capabilities

### New Capabilities

- `readme-command-doc`: 记录 `npx spec readme` 命令的用途和用法
- `merge-flag-doc`: 记录 `--merge`/`--no-merge` 安装参数的用途和默认行为
- `version-flag-doc`: 记录 `--version`/`-v` CLI 标志

### Modified Capabilities

## Impact

- README.md、README.cn.md、README.zh.md：新增安装参数表格行和命令说明
- `项目介绍与使用文档.md`：新增命令和标志说明
- team-skills/INSTALL.md 和 INSTALL.cn.md 已经包含这些内容，无需修改
