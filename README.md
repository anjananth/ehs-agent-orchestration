# EHS Agent Orchestration & Governance Demo — Claude Code Prompt Pack

This pack builds a **React demo** that shows Emirates Health Services (EHS)
stakeholders what a watsonx-governed orchestration layer looks like sitting
above their existing, siloed AI agent fleet (Amal, Maitha, Hamda) — using the
**Post-Discharge Care Continuity Agent** as the walk-through scenario.

**This first pass is fully mocked.** There is no live watsonx Orchestrate,
watsonx.governance, or Cerner Millennium call anywhere in it — every "agent
response," "governance check," and "FHIR resource" is scripted local data.
The point of this pass is to sell the *shape* of the architecture and the
*governance narrative* (single orchestration choke point, in-country
inference, human-in-the-loop approval, auditable trail) to a room, not to
prove API connectivity. `reference/watsonx_integration_stub.md` documents
exactly where to cut in real IBM calls later without restructuring the app.

## How to use this pack

1. Unzip into an **empty folder** and `cd` into it.
2. Start Claude Code in that folder: `claude`
3. First message: *"Read CLAUDE.md, then read every file in reference/, then
   execute prompts/01_scaffold_app.md."*
4. Work through `prompts/01` → `prompts/07` **in order, one at a time**,
   reviewing/running the app between each (`npm run dev`). Each prompt
   assumes the previous one's output exists — don't skip ahead.
5. If Claude Code drifts from the brief mid-file, point it back at the
   relevant `reference/` file rather than re-explaining from scratch — that's
   what those files are for.

## What you'll need to hand Claude Code partway through

- The actual MDS Solutions / eSolutions brand palette and logo files, if you
  want pixel-accurate branding rather than the IBM-Carbon-inspired stand-in
  defined in `prompts/02_design_system.md`. Drop them in `/assets/brand/`
  before running prompt 02, or run 02 as-is and re-skin later.
- A decision on Arabic content: prompt 06 stages an RTL Gulf-Arabic patient
  message as a placeholder string. Swap in real, reviewed Gulf-dialect copy
  before this goes in front of EHS — don't demo machine-translated Arabic to
  a native-speaking audience.

## Structure of this pack

- `CLAUDE.md` — drop this in the project root (prompt 01 does this for you).
  Persistent project context so Claude Code doesn't need the brief re-stated
  every session.
- `prompts/01`–`07` — sequential build prompts.
- `reference/scenario_script.md` — the full step-by-step narrative the demo
  plays out, with sample dialogue.
- `reference/agent_fleet.md` — what's known about Amal, Maitha, Hamda, and
  the model-routing fleet, so agent cards and routing badges are grounded in
  the real account context rather than invented.
- `reference/watsonx_integration_stub.md` — the adapter-interface pattern
  for swapping mocked agent/governance calls for real watsonx Orchestrate
  and watsonx.governance API calls in a second pass.

## Non-goals for this pass

- No real IBM API calls (watsonx Orchestrate, watsonx.governance, watsonx.ai).
- No real Cerner Millennium / Ignite FHIR calls.
- No auth, no backend, no persistence — this is a single-page, in-memory,
  presenter-driven demo intended to run from a laptop off `npm run dev` or a
  static build.
- No mobile layout — this is built for a laptop/projector screen in a
  stakeholder meeting.
