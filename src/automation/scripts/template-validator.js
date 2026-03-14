/**
 * Video Script Template Validator
 * Validates video script templates for 7-section format compliance,
 * timing requirements, and variable completeness
 */

const fs = require('fs');
const path = require('path');

class TemplateValidator {
    constructor() {
        this.validationRules = {
            dailyStudy: {
                totalDuration: { min: 15, max: 20 },
                sections: {
                    hook: { min: 0, max: 30, required: true },
                    learningObjectives: { min: 30, max: 30, required: true },
                    ecoConnection: { min: 30, max: 30, required: true },
                    mainContent: { min: 8*60, max: 12*60, required: true },
                    practiceApplication: { min: 2*60, max: 4*60, required: true },
                    keyTakeaways: { min: 60, max: 120, required: true },
                    nextPreview: { min: 30, max: 30, required: true }
                }
            },
            practiceSession: {
                totalDuration: { min: 20, max: 25 },
                sections: {
                    hook: { min: 0, max: 30, required: true },
                    learningObjectives: { min: 30, max: 30, required: true },
                    ecoConnection: { min: 30, max: 30, required: true },
                    mainContent: { min: 15*60, max: 18*60, required: true },
                    practiceApplication: { min: 2*60, max: 3*60, required: true },
                    keyTakeaways: { min: 60, max: 120, required: true },
                    nextPreview: { min: 30, max: 30, required: true }
                }
            },
            reviewSession: {
                totalDuration: { min: 15, max: 20 },
                sections: {
                    hook: { min: 0, max: 30, required: true },
                    learningObjectives: { min: 30, max: 30, required: true },
                    ecoConnection: { min: 30, max: 30, required: true },
                    mainContent: { min: 8*60, max: 10*60, required: true },
                    practiceApplication: { min: 3*60, max: 4*60, required: true },
                    keyTakeaways: { min: 60, max: 120, required: true },
                    nextPreview: { min: 30, max: 30, required: true }
                }
            }
        };

        this.requiredVariables = {
            core: [
                'week_number', 'day_number', 'topic_title', 'target_duration',
                'domain', 'domain_percentage', 'work_group'
            ],
            eco: [
                'eco_tasks', 'primary_eco_task', 'eco_task_description',
                'supporting_eco_tasks', 'eco_task_weight'
            ],
            content: [
                'hook_content', 'objective_1', 'objective_2', 'objective_3',
                'main_content_outline', 'takeaway_1', 'takeaway_2', 'takeaway_3'
            ],
            production: [
                'batch_session_id', 'domain_color', 'target_keywords', 'seo_title_formula'
            ]
        };
    }

    /**
     * Validate a template file
     * @param {string} templatePath - Path to template file
     * @param {string} templateType - Type of template (dailyStudy, practiceSession, reviewSession)
     * @returns {Object} Validation results
     */
    validateTemplate(templatePath, templateType) {
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            templateType,
            templatePath
        };

        try {
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            
            // Validate 7-section structure
            this.validateSectionStructure(templateContent, templateType, results);
            
            // Validate timing requirements
            this.validateTimingRequirements(templateContent, templateType, results);
            
            // Validate variable completeness
            this.validateVariables(templateContent, templateType, results);
            
            // Validate content quality
            this.validateContentQuality(templateContent, templateType, results);
            
        } catch (error) {
            results.isValid = false;
            results.errors.push(`Failed to read template file: ${error.message}`);
        }

