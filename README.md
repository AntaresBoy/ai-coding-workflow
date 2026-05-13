# @axlpq/ai-coding-workflow 项目详细介绍

## 一、项目定位

这是一个面向 **AI 编程助手**（Codex、Cursor、Claude Code）的**工作流技能库**，核心理念是：**让智能体按流程做事，而不是一上来就直接写代码。**

它把两条工程纪律组合在一起：

| 纪律 | 来源 | 核心价值 |
|---|---|---|
| **Superpowers** | 工程实践 | 先探索、再设计、再实现、再验证，配合 TDD 和 worktree |
| **OpenSpec** | 变更规范 | 行为变更前先产出 proposal、design、spec、tasks |

两条纪律可以独立使用，也可以按需组合。

---

## 二、核心价值

这个项目适合希望 AI 编程工具遵循以下交付路径的团队：

1. **先澄清，再实现** — 需求没确认前不写代码
2. **先确认行为，再改动代码** — 设计没确认前不进入实现
3. **实现时带上测试和验证** — TDD + 验证门禁
4. **完成后有清晰的归档收尾** — OpenSpec change 归档 + 项目记忆沉淀
5. **把项目上下文持续记在仓库里** — 跨会话不用从空白开始

**关键设计原则：所有 workflow 都是显式启用型，不会变成 AI 工具的默认后台行为。**

---

## 三、五大工作流

### 3.1 `openspec-superpowers-workflow` — 完整功能交付总入口

- **用途**：从需求澄清一路带到实现和验证的统一入口
- **适合**：既要想清楚、又要留下规范记录、最后还要可靠实现的功能开发
- **产物**：设计文档 + OpenSpec change + 实现计划 + 代码 + 测试 + 验证结果
- **控制点**：
  - 设计确认前不能进入实现计划
  - OpenSpec 产物完成前不能开始编码
  - 实现阶段应遵循 Superpowers 的计划和 TDD 纪律
  - 声称完成前必须有新的验证输出
- **调用示例**：
  ```
  Use $openspec-superpowers-workflow to run this feature from clarification through verification.
  ```

### 3.2 `superpowers-openspec-execution-workflow` — 四步走流程

- **用途**：按"先探索 → 再锁规范 → 再执行实现 → 最后归档"的明确节奏推进
- **适合**：需要先把需求探索清楚，再用 OpenSpec 固化，再回来实现验证的场景
- **四步顺序**：
  1. Superpowers 探索和收敛方案
  2. OpenSpec 固化已确认的行为和产物
  3. Superpowers 执行实现、测试、验证
  4. 归档 OpenSpec change
- **控制点**：
  - 探索阶段不能写生产代码
  - 必需的 OpenSpec 产物完成前不能开始编码
  - 没有新的验证输出不能声称完成
  - 实现、测试和规范对齐前不能归档
- **调用示例**：
  ```
  Use $superpowers-openspec-execution-workflow for this feature.
  ```

### 3.3 `superpowers-feature-workflow` — 纯 Superpowers 纪律

- **用途**：设计、计划、TDD、验证，不生成 OpenSpec 产物
- **适合**：只需要严谨实现流程，不需要正式 OpenSpec change 记录的场景
- **控制点**：
  - 提方案前先探索项目上下文
  - 每次只澄清一个关键问题
  - 实现计划前需要确认设计
  - 新行为默认按 TDD 执行
  - 报告完成前必须有新的验证证据
- **调用示例**：
  ```
  Use $superpowers-feature-workflow to drive the Superpowers stages for this feature.
  ```

### 3.4 `superpowers-learning-workflow` — 经验沉淀

- **用途**：重要工作结束后，把经验沉淀到仓库记忆里
- **适合**：想让下一次会话能直接接上当前上下文的场景
- **四大沉淀内容**：稳定项目事实、当前工作状态、简短会话记录、可复用经验候选
- **控制点**：
  - 不要把临时任务噪音写进稳定项目背景
  - 不要太早把一次性修复提升成可复用规则
  - 不要在用户没有明确要求时直接修改技能库本身
- **调用示例**：
  ```
  Use $superpowers-learning-workflow to capture what this session taught us and update the project memory.
  ```

