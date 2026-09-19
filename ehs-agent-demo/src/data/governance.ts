import type { GovernanceCheck } from '@/types';

/**
 * Pre-send governance checkpoint (scenario step 6). watsonx.governance runs
 * three checks against the drafted outreach message. The third one trips.
 */
export const PRE_SEND_CHECKS_RUNNING: GovernanceCheck[] = [
  {
    id: 'chk-phi',
    label: 'PII / PHI redaction',
    status: 'pending',
    detail: 'Scanning draft for identifiers beyond the patient’s first name…',
    policyRef: 'EHS-DP-04',
  },
  {
    id: 'chk-region',
    label: 'In-region inference',
    status: 'pending',
    detail: 'Confirming every model in the routing trace executed in-country…',
    policyRef: 'EHS-SOV-01',
  },
  {
    id: 'chk-dose',
    label: 'Medication-dosage disclosure',
    status: 'pending',
    detail: 'Checking for dosage changes communicated without clinician sign-off…',
    policyRef: 'EHS-CLIN-12',
  },
];

export const PRE_SEND_CHECKS_RESULT: GovernanceCheck[] = [
  {
    id: 'chk-phi',
    label: 'PII / PHI redaction',
    status: 'pass',
    detail: 'No MRN, national ID, or address in draft. First name only — permitted for patient-facing channel.',
    policyRef: 'EHS-DP-04',
  },
  {
    id: 'chk-region',
    label: 'In-region inference',
    status: 'pass',
    detail: 'risk-model-v2, Granite 4.1 and Jais 2 all executed in the UAE region. No external inference in trace.',
    policyRef: 'EHS-SOV-01',
  },
  {
    id: 'chk-dose',
    label: 'Medication-dosage disclosure',
    status: 'fail',
    detail:
      'Draft restates furosemide 40 mg → 80 mg from the care plan. Policy: no dosage change is communicated to a patient without clinician sign-off. Routed to approval gate.',
    policyRef: 'EHS-CLIN-12',
  },
];

/** After the approver accepts the amended (dose-detail-removed) message. */
export const PRE_SEND_CHECKS_RESOLVED: GovernanceCheck[] = PRE_SEND_CHECKS_RESULT.map((c) =>
  c.id === 'chk-dose'
    ? {
        ...c,
        status: 'pass',
        detail: 'Amended message approved by clinician via Agentic Control Plane. Dose detail removed; care-plan reference retained.',
      }
    : c,
);
