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
- PR #24: 自动读取 API Key + Claude Code 使用 DeepSeek API + Coordinator AI + Trae 监控模式

### 八、Milestone 3.1: 硬核分屏与全视界监控矩阵
- PR #26: 左右硬核分屏 + 四神兽监控矩阵 + B/W/G 铁律 + 真实数据桥接

### 九、Milestone 3.2: 终极遥测仪表盘与高密度状态墙
- PR #28: 三段式遥测卡片 + 进程/云端遥测 + 打字机日志 + B/W/G排版

### 十、Milestone 3.3: 实时遥测仪表盘
- PR #31 `feat/realtime-telemetry-dashboard`:
  - ✅ **Claude Code 深度遥测**: 读取 `~/.claude/sessions/{pid}.json` 获取 session status (busy/idle/none)
  - ✅ **连续工作时间**: 从 session startedAt 计算 continuousWorkTime (如 22h34m)
  - ✅ **当前任务**: 从 `history.jsonl` 最后一条记录读取 currentTask
  - ✅ **Claude 详细指标**: lastActivity, subProcessCount, version, sessionId
  - ✅ **Trae 深度遥测**: 新增 `TraeTelemetry` 接口 + `getTraeTelemetry()`
  - ✅ **Trae AI Agent 状态**: 检测 database.db 修改时间判断 AI 是否活跃
  - ✅ **Trae 项目检测**: 读取 workspace.json 获取当前项目名
  - ✅ **Trae API 统计**: 解析 ckg_server 日志统计 API 调用次数和最后调用时间
  - ✅ **Trae 活动流**: 读取 sandbox/aha_log/ckg 日志生成 recentActivity
  - ✅ **UI 升级**: SessionStatusBadge + TASK 显示 + AI AGENT 徽章 + 活动流
  - ✅ 版本升级至 v0.6.0-alpha

## 当前设计规范（5条铁律）

1. **Premium B/W/G Base**: 纯黑底 #0a0a0a，主标题 text-neutral-200，正文 text-neutral-400
2. **Glassmorphism Core**: bg-white/[0.02] backdrop-blur-md border-white/[0.08]，禁止任何发光阴影
3. **Morandi Accents**: online/syncing=#84a59d, working=#c2b280, error=#b56576
4. **Pixel as Accents**: Press Start 2P 仅用于 text-[9px] 小标签，90%文本用 system-ui/JetBrains Mono
5. **Elegant Flow**: React Flow 连线 stroke-neutral-800(静止)/#84a59d(运行)，Handle 4x4px 方形纯色方块

## 当前文件结构

```
src/
  App.tsx                    # 总入口 + 5s轮询 + 分屏布局
  main.tsx                   # React 挂载
  types/agent.ts             # AgentStatus + TaskStatus + Agent + ClaudeCodeTelemetry + TraeTelemetry
  store/useAgentStore.ts     # Zustand + 7节点图谱 + dispatchTask + 5s轮询
  components/
    AppShell.tsx             # 65%/35% 横向分屏 + 毛玻璃分割线
    TopBar.tsx               # 顶部导航 + Settings按钮
    MainStage.tsx            # ReactFlow + 任务输入框 + DISPATCH 按钮
    MonitorDashboard.tsx     # 四神兽监控矩阵容器
    MonitorCard.tsx          # 遥测卡片: ClaudeCode/Trae/Cloud/Process 专属网格 + 打字机日志
    AgentCard.tsx            # Agent卡片
    StatusBadge.tsx          # 状态灯
    PixelAvatar.tsx          # SVG像素头像
    SettingsPanel.tsx        # 自动检测 Key + 环境信息 (v0.6.0-alpha)
    flow/
      TaskNode.tsx           # 任务节点
      AgentNode.tsx          # Agent节点
      InputNode.tsx          # 输入节点
      FlowEdge.tsx           # 自定义边
  styles/
    globals.css              # Tailwind v4 @theme 令牌
    pixel.css                # glass-panel / pixel-button / React Flow覆盖
server/
  index.ts                   # Express 主服务器 (:4001) + getTraeTelemetry
  env.ts                     # 环境变量自动读取 + Key 状态掩码
  coordinator-bridge.ts      # Coordinator AI (DeepSeek)
  claude-bridge.ts           # Claude Code CLI spawn
  codex-bridge.ts            # DeepSeek Chat Completions 流式 API
  trae-bridge.ts             # Trae Solo CN 监控: 进程检测 + 文件监听
  telemetry.ts               # 遥测: ClaudeCode + Trae + 进程 + 云端 + 系统内存
```

## 运行方式

```bash
npm dev            # 前端 Vite dev server
npm run dev:server # 后端 Express 桥接服务器 (localhost:4001)
npm run dev:all    # 前后端同时启动
```

## 环境变量

- `DEEPSEEK_API_KEY`: DeepSeek API Key
- `ANTHROPIC_API_KEY`: Anthropic 兼容 Key (实际是 DeepSeek Key)
- `ANTHROPIC_BASE_URL`: https://api.deepseek.com/anthropic
- `ANTHROPIC_MODEL`: deepseek-v4-pro
- `CLAUDE_CODE_SUBAGENT_MODEL`: deepseek-v4-flash

## Push 规范

- 分支命名: feat/xxx, fix/xxx, refactor/xxx, chore/xxx, docs/xxx
- Commit: Conventional Commits
- 流程: feature branch → PR → Squash Merge → main

## 当前状态

- 版本: v0.6.0-alpha
- main 最新: PR #31 (aea2410)
- 包管理: npm

## 未完成

- Trae Solo CN 实时输出内容（当前只显示进程指标和活动流，未显示 AI Agent 实时对话文本）
- Claude Code 实时输出流（当前只读取 history.jsonl 静态记录，未实现流式输出监听）
- Cursor 真实接入（当前为预留 mock 节点）
- Coordinator AI 多轮对话（当前单轮分析+综合）
- Agent 输出结果持久化到数据库
- API Key 加密存储
- CI/CD 配置
- 桌面化封装 (Tauri)