### 3.5 `openspec-feature-workflow` — 纯 OpenSpec 产物

- **用途**：只做 proposal、design、specs、tasks，不负责 TDD 和验证
- **适合**：先补齐 OpenSpec 变更产物，再决定后续实现的场景
- **控制点**：
  - 创建产物前必须确认或推导 change 名称
  - 使用 `openspec status --change "<change-name>" --json` 决定产物顺序
  - 写每个产物前应先读取对应 OpenSpec instructions
  - 必需产物完成前不应开始编码
- **调用示例**：
  ```
  Use $openspec-feature-workflow to create and complete the OpenSpec change for this feature.
  ```

### 工作流选择速查

| 场景 | 推荐工作流 |
|---|---|
| 想要一个从需求澄清到实现验证的统一入口 | `openspec-superpowers` |
| 明确要按"探索→固化→实现→归档"四步走 | `superpowers-openspec-execution` |
| 只需要 Superpowers 的设计/计划/TDD/验证纪律 | `superpowers-feature` |
| 工作结束后想沉淀经验和当前状态 | `superpowers-learning` |
| 只想先补齐 OpenSpec change 产物 | `openspec-feature` |

---

## 四、项目记忆系统（Superpowers Memory）

### 4.1 它是什么

一套**持久化到仓库**中的上下文机制，让 AI 在跨会话时能接上之前的上下文，而不是每次从空白开始。

**默认不启用**，需要显式安装和配置。三重条件同时满足时才会参与：

1. 项目里存在 `.superpowers-memory/`
2. 已安装相应的工具级集成，或 workflow 本身显式读取记忆
3. 在需要 workflow 的场景下，用户显式调用了相关 workflow

### 4.2 记忆文件结构

```
.superpowers-memory/
  PROJECT_CONTEXT.md        # 长期稳定的项目事实（架构、技术栈、约束）
  CURRENT_STATE.md           # 当前工作状态（在做什么、最近决定、下一步）
  DECISIONS.md               # 跨会话仍然重要的设计或流程决策
  KNOWN_FAILURES.md          # 重复出现的失败模式和环境陷阱
  VERIFICATION_BASELINE.md  # 团队认为足够可信的验证方式
  TEAM_PREFERENCES.md       # 稳定的协作偏好和工作约定
  USER_PROFILE.md            # 用户偏好（沟通方式、输出习惯）
  AGENT_NOTES.md            # agent 侧的执行提醒和质量提醒
  LEARNING_BACKLOG.md       # 可晋升为规则/checklist/skill 的经验候选
  SESSION_CLOSE_CHECKLIST.md # 会话收尾提醒清单
  memory-index.yaml          # 记忆健康度元数据和轻量索引
  session-journal/           # 每次有意义会话的简短 Markdown 记录
```

### 4.3 记忆规则

| 规则 | 说明 |
|---|---|
| 稳定事实和会话笔记分开存 | 项目知识进 `PROJECT_CONTEXT.md`，当前状态进 `CURRENT_STATE.md`，会话笔记进 `session-journal/` |
| journal 要短 | 重点是让下一次会话能快速接上 |
| 重要条目带来源和置信度 | durable entry 至少需要 `id`、`review_after`、`source`、`status`、`confidence`、`last_updated` |
| 关键节点更新记忆 | 设计确认后、实现验证后、重大决策后、发现失败模式后 |
| 记忆不等于自动启用 workflow | 记忆只恢复上下文，workflow 仍须显式 opt-in |
| 优先修正而非堆叠 | 旧记忆不准确时，应修正或替换，不要叠加矛盾内容 |
| backlog 项是候选不是规则 | 经验应先在多次会话中证明价值，再升级成长期规则 |
| 完成前过 session-close checklist | 确认 current state 已更新、需 journal 时已有、durable entry 带了元数据 |

### 4.4 三层采用模型

