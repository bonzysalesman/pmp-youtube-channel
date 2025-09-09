/**
 * Engagement Templates
 * Platform-specific engagement templates and automated welcome sequences
 */

const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

class EngagementTemplates {
  constructor() {
    this.templatesPath = path.join(__dirname, '../../templates/engagement');
    this.templates = this.loadTemplates();
    this.registerHelpers();
  }

  loadTemplates() {
    const templates = {
      welcome: {},
      responses: {},
      celebrations: {},
      followups: {}
    };

    // Load welcome templates
    const welcomePath = path.join(this.templatesPath, 'welcome');
    if (fs.existsSync(welcomePath)) {
      const platforms = fs.readdirSync(welcomePath);
      platforms.forEach(platform => {
        const platformPath = path.join(welcomePath, platform);
        if (fs.statSync(platformPath).isDirectory()) {
          templates.welcome[platform] = this.loadPlatformTemplates(platformPath);
        }
      });
    }

    // Load response templates
    const responsePath = path.join(this.templatesPath, 'responses');
    if (fs.existsSync(responsePath)) {
      const platforms = fs.readdirSync(responsePath);
      platforms.forEach(platform => {
        const platformPath = path.join(responsePath, platform);
        if (fs.statSync(platformPath).isDirectory()) {
          templates.responses[platform] = this.loadPlatformTemplates(platformPath);
        }
      });
    }

    return templates;
  }

  loadPlatformTemplates(platformPath) {
    const templates = {};
    const files = fs.readdirSync(platformPath);
        
    files.forEach(file => {
      if (path.extname(file) === '.md' || path.extname(file) === '.txt') {
        const templateName = path.basename(file, path.extname(file));
        const content = fs.readFileSync(path.join(platformPath, file), 'utf8');
        templates[templateName] = Handlebars.compile(content);
      }
    });

    return templates;
  }

  registerHelpers() {
    // Register Handlebars helpers for template processing
    Handlebars.registerHelper('formatDate', (date, format) => {
      const moment = require('moment');
      return moment(date).format(format || 'MMMM Do, YYYY');
    });

    Handlebars.registerHelper('studyWeek', (joinDate) => {
      const moment = require('moment');
      const weeksSinceJoin = moment().diff(moment(joinDate), 'weeks') + 1;
      return Math.min(weeksSinceJoin, 13);
    });

    Handlebars.registerHelper('progressPercentage', (currentWeek) => {
      return Math.round((currentWeek / 13) * 100);
    });

    Handlebars.registerHelper('nextMilestone', (currentWeek) => {
      const milestones = [1, 3, 7, 13];
      return milestones.find(m => m > currentWeek) || 13;
    });
  }

  /**
     * Get welcome template for specific platform and member
     */
  async getWelcomeTemplate(platform, member) {
    const platformTemplates = this.templates.welcome[platform];
    if (!platformTemplates) {
      return this.getDefaultWelcomeTemplate(platform, member);
    }

    // Determine which welcome template to use based on member context
    let templateName = 'default';
        
    if (member.isNewToPMP) {
      templateName = 'new-to-pmp';
    } else if (member.hasExperience) {
      templateName = 'experienced';
    } else if (member.referralSource) {
      templateName = 'referral';
    }

    const template = platformTemplates[templateName] || platformTemplates['default'];
    if (!template) {
      return this.getDefaultWelcomeTemplate(platform, member);
    }

    return template({
      name: member.name || 'there',
      platform: platform,
      studyWeek: this.calculateStudyWeek(member.joinDate),
      channelName: process.env.CHANNEL_NAME || 'PMP Study Channel',
      studyGuideUrl: process.env.STUDY_GUIDE_URL || '#',
      discordUrl: process.env.DISCORD_URL || '#',
      telegramUrl: process.env.TELEGRAM_URL || '#',
      ...member
    });
  }

  /**
     * Get response template for specific platform and context
     */
  async getResponseTemplate(platform, context) {
    const platformTemplates = this.templates.responses[platform];
    if (!platformTemplates) {
      return this.getDefaultResponseTemplate(platform, context);
    }

    let templateName = context.type || 'general';
        
    // Map context types to template names
    const templateMap = {
      'question': 'question-response',
      'thanks': 'appreciation-response',
      'progress': 'progress-encouragement',
      'struggle': 'support-response',
      'success': 'celebration-response',
      'technical': 'technical-help'
    };

    templateName = templateMap[templateName] || templateName;
        
    const template = platformTemplates[templateName] || platformTemplates['general'];
    if (!template) {
      return this.getDefaultResponseTemplate(platform, context);
    }

    return template({
      name: context.userName || 'there',
      platform: platform,
      studyWeek: this.calculateStudyWeek(context.userJoinDate),
      originalMessage: context.originalMessage,
      ...context
    });
  }

  /**
     * Get celebration template for milestones
     */
  async getCelebrationTemplate(platform, celebration) {
    const platformTemplates = this.templates.celebrations[platform];
    if (!platformTemplates) {
      return this.getDefaultCelebrationTemplate(platform, celebration);
    }

    const templateName = celebration.type;
    const template = platformTemplates[templateName] || platformTemplates['milestone'];
        
    if (!template) {
      return this.getDefaultCelebrationTemplate(platform, celebration);
    }

    return template({
      name: celebration.userName,
      milestone: celebration.milestone,
      achievement: celebration.achievement,
      studyWeek: celebration.studyWeek,
      platform: platform,
      ...celebration
    });
  }

