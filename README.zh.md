# @axlpq/ai-coding-workflow

## 中文文档

中文读者可以从这里开始：

- [README.cn.md](README.cn.md)
- [MEMORY.cn.md](MEMORY.cn.md)
- [VERIFY.cn.md](VERIFY.cn.md)
- [team-skills/INSTALL.cn.md](team-skills/INSTALL.cn.md)
- [team-skills/README.cn.md](team-skills/README.cn.md)

这是一套面向 AI 编程助手的带有记忆和自主学习工作流技能库。目标很直接：让智能体按流程做事，而不是一上来就直接写代码。用户可以按需组合 Superpowers 和 OpenSpec 使用。

这个仓库现在分成两层：

- `team-skills/`：项目维护的源码级 workflow 定义
- `dist/`：面向 Codex、Cursor、Claude Code 等具体工具的预适配 bundle

如果你是使用者，请优先使用 `dist/` 和 `scripts/`。不要从 `team-skills/` 里复制单个编排 workflow，除非你有意自己扩展或适配源码定义。

`team-skills/` 下的源码 workflow 和 `dist/` 下的工具 bundle 在措辞和结构上可能不同，但功能上应保持一致。源码 workflow 是面向维护者的定义；分发 bundle 是同一 workflow 面向具体工具的运行时形态。

重要说明：这些 workflow 都是显式启用型流程。它们不应该变成 AI 工具的默认后台行为。用户应通过明确请求、点名 workflow，或因仓库策略明确要求来启用它们。

如果你希望 Codex 在没有被显式调用时忽略这些 workflow，可以只安装 bundle，但只在对话中通过 workflow 名称来激活它。

示例：

```text
Use $superpowers-openspec-execution-workflow for this feature.
```

## 开始前先看

### 这套技能库的价值

这个仓库适合希望 AI 编程工具别一上来就直接写代码，而是按更稳的交付路径做事的团队：

- 先澄清，再实现
- 先确认行为，再做有风险的改动
- 实现时带上测试和验证
- 完成后有清晰的归档收尾
- 把项目上下文持续记在仓库里，让新会话不是从空白开始

### 项目记忆

这个仓库现在额外支持一套可选的、持久化到仓库里的 Superpowers 记忆模式。

当目标项目中存在 `.superpowers-memory/` 时，Superpowers workflow 应该：

- 读取 `PROJECT_CONTEXT.md`，了解稳定的项目事实
- 读取 `CURRENT_STATE.md`，了解最新工作上下文
- 读取 `DECISIONS.md` 和 `KNOWN_FAILURES.md`（如果存在）
- 阅读 `session-journal/` 里的最近记录
- 在会话结束前更新相关记忆文件
- 当 workflow 依赖记忆质量时，运行 `scripts/validate-superpowers-memory.ps1`

这样不用单独部署记忆服务，也能让 AI 拥有轻量的跨会话记忆。

推荐的默认用法：让工具在新会话开始时先读取 repo memory，平时至少保持 `PROJECT_CONTEXT.md` 和 `CURRENT_STATE.md` 基本可用、基本最新；做完一轮有意义的工作后，用 `superpowers-learning` 作为默认记忆收尾入口。不要期待普通聊天自动把内容写回 memory 文件；如果想更轻量一点，可以改用 `scripts/run-superpowers-memory-closeout.ps1`。

### 运行要求

- 使用创建或检查 OpenSpec change 的 workflow 时，需要安装 OpenSpec CLI
- 需要一个实际项目仓库，智能体可以在其中写入设计文档、计划、OpenSpec change、代码、测试和验证输出
- 可选：如需跨会话记忆，目标项目中需要有 `.superpowers-memory/` 文件夹

### 推荐入口

- `openspec-superpowers`：从需求澄清到验证完成的完整功能流程
- `superpowers-openspec-execution`：Superpowers 探索 → OpenSpec 固化 → Superpowers 执行验证 → OpenSpec 归档
- `superpowers-feature`：设计、计划、TDD 和验证，不生成 OpenSpec 产物
- `superpowers-learning`：反思型沉淀，保存持久项目知识、会话成果和可复用经验
- `openspec-feature`：在实现之前先创建 OpenSpec proposal、design、specs 和 tasks

### 怎么选择