| 层级 | 目标 | 适合场景 | 文件数量 | 收尾复杂度 | 检索能力 | 学习闭环 |
|---|---|---|---|---|---|---|
| **Core** | 最小可用 | 小项目/短任务 | 少 | 低 | 低 | 弱 |
| **Enhanced** | 完整协作 | 中大型协作项目 | 中 | 中 | 中高 | 中 |
| **Advanced** | 长期积累 | 长期知识型项目 | 多 | 高 | 高 | 强 |

**Core 包含**：`PROJECT_CONTEXT.md` + `CURRENT_STATE.md` + `session-journal/` + `validate-superpowers-memory`

**Enhanced 增加**：`DECISIONS.md` + `KNOWN_FAILURES.md` + `VERIFICATION_BASELINE.md` + `TEAM_PREFERENCES.md` + `memory-index.yaml` + `search-superpowers-memory` + `suggest-superpowers-memory-updates` + `run-superpowers-memory-closeout`

**Advanced 增加**：`USER_PROFILE.md` + `AGENT_NOTES.md` + `LEARNING_BACKLOG.md` + `generate-superpowers-promotion-drafts` + `promotion-drafts/`

**推荐策略**：默认从 Core 开始，出现明确需求时再升级。

---

## 五、仓库结构

```
superpowers-openspec-team-skills-main/
├── team-skills/          # 源码层 workflow 定义（面向维护者）
│   ├── openspec-superpowers-workflow/
│   │   ├── workflow.yaml        # 依赖、支持的工具和运行要求
│   │   ├── SKILL.md             # 工作流技能定义
│   │   ├── README.md / readme_cn.md
│   │   └── agents/openai.yaml   # OpenAI agent 适配
│   ├── superpowers-openspec-execution-workflow/
│   ├── superpowers-feature-workflow/
│   ├── superpowers-learning-workflow/
│   └── openspec-feature-workflow/
├── dist/                 # 面向具体工具的分发 bundle（面向使用者）
│   ├── codex/bundles/
│   ├── cursor/bundles/
│   └── claude-code/bundles/
├── scripts/              # 安装和辅助脚本（同时提供 .sh 和 .ps1）
│   ├── install-codex.sh / .ps1
│   ├── install-cursor.sh / .ps1
│   ├── install-claude-code.sh / .ps1
│   ├── install-superpowers-memory.sh / .ps1
│   ├── install-superpowers-memory-integration.sh / .ps1
│   ├── validate-superpowers-memory.sh / .ps1
│   ├── search-superpowers-memory.sh / .ps1
│   ├── suggest-superpowers-memory-updates.sh / .ps1
│   ├── run-superpowers-memory-closeout.sh / .ps1
│   ├── generate-superpowers-promotion-drafts.sh / .ps1
│   ├── build-dist.ps1            # 维护者用：刷新 dist/ 分发层
│   └── common/                   # 依赖检查公共模块
│       ├── dependency-check.sh
│       └── dependency-check.ps1
├── templates/            # 记忆模板
│   └── superpowers-memory/
│       ├── PROJECT_CONTEXT.md
│       ├── CURRENT_STATE.md
│       ├── DECISIONS.md
│       ├── KNOWN_FAILURES.md
│       ├── VERIFICATION_BASELINE.md
│       ├── TEAM_PREFERENCES.md
│       ├── USER_PROFILE.md
│       ├── AGENT_NOTES.md
│       ├── LEARNING_BACKLOG.md
│       ├── SESSION_CLOSE_CHECKLIST.md
│       ├── memory-index.yaml
│       ├── integrations/
│       │   ├── codex/AGENTS.memory.md
│       │   ├── cursor/superpowers-memory.mdc
│       │   └── claude-code/CLAUDE.memory.md
│       ├── promotion-drafts/
│       └── session-journal/
├── docs/                 # 设计文档和增强说明
│   ├── enhancement-overview.cn.md
│   ├── layered-adoption-model.cn.md
│   ├── memory-enhancement-design.cn.md
│   ├── memory-learning-dialogue.cn.md
│   ├── memory-learning-appendix.cn.md
│   └── CROSS_PLATFORM_TESTING.cn.md
├── .github/              # CI、Issue/PR 模板
│   ├── workflows/ci.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── README.md / .cn.md    # 主文档
├── MEMORY.md / .cn.md    # 记忆指南
└── VERIFY.md / .cn.md    # 验证指南
```

