# Handoffgo

> 下一个接手的 AI 请先读此文件。

## 项目

**Pixel Coding Hub** — 像素风多 Agent 协作编程工作台
仓库: https://github.com/huyan1349/pixel-coding-hub (Public)

## 已完成全部任务

### 一、GitHub 仓库与 Git 规范建立

- PR #1 `docs/readme-and-gitignore`: README + .gitignore
- PR #2 `chore/add-handoffgo`: 交接文件
- 仓库设置: Public、main 分支保护(禁止直接push)、仅 Squash Merge、合并后自动删分支
- 代理: `git config --global http.proxy socks5h://127.0.0.1:7897`（网络不稳定时需重试）

### 二、Milestone 1: 静态像素工作台（5个功能分支）

- PR #3 `feat/scaffold`: Vite + React 19 + TypeScript + Tailwind v4 + 路径别名 + Google Fonts
- PR #4 `feat/pixel-theme`: @theme 色彩/字体令牌 + pixel.css(边框/按钮/滚动条) + 全局锯齿化
- PR #5 `feat/agent-store`: AgentStatus/Agent 类型 + Zustand store + 3个mock Agent + 连接模拟
- PR #6 `feat/agent-components`: StatusBadge(状态灯动画) + PixelAvatar(SVG像素头像) + AgentCard(卡片+连接按钮+能力标签)
- PR #7 `feat/app-layout`: TopBar(全局导航) + AppShell(12列Grid) + MainStage(网格背景) + App.tsx 组装

### 三、Pixel 2.0 视觉规范重构（3个重构分支）

- PR #9 `refactor/pixel-2-theme`: 色板→slate灰蓝(#0f172a)、毛玻璃CSS类(glass-panel)、霓虹令牌、微倒角4px、丝滑动效0.3s
- PR #10 `refactor/pixel-2-components`: StatusBadge(霓虹光晕shadow-[0_0_12px])、PixelAvatar(slate配色)、AgentCard(毛玻璃+悬浮动效)、TopBar(毛玻璃+克制字体)
- PR #11 `refactor/pixel-2-layout`: AppShell(毛玻璃侧栏/底栏+border-white/10)、MainStage(slate网格)、App.tsx(统一边框)

### 四、验证

- TypeScript 类型检查通过
- Production build 通过 (819ms)
- Dev server 运行正常 (localhost:3000 或 3001)
- 浏览器无报错

## 当前文件结构

```
src/
  App.tsx                    # 总入口，组装 sidebar + main + bottom
  main.tsx                   # React 挂载
  vite-env.d.ts
  types/agent.ts             # AgentStatus + Agent 类型
  store/useAgentStore.ts     # Zustand store + mock 数据
  components/
    AppShell.tsx             # 12列Grid骨架
    TopBar.tsx               # 顶部导航
    MainStage.tsx            # 中央画布(网格背景+占位)
    AgentCard.tsx            # Agent卡片
    StatusBadge.tsx          # 状态灯
    PixelAvatar.tsx          # SVG像素头像
  styles/
    globals.css              # Tailwind v4 @theme 令牌
    pixel.css                # glass-panel / pixel-button / 滚动条
```

## Push 规范（必须遵守）

- 分支命名: feat/xxx, fix/xxx, refactor/xxx, chore/xxx, docs/xxx
- Commit: Conventional Commits (feat: / fix: / refactor: / chore:)
- 流程: feature branch → PR → Squash Merge → main
- main 禁止直接 push
- 每完成一个功能模块必须 push + PR + Merge

## 未完成

- Milestone 2: React Flow 协作可视化（节点图、任务流转、连线动画）
- Milestone 3: Mock 后端 + WebSocket/SSE 事件流
- 设置页面 + 版本号管理（规则1要求每次功能写入设置页）
- CI/CD 配置
- 真实 CLI 命令桥接入
- 桌面化封装 (Tauri)
