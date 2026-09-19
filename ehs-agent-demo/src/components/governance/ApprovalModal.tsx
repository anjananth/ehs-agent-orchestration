import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, ClipboardCheck, ShieldAlert, X } from 'lucide-react';
import type { DischargeBundle, DraftMessage, GovernanceCheck, RiskScore } from '@/types';
import { FLAGGED_SPAN } from '@/data/messages';
import { ArabicText } from '@/components/chat/ArabicText';
import { CaseBundleCard } from '@/components/canvas/CaseBundleCard';
import { cn } from '@/lib/cn';

export type ApprovalGate = 'pre-send' | 'nurse-escalation';

interface ApprovalModalProps {
  gate: ApprovalGate | null;
  draft: DraftMessage;
  checks: GovernanceCheck[];
  bundle: DischargeBundle;
  riskScore: RiskScore | null;
  /** Latest patient message (for the nurse gate). */
  patientReplyEn?: string;
  patientReplyAr?: string;
  showGloss: boolean;
  /** True after the presenter clicked Reject — the agent has "re-drafted". */
  rejected?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onAcknowledge: () => void;
}

/**
 * "Agentic Control Plane" — the human-in-the-loop gate. Deliberately styled
 * as a *different* product from the demo chrome: EHS navy header band, white
 * cards on page grey, larger rounded buttons — the approver's / nurse's
 * screen embedded in the demo, not the orchestrator's own UI.
 */
