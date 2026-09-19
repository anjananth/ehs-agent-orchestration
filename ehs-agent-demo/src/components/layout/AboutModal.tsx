import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { Badge } from './Badge';
import { ADAPTER_MODE } from '@/lib/adapters';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Plain-language disclosure so nobody in the room assumes they are watching a
 * live system. Reachable from the header at any time.
 */
export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/80 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px] rounded-xl border border-surface-4 bg-surface-1 shadow-panel"
          >
            <div className="flex items-center gap-3 border-b border-surface-3 px-5 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Info className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-[0.95rem] font-semibold text-fg-0">About this demo</div>
                <div className="text-caption text-fg-2">Simulated first pass — read before presenting</div>
              </div>
              <Badge variant="pending" tone="solid">
                Adapter mode: {ADAPTER_MODE}
              </Badge>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded text-fg-2 hover:bg-surface-3 hover:text-fg-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-5 py-4 text-[0.85rem] leading-relaxed text-fg-1">
              <p>
                <strong className="text-fg-0">This is a simulation.</strong> No live calls are made to watsonx Orchestrate,
                watsonx.governance, watsonx.ai, or Cerner Millennium. Every agent response, governance check, model-routing
                decision, FHIR resource and audit event on screen is scripted fixture data played back under presenter
                control.
              </p>
              <p>
                <strong className="text-fg-0">What it is for.</strong> To show the <em>shape</em> of an orchestration and
                governance layer sitting above EHS&apos;s existing, siloed agents (Amal, Maitha, Hamda): one routing choke
                point, in-country inference for anything carrying patient data, a human gate before anything reaches a
                patient, and an audit trail a regulator could read — using the Post-Discharge Care Continuity workflow as
                the walk-through.
              </p>
              <p>
                <strong className="text-fg-0">What it is not.</strong> Not a claim about API connectivity, latency, or model
                accuracy. The model names reflect the intended fleet; the routing table is illustrative. Write access to
                Cerner (creating a ServiceRequest) is an open discovery question, not a settled capability.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-log text-fg-2">
                <li>Patient &ldquo;Fatima Al Mazrouei&rdquo; is fictional. No real identifiers are used anywhere.</li>
                <li>Arabic copy is a placeholder pending native Gulf-dialect review.</li>
                <li>Palette and typography follow ehs.gov.ae; the EHS wordmark is a text placeholder pending logo files.</li>
                <li>
                  Mocked calls sit behind adapter interfaces (<code className="font-mono text-[0.75rem]">src/lib/adapters</code>)
                  so real integrations are a drop-in swap in a later pass.
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
