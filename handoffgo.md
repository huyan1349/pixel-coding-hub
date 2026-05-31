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
- PR #22 `feat/m3-real-agent-bridge`:
  - ✅ 战役1: POST /api/session 安全握手, API Key 通过 sessionId 传递, fetch+ReadableStream 替代 EventSource
  - ✅ 战役2: Claude Code CLI — spawn('claude', ['-p', prompt, '--output-format', 'stream-json']), 解析 stream-json stdout, 60s超时+SIGTERM清理
  - ✅ 战役3: Codex OpenAI API — fetch Chat Completions stream:true, 逐chunk解析SSE, 实时推送到前端图谱
  - ✅ 战役4: Trae 文件IO — fs.writeFileSync 生成 GeneratedUI.tsx, exec('trae'/'code'/'cursor') 逐个尝试唤醒编辑器, SIGINT/SIGTERM 时清理文件
  - ✅ 无 API Key 时自动降级为模拟模式, 优雅降级

### 七、验证
- TypeScript 零错误, Production build 通过
- Session + SSE curl 测试通过
- B/W/G 规范零违规

## 当前设计规范（5条铁律）

1. **Premium B/W/G Base**: 纯黑底 #0a0a0a，主标题 text-neutral-200，正文 text-neutral-400
2. **Glassmorphism Core**: bg-white/[0.02] backdrop-blur-md border-white/[0.08]，禁止任何发光阴影
3. **Morandi Accents**: online=#84a59d, working=#c2b280, error=#b56576
4. **Pixel as Accents**: Press Start 2P 仅用于 text-[9px] 小标签，90%文本用 system-ui/JetBrains Mono
5. **Elegant Flow**: React Flow 连线 stroke-neutral-800(静止)/#84a59d(运行)，Handle 4x4px 方形纯色方块

## 当前文件结构

```
src/
  App.tsx                    # 总入口 + SSE 状态显示
  main.tsx                   # React 挂载
  types/agent.ts             # AgentStatus + TaskStatus + Agent(apiKey) + FlowNodeData + SSEEvent
  store/useAgentStore.ts     # Zustand persist + 7节点图谱 + fetch SSE + 事件日志
  components/
    AppShell.tsx             # 12列Grid骨架
    TopBar.tsx               # 顶部导航
    MainStage.tsx            # ReactFlow + CONNECT SSE 按钮 + LIVE 指示器
    AgentCard.tsx            # Agent卡片
    StatusBadge.tsx          # 状态灯
    PixelAvatar.tsx          # SVG像素头像
    SettingsPanel.tsx        # 毛玻璃设置覆盖层 (API Key + v0.4.0-alpha)
    flow/
      TaskNode.tsx           # 任务节点 (4x4方形Handle)
      AgentNode.tsx          # Agent节点 (4x4方形Handle)
      InputNode.tsx          # 输入节点 (4x4方形Handle)
      FlowEdge.tsx           # 自定义边 (SmoothStep + 莫兰迪动画色)
  styles/
    globals.css              # Tailwind v4 @theme 令牌
    pixel.css                # glass-panel / pixel-button / React Flow覆盖
server/
  index.ts                   # Express 主服务器 (:4001) + SSE /api/stream + /api/session + /api/health
  sessions.ts                # Session 管理 (UUID + 1h过期 + 自动清理)
  claude-bridge.ts           # Claude Code CLI spawn + stream-json 解析 + 进程清理
  codex-bridge.ts            # OpenAI Chat Completions 流式 API + chunk 解析
  trae-bridge.ts             # 文件 IO + 编辑器唤醒 + 清理
```

## 运行方式

```bash
pnpm dev            # 前端 Vite dev server
pnpm dev:server     # 后端 Express 桥接服务器 (localhost:4001)
pnpm dev:all        # 前后端同时启动
```

## 真实 Agent 接入方式

1. 在 Settings 面板填入 API Key → 自动持久化到 localStorage
2. 点击 CONNECT SSE → 前端 POST /api/session 发送 Keys → 获取 sessionId
3. fetch /api/stream?sessionId=xxx → 后端根据 Key 有无决定真实/模拟模式
4. Codex: 有 OpenAI Key → 真实流式 API 调用; 无 → 模拟
5. Claude: 有 Anthropic Key → spawn claude CLI; 无 → 模拟
6. Trae: 写文件 + 尝试唤醒编辑器 (trae/code/cursor)

## Push 规范（必须遵守）

- 分支命名: feat/xxx, fix/xxx, refactor/xxx, chore/xxx, docs/xxx
- Commit: Conventional Commits
- 流程: feature branch → PR → Squash Merge → main
- main 禁止直接 push

## 当前状态

- 版本: v0.4.0-alpha
- main 最新: PR #22 (0d6e9f0)
- 包管理: pnpm

## 未完成

- 真实 Codex CLI 接入（当前用 OpenAI API 替代）
- Trae 真实 API/SDK 接入（当前用文件IO+进程唤醒替代）
- API Key 加密存储（当前明文 localStorage）
- CI/CD 配置
- 桌面化封装 (Tauri)
