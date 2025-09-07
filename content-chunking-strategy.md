# Content Chunking Strategy for Source.md

## Overview

This document outlines how to chunk the 700+ page PMP study guide (source.md) into logical segments that align with our 13-week video content calendar and integrated learning system. The chunking strategy ensures seamless integration between written content and video lessons while maintaining educational coherence and exam preparation effectiveness.

## Current Source.md Structure Analysis

### Main Sections Identified:
- **Section 0:** About the PMP Exam (Foundation)
- **Section I:** People Domain (42% of exam) - 14 ECO tasks
- **Section II:** Process Domain (50% of exam) - 17 ECO tasks  
- **Section III:** Business Environment (8% of exam) - 4 ECO tasks
- **Section IV:** The PMP Mindset (Critical thinking approach)
- **Section V:** Preparing for the Exam (Study strategies and logistics)

### Content Calendar Structure:
- **13 weeks** organized into 3 months
- **91 total videos** (daily study + practice + review)
- **Work group themes:** Building Team → Starting Project → Doing Work → Leadership & Compliance
- **Domain focus:** People (42%), Process (50%), Business Environment (8%)

## Chunking Strategy by Week

### **Week 1: Introduction & Foundations**
**Study Guide Chunks:**
- `chunk-01-intro.md`: Section 0 - About the PMP Exam (complete)
- `chunk-01-mindset.md`: Section IV - The PMP Mindset (4.1 Core Principles)
- `chunk-01-study-prep.md`: Section V.1.1-V.1.3 (Study strategies, question types, time management)

**Video Alignment:**
- Day 1: PMP Exam Overview → chunk-01-intro.md (Section 0.1)
- Day 2: Study Resources → chunk-01-study-prep.md (Section V.1.1-V.1.2)
- Day 3: Master the ECO → chunk-01-intro.md (ECO explanation)
- Day 4: PMP Mindset → chunk-01-mindset.md (Section IV.1)

### **Week 2: Building a Team (Part 1)**
**Study Guide Chunks:**
- `chunk-02-team-basics.md`: Section I.6 (Build A Team), I.12 (Define Team Ground Rules)
- `chunk-02-conflict.md`: Section I.1 (Manage Conflict)
- `chunk-02-negotiation.md`: Section I.8 (Negotiate Project Agreements)
- `chunk-02-empowerment.md`: Section I.4 (Empower Team Members & Stakeholders)

**Video Alignment:**
- Day 8: Team Ground Rules → chunk-02-team-basics.md (Section I.12)
- Day 9: Negotiation Skills → chunk-02-negotiation.md (Section I.8)
- Day 10: Servant Leadership → chunk-02-empowerment.md (Section I.4)

### **Week 3: Building a Team (Part 2)**
**Study Guide Chunks:**
- `chunk-03-virtual-teams.md`: Section I.11 (Engage and Support Virtual Teams)
- `chunk-03-team-performance.md`: Section I.3 (Support Team Performance), I.14 (Emotional Intelligence)
- `chunk-03-training.md`: Section I.5 (Ensure Adequate Training)
- `chunk-03-mentoring.md`: Section I.13 (Mentor Relevant Stakeholders)

### **Week 4: Team Leadership & Collaboration**
**Study Guide Chunks:**
- `chunk-04-leadership.md`: Section I.2 (Lead A Team)
- `chunk-04-collaboration.md`: Section I.9 (Collaborate with Stakeholders), I.10 (Build Shared Understanding)
- `chunk-04-impediments.md`: Section I.7 (Address & Remove Impediments)

### **Week 5: Starting the Project (Planning Foundation)**
**Study Guide Chunks:**
- `chunk-05-integration.md`: Section II.9 (Integrate Project Planning Activities)
- `chunk-05-methodology.md`: Section II.13 (Determine Appropriate Methodology)
- `chunk-05-governance.md`: Section II.14 (Establish Project Governance Structure)

### **Week 6: Scope, Schedule & Resources**
**Study Guide Chunks:**
- `chunk-06-scope.md`: Section II.8 (Plan and Manage Scope)
- `chunk-06-schedule.md`: Section II.6 (Plan and Manage Schedule)
- `chunk-06-resources.md`: Section II.5 (Plan and Manage Budget and Resources)

### **Week 7: Quality, Risk & Communications**
**Study Guide Chunks:**
- `chunk-07-quality.md`: Section II.7 (Plan and Manage Quality)
- `chunk-07-risk.md`: Section II.3 (Assess and Manage Risks)
- `chunk-07-communications.md`: Section II.2 (Manage Communications)

### **Week 8: Procurement & Stakeholder Engagement**
**Study Guide Chunks:**
- `chunk-08-procurement.md`: Section II.11 (Plan and Manage Procurement)
- `chunk-08-stakeholders.md`: Section II.4 (Engage Stakeholders)
- `chunk-08-artifacts.md`: Section II.12 (Manage Project Artefacts)

### **Week 9: Project Execution & Value Delivery**
**Study Guide Chunks:**
- `chunk-09-execution.md`: Section II.1 (Execute Projects with Urgency for Business Value)
- `chunk-09-value.md`: Section III.2 (Evaluate and Deliver Project Benefits and Value)
- `chunk-09-changes.md`: Section II.10 (Manage Project Changes)

