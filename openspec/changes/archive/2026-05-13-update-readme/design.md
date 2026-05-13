## Context

项目有三份 README 文档（README.md 英文、README.cn.md 中文、README.zh.md 详细中文）以及一份项目介绍文档（`项目介绍与使用文档.md`）。代码层面已经完成了以下变更：

- 所有安装脚本新增 `--merge`（默认开启）和 `--no-merge` 参数
- `bin/spec.js` 新增 `readme` 子命令和 `--version`/`-v` 标志
- `package.json` 版本号从 1.0.2 更新到 1.0.5
- `team-skills/INSTALL.md` 和 `INSTALL.cn.md` 已经补充了参数和 readme 命令说明

但 README 文档尚未同步这些变更。

## Goals / Non-Goals

**Goals:**

- 在三份 README 中补充 `--merge`/`--no-merge` 参数说明
- 在三份 README 中补充 `npx spec readme` 命令说明
- 在三份 README 中补充 `--version`/`-v` 标志说明
- 在 `项目介绍与使用文档.md` 中补充同样的内容
- 确保文档之间关键内容对齐

**Non-Goals:**

- 不重构 README 结构或重写大段内容
- 不修改代码逻辑
- 不变更 team-skills/INSTALL.md 或 INSTALL.cn.md（已更新）

## Decisions

1. **增量补充而非重写**：只添加缺失的参数行和命令说明，保持现有内容不变。原因：diff 最小化，降低引入错误的风险。

2. **在 Shell 安装脚本参数部分补充 merge/no-merge 行**：与已有的 `--dry-run`、`--backup`、`--force` 行保持同一表格/列表。原因：位置一致，读者容易找到。

3. **在快速开始部分补充 `npx spec readme` 和 `--version`**：与 `npx spec list`、`npx spec memory` 等命令放在一起。原因：读者习惯从快速开始部分找 CLI 命令。

4. **`项目介绍与使用文档.md` 在 6.4 安装脚本通用参数表格补充行，并新增 6.5.x 小节说明 readme 命令**：原因：与文档现有结构一致。

## Risks / Trade-offs

- [三份文档更新可能不一致] → 更新后交叉比对关键内容
- [README.zh.md 内容比其他两份更详细，补充位置可能不同] → 按各自现有结构找最合适的位置
