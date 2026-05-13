## ADDED Requirements

### Requirement: README 文档记录 version 标志
README.md 和 README.cn.md 的快速开始部分 SHALL 包含 `--version`/`-v` 标志的说明（打印当前版本号并退出）。

#### Scenario: 用户在快速开始中找到 version 命令
- **WHEN** 用户阅读 README.md 或 README.cn.md
- **THEN** 用户能看到 `npx spec --version` 或 `npx spec -v` 的用法说明

### Requirement: 项目介绍文档记录 version 标志
`项目介绍与使用文档.md` SHALL 包含 `--version`/`-v` 标志的说明。

#### Scenario: 用户在项目介绍文档中找到 version 标志
- **WHEN** 用户阅读项目介绍与使用文档
- **THEN** 用户能看到 `npx spec --version` 的示例
