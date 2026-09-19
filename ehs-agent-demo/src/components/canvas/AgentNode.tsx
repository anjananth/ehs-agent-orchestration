import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import {
  Bot,
  Database,
  Headset,
  HeartPulse,
  Lock,
  Network,
  Stethoscope,
  Users,
} from 'lucide-react';
import type { Agent, AgentKind, AgentStatus } from '@/types';
import { Badge, type BadgeVariant } from '@/components/layout';
import { cn } from '@/lib/cn';

export interface AgentNodeData {
  agent: Agent;
  status: AgentStatus;
  /** Increments every time this node should pulse once. */
  pulseKey: number;
  selected: boolean;
}

const KIND_ICON: Record<AgentKind, typeof Bot> = {
  orchestrator: Network,
  'system-of-record': Database,
  'patient-facing': HeartPulse,
  'nursing-workforce': Stethoscope,
  'contact-centre': Headset,
  'orchestrated-agent': Bot,
};

/** Governance colour semantics — identical to Badge variants. */
const STATUS_STYLE: Record<
  AgentStatus,
  { border: string; ring: string; badge: BadgeVariant; label: string; icon: string }
> = {
  idle: { border: 'border-surface-4', ring: '', badge: 'neutral', label: 'Idle', icon: 'text-fg-2' },
  active: {
    border: 'border-gov-info',
    ring: 'animate-pulse-ring',
    badge: 'info',
    label: 'Active',
    icon: 'text-gov-info',
  },
  'awaiting-approval': {
    border: 'border-gov-pending',
    ring: 'shadow-[0_0_0_3px_rgba(183,121,31,0.18),0_6px_20px_-8px_rgba(183,121,31,0.5)]',
    badge: 'pending',
    label: 'Awaiting approval',
    icon: 'text-gov-pending',
  },
  complete: {
    border: 'border-gov-pass/70',
    ring: '',
    badge: 'pass',
    label: 'Complete',
    icon: 'text-gov-pass',
  },
  'not-built': {
    border: 'border-dashed border-surface-4',
    ring: '',
    badge: 'neutral',
    label: 'Not built in this demo',
    icon: 'text-fg-3',
  },
};

function AgentNodeComponent({ data }: NodeProps<AgentNodeData>) {
  const { agent, status, pulseKey, selected } = data;
  const isHub = agent.kind === 'orchestrator';
  const isPlaceholder = status === 'not-built';
  const style = STATUS_STYLE[status];
  const Icon = isPlaceholder ? Lock : KIND_ICON[agent.kind];

  if (isPlaceholder) {
    return (
      <>
        <Handle type="target" position={Position.Top} id="t" className="!h-1 !w-1 !border-0 !bg-surface-4" />
        <Handle type="target" position={Position.Bottom} id="bt" className="!opacity-0" />
        <Handle type="target" position={Position.Left} id="l" className="!opacity-0" />
        <Handle type="target" position={Position.Right} id="rt" className="!opacity-0" />
        <div
          title="Scoped on watsonx Orchestrate — not built in this demo"
          className="w-[196px] cursor-default rounded-md border border-dashed border-surface-4 bg-surface-1/70 px-2.5 py-2 opacity-60"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-fg-3" />
            <div className="min-w-0">
              <div className="truncate text-[0.72rem] font-medium leading-tight text-fg-1">{agent.name}</div>
              <div className="truncate text-caption text-fg-3">Not built in this demo</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Four handles so edges can enter/exit from the nearest side. */}
      <Handle type="target" position={Position.Left} id="l" className="!h-1.5 !w-1.5 !border-0 !bg-surface-4" />
      <Handle type="source" position={Position.Right} id="r" className="!h-1.5 !w-1.5 !border-0 !bg-surface-4" />
      <Handle type="target" position={Position.Top} id="t" className="!h-1.5 !w-1.5 !border-0 !bg-surface-4" />
      <Handle type="source" position={Position.Bottom} id="b" className="!h-1.5 !w-1.5 !border-0 !bg-surface-4" />
      {/* Mirror handles so any side can be source or target. */}
      <Handle type="source" position={Position.Left} id="ls" className="!opacity-0" />
      <Handle type="target" position={Position.Right} id="rt" className="!opacity-0" />
      <Handle type="source" position={Position.Top} id="ts" className="!opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bt" className="!opacity-0" />

      <motion.div
        key={pulseKey}
        initial={pulseKey > 0 ? { scale: 1.06 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        title={isPlaceholder ? 'Scoped on watsonx Orchestrate — not built in this demo' : undefined}
        className={cn(
          'relative rounded-card border bg-surface-1 text-left shadow-panel transition-colors duration-300',
          isHub ? 'w-[240px] border-2 px-4 py-3' : 'w-[210px] px-3 py-2.5',
          isHub && status === 'idle' ? 'border-accent/70' : status === 'idle' ? 'border-surface-4' : style.border,
          isHub && status === 'idle' && 'shadow-glow',
          style.ring,
          'cursor-pointer hover:bg-surface-2',
          selected && 'ring-2 ring-accent/40',
        )}
      >
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              'mt-0.5 flex shrink-0 items-center justify-center rounded-md',
              isHub ? 'h-9 w-9 bg-accent/10' : 'h-7 w-7 bg-surface-2',
              isHub && status === 'idle' ? 'text-accent' : style.icon,
            )}
          >
            <Icon className={isHub ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className={cn('font-semibold leading-tight text-fg-0', isHub ? 'text-[0.9rem]' : 'text-[0.8rem]')}>
              {agent.name}
            </div>
            <div className="truncate text-caption text-fg-2">{agent.subtitle}</div>
            {isHub ? (
              <div className="mt-1 flex items-center gap-1 text-caption text-fg-2">
                <Users className="h-3 w-3" /> Governance choke point
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-caption text-fg-3">{agent.vendor}</span>
          <Badge variant={style.badge} dot>
            {style.label}
          </Badge>
        </div>
      </motion.div>
    </>
  );
}

export const AgentNode = memo(AgentNodeComponent);
