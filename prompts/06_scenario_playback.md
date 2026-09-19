# Prompt 06 — Scenario playback engine + patient chat

This is where everything built so far gets wired together and actually
tells the story in `reference/scenario_script.md`.

1. Build a `zustand` store (`src/lib/store/`) modeling the scenario as a
   sequence of the 12 `ScenarioStep`s from the fixtures, with state:
   `currentStepIndex`, `isPlaying`, `speed`, plus derived state for what
   each panel should currently show (canvas node statuses, governance
   log/checks, chat messages).
2. Build presenter controls in the header/bottom bar: **Play**, **Pause**,
   **Step forward**, **Step back**, **Reset**, and a speed control
   (e.g. 0.5x / 1x / 2x). Step mode should require a click per step with no
   auto-advance — this is the mode for narrating live to a room.
3. Wire the orchestration canvas (prompt 04) and governance panel
   (prompt 05) to read from this store instead of their temporary static/
   manual state, so node statuses, edge animation, audit log entries, and
   governance chips all advance in lockstep with `currentStepIndex`.
4. Build the **patient chat surface** (bottom panel), styled to evoke
   Amal's patient-facing app (rounded chat bubbles, a phone-width column
   centered in the panel rather than full-bleed). It must support **RTL
   Arabic rendering** for the patient-facing messages (steps 8–9 in the
   script). Use the placeholder Arabic copy in
   `reference/scenario_script.md` verbatim, and show the English gloss as
   a small secondary caption beneath each bubble in this dev build (so
   Claude Code / the presales team can read it) — but make that gloss
   easy to hide via a single toggle for presenter mode.
5. Step 7 (the approval gate) should actually pause auto-play and require
   the presenter to click "Approve amended message" in the modal from
   prompt 05 before the scenario advances — don't let it sail past the one
   moment that's supposed to be the point of the whole demo. Same for step
   11 (nurse resolves).
6. Reset should return every panel to the idle/step-0 state cleanly.

Stop and summarize before moving to `prompts/07_polish_and_demo_mode.md`.
Run through the full scenario yourself via Play and Step and report any
step where the panels visibly fall out of sync.
