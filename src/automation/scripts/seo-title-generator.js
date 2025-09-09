const fs = require('fs-extra');
const path = require('path');

class SEOTitleGenerator {
  constructor() {
    this.keywordDatabase = null;
    this.titleFormulas = {
      daily: [
        'Day {day}: {topic} | PMP Exam Prep Week {week}',
        '{topic} Explained | Day {day} PMP Study Guide',
        'PMP Week {week} Day {day}: Master {topic}',
        'Learn {topic} in {duration} Minutes | PMP Exam Prep',
        '{topic} for PMP Success | Week {week} Study Plan'
      ],
      practice: [
        'PMP Practice: {topic} Questions & Scenarios',
        'Master {topic} | PMP Practice Session Week {week}',
        '{topic} Practice Questions | PMP Exam Prep',
        'Week {week} Practice: {topic} Deep Dive',
        'PMP {topic} Scenarios | Practice & Review'
      ],
      review: [
        'Week {week} Review: {topic} Key Concepts',
        '{topic} Summary | PMP Week {week} Recap',
        'Master {topic} | Week {week} PMP Review',
        'PMP Week {week}: {topic} Complete Review',
        '{topic} Essentials | PMP Study Week {week}'
      ],
      overview: [
        'Week {week} Overview: {topic} Mastery Plan',
        'PMP Week {week}: Complete {topic} Guide',
        '{topic} Week | PMP Study Plan Week {week}',
        'Master {topic} This Week | PMP Exam Prep',
        'Week {week} Focus: {topic} for PMP Success'
      ]
    };
    this.seoOptimizations = {
      hooks: [
        'Master',
        'Learn',
        'Complete Guide to',
        'Essential',
        'Ultimate',
        'Step-by-Step',
        'Proven',
        'Expert'
      ],
      benefits: [
        'Pass Your PMP Exam',
        'Boost Your Career',
        'Get Certified Fast',
        'Study Smart',
        'Exam Success',
        'Professional Growth'
      ],
      urgency: [
        '2024',
        'Latest',
        'Updated',
        'New',
        'Current'
      ]
    };
  }

  async loadKeywordDatabase() {
    try {
      const keywordPath = path.join(__dirname, '../../config/seo-keyword-database.json');
      this.keywordDatabase = await fs.readJson(keywordPath);
      return this.keywordDatabase;
    } catch (error) {
      console.error('Error loading keyword database:', error);
      throw error;
    }
  }

  generateTitle(contentType, variables = {}) {
    if (!this.keywordDatabase) {
      throw new Error('Keyword database not loaded. Call loadKeywordDatabase() first.');
    }

    const formulas = this.titleFormulas[contentType] || this.titleFormulas.daily;
    const selectedFormula = this.selectOptimalFormula(formulas, variables);
    
    return this.populateTemplate(selectedFormula, variables);
  }

  selectOptimalFormula(formulas, variables) {
    // Select formula based on content characteristics
    const { week, topic, difficulty } = variables;
    
    // For early weeks, use simpler formulas
    if (week <= 3) {
      return formulas[0] || formulas[Math.floor(Math.random() * formulas.length)];
    }
    
    // For complex topics, use explanatory formulas
    if (difficulty === 'high') {
      return formulas.find(f => f.includes('Explained') || f.includes('Master')) || formulas[0];
    }
    
    // Default to random selection for variety
    return formulas[Math.floor(Math.random() * formulas.length)];
  }

  populateTemplate(template, variables) {
    let title = template;
    
    // Replace all variables in the template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      title = title.replace(regex, variables[key]);
    });
    
    return title;
  }

  optimizeForSEO(title, targetKeywords = []) {
    let optimizedTitle = title;
    
    // Ensure primary keyword is included
    const primaryKeyword = this.keywordDatabase.primaryKeywords.core[0];
    if (!optimizedTitle.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      optimizedTitle += ` | ${primaryKeyword}`;
    }
    
    // Add year for freshness
    if (!optimizedTitle.includes('2024')) {
      optimizedTitle = optimizedTitle.replace('PMP', 'PMP 2024');
    }
    
    // Ensure title length is optimal (50-60 characters for best CTR)
    if (optimizedTitle.length > 60) {
      optimizedTitle = this.truncateTitle(optimizedTitle, 60);
    }
    
    return optimizedTitle;
  }

  truncateTitle(title, maxLength) {
    if (title.length <= maxLength) {return title;}
    
    // Find the last complete word before the limit
    const truncated = title.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  generateTitleVariations(contentType, variables, count = 3) {
    const variations = [];
    const formulas = this.titleFormulas[contentType] || this.titleFormulas.daily;
    
    for (let i = 0; i < Math.min(count, formulas.length); i++) {
      const formula = formulas[i];
      const title = this.populateTemplate(formula, variables);
      const optimizedTitle = this.optimizeForSEO(title);
      
      variations.push({
        title: optimizedTitle,
        formula: formula,
        estimatedCTR: this.estimateCTR(optimizedTitle),
        keywordDensity: this.calculateKeywordDensity(optimizedTitle)
      });
    }
    
    return variations.sort((a, b) => b.estimatedCTR - a.estimatedCTR);
  }

  estimateCTR(title) {
    let score = 0.05; // Base CTR
    
    // Boost for power words
    this.seoOptimizations.hooks.forEach(hook => {
      if (title.toLowerCase().includes(hook.toLowerCase())) {
        score += 0.01;
      }
    });
    
    // Boost for numbers
    if (/\d+/.test(title)) {
      score += 0.015;
    }
    
    // Boost for year
    if (title.includes('2024')) {
      score += 0.01;
    }
    
    // Penalty for length
    if (title.length > 60) {
      score -= 0.02;
    }
    
    return Math.min(score, 0.15); // Cap at 15% estimated CTR
  }

  calculateKeywordDensity(title) {
    const words = title.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    let keywordCount = 0;
    
    // Count primary keywords
    this.keywordDatabase.primaryKeywords.core.forEach(keyword => {
      const keywordWords = keyword.toLowerCase().split(/\s+/);
      keywordWords.forEach(word => {
        if (words.includes(word)) {
          keywordCount++;
        }
      });
    });
    
    return keywordCount / totalWords;
  }

  async generateBatchTitles(contentList) {
    if (!this.keywordDatabase) {
      await this.loadKeywordDatabase();
    }
    
    const results = [];
    
    for (const content of contentList) {
      const variations = this.generateTitleVariations(
        content.type,
        content.variables,
        3
      );
      
      results.push({
        contentId: content.id,
        originalTitle: content.title,
        variations: variations,
        recommended: variations[0]
      });
    }
    
    return results;
  }
}

module.exports = SEOTitleGenerator;