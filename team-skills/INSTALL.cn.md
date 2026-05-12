# 源码层安装说明

`team-skills/` 保存的是本仓库维护用的 workflow 源定义。

它现在不再是面向最终用户的主要安装入口。

## 什么时候直接使用 `team-skills/`

只有在下面这些场景，才建议直接使用 `team-skills/`：

- 维护源码 workflow
- 把 workflow 适配到新的工具
- 构建 `dist/` 下的新 bundle
- 阅读原始 workflow 定义

## 最终用户怎么安装

### 通过 npm 安装（推荐）

```bash
npm install @your-company/superpowers-openspec-team-skills

# 安装 workflow bundle 到你的项目
npx superpowers-install claude-code --bundle openspec-superpowers --project-root <project-root>
npx superpowers-install cursor --bundle openspec-superpowers --project-root <project-root>
npx superpowers-install codex --bundle openspec-superpowers --codex-home ~/.codex
```

### 通过安装脚本安装（备选）

如果你是 clone 了本仓库或持有本地副本，可以使用预构建的 bundle 和安装脚本：

- Codex：`dist/codex/bundles/` 或 `scripts/install-codex.ps1`
- Cursor：`dist/cursor/bundles/` 或 `scripts/install-cursor.ps1`
- Claude Code：`dist/claude-code/bundles/` 或 `scripts/install-claude-code.ps1`

如果你还想给 Superpowers 相关 workflow 增加跨会话记忆，可以额外运行：

- `scripts/install-superpowers-memory.ps1 -ProjectRoot <project-root>`
- `scripts/install-superpowers-memory-integration.ps1 -Tool all -ProjectRoot <project-root>`

它会在目标项目里创建 `.superpowers-memory/`，让 Superpowers workflow 读取稳定项目背景，并把当前会话摘要写回仓库。
同时也可以把这套记忆接入项目级工具指令里，让 Codex、Cursor、Claude Code 在新会话开始时更容易自动带上这些上下文。

## 为什么不再推荐直接复制源码 workflow

因为部分源码 workflow 是编排型 workflow，本身会依赖其他 workflow 或外部 skills。

这种模块化设计对维护者很好，但对最终用户并不友好。用户通常会以为复制一个目录就能直接使用，实际上往往还缺依赖。

所以现在真正推荐的安装路径是通过 npm 安装，或使用 `dist/` 下的 bundle。
