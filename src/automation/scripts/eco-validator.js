/**
 * ECO Validator
 * Validates content against PMI Examination Content Outline requirements
 */

const fs = require('fs-extra');
const path = require('path');

class ECOValidator {
  constructor() {
    this.ecoData = this.loadECOData();
    this.validationRules = this.loadValidationRules();
  }

  loadECOData() {
    const ecoPath = path.join(__dirname, '../../config/pmi-eco-data.json');
    if (fs.existsSync(ecoPath)) {
      return fs.readJsonSync(ecoPath);
    }
    return this.getDefaultECOData();
  }

  getDefaultECOData() {
    return {
      domains: {
        people: {
          name: 'People',
          percentage: 42,
          color: 'green',
          tasks: [
            {
              id: 'T1',
              title: 'Manage conflict',
              description: 'Address and navigate conflict situations by using conflict resolution techniques',
              enablers: [
                'Interpret the source and stage of the conflict',
                'Analyze the context for the conflict',
                'Evaluate/recommend/reconcile the appropriate conflict resolution solution'
              ]
            },
            {
              id: 'T2', 
              title: 'Lead a team',
              description: 'Support and lead a team by creating a shared understanding and ensuring team members are performing in their roles',
              enablers: [
                'Set a clear vision and mission',
                'Support diversity and inclusion (e.g., behavior types, thought process)',
                'Value servant leadership (e.g., relate the tenets of servant leadership to the team)',
                'Determine an appropriate leadership style (e.g., directive, collaborative)',
                'Inspire, motivate, and influence team members/stakeholders',
                'Analyze team members and stakeholders influence and impact',
                'Distinguish various options to lead various team members and stakeholders'
              ]
            },
            {
              id: 'T3',
              title: 'Support team performance',
              description: 'Continuously evaluate and improve team performance by identifying strengths and weaknesses, gaps, and opportunities',
              enablers: [
                'Appraise team member performance against key performance indicators',
                'Support and recognize team member growth and development',
                'Determine appropriate feedback approach',
                'Verify team member understanding of feedback',
                'Manage team member performance issues'
              ]
            },
            {
              id: 'T4',
              title: 'Empower team members and stakeholders',
              description: 'Create an environment in which team members and stakeholders are able to improve and make decisions by establishing boundaries and accountabilities',
              enablers: [
                'Organize around team strengths',
                'Support team task accountability',
                'Evaluate demonstration of task accountability',
                'Determine and bestow level of decision-making authority',
                'Support team members in making decisions',
                'Support team members in taking ownership of decisions'
              ]
            },
            {
              id: 'T5',
              title: 'Ensure team members/stakeholders are adequately trained',
              description: 'Continuously evaluate training needs and provide resources to ensure team members and stakeholders have required competencies',
              enablers: [
                'Evaluate training needs',
                'Determine training options based on training needs',
                'Allocate resources for training',
                'Measure training outcomes',
                'Support team members during training'
              ]
            },
            {
              id: 'T6',
              title: 'Build a team',
              description: 'Continuously develop skills, knowledge, and competencies of team members to improve performance',
              enablers: [
                'Appraise stakeholder skills',
                'Support team member development',
                'Determine team resource requirements',
                'Continuously assess team skills against project requirements',
                'Continuously assess team skills against organizational needs',
                'Provide mentoring, coaching, and learning opportunities'
              ]
            },
            {
              id: 'T7',
              title: 'Address and remove impediments, obstacles, and blockers for the team',
              description: 'Continuously identify and address issues, risks, and blockers that impact the team\'s ability to perform effectively',
              enablers: [
                'Determine critical impediments, obstacles, and blockers for the team',
                'Prioritize critical impediments, obstacles, and blockers for the team',
                'Use network to implement solutions to remove impediments, obstacles, and blockers',
                'Re-assess continually to ensure impediments, obstacles, and blockers are being addressed'
              ]
            },
            {
              id: 'T8',
              title: 'Negotiate project agreements',
              description: 'Analyze the bounds of negotiations for agreement on project outcomes, resources, and constraints',
              enablers: [
                'Analyze the bounds of the negotiations',
                'Assess priorities and determine ultimate objective(s)',
                'Verify objective(s) of the negotiation align with project parameters',
                'Participate in agreement negotiations',
                'Determine a negotiation strategy'
              ]
            },
            {
              id: 'T9',
              title: 'Collaborate with stakeholders',
              description: 'Engage with stakeholders by building relationships and coalitions in order to reach project objectives',
              enablers: [
                'Evaluate engagement needs for stakeholders',
                'Optimize alignment between stakeholder needs, expectations, and project objectives',
                'Build trust and influence stakeholders to accomplish project objectives',
                'Maintain stakeholder relationships',
                'Receive and integrate feedback from stakeholders',
                'Implement stakeholder engagement plan',
                'Manage stakeholder expectations'
              ]
            },
            {
              id: 'T10',
              title: 'Build shared understanding',
              description: 'Continuously engage with stakeholders to understand and evaluate the effectiveness of communication',
              enablers: [
                'Execute communication with cultural awareness',
                'Evaluate effectiveness of communications',
                'Survey communication needs for all stakeholders',
                'Optimize communication methods and channels',
                'Encourage and facilitate collaboration among team members and stakeholders',
                'Build trust among team members and stakeholders through transparent communication',
                'Apply active and empathetic listening techniques'
              ]
            }
          ]
        },
        process: {
          name: 'Process',
          percentage: 50,
          color: 'blue',
          tasks: [
            {
              id: 'T11',
              title: 'Execute project with the urgency required to deliver business value',
              description: 'Assess opportunities to deliver business value in an incremental way and advocate for the delivery approach that provides the best business value',
              enablers: [
                'Assess opportunities to deliver business value',
                'Advocate for the delivery approach that provides the best business value',
                'Prioritize tasks, activities, and requirements',
                'Advocate for business value delivery over conforming to a plan'
              ]
            },
            {
              id: 'T12',
              title: 'Manage communications',
              description: 'Efficiently and effectively direct the flow of accurate and relevant information by facilitating stakeholder engagement',
              enablers: [
                'Analyze communication needs of all stakeholders',
                'Determine communication methods, channels, frequency, and level of detail',
                'Communicate project information and updates according to the communication plan',
                'Confirm communication is understood and feedback is received',
                'Monitor and optimize communications'
              ]
            },
            {
              id: 'T13',
              title: 'Assess and manage risks',
              description: 'Continuously identify and analyze risk events and determine appropriate response strategy',
              enablers: [
                'Identify risks (e.g., team, technical, commercial, schedule, budget)',
                'Analyze and assess impact of risks to the project',
                'Prioritize risks based on probability and impact',
                'Implement risk response strategy',
                'Monitor and reassess risks'
              ]
            },
            {
              id: 'T14',
              title: 'Engage stakeholders',
              description: 'Proactively engage and manage stakeholder involvement',
              enablers: [
                'Analyze stakeholders (e.g., power interest grid, influence, impact)',
                'Categorize stakeholders',
                'Engage stakeholders by category',
                'Develop, execute, and validate stakeholder engagement plan',
                'Monitor stakeholder engagement'
              ]
            },
            {
              id: 'T15',
              title: 'Plan and manage budget and resources',
              description: 'Plan, monitor, and control project costs and resource utilization based on the delivery methodology',
              enablers: [
                'Estimate project costs',
                'Develop budget based on project requirements',
                'Monitor budget and resource allocation',
                'Manage budget changes',
                'Plan resource management',
                'Manage resources'
              ]
            },
            {
              id: 'T16',
              title: 'Plan and manage schedule',
              description: 'Develop and maintain project schedules based on the delivery methodology, scope, and resource requirements',
              enablers: [
                'Estimate project tasks (e.g., user stories, use cases, requirements)',
                'Identify the critical path, milestones, and dependencies',
                'Develop schedule based on methodology',
                'Monitor schedule progress',
                'Manage schedule changes'
              ]
            },
            {
              id: 'T17',
              title: 'Plan and manage scope',
              description: 'Define, validate, and control project scope based on the delivery methodology',
              enablers: [
                'Determine and prioritize requirements',
                'Break down scope (e.g., WBS, backlog)',
                'Monitor and validate scope',
                'Control scope changes'
              ]
            },
            {
              id: 'T18',
              title: 'Plan and manage quality of products/deliverables',
              description: 'Establish quality measures and ensure that project deliverables meet quality requirements and organizational standards',
              enablers: [
                'Determine quality standard required for project deliverables',
                'Recommend options for improvement based on quality gaps',
                'Continually survey project deliverable quality'
              ]
            },
            {
              id: 'T19',
              title: 'Integrate project planning activities',
              description: 'Consolidate the subsidiary project plans into an overall project plan',
              enablers: [
                'Consolidate subsidiary plans',
                'Assess consolidated project plans for dependencies, gaps, and continued business value',
                'Analyze data collected',
                'Collect and analyze data to make informed project decisions',
                'Recommend project startup approaches based on development approach, organizational considerations, and project type'
              ]
            },
            {
              id: 'T20',
              title: 'Manage project changes',
              description: 'Track, evaluate, and manage changes to project scope, schedule, and costs',
              enablers: [
                'Anticipate and embrace the need for change',
                'Determine change strategy and approach',
                'Execute change management strategy',
                'Determine change impact to delivery approach',
                'Communicate change status and impact'
              ]
            },
            {
              id: 'T21',
              title: 'Plan and manage procurement',
              description: 'Define resource requirements and engage with vendors to meet project resource needs',
              enablers: [
                'Define resource requirements',
                'Communicate resource requirements',
                'Manage suppliers/contracts',
                'Plan and manage procurement strategy',
                'Develop a delivery solution'
              ]
            },
            {
              id: 'T22',
              title: 'Monitor and control project work',
              description: 'Track, review, and regulate project progress and performance and identify areas that require changes or corrective action',
              enablers: [
                'Assess project performance against baselines',
                'Analyze project performance data',
                'Determine corrective actions based on project performance data',
                'Implement approved actions'
              ]
            },
            {
              id: 'T23',
              title: 'Close project or phase',
              description: 'Perform activities necessary to formally complete the project or phase',
              enablers: [
                'Confirm final deliverable acceptance',
                'Transfer ownership of deliverables',
                'Obtain financial, legal, and administrative closure',
                'Release project resources',
                'Collate lessons learned',
                'Archive project documents and materials'
              ]
            }
          ]
        },
        business: {
          name: 'Business Environment',
          percentage: 8,
          color: 'orange',
          tasks: [
            {
              id: 'T24',
              title: 'Plan and manage project compliance',
              description: 'Ensure project activities comply with regulatory, legal, and other requirements',
              enablers: [
                'Confirm project compliance requirements',
                'Classify compliance categories',
                'Determine potential threats to compliance',
                'Use methods to support compliance',
                'Analyze the consequences of noncompliance',
                'Determine necessary approach and action to address compliance requirements',
                'Measure extent of compliance throughout project'
              ]
            },
            {
              id: 'T25',
              title: 'Evaluate and deliver project benefits and value',
              description: 'Investigate and assess the effectiveness of the project in delivering business value',
              enablers: [
                'Set expectations of project benefits',
                'Assess that project benefits are being delivered as planned',
                'Evaluate delivery options to demonstrate value',
                'Appraise stakeholders of value delivery'
              ]
            },
            {
              id: 'T26',
              title: 'Evaluate and address external business environment changes for impact on scope',
              description: 'Survey external business environment for impacts on project scope and identify necessary changes',
              enablers: [
                'Survey external business environment (e.g., regulations, technology, geopolitical, market)',
                'Assess and prioritize impact on project scope/backlog based on business environment changes',
                'Recommend options for scope/backlog changes based on business environment changes',
                'Continually review external business environment for impacts on project scope'
              ]
            },
            {
              id: 'T27',
              title: 'Support organizational change',
              description: 'Assess organizational culture and facilitate change management activities to ensure project acceptance and adoption',
              enablers: [
                'Assess organizational culture',
                'Evaluate impact of organizational change to project and determine required actions',
                'Evaluate readiness of the organization to accept and adopt the project',
                'Develop organizational change management strategy'
              ]
            }
          ]
        }
      },
      lastUpdated: '2024-01-01',
      version: '2024'
    };
  }

