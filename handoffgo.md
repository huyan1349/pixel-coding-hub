# Handoffgo

> 下一个接手的 AI 请先读此文件。

## 项目

**Pixel Coding Hub** — 像素风多 Agent 协作编程工作台
仓库: https://github.com/huyan1349/pixel-coding-hub (Public)

## ⚠️ 分支纪律

- **写任何代码前，先 `git branch` 确认当前在 feat/refactor 分支上！绝不在 main 上写代码！**
- 流程: feature branch → PR → Squash Merge → main

## 已完成（最近3次）

### PR #31: 实时遥测仪表盘
- Claude Code 深度遥测 + Trae 深度遥测 + v0.6.0-alpha

### PR #32: Aero-Glass Matrix 视觉纪元跃迁
- 深空底色 #0c0c0e + 拓扑网格 + 径向渐变 + backdrop-blur-2xl + Inter/JetBrains Mono

### PR #33: Vite 代理修复
- proxy /api -> localhost:4001 解决浏览器代理拦截

### PR #34: 侧边栏导航 + 图形化仪表盘 + 多视图架构
- ✅ **Sidebar**: 左侧毛玻璃悬浮导航 (Dashboard/Map/Logs/Settings)
- ✅ **DashboardView**: 大卡片 + SVG 环形图 + 4列遥测网格
- ✅ **LogsView**: 按 Agent 分组日志 + Dispatch 事件
- ✅ **AgentNode**: 图形化 Flow 节点 (MiniRing + CPU/RAM/PID)
- ✅ 全屏布局替代 65/35 分屏

## 设计规范（Aero-Glass Matrix）

1. Deep Space Base: #0c0c0e + 48px拓扑网格 + 径向渐变(<5%)
2. Aero-Glass: bg-white/[0.03] backdrop-blur-2xl border-t-white/[0.1] rounded-2xl
3. Typography: Inter(UI) + JetBrains Mono(遥测) + Press Start 2P(版本号7px)
4. Morandi: online=#84a59d, working=#c2b280, error=#b56576, info=#789ca4
5. Micro: hover translateY(-2px) + animate-pulse-soft + SVG ring charts

## 文件结构

```
src/
  App.tsx                    # 多视图路由 + 5s轮询
  types/agent.ts             # ClaudeCodeTelemetry + TraeTelemetry
  store/useAgentStore.ts     # Zustand + Vite proxy
  components/
    AppShell.tsx             # Sidebar + content area
    Sidebar.tsx              # 毛玻璃悬浮导航栏
    TopBar.tsx               # 顶部栏
    DashboardView.tsx        # 大卡片 + SVG环形图 + 遥测网格
    LogsView.tsx             # 日志面板
    MainStage.tsx            # ReactFlow Map 视图
    MonitorCard.tsx          # 遥测卡片(旧)
    MonitorDashboard.tsx     # 监控矩阵(旧)
    SettingsPanel.tsx        # 设置弹窗
    flow/                    # AgentNode(图形化) + TaskNode + InputNode
server/
  telemetry.ts               # getClaudeCodeTelemetry + getTraeTelemetry
vite.config.ts               # proxy /api -> localhost:4001
```

## 运行

```bash
npm dev            # 前端 (自动代理 /api)
npm run dev:server # 后端 localhost:4001
```

## 当前状态

- 版本: v0.6.0-alpha
- main 最新: PR #34 (0843573)

## 未完成

- Trae Solo CN 实时输出内容
- Claude Code 实时输出流
- Cursor 真实接入
- Coordinator AI 多轮对话
- Agent 输出结果持久化
- API Key 加密存储
- CI/CD
- 桌面化封装 (Tauri)