- 如果你想要一个端到端的统一入口，不想自己决定步骤顺序，用 `openspec-superpowers`。它是从需求澄清到验证完成的通用全流程选项。
- 如果你想要固定的四步路径——Superpowers 探索、OpenSpec 固化、Superpowers 执行、OpenSpec 归档——用 `superpowers-openspec-execution`。
- 如果你只需要 Superpowers 的工程纪律，不需要 OpenSpec change 产物，用 `superpowers-feature`。
- 如果重要工作已经结束，你想保存这次会话教会了团队什么，用 `superpowers-learning`。
- 如果你只想在实现之前先创建或补齐 OpenSpec change 产物，用 `openspec-feature`。

### 推荐收尾方式

对于长期协作的项目，一个比较好的模式是：

1. 先用一个交付型 workflow
2. 完成实现和验证
3. 再用 `superpowers-learning` 保存持久经验和当前状态

## 包含内容

源码 workflow：

- [OpenSpec + Superpowers Workflow](team-skills/openspec-superpowers-workflow/README.md)
- [Superpowers -> OpenSpec -> Superpowers Workflow](team-skills/superpowers-openspec-execution-workflow/README.md)
- [Superpowers Feature Workflow](team-skills/superpowers-feature-workflow/README.md)
- [Superpowers Learning Workflow](team-skills/superpowers-learning-workflow/README.md)
- [OpenSpec Feature Workflow](team-skills/openspec-feature-workflow/README.md)

每个源码 workflow 现在还包含一个机器可读的 `workflow.yaml` 文件，用于依赖和工具元数据。

## 仓库结构

```text
team-skills/   源码 workflow 定义
dist/          面向具体工具的预构建 bundle
scripts/       支持工具的安装脚本
bin/           CLI 入口 (spec)
```

## 社区

如果你想贡献或审查仓库策略，可以从这里开始：

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [CHANGELOG.md](CHANGELOG.md)
- [docs/enhancement-overview.cn.md](docs/enhancement-overview.cn.md)
- [docs/layered-adoption-model.cn.md](docs/layered-adoption-model.cn.md)

仓库还包含一个基础的 GitHub Actions CI workflow，用于治理文件检查和记忆脚本冒烟测试。

## 快速开始

### 通过 npm 安装（推荐）

```bash
npm install @axlpq/ai-coding-workflow

# 查看可用工作流
npx spec list

# 查看指定工具的可用工作流
npx spec list --tool claude-code

# 安装 workflow bundle 到你的项目
npx spec claude-code --bundle superpowers-openspec-execution --project-root ./my-project
npx spec cursor --bundle openspec-superpowers --project-root ./my-project
npx spec codex --bundle superpowers-feature --codex-home ~/.codex

# 安装记忆脚手架和集成
npx spec memory --project-root ./my-project
npx spec memory-integ --tool all --project-root ./my-project

# 在目标项目生成快速入门 README
npx spec readme --project-root ./my-project

# 查看已安装版本
npx spec --version
```

### 通过安装脚本安装（适用于本地克隆仓库）

本文里的 `<repo-root>`，指的是你把这个仓库 clone 下来或解压之后，它在你本机上的实际路径。

例如：

- macOS：`/Users/alex/projects/superpowers-openspec-team-skills`
- Linux：`/home/alex/projects/superpowers-openspec-team-skills`
- Windows：`D:\projects\superpowers-openspec-team-skills`

所以这条命令：

```bash
sh "<repo-root>/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex"
```

实际可以写成：

```bash
sh "/Users/alex/projects/superpowers-openspec-team-skills/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex"
```

在运行安装脚本前，请先满足下面两种方式之一：

- 先切换到仓库根目录再执行
- 或者直接使用脚本的绝对路径执行

Windows PowerShell：

```powershell
cd <repo-root>
.\scripts\install-codex.ps1 -Bundle openspec-superpowers
```

Windows PowerShell 绝对路径方式：

```powershell
& "<repo-root>\scripts\install-codex.ps1" -Bundle openspec-superpowers
```

macOS / Linux 原生 shell 方式：

```bash
cd <repo-root>
sh "<repo-root>/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex"
```

如果系统里已经安装了 PowerShell 7（`pwsh`），也可以直接运行脚本：

```bash
cd <repo-root>
pwsh -File ./scripts/install-codex.ps1 -Bundle openspec-superpowers -CodexHome "$HOME/.codex"
```

### Shell 安装脚本参数

原生 shell 安装脚本支持这些标志：