export function ApprovalModal(props: ApprovalModalProps) {
  const { gate } = props;
  return (
    <AnimatePresence>
      {gate ? (
        <motion.div
          key={gate}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-surface-0/70 p-6 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ y: 16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="acp flex max-h-full w-full max-w-[880px] flex-col overflow-hidden rounded-2xl bg-[#f4f6f8] text-[#132336] shadow-[0_30px_80px_-20px_rgba(19,35,54,0.5)]"
          >
            {gate === 'pre-send' ? <PreSendGate {...props} /> : <NurseGate {...props} />}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------

function AcpHeader({ title, subtitle, kicker }: { title: string; subtitle: string; kicker: string }) {
  return (
    // EHS primary-800 band — this is the approver's product, not the orchestrator's chrome.
    <div className="flex items-center gap-3 bg-[#1d344c] px-6 py-4 text-white">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d344c]">
        <ClipboardCheck className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-white/60">{kicker}</div>
        <div className="font-heading text-[1.05rem] font-semibold leading-tight">{title}</div>
        <div className="text-[0.78rem] text-white/75">{subtitle}</div>
      </div>
      <span className="rounded-full bg-[#fdf3dc] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-[#8a5a12]">
        Awaiting human decision
      </span>
    </div>
  );
}

function AcpButton({
  children,
  onClick,
  kind,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  kind: 'primary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-[0.85rem] font-semibold transition-colors',
        kind === 'primary' && 'bg-[#315679] text-white hover:bg-[#274563]',
        kind === 'danger' && 'border border-[#b91c1c]/40 bg-white text-[#b91c1c] hover:bg-[#fdf2f2]',
        kind === 'ghost' && 'text-[#3f4f63] hover:bg-[#eef1f4]',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------

function PreSendGate({ draft, checks, bundle, showGloss, rejected = false, onApprove, onReject }: ApprovalModalProps) {
  const flagged = checks.find((c) => c.status === 'fail');
  const amended = draft.amended!;
  const [before, after] = draft.textAr.split(FLAGGED_SPAN.ar);
  return (
    <>
      <AcpHeader
        kicker="Agentic Control Plane · approval node"
        title={rejected ? 'Re-draft queued — approval still required' : 'Pre-send approval — patient outreach'}
        subtitle={`${bundle.patient.name} · Case ${bundle.encounter.id} · Channel: Amal (Arabic)`}
      />
      {rejected ? (
        <div className="flex items-center gap-2 border-b border-[#f3c4c4] bg-[#fdf2f2] px-6 py-2 text-[0.8rem] text-[#b91c1c]">
          <X className="h-4 w-4" />
          Rejection recorded in the audit trail. Nothing was sent. The agent re-drafted without the dose detail — the amended
          version below still needs a human approval to leave this gate.
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_1fr] gap-0 overflow-auto">
        {/* Left: flagged draft → amended */}
        <div className="flex flex-col gap-4 border-r border-[#dde3e9] p-6">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#b91c1c]">
              <ShieldAlert className="h-3.5 w-3.5" /> Draft as generated — blocked
            </div>
            <div className="rounded-xl border border-[#f3c4c4] bg-white p-4">
              <ArabicText size="lg" className="text-[#132336]">
                {before}
                <mark className="rounded bg-[#fde2e2] px-1 text-[#b91c1c] decoration-[#b91c1c] underline decoration-2 underline-offset-4">
                  {FLAGGED_SPAN.ar}
                </mark>
                {after}
              </ArabicText>
              {showGloss ? (
                <p className="mt-2 border-t border-[#dde3e9] pt-2 text-[0.78rem] italic leading-snug text-[#3f4f63]">
                  {draft.textEn.replace(FLAGGED_SPAN.en, '')}
                  <mark className="rounded bg-[#fde2e2] px-1 not-italic text-[#b91c1c]">{FLAGGED_SPAN.en}</mark>
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#6b7a8c]">
            <div className="h-px flex-1 bg-[#dde3e9]" />
            <ArrowRight className="h-4 w-4" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em]">Amended by policy engine</span>
            <div className="h-px flex-1 bg-[#dde3e9]" />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#27553d]">
              <Check className="h-3.5 w-3.5" /> Amended message — dose detail removed
            </div>
            <div className="rounded-xl border border-[#bedcc7] bg-white p-4">
              <ArabicText size="lg" className="text-[#132336]">
                {amended.textAr}
              </ArabicText>
              {showGloss ? (
                <p className="mt-2 border-t border-[#dde3e9] pt-2 text-[0.78rem] italic leading-snug text-[#3f4f63]">
                  {amended.textEn}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right: policy + evidence */}
        <div className="flex flex-col gap-4 p-6">
          {flagged ? (
            <div className="rounded-xl border border-[#f3c4c4] bg-[#fdf2f2] p-4">
              <div className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#b91c1c]">
                <AlertTriangle className="h-4 w-4" />
                Policy tripped — {flagged.policyRef}
              </div>
              <div className="mt-1 text-[0.9rem] font-semibold">{flagged.label}</div>
              <p className="mt-1 text-[0.8rem] leading-snug text-[#3f4f63]">{flagged.detail}</p>
            </div>
          ) : null}

          <div>
            <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6b7a8c]">Other checks</div>
            <ul className="space-y-1.5">
              {checks
                .filter((c) => c.status !== 'fail')
                .map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[0.8rem]">
                    <span>{c.label}</span>
                    <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-[#27553d]">
                      <Check className="h-3.5 w-3.5" /> Pass
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6b7a8c]">
              Source of the dose detail
            </div>
            <div className="acp-bundle rounded-xl bg-white p-3">
              <CaseBundleCard
                bundle={{ ...bundle, serviceRequests: [] , carePlan: { ...bundle.carePlan, instructions: [] } }}
                highlightMedication
                compact
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#dde3e9] bg-white px-6 py-4">
        <span className="text-[0.75rem] text-[#6b7a8c]">
          Your decision is recorded in the audit trail with your identity and timestamp.
        </span>
        <div className="flex gap-2">
          {!rejected ? (
            <AcpButton kind="danger" onClick={onReject} icon={<X className="h-4 w-4" />}>
              Reject
            </AcpButton>
          ) : null}
          <AcpButton kind="primary" onClick={onApprove} icon={<Check className="h-4 w-4" />}>
            Approve amended message
          </AcpButton>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------

function NurseGate({ bundle, riskScore, patientReplyAr, patientReplyEn, showGloss, onAcknowledge }: ApprovalModalProps) {
  return (
    <>
      <AcpHeader
        kicker="Maitha · cardiology nurse queue"
        title="New — escalated by Care Continuity Agent"
        subtitle={`${bundle.patient.name}, ${bundle.patient.age}${bundle.patient.sex} · ${bundle.encounter.primaryDiagnosis}`}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_1.1fr] overflow-auto">
        <div className="flex flex-col gap-4 border-r border-[#dde3e9] p-6">
          <div>
            <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#b91c1c]">
              Patient reply — classified as clinical escalation
            </div>
            <div className="rounded-xl border border-[#f3c4c4] bg-white p-4">
              {patientReplyAr ? (
                <ArabicText size="lg" className="text-[#132336]">
                  {patientReplyAr}
                </ArabicText>
              ) : null}
              {showGloss || !patientReplyAr ? (
                <p className={cn('text-[0.85rem] text-[#3f4f63]', patientReplyAr && 'mt-2 border-t border-[#dde3e9] pt-2 italic')}>
                  {patientReplyEn}
                </p>
              ) : null}
            </div>
          </div>
          {riskScore ? (
            <div className="rounded-xl bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6b7a8c]">
                  Readmission risk at discharge
                </span>
                <span className="font-mono text-lg font-semibold text-[#b91c1c]">{riskScore.score.toFixed(2)}</span>
              </div>
              <ul className="mt-2 space-y-1 text-[0.78rem] text-[#3f4f63]">
                {riskScore.drivers.map((d) => (
                  <li key={d}>– {d}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-xl border border-[#dde3e9] bg-[#f7f9fb] p-4 text-[0.8rem] leading-snug text-[#3f4f63]">
            <strong>Full trace attached.</strong> Discharge event, care plan, dose change, risk score, the approved outreach
            message and this reply travel with the escalation — not a bare alert.
          </div>
        </div>
        <div className="acp-bundle p-6">
          <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6b7a8c]">Case bundle</div>
          <div className="rounded-xl bg-white p-3">
            <CaseBundleCard bundle={bundle} highlightMedication compact />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#dde3e9] bg-white px-6 py-4">
        <span className="text-[0.75rem] text-[#6b7a8c]">
          Acknowledging creates a FHIR ServiceRequest and confirms back to the patient via Amal.
        </span>
        <AcpButton kind="primary" onClick={onAcknowledge} icon={<Check className="h-4 w-4" />}>
          Nurse acknowledges — schedule urgent follow-up
        </AcpButton>
      </div>
    </>
  );
}
