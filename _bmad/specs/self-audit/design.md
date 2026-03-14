# Design: VBA System Self-Audit Workflow

This review uses a recursive "Agent Auditing Agent" model.

## Review Team (Team BA)

1.  **Lead Auditor**: `ba.md` (VBA Agent)
    - Focus: Technical accuracy, BABOK alignment, and atom integrity.
2.  **Strategic Auditor**: `innovation-strategist.md` (CIS Module)
    - Focus: Strategic value and ecosystem integration.
3.  **Narrative Auditor**: `storyteller/agent.md` (CIS Module)
    - Focus: Clarity of documentation and skill descriptions.

## Review Process (Party Mode)

1.  **Discovery**: VBA agent scans `_bmad/ba-agent/module.json` and `_bmad-output/atoms/`.
2.  **Cross-Check**: VBA verifies that all techniques mentioned in `ba_techniques.md` exist as physical atoms.
3.  **Strategic Review**: Innovation Strategist audits `design.md` for future scalability.
4.  **Narrative Polish**: Storyteller audits the `walkthrough.md` for user impact.
5.  **Consolidation**: VBA creates the final `audit_report.md`.