- `--bundle <name>`：选择要安装的 bundle
- `--project-root <path>`：为 Cursor、Claude Code 或记忆安装指定目标仓库根目录
- `--codex-home <path>`：为 Codex 安装指定 Codex home 目录
- `--dry-run`：只预览将写入什么，不实际复制文件
- `--backup`：覆盖前先备份已有的目标文件
- `--force`：跳过覆盖确认
- `--merge`：合并模式，将 bundle 内容合入已有目录而非替换整个目录（保留目标中独有的文件，同名文件仍会被覆盖，默认开启）
- `--no-merge`：替换模式，替换已有目录而非合并
- `--check-dependencies`：只检查运行时依赖（如 `openspec`），不安装文件

当前可用的 shell 安装脚本：

- `scripts/install-codex.sh`
- `scripts/install-cursor.sh`
- `scripts/install-claude-code.sh`
- `scripts/install-superpowers-memory.sh`
- `scripts/install-superpowers-memory-integration.sh`

为任意目标项目安装可选的记忆脚手架：

```powershell
.\scripts\install-superpowers-memory.ps1 -ProjectRoot <project-root>
```

macOS / Linux 原生 shell 方式：

```bash
sh "<repo-root>/scripts/install-superpowers-memory.sh" --project-root <project-root>
```

如果系统里已经安装了 PowerShell 7（`pwsh`），也可以直接运行脚本：

```bash
pwsh -File ./scripts/install-superpowers-memory.ps1 -ProjectRoot <project-root>
```

为 Codex、Cursor 和 Claude Code 安装可选的项目级记忆集成：

```powershell
.\scripts\install-superpowers-memory-integration.ps1 -Tool all -ProjectRoot <project-root>
```

macOS / Linux 原生 shell 方式：

```bash
sh "<repo-root>/scripts/install-superpowers-memory-integration.sh" --tool all --project-root <project-root>
```

如果系统里已经安装了 PowerShell 7（`pwsh`），也可以直接运行脚本：

```bash
pwsh -File ./scripts/install-superpowers-memory-integration.ps1 -Tool all -ProjectRoot <project-root>
```

安装完成后，记得重开或刷新项目，再新开一个会话，让工具先读取 repo memory；一轮有意义的工作结束后，优先用 `superpowers-learning` 来沉淀当前状态和可复用经验。

### Codex

请安装预构建的 Codex bundle，不要再手动复制源码 workflow。

PowerShell：

```powershell
.\scripts\install-codex.ps1 -Bundle openspec-superpowers
```

macOS / Linux 原生 shell 方式：

```bash
sh "<repo-root>/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex"
```

如果系统里已经安装了 PowerShell 7（`pwsh`），也可以直接运行脚本：

```bash
pwsh -File ./scripts/install-codex.ps1 -Bundle openspec-superpowers -CodexHome "$HOME/.codex"
```

常用参数：

```powershell
.\scripts\install-codex.ps1 -Bundle openspec-superpowers -DryRun
.\scripts\install-codex.ps1 -Bundle openspec-superpowers -Backup
.\scripts\install-codex.ps1 -Bundle openspec-superpowers -Backup -Force
.\scripts\install-codex.ps1 -Bundle openspec-superpowers -CheckDependencies
```

macOS / Linux 原生 shell 示例：

```bash
sh "<repo-root>/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex" --dry-run
sh "<repo-root>/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex" --backup
sh "<repo-root>/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex" --backup --force
sh "<repo-root>/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex" --check-dependencies
```

macOS / Linux `pwsh` 示例：

```bash
pwsh -File ./scripts/install-codex.ps1 -Bundle openspec-superpowers -CodexHome "$HOME/.codex" -DryRun
pwsh -File ./scripts/install-codex.ps1 -Bundle openspec-superpowers -CodexHome "$HOME/.codex" -Backup
pwsh -File ./scripts/install-codex.ps1 -Bundle openspec-superpowers -CodexHome "$HOME/.codex" -Backup -Force
pwsh -File ./scripts/install-codex.ps1 -Bundle openspec-superpowers -CodexHome "$HOME/.codex" -CheckDependencies
```

- `-DryRun`：只预览将安装什么，不实际复制文件
- `-Backup`：覆盖前先备份同名 skill 目录
- `-Force`：跳过覆盖确认
- `-Merge`：合并模式，将 bundle 内容合入已有目录而非替换整个目录（默认开启）
- `-NoMerge`：替换模式，替换已有目录而非合并
- `-CheckDependencies`：只检查运行时依赖（如 `openspec`），不安装文件

