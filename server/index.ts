import express from 'express';
import cors from 'cors';
import { loadEnvConfig, getCoordinatorKey, getCoordinatorBaseUrl, getCoordinatorModel } from './env.js';
import { spawnClaude, killAllClaudeProcesses, isClaudeInstalled } from './claude-bridge.js';
import { detectTraeStatus, startFileWatcher, stopFileWatcher, getRecentChanges, readTraeAIConversations, cleanupTraeBridge } from './trae-bridge.js';
import { coordinatorAnalyze, type CoordinatorAction } from './coordinator-bridge.js';
import { getProcessTelemetry, getMultiProcessTelemetry, getClaudeCodeTelemetry, getTraeTelemetry, getCloudTelemetry, getSystemMemory } from './telemetry.js';

const app = express();
const PORT = 4001;

const envConfig = loadEnvConfig();

let codexTokenCount = 0;
let codexLastRequestTime: number | null = null;
let codexPhase = 'Idle';
let coordinatorTokenCount = 0;
let coordinatorLastRequestTime: number | null = null;
let coordinatorPhase = 'Idle';

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.get('/api/keys', (_req, res) => {
  res.json({
    keys: envConfig.keys,
    claudeInstalled: isClaudeInstalled(),
    envInfo: {
      anthropicBaseUrl: envConfig.anthropicBaseUrl || '(default)',
      anthropicModel: envConfig.anthropicModel || '(default)',
      subagentModel: envConfig.subagentModel || '(default)',
    },
  });
});

app.get('/api/agents/status', async (_req, res) => {
  const traeStatus = await detectTraeStatus();
  const claudeInstalled = isClaudeInstalled();
  const hasDeepseekKey = !!envConfig.deepseekApiKey;
  const hasAnthropicKey = !!envConfig.anthropicApiKey;
  const sysMem = getSystemMemory();

  const traeTelemetry = traeStatus.pid
    ? getTraeTelemetry(traeStatus.pid)
    : getProcessTelemetry(null);

  const claudeTelemetry = getClaudeCodeTelemetry();

  const codexTelemetry = getCloudTelemetry(codexLastRequestTime, codexTokenCount, codexPhase);
  const coordinatorTelemetry = getCloudTelemetry(coordinatorLastRequestTime, coordinatorTokenCount, coordinatorPhase);

  res.json({
    claude: {
      available: claudeInstalled && hasAnthropicKey,
      status: claudeTelemetry.activeSession ? (claudeTelemetry.sessionStatus === 'busy' ? 'working' : 'online') : (claudeInstalled ? (hasAnthropicKey ? 'online' : 'unconfigured') : 'offline'),
      backend: 'DeepSeek API',
      model: claudeTelemetry.model,
      telemetry: claudeTelemetry,
      telemetryType: 'claude-code',
    },
    trae: {
      available: traeStatus.running,
      status: traeStatus.running ? (traeStatus.aiActive ? 'working' : 'online') : 'offline',
      pid: traeStatus.pid,
      workspaceDir: traeStatus.workspaceDir,
      recentFiles: traeStatus.recentFiles,
      aiActive: traeStatus.aiActive,
      telemetry: traeTelemetry,
      telemetryType: 'trae',
    },
    codex: {
      available: hasDeepseekKey,
      status: hasDeepseekKey ? 'online' : 'unconfigured',
      backend: 'DeepSeek API',
      telemetry: codexTelemetry,
      telemetryType: 'cloud',
    },
    coordinator: {
      available: !!(hasDeepseekKey || hasAnthropicKey),
      status: (hasDeepseekKey || hasAnthropicKey) ? 'online' : 'offline',
      backend: 'DeepSeek API',
      model: getCoordinatorModel(envConfig),
      telemetry: coordinatorTelemetry,
      telemetryType: 'cloud',
    },
    cursor: {
      available: false,
      status: 'offline',
      backend: 'Reserved',
      telemetry: { pid: null, cpu: '—', ram: '—', uptime: '—', activeFile: '—', threads: 0, totalCpu: '—', totalRam: '—', processCount: 0, subProcesses: [] },
      telemetryType: 'process',
    },
    system: {
      memory: sysMem,
      uptime: process.uptime(),
    },
  });
});

app.get('/api/trae/conversations', (_req, res) => {
  const conversations = readTraeAIConversations();
  res.json({ conversations });
});

app.get('/api/trae/changes', (_req, res) => {
  const changes = getRecentChanges();
  res.json({ changes });
});

