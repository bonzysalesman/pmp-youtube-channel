/**
 * Template Variable Mapper
 * Maps template variables to data sources and provides variable substitution
 * for video script generation
 */

const fs = require('fs');
const path = require('path');

class TemplateVariableMapper {
  constructor() {
    this.dataSourcePaths = {
      calendar: path.join(__dirname, '../../config/complete-13-week-calendar.json'),
      ecoMapping: path.join(__dirname, '../../content/cross-references/eco-task-to-chunk-mapping.json'),
      keywords: path.join(__dirname, '../../config/seo-keywords.json'),
      channelSettings: path.join(__dirname, '../../config/channel-settings.json')
    };

    this.domainColors = {
      'People': 'green',
      'Process': 'blue', 
      'Business Environment': 'orange',
      'Mixed': 'purple',
      'Introduction': 'purple'
    };

    this.domainPercentages = {
      'People': '42%',
      'Process': '50%',
      'Business Environment': '8%',
      'Mixed': 'Mixed',
      'Introduction': 'Foundation'
    };
  }

  /**
     * Load all data sources
     */
  loadDataSources() {
    const data = {};
        
    try {
      Object.entries(this.dataSourcePaths).forEach(([key, filePath]) => {
        if (fs.existsSync(filePath)) {
          data[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
          console.warn(`Data source not found: ${filePath}`);
          data[key] = {};
        }
      });
    } catch (error) {
      throw new Error(`Failed to load data sources: ${error.message}`);
    }

    return data;
  }

  /**
     * Get variable mappings for a specific video
     * @param {number} weekNumber - Week number (1-13)
     * @param {string} dayType - Type of day (monday, tuesday, etc.)
     * @param {string} templateType - Template type (dailyStudy, practiceSession, reviewSession)
     * @returns {Object} Variable mappings
     */
  getVariableMappings(weekNumber, dayType, templateType) {
    const data = this.loadDataSources();
    const week = data.calendar.weeks.find(w => w.week === weekNumber);
        
    if (!week) {
      throw new Error(`Week ${weekNumber} not found in calendar data`);
    }

    const dayData = week.videos[dayType];
    if (!dayData) {
      throw new Error(`Day type '${dayType}' not found for week ${weekNumber}`);
    }

    // Base mappings common to all templates
    const baseMappings = this.getBaseMappings(week, dayData, templateType);
        
    // Template-specific mappings
    let specificMappings = {};
    switch (templateType) {
    case 'dailyStudy':
      specificMappings = this.getDailyStudyMappings(week, dayData, data);
      break;
    case 'practiceSession':
      specificMappings = this.getPracticeSessionMappings(week, dayData, data);
      break;
    case 'reviewSession':
      specificMappings = this.getReviewSessionMappings(week, dayData, data);
      break;
    }

    return { ...baseMappings, ...specificMappings };
  }

  /**
     * Get base variable mappings common to all templates
     */
  getBaseMappings(week, dayData, templateType) {
    const domain = week.domain || 'Mixed';
    const targetDurations = {
      dailyStudy: 18,
      practiceSession: 22,
      reviewSession: 18
    };

    return {
      // Core variables
      week_number: week.week,
      day_number: dayData.dayNumber || 0,
      topic_title: dayData.title || week.theme,
      target_duration: targetDurations[templateType],
      domain: domain,
      domain_percentage: this.domainPercentages[domain],
      work_group: week.workGroup || 'General',
      week_theme: week.theme,

      // Production variables
      batch_session_id: `W${week.week.toString().padStart(2, '0')}_${templateType}`,
      domain_color: this.domainColors[domain],
      seo_title_formula: this.generateSEOTitle(dayData, week),

      // Engagement variables
      hook_celebration: `Great job making it to week ${week.week}!`,
      hook_integration: 'Let\'s connect the dots between concepts',
      hook_confidence: 'You\'re building real PMP expertise',
      encouragement_message: 'Keep up the excellent progress!',
      cta_message: 'Drop a comment with your biggest insight from today!'
    };
  }

  /**
     * Get daily study specific mappings
     */
  getDailyStudyMappings(week, dayData, data) {
    const ecoTasks = this.getECOTasksForWeek(week.week, data.ecoMapping);
    const keywords = this.getKeywordsForContent('dailyStudy', week.domain, data.keywords);

    return {
      // ECO variables
      eco_tasks: ecoTasks.map(task => task.id).join(', '),
      primary_eco_task: ecoTasks[0]?.id || 'General',
      eco_task_description: ecoTasks[0]?.description || 'Core PMP concept',
      supporting_eco_tasks: ecoTasks.slice(1).map(task => task.id).join(', '),
      eco_task_weight: this.calculateECOWeight(ecoTasks, week.domain),

      // Content variables
      hook_opening: `Ready to master ${dayData.title?.split(':')[1]?.trim() || 'today\'s topic'}?`,
      hook_problem: 'Many PMP candidates struggle with this concept',
      hook_promise: 'By the end of this video, you\'ll have clarity and confidence',
            
      objective_1: `Understand the core principles of ${dayData.title?.split(':')[1]?.trim() || 'the topic'}`,
      objective_2: `Apply ${week.domain} domain knowledge to real scenarios`,
      objective_3: 'Connect this concept to your PMP exam success',

      // Practice variables
      practice_scenario_setup: `You're managing a project and need to apply ${dayData.title?.split(':')[1]?.trim() || 'this concept'}...`,
      practice_question: 'What should you do first as a PMP-certified project manager?',
      correct_answer: 'C',
      answer_explanation: 'This follows PMP best practices for proactive management',

      // Reference variables
      study_guide_pages: `${week.week * 50}-${week.week * 50 + 49}`,
      next_topic: this.getNextTopic(week, dayData),
      target_keywords: keywords.join(', ')
    };
  }

  /**
     * Get practice session specific mappings
     */
  getPracticeSessionMappings(week, dayData, data) {
    const keywords = this.getKeywordsForContent('practice', week.domain, data.keywords);

    return {
      // Practice-specific variables
      hook_challenge: `Ready to test your ${week.domain} domain knowledge?`,
      hook_relevance: `These scenarios represent ${this.domainPercentages[week.domain]} of your exam`,
            
      exam_percentage: this.domainPercentages[week.domain].replace('%', ''),
      primary_eco_tasks: this.getECOTasksForWeek(week.week, data.ecoMapping).map(t => t.id).slice(0, 3).join(', '),
      skill_application_focus: `${week.domain} domain decision-making`,

      // Scenario variables (template for 3 scenarios)
      scenario_1_title: `${week.domain} Challenge: Stakeholder Conflict`,
      scenario_1_setup: 'Your project stakeholders have conflicting priorities...',
      scenario_1_role: 'Project Manager',
      scenario_1_challenge: 'Resolve the conflict while maintaining project momentum',
            
      scenario_2_title: `${week.domain} Challenge: Resource Constraints`,
      scenario_2_setup: 'Your project is facing resource limitations...',
      scenario_2_role: 'Project Manager',
      scenario_2_challenge: 'Optimize resources while meeting objectives',
            
      scenario_3_title: `${week.domain} Challenge: Scope Changes`,
      scenario_3_setup: 'A major scope change has been requested...',
      scenario_3_role: 'Project Manager',
      scenario_3_challenge: 'Manage the change while controlling impact',

      // Pattern recognition
      common_theme_across_scenarios: `Proactive ${week.domain.toLowerCase()} management`,
      decision_framework: 'Assess, Plan, Communicate, Execute, Monitor',
      red_flags_to_avoid: 'Reactive responses, ignoring stakeholders, bypassing processes',

      target_keywords: keywords.join(', ')
    };
  }

  /**
     * Get review session specific mappings
     */
  getReviewSessionMappings(week, dayData, data) {
    const keywords = this.getKeywordsForContent('review', week.domain, data.keywords);
    const weekDays = this.getWeekDays(week);

    return {
      // Progress variables
      eco_tasks_covered: this.getECOTasksForWeek(week.week, data.ecoMapping).map(t => t.id).join(', '),
      cumulative_eco_progress: Math.round((week.week / 13) * 100),
      study_guide_chapter_references: `Chapters ${week.week * 2 - 1}-${week.week * 2}`,

      // Daily review variables
      day_1_topic: weekDays[0]?.title || 'Introduction',
      day_1_number: weekDays[0]?.dayNumber || week.week * 7 - 6,
      day_1_key_concept: this.extractKeyConcept(weekDays[0]?.title),
      day_1_pmp_principle: 'Proactive management',
      day_1_exam_application: 'Scenario-based questions',

      day_2_topic: weekDays[1]?.title || 'Core Concepts',
      day_2_number: weekDays[1]?.dayNumber || week.week * 7 - 5,
      day_2_key_concept: this.extractKeyConcept(weekDays[1]?.title),
      day_2_pmp_principle: 'Stakeholder focus',
      day_2_exam_application: 'Best practice identification',

      day_3_topic: weekDays[2]?.title || 'Application',
      day_3_number: weekDays[2]?.dayNumber || week.week * 7 - 4,
      day_3_key_concept: this.extractKeyConcept(weekDays[2]?.title),
      day_3_pmp_principle: 'Value delivery',
      day_3_exam_application: 'Process selection',

      day_4_topic: weekDays[3]?.title || 'Integration',
      day_4_number: weekDays[3]?.dayNumber || week.week * 7 - 3,
      day_4_key_concept: this.extractKeyConcept(weekDays[3]?.title),
      day_4_pmp_principle: 'Continuous improvement',
      day_4_exam_application: 'Integration scenarios',

      // Integration variables
      integration_theme_1: `${week.domain} fundamentals`,
      integration_explanation_1: `All concepts this week support ${week.domain.toLowerCase()} excellence`,
      integration_theme_2: 'PMP mindset application',
      integration_explanation_2: 'Each topic demonstrates proactive project management',
      integration_theme_3: 'Exam readiness',
      integration_explanation_3: 'These concepts appear frequently on the PMP exam',

      // Assessment variables
      integration_scenario_setup: `You're managing a complex project that requires ${week.domain.toLowerCase()} expertise...`,
      integration_question: 'What\'s the BEST approach for a PMP-certified project manager?',
      concepts_tested: week.theme,
      integration_correct_answer: 'B',
      integration_explanation: 'This approach demonstrates PMP best practices',

      // Preview variables
      next_week_theme: this.getNextWeekTheme(week.week),
      next_week_domain: this.getNextWeekDomain(week.week),
      next_week_preview: 'We\'ll build on this foundation with advanced concepts',
      next_week_preparation: 'Review your notes and get ready for new challenges',

      target_keywords: keywords.join(', ')
    };
  }

  /**
     * Helper methods
     */
  getECOTasksForWeek(weekNumber, ecoMapping) {
    // Simplified ECO task mapping - in real implementation, this would be more sophisticated
    const domains = ['people_domain', 'process_domain', 'business_environment_domain'];
    const tasks = [];
        
    domains.forEach(domain => {
      if (ecoMapping[domain]) {
        Object.entries(ecoMapping[domain]).forEach(([taskId, taskData]) => {
          if (taskData.week === weekNumber) {
            tasks.push({
              id: taskId,
              description: taskId.replace(/_/g, ' ').replace(/^\d+\.\d+\s*/, ''),
              week: taskData.week
            });
          }
        });
      }
    });

    return tasks.length > 0 ? tasks : [{ id: 'general', description: 'General PMP concepts', week: weekNumber }];
  }

  calculateECOWeight(ecoTasks, domain) {
    const domainWeights = {
      'People': 42,
      'Process': 50,
      'Business Environment': 8
    };
        
    return domainWeights[domain] || 33;
  }

  getKeywordsForContent(contentType, domain, keywordsData) {
    if (!keywordsData || !keywordsData.contentTypeKeywords) {
      return ['PMP exam prep', 'PMP certification'];
    }

    const contentKeywords = keywordsData.contentTypeKeywords[contentType] || [];
    const domainKey = domain ? domain.toLowerCase().replace(' ', '') : 'general';
    const domainKeywords = keywordsData.domainSpecificKeywords[domainKey] || [];
        
    return [...contentKeywords.slice(0, 3), ...domainKeywords.slice(0, 2)];
  }

  generateSEOTitle(dayData, week) {
    if (dayData.dayNumber) {
      return `Day ${dayData.dayNumber}: ${dayData.title?.split(':')[1]?.trim() || 'PMP Concept'} | PMP Exam Prep Week ${week.week}`;
    }
    return `Week ${week.week}: ${week.theme} | 13-Week PMP Study Plan`;
  }

  getNextTopic(week, dayData) {
    // Simplified - in real implementation, would look up next day's topic
    return 'Advanced concepts and practical application';
  }

  getWeekDays(week) {
    return [
      week.videos.tuesday,
      week.videos.wednesday, 
      week.videos.thursday,
      week.videos.friday
    ].filter(Boolean);
  }

  extractKeyConcept(title) {
    if (!title) {return 'Core concept';}
    const parts = title.split(':');
    return parts.length > 1 ? parts[1].trim() : title;
  }

  getNextWeekTheme(currentWeek) {
    const themes = [
      'Introduction & Foundations',
      'Building a Team (Part 1)',
      'Building a Team (Part 2)', 
      'Starting the Project (Part 1)',
      'Starting the Project (Part 2)',
      'Doing the Work (Part 1)',
      'Doing the Work (Part 2)',
      'Doing the Work (Part 3)',
      'Keeping on Track (Part 1)',
      'Keeping on Track (Part 2)',
      'Focus on the Business',
      'Final Review & Practice Exams',
      'Exam Week'
    ];
        
    return themes[currentWeek] || 'Advanced Topics';
  }

  getNextWeekDomain(currentWeek) {
    const domains = [
      'Introduction', 'People', 'People', 'Process', 'Process',
      'Process', 'Process', 'Process', 'People', 'People',
      'Business Environment', 'Mixed', 'Mixed'
    ];
        
    return domains[currentWeek] || 'Mixed';
  }

  /**
     * Generate populated template content
     * @param {string} templatePath - Path to template file
     * @param {Object} variables - Variable mappings
     * @returns {string} Populated template content
     */
  populateTemplate(templatePath, variables) {
    let content = fs.readFileSync(templatePath, 'utf8');
        
    // Replace all variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value || `[${key}]`);
    });

    return content;
  }
}

// CLI interface
if (require.main === module) {
  const mapper = new TemplateVariableMapper();
    
  // Example usage
  const weekNumber = parseInt(process.argv[2]) || 1;
  const dayType = process.argv[3] || 'tuesday';
  const templateType = process.argv[4] || 'dailyStudy';
    
  try {
    const variables = mapper.getVariableMappings(weekNumber, dayType, templateType);
    console.log('Variable Mappings:');
    console.log(JSON.stringify(variables, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = TemplateVariableMapper;