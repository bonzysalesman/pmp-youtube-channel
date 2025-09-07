# Project Organization & Folder Structure

## Root Directory Structure

```
pmp-youtube-channel/
├── src/                          # Main source code
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore patterns
├── .kiro/                        # Kiro IDE configuration
├── README.md                     # Project documentation
├── package.json                  # Node.js dependencies and scripts
├── content-chunking-strategy.md  # Content organization strategy
├── execution-insights-documentation.md  # Process documentation
├── firebase-debug.log           # Firebase integration logs
├── source.md                    # 700+ page PMP study guide source
└── strategic-next-steps.md      # Project roadmap
```

## Source Code Organization (`src/`)

### Templates (`src/templates/`)
Reusable content templates for consistent formatting:
- `video-scripts/`: Script templates for different video types
  - `daily-study.md`: 15-20 minute daily lesson template
  - `practice-session.md`: 20-25 minute practice template
  - `review-session.md`: 15-20 minute review template
  - `channel-trailer.md`: Channel introduction template
- `descriptions/`: Video description templates with SEO optimization
- `thumbnails/`: Thumbnail specifications and design guidelines

### Assets (`src/assets/`)
Brand and production resources:
- `branding/`: Brand guidelines, logos, color schemes
- `production-quick-reference.md`: Production workflow guide

### Automation (`src/automation/`)
Core automation scripts:
- `scripts/content-generator.js`: Generates video content from templates
- `scripts/upload-scheduler.js`: Manages YouTube upload scheduling

### Configuration (`src/config/`)
System configuration and data files:
- `environment.js`: Environment variable management and validation
- `channel-settings.json`: YouTube channel configuration
- `content-schedule.json`: Master content calendar
- `detailed-content-calendar.json`: Comprehensive 13-week schedule
- `complete-13-week-calendar.json`: Full program timeline
- `production-schedule-template.json`: Production workflow template
- `seo-keywords.json`: SEO keyword targeting data
- `video-metadata-database.json`: Video metadata and analytics
- `channel-trailer-production-guide.json`: Trailer production specs

### Content (`src/content/`)
Study materials and content organization:

#### Chunks (`src/content/chunks/`)
Week-by-week study guide content broken into digestible chunks:
- `week-01/`: Introduction and foundations
  - `chunk-01-intro.md`: PMP exam overview
  - `chunk-01-mindset.md`: PMP mindset principles
  - `chunk-01-study-prep.md`: Study strategies
- `week-02/` through `week-08/`: Core content organized by ECO domains
  - People domain focus (weeks 2-4)
  - Process domain focus (weeks 5-8)
  - Business environment integration throughout

#### Cross-References (`src/content/cross-references/`)
Mapping files for content integration:
- `video-to-chunk-mapping.json`: Links videos to study guide sections
- `eco-task-to-chunk-mapping.json`: Maps ECO tasks to content chunks

#### Templates (`src/content/templates/`)
Content formatting templates:
- `chunk-header-template.md`: Standard header format for study chunks
- `video-callout-template.md`: Integration callouts between video and text

## Content Organization Principles

### Week-Based Structure
- **13 weeks total** organized into logical learning progression
- **7 videos per week**: Monday overview, Tue-Fri daily lessons, Saturday practice, Sunday review
- **91 total videos** with consistent naming and organization

### Domain-Based Categorization
Content organized by PMP exam domains with color coding:
- **People Domain (42%)**: Green theme - team building, leadership, conflict management
- **Process Domain (50%)**: Blue theme - planning, execution, monitoring, closing
- **Business Environment (8%)**: Orange theme - organizational factors, compliance

### ECO Task Alignment
Every piece of content maps to specific ECO (Examination Content Outline) tasks:
- Clear task identification in headers and metadata
- Cross-reference system linking content to exam requirements
- Progressive skill building aligned with certification objectives

## File Naming Conventions

### Content Files
- Study chunks: `chunk-[week]-[topic].md` (e.g., `chunk-02-conflict.md`)
- Video scripts: `[type]-[topic].md` (e.g., `daily-study.md`)
- Configuration: `kebab-case-descriptive-name.json`

### Generated Content
- Batch identifiers for production scheduling
- Week and day numbering for chronological organization
- Domain prefixes for categorization

## Integration Patterns

### Video-Text Integration
- **Video callouts** in study chunks: `🎥 Watch Day X: [Topic]`
- **Practice references**: `🎯 Practice Session: [Activity]`
- **Review connections**: `📊 Week Review: [Assessment]`

### Cross-Domain Connections
- Explicit linking between People, Process, and Business Environment content
- Progressive complexity building on previous weeks
- Real-world application scenarios spanning multiple domains

### Template Inheritance
- Consistent header structure across all content types
- Standardized metadata for tracking and analytics
- Reusable components for efficient content creation

## Content Workflow

### Development Process
1. **Planning**: Use content calendar and ECO mapping
2. **Creation**: Apply templates for consistent formatting
3. **Integration**: Link video and text content with cross-references
4. **Validation**: Ensure ECO alignment and learning progression
5. **Production**: Generate final content using automation scripts

### Quality Assurance
- **Content validation**: ECO task coverage and accuracy
- **Integration testing**: Video-text alignment verification
- **Learning progression**: Skill building sequence validation
- **Format consistency**: Template adherence checking

## Scalability Considerations

### Modular Design
- Independent content chunks for flexible reorganization
- Reusable templates for efficient scaling
- Automated generation for consistent output

### Extension Points
- Additional domain content can be added following existing patterns
- New video types can use template system
- Content can be repurposed for different delivery formats

### Maintenance Strategy
- Centralized configuration for easy updates
- Version control for content evolution
- Automated validation for consistency maintenance