然后重启或刷新 Codex，再调用：

```text
Use $openspec-superpowers-workflow to run this feature from clarification through verification.
```

如果你没有明确要求使用这些 workflow 中的某一个，Codex 应该保持正常默认行为，而不应该默认假设要使用 Superpowers 或 OpenSpec 流程。

当前可用的 Codex bundle：

- `openspec-superpowers`
- `superpowers-openspec-execution`
- `superpowers-feature`
- `superpowers-learning`
- `openspec-feature`

### Cursor

将 Cursor bundle 安装到目标仓库根目录：

```powershell
.\scripts\install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root>
```

macOS / Linux 原生 shell 方式：

```bash
sh "<repo-root>/scripts/install-cursor.sh" --bundle openspec-superpowers --project-root <project-root>
```

如果系统里已经安装了 PowerShell 7（`pwsh`），也可以直接运行脚本：

```bash
pwsh -File ./scripts/install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root>
```

这会写入 `.cursor/rules/` 文件以及一个 `AGENTS.md` workflow 指南。

重要说明：对 Cursor 来说，这些 workflow bundle 也应该按"显式启用"来使用。可以安装到项目里，但只有在对话中明确点名 workflow 时，才让 Cursor 按它执行。

常用参数：

```powershell
.\scripts\install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -DryRun
.\scripts\install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -Backup
.\scripts\install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -Backup -Force
.\scripts\install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -CheckDependencies
```

macOS / Linux 原生 shell 示例：

```bash
sh "<repo-root>/scripts/install-cursor.sh" --bundle openspec-superpowers --project-root <project-root> --dry-run
sh "<repo-root>/scripts/install-cursor.sh" --bundle openspec-superpowers --project-root <project-root> --backup
sh "<repo-root>/scripts/install-cursor.sh" --bundle openspec-superpowers --project-root <project-root> --backup --force
sh "<repo-root>/scripts/install-cursor.sh" --bundle openspec-superpowers --project-root <project-root> --check-dependencies
```

macOS / Linux `pwsh` 示例：

```bash
pwsh -File ./scripts/install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -DryRun
pwsh -File ./scripts/install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -Backup
pwsh -File ./scripts/install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -Backup -Force
pwsh -File ./scripts/install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -CheckDependencies
```

你也可以安装三段式执行 bundle：

```powershell
.\scripts\install-cursor.ps1 -Bundle superpowers-openspec-execution -ProjectRoot <project-root>
```

macOS / Linux 原生 shell 方式：

```bash
sh "<repo-root>/scripts/install-cursor.sh" --bundle superpowers-openspec-execution --project-root <project-root>
```

如果系统里已经安装了 PowerShell 7（`pwsh`），也可以直接运行脚本：

```bash
pwsh -File ./scripts/install-cursor.ps1 -Bundle superpowers-openspec-execution -ProjectRoot <project-root>
```

推荐的显式启用方式：

```text
Use the superpowers-openspec-execution workflow for this feature.
```

### Claude Code

将 Claude Code bundle 安装到目标仓库根目录：

```powershell
.\scripts\install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root>
```

macOS / Linux 原生 shell 方式：

```bash
sh "<repo-root>/scripts/install-claude-code.sh" --bundle openspec-superpowers --project-root <project-root>
```

如果系统里已经安装了 PowerShell 7（`pwsh`），也可以直接运行脚本：

```bash
pwsh -File ./scripts/install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root>
```

这会写入 `.claude/commands/` 文件以及一个 `CLAUDE.md` 项目指南。

重要说明：对 Claude Code 来说，安装 bundle 后，请优先用生成的 slash command 来激活 workflow，不建议只靠自然语言路由来触发。这样 Claude Code 会读取命令文件，并稳定应用 workflow 门禁。

常用参数：

```powershell
.\scripts\install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -DryRun
.\scripts\install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -Backup
.\scripts\install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -Backup -Force
.\scripts\install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -CheckDependencies
```

macOS / Linux 原生 shell 示例：

```bash
sh "<repo-root>/scripts/install-claude-code.sh" --bundle openspec-superpowers --project-root <project-root> --dry-run
sh "<repo-root>/scripts/install-claude-code.sh" --bundle openspec-superpowers --project-root <project-root> --backup
sh "<repo-root>/scripts/install-claude-code.sh" --bundle openspec-superpowers --project-root <project-root> --backup --force
sh "<repo-root>/scripts/install-claude-code.sh" --bundle openspec-superpowers --project-root <project-root> --check-dependencies
```