  /**
     * Generate default welcome template
     */
  getDefaultWelcomeTemplate(platform, member) {
    const templates = {
      youtube: `Welcome to our PMP study community, {{name}}! 🎉

I'm excited to have you join us on this 13-week journey to PMP certification success. Here's how to get the most out of our community:

📚 **Start with Week {{studyWeek}}** if you're following along with our study plan
🎥 **Watch the daily videos** - they're designed to build on each other
💬 **Ask questions** - I respond to every comment within 2 hours
📖 **Download the study guide** - link in the description

Your PMP success starts now! What's your biggest goal for this certification?`,

      discord: `Hey {{name}}! Welcome to our PMP study Discord! 🚀

You've joined an amazing community of future PMPs. Here's your quick start guide:

📌 Check out #announcements for weekly updates
📚 Use #study-week-{{studyWeek}} for current discussions  
❓ Ask questions in #help-and-support
🎯 Share your progress in #wins-and-milestones

Ready to crush this certification together? Drop a 👋 and tell us where you are in your PMP journey!`,

      telegram: `Welcome {{name}}! 🎊

You're now part of our focused PMP study group. We keep things simple here:

✅ Daily study tips and reminders
📝 Quick Q&A sessions
🔗 Links to new videos and resources
🏆 Celebrate wins together

Currently on Week {{studyWeek}} of our 13-week plan. Jump in wherever you are!`,

      email: `Subject: Welcome to Your PMP Success Journey!

Hi {{name}},

Welcome to our PMP certification community! You've just taken the most important step toward advancing your project management career.

Here's what happens next:

Week {{studyWeek}} Focus: [Current week topic]
📺 New videos every weekday at 6 AM EST
📚 Study guide chapters aligned with video content
💬 Community support across all platforms

Your first action: Watch today's video and introduce yourself in the comments.

To your PMP success,
[Your name]`
    };

    const template = Handlebars.compile(templates[platform] || templates.email);
    return template({
      name: member.name || 'there',
      studyWeek: this.calculateStudyWeek(member.joinDate),
      ...member
    });
  }

  /**
     * Generate default response template
     */
  getDefaultResponseTemplate(platform, context) {
    const templates = {
      youtube: `Thanks for your {{context.type}} {{name}}! 

{{#if context.originalMessage}}
Great point about "{{context.originalMessage}}" - {{/if}}

{{#if context.studyWeek}}
Since you're in Week {{context.studyWeek}}, I'd recommend focusing on [specific advice].
{{/if}}

Keep up the great work on your PMP journey! 🚀`,

      discord: `Hey {{name}}! 👋

{{#if context.originalMessage}}
Regarding your question about "{{context.originalMessage}}" - {{/if}}

[Specific helpful response based on context]

{{#if context.studyWeek}}
For Week {{context.studyWeek}}, also check out [relevant resources].
{{/if}}

You've got this! 💪`,

      telegram: `{{name}} - great question! 

[Concise helpful response]

{{#if context.studyWeek}}Week {{context.studyWeek}} tip: [Quick tip]{{/if}}

Keep studying! 📚`,

      email: `Hi {{name}},

Thank you for reaching out about {{context.topic}}.

[Detailed helpful response]

{{#if context.studyWeek}}
Since you're in Week {{context.studyWeek}} of the study plan, here are some additional resources:
- [Resource 1]
- [Resource 2]
{{/if}}

Best regards,
[Your name]`
    };

    const template = Handlebars.compile(templates[platform] || templates.email);
    return template(context);
  }

  /**
     * Generate default celebration template
     */
  getDefaultCelebrationTemplate(platform, celebration) {
    const template = Handlebars.compile(`🎉 Congratulations {{name}}! 

You just hit {{milestone}} - that's amazing progress on your PMP journey!

{{#if achievement}}Your achievement: {{achievement}}{{/if}}

Keep up the momentum! You're {{progressPercentage studyWeek}}% through the 13-week plan.

Next milestone: Week {{nextMilestone studyWeek}} 🎯`);

    return template(celebration);
  }

  /**
     * Calculate current study week based on join date
     */
  calculateStudyWeek(joinDate) {
    if (!joinDate) {return 1;}
        
    const moment = require('moment');
    const weeksSinceJoin = moment().diff(moment(joinDate), 'weeks') + 1;
    return Math.min(Math.max(weeksSinceJoin, 1), 13);
  }

  /**
     * Create template files if they don't exist
     */
  async createDefaultTemplates() {
    const platforms = ['youtube', 'discord', 'telegram', 'email'];
    const templateTypes = ['welcome', 'responses', 'celebrations'];

    for (const type of templateTypes) {
      for (const platform of platforms) {
        const platformPath = path.join(this.templatesPath, type, platform);
        await fs.ensureDir(platformPath);

        // Create default template file if it doesn't exist
        const defaultPath = path.join(platformPath, 'default.md');
        if (!fs.existsSync(defaultPath)) {
          await this.createDefaultTemplateFile(type, platform, defaultPath);
        }
      }
    }
  }

  async createDefaultTemplateFile(type, platform, filePath) {
    let content = '';

    if (type === 'welcome') {
      content = this.getDefaultWelcomeTemplate(platform, { name: '{{name}}', joinDate: new Date() });
    } else if (type === 'responses') {
      content = this.getDefaultResponseTemplate(platform, { 
        userName: '{{name}}', 
        type: '{{type}}',
        originalMessage: '{{originalMessage}}'
      });
    } else if (type === 'celebrations') {
      content = this.getDefaultCelebrationTemplate(platform, {
        userName: '{{name}}',
        milestone: '{{milestone}}',
        achievement: '{{achievement}}'
      });
    }

    await fs.writeFile(filePath, content);
  }
}

module.exports = EngagementTemplates;