        return results;
    }

    /**
     * Validate that template has all required sections
     */
    validateSectionStructure(content, templateType, results) {
        const requiredSections = [
            'Hook', 'Learning Objectives', 'ECO Connection', 
            'Main Content', 'Practice Application', 'Key Takeaways', 'Next Preview'
        ];

        const sectionPattern = /### \d+\.\s*([^(]+)/g;
        const foundSections = [];
        let match;

        while ((match = sectionPattern.exec(content)) !== null) {
            foundSections.push(match[1].trim());
        }

        requiredSections.forEach(section => {
            const found = foundSections.some(found => 
                found.toLowerCase().includes(section.toLowerCase())
            );
            
            if (!found) {
                results.errors.push(`Missing required section: ${section}`);
                results.isValid = false;
            }
        });

        if (foundSections.length !== 7) {
            results.errors.push(`Expected 7 sections, found ${foundSections.length}`);
            results.isValid = false;
        }
    }

    /**
     * Validate timing requirements for each section
     */
    validateTimingRequirements(content, templateType, results) {
        const rules = this.validationRules[templateType];
        if (!rules) {
            results.errors.push(`Unknown template type: ${templateType}`);
            results.isValid = false;
            return;
        }

        // Check for timing validation comments
        const timingPattern = /\*\*Timing Validation:\*\*\s*([^*]+)/g;
        const timingValidations = [];
        let match;

        while ((match = timingPattern.exec(content)) !== null) {
            timingValidations.push(match[1].trim());
        }

        if (timingValidations.length < 7) {
            results.warnings.push('Not all sections have timing validation comments');
        }

        // Check for duration requirements in content
        const durationPattern = /\[REQUIRED - ([^\]]+)\]/g;
        const durationRequirements = [];
        
        while ((match = durationPattern.exec(content)) !== null) {
            durationRequirements.push(match[1].trim());
        }

        if (durationRequirements.length < 7) {
            results.errors.push('Not all sections have duration requirements specified');
            results.isValid = false;
        }
    }

    /**
     * Validate that all required variables are present
     */
    validateVariables(content, templateType, results) {
        const allRequiredVars = [
            ...this.requiredVariables.core,
            ...this.requiredVariables.eco,
            ...this.requiredVariables.content,
            ...this.requiredVariables.production
        ];

        const variablePattern = /\{\{([^}]+)\}\}/g;
        const foundVariables = new Set();
        let match;

        while ((match = variablePattern.exec(content)) !== null) {
            foundVariables.add(match[1].trim());
        }

        // Check for missing required variables
        allRequiredVars.forEach(variable => {
            if (!foundVariables.has(variable)) {
                results.warnings.push(`Missing recommended variable: {{${variable}}}`);
            }
        });

        // Check for undefined variables (variables not in our definitions)
        const definedVariables = new Set([
            ...allRequiredVars,
            // Add template-specific variables
            'hook_opening', 'hook_problem', 'hook_promise',
            'concept_intro', 'core_principles', 'real_world_examples',
            'practice_scenario_setup', 'practice_question', 'correct_answer',
            'study_guide_pages', 'next_topic', 'cta_message'
        ]);

        foundVariables.forEach(variable => {
            if (!definedVariables.has(variable) && !variable.includes('_')) {
                results.warnings.push(`Undefined variable found: {{${variable}}}`);
            }
        });
    }

    /**
     * Validate content quality and structure
     */
    validateContentQuality(content, templateType, results) {
        // Check for quality assurance checklist
        if (!content.includes('Quality Assurance Checklist')) {
            results.errors.push('Missing Quality Assurance Checklist section');
            results.isValid = false;
        }

        // Check for validation rules
        if (!content.includes('Validation Rules')) {
            results.errors.push('Missing Validation Rules section');
            results.isValid = false;
        }

        // Check for variable definitions
        if (!content.includes('Variable Definitions')) {
            results.errors.push('Missing Variable Definitions section');
            results.isValid = false;
        }

        // Check for production notes
        if (!content.includes('Production Notes')) {
            results.errors.push('Missing Production Notes section');
            results.isValid = false;
        }

        // Validate that each section has purpose documentation
        const purposePattern = /\*\*Purpose:\*\*/g;
        const purposeCount = (content.match(purposePattern) || []).length;
        
        if (purposeCount < 7) {
            results.warnings.push('Not all sections have purpose documentation');
        }
    }

    /**
     * Validate all templates in the templates directory
     */
    validateAllTemplates() {
        const templatesDir = path.join(__dirname, '../../templates/video-scripts');
        const templateFiles = {
            'daily-study.md': 'dailyStudy',
            'practice-session.md': 'practiceSession',
            'review-session.md': 'reviewSession'
        };

        const results = {
            overall: { isValid: true, totalErrors: 0, totalWarnings: 0 },
            templates: {}
        };

        Object.entries(templateFiles).forEach(([filename, templateType]) => {
            const templatePath = path.join(templatesDir, filename);
            
            if (fs.existsSync(templatePath)) {
                const validation = this.validateTemplate(templatePath, templateType);
                results.templates[filename] = validation;
                
                if (!validation.isValid) {
                    results.overall.isValid = false;
                }
                
                results.overall.totalErrors += validation.errors.length;
                results.overall.totalWarnings += validation.warnings.length;
            } else {
                results.templates[filename] = {
                    isValid: false,
                    errors: [`Template file not found: ${templatePath}`],
                    warnings: [],
                    templateType,
                    templatePath
                };
                results.overall.isValid = false;
                results.overall.totalErrors += 1;
            }
        });

        return results;
    }

    /**
     * Generate validation report
     */
    generateReport(results) {
        let report = '\n=== VIDEO SCRIPT TEMPLATE VALIDATION REPORT ===\n\n';
        
        report += `Overall Status: ${results.overall.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
        report += `Total Errors: ${results.overall.totalErrors}\n`;
        report += `Total Warnings: ${results.overall.totalWarnings}\n\n`;

        Object.entries(results.templates).forEach(([filename, validation]) => {
            report += `--- ${filename} (${validation.templateType}) ---\n`;
            report += `Status: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
            
            if (validation.errors.length > 0) {
                report += `Errors (${validation.errors.length}):\n`;
                validation.errors.forEach(error => {
                    report += `  ❌ ${error}\n`;
                });
            }
            
            if (validation.warnings.length > 0) {
                report += `Warnings (${validation.warnings.length}):\n`;
                validation.warnings.forEach(warning => {
                    report += `  ⚠️  ${warning}\n`;
                });
            }
            
            if (validation.errors.length === 0 && validation.warnings.length === 0) {
                report += '  ✅ No issues found\n';
            }
            
            report += '\n';
        });

        return report;
    }
}

// CLI interface
if (require.main === module) {
    const validator = new TemplateValidator();
    const results = validator.validateAllTemplates();
    const report = validator.generateReport(results);
    
    console.log(report);
    
    // Exit with error code if validation failed
    process.exit(results.overall.isValid ? 0 : 1);
}

module.exports = TemplateValidator;