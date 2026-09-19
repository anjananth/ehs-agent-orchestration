# Reference: the scripted scenario — patient post-discharge journey

This is the single scenario the demo plays back, step by step, under
presenter control (Play / Pause / Step / Reset). It should run in roughly
60–90 seconds at normal speed, with a Step mode for narrating slowly to a
room.

**Patient (fictional):** Fatima Al Mazrouei, 58, discharged after a
cardiology admission (mild heart-failure exacerbation, stabilised).
Fictional name/case only — do not use a real patient identifier anywhere.

## Step-by-step

1. **Discharge trigger.** Cerner Millennium fires an ADT A03 discharge
   event (mocked). Orchestration canvas: Cerner Millennium node pulses,
   edge animates toward the Orchestrator (watsonx Orchestrate) hub.

2. **Orchestrator invokes the agent.** The Orchestrator node activates and
   spins up the Post-Discharge Care Continuity Agent node. Governance
   panel logs: `Event received — ADT A03 — Care Continuity Agent invoked`.

3. **Record retrieval.** The agent pulls the discharge summary and care
   plan (mock FHIR-lite resources: `Encounter`, `CarePlan`,
   `MedicationRequest` for a diuretic dose adjustment, `ServiceRequest` for
   a 7-day cardiology follow-up). Show these as a small readable card, not
   raw JSON — this is a business audience.

4. **Risk scoring.** A classical-ML model badge fires: readmission risk
   score **0.72 (high)**. Governance panel logs the model routing:
   `risk-model-v2 (classical ML) — no PHI leaves environment`.

5. **Outreach drafted.** IBM Granite 4.1 summarises the record into an
   outreach brief; a sovereign Arabic model (Falcon-H1 or Jais 2 — pick one
   and use it consistently) drafts the actual patient-facing message.
   Model-routing badges for both should appear side by side with their
   "why this model" one-liners.

6. **Governance checkpoint — before send.** watsonx.governance intercepts
   the drafted message and runs three checks, shown as pass/pending/fail
   chips:
   - PII/PHI redaction check → pass
   - In-region inference confirmation (sovereignty tag) → pass
   - Policy: "no medication dosage change communicated without clinician
     sign-off" → **flagged** — the draft, on inspection, restates the
     diuretic dose change from the care plan, which trips this policy.
   This is the moment that sells governance: the system catches its own
   draft before it reaches the patient, not after.

7. **Human-in-the-loop approval.** Because of the flag, the message
   routes to an approval card ("Agentic Control Plane") — not silently to
   Maitha's nurse queue as a downstream escalation, but as a **pre-send
   gate**. Presenter clicks "Approve amended message" (the demo can show a
   pre-baked, dose-detail-removed version of the message as the "amended"
   one) to move on.

8. **Message sent to patient via Amal.** The approved message appears in
   an Amal-styled chat surface, RTL, in Arabic. Use this placeholder
   (replace with reviewed Gulf-dialect copy before any real audience sees
   the demo):
   `مرحباً فاطمة، نأمل أن تكوني بخير بعد خروجك من المستشفى. هل تتناولين
   أدويتك بانتظام؟ لديك موعد متابعة يوم [التاريخ].`
   (Placeholder gloss: "Hello Fatima, hope you're well since discharge.
   Are you taking your medication as prescribed? You have a follow-up
   appointment on [date].")

9. **Patient reply — symptom flag.** Patient replies (placeholder,
   English gloss shown alongside Arabic in dev, Arabic-only in presenter
   mode): "I feel dizzy since yesterday." A lightweight sentiment/symptom
   classifier tags this as a **clinical escalation trigger**, not a
   routine reply.

10. **Escalation to Maitha (human-in-the-loop, again).** Orchestrator
    routes the flagged reply to Maitha's nurse queue. Governance panel
    logs the handoff with full context attached (not a bare alert — the
    whole trace so far travels with it). Show a nurse queue card with a
    "New — Escalated by Care Continuity Agent" badge.

11. **Nurse resolves.** Presenter clicks "Nurse acknowledges — schedule
    urgent follow-up." The agent auto-generates a `ServiceRequest` for a
    24-hour follow-up call, confirms it back to the patient via Amal, and
    the orchestration canvas returns to idle.

12. **Audit trail complete.** Governance panel shows the full, timestamped,
    exportable trace of the entire journey — every model invoked, every
    check run, every human decision — as the closing beat. This is the
    artifact that answers "how would we ever audit an AI agent fleet?"

## Fallback path (optional, build if time allows — see prompts/07)

If the patient doesn't reply within the simulated window (presenter can
trigger this instead of step 9), the orchestrator escalates to Hamda for an
outbound call attempt instead of waiting indefinitely. This exists mainly to
show Hamda as a real node in the graph, not an afterthought.