  loadValidationRules() {
    return {
      coverage: {
        minimum: 0.8, // 80% minimum coverage
        recommended: 0.95 // 95% recommended coverage
      },
      distribution: {
        people: { min: 0.35, max: 0.50 }, // 35-50% (target 42%)
        process: { min: 0.40, max: 0.60 }, // 40-60% (target 50%)
        business: { min: 0.05, max: 0.15 }  // 5-15% (target 8%)
      },
      taskCoverage: {
        requiredTasks: [], // Tasks that must be covered
        recommendedTasks: [] // Tasks that should be covered
      }
    };
  }

  /**
     * Validate content against ECO requirements
     */
  async validate(contentData) {
    const validation = {
      contentId: contentData.id,
      contentType: contentData.type,
      isValid: true,
      score: 0,
      coverage: {},
      distribution: {},
      issues: [],
      recommendations: [],
      details: {}
    };

    try {
      // Extract ECO tasks from content
      const extractedTasks = this.extractECOTasks(contentData);
      validation.details.extractedTasks = extractedTasks;

      // Validate coverage
      const coverageValidation = this.validateCoverage(extractedTasks);
      validation.coverage = coverageValidation;

      // Validate distribution
      const distributionValidation = this.validateDistribution(extractedTasks);
      validation.distribution = distributionValidation;

      // Calculate overall score
      validation.score = this.calculateValidationScore(coverageValidation, distributionValidation);

      // Determine if valid
      validation.isValid = validation.score >= this.validationRules.coverage.minimum;

      // Generate issues and recommendations
      if (!validation.isValid) {
        validation.issues = this.generateIssues(coverageValidation, distributionValidation);
        validation.recommendations = this.generateRecommendations(coverageValidation, distributionValidation);
      }

    } catch (error) {
      validation.isValid = false;
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
     * Extract ECO tasks from content
     */
  extractECOTasks(contentData) {
    const extractedTasks = {
      people: [],
      process: [],
      business: []
    };

    // Extract from different content fields
    const contentText = this.getContentText(contentData);
        
    // Look for explicit ECO task references
    const taskPattern = /T(\d+)/g;
    const matches = contentText.match(taskPattern) || [];
        
    matches.forEach(match => {
      const taskNumber = parseInt(match.substring(1));
      const domain = this.getTaskDomain(taskNumber);
      if (domain && !extractedTasks[domain].includes(`T${taskNumber}`)) {
        extractedTasks[domain].push(`T${taskNumber}`);
      }
    });

    // Look for keyword-based task identification
    this.identifyTasksByKeywords(contentText, extractedTasks);

    return extractedTasks;
  }

  /**
     * Get content text from various content fields
     */
  getContentText(contentData) {
    let text = '';
        
    if (contentData.title) {text += contentData.title + ' ';}
    if (contentData.description) {text += contentData.description + ' ';}
    if (contentData.content) {text += contentData.content + ' ';}
    if (contentData.script) {text += contentData.script + ' ';}
    if (contentData.objectives) {text += contentData.objectives.join(' ') + ' ';}
    if (contentData.keyPoints) {text += contentData.keyPoints.join(' ') + ' ';}

    return text.toLowerCase();
  }

  /**
     * Get domain for task number
     */
  getTaskDomain(taskNumber) {
    if (taskNumber >= 1 && taskNumber <= 10) {return 'people';}
    if (taskNumber >= 11 && taskNumber <= 23) {return 'process';}
    if (taskNumber >= 24 && taskNumber <= 27) {return 'business';}
    return null;
  }

  /**
     * Identify tasks by keywords
     */
  identifyTasksByKeywords(contentText, extractedTasks) {
    const keywordMap = {
      people: {
        'T1': ['conflict', 'resolution', 'dispute', 'disagreement'],
        'T2': ['leadership', 'lead team', 'vision', 'mission', 'servant leadership'],
        'T3': ['team performance', 'feedback', 'performance review', 'kpi'],
        'T4': ['empower', 'decision making', 'accountability', 'authority'],
        'T5': ['training', 'competencies', 'skills development', 'learning'],
        'T6': ['team building', 'mentoring', 'coaching', 'development'],
        'T7': ['impediments', 'obstacles', 'blockers', 'barriers'],
        'T8': ['negotiation', 'agreements', 'contracts', 'compromise'],
        'T9': ['stakeholder collaboration', 'relationships', 'coalitions'],
        'T10': ['communication', 'shared understanding', 'listening']
      },
      process: {
        'T11': ['business value', 'incremental delivery', 'urgency'],
        'T12': ['communications management', 'information flow', 'stakeholder engagement'],
        'T13': ['risk management', 'risk assessment', 'risk response'],
        'T14': ['stakeholder engagement', 'stakeholder analysis', 'power interest'],
        'T15': ['budget', 'cost management', 'resource allocation'],
        'T16': ['schedule', 'timeline', 'critical path', 'dependencies'],
        'T17': ['scope', 'requirements', 'wbs', 'backlog'],
        'T18': ['quality', 'deliverables', 'standards', 'quality assurance'],
        'T19': ['project planning', 'integration', 'subsidiary plans'],
        'T20': ['change management', 'change control', 'change impact'],
        'T21': ['procurement', 'vendors', 'contracts', 'suppliers'],
        'T22': ['monitoring', 'controlling', 'performance', 'corrective action'],
        'T23': ['project closure', 'lessons learned', 'deliverable acceptance']
      },
      business: {
        'T24': ['compliance', 'regulatory', 'legal requirements'],
        'T25': ['benefits realization', 'value delivery', 'roi'],
        'T26': ['external environment', 'market changes', 'regulations'],
        'T27': ['organizational change', 'culture', 'change readiness']
      }
    };

    Object.entries(keywordMap).forEach(([domain, tasks]) => {
      Object.entries(tasks).forEach(([taskId, keywords]) => {
        const hasKeywords = keywords.some(keyword => 
          contentText.includes(keyword.toLowerCase())
        );
        if (hasKeywords && !extractedTasks[domain].includes(taskId)) {
          extractedTasks[domain].push(taskId);
        }
      });
    });
  }

  /**
     * Validate ECO coverage
     */
  validateCoverage(extractedTasks) {
    const totalTasks = Object.values(extractedTasks).flat().length;
    const totalECOTasks = 27; // Total ECO tasks
    const coveragePercentage = totalTasks / totalECOTasks;

    return {
      totalTasksCovered: totalTasks,
      totalECOTasks: totalECOTasks,
      coveragePercentage: coveragePercentage,
      meetsMinimum: coveragePercentage >= this.validationRules.coverage.minimum,
      meetsRecommended: coveragePercentage >= this.validationRules.coverage.recommended,
      byDomain: {
        people: {
          covered: extractedTasks.people.length,
          total: 10,
          percentage: extractedTasks.people.length / 10
        },
        process: {
          covered: extractedTasks.process.length,
          total: 13,
          percentage: extractedTasks.process.length / 13
        },
        business: {
          covered: extractedTasks.business.length,
          total: 4,
          percentage: extractedTasks.business.length / 4
        }
      }
    };
  }

  /**
     * Validate domain distribution
     */
  validateDistribution(extractedTasks) {
    const totalTasks = Object.values(extractedTasks).flat().length;
        
    if (totalTasks === 0) {
      return {
        isValid: false,
        distributions: {},
        issues: ['No ECO tasks identified in content']
      };
    }

    const distributions = {
      people: extractedTasks.people.length / totalTasks,
      process: extractedTasks.process.length / totalTasks,
      business: extractedTasks.business.length / totalTasks
    };

    const validation = {
      distributions: distributions,
      isValid: true,
      issues: []
    };

    // Check each domain distribution
    Object.entries(this.validationRules.distribution).forEach(([domain, range]) => {
      const actual = distributions[domain];
      if (actual < range.min || actual > range.max) {
        validation.isValid = false;
        validation.issues.push(
          `${domain} domain distribution (${Math.round(actual * 100)}%) outside recommended range (${Math.round(range.min * 100)}-${Math.round(range.max * 100)}%)`
        );
      }
    });

    return validation;
  }

  /**
     * Calculate overall validation score
     */
  calculateValidationScore(coverageValidation, distributionValidation) {
    let score = 0;

    // Coverage score (70% weight)
    score += coverageValidation.coveragePercentage * 0.7;

    // Distribution score (30% weight)
    if (distributionValidation.isValid) {
      score += 0.3;
    } else {
      // Partial credit based on how close distributions are to targets
      const peopleTarget = 0.42;
      const processTarget = 0.50;
      const businessTarget = 0.08;

      const peopleScore = 1 - Math.abs(distributionValidation.distributions.people - peopleTarget);
      const processScore = 1 - Math.abs(distributionValidation.distributions.process - processTarget);
      const businessScore = 1 - Math.abs(distributionValidation.distributions.business - businessTarget);

      const avgDistributionScore = (peopleScore + processScore + businessScore) / 3;
      score += avgDistributionScore * 0.3;
    }

    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
  }

  /**
     * Generate validation issues
     */
  generateIssues(coverageValidation, distributionValidation) {
    const issues = [];

    if (!coverageValidation.meetsMinimum) {
      issues.push(`ECO coverage (${Math.round(coverageValidation.coveragePercentage * 100)}%) below minimum requirement (${Math.round(this.validationRules.coverage.minimum * 100)}%)`);
    }

    if (!distributionValidation.isValid) {
      issues.push(...distributionValidation.issues);
    }

    // Check for missing critical domains
    if (coverageValidation.byDomain.people.covered === 0) {
      issues.push('No People domain tasks covered - this is a critical gap');
    }
    if (coverageValidation.byDomain.process.covered === 0) {
      issues.push('No Process domain tasks covered - this is a critical gap');
    }

    return issues;
  }

  /**
     * Generate recommendations
     */
  generateRecommendations(coverageValidation, distributionValidation) {
    const recommendations = [];

    if (!coverageValidation.meetsRecommended) {
      recommendations.push(`Increase ECO coverage to ${Math.round(this.validationRules.coverage.recommended * 100)}% for optimal alignment`);
    }

    // Domain-specific recommendations
    Object.entries(coverageValidation.byDomain).forEach(([domain, data]) => {
      if (data.percentage < 0.3) {
        recommendations.push(`Consider adding more ${domain} domain content (currently ${Math.round(data.percentage * 100)}% coverage)`);
      }
    });

    // Distribution recommendations
    if (!distributionValidation.isValid) {
      const dist = distributionValidation.distributions;
      if (dist.people < 0.35) {
        recommendations.push('Add more People domain tasks (leadership, team management, stakeholder engagement)');
      }
      if (dist.process < 0.40) {
        recommendations.push('Add more Process domain tasks (planning, monitoring, risk management)');
      }
      if (dist.business < 0.05) {
        recommendations.push('Add Business Environment tasks (compliance, benefits, organizational change)');
      }
    }

    return recommendations;
  }

  /**
     * Get ECO task details
     */
  getTaskDetails(taskId) {
    for (const domain of Object.values(this.ecoData.domains)) {
      const task = domain.tasks.find(t => t.id === taskId);
      if (task) {
        return {
          ...task,
          domain: domain.name,
          domainColor: domain.color
        };
      }
    }
    return null;
  }

  /**
     * Get all ECO tasks
     */
  getAllTasks() {
    const allTasks = [];
    Object.values(this.ecoData.domains).forEach(domain => {
      domain.tasks.forEach(task => {
        allTasks.push({
          ...task,
          domain: domain.name,
          domainColor: domain.color,
          domainPercentage: domain.percentage
        });
      });
    });
    return allTasks;
  }

  /**
     * Suggest tasks for content improvement
     */
  suggestTasksForImprovement(extractedTasks, targetDistribution = null) {
    const suggestions = [];
    const currentDist = this.calculateCurrentDistribution(extractedTasks);
    const target = targetDistribution || {
      people: 0.42,
      process: 0.50,
      business: 0.08
    };

    Object.entries(target).forEach(([domain, targetPerc]) => {
      const currentPerc = currentDist[domain];
      if (currentPerc < targetPerc) {
        const domainTasks = this.ecoData.domains[domain].tasks;
        const uncoveredTasks = domainTasks.filter(task => 
          !extractedTasks[domain].includes(task.id)
        );
                
        suggestions.push({
          domain: domain,
          currentPercentage: currentPerc,
          targetPercentage: targetPerc,
          gap: targetPerc - currentPerc,
          suggestedTasks: uncoveredTasks.slice(0, 3) // Top 3 suggestions
        });
      }
    });

    return suggestions;
  }

  calculateCurrentDistribution(extractedTasks) {
    const total = Object.values(extractedTasks).flat().length;
    if (total === 0) {return { people: 0, process: 0, business: 0 };}

    return {
      people: extractedTasks.people.length / total,
      process: extractedTasks.process.length / total,
      business: extractedTasks.business.length / total
    };
  }
}

module.exports = ECOValidator;