# Kiro Spec Methodology Skill

This skill provides a structured framework for complex feature development and surgical bug fixing using the Kiro Specification system.

## Core Structure

Every Kiro Spec is built upon three foundational files:

1.  **requirements.md** (or **bugfix.md**): Captures the "What" and "Why".
2.  **design.md**: Documents the "How" (Architecture, Sequence, Logic).
3.  **tasks.md**: The "When" and "Who" (Execution and Tracking).

---

## 🚀 Feature Specs

Used for new capabilities. Supports two workflows: **Requirements-First** or **Design-First**.

### Requirements Documentation (`requirements.md`)
Uses **EARS (Easy Approach to Requirements Syntax)** for unambiguous, testable behavior.

**Format:**
`WHEN [condition/event] THE SYSTEM SHALL [expected behavior]`

**Example:**
`WHEN a user uploads a BABOK PDF THE SYSTEM SHALL extract text into atoms`

### Technical Design (`design.md`)
- System architecture and component mapping.
- Sequence diagrams and data flow.
- Error handling and edge cases.

---

## 🐞 Bugfix Specs

Used for surgical fixes with regression prevention.

### Bug Analysis (`bugfix.md`)
Explicitly documents three state categories:

1.  **Current Behavior (Defect)**:
    `WHEN [condition] THEN the system [incorrect behavior]`
2.  **Expected Behavior (Correct)**:
    `WHEN [condition] THEN the system SHALL [correct behavior]`
3.  **Unchanged Behavior (Regression Prevention)**:
    `WHEN [condition] THEN the system SHALL CONTINUE TO [existing behavior]`

### Design Phase (`design.md`)
- Root cause analysis.
- Proposed fix approach.
- Property mapping: Current (breaks), Fixed (works), Unchanged (stays working).

---

## 🛠️ Task Execution (`tasks.md`)

- Discrete, trackable implementation tasks.
- Real-time status updates integration.
- Supports property-based testing (PBT) for bug validation.

## Usage in BMAD

This skill enables BMAD agents to:
- Generate structured specs for new modules.
- Audit existing specifications for EARS compliance.
- Orchestrate task execution based on validated design documents.
