/**
 * Content Accuracy Reviewer
 * Manages content accuracy review workflow with subject matter expert integration
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class ContentAccuracyReviewer {
    constructor() {
        this.reviewersPath = path.join(__dirname, '../../config/reviewers.json');
        this.reviewers = this.loadReviewers();
        this.accuracyChecks = this.loadAccuracyChecks();
    }

    loadReviewers() {
        if (fs.existsSync(this.reviewersPath)) {
            return fs.readJsonSync(this.reviewersPath);
        }
        return this.getDefaultReviewers();
    }

    getDefaultReviewers() {
        return {
            subjectMatterExperts: [
                {
                    id: "sme_001",
                    name: "Senior PMP Expert",
                    email: "sme1@example.com",
                    specialties: ["people", "leadership", "team_management"],
                    certifications: ["PMP", "PMI-ACP", "PgMP"],
                    experience: "15+ years",
                    availability: "weekdays",
                    maxReviewsPerWeek: 5,
                    averageReviewTime: 24 // hours
                },
                {
                    id: "sme_002", 
                    name: "Process Expert",
                    email: "sme2@example.com",
                    specialties: ["process", "planning", "risk_management"],
                    certifications: ["PMP", "PMI-RMP"],
                    experience: "12+ years",
                    availability: "flexible",
                    maxReviewsPerWeek: 8,
                    averageReviewTime: 18
                },
                {
                    id: "sme_003",
                    name: "Business Environment Specialist",
                    email: "sme3@example.com", 
                    specialties: ["business", "compliance", "organizational_change"],
                    certifications: ["PMP", "PMI-PBA"],
                    experience: "10+ years",
                    availability: "evenings_weekends",
                    maxReviewsPerWeek: 3,
                    averageReviewTime: 36
                }
            ],
            internalReviewers: [
                {
                    id: "int_001",
                    name: "Content Manager",
                    email: "content@example.com",
                    role: "content_manager",
                    specialties: ["content_structure", "seo", "engagement"],
                    maxReviewsPerWeek: 20,
                    averageReviewTime: 4
                },
                {
                    id: "int_002",
                    name: "Educational Designer",
                    email: "education@example.com",
                    role: "instructional_designer",
                    specialties: ["learning_objectives", "assessment", "pedagogy"],
                    maxReviewsPerWeek: 15,
                    averageReviewTime: 6
                }
            ]
        };
    }

    loadAccuracyChecks() {
        return {
            pmpConcepts: [
                {
                    category: "Project Management Fundamentals",
                    checks: [
                        "Correct definition of project vs operations",
                        "Accurate project lifecycle descriptions",
                        "Proper use of PM terminology",
                        "Alignment with PMI standards"
                    ]
                },
                {
                    category: "People Domain",
                    checks: [
                        "Leadership styles accurately described",
                        "Conflict resolution techniques correct",
                        "Team development stages properly explained",
                        "Stakeholder engagement approaches valid"
                    ]
                },
                {
                    category: "Process Domain", 
                    checks: [
                        "Process groups correctly defined",
                        "Knowledge areas properly explained",
                        "Tools and techniques accurately described",
                        "Inputs/outputs correctly identified"
                    ]
                },
                {
                    category: "Business Environment",
                    checks: [
                        "Organizational structures correctly described",
                        "Compliance requirements accurate",
                        "Business value concepts correct",
                        "Change management principles valid"
                    ]
                }
            ],
            commonErrors: [
                {
                    error: "Confusing project manager vs project leader roles",
                    correction: "Clarify that project manager is a formal role with authority",
                    severity: "high"
                },
                {
                    error: "Mixing agile and traditional terminology incorrectly",
                    correction: "Use methodology-appropriate terminology consistently",
                    severity: "medium"
                },
                {
                    error: "Outdated PMI standards or processes",
                    correction: "Ensure alignment with current PMI standards",
                    severity: "high"
                },
                {
                    error: "Incorrect ECO task mapping",
                    correction: "Verify content maps to correct ECO tasks",
                    severity: "high"
                }
            ]
        };
    }

    /**
     * Assign reviewers based on content type and domain
     */
    assignReviewers(contentData, reviewType = 'accuracy') {
        const assignments = [];
        
        // Determine content domain focus
        const domainFocus = this.analyzeDomainFocus(contentData);
        
        // Assign SME based on domain
        const sme = this.findBestSME(domainFocus);
        if (sme) {
            assignments.push({
                reviewerId: sme.id,
                reviewerName: sme.name,
                reviewerType: 'sme',
                specialty: sme.specialties,
                estimatedTime: sme.averageReviewTime,
                priority: 'high'
            });
        }

        // Assign internal reviewer for content structure
        const internalReviewer = this.findAvailableInternalReviewer();
        if (internalReviewer) {
            assignments.push({
                reviewerId: internalReviewer.id,
                reviewerName: internalReviewer.name,
                reviewerType: 'internal',
                specialty: internalReviewer.specialties,
                estimatedTime: internalReviewer.averageReviewTime,
                priority: 'medium'
            });
        }

        return assignments;
    }

    /**
     * Analyze domain focus of content
     */
    analyzeDomainFocus(contentData) {
        const contentText = this.getContentText(contentData).toLowerCase();
        
        const domainKeywords = {
            people: ['leadership', 'team', 'conflict', 'stakeholder', 'communication', 'negotiation', 'empowerment'],
            process: ['planning', 'schedule', 'budget', 'risk', 'quality', 'scope', 'procurement', 'monitoring'],
            business: ['compliance', 'value', 'benefits', 'organizational', 'change', 'environment']
        };

        const scores = {};
        Object.entries(domainKeywords).forEach(([domain, keywords]) => {
            scores[domain] = keywords.reduce((count, keyword) => {
                return count + (contentText.split(keyword).length - 1);
            }, 0);
        });

        // Return domain with highest score
        return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    }

    /**
     * Find best SME for domain
     */
    findBestSME(domainFocus) {
        return this.reviewers.subjectMatterExperts.find(sme => 
            sme.specialties.includes(domainFocus) || 
            sme.specialties.some(specialty => specialty.includes(domainFocus))
        ) || this.reviewers.subjectMatterExperts[0]; // Fallback to first SME
    }

    /**
     * Find available internal reviewer
     */
    findAvailableInternalReviewer() {
        // Simple selection - in production would check availability
        return this.reviewers.internalReviewers[0];
    }

    /**
     * Perform automated accuracy checks
     */
    async performAutomatedChecks(contentData) {
        const results = {
            contentId: contentData.id,
            timestamp: moment().toISOString(),
            overallScore: 0,
            checks: [],
            issues: [],
            warnings: [],
            recommendations: []
        };

        // Check for common errors
        const errorChecks = this.checkCommonErrors(contentData);
        results.checks.push(...errorChecks.checks);
        results.issues.push(...errorChecks.issues);

        // Check PMP concept accuracy
        const conceptChecks = this.checkPMPConcepts(contentData);
        results.checks.push(...conceptChecks.checks);
        results.warnings.push(...conceptChecks.warnings);

        // Check terminology consistency
        const terminologyChecks = this.checkTerminology(contentData);
        results.checks.push(...terminologyChecks.checks);
        results.warnings.push(...terminologyChecks.warnings);

        // Calculate overall score
        const totalChecks = results.checks.length;
        const passedChecks = results.checks.filter(c => c.passed).length;
        results.overallScore = totalChecks > 0 ? passedChecks / totalChecks : 0;

        // Generate recommendations
        results.recommendations = this.generateAccuracyRecommendations(results);

        return results;
    }

    /**
     * Check for common errors
     */
    checkCommonErrors(contentData) {
        const contentText = this.getContentText(contentData).toLowerCase();
        const checks = [];
        const issues = [];

        this.accuracyChecks.commonErrors.forEach(errorCheck => {
            const hasError = this.detectError(contentText, errorCheck.error);
            
            checks.push({
                category: 'common_errors',
                check: errorCheck.error,
                passed: !hasError,
                severity: errorCheck.severity,
                correction: hasError ? errorCheck.correction : null
            });

            if (hasError) {
                issues.push({
                    type: 'accuracy_error',
                    severity: errorCheck.severity,
                    description: errorCheck.error,
                    correction: errorCheck.correction
                });
            }
        });

        return { checks, issues };
    }

    /**
     * Check PMP concepts
     */
    checkPMPConcepts(contentData) {
        const contentText = this.getContentText(contentData).toLowerCase();
        const checks = [];
        const warnings = [];

        this.accuracyChecks.pmpConcepts.forEach(category => {
            category.checks.forEach(check => {
                // Simplified concept checking - would be more sophisticated in production
                const conceptPresent = this.detectConcept(contentText, check);
                
                checks.push({
                    category: category.category,
                    check: check,
                    passed: conceptPresent,
                    confidence: conceptPresent ? 0.8 : 0.2 // Simplified confidence
                });

                if (!conceptPresent && this.isConceptRequired(contentData, check)) {
                    warnings.push({
                        type: 'missing_concept',
                        category: category.category,
                        description: `Consider including: ${check}`,
                        importance: 'medium'
                    });
                }
            });
        });

        return { checks, warnings };
    }

    /**
     * Check terminology consistency
     */
    checkTerminology(contentData) {
        const contentText = this.getContentText(contentData);
        const checks = [];
        const warnings = [];

        const terminologyRules = {
            'project manager': {
                alternatives: ['pm', 'project lead'],
                preferred: 'project manager',
                consistency: true
            },
            'stakeholder': {
                alternatives: ['stake holder', 'stakeholders'],
                preferred: 'stakeholder',
                consistency: true
            },
            'work breakdown structure': {
                alternatives: ['wbs', 'work breakdown'],
                preferred: 'work breakdown structure (WBS)',
                consistency: false
            }
        };

        Object.entries(terminologyRules).forEach(([term, rule]) => {
            const usage = this.analyzeTermUsage(contentText, term, rule.alternatives);
            
            checks.push({
                category: 'terminology',
                check: `Consistent use of "${term}"`,
                passed: usage.consistent || !rule.consistency,
                details: usage
            });

            if (!usage.consistent && rule.consistency) {
                warnings.push({
                    type: 'terminology_inconsistency',
                    term: term,
                    description: `Inconsistent use of "${term}" - consider using "${rule.preferred}" throughout`,
                    occurrences: usage.occurrences
                });
            }
        });

        return { checks, warnings };
    }

    /**
     * Generate accuracy recommendations
     */
    generateAccuracyRecommendations(results) {
        const recommendations = [];

        // High severity issues
        const highSeverityIssues = results.issues.filter(i => i.severity === 'high');
        if (highSeverityIssues.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'critical_accuracy',
                recommendation: 'Address high-severity accuracy issues before publication',
                details: highSeverityIssues.map(i => i.correction)
            });
        }

        // Low overall score
        if (results.overallScore < 0.8) {
            recommendations.push({
                priority: 'high',
                category: 'overall_accuracy',
                recommendation: 'Content accuracy score below threshold - requires SME review',
                details: [`Current score: ${Math.round(results.overallScore * 100)}%, target: 80%+`]
            });
        }

        // Missing concepts
        const missingConcepts = results.warnings.filter(w => w.type === 'missing_concept');
        if (missingConcepts.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'content_completeness',
                recommendation: 'Consider adding missing PMP concepts for completeness',
                details: missingConcepts.map(c => c.description)
            });
        }

        // Terminology issues
        const terminologyIssues = results.warnings.filter(w => w.type === 'terminology_inconsistency');
        if (terminologyIssues.length > 0) {
            recommendations.push({
                priority: 'low',
                category: 'terminology_consistency',
                recommendation: 'Improve terminology consistency for better clarity',
                details: terminologyIssues.map(t => t.description)
            });
        }

        return recommendations;
    }

    // Helper methods
    getContentText(contentData) {
        let text = '';
        if (contentData.title) text += contentData.title + ' ';
        if (contentData.description) text += contentData.description + ' ';
        if (contentData.content) text += contentData.content + ' ';
        if (contentData.script) text += contentData.script + ' ';
        return text;
    }

    detectError(contentText, errorPattern) {
        // Simplified error detection - would use more sophisticated NLP in production
        const errorKeywords = this.extractErrorKeywords(errorPattern);
        return errorKeywords.some(keyword => contentText.includes(keyword.toLowerCase()));
    }

    extractErrorKeywords(errorPattern) {
        // Extract key terms from error description
        return errorPattern.toLowerCase().split(' ').filter(word => word.length > 3);
    }

    detectConcept(contentText, concept) {
        // Simplified concept detection
        const conceptKeywords = concept.toLowerCase().split(' ').filter(word => word.length > 3);
        return conceptKeywords.some(keyword => contentText.includes(keyword));
    }

    isConceptRequired(contentData, concept) {
        // Determine if concept is required based on content type/domain
        return contentData.type === 'educational' || contentData.type === 'lesson';
    }

    analyzeTermUsage(contentText, term, alternatives) {
        const allTerms = [term, ...alternatives];
        const occurrences = {};
        let totalOccurrences = 0;

        allTerms.forEach(t => {
            const regex = new RegExp(t, 'gi');
            const matches = contentText.match(regex) || [];
            if (matches.length > 0) {
                occurrences[t] = matches.length;
                totalOccurrences += matches.length;
            }
        });

        const uniqueTermsUsed = Object.keys(occurrences).length;
        const consistent = uniqueTermsUsed <= 1;

        return {
            consistent,
            occurrences,
            totalOccurrences,
            uniqueTermsUsed,
            mostUsed: Object.entries(occurrences).sort((a, b) => b[1] - a[1])[0]?.[0]
        };
    }

    /**
     * Create review checklist for human reviewers
     */
    createReviewChecklist(contentData, domainFocus) {
        const checklist = {
            contentId: contentData.id,
            domainFocus: domainFocus,
            sections: []
        };

        // General accuracy section
        checklist.sections.push({
            title: 'General Accuracy',
            items: [
                'Content aligns with current PMI standards',
                'PMP terminology used correctly throughout',
                'No factual errors in project management concepts',
                'Examples and scenarios are realistic and relevant',
                'References to PMI processes are accurate'
            ]
        });

        // Domain-specific section
        const domainChecklist = this.getDomainSpecificChecklist(domainFocus);
        if (domainChecklist) {
            checklist.sections.push(domainChecklist);
        }

        // Educational effectiveness section
        checklist.sections.push({
            title: 'Educational Effectiveness',
            items: [
                'Learning objectives are clear and measurable',
                'Content difficulty appropriate for target audience',
                'Key concepts explained clearly',
                'Practical applications provided',
                'Assessment opportunities included'
            ]
        });

        return checklist;
    }

    getDomainSpecificChecklist(domain) {
        const checklists = {
            people: {
                title: 'People Domain Accuracy',
                items: [
                    'Leadership styles accurately described',
                    'Team development concepts correct',
                    'Conflict resolution techniques valid',
                    'Stakeholder engagement approaches appropriate',
                    'Communication principles align with PMI standards'
                ]
            },
            process: {
                title: 'Process Domain Accuracy',
                items: [
                    'Process groups correctly explained',
                    'Knowledge area interactions accurate',
                    'Tools and techniques properly described',
                    'Inputs and outputs correctly identified',
                    'Process flow logic is sound'
                ]
            },
            business: {
                title: 'Business Environment Accuracy',
                items: [
                    'Organizational structures correctly described',
                    'Compliance requirements accurate',
                    'Business value concepts valid',
                    'Change management principles correct',
                    'External factors properly considered'
                ]
            }
        };

        return checklists[domain] || null;
    }
}

module.exports = ContentAccuracyReviewer;