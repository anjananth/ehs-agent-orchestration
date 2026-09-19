import type { DischargeBundle, RiskScore, ServiceRequestItem } from '@/types';

/**
 * The single case the demo plays back. Fictional patient — see
 * reference/scenario_script.md. No real identifiers anywhere.
 *
 * Timeline (Gulf Standard Time, UTC+4):
 *   2026-09-14 11:40  discharge (ADT^A03) → agent runs within seconds
 *   2026-09-15 09:18  patient replies next morning ("dizzy since yesterday")
 */
export const CASE_ID = 'CC-2026-09-14-0417';

export const DISCHARGE_TIME = '2026-09-14T11:40:12+04:00';

export const CASE_BUNDLE: DischargeBundle = {
  patient: {
    id: 'PT-DEMO-58F-0417', // fictional — not an MRN
    name: 'Fatima Al Mazrouei',
    nameArabic: 'فاطمة المزروعي',
    age: 58,
    sex: 'F',
    preferredLanguage: 'ar',
  },
  encounter: {
    id: 'ENC-2026-0914-0417',
    patientId: 'PT-DEMO-58F-0417',
    class: 'inpatient',
    specialty: 'Cardiology',
    facility: 'EHS — Cardiology ward (demo)',
    admitted: '2026-09-10',
    discharged: DISCHARGE_TIME,
    dischargeDisposition: 'Home, self-care with community follow-up',
    primaryDiagnosis: 'Heart-failure exacerbation (mild), stabilised',
    triggerEvent: 'ADT^A03',
  },
  carePlan: {
    id: 'CP-2026-0914-0417',
    encounterId: 'ENC-2026-0914-0417',
    title: 'Post-discharge heart-failure care plan',
    goals: [
      'Avoid 30-day readmission',
      'Maintain euvolaemia on adjusted diuretic dose',
      'Cardiology follow-up within 7 days',
    ],
    instructions: [
      'Daily morning weight; report gain > 2 kg in 3 days',
      'Fluid restriction 1.5 L/day; low-sodium diet',
      'Take medications as prescribed; do not adjust doses without clinician advice',
      'Report dizziness, breathlessness or ankle swelling',
    ],
  },
  medicationRequests: [
    {
      id: 'MR-2026-0914-0417-01',
      medication: 'Furosemide',
      previousDose: '40 mg',
      newDose: '80 mg',
      route: 'oral',
      frequency: 'once daily, morning',
      reason: 'Dose increased during admission for fluid overload; to be reviewed at 7-day follow-up',
      status: 'active',
    },
  ],
  serviceRequests: [
    {
      id: 'SR-2026-0914-0417-01',
      code: '390906007',
      display: 'Cardiology follow-up appointment',
      specialty: 'Cardiology',
      priority: 'routine',
      dueWithin: 'within 7 days',
      scheduledFor: '2026-09-21',
      requestedBy: 'Discharging cardiologist',
      status: 'active',
    },
  ],
};

/** ServiceRequest the agent generates after the nurse acknowledges (step 11). */
export const URGENT_FOLLOW_UP_REQUEST: ServiceRequestItem = {
  id: 'SR-2026-0915-0417-02',
  code: '185389009',
  display: 'Urgent nurse follow-up call — dizziness post diuretic adjustment',
  specialty: 'Cardiology nursing',
  priority: 'urgent',
  dueWithin: 'within 24 hours',
  scheduledFor: '2026-09-15',
  requestedBy: 'Care Continuity Agent (nurse-acknowledged)',
  status: 'active',
  createdByAgent: true,
};

export const RISK_SCORE: RiskScore = {
  modelId: 'classical-ml',
  modelVersion: 'risk-model-v2',
  score: 0.72,
  band: 'high',
  drivers: [
    'Heart-failure diagnosis with diuretic dose change at discharge',
    'Age 58, prior cardiology admission in last 12 months',
    'Discharged to home without home-care service',
  ],
};
