# Video Script Templates - 13-Week Calendar

This directory contains structured video script templates for the 13-week PMP certification preparation YouTube series. Each template implements the required 7-section format with comprehensive variable substitution and validation systems.

## Template Types

### 1. Daily Study Videos (`daily-study.md`)
- **Duration:** 15-20 minutes (Target: 18 minutes)
- **Purpose:** Core educational content delivery
- **Frequency:** Tuesday-Friday each week
- **7-Section Format:**
  1. Hook (0-30s) - Grab attention and establish relevance
  2. Learning Objectives (30s) - Set clear expectations
  3. ECO Connection (30s) - Link to exam requirements
  4. Main Content (8-12min) - Core educational delivery
  5. Practice Application (2-4min) - Apply through scenarios
  6. Key Takeaways (60-120s) - Reinforce key concepts
  7. Next Preview (30s) - Build anticipation

### 2. Practice Sessions (`practice-session.md`)
- **Duration:** 20-25 minutes (Target: 22 minutes)
- **Purpose:** Scenario-based skill application
- **Frequency:** Saturday each week
- **7-Section Format:**
  1. Hook (0-30s) - Energize for practice
  2. Learning Objectives (30s) - Set practice expectations
  3. ECO Connection (30s) - Connect to exam requirements
  4. Main Content (15-18min) - Three detailed scenarios
  5. Practice Application (2-3min) - Pattern recognition
  6. Key Takeaways (60-120s) - Reinforce principles
  7. Next Preview (30s) - Maintain momentum

### 3. Review Sessions (`review-session.md`)
- **Duration:** 15-20 minutes (Target: 18 minutes)
- **Purpose:** Weekly integration and assessment
- **Frequency:** Sunday each week
- **7-Section Format:**
  1. Hook (0-30s) - Celebrate progress
  2. Learning Objectives (30s) - Set review expectations
  3. ECO Connection (30s) - Show cumulative progress
  4. Main Content (8-10min) - Integrate week's concepts
  5. Practice Application (3-4min) - Multi-concept testing
  6. Key Takeaways (60-120s) - Consolidate learning
  7. Next Preview (30s) - Prepare for transition

## Variable Substitution System

### Core Variables (All Templates)
```
{{week_number}}          - Week 1-13
{{day_number}}           - Sequential day number (1-91)
{{topic_title}}          - Main topic for the session
{{target_duration}}      - Specific target length in minutes
{{domain}}               - People, Process, or Business Environment
{{domain_percentage}}    - 42%, 50%, or 8%
{{work_group}}           - Current work group focus
{{week_theme}}           - Theme for the week
```

### ECO Variables
```
{{eco_tasks}}            - Comma-separated list of ECO tasks
{{primary_eco_task}}     - Main ECO task (e.g., "1.1", "2.3")
{{eco_task_description}} - Description of primary ECO task
{{supporting_eco_tasks}} - Additional related ECO tasks
{{eco_task_weight}}      - Percentage weight on exam
```

### Content Variables
```
{{hook_content}}         - Hook section content
{{objective_1/2/3}}      - Learning objectives
{{main_content_outline}} - Main content structure
{{takeaway_1/2/3}}       - Key takeaway points
{{next_topic}}           - Next session topic
```

### Production Variables
```
{{batch_session_id}}     - Recording batch identifier
{{domain_color}}         - Thumbnail color (green/blue/orange/purple)
{{target_keywords}}      - SEO keywords for the content
{{seo_title_formula}}    - Optimized title for YouTube
```

## Usage Instructions

### 1. Template Validation
Validate all templates for 7-section compliance and timing requirements:
```bash
npm run validate-templates
```

### 2. Variable Mapping
Generate variable mappings for specific content:
```bash
npm run map-variables <week> <day> <template-type>

# Examples:
npm run map-variables 1 tuesday dailyStudy
npm run map-variables 2 saturday practiceSession
npm run map-variables 3 sunday reviewSession
```

### 3. Template Testing
Run comprehensive template validation and variable mapping:
```bash
npm run test-templates
```

### 4. Content Generation
Use the enhanced content generator with template system:
```bash
npm run generate-content week 1
npm run generate-from-calendar
```

## Validation System

The template validation system checks for:

### Structure Validation
- ✅ All 7 required sections present
- ✅ Proper section numbering and formatting
- ✅ Required timing annotations
- ✅ Duration requirements specified

### Timing Validation
- ✅ Section timing within specified ranges
- ✅ Total duration compliance
- ✅ Timing validation comments present
- ✅ Purpose documentation for each section

### Variable Validation
- ✅ All required variables present
- ✅ Variable definitions documented
- ✅ No undefined variables used
- ✅ Template-specific variables included

### Quality Validation
- ✅ Quality Assurance Checklist present
- ✅ Validation Rules documented
- ✅ Production Notes included
- ✅ Variable Definitions section complete

## Template Customization

### Adding New Variables
1. Define the variable in the Variable Definitions section
2. Add mapping logic in `template-variable-mapper.js`
3. Update validation rules in `template-validator.js`
4. Test with `npm run test-templates`

### Creating New Template Types
1. Create new template file following 7-section format
2. Add validation rules to `template-validator.js`
3. Add variable mapping logic to `template-variable-mapper.js`
4. Update npm scripts in `package.json`

### Modifying Section Timing
1. Update timing requirements in template comments
2. Adjust validation rules in `template-validator.js`
3. Test compliance with `npm run validate-templates`

## Integration with Content Calendar

Templates integrate with the 13-week calendar system:

- **Week Data:** Pulled from `src/config/complete-13-week-calendar.json`
- **ECO Mapping:** Connected via `src/content/cross-references/eco-task-to-chunk-mapping.json`
- **Keywords:** Sourced from `src/config/seo-keywords.json`
- **Channel Settings:** Applied from `src/config/channel-settings.json`

## Quality Assurance Process

### Pre-Production Checklist
- [ ] Template validation passes (0 errors)
- [ ] All variables populated correctly
- [ ] Timing requirements verified
- [ ] ECO task alignment confirmed
- [ ] SEO optimization applied

### Post-Production Validation
- [ ] Content matches template structure
- [ ] Section timing within requirements
- [ ] All quality checkpoints met
- [ ] Variable substitution accurate
- [ ] Educational objectives achieved

## Troubleshooting

### Common Issues

**Template Validation Fails**
- Check section structure and numbering
- Verify timing annotations are present
- Ensure all required sections included

**Variable Mapping Errors**
- Verify calendar data is available
- Check ECO mapping file exists
- Confirm week/day parameters are valid

**Missing Variables**
- Add variable definitions to template
- Update mapper with data source
- Test with validation system

### Getting Help

1. Run `npm run validate-templates` for detailed error reports
2. Check template structure against working examples
3. Verify data source files are present and valid
4. Test variable mapping with known good parameters

## File Structure

```
src/templates/video-scripts/
├── README.md                    # This documentation
├── daily-study.md              # Daily lesson template
├── practice-session.md         # Practice session template
├── review-session.md           # Weekly review template
└── channel-trailer.md          # Channel introduction template

src/automation/scripts/
├── template-validator.js       # Validation system
├── template-variable-mapper.js # Variable mapping system
└── content-generator.js        # Content generation (enhanced)
```

## Version History

- **v1.0** - Initial 7-section template structure
- **v1.1** - Added comprehensive variable substitution
- **v1.2** - Implemented validation system
- **v1.3** - Enhanced with timing requirements and quality assurance

---

For questions or issues with the template system, refer to the validation output or check the integration with the broader content generation pipeline.