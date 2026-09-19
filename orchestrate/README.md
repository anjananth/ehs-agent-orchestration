# watsonx Orchestrate ADK — Care Continuity Agent

ADK workspace for the Post-Discharge Care Continuity Agent shown in `../ehs-agent-demo`.
This is the start of the **second pass** described in `../reference/watsonx_integration_stub.md`:
the agent and tools are defined for real here, but the tools still return the same scripted
fixture data as the React demo's mock adapters. No Cerner / Amal / Maitha / governance endpoint
is called yet — each tool's docstring names the real integration that replaces it.

The React demo is untouched by this folder.

## What's here

```
orchestrate/
  .venv/                          Python 3.12 venv with ibm-watsonx-orchestrate 2.17.0 (ignored)
  agents/care_continuity_agent.yaml   native agent: instructions, guidelines, 7 tools, starter prompts
  tools/ehs_tools/care_continuity_tools.py   Python tools (@tool), mocked
  tools/ehs_tools/requirements.txt
  deploy.ps1                      imports tools then agent into the active env
  .env.example                    reference for the variables the ADK expects
```

Tools mirror the demo's step sequence:

| Tool | Demo step | Real integration later |
|---|---|---|
| `get_discharge_bundle` | 3 record retrieval | Cerner Millennium — Ignite FHIR R4 read |
| `score_readmission_risk` | 4 risk scoring | EHS classical ML model (in-tenant) |
| `run_pre_send_governance_checks` | 6 checkpoint | watsonx.governance policy eval |
| `send_patient_message_via_amal` | 8 / 11 send | Amal (Boston Health AI) messaging |
| `classify_patient_reply` | 9 symptom flag | in-tenant classifier |
| `escalate_to_nurse_queue` | 10 escalation | Maitha (TERN Group) workqueue |
| `create_follow_up_service_request` | 11 resolve | Cerner FHIR R4 write (scope TBC) |

## Why the CLI + SaaS path (not Developer Edition)

Developer Edition runs the whole Orchestrate stack in Docker and needs 16 GB RAM / 8 cores
and an amd64 engine. This laptop is 8 GB / 4 cores, Windows-on-ARM, with no WSL — so the
ADK CLI is pointed at a hosted watsonx Orchestrate instance instead.

## Connect to your instance (one-time)

1. In the watsonx Orchestrate UI: profile menu → **Settings** → **API details**. Copy the
   **service instance URL** and generate an **API key**.
2. Register and activate the environment (run these yourself — don't paste the key anywhere else):

   ```powershell
   cd orchestrate
   .\.venv\Scripts\orchestrate.exe env add -n ehs -u "<service-instance-url>" -a
   .\.venv\Scripts\orchestrate.exe env activate ehs --api-key "<api-key>"
   .\.venv\Scripts\orchestrate.exe env list
   ```

   If auth type isn't inferred from the URL, add `-t ibm_iam` (IBM Cloud) or `-t mcsp` (AWS/MCSP)
   to `env add`.

3. Pick an in-region model and set `llm:` in `agents/care_continuity_agent.yaml`:

   ```powershell
   .\.venv\Scripts\orchestrate.exe models list
   ```

   The YAML currently names `watsonx/ibm/granite-3-3-8b-instruct` to match the demo narrative
   (Granite for structuring); use whatever Granite id the tenant actually exposes.

## Deploy

```powershell
.\deploy.ps1
```

Then open the agent in the Orchestrate chat UI and use the three starter prompts
(discharge event → patient reply → nurse acknowledgement) to walk the same journey as the demo.

## Validate locally without an instance

The agent YAML and tools can be checked against the ADK's own models with no credentials:

```powershell
.\.venv\Scripts\python.exe -c "import yaml; from ibm_watsonx_orchestrate.agent_builder.agents import Agent; print(Agent.model_validate(yaml.safe_load(open('agents/care_continuity_agent.yaml', encoding='utf-8'))).name)"
```

## Next steps toward a real second pass

- Swap tool bodies for real calls (FHIR via SMART on FHIR; Amal / Maitha APIs) and attach
  connections with `orchestrate connections add` + `tools import --app-id`.
- Move the pre-send gate onto Orchestrate's human-in-the-loop node (flow tool) rather than
  relying on instructions.
- Point the React demo's `src/lib/adapters/index.ts` at a `RealWatsonxOrchestratorAdapter`
  that calls this agent — the UI needs no changes.
