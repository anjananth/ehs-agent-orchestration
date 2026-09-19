import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Agent, AgentStatus, DischargeBundle } from '@/types';
import { Badge, Panel, SectionLabel, type BadgeVariant } from '@/components/layout';
import { CaseBundleCard } from './CaseBundleCard';

interface NodeDetailDrawerProps {
  agent: Agent | null;
  status: AgentStatus | null;
  /** Only shown for the Care Continuity Agent. */
  bundle: DischargeBundle;
  /** True while the dose-disclosure policy is tripped — highlights the MedicationRequest. */
  highlightMedication?: boolean;
  onClose: () => void;
}

const STATUS_BADGE: Record<AgentStatus, { variant: BadgeVariant; label: string }> = {
  idle: { variant: 'neutral', label: 'Idle' },
  active: { variant: 'info', label: 'Active' },
  'awaiting-approval': { variant: 'pending', label: 'Awaiting approval' },
  complete: { variant: 'pass', label: 'Complete' },
  'not-built': { variant: 'neutral', label: 'Not built' },
};

/** Slide-in drawer over the right edge of the canvas panel. */
export function NodeDetailDrawer({ agent, status, bundle, highlightMedication, onClose }: NodeDetailDrawerProps) {
  return (
    <AnimatePresence>
      {agent && status ? (
        <motion.div
          key={agent.id}
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="absolute inset-y-3 right-3 z-20 w-[340px]"
        >
          <Panel
            level="raised"
            className="h-full border-surface-4 shadow-panel"
            title={agent.name}
            actions={
              <>
                <Badge variant={STATUS_BADGE[status].variant} dot>
                  {STATUS_BADGE[status].label}
                </Badge>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-6 w-6 items-center justify-center rounded text-fg-2 hover:bg-surface-3 hover:text-fg-0"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <div>
                <SectionLabel className="mb-1">What it is</SectionLabel>
                <p className="text-log leading-relaxed text-fg-1">{agent.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SectionLabel className="mb-1">Vendor</SectionLabel>
                  <div className="text-[0.8rem] text-fg-0">{agent.vendor}</div>
                </div>
                <div>
                  <SectionLabel className="mb-1">Kind</SectionLabel>
                  <div className="text-[0.8rem] text-fg-0">{agent.kind.replace(/-/g, ' ')}</div>
                </div>
              </div>
              {agent.roleInScenario ? (
                <div>
                  <SectionLabel className="mb-1">Role in this scenario</SectionLabel>
                  <p className="text-log leading-relaxed text-fg-1">{agent.roleInScenario}</p>
                </div>
              ) : null}
              {agent.id === 'care-continuity' ? (
                <div>
                  <SectionLabel className="mb-2" trailing="FHIR R4 · Ignite">
                    Case bundle held
                  </SectionLabel>
                  <CaseBundleCard bundle={bundle} highlightMedication={highlightMedication} compact />
                </div>
              ) : null}
            </div>
          </Panel>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
