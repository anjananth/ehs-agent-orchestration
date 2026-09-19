# Prompt 01 — Scaffold the app

Read `CLAUDE.md` and every file in `reference/` before starting, if you
haven't already.

Scaffold a new Vite + React + TypeScript project in the current directory
called `ehs-agent-demo`. Then:

1. Install and configure Tailwind CSS.
2. Install `reactflow`, `framer-motion`, `zustand`, `lucide-react`.
3. Copy `CLAUDE.md` into the project root if it isn't already there
   (it should end up at `ehs-agent-demo/CLAUDE.md` or the repo root,
   whichever this session is running from — don't duplicate it).
4. Set up this folder structure under `src/`:
   ```
   src/
     components/
       canvas/        (orchestration node-graph)
       governance/     (audit panel, check chips, approval modal)
       chat/           (patient-facing Amal-style chat surface)
       layout/         (shell, header, controls)
     data/            (static fixtures — scenario steps, agent registry, model fleet)
     lib/
       adapters/       (see reference/watsonx_integration_stub.md)
       store/          (zustand scenario/playback store)
     types/           (shared TS types)
   ```
5. Add Hanken Grotesk via Google Fonts in `index.html`, and set it as the
   base font in the Tailwind config.
6. Get a blank shell running: a full-viewport dark page with a header
   ("EHS Agent Orchestration & Governance — Post-Discharge Care Continuity")
   and three empty placeholder panels (left: orchestration canvas, right:
   governance panel, bottom: patient chat) so the layout skeleton is
   visible before any real content exists.
7. Confirm `npm run dev` runs cleanly with no console errors.

Stop here and summarize what was scaffolded before moving to
`prompts/02_design_system.md`.
