# Reference: EHS agent fleet & model routing

Ground truth for what's actually known about EHS's existing AI landscape.
Use this instead of inventing vendor names or capabilities.

## Existing EHS agents (the fleet watsonx orchestrates, not replaces)

- **Amal** — patient-facing physician assistant. Vendor: Boston Health AI.
  In the demo, this is the surface the patient sees the outreach message
  arrive on — style its chat UI as the "patient app," not as a generic chat
  widget.
- **Maitha** — nursing workforce platform. Vendor: TERN Group. In the real
  account this platform runs six career-coach agents; for this demo, treat
  Maitha as the nurse's inbox/queue where the human-in-the-loop escalation
  and approval happens.
- **Hamda** — contact-centre agent. Vendor undisclosed. Use this as the
  fallback channel: if the patient doesn't respond to Amal within the
  simulated window, the orchestrator escalates to a Hamda outbound-call
  node.
- All three are **siloed today** — no shared orchestration or governance.
  That gap is the entire premise of the demo; don't accidentally design the
  orchestration canvas in a way that implies they already talk to each
  other without watsonx in between.

## System of record

- **Cerner Millennium** (Oracle Health) is EHS's primary system of record.
  Integration in the real world is via Ignite FHIR R4 APIs and an HL7 v2
  interface engine (ADT/SIU/MDM events). The demo's discharge trigger should
  be modeled as an **ADT A03 discharge event** for narrative accuracy, even
  though it's a static fixture, not a live feed.

## The new agent this demo centers on

- **Post-Discharge Care Continuity Agent** — one of five prioritised EHS use
  cases already scoped on watsonx Orchestrate (alongside Referral & Care
  Navigation, Revenue Cycle & Denial Management, Clinical Encounter
  Completion, and Regulatory Change & Accreditation Readiness). This is the
  one the demo builds out; the other four can appear as greyed-out /
  "coming soon" nodes on the orchestration canvas to show the architecture
  scales, but don't build their logic in this pass.

## Model fleet (this is the governance story — show it explicitly)

Right-sizing the model fleet, not picking one model, is the pitch. Every
agent action in the demo should be tagged with which model handled it and
why:

| Model | Role in the fleet | Use in this scenario |
|---|---|---|
| **Falcon-H1** (TII) / **Jais 2** (G42/Inception) | Sovereign Arabic models — patient-facing dialogue, residency compliance | Drafts/handles the Arabic patient outreach and reply |
| **IBM Granite 4.1** | Structuring, summarisation, RAG | Summarises the discharge record and care plan into the outreach brief |
| **MedGemma** | Imaging | Not used in this scenario — fine to omit or show as "not invoked" |
| Classical ML | Risk / no-show prediction | Produces the readmission-risk score that triggers escalation |
| Governed frontier model | Complex clinical reasoning, human-gated | Only invoked, under approval, if the nurse escalation needs deeper reasoning — keep this path visible but minimally exercised |

Every model-routing badge shown in the UI should also carry a one-line
**why this model** justification and a **data residency** tag (in-region /
in-country vs external) — that pairing is the actual sovereignty argument:
"UAE-hosted" commonly describes data at rest, not inference execution: when
the prompt itself contains patient data, where inference actually runs is
the real fact worth showing, not a marketing claim.

## Stakeholders (for any narration/copy referencing the audience)

- H.E. Mubaraka Ibrahim — Executive Director, Information Sector, and CAIO,
  EHS.
- Dr. Yousif Al Serkal — Director General, EHS.
- Dr. Sara Alshaya — Director, Data and Statistics, EHS.

Do not put these named individuals' names inside demo copy or mock data
(e.g. as a "signed off by" field) — they're the audience, not characters in
the scenario.
