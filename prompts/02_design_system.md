# Prompt 02 — Design system

No brand assets have been supplied yet for this run. Build a placeholder
design system now, flagged clearly as a placeholder, so it's a fast swap
later:

1. Define design tokens (CSS variables or a Tailwind theme extension) for:
   - A dark "control-room" background scale (near-black base, two lighter
     panel shades for the canvas/governance panels vs the page background).
   - An IBM-Carbon-inspired accent blue as the primary interactive/brand
     colour — this is a placeholder for the real MDS Solutions palette.
   - Governance semantic colours, used consistently everywhere: green
     (passed/approved), amber (pending/awaiting approval), red
     (blocked/failed), blue (informational/in-progress).
   - Model-routing badge colours — give each fleet model from
     `reference/agent_fleet.md`'s table a distinct, consistent colour used
     everywhere that model is referenced.
2. Set Hanken Grotesk as the typeface across the app (already loaded in
   prompt 01); define a small type scale (page title, panel heading, body,
   label/badge caption, monospace for timestamps/log entries).
3. Build reusable primitives in `src/components/layout/`: `Panel` (a
   titled container with the dark panel background), `Badge` (for
   governance-status and model-routing chips, colour-driven by a `variant`
   prop), `Chip`, and a `SectionLabel` caption component.
4. Add a visible code comment at the top of the token file:
   `// PLACEHOLDER PALETTE — swap for MDS Solutions brand palette + logo
   before client presentation. See README.md.`
5. Re-skin the prompt-01 shell (header + three panels) using these
   primitives so the blank skeleton now looks intentional rather than
   default-Tailwind.

Stop and summarize before moving to `prompts/03_data_model_and_mock_agents.md`.
