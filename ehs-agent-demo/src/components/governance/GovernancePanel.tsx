import { useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import type { AuditEvent, FleetModelId, GovernanceCheck, RiskScore } from '@/types';
import { Badge, Panel, SectionLabel } from '@/components/layout';
import { exportAuditTrail } from '@/lib/exportAuditTrail';
import { cn } from '@/lib/cn';
import { AuditFeed } from './AuditFeed';
import { GovernanceChecks } from './GovernanceChecks';
import { ModelRoutingStrip } from './ModelRoutingStrip';

interface GovernancePanelProps {
  caseId: string;
  events: AuditEvent[];
  checks: GovernanceCheck[];
  modelsInvoked: FleetModelId[];
  riskScore: RiskScore | null;
  /** True once the trail is sealed (last step) — lights up the export button. */
  sealed?: boolean;
  className?: string;
}

/**
 * Right panel: audit feed (top, grows), pre-send checks, model routing.
 * Export button is always visible — "can you produce this for a regulator"
 * should never be a hypothetical.
 */
export function GovernancePanel({ caseId, events, checks, modelsInvoked, riskScore, sealed = false, className }: GovernancePanelProps) {
  const [exporting, setExporting] = useState(false);
  const [exportedAt, setExportedAt] = useState<string | null>(null);

  const failCount = checks.filter((c) => c.status === 'fail').length;
  const pendingCount = checks.filter((c) => c.status === 'pending').length;

  async function onExport() {
    setExporting(true);
    try {
      await exportAuditTrail(caseId, events, checks);
      setExportedAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } finally {
      setExporting(false);
    }
  }

  return (
    <Panel
      flush
      className={className}
      title="Governance & audit"
      subtitle="watsonx.governance"
      icon={<ShieldCheck className="h-4 w-4" />}
      actions={
        <>
          {failCount > 0 ? (
            <Badge variant="fail" tone="solid">
              {failCount} blocked
            </Badge>
          ) : pendingCount > 0 ? (
            <Badge variant="pending" dot>
              {pendingCount} pending
            </Badge>
          ) : checks.length > 0 ? (
            <Badge variant="pass" dot>
              checks pass
            </Badge>
          ) : null}
          <button
            type="button"
            onClick={onExport}
            disabled={exporting || events.length === 0}
            title="Download the full audit trail (events + checks + models) as JSON"
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded border px-2 text-caption font-medium transition-colors',
              sealed
                ? 'border-gov-pass/60 bg-gov-pass/15 text-gov-pass hover:bg-gov-pass/25'
                : 'border-surface-4 bg-surface-2 text-fg-1 hover:border-fg-3 hover:text-fg-0',
              'disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            <Download className="h-3 w-3" />
            {exporting ? 'Exporting…' : 'Export audit trail'}
          </button>
        </>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        {/* Audit feed */}
        <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
          <SectionLabel
            className="mb-2"
            trailing={
              <span className="flex items-center gap-2">
                {exportedAt ? <span className="text-gov-pass">exported {exportedAt}</span> : null}
                <span>{events.length} events</span>
              </span>
            }
          >
            Audit trail · case {caseId}
          </SectionLabel>
          <AuditFeed events={events} className="flex-1" />
        </div>

        {/* Checks */}
        <div className="shrink-0 border-t border-surface-3 px-4 py-3">
          <SectionLabel className="mb-2" trailing={checks.length ? 'pre-send checkpoint' : undefined}>
            Policy checks
          </SectionLabel>
          <GovernanceChecks checks={checks} />
        </div>

        {/* Model routing */}
        <div className="max-h-[38%] shrink-0 overflow-y-auto border-t border-surface-3 px-4 py-3">
          <SectionLabel className="mb-2" trailing={`${modelsInvoked.length} of 5 invoked`}>
            Model routing · right-sized fleet
          </SectionLabel>
          <ModelRoutingStrip invoked={modelsInvoked} riskScore={riskScore} />
        </div>
      </div>
    </Panel>
  );
}