**重要**：用户应优先使用 `dist/` + `scripts/`，不要直接从 `team-skills/` 复制单个 workflow，否则容易因依赖不完整而无法使用。

---

## 六、使用指南

### 6.1 前置条件

- 需要一个实际项目仓库来保存设计文档、计划、代码、测试和验证结果
- 使用 OpenSpec 相关 workflow 时，需要安装 OpenSpec CLI
- 如需跨会话记忆，目标项目里需要有 `.superpowers-memory/` 目录

### 6.2 安装 Workflow Bundle

#### 方式一：通过 npm 安装（推荐）

```bash
# 在你的项目中安装包
npm install @axlpq/ai-coding-workflow

# 安装 workflow bundle 到目标项目
# Claude Code
npx spec claude-code --bundle openspec-superpowers --project-root <project-root>

# Cursor
npx spec cursor --bundle openspec-superpowers --project-root <project-root>

# Codex
npx spec codex --bundle openspec-superpowers --codex-home ~/.codex
```

可用 bundle：`openspec-superpowers`、`superpowers-openspec-execution`、`superpowers-feature`、`superpowers-learning`、`openspec-feature`

```bash
# Generate a quick-start README in the target project
npx spec readme --project-root <project-root>

# Check installed version
npx spec --version
```

#### 方式二：通过安装脚本安装（适用于本地克隆仓库）

##### Codex

```bash
# macOS / Linux
sh "<repo-root>/scripts/install-codex.sh" --bundle openspec-superpowers --codex-home "$HOME/.codex"

# Windows PowerShell
.\scripts\install-codex.ps1 -Bundle openspec-superpowers

# 也可使用 pwsh (macOS/Linux)
pwsh -File ./scripts/install-codex.ps1 -Bundle openspec-superpowers -CodexHome "$HOME/.codex"
```

可用 bundle：`openspec-superpowers`、`superpowers-openspec-execution`、`superpowers-feature`、`superpowers-learning`、`openspec-feature`

安装后重启 Codex，调用示例：

```
Use $openspec-superpowers-workflow to run this feature from clarification through verification.
```

#### Cursor

```bash
# macOS / Linux
sh "<repo-root>/scripts/install-cursor.sh" --bundle openspec-superpowers --project-root <project-root>

# Windows PowerShell
.\scripts\install-cursor.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root>
```

安装后写入 `.cursor/rules/` 和 `AGENTS.md`。重新打开项目后生效。

推荐显式启用方式：

```
Use the superpowers-openspec-execution workflow for this feature.
```

#### Claude Code

```bash
# macOS / Linux
sh "<repo-root>/scripts/install-claude-code.sh" --bundle openspec-superpowers --project-root <project-root>

# Windows PowerShell
.\scripts\install-claude-code.ps1 -Bundle openspec-superpowers -ProjectRoot <project-root>
```

安装后写入 `.claude/commands/` 和 `CLAUDE.md`。

**Claude Code 推荐优先用 slash command 启用 workflow**，比自然语言触发更稳定：

```
/superpowers-openspec-execution-workflow
增加点评门店信息
```

安装后确认目标项目里存在：
- `CLAUDE.md`
- `.claude/commands/superpowers-openspec-execution-workflow.md`

### 6.3 安装项目记忆

**第一步：安装记忆脚手架**

```bash
# 通过 npm（推荐）
npx spec memory --project-root <project-root>

# 或通过脚本（本地克隆仓库）
# macOS / Linux
sh "<repo-root>/scripts/install-superpowers-memory.sh" --project-root <project-root>

# Windows PowerShell
.\scripts\install-superpowers-memory.ps1 -ProjectRoot <project-root>
```

**第二步：安装工具级记忆集成**

```bash
# 通过 npm（推荐）
npx spec memory-integ --tool all --project-root <project-root>

# 或通过脚本（本地克隆仓库）
# 安装所有工具的集成
sh "<repo-root>/scripts/install-superpowers-memory-integration.sh" --tool all --project-root <project-root>

# 或按工具分别安装
# --tool codex / cursor / claude-code
```

