## ADDED Requirements

### Requirement: README 文档记录 merge/no-merge 参数
所有 README 文档（README.md、README.cn.md、README.zh.md） SHALL 在安装脚本参数部分包含 `--merge` 和 `--no-merge` 参数的说明。`--merge` 为默认行为（合入已有目录，保留目标中独有文件，同名文件仍被覆盖），`--no-merge` 为替换模式。

#### Scenario: 用户在 Shell 安装脚本参数中找到 merge 选项
- **WHEN** 用户阅读 README.md 或 README.cn.md 的 Shell 安装脚本参数部分
- **THEN** 用户能看到 `--merge`（合并模式，默认开启）和 `--no-merge`（替换模式）的说明

#### Scenario: 用户在 PowerShell 参数表格中找到 Merge 选项
- **WHEN** 用户阅读 README.zh.md 的安装脚本通用参数表格
- **THEN** 用户能看到 `--merge`/`-Merge` 和 `--no-merge`/`-NoMerge` 的行

### Requirement: 项目介绍文档记录 merge/no-merge 参数
`项目介绍与使用文档.md` SHALL 在 6.4 安装脚本通用参数表格中包含 `--merge`/`-Merge` 和 `--no-merge`/`-NoMerge` 行。

#### Scenario: 用户在项目介绍文档的参数表格中找到 merge 选项
- **WHEN** 用户阅读项目介绍与使用文档的 6.4 节
- **THEN** 用户能看到合并模式和替换模式的参数行
