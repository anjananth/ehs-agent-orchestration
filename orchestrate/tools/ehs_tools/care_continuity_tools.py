"""
Python tools for the Post-Discharge Care Continuity Agent (watsonx Orchestrate ADK).

SECOND-PASS SCAFFOLD. These tools return the same scripted fixture data the React
demo's mock adapters use (see ehs-agent-demo/src/lib/adapters/mock.ts), so the agent
can be imported and exercised on a watsonx Orchestrate instance before any Cerner /
FHIR / governance endpoints exist. Each function documents which real integration
replaces it — the adapter mapping is in reference/watsonx_integration_stub.md.

No real endpoints are called from this file.
"""

from __future__ import annotations

from datetime import datetime, timezone

from ibm_watsonx_orchestrate.agent_builder.tools import ToolPermission, tool

# Fictional patient only — never a real MRN. Mirrors ehs-agent-demo/src/data/case.ts.
_DEMO_PATIENT_ID = "PT-DEMO-58F-0417"
_DEMO_CASE_ID = "CC-2026-09-14-0417"


@tool(permission=ToolPermission.READ_ONLY)
def get_discharge_bundle(patient_id: str) -> dict:
    """Retrieve the discharge bundle for a patient from the system of record.

    Returns a readable summary of the FHIR R4 Encounter, CarePlan, MedicationRequest
    and ServiceRequest resources created at discharge.

    REAL INTEGRATION: Cerner Millennium via Ignite FHIR R4 (SMART on FHIR / OAuth 2.0),
    scope patient/*.read. Replace the fixture below with FHIR reads.

    :param patient_id: The patient identifier from the ADT^A03 discharge event.
    :returns: Discharge bundle with encounter, care plan, medication and follow-up details.
    """
    if patient_id != _DEMO_PATIENT_ID:
        return {"error": f"Unknown patient {patient_id} (mock system of record only knows {_DEMO_PATIENT_ID})"}
    return {
        "caseId": _DEMO_CASE_ID,
        "patient": {"id": patient_id, "firstName": "Fatima", "age": 58, "sex": "F", "preferredLanguage": "ar"},
        "encounter": {
            "id": "ENC-2026-0914-0417",
            "specialty": "Cardiology",
            "admitted": "2026-09-10",
            "discharged": "2026-09-14T11:40:12+04:00",
            "primaryDiagnosis": "Heart-failure exacerbation (mild), stabilised",
            "disposition": "Home, self-care with community follow-up",
            "triggerEvent": "ADT^A03",
        },
        "carePlan": {
            "id": "CP-2026-0914-0417",
            "title": "Post-discharge heart-failure care plan",
            "instructions": [
                "Daily morning weight; report gain > 2 kg in 3 days",
                "Fluid restriction 1.5 L/day; low-sodium diet",
                "Take medications as prescribed; do not adjust doses without clinician advice",
                "Report dizziness, breathlessness or ankle swelling",
            ],
        },
        "medicationRequests": [
            {
                "id": "MR-2026-0914-0417-01",
                "medication": "Furosemide",
                "previousDose": "40 mg",
                "newDose": "80 mg",
                "frequency": "once daily, morning",
                "reason": "Dose increased during admission for fluid overload; to be reviewed at 7-day follow-up",
            }
        ],
        "serviceRequests": [
            {
                "id": "SR-2026-0914-0417-01",
                "display": "Cardiology follow-up appointment",
                "priority": "routine",
                "dueWithin": "within 7 days",
                "scheduledFor": "2026-09-21",
            }
        ],
    }


@tool(permission=ToolPermission.READ_ONLY)
def score_readmission_risk(patient_id: str) -> dict:
    """Compute the 30-day readmission risk for a discharged patient.

    Uses the classical ML model (risk-model-v2) that runs inside the EHS tenant —
    no PHI leaves the environment and no generative model is involved.

    REAL INTEGRATION: EHS Data & Statistics risk model served via watsonx.ai / WML.

    :param patient_id: The patient identifier.
    :returns: Risk score (0-1), band, and the top contributing drivers.
    """
    return {
        "modelId": "risk-model-v2",
        "modelKind": "classical-ml",
        "inferenceLocation": "EHS environment — no PHI leaves the tenant",
        "score": 0.72,
        "band": "high",
        "drivers": [
            "Heart-failure diagnosis with diuretic dose change at discharge",
            "Age 58, prior cardiology admission in last 12 months",
            "Discharged to home without home-care service",
        ],
    }