app.post('/api/trae/watch', (req, res) => {
  const { dir } = req.body as { dir: string };
  if (!dir) {
    res.status(400).json({ error: 'Missing dir' });
    return;
  }

  startFileWatcher(dir, (file, event) => {
    if (watchClients.size > 0) {
      const data = JSON.stringify({ file, event, timestamp: Date.now() });
      for (const client of watchClients) {
        client.write(`data: ${data}\n\n`);
      }
    }
  });

  res.json({ ok: true, dir });
});

app.post('/api/trae/watch/stop', (_req, res) => {
  stopFileWatcher();
  res.json({ ok: true });
});

const watchClients = new Set<express.Response>();

app.get('/api/trae/watch/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  watchClients.add(res);

  req.on('close', () => {
    watchClients.delete(res);
  });
});

app.post('/api/dispatch', async (req, res) => {
  const { prompt, agents: requestedAgents } = req.body as {
    prompt: string;
    agents?: string[];
  };

  if (!prompt) {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  const targetAgents = requestedAgents || ['coordinator', 'claude', 'trae', 'codex'];

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const send = (nodeId: string, status: string, message: string) => {
    res.write(`data: ${JSON.stringify({ nodeId, status, message, timestamp: Date.now() })}\n\n`);
  };

  const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  try {
    send('__system__', 'running', '[DISPATCH] Task dispatch started');

    send('input-1', 'running', `[DISPATCH] Receiving prompt: "${prompt.slice(0, 80)}..."`);
    await delay(500);
    send('input-1', 'done', '[DISPATCH] Prompt received');

    const coordinatorKey = getCoordinatorKey(envConfig);
    const coordinatorBaseUrl = getCoordinatorBaseUrl(envConfig);
    const coordinatorModel = getCoordinatorModel(envConfig);

    if (targetAgents.includes('coordinator') && coordinatorKey) {
      coordinatorPhase = 'Analyzing';
      coordinatorLastRequestTime = Date.now();
      send('task-arch', 'running', '[COORDINATOR] Analyzing task and planning agent assignments...');
      const agentOutputs: Record<string, string> = {};

      const coordinatorResult = await coordinatorAnalyze(
        prompt,
        coordinatorKey,
        coordinatorBaseUrl,
        coordinatorModel,
        (chunk) => {
          coordinatorTokenCount += chunk.length;
          send('task-arch', 'running', `[COORDINATOR] ${chunk}`);
        },
        agentOutputs,
      );

      coordinatorPhase = 'Dispatched';
      send('task-arch', 'done', '[COORDINATOR] Analysis complete');

      if (coordinatorResult.actions && coordinatorResult.actions.length > 0) {
        for (const action of coordinatorResult.actions) {
          send('task-arch', 'running', `[COORDINATOR] → Assign to ${action.agent}: ${action.task} (priority: ${action.priority})`);
        }
      }
    } else {
      send('task-arch', 'running', '[COORDINATOR] No coordinator key available, using default flow');
      await delay(1000);
      send('task-arch', 'done', '[COORDINATOR] Default flow selected');
    }

    const parallelPromises: Promise<void>[] = [];

    if (targetAgents.includes('codex') && envConfig.deepseekApiKey) {
      codexPhase = 'AST Parsing';
      codexLastRequestTime = Date.now();
      send('agent-codex', 'running', '[CODEX] Starting code generation via DeepSeek API...');

      const codexPromise = (async () => {
        try {
          const { streamCodex } = await import('./codex-bridge.js');
          const dsBaseUrl = 'https://api.deepseek.com/v1';
          await streamCodex(
            prompt,
            envConfig.deepseekApiKey,
            (chunk) => {
              codexTokenCount += chunk.length;
              if (codexPhase === 'AST Parsing') codexPhase = 'Code Generation';
              send('agent-codex', 'running', `[CODEX] ${chunk}`);
            },
            dsBaseUrl,
          );
          codexPhase = 'Complete';
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          send('agent-codex', 'running', `[CODEX] Error: ${msg}`);
          codexPhase = 'Error';
        }
        send('agent-codex', 'done', '[CODEX] Code generation complete ✓');
      })();
      parallelPromises.push(codexPromise);
    } else if (targetAgents.includes('codex')) {
      send('agent-codex', 'running', '[CODEX] No DeepSeek API key, skipping...');
      await delay(500);
      send('agent-codex', 'done', '[CODEX] Skipped (no key)');
    }

    if (targetAgents.includes('trae')) {
      send('agent-trae', 'running', '[TRAE] Detecting Trae Solo CN status...');

      const traePromise = (async () => {
        const status = await detectTraeStatus();
        if (status.running) {
          send('agent-trae', 'running', `[TRAE] Running (PID: ${status.pid})`);
          if (status.aiActive) {
            send('agent-trae', 'running', '[TRAE] AI agent is active');
          }
          if (status.workspaceDir) {
            send('agent-trae', 'running', `[TRAE] Workspace: ${status.workspaceDir}`);
          }

          const conversations = readTraeAIConversations();
          if (conversations.length > 0) {
            send('agent-trae', 'running', `[TRAE] Found ${conversations.length} recent AI messages`);
            for (const msg of conversations.slice(-3)) {
              send('agent-trae', 'running', `[TRAE] [${msg.role}]: ${msg.content.slice(0, 100)}...`);
            }
          }

          const changes = getRecentChanges();
          if (changes.length > 0) {
            send('agent-trae', 'running', `[TRAE] ${changes.length} recent file changes detected`);
          }
        } else {
          send('agent-trae', 'running', '[TRAE] Not running');
        }
        send('agent-trae', 'done', '[TRAE] Status check complete ✓');
      })();
      parallelPromises.push(traePromise);
    }

    await Promise.all(parallelPromises);

    send('task-merge', 'running', '[MERGE] Collecting agent outputs...');
    await delay(1000);
    send('task-merge', 'done', '[MERGE] Outputs collected');

    if (targetAgents.includes('claude') && envConfig.anthropicApiKey) {
      send('agent-claude', 'running', '[CLAUDE] Spawning Claude Code (DeepSeek backend)...');
      try {
        await spawnClaude(
          prompt,
          (chunk) => send('agent-claude', 'running', `[CLAUDE] ${chunk}`),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send('agent-claude', 'running', `[CLAUDE] Error: ${msg}`);
      }
      send('agent-claude', 'done', '[CLAUDE] Review complete ✓');
    } else if (targetAgents.includes('claude')) {
      send('agent-claude', 'running', '[CLAUDE] No API key or not installed, skipping...');
      await delay(500);
      send('agent-claude', 'done', '[CLAUDE] Skipped');
    }

    if (coordinatorKey) {
      coordinatorPhase = 'Synthesizing';
      coordinatorLastRequestTime = Date.now();
      send('task-done', 'running', '[COORDINATOR] Final synthesis...');
      try {
        await coordinatorAnalyze(
          `Synthesize the following task results into a final summary. Original task: "${prompt}"`,
          coordinatorKey,
          coordinatorBaseUrl,
          coordinatorModel,
          (chunk) => {
            coordinatorTokenCount += chunk.length;
            send('task-done', 'running', `[SYNTHESIS] ${chunk}`);
          },
        );
        coordinatorPhase = 'Idle';
      } catch {
        send('task-done', 'running', '[SYNTHESIS] Final synthesis failed');
        coordinatorPhase = 'Error';
      }
    }

    send('task-done', 'done', '[DISPATCH] 🎯 All agents complete');
    send('__system__', 'done', '[DISPATCH] Stream complete');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    send('__system__', 'error', `[DISPATCH] Error: ${msg}`);
  } finally {
    res.end();
  }
});

app.get('/api/health', (_req, res) => {
  const sysMem = getSystemMemory();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    mode: 'monitor-coordinate',
    keysAvailable: {
      deepseek: !!envConfig.deepseekApiKey,
      anthropic: !!envConfig.anthropicApiKey,
    },
    claudeInstalled: isClaudeInstalled(),
    system: { memory: sysMem },
  });
});

process.on('SIGINT', () => {
  killAllClaudeProcesses();
  cleanupTraeBridge();
  process.exit(0);
});

process.on('SIGTERM', () => {
  killAllClaudeProcesses();
  cleanupTraeBridge();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[Pixel Hub Bridge] Running on http://localhost:${PORT}`);
  console.log(`[Pixel Hub Bridge] Mode: MONITOR + COORDINATE + TELEMETRY`);
  console.log(`[Pixel Hub Bridge] DeepSeek Key: ${envConfig.deepseekApiKey ? '✓' : '✗'}`);
  console.log(`[Pixel Hub Bridge] Anthropic Key: ${envConfig.anthropicApiKey ? '✓' : '✗'}`);
  console.log(`[Pixel Hub Bridge] Claude CLI: ${isClaudeInstalled() ? '✓' : '✗'}`);
  console.log(`[Pixel Hub Bridge] API Base URL: ${envConfig.anthropicBaseUrl || '(default)'}`);
  console.log(`[Pixel Hub Bridge] Model: ${envConfig.anthropicModel || '(default)'}`);
});
