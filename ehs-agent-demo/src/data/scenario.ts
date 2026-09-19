import type { AuditEvent, ScenarioStep } from '@/types';
import { URGENT_FOLLOW_UP_REQUEST } from './case';
import { PRE_SEND_CHECKS_RESOLVED, PRE_SEND_CHECKS_RESULT } from './governance';
import { CHAT_MESSAGES } from './messages';

/**
 * The scripted scenario from reference/scenario_script.md, as 12 main steps
 * plus a 2-step fallback branch (patient doesn't reply → Hamda).
 *
 * Each step declares *effects* on the three panels rather than imperative
 * code, so the playback store (prompt 06) can fold effects from step 0..n
 * to derive the full UI state for any step — which makes Step Back and Reset
 * trivial and deterministic.
 */

// --- Timestamps -----------------------------------------------------------
// Day 1: discharge 11:40:12. Day 2: patient replies 09:18:40.
const D1 = '2026-09-14T11:';
const D2 = '2026-09-15T';
const ts1 = (mmss: string) => `${D1}${mmss}+04:00`;
const ts2 = (hhmmss: string) => `${D2}${hhmmss}+04:00`;

let seq = 0;
const ev = (e: Omit<AuditEvent, 'id'>): AuditEvent => ({ id: `AE-${String(++seq).padStart(3, '0')}`, ...e });

// --- Main path ------------------------------------------------------------

