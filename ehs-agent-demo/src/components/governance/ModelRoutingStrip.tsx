import { AnimatePresence, motion } from 'framer-motion';
import type { FleetModelId, RiskScore } from '@/types';
import { FLEET_MODEL_LIST } from '@/data/models';
import { Badge } from '@/components/layout';
import { cn } from '@/lib/cn';
import { ModelBadge } from './ModelBadge';

interface ModelRoutingStripProps {
  /** Models that have fired in the current trace. */
  invoked: FleetModelId[];
  riskScore: RiskScore | null;
  className?: string;
}

/** Task each model performs in this scenario — shown as the "This step" line. */
const TASK_IN_SCENARIO: Partial<Record<FleetModelId, string>> = {
  'classical-ml': 'Readmission risk 0.72 (high) → outreach escalated to high-risk pathway.',
  granite: 'Discharge record + care plan → 4-line outreach brief.',
  'sovereign-arabic': 'Outreach brief → Arabic patient message (RTL).',
};

/**
 * The right-sizing story. Models that have fired are shown as full cards with
 * sovereignty tag + "why this model". Models that have NOT fired (MedGemma,
 * the frontier model) sit in a dimmed "not invoked" row — which is itself
 * part of the governance argument: the expensive/external model stayed off.
 */
export function ModelRoutingStrip({ invoked, riskScore, className }: ModelRoutingStripProps) {
  const lit = new Set(invoked);
  // Most recently invoked first — the model that just fired sits at the top.
  const litModels = [...invoked].reverse().map((id) => FLEET_MODEL_LIST.find((m) => m.id === id)!);
  const unlitModels = FLEET_MODEL_LIST.filter((m) => !lit.has(m.id));

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {riskScore ? <RiskScoreTile score={riskScore} /> : null}

      <AnimatePresence initial={false}>
        {litModels.map((m) => (
          <motion.div
            key={m.id}
            layout="position"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ModelBadge modelId={m.id} mode="card" lit task={TASK_IN_SCENARIO[m.id]} />
          </motion.div>
        ))}
      </AnimatePresence>

      {unlitModels.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-surface-3 px-2 py-1.5">
          <span className="text-caption text-fg-3">{litModels.length === 0 ? 'Fleet — none invoked yet:' : 'Not invoked:'}</span>
          {unlitModels.map((m) => (
            <ModelBadge key={m.id} modelId={m.id} mode="chip" lit={false} task={m.useInScenario} popover="up" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RiskScoreTile({ score }: { score: RiskScore }) {
  const pct = Math.round(score.score * 100);
  return (
    <div className="rounded-md border border-model-classical-ml/50 bg-surface-2/80 px-2.5 py-2">
      <div className="flex items-center gap-3">
        <span className="text-caption uppercase tracking-[0.08em] text-fg-2">30-day readmission risk</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-model-classical-ml transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-lg font-semibold leading-none text-fg-0">{score.score.toFixed(2)}</span>
        <Badge variant={score.band === 'high' ? 'fail' : score.band === 'moderate' ? 'pending' : 'pass'} tone="solid">
          {score.band.toUpperCase()}
        </Badge>
      </div>
      <div className="mt-1 truncate text-log text-fg-2" title={score.drivers.join(' · ')}>
        {score.drivers.join(' · ')}
      </div>
    </div>
  );
}
