import type { AuditEvent, AuditTrail, GovernanceCheck } from '@/types';
import { adapters, ADAPTER_MODE } from '@/lib/adapters';
import { FLEET_MODELS } from '@/data/models';

/**
 * Client-side JSON download of the audit trail for the case. Goes through
 * the GovernanceAdapter so a real watsonx.governance export is a drop-in.
 */
export async function exportAuditTrail(caseId: string, events: AuditEvent[], checks: GovernanceCheck[]): Promise<AuditTrail> {
  // Seed the mock adapter with what the UI currently shows, then export via the interface.
  adapters.governance.replace(events, checks);
  const trail = await adapters.governance.exportAuditTrail(caseId);

  const payload = {
    _disclaimer:
      'SIMULATED DEMO EXPORT — generated from scripted fixture data. No live watsonx, watsonx.governance or Cerner Millennium calls were made.',
    adapterMode: ADAPTER_MODE,
    ...trail,
    modelsInvoked: trail.modelsInvoked.map((id) => {
      const m = FLEET_MODELS[id];
      return { id, name: m.name, provider: m.provider, sovereignty: m.sovereignty, inferenceLocation: m.inferenceLocation, why: m.why };
    }),
    summary: {
      events: trail.events.length,
      humanDecisions: trail.events.filter((e) => e.humanDecision).length,
      policyChecks: trail.checks.length,
      checksFailedAtAnyPoint: trail.events.filter((e) => e.severity === 'fail').length,
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-trail-${caseId}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return trail;
}
