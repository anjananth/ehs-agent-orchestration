# Prompt 04 — Orchestration canvas

Build the left panel: a `reactflow` node-graph visualizing the orchestration
layer.

1. Nodes:
   - Center: **Orchestrator** (watsonx Orchestrate) — visually distinct as
     the hub (larger, brand-accent border).
   - Spokes: **Cerner Millennium** (system of record), **Post-Discharge
     Care Continuity Agent**, **Amal**, **Maitha**, **Hamda**.
   - Greyed-out placeholder nodes for the other four scoped use cases
     (Referral & Care Navigation, Revenue Cycle & Denial Management,
     Clinical Encounter Completion, Regulatory Change & Accreditation
     Readiness) at reduced opacity with a "not built in this demo" tooltip
     — these exist to show the architecture scales, not to be interactive.
2. Each active node (from the fixture agent registry) should visually
   reflect its live `status` (`idle` / `active` / `awaiting-approval` /
   `complete`) using the governance colour semantics from prompt 02 —
   idle = neutral, active = blue with a pulse animation, awaiting-approval
   = amber, complete = green.
3. Edges between the Orchestrator and whichever node is currently active
   should animate (dash-flow or particle animation via `framer-motion` or
   `reactflow`'s built-in animated edge) to show data/control flow
   direction.
4. Clicking a node opens a small detail drawer (reuse the `Panel`
   primitive) showing: what this agent/system is, its vendor, and — for
   the Post-Discharge agent specifically — which case bundle it's
   currently holding (Encounter/CarePlan/MedicationRequest/ServiceRequest
   summary card, human-readable, not raw JSON).
5. For now, node/edge state should be driven by a **static status prop**
   you can toggle manually (e.g. a temporary dev-only dropdown or hardcoded
   state) — full playback-driven state comes in prompt 06. The goal of this
   prompt is a correct, good-looking, interactive graph on its own.

Stop and summarize before moving to `prompts/05_governance_panel.md`.
