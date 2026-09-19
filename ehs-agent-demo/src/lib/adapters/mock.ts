/**
 * Mock adapters — scripted fixture data on a short artificial delay
 * (200–500 ms) so the UI has something to animate against. Deliberately
 * *not* realistic latency: the presenter controls pacing, not the mock.
 *
 * No network calls, no API keys, no IBM/Cerner endpoints — by design.
 */

import type {
  AgentResult,
  AuditEvent,
  AuditTrail,
  CaseContext,
  DischargeBundle,
  DraftMessage,
  FleetModelId,
  GovernanceCheck,
  ModelRoutingDecision,
  ModelTask,
  ServiceRequestInput,
  ServiceRequestItem,
} from '@/types';
import { AGENTS } from '@/data/agents';
import { CASE_BUNDLE, CASE_ID, URGENT_FOLLOW_UP_REQUEST } from '@/data/case';
import { PRE_SEND_CHECKS_RESULT } from '@/data/governance';
import { FLEET_MODELS } from '@/data/models';
import type {
  Adapters,
  GovernanceAdapter,
  ModelRouterAdapter,
  OrchestratorAdapter,
  SystemOfRecordAdapter,
} from './types';

const MIN_DELAY = 200;
const MAX_DELAY = 500;

function delay<T>(value: T, ms = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY)): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function clone<T>(v: T): T {
  return structuredClone(v);
}

// ---------------------------------------------------------------------------

export class MockOrchestratorAdapter implements OrchestratorAdapter {
  async invokeAgent(agentId: string, context: CaseContext): Promise<AgentResult> {
    const agent = AGENTS[agentId as keyof typeof AGENTS];
    return delay({
      agentId: agent?.id ?? 'care-continuity',
      status: 'invoked',
      summary: `${agent?.name ?? agentId} invoked for case ${context.caseId} (trigger ${context.triggerEvent}).`,
    });
  }
}

// ---------------------------------------------------------------------------

export class MockGovernanceAdapter implements GovernanceAdapter {
  /** In-memory log so exportAuditTrail returns what the UI has logged. */
  private events: AuditEvent[] = [];
  private checks: GovernanceCheck[] = [];

  async runChecks(draft: DraftMessage): Promise<GovernanceCheck[]> {
    // The scripted result assumes the draft contains dose detail. If a caller
    // passes an amended draft, report the dose check as passed.
    const result = PRE_SEND_CHECKS_RESULT.map((c) =>
      c.id === 'chk-dose' && !draft.containsDoseDetail
        ? { ...c, status: 'pass' as const, detail: 'No dosage change present in message.' }
        : c,
    );
    this.checks = result;
    return delay(clone(result), 450);
  }

  async logEvent(event: AuditEvent): Promise<void> {
    if (!this.events.some((e) => e.id === event.id)) this.events.push(clone(event));
    return delay(undefined, 50);
  }

  async exportAuditTrail(caseId: string): Promise<AuditTrail> {
    const modelsInvoked = Array.from(
      new Set(this.events.map((e) => e.relatedModel).filter((m): m is FleetModelId => Boolean(m))),
    );
    return delay(
      {
        caseId,
        patientId: CASE_BUNDLE.patient.id,
        exportedAt: new Date().toISOString(),
        events: clone(this.events),
        checks: clone(this.checks),
        modelsInvoked,
      },
      300,
    );
  }

  /** Test/reset hook — lets the store reset the mock without recreating adapters. */
  reset(): void {
    this.events = [];
    this.checks = [];
  }

  /** Lets the playback store seed the log from fold-derived state. */
  replace(events: AuditEvent[], checks: GovernanceCheck[]): void {
    this.events = clone(events);
    this.checks = clone(checks);
  }
}

// ---------------------------------------------------------------------------

export class MockSystemOfRecordAdapter implements SystemOfRecordAdapter {
  async getDischargeBundle(patientId: string): Promise<DischargeBundle> {
    if (patientId !== CASE_BUNDLE.patient.id) {
      throw new Error(`Mock SoR: unknown patient ${patientId}`);
    }
    return delay(clone(CASE_BUNDLE));
  }

  async createServiceRequest(req: ServiceRequestInput): Promise<ServiceRequestItem> {
    // Returns the pre-baked urgent follow-up, stamped with the caller's fields.
    return delay({
      ...clone(URGENT_FOLLOW_UP_REQUEST),
      code: req.code,
      display: req.display,
      specialty: req.specialty,
      priority: req.priority,
      dueWithin: req.dueWithin,
      requestedBy: req.requestedBy,
    });
  }
}

// ---------------------------------------------------------------------------

/** Scripted right-sizing table — the routing logic the demo narrates. */
const ROUTING_TABLE: Record<ModelTask['kind'], FleetModelId> = {
  'risk-scoring': 'classical-ml',
  summarisation: 'granite',
  'patient-dialogue': 'sovereign-arabic',
  'symptom-classification': 'classical-ml',
  'clinical-reasoning': 'frontier',
};

export class MockModelRouterAdapter implements ModelRouterAdapter {
  async route(task: ModelTask): Promise<ModelRoutingDecision> {
    const model = FLEET_MODELS[ROUTING_TABLE[task.kind]];
    return delay({
      task: task.kind,
      modelId: model.id,
      why: model.why,
      sovereignty: model.sovereignty,
      inferenceLocation: model.inferenceLocation,
    });
  }
}

// ---------------------------------------------------------------------------

export function createMockAdapters(): Adapters & { governance: MockGovernanceAdapter } {
  return {
    orchestrator: new MockOrchestratorAdapter(),
    governance: new MockGovernanceAdapter(),
    systemOfRecord: new MockSystemOfRecordAdapter(),
    modelRouter: new MockModelRouterAdapter(),
  };
}

export { CASE_ID as MOCK_CASE_ID };
