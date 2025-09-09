#!/usr/bin/env node

/**
 * Content Generator Script
 * Generates video scripts, descriptions, and metadata based on templates
 */

const fs = require('fs');
const path = require('path');

class ContentGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, '../../templates');
    this.outputDir = path.join(__dirname, '../../generated');
    this.configPath = path.join(__dirname, '../../config/content-schedule.json');
    this.detailedCalendarPath = path.join(__dirname, '../../config/complete-13-week-calendar.json');
  }

  /**
   * Load template file and replace variables
   */
  loadTemplate(templatePath, variables) {
    try {
      let template = fs.readFileSync(templatePath, 'utf8');
      
      // Replace all template variables
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key]);
      });
      
      return template;
    } catch (error) {
      console.error(`Error loading template ${templatePath}:`, error.message);
      return null;
    }
  }

  /**
   * Generate daily study video script
   */
  generateDailyScript(weekNumber, dayNumber, contentData) {
    const templatePath = path.join(this.templatesDir, 'video-scripts/daily-study.md');
    const variables = {
      week_number: weekNumber,
      day_number: dayNumber,
      topic_title: contentData.topic,
      eco_tasks: contentData.ecoTasks.join(', '),
      hook_content: contentData.hook,
      objective_1: contentData.objectives[0],
      objective_2: contentData.objectives[1],
      objective_3: contentData.objectives[2],
      eco_task_mapping: contentData.ecoMapping,
      main_content_outline: contentData.mainContent,
      practice_scenario: contentData.practiceScenario,
      takeaway_1: contentData.takeaways[0],
      takeaway_2: contentData.takeaways[1],
      takeaway_3: contentData.takeaways[2],
      next_topic: contentData.nextTopic,
      batch_session_id: contentData.batchId,
      domain_color: contentData.domainColor,
      target_keywords: contentData.keywords.join(', ')
    };

    return this.loadTemplate(templatePath, variables);
  }

  /**
   * Generate video description
   */
  generateDescription(contentData) {
    const templatePath = path.join(this.templatesDir, 'descriptions/video-description-template.md');
    const variables = {
      day_number: contentData.dayNumber,
      topic_title: contentData.topic,
      learning_objectives: contentData.objectives.map(obj => `• ${obj}`).join('\n'),
      main_content_sections: contentData.sections.map((section, index) => 
        `${this.formatTimestamp(section.timestamp)} - ${section.title}`
      ).join('\n'),
      practice_timestamp: this.formatTimestamp(contentData.practiceTimestamp),
      takeaways_timestamp: this.formatTimestamp(contentData.takeawaysTimestamp),
      preview_timestamp: this.formatTimestamp(contentData.previewTimestamp),
      eco_task_list: contentData.ecoTasks.map(task => `• ${task}`).join('\n'),
      lead_magnet_link_1: process.env.LEAD_MAGNET_CALENDAR_URL,
      lead_magnet_link_2: process.env.LEAD_MAGNET_CHEATSHEET_URL,
      lead_magnet_link_3: process.env.LEAD_MAGNET_QUESTIONS_URL,
      playlist_link: process.env.MAIN_PLAYLIST_URL,
      week_playlist_link: contentData.weekPlaylistUrl,
      domain_playlist_link: contentData.domainPlaylistUrl,
      weekly_study_tip: contentData.studyTip,
      week_number: contentData.weekNumber,
      domain_name: contentData.domain
    };

    return this.loadTemplate(templatePath, variables);
  }

  /**
   * Format seconds to MM:SS timestamp
   */
  formatTimestamp(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Generate batch content for a week
   */
  generateWeekContent(weekNumber, weekData) {
    const weekDir = path.join(this.outputDir, `week-${weekNumber}`);
    
    // Create output directory
    if (!fs.existsSync(weekDir)) {
      fs.mkdirSync(weekDir, { recursive: true });
    }

    weekData.days.forEach((dayData, index) => {
      const dayNumber = index + 1;
      
      // Generate script
      const script = this.generateDailyScript(weekNumber, dayNumber, dayData);
      if (script) {
        fs.writeFileSync(
          path.join(weekDir, `day-${dayNumber}-script.md`),
          script
        );
      }

      // Generate description
      const description = this.generateDescription({
        ...dayData,
        dayNumber,
        weekNumber
      });
      if (description) {
        fs.writeFileSync(
          path.join(weekDir, `day-${dayNumber}-description.md`),
          description
        );
      }
    });

    console.log(`Generated content for Week ${weekNumber}`);
  }

  /**
   * Load detailed calendar data
   */
  loadDetailedCalendar() {
    try {
      return JSON.parse(fs.readFileSync(this.detailedCalendarPath, 'utf8'));
    } catch (error) {
      console.error('Error loading detailed calendar:', error.message);
      return null;
    }
  }

  /**
   * Generate content from detailed calendar
   */
  generateFromDetailedCalendar() {
    try {
      const calendar = this.loadDetailedCalendar();
      if (!calendar) {return;}

      calendar.weeks.forEach(weekData => {
        this.generateWeekFromCalendar(weekData);
      });

      console.log('Content generation from detailed calendar completed successfully!');
    } catch (error) {
      console.error('Error generating content from detailed calendar:', error.message);
    }
  }

  /**
   * Generate week content from calendar data
   */
  generateWeekFromCalendar(weekData) {
    const weekDir = path.join(this.outputDir, `week-${weekData.week}`);
    
    // Create output directory
    if (!fs.existsSync(weekDir)) {
      fs.mkdirSync(weekDir, { recursive: true });
    }

    // Generate content for each day
    Object.keys(weekData.videos).forEach(day => {
      const videoData = weekData.videos[day];
      const fileName = `${day}-${videoData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
      
      // Generate script based on video type
      const content = this.generateVideoScript(videoData, weekData);
      
      if (content) {
        fs.writeFileSync(path.join(weekDir, fileName), content);
      }
    });

    console.log(`Generated content for Week ${weekData.week}: ${weekData.theme}`);
  }

  /**
   * Generate video script based on type and data
   */
  generateVideoScript(videoData, weekData) {
    // Use specific template for channel trailer
    if (videoData.type === 'channel-trailer') {
      return this.loadTemplate(
        path.join(this.templatesDir, 'video-scripts/channel-trailer.md'),
        {}
      );
    }

    const template = `# ${videoData.title}

**Week:** ${weekData.week}
**Theme:** ${weekData.theme}
**Domain:** ${weekData.domain || 'Mixed'}
**Color:** ${weekData.color}

## Video Structure

### 1. Hook (0-30 seconds)
${videoData.hook || 'Compelling opening question or statement'}

### 2. Learning Objectives (30-60 seconds)
By the end of this video, you will:
- [Objective 1]
- [Objective 2] 
- [Objective 3]

### 3. ECO Connection (60-90 seconds)
${videoData.ecoTasks ? `This lesson directly supports ECO tasks: ${videoData.ecoTasks.join(', ')}` : 'Connection to exam content outline'}

### 4. Main Content (8-12 minutes)
[Main content outline based on: ${videoData.content || videoData.title}]

### 5. Practice Application (2-4 minutes)
[Practice scenario or questions]

### 6. Key Takeaways (1-2 minutes)
- [Key takeaway 1]
- [Key takeaway 2]
- [Key takeaway 3]

### 7. Next Preview (30 seconds)
[Tomorrow's topic preview]

## Production Notes
- Week: ${weekData.week}
- Theme: ${weekData.theme}
- Thumbnail color: ${weekData.color}
- Domain focus: ${weekData.domain || 'Mixed'}
${videoData.type ? `- Video type: ${videoData.type}` : ''}
${videoData.dayNumber ? `- Day number: ${videoData.dayNumber}` : ''}

## SEO Elements
- Title: ${videoData.title}
- Keywords: PMP exam prep, ${weekData.theme.toLowerCase()}, ${weekData.domain || 'certification'}
- Description template: Day ${videoData.dayNumber || 'X'} of our 13-Week PMP Study Plan
`;

    return template;
  }

  /**
   * Load content schedule and generate all content
   */
  generateAllContent() {
    try {
      const schedule = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      schedule.weeks.forEach((weekData, index) => {
        const weekNumber = index + 1;
        this.generateWeekContent(weekNumber, weekData);
      });

      console.log('Content generation completed successfully!');
    } catch (error) {
      console.error('Error generating content:', error.message);
    }
  }
}

// CLI usage
if (require.main === module) {
  const generator = new ContentGenerator();
  
  const command = process.argv[2];
  const weekNumber = process.argv[3];

  switch (command) {
  case 'week':
    if (!weekNumber) {
      console.error('Please specify week number: node content-generator.js week 1');
      process.exit(1);
    }
    // Load specific week data and generate
    console.log(`Generating content for week ${weekNumber}`);
    break;
    
  case 'all':
    generator.generateAllContent();
    break;
    
  case 'calendar':
    generator.generateFromDetailedCalendar();
    break;
    
  default:
    console.log('Usage:');
    console.log('  node content-generator.js all          # Generate all content');
    console.log('  node content-generator.js calendar     # Generate from detailed calendar');
    console.log('  node content-generator.js week <num>   # Generate specific week');
  }
}

module.exports = ContentGenerator;