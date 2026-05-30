# Handoffgo

## 已完成
- GitHub 仓库: https://github.com/huyan1349/pixel-coding-hub (Public)
- 分支保护 + Squash Merge 规则
- PR #3 feat/scaffold: Vite + React 19 + TypeScript + Tailwind v4
- PR #4 feat/pixel-theme: @theme 色彩/字体令牌 + pixel.css
- PR #5 feat/agent-store: Agent 类型 + Zustand store + mock 数据
- PR #6 feat/agent-components: StatusBadge + PixelAvatar + AgentCard
- PR #7 feat/app-layout: TopBar + AppShell + MainStage + App.tsx 组装
- Dev server 运行正常 (localhost:3000)
- Production build 通过

## Push 规范
- 分支命名: feat/xxx, fix/xxx, refactor/xxx, chore/xxx, docs/xxx
- Commit: Conventional Commits
- 流程: feature branch → PR → Squash Merge → main
- main 禁止直接 push
- 代理: git config --global http.proxy socks5h://127.0.0.1:7897

## 未完成
- Milestone 2: React Flow 协作可视化
- Milestone 3: Mock 后端 + WebSocket 事件流
- 设置页面 + 版本号管理
- CI/CD 配置
