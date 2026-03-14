# Workflow: PMP Strategic Requirement Analysis (VBA + Storyteller)

This workflow incorporates the "Story of Value" recommendation from the Audit Report to transform raw needs into strategically aligned, narrative-rich requirements.

## Participants
1.  **VBA**: Logic, BABOK alignment, and ECO mapping.
2.  **Storyteller**: Strategic framing and stakeholder narrative.

## Workflow Steps

1.  **Elicitation**: VBA receives a raw input (e.g., "Stakeholders are unhappy with the reporting frequency").
2.  **Surgical Analysis**: 
    - VBA identifies the BABOK "Need".
    - VBA selects the appropriate Technique (e.g., `TECH_10.43_Stakeholder_List,_Map,_or_Personas.md`).
3.  **Conflict Audit**: 
    - VBA uses `pmp_conflict_auditor` to detect if the input stems from a specific TA ego state (e.g., "Critical Parent").
4.  **ECO Mapping**:
    - VBA maps the requirement to `ECO_Task_1.9` (Collaborate with Stakeholders).
5.  **Story of Value (The Polish)**:
    - **Storyteller** re-frames the technical requirement into a value-driven story.
    - *Example*: "Instead of 'Implement weekly reports', the story is 'Provide stakeholders with a real-time transparency window to build trust and accelerate decision-making'."
6.  **Final Output**: Structured EARS requirement with ECO tags and a "Value Story" footer.