@tool(permission=ToolPermission.READ_ONLY)
def run_pre_send_governance_checks(draft_message: str, case_id: str) -> dict:
    """Run watsonx.governance policy checks on a drafted patient message before it is sent.

    Checks: PII/PHI redaction (EHS-DP-04), in-region inference (EHS-SOV-01), and the
    medication-dosage disclosure policy (EHS-CLIN-12: no dosage change is communicated
    to a patient without clinician sign-off). If any check fails, the message must be
    routed to the Agentic Control Plane approval gate — it must NOT be sent.

    REAL INTEGRATION: watsonx.governance policy evaluation + audit logging.

    :param draft_message: The drafted patient-facing message (Arabic or English).
    :param case_id: The case identifier for audit correlation.
    :returns: Per-check results and an overall verdict ('send' | 'route-to-approval').
    """
    lowered = draft_message.lower()
    dose_terms = ("mg", "ملغ", "dose", "جرعة")
    dose_detail_present = any(t in lowered for t in dose_terms)
    checks = [
        {
            "id": "chk-phi",
            "policyRef": "EHS-DP-04",
            "label": "PII / PHI redaction",
            "status": "pass",
            "detail": "No MRN, national ID, or address in draft. First name only — permitted for patient-facing channel.",
        },
        {
            "id": "chk-region",
            "policyRef": "EHS-SOV-01",
            "label": "In-region inference",
            "status": "pass",
            "detail": "All models in the routing trace executed in the UAE region.",
        },
        {
            "id": "chk-dose",
            "policyRef": "EHS-CLIN-12",
            "label": "Medication-dosage disclosure",
            "status": "fail" if dose_detail_present else "pass",
            "detail": (
                "Draft restates a medication dose. No clinician sign-off on record for patient communication. Send BLOCKED."
                if dose_detail_present
                else "No dosage change present in message."
            ),
        },
    ]
    return {
        "caseId": case_id,
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "checks": checks,
        "verdict": "route-to-approval" if dose_detail_present else "send",
    }


@tool(permission=ToolPermission.READ_WRITE)
def send_patient_message_via_amal(patient_id: str, message_ar: str, approval_reference: str) -> dict:
    """Deliver an approved message to the patient through Amal (the EHS patient-facing assistant).

    Only call this with a message that has passed governance checks or carries a
    human approval reference from the Agentic Control Plane.

    REAL INTEGRATION: Amal (Boston Health AI) outbound messaging API.

    :param patient_id: The patient identifier.
    :param message_ar: The approved Arabic message text.
    :param approval_reference: Governance verdict id or human approval record id.
    :returns: Delivery receipt.
    """
    return {
        "channel": "Amal",
        "patientId": patient_id,
        "messageId": "MSG-0417-01",
        "language": "ar",
        "approvalReference": approval_reference,
        "deliveredAt": datetime.now(timezone.utc).isoformat(),
        "status": "delivered",
    }


@tool(permission=ToolPermission.READ_ONLY)
def classify_patient_reply(reply_text: str) -> dict:
    """Classify an inbound patient reply as routine or a clinical escalation trigger.

    Lightweight in-tenant symptom classifier (symptom-classifier-v1). Replies that
    mention symptoms such as dizziness, breathlessness or swelling are escalated to a
    nurse via Maitha rather than answered by the agent.

    REAL INTEGRATION: in-tenant classical classifier served via watsonx.ai.

    :param reply_text: The patient's reply (Arabic or English).
    :returns: Classification label and the matched symptom, if any.
    """
    symptoms = {
        "dizz": "dizziness", "دوخة": "dizziness",
        "breath": "breathlessness", "نفس": "breathlessness",
        "swell": "swelling", "تورم": "swelling",
        "chest": "chest pain", "صدر": "chest pain",
    }
    lowered = reply_text.lower()
    for needle, label in symptoms.items():
        if needle in lowered:
            return {"classification": "clinical-escalation", "symptom": label, "modelId": "symptom-classifier-v1"}
    return {"classification": "routine", "symptom": None, "modelId": "symptom-classifier-v1"}


@tool(permission=ToolPermission.READ_WRITE)
def escalate_to_nurse_queue(case_id: str, patient_id: str, reason: str, context_summary: str) -> dict:
    """Escalate a case to the cardiology nurse queue on Maitha with the full trace attached.

    The escalation carries the case bundle, risk score, the approved outreach message and
    the patient reply — not a bare alert. A nurse must acknowledge before any follow-up is
    scheduled.

    REAL INTEGRATION: Maitha (TERN Group) nurse workqueue API.

    :param case_id: The case identifier.
    :param patient_id: The patient identifier.
    :param reason: Why the case is being escalated (e.g. 'dizziness post diuretic change').
    :param context_summary: Short summary of the trace so far for the nurse.
    :returns: Queue ticket with SLA.
    """
    return {
        "queue": "Maitha — cardiology nursing",
        "ticketId": "MQ-0417-01",
        "caseId": case_id,
        "patientId": patient_id,
        "reason": reason,
        "contextSummary": context_summary,
        "slaMinutes": 30,
        "status": "new — escalated by Care Continuity Agent",
    }


@tool(permission=ToolPermission.READ_WRITE)
def create_follow_up_service_request(patient_id: str, priority: str, due_within: str, nurse_ack_reference: str) -> dict:
    """Create a FHIR ServiceRequest for a follow-up call after a nurse has acknowledged the escalation.

    REAL INTEGRATION: Cerner Millennium Ignite FHIR R4 write (ServiceRequest). Write-scope
    availability on the EHS tenant is an open discovery question — confirm before relying on it.

    :param patient_id: The patient identifier.
    :param priority: 'routine' or 'urgent'.
    :param due_within: Human-readable due window, e.g. 'within 24 hours'.
    :param nurse_ack_reference: The Maitha ticket id or nurse acknowledgement record.
    :returns: The created ServiceRequest summary.
    """
    return {
        "id": "SR-2026-0915-0417-02",
        "resourceType": "ServiceRequest",
        "patientId": patient_id,
        "display": "Urgent nurse follow-up call — dizziness post diuretic adjustment",
        "priority": priority,
        "dueWithin": due_within,
        "requestedBy": f"Care Continuity Agent (nurse-acknowledged: {nurse_ack_reference})",
        "status": "active",
    }