**第三步：填写最小内容**

至少给 `PROJECT_CONTEXT.md` 和 `CURRENT_STATE.md` 补几行内容：

```markdown
# PROJECT_CONTEXT.md
- hobby-map 是一个地图类兴趣发现项目。
- 主要技术栈：Vue 3 + Spring Boot + MySQL。
- 核心模块：地图视图、点位管理、用户收藏。
```

```markdown
# CURRENT_STATE.md
- 当前重点：修复地图 marker 聚合和详情面板行为。
- 最近完成：接通基础点位列表和详情查询接口。
- 下一步：验证 marker 点击链路和移动端布局。
```

**第四步：重开或刷新工具项目**，让新的项目级指令生效。

### 6.4 安装脚本通用参数

| 参数 | Shell 版 | PowerShell 版 | 说明 |
|---|---|---|---|
| 选择 bundle | `--bundle <name>` | `-Bundle <name>` | 指定要安装的 bundle |
| 目标项目 | `--project-root <path>` | `-ProjectRoot <path>` | 目标项目根目录 |
| Codex Home | `--codex-home <path>` | `-CodexHome <path>` | Codex home 目录 |
| 预览模式 | `--dry-run` | `-DryRun` | 只预览，不实际复制 |
| 备份 | `--backup` | `-Backup` | 覆盖前先备份 |
| 跳过确认 | `--force` | `-Force` | 跳过覆盖确认 |
| 合并模式 | `--merge` | `-Merge` | 合入已有目录而非替换（保留目标中独有的文件，同名文件仍被覆盖） |
| 替换模式 | `--no-merge` | `-NoMerge` | 替换已有目录而非合并（默认为合并模式） |
| 检查依赖 | `--check-dependencies` | `-CheckDependencies` | 只检查运行时依赖 |

### 6.5 辅助脚本

| 脚本 | 用途 | 示例 |
|---|---|---|
| `validate-superpowers-memory` | 校验记忆完整性、元数据、过期条目 | `sh scripts/validate-superpowers-memory.sh --project-root <path>` |
| `search-superpowers-memory` | 按类型/关键字/时间检索历史记忆 | `sh scripts/search-superpowers-memory.sh --project-root <path> --query "decision" --type decisions` |
| `suggest-superpowers-memory-updates` | 根据变更路径和信号建议应更新哪些记忆面 | `sh scripts/suggest-superpowers-memory-updates.sh --project-root <path> --changed-paths "src" --signals "decision"` |
| `run-superpowers-memory-closeout` | 串联 checklist + suggestion + validator 的一次性收尾 | `sh scripts/run-superpowers-memory-closeout.sh --project-root <path> --changed-paths "src" --signals "decision" --run-validator` |
| `generate-superpowers-promotion-drafts` | 把成熟的学习候选生成 checklist/rule/skill 草案 | `sh scripts/generate-superpowers-promotion-drafts.sh --project-root <path>` |

---

## 七、推荐工作模式

### 模式 1：轻量默认（最推荐开源用户）

1. 保持 `PROJECT_CONTEXT.md` 和 `CURRENT_STATE.md` 基本最新
2. 新会话正常开始，让工具先读取 memory
3. 一轮有意义的工作结束后，运行 `superpowers-learning-workflow`
4. 如果 memory 变了，再跑校验

### 模式 2：脚本辅助收尾

1. 平时正常工作
2. 收尾时运行 `run-superpowers-memory-closeout.sh`
3. 按建议更新对应 memory 文件
4. 运行 `validate-superpowers-memory.sh`

### 模式 3：完整 workflow 交付

1. 先用一个交付型 workflow（如 `openspec-superpowers`）
2. 完成实现和验证
3. 再用 `superpowers-learning` 保存稳定经验和当前状态

---

## 八、显式启用规则（重要）

这些 workflow **只应**在以下情况启用：

- 用户明确点名某个 workflow
- 用户明确要求按这种流程来做
- 仓库策略文件明确要求必须使用该 workflow

**它们不应该被当成所有编码任务的默认后台流程。**

推荐使用方式：
1. 先安装 bundle
2. 平时保持正常的编码提问方式
3. 只有在你真的想启用该流程时，才明确点名 workflow

