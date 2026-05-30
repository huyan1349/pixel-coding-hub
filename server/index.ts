import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3002'],
  methods: ['GET'],
}));

app.use(express.json());

interface StreamEvent {
  nodeId: string;
  status: 'todo' | 'running' | 'done' | 'error';
  message: string;
  delay: number;
}

const eventSequence: StreamEvent[] = [
  { nodeId: 'input-1', status: 'running', message: '[SSE] 需求接收中...', delay: 500 },
  { nodeId: 'input-1', status: 'done', message: '[SSE] 需求已接收', delay: 2000 },
  { nodeId: 'task-arch', status: 'running', message: '[SSE] 架构拆解启动...', delay: 2500 },
  { nodeId: 'task-arch', status: 'done', message: '[SSE] 拆解完成：逻辑层 + UI层', delay: 4500 },
  { nodeId: 'agent-codex', status: 'running', message: '[SSE] Codex 开始编写逻辑代码...', delay: 5000 },
  { nodeId: 'agent-trae', status: 'running', message: '[SSE] Trae Solo 开始编写 UI 组件...', delay: 5200 },
  { nodeId: 'agent-codex', status: 'done', message: '[SSE] Codex 逻辑代码完成 ✓', delay: 8000 },
  { nodeId: 'agent-trae', status: 'done', message: '[SSE] Trae Solo UI 组件完成 ✓', delay: 8500 },
  { nodeId: 'task-merge', status: 'running', message: '[SSE] 代码合并中...', delay: 9000 },
  { nodeId: 'task-merge', status: 'done', message: '[SSE] 代码合并完成，0 冲突', delay: 11000 },
  { nodeId: 'agent-claude', status: 'running', message: '[SSE] Claude Code 开始审查...', delay: 11500 },
  { nodeId: 'agent-claude', status: 'done', message: '[SSE] Claude Code 审查通过 ✓', delay: 14000 },
  { nodeId: 'task-done', status: 'running', message: '[SSE] 交付物打包中...', delay: 14500 },
  { nodeId: 'task-done', status: 'done', message: '[SSE] 🎯 全流程完成，交付物就绪', delay: 16000 },
];

app.get('/api/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`data: ${JSON.stringify({ nodeId: '__system__', status: 'running', message: '[SSE] Stream established', timestamp: Date.now() })}\n\n`);

  const timers: ReturnType<typeof setTimeout>[] = [];

  eventSequence.forEach((event) => {
    const timer = setTimeout(() => {
      const payload = {
        nodeId: event.nodeId,
        status: event.status,
        message: event.message,
        timestamp: Date.now(),
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }, event.delay);
    timers.push(timer);
  });

  const closeTimer = setTimeout(() => {
    res.write(`data: ${JSON.stringify({ nodeId: '__system__', status: 'done', message: '[SSE] Stream complete', timestamp: Date.now() })}\n\n`);
    res.end();
  }, 17000);
  timers.push(closeTimer);

  req.on('close', () => {
    timers.forEach(clearTimeout);
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`[Bridge Server] Running on http://localhost:${PORT}`);
  console.log(`[Bridge Server] SSE endpoint: http://localhost:${PORT}/api/stream`);
});
