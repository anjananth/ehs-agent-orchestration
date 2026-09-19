import type { Agent, AgentId } from '@/types';

/**
 * Agent registry — seeded from reference/agent_fleet.md.
 *
 * The three existing EHS agents (Amal, Maitha, Hamda) are siloed today. They
 * never talk to each other directly on the canvas; every edge goes through the
 * Orchestrator. That topology *is* the pitch.
 */
export const AGENTS: Record<AgentId, Agent> = {
  orchestrator: {
    id: 'orchestrator',
    name: 'Orchestrator',
    subtitle: 'watsonx Orchestrate',
    vendor: 'IBM',
    kind: 'orchestrator',
    status: 'idle',
    description:
      'The single choke point through which every agent call is routed, checked against policy, attributed to a model, and logged. Sits above the existing fleet rather than replacing it.',
    roleInScenario:
      'Receives the discharge event, invokes the Care Continuity Agent, routes drafts through watsonx.governance, and hands off to Amal / Maitha / Hamda.',
  },
  cerner: {
    id: 'cerner',
    name: 'Cerner Millennium',
    subtitle: 'System of record',
    vendor: 'Oracle Health',
    kind: 'system-of-record',
    status: 'idle',
    description:
      'EHS primary system of record. Integration is via Ignite FHIR R4 APIs and an HL7 v2 interface engine (ADT / SIU / MDM events).',
    roleInScenario:
      'Fires the ADT^A03 discharge event that triggers the workflow, and serves the Encounter / CarePlan / MedicationRequest / ServiceRequest bundle.',
  },
  'care-continuity': {
    id: 'care-continuity',
    name: 'Post-Discharge Care Continuity Agent',
    subtitle: 'watsonx Orchestrate agent',
    vendor: 'IBM (built for EHS)',
    kind: 'orchestrated-agent',
    status: 'idle',
    description:
      'One of five prioritised EHS use cases scoped on watsonx Orchestrate. Checks in on discharged patients, scores risk, drafts outreach, and escalates to a human when something looks wrong.',
    roleInScenario:
      'Holds the Fatima Al Mazrouei case bundle for the duration of the journey.',
  },
  amal: {
    id: 'amal',
    name: 'Amal',
    subtitle: 'Patient-facing assistant',
    vendor: 'Boston Health AI',
    kind: 'patient-facing',
    status: 'idle',
    description:
      'Existing EHS patient-facing assistant. The surface the patient sees the outreach message arrive on.',
    roleInScenario: 'Delivers the approved Arabic outreach and receives the patient reply.',
  },
  maitha: {
    id: 'maitha',
    name: 'Maitha',
    subtitle: 'Nursing workforce platform',
    vendor: 'TERN Group',
    kind: 'nursing-workforce',
    status: 'idle',
    description:
      'Existing EHS nursing workforce platform (runs six career-coach agents in production). Treated here as the nurse inbox / queue where human-in-the-loop escalation lands.',
    roleInScenario: 'Receives the escalated symptom flag with the full trace attached; nurse acknowledges and schedules follow-up.',
  },
  hamda: {
    id: 'hamda',
    name: 'Hamda',
    subtitle: 'Contact-centre agent',
    vendor: 'Undisclosed',
    kind: 'contact-centre',
    status: 'idle',
    description:
      'Existing EHS contact-centre agent. Used as the fallback channel when the patient does not respond on Amal within the window.',
    roleInScenario: 'Outbound call attempt if the patient does not reply (fallback path).',
  },
  'uc-referral': {
    id: 'uc-referral',
    name: 'Referral & Care Navigation',
    subtitle: 'Scoped use case',
    vendor: 'IBM (scoped)',
    kind: 'orchestrated-agent',
    status: 'not-built',
    description: 'Scoped on watsonx Orchestrate. Not built in this demo.',
  },
  'uc-revenue': {
    id: 'uc-revenue',
    name: 'Revenue Cycle & Denial Management',
    subtitle: 'Scoped use case',
    vendor: 'IBM (scoped)',
    kind: 'orchestrated-agent',
    status: 'not-built',
    description: 'Scoped on watsonx Orchestrate. Not built in this demo.',
  },
  'uc-encounter': {
    id: 'uc-encounter',
    name: 'Clinical Encounter Completion',
    subtitle: 'Scoped use case',
    vendor: 'IBM (scoped)',
    kind: 'orchestrated-agent',
    status: 'not-built',
    description: 'Scoped on watsonx Orchestrate. Not built in this demo.',
  },
  'uc-regulatory': {
    id: 'uc-regulatory',
    name: 'Regulatory Change & Accreditation Readiness',
    subtitle: 'Scoped use case',
    vendor: 'IBM (scoped)',
    kind: 'orchestrated-agent',
    status: 'not-built',
    description: 'Scoped on watsonx Orchestrate. Not built in this demo.',
  },
};

export const AGENT_LIST: Agent[] = Object.values(AGENTS);

/** Nodes that participate in the scenario (everything except the greyed-out placeholders). */
export const ACTIVE_AGENT_IDS: AgentId[] = ['orchestrator', 'cerner', 'care-continuity', 'amal', 'maitha', 'hamda'];

export const PLACEHOLDER_AGENT_IDS: AgentId[] = ['uc-referral', 'uc-revenue', 'uc-encounter', 'uc-regulatory'];
