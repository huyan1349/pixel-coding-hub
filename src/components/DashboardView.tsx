import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '../store/useAgentStore';
import { usePreferences } from '../store/usePreferences';
import { t } from '../i18n';
import type { TranslationKey } from '../i18n';
import type { Agent, AgentStatus, ClaudeCodeTelemetry, TraeTelemetry } from '../types/agent';
import clsx from 'clsx';

const STATUS_COLORS: Record<AgentStatus, string> = {
  unconfigured: '#525252', offline: '#525252', connecting: '#a3a3a3',
  online: '#84a59d', working: '#c2b280', waiting: '#737373',
  error: '#b56576', syncing: '#84a59d',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function TypewriterOutput({ lines, isActive }: { lines: string[]; isActive: boolean }) {
  const [charIndex, setCharIndex] = useState(0);
  const fullText = lines.join('\n');
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;
    if (fullText.length > prevLengthRef.current) {
      setCharIndex(prevLengthRef.current);
    } else if (fullText.length < prevLengthRef.current) {
      setCharIndex(0);
    }
    prevLengthRef.current = fullText.length;
  }, [fullText, isActive]);

  useEffect(() => {
    if (!isActive || charIndex >= fullText.length) return;
    const isAfterNewline = charIndex > 0 && fullText[charIndex - 1] === '\n';
    const delay = isAfterNewline ? 50 : 20;
    const timer = setTimeout(() => {
      setCharIndex(prev => Math.min(prev + 1, fullText.length));
    }, delay);
    return () => clearTimeout(timer);
  }, [charIndex, fullText, isActive]);

  if (!isActive) {
    return (
      <div className="glass-panel-inset p-3">
        <div className="telemetry-value text-[11px] leading-relaxed whitespace-pre-wrap">
          {fullText}
        </div>
      </div>
    );
  }

  const RECENT_COUNT = 5;
  const stableEnd = Math.max(0, charIndex - RECENT_COUNT);
  const stableText = fullText.slice(0, stableEnd);
  const recentChars = fullText.slice(stableEnd, charIndex);

  return (
    <div className="glass-panel-inset p-3">
      <div className="telemetry-value text-[11px] leading-relaxed whitespace-pre-wrap">
        <span>{stableText}</span>
        {recentChars.split('').map((char, i) => (
          <motion.span
            key={stableEnd + i}
            initial={{ opacity: 0.5, filter: 'blur(2px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.15 }}
          >
            {char}
          </motion.span>
        ))}
        <span className="typewriter-cursor">▌</span>
      </div>
    </div>
  );
}

function RingChart({ value, max = 100, color = '#84a59d', size = 72, label, sublabel }: { value: number; max?: number; color?: string; size?: number; label?: string; sublabel?: string }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  const prevValue = useRef(value);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (Math.abs(value - prevValue.current) > 10) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 300);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={3} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="telemetry-value-highlight text-[16px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: bounce ? [1, 1.15, 1] : 1 }}
          transition={{ delay: 0.6, scale: { duration: 0.3 } }}
        >
          {Math.round(pct * 100)}%
        </motion.span>
        {label && <span className="telemetry-label" style={{ fontSize: '7px' }}>{label}</span>}
        {sublabel && <span className="telemetry-value text-[8px] text-neutral-600">{sublabel}</span>}
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight, color }: { label: string; value: string | number; highlight?: boolean; color?: string }) {
  return (
    <div className="glass-panel-inset p-3 text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="telemetry-label mb-1.5">{label}</div>
      <div className={clsx('telemetry-value text-[13px]', highlight && 'telemetry-value-highlight')} style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

function AgentDetailCard({ agent, index }: { agent: Agent; index: number }) {
  const { locale } = usePreferences();
  const color = STATUS_COLORS[agent.status];
  const isWorking = agent.status === 'working';
  const tele = agent.telemetry as Record<string, unknown> | undefined;
  const prevStatus = useRef(agent.status);
  const [borderFlash, setBorderFlash] = useState(false);

  const cpuVal = tele ? parseFloat(String(tele.cpu || tele.totalCpu || '0')) : 0;
  const ramStr = tele ? String(tele.ram || tele.totalRam || '—') : '—';
  const uptime = tele ? String(tele.uptime || '—') : '—';
  const pid = tele ? String(tele.pid ?? '—') : '—';

  const isClaude = agent.telemetryType === 'claude-code';
  const isTrae = agent.telemetryType === 'trae';
  const claudeTele = isClaude ? (agent.telemetry as ClaudeCodeTelemetry) : null;
  const traeTele = isTrae ? (agent.telemetry as TraeTelemetry) : null;

  useEffect(() => {
    if (prevStatus.current !== agent.status) {
      if (prevStatus.current !== 'working' && agent.status === 'working') {
        setBorderFlash(true);
        const timer = setTimeout(() => setBorderFlash(false), 800);
        prevStatus.current = agent.status;
        return () => clearTimeout(timer);
      }
      prevStatus.current = agent.status;
    }
  }, [agent.status]);

  const statusLabel = t(agent.status as TranslationKey, locale);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className={clsx('aero-card gradient-border p-5', isWorking && 'animate-breathe')}
      style={{
        borderColor: borderFlash ? color + '50' : (isWorking ? color + '20' : undefined),
        borderTopColor: borderFlash ? color + '70' : (isWorking ? color + '35' : undefined),
        transition: 'border-color 0.6s ease',
      }}
    >
      <div className="flex items-start gap-5 mb-4">
        <RingChart
          value={cpuVal || 0}
          color={color}
          size={72}
          label={t('cpu', locale)}
          sublabel={statusLabel}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-[16px] font-semibold text-neutral-200 tracking-wide" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {agent.name}
            </span>
            <motion.span
              className="aero-badge"
              style={{ color, backgroundColor: color + '18' }}
              animate={isWorking ? { opacity: [1, 0.6, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: isWorking ? color : '#525252' }} />
              {statusLabel}
            </motion.span>
          </div>
          {agent.backend && <div className="telemetry-label mb-1">{agent.backend}</div>}
          {agent.model && <div className="telemetry-value text-[11px] text-neutral-500">{agent.model}</div>}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-3">
        <StatBox label={t('pid', locale)} value={pid} />
        <StatBox label={t('cpu', locale)} value={cpuVal ? `${cpuVal.toFixed(1)}%` : '—'} highlight color={cpuVal > 50 ? '#c2b280' : undefined} />
        <StatBox label={t('ram', locale)} value={ramStr} />
        <StatBox label={t('uptime', locale)} value={uptime} />
      </div>

      {isClaude && claudeTele && (
        <div className="grid grid-cols-4 gap-2.5 mb-3">
          <StatBox label={t('workTime', locale)} value={claudeTele.continuousWorkTime} highlight />
          <StatBox label={t('sessions', locale)} value={claudeTele.sessionCount || '—'} />
          <StatBox label={t('cost', locale)} value={claudeTele.totalCost} />
          <StatBox label={t('lastAct', locale)} value={claudeTele.lastActivity} />
        </div>
      )}

      {isTrae && traeTele && (
        <div className="grid grid-cols-4 gap-2.5 mb-3">
          <StatBox label={t('procs', locale)} value={traeTele.processCount || '—'} />
          <StatBox label={t('project', locale)} value={traeTele.currentProject} highlight />
          <StatBox label={t('apiCalls', locale)} value={traeTele.apiCallCount || '—'} />
          <StatBox label={t('lastApi', locale)} value={traeTele.lastApiCall} />
        </div>
      )}

      {isClaude && claudeTele?.currentTask && claudeTele.currentTask !== '—' && (
        <div className="glass-panel-inset p-3 mb-3 relative overflow-hidden">
          <motion.div
            key={`task-${claudeTele.currentTask}`}
            className="absolute inset-0 bg-[#84a59d]/[0.04]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="relative">
            <div className="telemetry-label mb-1">{t('currentTask', locale)}</div>
            <div className="telemetry-value-highlight text-[12px] break-all leading-relaxed">{claudeTele.currentTask}</div>
          </div>
        </div>
      )}

      {isClaude && claudeTele?.recentOutput && claudeTele.recentOutput.length > 0 && (
        <div className="mb-3">
          <TypewriterOutput lines={claudeTele.recentOutput} isActive={isWorking} />
        </div>
      )}

      {isTrae && traeTele?.recentActivity && traeTele.recentActivity.length > 0 && (
        <div className="glass-panel-inset p-3 mb-3 relative overflow-hidden">
          <motion.div
            key={`activity-${traeTele.recentActivity.length}`}
            className="absolute inset-0 bg-[#84a59d]/[0.04]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="relative">
            <div className="telemetry-label mb-1">{t('recentActivity', locale)}</div>
            <div className="space-y-0.5">
              {traeTele.recentActivity.slice(-3).map((act, i) => (
                <div key={i} className="telemetry-value text-[10px] text-neutral-500 truncate">{act}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {agent.logs.length > 0 && (
        <div className="glass-panel-inset p-3 relative overflow-hidden">
          <motion.div
            key={`logs-${agent.logs.length}`}
            className="absolute inset-0 bg-[#84a59d]/[0.04]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="relative">
            <div className="telemetry-label mb-1">{t('logsLabel', locale)}</div>
            <div className="space-y-0.5 max-h-20 overflow-y-auto">
              {agent.logs.slice(-5).map((log, i) => (
                <div key={i} className="telemetry-value text-[10px] text-neutral-600 truncate">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function DashboardView() {
  const { agents } = useAgentStore();
  const { locale } = usePreferences();
  const activeAgents = agents.filter(a => a.status !== 'offline' && a.status !== 'unconfigured');
  const workingAgents = agents.filter(a => a.status === 'working');

  return (
    <motion.div
      className="w-full h-full overflow-y-auto p-2 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#84a59d]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[15px] font-semibold text-neutral-300 tracking-wide" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
            {t('dashboard', locale)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="telemetry-value text-[10px] text-neutral-600">{activeAgents.length}/{agents.length} {t('active', locale)}</span>
          {workingAgents.length > 0 && (
            <motion.span
              className="aero-badge text-[#c2b280] bg-[#c2b280]/15"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="w-1 h-1 rounded-full bg-[#c2b280]" />
              {workingAgents.length} {t('working', locale)}
            </motion.span>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {agents.map((agent, i) => (
          <AgentDetailCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
