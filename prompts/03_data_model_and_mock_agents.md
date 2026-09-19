# Prompt 03 — Types, fixtures, and mock adapters

Read `reference/agent_fleet.md`, `reference/scenario_script.md`, and
`reference/watsonx_integration_stub.md` before starting.

1. In `src/types/`, define TypeScript types for:
   - `Agent` (id, name, vendor, kind: e.g. `patient-facing` |
     `nursing-workforce` | `contact-centre` | `orchestrated-agent`, status:
     `idle` | `active` | `awaiting-approval` | `complete`).
   - `FleetModel` (id, name, role, sovereignty: `in-region` | `external`,
     colour token, one-line "why this model" description) — seed this from
     the model fleet table in `reference/agent_fleet.md`.
   - Lightweight FHIR-ish resource types actually used in the scenario:
     `Encounter`, `CarePlan`, `MedicationRequestItem`, `ServiceRequestItem`
     — keep these readable/simplified, not full FHIR R4 schemas.
   - `GovernanceCheck` (id, label, status: `pass` | `pending` | `fail`,
     detail string).
   - `AuditEvent` (timestamp, actor, action, detail, relatedModel?).
   - `ScenarioStep` (id, order, description, canvasEffect, governanceEffect,
     chatEffect — enough structure for the playback engine in prompt 06 to
     consume without you having to redesign this later).
2. In `src/data/`, create static fixtures matching the 12-step script in
   `reference/scenario_script.md`, including the Fatima Al Mazrouei case
   bundle (discharge encounter, care plan, the diuretic
   `MedicationRequestItem`, the follow-up `ServiceRequestItem`), the agent
   registry (Amal, Maitha, Hamda, Post-Discharge Care Continuity Agent —
   plus the other four use cases from `reference/agent_fleet.md` as
   `status: 'not-built'` placeholder nodes), and the fleet model registry.
3. Implement the adapter interfaces from
   `reference/watsonx_integration_stub.md` in `src/lib/adapters/` — mock
   implementations only, each returning fixture data with a short
   (200–500ms) artificial delay so later animation has something to key off.
   Wire them behind `src/lib/adapters/index.ts`.
4. Don't build any UI yet beyond what prompt 02 produced — this prompt is
   data/types/adapters only, so prompt 04 onward has something solid to
   render against.

Stop and summarize before moving to `prompts/04_orchestration_canvas.md`.
