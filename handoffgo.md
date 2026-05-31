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

### 一~九: 略（见 Git 历史）

### 十、Milestone 3.3: 实时遥测仪表盘
- PR #31: Claude Code 深度遥测 + Trae 深度遥测 + v0.6.0-alpha

### 十一、Aero-Glass Matrix 视觉纪元跃迁
- PR #32 `refactor/aero-glass-matrix`:
  - ✅ **核心1 环境底噪**: 深空底色 #0c0c0e + 48px拓扑网格 + 径向渐变光晕
  - ✅ **核心2 航空级毛玻璃**: backdrop-blur-2xl(32px) + 高光边框 + rounded-2xl(16px)
  - ✅ **核心3 排版三位一体**: Inter(UI) + JetBrains Mono(遥测) + Press Start 2P(仅版本号彩蛋7px)
  - ✅ **核心4 遥测微交互**: 现代 div 进度条 + aero-badge + 虚线分割 + 深空浮力hover
  - ✅ **React Flow 节点现代化**: 12px圆角 + 圆形Handle + hover浮起 + 平滑cubic-bezier

### 十二、Vite 代理修复
- PR #33 `fix/vite-proxy-api-connection`:
  - ✅ Vite proxy /api -> localhost:4001 解决浏览器代理拦截问题
  - ✅ BRIDGE_URL 在 dev 模式使用相对路径

## 当前设计规范（Aero-Glass Matrix）

1. **Deep Space Base**: 底色 #0c0c0e + 48px拓扑网格 + 径向渐变光晕(<5%)
2. **Aero-Glass**: bg-white/[0.03] backdrop-blur-2xl border-t-white/[0.1] rounded-2xl
3. **Typography Trinity**: Inter(UI 300-500) + JetBrains Mono(遥测 12px) + Press Start 2P(版本号 7px)
4. **Morandi Accents**: online=#84a59d, working=#c2b280, error=#b56576, info=#789ca4
5. **Micro-interactions**: hover translateY(-2px) + animate-pulse-soft + 现代进度条

## 当前文件结构

```
src/
  App.tsx                    # 总入口 + 5s轮询 + 分屏布局
  types/agent.ts             # AgentStatus + ClaudeCodeTelemetry + TraeTelemetry
  store/useAgentStore.ts     # Zustand + 7节点图谱 + Vite proxy
  components/
    AppShell.tsx             # 65%/35% 分屏 + p-3 padding
    TopBar.tsx               # Inter字体 + Settings按钮
    MainStage.tsx            # ReactFlow + glass-panel输入框
    MonitorDashboard.tsx     # 四神兽监控矩阵
    MonitorCard.tsx          # Aero-Glass遥测卡片 + 现代进度条 + aero-badge
    SettingsPanel.tsx        # 20px圆角 + glass-panel-inset
    flow/                    # 12px圆角 + 圆形Handle + hover浮起
server/
  telemetry.ts               # getClaudeCodeTelemetry + getTraeTelemetry
  index.ts                   # Express + Vite proxy友好
vite.config.ts               # proxy /api -> localhost:4001
```

## 运行方式

```bash
npm dev            # 前端 Vite dev server (自动代理 /api)
npm run dev:server # 后端 Express 桥接服务器 (localhost:4001)
```

## 当前状态

- 版本: v0.6.0-alpha
- main 最新: PR #33 (4cb3b11)
- 包管理: npm

## 未完成

- Trae Solo CN 实时输出内容（AI Agent 实时对话文本）
- Claude Code 实时输出流（流式输出监听）
- Cursor 真实接入
- Coordinator AI 多轮对话
- Agent 输出结果持久化
- API Key 加密存储
- CI/CD
- 桌面化封装 (Tauri)
