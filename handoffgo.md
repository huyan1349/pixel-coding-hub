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
- PR #1 `docs/readme-and-gitignore`: README + .gitignore
- PR #2 `chore/add-handoffgo`: 交接文件
- 仓库设置: Public、main 分支保护、仅 Squash Merge
- 代理: `git config --global http.proxy socks5h://127.0.0.1:7897`

### 二、Milestone 1: 静态像素工作台（5个功能分支）
- PR #3-#7: scaffold → pixel-theme → agent-store → agent-components → app-layout

### 三、Pixel 2.0 视觉规范重构（3个重构分支）
- PR #9-#11: theme → components → layout

### 四、Premium B/W/G 极简毛玻璃重构（3个重构分支）
- PR #13-#15: theme → components → layout

### 五、Milestone 2 + M3预研 + 设置面板
- PR #18 `feat/milestone2-reactflow`: ReactFlow引擎 + 4节点图谱 + SSE模拟 + SettingsPanel

### 六、Milestone 3 全栈联调（1个功能分支）
- PR #20 `feat/milestone3-fullstack-sse`:
  - ✅ 战役1: Zustand persist 中间件, API Key 持久化到 localStorage, hydration 安全
  - ✅ 战役2: Express 桥接服务器 (:4001), SSE /api/stream, CORS, 14事件并行推理序列
  - ✅ 战役3: 7节点并行图谱 Input→Arch→(Codex|Trae)→Merge→Claude→Done, 7条Edge
  - ✅ 战役4: EventSource 真实 SSE 接入, CONNECT/DISCONNECT 切换, LIVE 指示器, 错误恢复

### 七、验证
- TypeScript 零错误, Production build 通过
- SSE 流 curl 测试通过 (14事件序列正确下发)
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
  store/useAgentStore.ts     # Zustand persist + 7节点图谱 + EventSource SSE + 事件日志
  components/
    AppShell.tsx             # 12列Grid骨架
    TopBar.tsx               # 顶部导航
    MainStage.tsx            # ReactFlow + CONNECT SSE 按钮 + LIVE 指示器
    AgentCard.tsx            # Agent卡片
    StatusBadge.tsx          # 状态灯
    PixelAvatar.tsx          # SVG像素头像
    SettingsPanel.tsx        # 毛玻璃设置覆盖层 (API Key持久化 + v0.3.0-alpha)
    flow/
      TaskNode.tsx           # 任务节点 (4x4方形Handle)
      AgentNode.tsx          # Agent节点 (4x4方形Handle)
      InputNode.tsx          # 输入节点 (4x4方形Handle)
      FlowEdge.tsx           # 自定义边 (SmoothStep + 莫兰迪动画色)
  styles/
    globals.css              # Tailwind v4 @theme 令牌
    pixel.css                # glass-panel / pixel-button / React Flow覆盖
server/
  index.ts                   # Express 桥接服务器 (:4001) + SSE /api/stream + /api/health
```

## 运行方式

```bash
pnpm dev            # 前端 Vite dev server
pnpm dev:server     # 后端 Express 桥接服务器 (localhost:4001)
pnpm dev:all        # 前后端同时启动
```

## Push 规范（必须遵守）

- 分支命名: feat/xxx, fix/xxx, refactor/xxx, chore/xxx, docs/xxx
- Commit: Conventional Commits
- 流程: feature branch → PR → Squash Merge → main
- main 禁止直接 push

## 当前状态

- 版本: v0.3.0-alpha
- main 最新: PR #20 (350c24a)
- 包管理: pnpm

## 未完成

- 真实 WebSocket/SSE 后端（当前为模拟事件队列）
- 更多 Agent 节点动态添加
- API Key 加密存储（当前明文 localStorage）
- CI/CD 配置
- 真实 CLI 命令桥接入
- 桌面化封装 (Tauri)
