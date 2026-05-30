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

### 四、Premium B/W/G 极简毛玻璃重构（3个重构分支）

- PR #13 `refactor/glass-bw-theme`: 全局色板→纯黑底#0a0a0a、莫兰迪点缀(#84a59d/#c2b280/#b56576)、毛玻璃CSS(glass-panel无发光)、像素字体退居点缀
- PR #14 `refactor/glass-bw-components`: StatusBadge(1.5px莫兰迪圆点无光晕)、PixelAvatar(莫兰迪SVG图案)、AgentCard(纯毛玻璃hover微亮)、TopBar(毛玻璃+像素字体仅logo)
- PR #15 `refactor/glass-bw-layout`: AppShell(bg-white/[0.02] backdrop-blur-md)、MainStage(删除网格背景→纯#0a0a0a)、App.tsx(border-white/[0.08]+text-neutral-400)

### 五、验证

- TypeScript 类型检查通过
- Production build 通过 (882ms)
- Dev server 运行正常
- 全局扫描: 零残留旧色值(#1e293b/#0f172a)、零发光阴影、零网格背景

## 当前设计规范（5条铁律）

1. **Premium B/W/G Base**: 纯黑底 #0a0a0a，主标题 text-neutral-200，正文 text-neutral-400
2. **Glassmorphism Core**: bg-white/[0.02] backdrop-blur-md border-white/[0.08]，禁止任何发光阴影
3. **Morandi Accents**: online=#84a59d, working=#c2b280, error=#b56576
4. **Pixel as Accents**: Press Start 2P 仅用于 text-[9px] 小标签，90%文本用 system-ui/JetBrains Mono
5. **Elegant Flow**: React Flow 连线 stroke-neutral-800，Handle 4x4px 纯色方块（待M2实现）

## 当前文件结构

```
src/
  App.tsx                    # 总入口，组装 sidebar + main + bottom
  main.tsx                   # React 挂载
  vite-env.d.ts
  types/agent.ts             # AgentStatus + Agent 类型
  store/useAgentStore.ts     # Zustand store + mock 数据
  components/
    AppShell.tsx             # 12列Grid骨架（毛玻璃侧栏+底栏）
    TopBar.tsx               # 顶部导航（毛玻璃+像素logo）
    MainStage.tsx            # 中央画布（纯黑底+占位）
    AgentCard.tsx            # Agent卡片（毛玻璃+微亮hover）
    StatusBadge.tsx          # 状态灯（莫兰迪圆点）
    PixelAvatar.tsx          # SVG像素头像（莫兰迪配色）
  styles/
    globals.css              # Tailwind v4 @theme 令牌（B/W/G+莫兰迪）
    pixel.css                # glass-panel / pixel-button / 滚动条
```

## Push 规范（必须遵守）

- 分支命名: feat/xxx, fix/xxx, refactor/xxx, chore/xxx, docs/xxx
- Commit: Conventional Commits (feat: / fix: / refactor: / chore:)
- 流程: feature branch → PR → Squash Merge → main
- main 禁止直接 push
- 每完成一个功能模块必须 push + PR + Merge

## 当前状态

- 当前分支: `feat/milestone2-reactflow`（已创建，准备开始 M2 开发）
- main 最新: PR #16 (c174488)

## 未完成

- Milestone 2: React Flow 协作可视化（节点图、任务流转、连线动画、4x4px Handle）
- Milestone 3: Mock 后端 + WebSocket/SSE 事件流
- 设置页面 + 版本号管理（规则1要求每次功能写入设置页）
- CI/CD 配置
- 真实 CLI 命令桥接入
- 桌面化封装 (Tauri)
