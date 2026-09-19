import type { ChatMessage, DraftMessage } from '@/types';

/**
 * PLACEHOLDER ARABIC COPY.
 *
 * The outreach text below is the literal placeholder from
 * reference/scenario_script.md. The other Arabic strings (dose sentence,
 * patient reply, confirmation) are machine-drafted stand-ins so the RTL
 * surface has something to render. ALL of it must be replaced with reviewed
 * Gulf-dialect copy before any real EHS audience sees this demo.
 */

/** Verbatim placeholder from the scenario script — the amended (safe) message. */
export const OUTREACH_AR_PLACEHOLDER =
  'مرحباً فاطمة، نأمل أن تكوني بخير بعد خروجك من المستشفى. هل تتناولين أدويتك بانتظام؟ لديك موعد متابعة يوم [التاريخ].';

export const OUTREACH_EN_GLOSS =
  'Hello Fatima, hope you are well since discharge. Are you taking your medication as prescribed? You have a follow-up appointment on [date].';

/** PLACEHOLDER — the sentence that restates the diuretic dose change and trips the policy. */
const DOSE_SENTENCE_AR = 'تذكري أن جرعة الفوروسيمايد أصبحت 80 ملغ صباحاً بدلاً من 40 ملغ.';
const DOSE_SENTENCE_EN = 'Remember that your furosemide dose is now 80 mg in the morning instead of 40 mg.';

/**
 * The draft as Jais 2 produced it — restates the dose change from the care
 * plan, which is exactly what the "no medication dosage change without
 * clinician sign-off" policy exists to catch.
 */
export const OUTREACH_DRAFT: DraftMessage = {
  id: 'DRAFT-0417-01',
  textAr: `${OUTREACH_AR_PLACEHOLDER} ${DOSE_SENTENCE_AR}`,
  textEn: `${OUTREACH_EN_GLOSS} ${DOSE_SENTENCE_EN}`,
  draftedBy: 'sovereign-arabic',
  containsDoseDetail: true,
  amended: {
    textAr: OUTREACH_AR_PLACEHOLDER,
    textEn: OUTREACH_EN_GLOSS,
  },
};

/** Which part of the draft the policy engine highlights. */
export const FLAGGED_SPAN = { ar: DOSE_SENTENCE_AR, en: DOSE_SENTENCE_EN };

export const CHAT_MESSAGES = {
  outreachApproved: {
    id: 'MSG-0417-01',
    direction: 'outbound',
    textAr: OUTREACH_AR_PLACEHOLDER,
    textEn: OUTREACH_EN_GLOSS,
    draftedBy: 'sovereign-arabic',
    timestamp: '2026-09-14T11:47:05+04:00',
  },
  patientReply: {
    id: 'MSG-0417-02',
    direction: 'inbound',
    // PLACEHOLDER — replace with reviewed Gulf-dialect copy.
    textAr: 'أشعر بدوخة منذ الأمس.',
    textEn: 'I feel dizzy since yesterday.',
    classification: 'clinical-escalation',
    timestamp: '2026-09-15T09:18:40+04:00',
  },
  followUpConfirmation: {
    id: 'MSG-0417-03',
    direction: 'outbound',
    // PLACEHOLDER — replace with reviewed Gulf-dialect copy.
    textAr: 'شكراً فاطمة. سيتصل بك أحد ممرضي القلب خلال 24 ساعة للاطمئنان عليك. إذا ساءت الدوخة، يرجى الاتصال بالطوارئ.',
    textEn:
      'Thank you, Fatima. A cardiology nurse will call you within 24 hours to check on you. If the dizziness gets worse, please call emergency services.',
    draftedBy: 'sovereign-arabic',
    timestamp: '2026-09-15T09:32:10+04:00',
  },
  noReplySystem: {
    id: 'MSG-0417-F1',
    direction: 'system',
    textEn: 'No reply within the 18-hour window. Orchestrator escalated to Hamda for an outbound call.',
    timestamp: '2026-09-15T06:00:00+04:00',
  },
  hamdaCallSystem: {
    id: 'MSG-0417-F2',
    direction: 'system',
    textEn: 'Hamda outbound call placed — patient reached, reports dizziness. Handed to Maitha nurse queue.',
    timestamp: '2026-09-15T09:05:00+04:00',
  },
} satisfies Record<string, ChatMessage>;
