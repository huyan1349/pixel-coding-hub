interface KeyStatus {
  key: string;
  available: boolean;
  masked: string;
  source: string;
}

interface EnvConfig {
  deepseekApiKey: string;
  anthropicApiKey: string;
  anthropicBaseUrl: string;
  anthropicModel: string;
  subagentModel: string;
  keys: Record<string, KeyStatus>;
}

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

export function loadEnvConfig(): EnvConfig {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
  const anthropicBaseUrl = process.env.ANTHROPIC_BASE_URL || '';
  const anthropicModel = process.env.ANTHROPIC_MODEL || '';
  const subagentModel = process.env.CLAUDE_CODE_SUBAGENT_MODEL || '';

  const keys: Record<string, KeyStatus> = {
    deepseek: {
      key: 'deepseek',
      available: !!deepseekApiKey,
      masked: maskKey(deepseekApiKey),
      source: 'DEEPSEEK_API_KEY',
    },
    claude: {
      key: 'claude',
      available: !!anthropicApiKey,
      masked: maskKey(anthropicApiKey),
      source: 'ANTHROPIC_API_KEY',
    },
    codex: {
      key: 'codex',
      available: !!deepseekApiKey,
      masked: maskKey(deepseekApiKey),
      source: 'DEEPSEEK_API_KEY (shared)',
    },
  };

  return {
    deepseekApiKey,
    anthropicApiKey,
    anthropicBaseUrl,
    anthropicModel,
    subagentModel,
    keys,
  };
}

export function getCoordinatorKey(env: EnvConfig): string {
  return env.deepseekApiKey || env.anthropicApiKey;
}

export function getCoordinatorBaseUrl(env: EnvConfig): string {
  if (env.anthropicBaseUrl) return env.anthropicBaseUrl;
  return 'https://api.deepseek.com/v1';
}

export function getCoordinatorModel(env: EnvConfig): string {
  if (env.anthropicModel) return env.anthropicModel;
  return 'deepseek-chat';
}
