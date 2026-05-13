## ADDED Requirements

### Requirement: README 命令文档记录 readme 子命令
所有 README 文档（README.md、README.cn.md、README.zh.md、项目介绍与使用文档.md） SHALL 包含 `npx spec readme` 命令的说明，包括其用途（在目标项目目录生成快速入门 README.md）和行为（如果目标目录已存在 README.md 则跳过，不覆盖）。

#### Scenario: 用户在快速开始部分找到 readme 命令
- **WHEN** 用户阅读 README.md 或 README.cn.md 的快速开始部分
- **THEN** 用户能看到 `npx spec readme --project-root ./my-project` 的示例和简要说明

#### Scenario: 已有 README.md 时 readme 命令不覆盖
- **WHEN** 文档描述 readme 命令的行为
- **THEN** 文档明确说明如果目标目录已存在 README.md 则不会覆盖

### Requirement: readme 命令在项目介绍文档中有独立小节
`项目介绍与使用文档.md` SHALL 在安装脚本通用参数之后包含 `npx spec readme` 命令的说明。

#### Scenario: 用户在项目介绍文档中找到 readme 命令
- **WHEN** 用户阅读项目介绍与使用文档的安装部分
- **THEN** 用户能看到 `npx spec readme --project-root <project-root>` 的示例和用途说明
