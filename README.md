# Pixel Coding Hub

像素风多 Agent 协作编程工作台。

## 项目简介

Pixel Coding Hub 是一个像素风桌面/网页应用，将 Codex、Trae Solo、Claude Code CLI 等多个 coding agent 连接到同一个可视化工作台中。它不是简单的聊天聚合器，而是一个**协作编程调度台**：

- 一键连接多个 coding 工具
- 每个 agent 以像素角色、终端节点或工作站的形式呈现
- 把需求拆成任务，分配给不同 agent
- 实时展示每个 agent 的状态、输出摘要、文件改动和协作关系

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS |
| 状态管理 | Zustand |
| 节点可视化 | React Flow |
| 图标 | Lucide React |
| 动效 | Framer Motion（可选） |
| 后端 | Node.js + Fastify + TypeScript（第二阶段） |
| 桌面化 | Tauri（第三阶段） |

## 功能规划

### MVP（第一阶段）

- 像素风单页工作台
- Agent 节点可视化（Codex / Trae Solo / Claude Code CLI）
- 一键连接模拟流程
- 任务输入 → 拆解 → 分配
- 协作时间线
- 命令桥接口设计
- 本地 mock 后端

### 第二阶段

- 真实 CLI 执行器
- WebSocket 实时状态流
- 权限确认系统
- 执行历史记录

### 第三阶段

- 多 Agent 协作策略
- Diff 与测试结果面板
- Repo 工作区集成
- 桌面应用封装（Tauri）

## 项目结构

```
pixel-coding-hub/
├── src/
│   ├── app/            # 应用入口与路由
│   ├── components/     # UI 组件
│   │   ├── agent/      # Agent 卡片与头像
│   │   ├── task/       # 任务看板
│   │   ├── timeline/   # 协作时间线
│   │   ├── layout/     # 布局组件
│   │   └── pixel/      # 像素风基础组件
│   ├── features/       # 业务逻辑
│   ├── lib/            # 工具函数
│   ├── styles/         # 全局样式
│   └── assets/         # 静态资源
├── server/             # 后端服务（第二阶段）
└── docs/               # 项目文档
```

## UI 风格

- 深色像素工作台 + 多色状态灯
- 硬边框、小圆角（0-4px）
- 像素字体标题 + 清晰正文
- 状态灯：绿色在线 / 橙色执行中 / 黄色等待 / 红色错误

## Git 规范

### 分支策略

所有改动走 **Feature Branch → PR → Squash Merge → main**，main 禁止直接 push。

### 分支命名

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat/` | 新功能 | `feat/agent-dock` |
| `fix/` | Bug 修复 | `fix/connection-timeout` |
| `refactor/` | 重构 | `refactor/state-management` |
| `chore/` | 杂项 | `chore/update-deps` |
| `docs/` | 文档 | `docs/api-reference` |

### Commit 格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: add agent dock component
fix: resolve connection timeout issue
chore: update dependencies
docs: add API reference
```

### 合并规则

- 仅允许 **Squash Merge**（已禁用 Merge Commit 和 Rebase Merge）
- PR 合并后自动删除分支
- PR 中的对话必须全部解决后才能合并

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/huyan1349/pixel-coding-hub.git
cd pixel-coding-hub

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## License

MIT
