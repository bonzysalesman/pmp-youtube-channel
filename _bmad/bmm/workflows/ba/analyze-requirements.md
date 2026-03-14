# Workflow: Analyze Requirements (EARS)

This workflow automates the transformation of raw user requirements into structured, testable EARS notation using the VBA agent.

## Steps

1.  **Input**: Receive raw requirement text or a "BABOK Atom".
2.  **Context Mapping**: Cross-reference the input with relevant BABOK Knowledge Areas (e.g., KA 5: Requirements Analysis).
3.  **Refinement**: VBA agent processes the raw text to identify the Condition, Event, and System Behavior.
4.  **Formatting**: Apply EARS syntax: `WHEN [condition] THE SYSTEM SHALL [behavior]`.
5.  **Validation**: Perform a self-audit against the "Acceptance Criteria for Requirements" in BABOK.
6.  **Output**: Return the refined requirement list.

## Agent Team (Party Mode)
- **Primary**: Virtual Business Analyst (VBA)
- **Reviewer**: Innovation Strategist (CIS)
- **Editor**: Storyteller (CIS)

## Example Execution
- **Input**: "We need a way for students to track their PMP exam scores on the dashboard, but only if they are logged in."
- **Output**: "WHEN a logged-in student visits the dashboard THE SYSTEM SHALL display their PMP exam score history."
