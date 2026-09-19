import type { FleetModel, FleetModelId } from '@/types';

/**
 * Model fleet registry — seeded from reference/agent_fleet.md.
 *
 * Sovereign Arabic: the script says pick Falcon-H1 *or* Jais 2 and use it
 * consistently. This demo uses **Jais 2** (G42 / Inception) throughout.
 *
 * `inferenceLocation` is the sovereignty fact that matters: "UAE-hosted" often
 * describes data at rest, not where the prompt (which contains PHI) is executed.
 */
export const FLEET_MODELS: Record<FleetModelId, FleetModel> = {
  'sovereign-arabic': {
    id: 'sovereign-arabic',
    name: 'Jais 2',
    provider: 'G42 / Inception',
    role: 'Sovereign Arabic dialogue',
    sovereignty: 'in-region',
    inferenceLocation: 'watsonx.ai — UAE region (in-country inference)',
    colourToken: 'sovereignArabic',
    why: 'Gulf-Arabic fluency for patient-facing text; inference stays in-country so PHI never leaves the UAE.',
    useInScenario: 'Drafts the Arabic outreach message and the follow-up confirmation to the patient.',
  },
  granite: {
    id: 'granite',
    name: 'IBM Granite 4.1',
    provider: 'IBM',
    role: 'Structuring, summarisation, RAG',
    sovereignty: 'in-region',
    inferenceLocation: 'watsonx.ai — UAE region (in-country inference)',
    colourToken: 'granite',
    why: 'Small, auditable, indemnified model for structuring clinical records — no need for a frontier model to summarise a care plan.',
    useInScenario: 'Summarises the discharge record and care plan into the outreach brief.',
  },
  medgemma: {
    id: 'medgemma',
    name: 'MedGemma',
    provider: 'Google',
    role: 'Medical imaging',
    sovereignty: 'in-region',
    inferenceLocation: 'watsonx.ai — UAE region (in-country inference)',
    colourToken: 'medgemma',
    why: 'Reserved for imaging tasks; deliberately not invoked for a text-only post-discharge workflow.',
    useInScenario: 'Not invoked in this scenario.',
  },
  'classical-ml': {
    id: 'classical-ml',
    name: 'risk-model-v2',
    provider: 'EHS Data & Statistics (classical ML)',
    role: 'Readmission / no-show risk',
    sovereignty: 'in-region',
    inferenceLocation: 'EHS environment — no PHI leaves the tenant',
    colourToken: 'classicalMl',
    why: 'Deterministic, explainable gradient-boosted model; no generative model needed to compute a risk score.',
    useInScenario: 'Produces the 30-day readmission-risk score that decides whether outreach is escalated.',
  },
  frontier: {
    id: 'frontier',
    name: 'Governed frontier model',
    provider: 'External — via watsonx.ai gateway',
    role: 'Complex clinical reasoning (human-gated)',
    sovereignty: 'external',
    inferenceLocation: 'External region — only reachable with PHI redaction + clinician approval',
    colourToken: 'frontier',
    why: 'Only for reasoning that smaller models cannot handle, and only under explicit approval with PHI stripped.',
    useInScenario: 'Kept available for the nurse escalation path; not exercised in the happy path.',
  },
};

export const FLEET_MODEL_LIST: FleetModel[] = Object.values(FLEET_MODELS);
