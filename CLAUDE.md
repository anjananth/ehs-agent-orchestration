# CLAUDE.md — EHS Agent Orchestration & Governance Demo

## What this project is

A single-page React demo, built for a presales meeting with Emirates Health
Services (EHS), a UAE federal health authority. The audience is split across
two personas: the CAIO's office (cares about governance, sovereignty,
auditability, orchestration architecture) and Dr. Alshaya's Data & Statistics
team (cares about the clinical/operational workflow itself). Design for both
in the room at once.

**The pitch this demo makes:** EHS already has AI agents — Amal (patient-
facing physician assistant, Boston Health AI), Maitha (nursing workforce
platform, TERN Group), Hamda (contact-centre agent, vendor undisclosed) —
but they are siloed, with no shared orchestration or governance across the
fleet. watsonx is not pitched as a fourth competing agent. It is pitched as
the **orchestration and governance spine underneath the existing fleet**:
one choke point where every agent call is routed, checked against policy,
attributed to a specific model with a specific data-residency posture, and
logged to an audit trail a regulator could read.

The walk-through scenario is the **Post-Discharge Care Continuity Agent**:
a patient is discharged, the agent checks in on them, something goes
slightly wrong (a symptom flag), and the orchestration/governance layer is
what catches it, routes it to a human, and gets it resolved safely and
auditably. The demo should make a viewer feel the difference between "an
agent messaged the patient" and "an agent messaged the patient, inside a
system that would have caught it going wrong."

## Current pass: fully mocked

There is no live watsonx, IBM, or Cerner API call anywhere in this codebase
for this pass. Every agent response, governance check, and clinical resource
is scripted local data driving a deterministic playback state machine. Build
every "call" behind an adapter interface (see
`reference/watsonx_integration_stub.md`) so a second pass can swap mocks for
real API calls without touching UI code. Do not silently start wiring real
API calls unless explicitly asked — that is a distinct, later piece of work.

## Tech stack (do not deviate without asking)

- Vite + React 18 + TypeScript
- Tailwind CSS for styling
- `reactflow` (xyflow) for the orchestration node-graph canvas
- `framer-motion` for state-transition and chat-bubble animation
- `zustand` for the scenario/playback state machine
- `lucide-react` for icons
- No backend, no database, no auth. Everything runs client-side from static
  fixture data in `src/data/`.

## Style and tone

- Dark "control-room" visual register — this is a governance/ops narrative,
  not a consumer health app. Think NOC dashboard, not patient portal.
- Typography: Hanken Grotesk (Google Fonts), matching the MDS Solutions
  deliverable standard already used on this account.
- Governance semantics are colour-coded and must stay consistent everywhere:
  green = passed/approved, amber = pending/awaiting human approval,
  red = blocked/failed, blue = informational/in-progress.
- Every place a specific AI model is invoked, show which one and why (see
  `reference/agent_fleet.md` for the fleet). This is the single most
  important visual motif in the whole demo — model-routing transparency
  *is* the governance story.
- Keep Arabic patient-facing content in a dedicated RTL-aware component.
  Treat the placeholder Arabic text in `reference/scenario_script.md` as
  literally that — a placeholder to be replaced with reviewed Gulf-dialect
  copy before any real audience sees it.

## Working conventions for this session

- Work through `prompts/` in numeric order. Each file assumes the previous
  file's output exists. Don't jump ahead or merge steps unless asked.
- After each prompt, stop and summarize what was built plus anything you
  had to assume or improvise, rather than continuing straight into the next
  prompt unprompted.
- If a brand asset (logo, exact hex palette) hasn't been supplied, use the
  IBM-Carbon-inspired placeholder tokens from `prompts/02_design_system.md`
  and flag clearly, in code comments and in your summary, that it's a
  placeholder pending real brand assets.
- Favor the `reference/` files over inventing new lore about EHS, the agent
  fleet, or the clinical scenario. If something isn't covered there and you
  need it, ask rather than fabricate — this app will be shown to the actual
  client stakeholders it depicts.
