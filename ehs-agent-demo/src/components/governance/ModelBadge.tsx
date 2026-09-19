import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, MapPin } from 'lucide-react';
import type { FleetModelId } from '@/types';
import { FLEET_MODELS } from '@/data/models';
import { Badge } from '@/components/layout';
import { cn } from '@/lib/cn';
import { model as modelTokens } from '@/styles/tokens';

interface ModelBadgeProps {
  modelId: FleetModelId;
  /** `card` shows name + sovereignty + why inline (the signature motif). `chip` is compact. */
  mode?: 'chip' | 'card';
  /** Lit = this model has fired in the current trace. */
  lit?: boolean;
  /** Extra line under the "why" — e.g. the concrete task in this scenario. */
  task?: string;
  /** Chip popover direction. */
  popover?: 'down' | 'up';
  className?: string;
}

/**
 * Model-routing badge — the app's signature visual motif. Every place a model
 * fires shows: which model, its colour, where inference ran (in-region vs
 * external), and the one-line "why this model" justification.
 */
export function ModelBadge({ modelId, mode = 'chip', lit = true, task, popover = 'down', className }: ModelBadgeProps) {
  const model = FLEET_MODELS[modelId];
  const [open, setOpen] = useState(false);
  const sovereign = model.sovereignty === 'in-region';

  if (mode === 'chip') {
    return (
      <span
        className={cn('relative inline-flex', className)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Badge variant={model.colourToken} dot className={cn(!lit && 'opacity-40 grayscale')}>
          {model.name}
          <span className="ml-0.5 inline-flex items-center gap-0.5 opacity-80">
            {sovereign ? <MapPin className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
            <span className="text-[0.6rem] uppercase">{sovereign ? 'in-region' : 'external'}</span>
          </span>
        </Badge>
        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: popover === 'down' ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: popover === 'down' ? 4 : -4 }}
              transition={{ duration: 0.12 }}
              className={cn(
                'absolute left-0 z-30 w-[280px] rounded-md border border-surface-4 bg-surface-2 p-2.5 shadow-panel',
                popover === 'down' ? 'top-full mt-1' : 'bottom-full mb-1',
              )}
            >
              <WhyBlock modelId={modelId} task={task} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </span>
    );
  }

  return (
    <div
      className={cn(
        'rounded-md border bg-surface-2/80 px-2.5 py-2 transition-all',
        lit ? 'border-surface-4' : 'border-surface-3 opacity-45 grayscale',
        className,
      )}
      style={lit ? { borderLeftColor: modelHex(modelId), borderLeftWidth: 3 } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant={model.colourToken} dot tone={lit ? 'soft' : 'soft'}>
          {model.name}
        </Badge>
        <Badge variant={sovereign ? 'pass' : 'fail'} icon={sovereign ? <MapPin /> : <Globe />}>
          {sovereign ? 'In-region' : 'External'}
        </Badge>
      </div>
      <WhyBlock modelId={modelId} task={task} className="mt-1.5" />
    </div>
  );
}

function WhyBlock({ modelId, task, className }: { modelId: FleetModelId; task?: string; className?: string }) {
  const model = FLEET_MODELS[modelId];
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="text-caption text-fg-2">
        {model.provider} · {model.role}
      </div>
      <div className="text-log leading-snug text-fg-0">
        <span className="text-fg-2">Why this model — </span>
        {model.why}
      </div>
      <div className="text-log leading-snug text-fg-1">
        <span className="text-fg-2">Inference ran — </span>
        {model.inferenceLocation}
      </div>
      {task ? (
        <div className="text-log leading-snug text-fg-1">
          <span className="text-fg-2">This step — </span>
          {task}
        </div>
      ) : null}
    </div>
  );
}

function modelHex(id: FleetModelId): string {
  return modelTokens[FLEET_MODELS[id].colourToken];
}