export const SCENARIO_STEPS: ScenarioStep[] = [
  {
    id: 'discharge-trigger',
    order: 1,
    title: 'Discharge trigger',
    description:
      'Cerner Millennium fires an ADT^A03 discharge event for Fatima Al Mazrouei. Nothing has been decided yet — this is just the system of record telling the orchestration layer that something happened.',
    durationMs: 3200,
    canvasEffect: {
      nodeStatus: { cerner: 'active' },
      activeEdges: [['cerner', 'orchestrator']],
      pulse: 'cerner',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts1('40:12'),
          actor: 'Cerner Millennium',
          action: 'ADT^A03 discharge event',
          detail: 'Encounter ENC-2026-0914-0417 discharged — Cardiology, disposition: home. HL7 v2 via interface engine.',
          severity: 'info',
        }),
      ],
    },
  },
  {
    id: 'orchestrator-invokes',
    order: 2,
    title: 'Orchestrator invokes the agent',
    description:
      'watsonx Orchestrate receives the event and spins up the Post-Discharge Care Continuity Agent. Every subsequent action by that agent goes back through this hub — there is no side channel.',
    durationMs: 3200,
    canvasEffect: {
      nodeStatus: { cerner: 'complete', orchestrator: 'active', 'care-continuity': 'active' },
      activeEdges: [['orchestrator', 'care-continuity']],
      pulse: 'orchestrator',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts1('40:13'),
          actor: 'Orchestrator',
          action: 'Event received — ADT A03 — Care Continuity Agent invoked',
          detail: 'Case CC-2026-09-14-0417 opened. Policy bundle EHS-POSTDISCHARGE-v3 attached to the run.',
          severity: 'info',
        }),
      ],
    },
  },
  {
    id: 'record-retrieval',
    order: 3,
    title: 'Record retrieval',
    description:
      'The agent pulls the discharge summary and care plan from Cerner via Ignite FHIR R4: the Encounter, the CarePlan, a MedicationRequest for a diuretic dose adjustment, and a ServiceRequest for a 7-day cardiology follow-up.',
    durationMs: 3600,
    canvasEffect: {
      activeEdges: [
        ['orchestrator', 'cerner'],
        ['orchestrator', 'care-continuity'],
      ],
      pulse: 'care-continuity',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts1('40:15'),
          actor: 'Care Continuity Agent',
          action: 'Discharge bundle retrieved',
          detail: 'FHIR R4 read: Encounter, CarePlan, MedicationRequest ×1 (furosemide 40→80 mg), ServiceRequest ×1 (cardiology, 7 days). Scope: patient/*.read.',
          severity: 'info',
        }),
      ],
    },
  },
  {
    id: 'risk-scoring',
    order: 4,
    title: 'Risk scoring',
    description:
      'A classical ML model — not a language model — computes a 30-day readmission risk of 0.72 (high). The routing decision is itself logged: which model, why, and that no PHI left the EHS environment.',
    durationMs: 3600,
    canvasEffect: { pulse: 'care-continuity' },
    governanceEffect: {
      modelsInvoked: ['classical-ml'],
      riskScore: {
        modelId: 'classical-ml',
        modelVersion: 'risk-model-v2',
        score: 0.72,
        band: 'high',
        drivers: [
          'Heart-failure diagnosis with diuretic dose change at discharge',
          'Age 58, prior cardiology admission in last 12 months',
          'Discharged to home without home-care service',
        ],
      },
      appendEvents: [
        ev({
          timestamp: ts1('40:17'),
          actor: 'Model router',
          action: 'risk-model-v2 (classical ML) — no PHI leaves environment',
          detail: 'Task: readmission risk. Routed to classical ML: deterministic, explainable, runs inside EHS tenant. Score 0.72 — HIGH.',
          severity: 'info',
          relatedModel: 'classical-ml',
        }),
      ],
    },
  },
  {
    id: 'outreach-drafted',
    order: 5,
    title: 'Outreach drafted',
    description:
      'Two models, each right-sized: IBM Granite 4.1 summarises the record into an outreach brief; Jais 2 — a sovereign Arabic model running in-country — drafts the actual patient-facing message.',
    durationMs: 4200,
    canvasEffect: { pulse: 'care-continuity' },
    governanceEffect: {
      modelsInvoked: ['classical-ml', 'granite', 'sovereign-arabic'],
      appendEvents: [
        ev({
          timestamp: ts1('40:19'),
          actor: 'Model router',
          action: 'Granite 4.1 — summarise care plan into outreach brief',
          detail: 'Task: structuring / summarisation. In-region inference (watsonx.ai, UAE). Output: 4-line brief incl. meds, follow-up date, red-flag symptoms.',
          severity: 'info',
          relatedModel: 'granite',
        }),
        ev({
          timestamp: ts1('40:22'),
          actor: 'Model router',
          action: 'Jais 2 — draft Arabic patient outreach',
          detail: 'Task: patient dialogue (ar). Routed to sovereign Arabic model; in-country inference. Draft: 3 sentences, 1 question, follow-up date.',
          severity: 'info',
          relatedModel: 'sovereign-arabic',
        }),
      ],
    },
  },
  {
    id: 'governance-checkpoint',
    order: 6,
    title: 'Governance checkpoint — before send',
    description:
      'watsonx.governance intercepts the draft before it reaches the patient. PHI redaction: pass. In-region inference: pass. Medication-dosage disclosure: FLAGGED — the draft restates the furosemide dose change, which requires clinician sign-off.',
    durationMs: 5200,
    canvasEffect: {
      nodeStatus: { 'care-continuity': 'awaiting-approval' },
      activeEdges: [],
      pulse: 'orchestrator',
    },
    governanceEffect: {
      checks: PRE_SEND_CHECKS_RESULT,
      appendEvents: [
        ev({
          timestamp: ts1('40:24'),
          actor: 'watsonx.governance',
          action: 'Pre-send checkpoint — 3 policy checks',
          detail: 'EHS-DP-04 PII/PHI redaction: PASS. EHS-SOV-01 in-region inference: PASS.',
          severity: 'pass',
        }),
        ev({
          timestamp: ts1('40:24'),
          actor: 'watsonx.governance',
          action: 'EHS-CLIN-12 flagged — dosage change in patient message',
          detail: 'Draft restates furosemide 40 mg → 80 mg. No clinician sign-off on record for patient communication. Send BLOCKED; routed to approval gate.',
          severity: 'fail',
        }),
      ],
    },
  },
  {
    id: 'human-approval',
    order: 7,
    title: 'Human-in-the-loop approval',
    description:
      'The flagged draft goes to a pre-send approval gate on the Agentic Control Plane — not silently to a downstream queue. A clinician sees the exact policy that tripped and an amended, dose-detail-removed version. Nothing reaches the patient until a human decides.',
    durationMs: 4000,
    requiresHuman: 'approve-message',
    canvasEffect: {
      nodeStatus: { orchestrator: 'awaiting-approval' },
      activeEdges: [],
    },
    governanceEffect: {
      openApproval: 'pre-send',
      appendEvents: [
        ev({
          timestamp: ts1('40:25'),
          actor: 'Agentic Control Plane',
          action: 'Draft routed to approval gate — awaiting clinician',
          detail: 'Approval node: pre-send. Options: approve amended message / reject. Original + amended drafts attached with policy citation.',
          severity: 'pending',
        }),
      ],
    },
    onReject: {
      governanceEffect: {
        appendEvents: [
          ev({
            timestamp: ts1('44:10'),
            actor: 'Agentic Control Plane',
            action: 'Draft rejected by clinician — returned for re-draft',
            detail: 'Human decision recorded. Nothing sent to patient. Agent re-drafted with dose detail removed; amended version re-queued at the same gate.',
            severity: 'fail',
            humanDecision: 'rejected',
          }),
        ],
      },
    },
    onResolve: {
      canvasEffect: {
        nodeStatus: { orchestrator: 'active', 'care-continuity': 'active' },
      },
      governanceEffect: {
        checks: PRE_SEND_CHECKS_RESOLVED,
        appendEvents: [
          ev({
            timestamp: ts1('46:58'),
            actor: 'Agentic Control Plane',
            action: 'Amended message approved by clinician',
            detail: 'Human decision recorded. Dose detail removed; care-plan reference retained. EHS-CLIN-12 now satisfied. Approver identity captured in audit record.',
            severity: 'pass',
            humanDecision: 'approved',
          }),
        ],
      },
    },
  },
  {
    id: 'message-sent',
    order: 8,
    title: 'Message sent to patient via Amal',
    description:
      'The approved message is delivered through Amal, the patient-facing assistant EHS already has, in Arabic. Amal did not decide what to send — it is the channel, and the orchestrator holds the record of why this text was allowed.',
    durationMs: 4200,
    canvasEffect: {
      nodeStatus: { amal: 'active' },
      activeEdges: [['orchestrator', 'amal']],
      pulse: 'amal',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts1('47:05'),
          actor: 'Amal',
          action: 'Approved message delivered to patient',
          detail: 'Channel: Amal (Boston Health AI). Language: ar, RTL. Message ID MSG-0417-01. Delivery receipt logged.',
          severity: 'info',
        }),
      ],
    },
    chatEffect: {
      typing: 'amal',
      appendMessages: [CHAT_MESSAGES.outreachApproved],
    },
  },
  {
    id: 'patient-reply',
    order: 9,
    title: 'Patient reply — symptom flag',
    description:
      'Next morning the patient replies: "I feel dizzy since yesterday." A lightweight symptom classifier tags this as a clinical escalation trigger rather than a routine reply. This is the moment a siloed chatbot would have simply answered.',
    durationMs: 4200,
    branch: 'main',
    canvasEffect: {
      nodeStatus: { amal: 'active', 'care-continuity': 'active' },
      activeEdges: [['amal', 'orchestrator']],
      pulse: 'amal',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts2('09:18:40'),
          actor: 'Patient',
          action: 'Reply received via Amal',
          detail: 'Message ID MSG-0417-02, language: ar. Forwarded to orchestrator for classification — Amal does not act on clinical content.',
          severity: 'info',
        }),
        ev({
          timestamp: ts2('09:18:41'),
          actor: 'Model router',
          action: 'symptom-classifier-v1 (classical) — CLINICAL ESCALATION',
          detail: 'Task: symptom classification. Lightweight in-tenant classifier; no generative model, no PHI egress. Label: dizziness post diuretic change → escalate.',
          severity: 'pending',
          relatedModel: 'classical-ml',
        }),
      ],
    },
    chatEffect: {
      typing: 'patient',
      appendMessages: [CHAT_MESSAGES.patientReply],
    },
  },
  {
    id: 'escalate-maitha',
    order: 10,
    title: 'Escalation to Maitha (human-in-the-loop)',
    description:
      'The orchestrator routes the flagged reply to a nurse queue on Maitha — with the entire trace attached, not a bare alert. The nurse sees the discharge, the dose change, the risk score, the message that was approved, and the reply.',
    durationMs: 4200,
    canvasEffect: {
      nodeStatus: { amal: 'complete', maitha: 'awaiting-approval' },
      activeEdges: [['orchestrator', 'maitha']],
      pulse: 'maitha',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts2('09:18:43'),
          actor: 'Orchestrator',
          action: 'Escalated to Maitha nurse queue — full trace attached',
          detail: 'Queue: cardiology nursing. Payload: case bundle + risk score + approved message + reply + 12 audit events. SLA: 30 min acknowledgement.',
          severity: 'pending',
        }),
      ],
    },
  },
  {
    id: 'nurse-resolves',
    order: 11,
    title: 'Nurse resolves',
    description:
      'A nurse acknowledges the escalation and schedules an urgent follow-up. The agent turns that decision into a FHIR ServiceRequest, confirms it back to the patient via Amal, and the canvas returns to idle.',
    durationMs: 4200,
    requiresHuman: 'nurse-acknowledge',
    canvasEffect: {
      nodeStatus: { maitha: 'awaiting-approval' },
      activeEdges: [],
    },
    governanceEffect: {
      openApproval: 'nurse-escalation',
    },
    onResolve: {
      canvasEffect: {
        nodeStatus: { maitha: 'complete', amal: 'complete', 'care-continuity': 'complete', orchestrator: 'active' },
        activeEdges: [
          ['orchestrator', 'cerner'],
          ['orchestrator', 'amal'],
        ],
        pulse: 'amal',
      },
      governanceEffect: {
        appendEvents: [
          ev({
            timestamp: ts2('09:31:02'),
            actor: 'Nurse — Maitha queue',
            action: 'Escalation acknowledged — schedule urgent follow-up',
            detail: 'Human decision recorded. Instruction: 24-hour nurse call; hold dose review for cardiologist.',
            severity: 'pass',
            humanDecision: 'acknowledged',
          }),
          ev({
            timestamp: ts2('09:31:05'),
            actor: 'Care Continuity Agent',
            action: 'ServiceRequest created — urgent 24 h follow-up call',
            detail: 'FHIR R4 write: ServiceRequest SR-2026-0915-0417-02, priority urgent, requester = agent on nurse authority. Write scope confirmation pending on EHS tenant.',
            severity: 'info',
          }),
          ev({
            timestamp: ts2('09:32:10'),
            actor: 'Amal',
            action: 'Follow-up confirmation delivered to patient',
            detail: 'Message ID MSG-0417-03, drafted by Jais 2 (in-country), contains no dosage detail. Pre-send checks: 3/3 PASS.',
            severity: 'pass',
            relatedModel: 'sovereign-arabic',
          }),
        ],
      },
      chatEffect: {
        typing: 'amal',
        appendMessages: [CHAT_MESSAGES.followUpConfirmation],
      },
      bundleEffect: { addServiceRequest: URGENT_FOLLOW_UP_REQUEST },
    },
  },
  {
    id: 'audit-complete',
    order: 12,
    title: 'Audit trail complete',
    description:
      'The full, timestamped trace of the journey — every model invoked and why, every policy check, every human decision — is sealed and exportable. This is the artifact that answers "how would we ever audit an AI agent fleet?"',
    durationMs: 6000,
    canvasEffect: {
      nodeStatus: {
        orchestrator: 'complete',
        cerner: 'complete',
        'care-continuity': 'complete',
        amal: 'complete',
        maitha: 'complete',
      },
      activeEdges: [],
      pulse: 'orchestrator',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts2('09:32:12'),
          actor: 'watsonx.governance',
          action: 'Audit trail sealed — case closed',
          detail: 'Trace covers 2 human decisions, 3 policy checks, 3 model invocations (all in-region). Export available in JSON for regulator review.',
          severity: 'pass',
        }),
      ],
    },
  },
];

