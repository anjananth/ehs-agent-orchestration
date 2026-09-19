# Prompt 07 — Presenter polish (optional, time-permitting)

Treat this prompt as a menu, not a strict sequence — do the items that
matter most for how this will actually be shown, and say what you skipped.

1. **Presenter/full-screen mode** — a toggle that hides any dev-only
   chrome (the English chat glosses from prompt 06, any leftover debug
   controls) and maximizes the three panels for a projector.
2. **"About this demo" modal** — a short in-app disclosure, reachable from
   the header, stating plainly that this is a simulated first pass: no
   live watsonx, watsonx.governance, or Cerner Millennium calls are being
   made, every response is scripted, and the point is to demonstrate the
   orchestration/governance architecture and the post-discharge workflow
   it would run. This protects against anyone in the room assuming they're
   watching a live system.
3. **Fallback path (Hamda escalation)** — if not already built, add the
   "patient didn't respond" branch from `reference/scenario_script.md`'s
   fallback section as a second thread the presenter can trigger from step
   8 onward, routing to Hamda instead of waiting on a reply. This only
   needs to be reachable, not deeply polished.
4. **Persona-view toggle (stretch)** — a toggle between a "Governance view"
   (current default — audit trail and checks foregrounded) and a "Clinical
   Ops view" (foregrounds the case bundle and patient chat, backgrounds the
   audit log to a collapsed strip) — useful given the CAIO's office and Dr.
   Alshaya's Data & Statistics team are two distinct buyer personas in the
   room with different things they'll lean forward for. Build this only if
   the rest of the app is solid; it's a nice-to-have, not core.
5. **Sanity pass** — confirm: no console errors, the RTL Arabic renders
   correctly (not mirrored/broken), the exported audit-trail JSON download
   actually works, and Reset truly returns to a clean state after a full
   run-through including the fallback path.

When done, summarize the final feature set against the original brief in
`CLAUDE.md`, and flag explicitly: (a) the placeholder brand palette still
needs swapping for real MDS Solutions assets, and (b) the placeholder
Arabic copy needs native-speaker review before any real EHS audience sees
it.
