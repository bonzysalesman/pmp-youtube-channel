import os

# Configuration
SKILLS_DIR = "/Users/bonzysalesman/Project/pmp-exam-prep/_bmad/pmp/skills"

MICRO_SKILLS = [
    # People
    ("pmp_conflict_management", "Manage Conflict", "People", "TA States, Karpman Triangle, TKI Modes"),
    ("pmp_team_leadership", "Lead A Team", "People", "Vision, Servant Leadership, Adaptive Styles"),
    ("pmp_performance_support", "Support Team Performance", "People", "Tuckman Ladder, KPIs, Feedback Loops"),
    ("pmp_empowerment", "Empower Team Members & Stakeholders", "People", "Delegation, Accountability, Decision-making"),
    ("pmp_training_facilitation", "Ensure Training Facilitation", "People", "Needs Analysis, Delivery, Measurement"),
    ("pmp_team_building", "Build A Team", "People", "Skill Mapping, Resource Acquisition"),
    ("pmp_impediment_removal", "Remove Impediments", "People", "Blocker Identification, Escalation, Resolution"),
    ("pmp_negotiation", "Negotiate Project Agreements", "People", "BATNA, Win-Win Strategies, Procurement"),
    ("pmp_stakeholder_collaboration", "Collaborate with Stakeholders", "People", "Alignment, Trust Building, Transparency"),
    ("pmp_shared_understanding", "Build Shared Understanding", "People", "Consensus, Active Listening, Documentation"),
    ("pmp_virtual_team_management", "Support Virtual Teams", "People", "Tools, Timezones, Cultural Nuances"),
    ("pmp_ground_rules", "Define Ground Rules", "People", "Team Charter, Professional Standards"),
    ("pmp_mentoring", "Mentor Relevant Stakeholders", "People", "Knowledge Sharing, Coaching, Growth"),
    ("pmp_emotional_intelligence", "Applying Emotional Intelligence", "People", "Self-awareness, Empathy, Motivation"),
    
    # Process
    ("pmp_value_delivery", "Execute with Business Value", "Process", "Urgency, MVP, Incremental Delivery"),
    ("pmp_communications_management", "Manage Communications", "Process", "Requirements, Push/Pull, Feedback"),
    ("pmp_risk_management", "Assess and Manage Risks", "Process", "Identification, Quantitative/Qualitative"),
    ("pmp_stakeholder_engagement", "Engage Stakeholders", "Process", "Power/Interest, Influence, Matrices"),
    ("pmp_resource_management", "Manage Budget and Resources", "Process", "Cost Baseline, Estimates, Material Resources"),
    ("pmp_schedule_management", "Plan and Manage Schedule", "Process", "Critical Path, CPM, Agile Timeboxing"),
    ("pmp_quality_management", "Manage Quality", "Process", "Standards, QA/QC, Continuous Improvement"),
    ("pmp_scope_management", "Plan and Manage Scope", "Process", "WBS, DoD, Backlog Grooming"),
    ("pmp_integration_planning", "Integrate Planning", "Process", "Project Management Plan, Alignment"),
    ("pmp_change_management", "Manage Project Changes", "Process", "CCB, Impact Analysis, Agile Flex"),
    ("pmp_procurement_management", "Plan and Manage Procurement", "Process", "SOW, Bid Documents, Contracts"),
    ("pmp_artefact_management", "Manage Project Artefacts", "Process", "Version Control, Storage, Traceability"),
    ("pmp_methodology_selection", "Determine Methodology", "Process", "Predictive, Agile, Hybrid Selection"),
    ("pmp_governance_establishment", "Establish Governance", "Process", "Frameworks, Decision Rights, Escalation"),
    ("pmp_issue_management", "Manage Project Issues", "Process", "Issue Log, Resolution Tracking"),
    ("pmp_knowledge_transfer", "Ensure Knowledge Transfer", "Process", "Lessons Learned, Explicit/Tacit, Continuity"),
    ("pmp_closure_management", "Manage Closure/Transitions", "Process", "Handover, Archival, Release of Resources"),
    
    # Business Environment
    ("pmp_compliance_management", "Plan Project Compliance", "Business Environment", "Regulations, Standards, Audits"),
    ("pmp_benefits_evaluation", "Deliver Benefits and Value", "Business Environment", "Business Case, NPV, Realization Plans"),
    ("pmp_env_change_analysis", "Address Env Changes", "Business Environment", "PESTLE, Market Analysis, Scope Impact"),
    ("pmp_org_change_support", "Support Org Change", "Business Environment", "Culture, Readiness, Transition Support"),
]

def generate_skills():
    if not os.path.exists(SKILLS_DIR):
        os.makedirs(SKILLS_DIR)
        
    for ident, task, domain, focus in MICRO_SKILLS:
        filepath = os.path.join(SKILLS_DIR, f"{ident}.md")
        content = f"""# Skill: {task} ({ident})

## Domain: {domain}

## Focus Areas
{focus}

## Description
This micro-skill enables the Virtual Business Analyst to perform the PMP ECO Task: "{task}". 

## PMP Context
- **ECO Alignment**: Mapping to Domain: {domain}.
- **Knowledge Base**: Leveraging PMP Mastery content and BABOK v3 atoms.

## Usage
- Trigger during {domain.lower()} phases.
- Cross-reference with relevant BABOK techniques for execution.
"""
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Generated {filepath}")

if __name__ == "__main__":
    generate_skills()