// --- Fallback branch (replaces step 9 when the presenter triggers it) -------

export const FALLBACK_STEPS: ScenarioStep[] = [
  {
    id: 'no-reply-window',
    order: 9,
    title: 'No reply — window expired',
    description:
      'The patient has not replied within the simulated 18-hour window. Instead of waiting indefinitely, the orchestrator escalates to Hamda, the contact-centre agent, for an outbound call attempt.',
    durationMs: 4000,
    branch: 'fallback',
    canvasEffect: {
      nodeStatus: { amal: 'complete', hamda: 'active' },
      activeEdges: [['orchestrator', 'hamda']],
      pulse: 'hamda',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts2('06:00:00'),
          actor: 'Orchestrator',
          action: 'Reply window expired — escalating to Hamda',
          detail: 'No inbound on Amal within 18 h. Policy EHS-POSTDISCHARGE-v3 §4: high-risk patients get an outbound call attempt before the 24 h mark.',
          severity: 'pending',
        }),
      ],
    },
    chatEffect: {
      appendMessages: [CHAT_MESSAGES.noReplySystem],
    },
  },
  {
    id: 'hamda-call',
    order: 9,
    title: 'Hamda outbound call',
    description:
      'Hamda places the call. The patient is reached and reports dizziness. Hamda does not triage — it hands the outcome back to the orchestrator, which routes it to the nurse queue exactly as a chat reply would have been.',
    durationMs: 4000,
    branch: 'fallback',
    canvasEffect: {
      nodeStatus: { hamda: 'complete' },
      activeEdges: [['hamda', 'orchestrator']],
      pulse: 'orchestrator',
    },
    governanceEffect: {
      appendEvents: [
        ev({
          timestamp: ts2('09:05:00'),
          actor: 'Hamda',
          action: 'Outbound call completed — patient reports dizziness',
          detail: 'Call outcome captured as structured note. No clinical advice given by Hamda. Handed back to orchestrator for classification.',
          severity: 'info',
        }),
        ev({
          timestamp: ts2('09:05:02'),
          actor: 'Model router',
          action: 'symptom-classifier-v1 (classical) — CLINICAL ESCALATION',
          detail: 'Task: symptom classification on call note. In-tenant classifier; no PHI egress. Label: dizziness post diuretic change → escalate.',
          severity: 'pending',
          relatedModel: 'classical-ml',
        }),
      ],
    },
    chatEffect: {
      appendMessages: [CHAT_MESSAGES.hamdaCallSystem],
    },
  },
];

/** Index (in SCENARIO_STEPS) of the step the fallback branch replaces. */
export const FALLBACK_REPLACES_INDEX = SCENARIO_STEPS.findIndex((s) => s.id === 'patient-reply');
