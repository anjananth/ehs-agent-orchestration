import type { AgentId } from '@/types';

/**
 * Fixed positions for the orchestration graph (reactflow coordinates).
 * Hub-and-spoke: everything connects to the Orchestrator; the three
 * existing EHS agents (Amal / Maitha / Hamda) never connect to each other.
 * The four scoped-but-unbuilt use cases sit in a muted, compact row along
 * the bottom.
 *
 * Kept deliberately tight (~800×400) so fitView lands near 1:1 zoom in the
 * canvas panel on a 1080p projector.
 */
export const NODE_POSITIONS: Record<AgentId, { x: number; y: number }> = {
  orchestrator: { x: 300, y: 118 },
  cerner: { x: 0, y: 20 },
  'care-continuity': { x: 0, y: 190 },
  amal: { x: 610, y: 0 },
  maitha: { x: 610, y: 130 },
  hamda: { x: 610, y: 262 },
  'uc-referral': { x: 0, y: 392 },
  'uc-revenue': { x: 212, y: 392 },
  'uc-encounter': { x: 424, y: 392 },
  'uc-regulatory': { x: 636, y: 392 },
};

/** Static topology — every edge touches the hub. */
export const EDGES: Array<{ id: string; source: AgentId; target: AgentId; label?: string }> = [
  { id: 'cerner-orch', source: 'cerner', target: 'orchestrator', label: 'ADT / FHIR R4' },
  { id: 'orch-cc', source: 'orchestrator', target: 'care-continuity', label: 'invoke' },
  { id: 'orch-amal', source: 'orchestrator', target: 'amal', label: 'patient channel' },
  { id: 'orch-maitha', source: 'orchestrator', target: 'maitha', label: 'nurse queue' },
  { id: 'orch-hamda', source: 'orchestrator', target: 'hamda', label: 'outbound call' },
  { id: 'orch-uc-referral', source: 'orchestrator', target: 'uc-referral' },
  { id: 'orch-uc-revenue', source: 'orchestrator', target: 'uc-revenue' },
  { id: 'orch-uc-encounter', source: 'orchestrator', target: 'uc-encounter' },
  { id: 'orch-uc-regulatory', source: 'orchestrator', target: 'uc-regulatory' },
];
