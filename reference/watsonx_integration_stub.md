# Reference: swapping mocks for real watsonx later (second pass, not this pass)

Build this pass so a second pass can wire in real IBM APIs without
restructuring the UI. The key is: **every mocked call goes through an
adapter interface**, and the UI only ever talks to the adapter, never to
mock data or fetch calls directly.

## Adapter interfaces to define (mocked now, real later)

```ts
// src/lib/adapters/types.ts

interface OrchestratorAdapter {
  invokeAgent(agentId: string, context: CaseContext): Promise<AgentResult>;
}

interface GovernanceAdapter {
  runChecks(draft: DraftMessage): Promise<GovernanceCheckResult[]>;
  logEvent(event: AuditEvent): Promise<void>;
  exportAuditTrail(caseId: string): Promise<AuditTrail>;
}

interface SystemOfRecordAdapter {
  getDischargeBundle(patientId: string): Promise<DischargeBundle>;
  createServiceRequest(req: ServiceRequestInput): Promise<ServiceRequest>;
}

interface ModelRouterAdapter {
  route(task: ModelTask): Promise<ModelRoutingDecision>;
}
```

For this pass, implement `MockOrchestratorAdapter`,
`MockGovernanceAdapter`, `MockSystemOfRecordAdapter`, and
`MockModelRouterAdapter` — each returning scripted data from
`reference/scenario_script.md`'s step sequence, on a delay, so the UI has
something to animate against. Wire these behind a single
`src/lib/adapters/index.ts` that exports whichever implementation is active,
so a later `RealWatsonxOrchestratorAdapter` etc. is a drop-in swap.

## What each real integration will eventually be

- **OrchestratorAdapter → watsonx Orchestrate.** Agent invocation, tool
  calls (OpenAPI tools), and the Agentic Control Plane's approval-node
  semantics map onto Orchestrate's skill/agent invocation and its
  human-in-the-loop node type.
- **GovernanceAdapter → watsonx.governance.** Policy checks, PII/PHI
  redaction, audit logging, and audit-trail export map onto governance's
  monitoring, factsheet, and lifecycle-tracking capabilities.
- **SystemOfRecordAdapter → Cerner Millennium via Ignite FHIR R4 APIs**,
  with HL7 v2 ADT/SIU/MDM events as the trigger path and SMART on
  FHIR / OAuth 2.0 as the auth model. `getDischargeBundle` maps onto FHIR
  `Encounter` + `CarePlan` + `MedicationRequest` + `ServiceRequest` reads;
  `createServiceRequest` onto a FHIR write — confirm actual write-scope
  availability on EHS's tenant before assuming this is enabled (this is an
  open discovery question on the account, not a settled fact).
- **ModelRouterAdapter → watsonx.ai model serving** across the fleet in
  `reference/agent_fleet.md`, with the routing decision itself becoming a
  real governance-relevant artifact (which model, why, where it ran) rather
  than a UI badge with no backing call.

## Do not do in this pass

- Do not add real API keys, `.env` wiring for IBM Cloud, or actual fetch
  calls to any watsonx or Cerner endpoint.
- Do not make the mock delay/timing so realistic that it reads as a real
  system — a presenter needs to control pacing (Step mode), not wait on
  simulated network latency.
