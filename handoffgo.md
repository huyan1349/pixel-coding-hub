# Handoffgo

> 下一个接手的 AI 请先读此文件。

## 项目

**Pixel Coding Hub** — 像素风多 Agent 协作编程工作台
仓库: https://github.com/huyan1349/pixel-coding-hub (Public)

## ⚠️ 分支纪律（最高优先级）

- **写任何代码前，先 `git branch` 确认当前在 feat/refactor 分支上！绝不在 main 上写代码！**
- 合并完 PR 后立刻切到新功能分支，不要停留在 main
- 流程: feature branch → PR → Squash Merge → main
- main 禁止直接 push

## 已完成全部任务

### 一、GitHub 仓库与 Git 规范建立
- PR #1-#2: README + .gitignore + 交接文件

### 二、Milestone 1: 静态像素工作台
- PR #3-#7: scaffold → pixel-theme → agent-store → agent-components → app-layout

### 三、视觉重构（2轮）
- PR #9-#11: Pixel 2.0 Cyber (slate灰蓝+霓虹)
- PR #13-#15: Premium B/W/G 极简毛玻璃 (纯黑底+莫兰迪+无发光)

### 四、Milestone 2: React Flow 协作可视化
- PR #18: @xyflow/react v12 + 4节点图谱 + SSE模拟 + SettingsPanel

### 五、Milestone 3: 全栈 SSE 联调
- PR #20: Express 桥接服务器 + 7节点并行图谱 + EventSource SSE + persist

### 六、Milestone 3 终极真理: 真实 Agent 桥接
- PR #22: POST /api/session 安全握手 + Claude CLI + Codex API + Trae 文件IO

### 七、Milestone 4: 监控+协调架构重构
- PR #24 `feat/auto-apikey-monitor-mode`:
  - ✅ **自动读取 API Key**: 从 process.env 读取 DEEPSEEK_API_KEY、ANTHROPIC_API_KEY、ANTHROPIC_BASE_URL、ANTHROPIC_MODEL，无需手动填写
  - ✅ **Claude Code 使用 DeepSeek API**: 通过 ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic，模型 deepseek-v4-pro
  - ✅ **Coordinator AI**: 新建 coordinator-bridge.ts，使用 DeepSeek API 分析任务、分配子任务、综合结果
  - ✅ **Trae Solo CN 监控模式**: 进程检测(ps aux)、文件监听(chokidar)、AI对话读取(ModularData)
  - ✅ **架构定位重构**: 从"代替 Agent 输出"改为"读取各编程软件状态和结果 + 汇总面板 + AI 协调"
  - ✅ **Settings 面板**: 自动检测 Key 状态显示（不再手动输入），显示环境信息
  - ✅ **新流程**: 用户输入任务 → Coordinator 分析分配 → 各 Agent 并行执行 → 结果汇总 → Coordinator 综合
  - ✅ **新增端点**: /api/keys, /api/agents/status, /api/dispatch, /api/trae/conversations, /api/trae/changes, /api/trae/watch

## 当前设计规范（5条铁律）

1. **Premium B/W/G Base**: 纯黑底 #0a0a0a，主标题 text-neutral-200，正文 text-neutral-400
2. **Glassmorphism Core**: bg-white/[0.02] backdrop-blur-md border-white/[0.08]，禁止任何发光阴影
3. **Morandi Accents**: online=#84a59d, working=#c2b280, error=#b56576
4. **Pixel as Accents**: Press Start 2P 仅用于 text-[9px] 小标签，90%文本用 system-ui/JetBrains Mono
5. **Elegant Flow**: React Flow 连线 stroke-neutral-800(静止)/#84a59d(运行)，Handle 4x4px 方形纯色方块

## 当前文件结构

```
src/
  App.tsx                    # 总入口 + 自动获取 Key/Agent 状态
  main.tsx                   # React 挂载
  types/agent.ts             # AgentStatus + TaskStatus + Agent + KeyStatus + FlowNodeData + SSEEvent
  store/useAgentStore.ts     # Zustand + 7节点图谱 + dispatchTask + fetchKeysStatus + fetchAgentStatus
  components/
    AppShell.tsx             # 12列Grid骨架
    TopBar.tsx               # 顶部导航
    MainStage.tsx            # ReactFlow + 任务输入框 + DISPATCH 按钮
    AgentCard.tsx            # Agent卡片 (backend信息 + workspace + working动画)
    StatusBadge.tsx          # 状态灯
    PixelAvatar.tsx          # SVG像素头像 (含 coordinator #b56576)
    SettingsPanel.tsx        # 自动检测 Key 状态 + 环境信息 (v0.5.0-alpha)
    flow/
      TaskNode.tsx           # 任务节点
      AgentNode.tsx          # Agent节点
      InputNode.tsx          # 输入节点
      FlowEdge.tsx           # 自定义边
  styles/
    globals.css              # Tailwind v4 @theme 令牌
    pixel.css                # glass-panel / pixel-button / React Flow覆盖
server/
  index.ts                   # Express 主服务器 (:4001) + /api/keys + /api/agents/status + /api/dispatch + /api/trae/*
  env.ts                     # 环境变量自动读取 + Key 状态掩码
  coordinator-bridge.ts      # Coordinator AI (DeepSeek) 任务分析 + 分配 + 综合
  claude-bridge.ts           # Claude Code CLI spawn + DeepSeek env 传递
  codex-bridge.ts            # DeepSeek Chat Completions 流式 API
  trae-bridge.ts             # Trae Solo CN 监控: 进程检测 + 文件监听 + AI对话读取
```

## 运行方式

```bash
npm dev            # 前端 Vite dev server
npm run dev:server # 后端 Express 桥接服务器 (localhost:4001)
npm run dev:all    # 前后端同时启动
```

## Agent 接入方式（v0.5.0 监控+协调模式）

1. 后端启动时自动从 process.env 读取 API Key
2. 前端 GET /api/keys 获取 Key 可用状态（掩码显示）
3. 前端 GET /api/agents/status 获取各 Agent 实时状态
4. 用户输入任务 → POST /api/dispatch → Coordinator 分析分配 → 各 Agent 执行 → 结果汇总
5. Claude Code: spawn claude CLI (使用 DeepSeek API via ANTHROPIC_BASE_URL)
6. Codex: DeepSeek Chat Completions API
7. Trae Solo CN: 进程检测 + 文件监听 + AI 对话读取 (监控模式，不代替输出)

## 环境变量

- `DEEPSEEK_API_KEY`: DeepSeek API Key (用于 Coordinator + Codex)
- `ANTHROPIC_API_KEY`: Anthropic 兼容 Key (实际是 DeepSeek Key)
- `ANTHROPIC_BASE_URL`: https://api.deepseek.com/anthropic
- `ANTHROPIC_MODEL`: deepseek-v4-pro
- `CLAUDE_CODE_SUBAGENT_MODEL`: deepseek-v4-flash

## Push 规范（必须遵守）

- 分支命名: feat/xxx, fix/xxx, refactor/xxx, chore/xxx, docs/xxx
- Commit: Conventional Commits
- 流程: feature branch → PR → Squash Merge → main
- main 禁止直接 push

## 当前状态

- 版本: v0.5.0-alpha
- main 最新: PR #24 (e1bef3d)
- 包管理: npm

## 未完成

- Trae Solo CN 更深度集成（读取终端输出、AI Agent 实时对话流）
- Coordinator AI 多轮对话（当前单轮分析+综合）
- Agent 输出结果持久化到数据库
- API Key 加密存储
- CI/CD 配置
- 桌面化封装 (Tauri)
