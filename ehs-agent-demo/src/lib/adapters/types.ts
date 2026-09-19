/**
 * Adapter interfaces — from reference/watsonx_integration_stub.md.
 *
 * The UI only ever talks to these interfaces (via `src/lib/adapters/index.ts`).
 * This pass ships mock implementations returning fixture data on a short
 * delay. A later pass swaps in RealWatsonxOrchestratorAdapter et al. without
 * touching UI code.
 */

import type {
  AgentResult,
  AuditEvent,
  AuditTrail,
  CaseContext,
  DischargeBundle,
  DraftMessage,
  GovernanceCheck,
  ModelRoutingDecision,
  ModelTask,
  ServiceRequestInput,
  ServiceRequestItem,
} from '@/types';

/** → watsonx Orchestrate: agent invocation, tool calls, approval-node semantics. */
export interface OrchestratorAdapter {
  invokeAgent(agentId: string, context: CaseContext): Promise<AgentResult>;
}

/** → watsonx.governance: policy checks, PHI redaction, audit logging, export. */
export interface GovernanceAdapter {
  runChecks(draft: DraftMessage): Promise<GovernanceCheck[]>;
  logEvent(event: AuditEvent): Promise<void>;
  exportAuditTrail(caseId: string): Promise<AuditTrail>;
}

/** → Cerner Millennium via Ignite FHIR R4 (SMART on FHIR / OAuth 2.0). */
export interface SystemOfRecordAdapter {
  getDischargeBundle(patientId: string): Promise<DischargeBundle>;
  createServiceRequest(req: ServiceRequestInput): Promise<ServiceRequestItem>;
}

/** → watsonx.ai model serving across the fleet; the routing decision is a governance artifact. */
export interface ModelRouterAdapter {
  route(task: ModelTask): Promise<ModelRoutingDecision>;
}

export interface Adapters {
  orchestrator: OrchestratorAdapter;
  governance: GovernanceAdapter;
  systemOfRecord: SystemOfRecordAdapter;
  modelRouter: ModelRouterAdapter;
}