---

## 九、验证安装是否生效

安装成功不等于运行时生效，需同时满足：

1. 工具已识别安装的 bundle
2. 工具行为明显受 workflow 影响
3. 工具遵循设计、规范、验证和记忆这些门槛

### 验证步骤

1. 先运行 `--check-dependencies` 检查环境
2. 安装 bundle
3. 检查目标文件是否存在
4. 重启或刷新工具
5. 发起一次明确的 workflow 调用
6. 观察行为是否符合分阶段要求
7. 如启用记忆，运行 `validate-superpowers-memory`
8. 再发一次不点名 workflow 的普通请求，确认不会自动启用

### 记忆脚手架验证

```bash
# 检查文件存在
test -f "<project-root>/.superpowers-memory/PROJECT_CONTEXT.md" && echo OK
test -f "<project-root>/.superpowers-memory/CURRENT_STATE.md" && echo OK

# 运行校验
sh scripts/validate-superpowers-memory.sh --project-root <project-root>
```

### Codex 验证

```bash
test -f "$HOME/.codex/skills/superpowers-openspec-execution-workflow/SKILL.md" && echo OK
```

### Cursor 验证

```bash
test -f "<project-root>/.cursor/rules/superpowers-openspec-execution-workflow.mdc" && echo OK
```

### Claude Code 验证

```bash
test -f "<project-root>/.claude/commands/superpowers-openspec-execution-workflow.md" && echo OK
```

---

## 十、典型使用示例

### Cursor 完整流程示例

假设项目路径是 `D:\ys\ysProjects\Hobby\hobby-map`：

1. 安装记忆脚手架：
   ```powershell
   .\scripts\install-superpowers-memory.ps1 -ProjectRoot D:\ys\ysProjects\Hobby\hobby-map
   ```

2. 安装 Cursor 记忆集成：
   ```powershell
   .\scripts\install-superpowers-memory-integration.ps1 -Tool cursor -ProjectRoot D:\ys\ysProjects\Hobby\hobby-map
   ```

3. 给 `PROJECT_CONTEXT.md` 和 `CURRENT_STATE.md` 补最小内容

4. 重开 Cursor 或刷新项目

5. 新开聊天会话，直接提需求：
   ```
   请先基于 repo memory 理解 hobby-map 当前上下文，再帮我判断下一步优先做什么。
   ```

### Claude Code 完整流程示例

1. 安装记忆脚手架和集成

2. 安装 workflow bundle：
   ```bash
   sh scripts/install-claude-code.sh --bundle superpowers-openspec-execution --project-root <project-root>
   ```

3. 重开 Claude Code 项目

4. 使用 slash command 启用 workflow：
   ```
   /superpowers-openspec-execution-workflow
   请基于现有 repo memory 和当前项目状态继续推进。
   ```

---

## 十一、技术特点总结

| 特点 | 说明 |
|---|---|
| 显式启用 | 不会偷偷变成默认行为 |
| repo-owned | 记忆保存在仓库里，不依赖私有外部系统 |
| 可校验 | validator 可以检查记忆完整性和健康度 |
| 可追溯 | durable entry 带 id、来源、置信度和复查时间 |
| 可治理 | memory-index 提供健康汇总，支持过期检测 |
| 可晋升 | 经验候选可以逐步晋升为规则/checklist/skill |
| 跨平台 | 同时支持 Windows (PowerShell) 和 macOS/Linux (Shell) |
| 多工具 | 支持 Codex、Cursor、Claude Code 三种 AI 编程工具 |
| npm 分发 | 通过公司 Nexus 私有 npm 仓库分发，支持 npm install / npx 安装 |

---

## 十二、当前能力边界

以下能力目前尚未完全实现：

- runtime 级自动记忆编排
- 外部 semantic memory provider
- 真正的自动 skill patch / 自动技能演化
- 全自动 hook 式收尾
- 三平台完全等强度的长期实测

当前版本的准确定位是：**一个更强的、repo-owned、显式触发、可审计的项目记忆与学习系统**，而不是全自动自治 agent 平台。