### **Week 10: Monitoring & Issue Management**
**Study Guide Chunks:**
- `chunk-10-issues.md`: Section II.15 (Manage Project Issues)
- `chunk-10-knowledge.md`: Section II.16 (Ensure Knowledge Transfer)
- `chunk-10-compliance.md`: Section III.1 (Plan and Manage Project Compliance)

### **Week 11: Business Environment & Organizational Change**
**Study Guide Chunks:**
- `chunk-11-business-env.md`: Section III.3 (Evaluate External Business Environment Changes)
- `chunk-11-org-change.md`: Section III.4 (Support Organisational Change)
- `chunk-11-closure.md`: Section II.17 (Plan and Manage Project/Phase Closure)

### **Week 12: Exam Preparation Intensive**
**Study Guide Chunks:**
- `chunk-12-exam-prep.md`: Section V.1.4-V.1.6 (Practice exams, test anxiety, exam day procedures)
- `chunk-12-review-people.md`: Section I summary and practice questions
- `chunk-12-review-process.md`: Section II summary and practice questions

### **Week 13: Final Preparation & Confidence Building**
**Study Guide Chunks:**
- `chunk-13-final-review.md`: Section V.1.7-V.1.8 (PMI resources, final study plan)
- `chunk-13-business-env.md`: Section III summary and practice questions
- `chunk-13-mindset-mastery.md`: Section IV complete review and application

## Technical Implementation Strategy

### File Structure
```
src/content/
├── chunks/
│   ├── week-01/
│   │   ├── chunk-01-intro.md
│   │   ├── chunk-01-mindset.md
│   │   └── chunk-01-study-prep.md
│   ├── week-02/
│   │   ├── chunk-02-team-basics.md
│   │   ├── chunk-02-conflict.md
│   │   ├── chunk-02-negotiation.md
│   │   └── chunk-02-empowerment.md
│   └── [continues for all 13 weeks]
├── cross-references/
│   ├── video-to-chunk-mapping.json
│   ├── eco-task-to-chunk-mapping.json
│   └── chunk-to-video-mapping.json
└── templates/
    ├── chunk-header-template.md
    └── video-callout-template.md
```

### Chunk Header Template
Each chunk should include:
```markdown
# [Chunk Title]

**Week:** [Week Number]
**Domain:** [People/Process/Business Environment]
**ECO Tasks:** [List of relevant ECO tasks]
**Video References:** 
- 🎥 Day [X]: [Video Title] - [Specific topics covered]
- 🎯 Practice: [Practice session details]

**Study Guide Sections:** [Original section numbers from source.md]
**Estimated Reading Time:** [X minutes]
**Key Learning Outcomes:** [Bullet points]

---

[Content begins here]
```

### Cross-Reference System
1. **Video Callouts in Chunks:**
   - `🎥 **Watch Day 8:** Team Ground Rules in Action`
   - `🎯 **Practice Session:** Apply conflict resolution techniques`
   - `📊 **Week Review:** Test your team building knowledge`

2. **Study Guide References in Videos:**
   - "Read pages 45-52 in your study guide for detailed examples"
   - "Complete the activity on page 67 before tomorrow's lesson"
   - "Review the conflict resolution framework in Section 1.1"

### Content Synchronization Rules

1. **ECO Task Alignment:** Each chunk must map to specific ECO tasks covered in corresponding videos
2. **Progressive Complexity:** Chunks build on previous knowledge, matching video progression
3. **Practice Integration:** Each chunk includes practice elements that align with video practice sessions
4. **Cross-Domain Connections:** Highlight relationships between People, Process, and Business Environment domains

## Quality Assurance for Chunking

### Content Validation Checklist
- [ ] Each chunk aligns with corresponding week's video content
- [ ] ECO tasks are properly mapped and referenced
- [ ] Learning objectives match between chunk and videos
- [ ] Practice elements are consistent across formats
- [ ] Cross-references are accurate and functional
- [ ] Chunk length is appropriate for weekly study load

### Educational Coherence Checks
- [ ] Concepts build logically from week to week
- [ ] Domain percentages are maintained (People 42%, Process 50%, Business 8%)
- [ ] PMP mindset is consistently reinforced
- [ ] Real-world examples align between written and video content

## Implementation Priority

### Phase 1: Foundation Chunks (Weeks 1-4)
- Critical for establishing learning framework
- Includes introduction, mindset, and team building basics
- Supports early video production and community launch

### Phase 2: Core Content Chunks (Weeks 5-10)
- Covers main Process domain content
- Aligns with "doing the work" phase of program
- Requires careful ECO task mapping

### Phase 3: Integration & Preparation Chunks (Weeks 11-13)
- Business environment and exam preparation focus
- Synthesizes learning from previous weeks
- Supports final preparation and confidence building

## Success Metrics for Chunking Strategy

1. **Content Integration Effectiveness:**
   - Cross-reference usage rates between chunks and videos
   - User feedback on content alignment and flow

2. **Learning Progression:**
   - Completion rates for chunk + video combinations
   - Knowledge retention between weekly assessments

3. **Exam Preparation Quality:**
   - Correlation between chunk engagement and practice exam scores
   - User confidence levels throughout 13-week progression

This chunking strategy ensures that the 700+ page study guide becomes an integrated part of the learning experience rather than a separate resource, supporting our goal of creating a comprehensive PMP certification preparation ecosystem.