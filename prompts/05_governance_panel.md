# Prompt 05 — Governance & audit panel

Build the right panel: the governance/audit surface. This is the piece the
CAIO's office cares about most — it should feel authoritative, not
decorative.

1. **Live audit trail feed** — a scrollable, timestamped, monospace-leaning
   log (auto-scrolls to newest) rendering `AuditEvent[]` from the fixtures/
   adapter. Each entry: timestamp, actor (e.g. "Orchestrator",
   "watsonx.governance", "Nurse — Maitha queue"), action, and a one-line
   detail. Static content for now — playback wiring comes in prompt 06.
2. **Governance check chips** — render `GovernanceCheck[]` as a small
   stack of status chips (pass/pending/fail, using the shared `Badge`
   primitive) for the pre-send checkpoint described in
   `reference/scenario_script.md` step 6 (PII/PHI redaction, in-region
   inference confirmation, medication-dosage-disclosure policy). The
   flagged check should visually stand out (amber/red, maybe a subtle
   shake or highlight on first appearance).
3. **Model-routing display** — wherever a model from the fleet fires
   (risk scoring, summarisation, Arabic drafting), show a badge with the
   model name, its colour from prompt 02, its sovereignty tag
   (in-region/external), and its one-line "why this model" justification
   on hover/click. This should read as the app's signature visual motif —
   don't bury it in a tooltip only.
4. **Approval modal ("Agentic Control Plane")** — a modal/card component
   for the human-in-the-loop gate: shows the flagged draft, the specific
   policy that tripped, and two actions — "Approve amended message" and
   "Reject." Style it distinctly from the rest of the UI (this is a
   different persona's — the nurse's or approver's — interface embedded in
   the demo, not the orchestrator's own chrome).
5. **Export audit trail** — a button that (for this pass) triggers a
   client-side JSON download of the full mock `AuditEvent[]` + governance
   check history for the case. This doesn't need to be a polished report —
   it needs to visibly exist, because "can you actually produce this for a
   regulator" is a real question this demo should pre-empt.
6. As with prompt 04, drive this panel from static/manually-toggled state
   for now — full playback wiring is prompt 06.

Stop and summarize before moving to `prompts/06_scenario_playback.md`.