macOS / Linux `pwsh` 示例：

```bash
pwsh -File ./scripts/install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -DryRun
pwsh -File ./scripts/install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -Backup
pwsh -File ./scripts/install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -Backup -Force
pwsh -File ./scripts/install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root> -CheckDependencies
```

你也可以安装三段式执行 bundle：

```powershell
.\scripts\install-claude-code.ps1 -Bundle superpowers-openspec-execution -ProjectRoot <project-root>
```

macOS / Linux 原生 shell 方式：

```bash
sh "<repo-root>/scripts/install-claude-code.sh" --bundle superpowers-openspec-execution --project-root <project-root>
```

如果系统里已经安装了 PowerShell 7（`pwsh`），也可以直接运行脚本：

```bash
pwsh -File ./scripts/install-claude-code.ps1 -Bundle superpowers-openspec-execution -ProjectRoot <project-root>
```

推荐的显式启用方式：

```text
/superpowers-openspec-execution-workflow
<描述你的功能需求>
```

例如：

```text
/superpowers-openspec-execution-workflow
增加点评门店信息。
```

安装后，请确认目标仓库里存在以下文件：

```text
CLAUDE.md
.claude/commands/superpowers-openspec-execution-workflow.md
```

依赖 OpenSpec 的 bundle 即使在 `openspec` 缺失时也能安装，但脚本现在会在安装前给出警告，并且可以先显式检查依赖。

## Bundle 分发模型

这个仓库现在以 bundle 的形式分发面向用户的 workflow 包，而不是从源码树中复制单个文件夹。

当前 bundle 目录：

- `dist/codex/bundles/`
- `dist/cursor/bundles/`
- `dist/claude-code/bundles/`

每个 bundle 只包含目标工具真正需要的文件。

## 构建与安装的区别

仓库里的脚本现在分成两种角色：

- `install-*.ps1`：给最终用户安装 bundle 到 Codex、Cursor 或 Claude Code
- `build-dist.ps1`：给维护者刷新和校验 `dist/` 下的分发层

维护者命令示例：

```powershell
.\scripts\build-dist.ps1
```

当你修改了 `team-skills/` 下的源码 workflow、`workflow.yaml` 元数据，或调整了 bundle 结构约定时，就应该运行 `build-dist.ps1`。它不会向 AI 工具安装任何东西。它是发布和维护流程的一部分。

## 为什么要这样改

原来的源码 workflow 是模块化和可复用的，但部分入口 workflow 会依赖其他 workflow 或外部 skills。这对维护来说是好的，但对安装体验不好。

新的结构通过明确区分来修复这个问题：

- 源码 workflow 面向维护者
- bundle 面向最终用户

## 工具支持

### Codex

Codex 是目前最合适的工具，因为它原生支持 skills。请使用 `dist/codex/bundles/` 下的预构建 bundle，或 `scripts/install-codex.ps1` 下的安装脚本。

### Cursor

Cursor 使用仓库规则和 agent 指令，而不是 Codex 风格的 skills。请使用 `dist/cursor/bundles/` 下的 bundle。

### Claude Code

Claude Code 使用命令文件和项目指令，而不是 Codex 风格的 skills。请使用 `dist/claude-code/bundles/` 下的 bundle。

### 其他工具

仓库的设计允许后续通过在 `dist/` 下添加新的 bundle 适配器来支持其他 agent 运行时。

## 显式启用

这些 workflow 只应在以下条件之一满足时激活：

- 用户明确点名某个 workflow
- 用户明确要求使用该 workflow 风格
- 仓库策略明确要求使用该 workflow

它们不应该被当成每个编码请求的默认后台行为。

对 Codex 用户，最稳妥的模式是：

1. 安装 bundle
2. 保持正常的编码提问方式不变
3. 只在你想要启用 workflow 时，才明确点名它

对 Cursor 和 Claude Code 用户，请遵循同样的规则：

1. 将 bundle 安装到项目中
2. 保持正常的提问方式不变
3. 只在你想要启用 workflow 时，才通过名称明确请求它

## 文档

- [中文 README](README.cn.md)
- [记忆指南](MEMORY.md)
- [中文记忆指南](MEMORY.cn.md)
- [验证指南](VERIFY.md)
- [中文验证指南](VERIFY.cn.md)
- [源码 workflow 总览](team-skills/README.md)
- [源码 workflow 安装说明](team-skills/INSTALL.md)
