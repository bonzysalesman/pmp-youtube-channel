/**
 * Video Metadata and Description Generator
 * 
 * Generates comprehensive video metadata including:
 * - SEO-optimized descriptions with ECO task mapping and timestamps
 * - Automatic section timestamp generation for 7-part video structure
 * - Keyword insertion system targeting PMP terms
 * - Playlist assignment automation based on content type and week structure
 */

const fs = require('fs-extra');
const path = require('path');

class VideoMetadataGenerator {
    constructor() {
        this.loadConfigurations();
    }

    /**
     * Load all configuration files
     */
    async loadConfigurations() {
        try {
            this.seoKeywords = await fs.readJson(path.join(__dirname, '../../config/seo-keywords.json'));
            this.videoDatabase = await fs.readJson(path.join(__dirname, '../../config/video-metadata-database.json'));
            this.contentCalendar = await fs.readJson(path.join(__dirname, '../../config/detailed-content-calendar.json'));
            this.channelSettings = await fs.readJson(path.join(__dirname, '../../config/channel-settings.json'));
        } catch (error) {
            console.error('Error loading configurations:', error);
            throw error;
        }
    }

    /**
     * Generate complete video metadata for a single video
     * @param {Object} videoConfig - Video configuration object
     * @returns {Object} Complete metadata object
     */
    generateVideoMetadata(videoConfig) {
        const metadata = {
            basic: this.generateBasicMetadata(videoConfig),
            seo: this.generateSEOMetadata(videoConfig),
            timestamps: this.generateTimestamps(videoConfig),
            description: this.generateDescription(videoConfig),
            playlists: this.generatePlaylistAssignments(videoConfig),
            keywords: this.generateKeywords(videoConfig),
            hashtags: this.generateHashtags(videoConfig)
        };

        return metadata;
    }

    /**
     * Generate basic video metadata
     * @param {Object} videoConfig - Video configuration
     * @returns {Object} Basic metadata
     */
    generateBasicMetadata(videoConfig) {
        const { week, day, dayNumber, type, title, duration, domain, workGroup } = videoConfig;
        
        return {
            week,
            day,
            dayNumber,
            type,
            title: this.generateOptimizedTitle(videoConfig),
            originalTitle: title,
            duration,
            domain,
            workGroup,
            thumbnailColor: this.getThumbnailColor(videoConfig),
            uploadSchedule: this.calculateUploadSchedule(videoConfig)
        };
    }

    /**
     * Generate SEO-optimized metadata
     * @param {Object} videoConfig - Video configuration
     * @returns {Object} SEO metadata
     */
    generateSEOMetadata(videoConfig) {
        const { type, domain, week, dayNumber } = videoConfig;
        
        const primaryKeywords = this.selectPrimaryKeywords(videoConfig);
        const longTailKeywords = this.selectLongTailKeywords(videoConfig);
        const domainKeywords = this.selectDomainKeywords(videoConfig);
        
        return {
            primaryKeywords,
            longTailKeywords,
            domainKeywords,
            targetKeywordDensity: this.calculateKeywordDensity(videoConfig),
            seoScore: this.calculateSEOScore(videoConfig),
            competitorAnalysis: this.getCompetitorInsights(videoConfig)
        };
    }

    /**
     * Generate automatic timestamps for 7-part video structure
     * @param {Object} videoConfig - Video configuration
     * @returns {Object} Timestamp structure
     */
    generateTimestamps(videoConfig) {
        const { type, duration } = videoConfig;
        const targetDurationMinutes = this.parseDuration(duration);
        
        let timestamps = {};
        
        if (type === 'daily-study') {
            timestamps = this.generateDailyStudyTimestamps(targetDurationMinutes);
        } else if (type === 'practice') {
            timestamps = this.generatePracticeTimestamps(targetDurationMinutes);
        } else if (type === 'review') {
            timestamps = this.generateReviewTimestamps(targetDurationMinutes);
        } else if (type === 'channel-trailer') {
            timestamps = this.generateTrailerTimestamps(targetDurationMinutes);
        }
        
        return {
            structure: timestamps,
            formatted: this.formatTimestampsForDescription(timestamps),
            validation: this.validateTimestamps(timestamps, targetDurationMinutes)
        };
    }

    /**
     * Generate timestamps for daily study videos (7-part structure)
     * @param {number} durationMinutes - Target duration in minutes
     * @returns {Object} Timestamp structure
     */
    generateDailyStudyTimestamps(durationMinutes) {
        const totalSeconds = durationMinutes * 60;
        
        return {
            hook: { start: 0, end: 30, duration: 30, label: "Hook & Introduction" },
            objectives: { start: 30, end: 60, duration: 30, label: "Learning Objectives" },
            ecoConnection: { start: 60, end: 90, duration: 30, label: "ECO Connection" },
            mainContent: { 
                start: 90, 
                end: totalSeconds - 270, // Leave 4.5 min for remaining sections
                duration: totalSeconds - 360,
                label: "Main Content"
            },
            practice: { 
                start: totalSeconds - 270, 
                end: totalSeconds - 150, 
                duration: 120, 
                label: "Practice Application" 
            },
            takeaways: { 
                start: totalSeconds - 150, 
                end: totalSeconds - 30, 
                duration: 120, 
                label: "Key Takeaways" 
            },
            preview: { 
                start: totalSeconds - 30, 
                end: totalSeconds, 
                duration: 30, 
                label: "Next Preview" 
            }
        };
    }

    /**
     * Generate timestamps for practice sessions
     * @param {number} durationMinutes - Target duration in minutes
     * @returns {Object} Timestamp structure
     */
    generatePracticeTimestamps(durationMinutes) {
        const totalSeconds = durationMinutes * 60;
        const scenarioDuration = Math.floor((totalSeconds - 300) / 3); // 3 scenarios, minus 5 min for other sections
        
        return {
            hook: { start: 0, end: 30, duration: 30, label: "Hook & Challenge" },
            objectives: { start: 30, end: 60, duration: 30, label: "Practice Objectives" },
            ecoConnection: { start: 60, end: 90, duration: 30, label: "ECO Connection" },
            scenario1: { 
                start: 90, 
                end: 90 + scenarioDuration, 
                duration: scenarioDuration, 
                label: "Scenario 1" 
            },
            scenario2: { 
                start: 90 + scenarioDuration, 
                end: 90 + (scenarioDuration * 2), 
                duration: scenarioDuration, 
                label: "Scenario 2" 
            },
            scenario3: { 
                start: 90 + (scenarioDuration * 2), 
                end: 90 + (scenarioDuration * 3), 
                duration: scenarioDuration, 
                label: "Scenario 3" 
            },
            patterns: { 
                start: totalSeconds - 180, 
                end: totalSeconds - 90, 
                duration: 90, 
                label: "Pattern Recognition" 
            },
            takeaways: { 
                start: totalSeconds - 90, 
                end: totalSeconds - 30, 
                duration: 60, 
                label: "Key Principles" 
            },
            preview: { 
                start: totalSeconds - 30, 
                end: totalSeconds, 
                duration: 30, 
                label: "Next Session" 
            }
        };
    }

    /**
     * Generate comprehensive video description
     * @param {Object} videoConfig - Video configuration
     * @returns {string} Complete video description
     */
    generateDescription(videoConfig) {
        const metadata = {
            basic: this.generateBasicMetadata(videoConfig),
            timestamps: this.generateTimestamps(videoConfig),
            keywords: this.generateKeywords(videoConfig),
            hashtags: this.generateHashtags(videoConfig)
        };

        const sections = [
            this.generateDescriptionHeader(videoConfig, metadata),
            this.generateLearningObjectives(videoConfig),
            this.generateTimestampSection(metadata.timestamps),
            this.generateECOTasksSection(videoConfig),
            this.generateResourcesSection(videoConfig),
            this.generateLinksSection(videoConfig, metadata),
            this.generateCommunitySection(videoConfig),
            this.generateStudyTipsSection(videoConfig),
            this.generateHashtagsSection(metadata.hashtags),
            this.generateFooterSection()
        ];

        return sections.filter(section => section).join('\n\n');
    }

    /**
     * Generate description header
     * @param {Object} videoConfig - Video configuration
     * @param {Object} metadata - Generated metadata
     * @returns {string} Description header
     */
    generateDescriptionHeader(videoConfig, metadata) {
        const { type, dayNumber, week, topic } = videoConfig;
        
        if (type === 'daily-study') {
            return `🎯 Day ${dayNumber} of our 13-Week PMP Study Plan! Today we're mastering ${topic}.`;
        } else if (type === 'practice') {
            return `🎯 Week ${week} Practice Session! Apply your knowledge with real PMP exam scenarios.`;
        } else if (type === 'review') {
            return `📊 Week ${week} Review! Consolidate your learning and prepare for next week.`;
        } else if (type === 'channel-trailer') {
            return `🎯 Welcome to your complete PMP certification journey! 13 weeks to exam success.`;
        }
        
        return `🎯 ${topic} | PMP Exam Preparation`;
    }

    /**
     * Generate learning objectives section
     * @param {Object} videoConfig - Video configuration
     * @returns {string} Learning objectives
     */
    generateLearningObjectives(videoConfig) {
        const { learningObjectives, type } = videoConfig;
        
        if (!learningObjectives || learningObjectives.length === 0) {
            return null;
        }
        
        const header = type === 'practice' ? '🎯 Practice Goals:' : '📚 What You\'ll Learn:';
        const objectives = learningObjectives.map(obj => `• ${obj}`).join('\n');
        
        return `${header}\n${objectives}`;
    }

    /**
     * Generate timestamp section for description
     * @param {Object} timestamps - Generated timestamps
     * @returns {string} Formatted timestamps
     */
    generateTimestampSection(timestamps) {
        if (!timestamps.formatted || timestamps.formatted.length === 0) {
            return null;
        }
        
        return `⏰ Video Timestamps:\n${timestamps.formatted.join('\n')}`;
    }

    /**
     * Generate ECO tasks section
     * @param {Object} videoConfig - Video configuration
     * @returns {string} ECO tasks section
     */
    generateECOTasksSection(videoConfig) {
        const { ecoTasks, domain } = videoConfig;
        
        if (!ecoTasks || ecoTasks.length === 0) {
            return null;
        }
        
        const tasks = ecoTasks.map(task => `• ${task}`).join('\n');
        const domainInfo = domain ? ` (${domain} Domain)` : '';
        
        return `🎯 ECO Tasks Covered${domainInfo}:\n${tasks}`;
    }

    /**
     * Generate resources section
     * @param {Object} videoConfig - Video configuration
     * @returns {string} Resources section
     */
    generateResourcesSection(videoConfig) {
        const resources = [
            '• 13-Week PMP Study Calendar: [LINK]',
            '• PMP Mindset Cheat Sheet: [LINK]',
            '• 50 Most Common PMP Questions: [LINK]'
        ];
        
        // Add video-specific resources
        if (videoConfig.leadMagnet) {
            resources.unshift(`• ${videoConfig.leadMagnet}: [LINK]`);
        }
        
        return `📖 FREE Study Resources:\n${resources.join('\n')}`;
    }

    /**
     * Generate links section
     * @param {Object} videoConfig - Video configuration
     * @param {Object} metadata - Generated metadata
     * @returns {string} Links section
     */
    generateLinksSection(videoConfig, metadata) {
        const { week, domain } = videoConfig;
        const playlists = metadata.basic ? this.generatePlaylistAssignments(videoConfig) : [];
        
        const links = [
            '• Complete 13-Week Playlist: [LINK]'
        ];
        
        if (week) {
            links.push(`• Week ${week} Playlist: [LINK]`);
        }
        
        if (domain && domain !== 'Mixed') {
            links.push(`• ${domain} Domain Playlist: [LINK]`);
        }
        
        return `🔗 Helpful Links:\n${links.join('\n')}`;
    }

    /**
     * Generate community section
     * @param {Object} videoConfig - Video configuration
     * @returns {string} Community section
     */
    generateCommunitySection(videoConfig) {
        const { communityQuestion } = videoConfig;
        
        const baseText = [
            '• Ask questions in the comments below',
            '• Share your study progress',
            '• Connect with other PMP candidates'
        ];
        
        if (communityQuestion) {
            baseText.unshift(`• ${communityQuestion}`);
        }
        
        return `💬 Join Our Community:\n${baseText.join('\n')}`;
    }

    /**
     * Generate study tips section
     * @param {Object} videoConfig - Video configuration
     * @returns {string} Study tips section
     */
    generateStudyTipsSection(videoConfig) {
        const { studyTip, week, type } = videoConfig;
        
        if (studyTip) {
            return `📌 Study Tip:\n${studyTip}`;
        }
        
        // Generate default study tips based on week and type
        const defaultTips = this.getDefaultStudyTips(week, type);
        if (defaultTips) {
            return `📌 Study Tips:\n${defaultTips}`;
        }
        
        return null;
    }

    /**
     * Generate hashtags section
     * @param {Array} hashtags - Generated hashtags
     * @returns {string} Hashtags
     */
    generateHashtagsSection(hashtags) {
        if (!hashtags || hashtags.length === 0) {
            return null;
        }
        
        return hashtags.join(' ');
    }

    /**
     * Generate footer section
     * @returns {string} Footer content
     */
    generateFooterSection() {
        return `---
🎓 About This Channel:
This channel provides a complete 13-week PMP exam preparation program aligned with PMI's Examination Content Outline. New videos daily during study cycles!

⚠️ Disclaimer: This content is for educational purposes. Always refer to the latest PMI guidelines and PMBOK for official information.`;
    }

    /**
     * Generate playlist assignments based on content type and week structure
     * @param {Object} videoConfig - Video configuration
     * @returns {Array} Playlist assignments
     */
    generatePlaylistAssignments(videoConfig) {
        const { week, type, domain, workGroup, dayNumber } = videoConfig;
        const playlists = [];
        
        // Main 13-week playlist
        playlists.push({
            name: '13-Week PMP Study Plan - Complete Course',
            id: 'main-course',
            order: dayNumber || (week * 7),
            priority: 1
        });
        
        // Weekly playlist
        if (week) {
            playlists.push({
                name: `Week ${week} - ${workGroup || 'PMP Study'}`,
                id: `week-${week}`,
                order: this.getDayOrderInWeek(videoConfig),
                priority: 2
            });
        }
        
        // Domain-specific playlists
        if (domain && domain !== 'Mixed') {
            playlists.push({
                name: `${domain} Domain - PMP Exam Prep`,
                id: `domain-${domain.toLowerCase().replace(' ', '-')}`,
                order: this.getDomainOrder(videoConfig),
                priority: 3
            });
        }
        
        // Content type playlists
        if (type === 'practice') {
            playlists.push({
                name: 'PMP Practice Sessions - Exam Scenarios',
                id: 'practice-sessions',
                order: week || 1,
                priority: 4
            });
        } else if (type === 'review') {
            playlists.push({
                name: 'PMP Weekly Reviews - Concept Consolidation',
                id: 'weekly-reviews',
                order: week || 1,
                priority: 4
            });
        }
        
        // Work group playlists
        if (workGroup) {
            playlists.push({
                name: `${workGroup} - PMP Work Group`,
                id: `workgroup-${workGroup.toLowerCase().replace(' ', '-')}`,
                order: this.getWorkGroupOrder(videoConfig),
                priority: 5
            });
        }
        
        return playlists.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Generate keywords for video
     * @param {Object} videoConfig - Video configuration
     * @returns {Array} Keywords array
     */
    generateKeywords(videoConfig) {
        const { type, domain, topic, week, ecoTasks } = videoConfig;
        const keywords = [];
        
        // Primary keywords
        keywords.push(...this.seoKeywords.primaryKeywords);
        
        // Content type specific keywords
        if (this.seoKeywords.contentTypeKeywords[type]) {
            keywords.push(...this.seoKeywords.contentTypeKeywords[type]);
        }
        
        // Domain specific keywords
        if (domain && this.seoKeywords.domainSpecificKeywords[domain.toLowerCase()]) {
            keywords.push(...this.seoKeywords.domainSpecificKeywords[domain.toLowerCase()]);
        }
        
        // Topic-specific keywords
        if (topic) {
            keywords.push(topic, `PMP ${topic}`, `${topic} PMP exam`);
        }
        
        // Week-specific keywords
        if (week) {
            keywords.push(`PMP week ${week}`, `13-week study plan week ${week}`);
        }
        
        // ECO task keywords
        if (ecoTasks && ecoTasks.length > 0) {
            ecoTasks.forEach(task => {
                keywords.push(`PMP ${task}`, `ECO ${task}`);
            });
        }
        
        // Remove duplicates and return
        return [...new Set(keywords)];
    }

    /**
     * Generate hashtags for video
     * @param {Object} videoConfig - Video configuration
     * @returns {Array} Hashtags array
     */
    generateHashtags(videoConfig) {
        const { domain, type } = videoConfig;
        const hashtags = [];
        
        // Primary hashtags
        hashtags.push(...this.seoKeywords.hashtagSets.primary);
        
        // Secondary hashtags
        hashtags.push(...this.seoKeywords.hashtagSets.secondary);
        
        // Domain-specific hashtags
        if (domain === 'People') {
            hashtags.push('#TeamLeadership', '#StakeholderManagement', '#ConflictResolution');
        } else if (domain === 'Process') {
            hashtags.push('#ProjectPlanning', '#RiskManagement', '#QualityManagement');
        } else if (domain === 'Business Environment') {
            hashtags.push('#BusinessValue', '#OrganizationalStrategy', '#ComplianceManagement');
        }
        
        // Content type hashtags
        if (type === 'practice') {
            hashtags.push('#PMPPractice', '#ExamScenarios', '#PMPQuestions');
        } else if (type === 'review') {
            hashtags.push('#PMPReview', '#WeeklyReview', '#ConceptReview');
        }
        
        // Niche hashtags
        hashtags.push(...this.seoKeywords.hashtagSets.niche);
        
        return hashtags.slice(0, 15); // Limit to 15 hashtags
    }

    /**
     * Generate optimized title using proven formulas
     * @param {Object} videoConfig - Video configuration
     * @returns {string} Optimized title
     */
    generateOptimizedTitle(videoConfig) {
        const { type, dayNumber, week, topic, domain } = videoConfig;
        const formulas = this.seoKeywords.titleFormulas;
        
        let selectedFormula;
        
        if (type === 'daily-study' && dayNumber) {
            selectedFormula = formulas[0]; // Day-specific formula
        } else if (type === 'practice') {
            selectedFormula = formulas[3]; // Practice formula
        } else if (domain) {
            selectedFormula = formulas[1]; // Domain formula
        } else {
            selectedFormula = formulas[2]; // Week formula
        }
        
        // Replace template variables
        return selectedFormula
            .replace('{{day}}', dayNumber || '')
            .replace('{{week}}', week || '')
            .replace('{{topic}}', topic || '')
            .replace('{{domain}}', domain || '');
    }

    /**
     * Helper method to parse duration string
     * @param {string} duration - Duration string (e.g., "15-18 minutes")
     * @returns {number} Duration in minutes
     */
    parseDuration(duration) {
        if (typeof duration === 'number') return duration;
        if (!duration || typeof duration !== 'string') return 15; // Default fallback
        
        const match = duration.match(/(\d+)(?:-(\d+))?\s*minutes?/i);
        if (match) {
            const min = parseInt(match[1]);
            const max = match[2] ? parseInt(match[2]) : min;
            return Math.floor((min + max) / 2); // Return average
        }
        
        return 15; // Default fallback
    }

    /**
     * Format timestamps for description
     * @param {Object} timestamps - Timestamp structure
     * @returns {Array} Formatted timestamp strings
     */
    formatTimestampsForDescription(timestamps) {
        const formatted = [];
        
        Object.values(timestamps).forEach(section => {
            if (section.start !== undefined && section.label) {
                const time = this.secondsToTimestamp(section.start);
                formatted.push(`${time} - ${section.label}`);
            }
        });
        
        return formatted;
    }

    /**
     * Convert seconds to MM:SS format
     * @param {number} seconds - Seconds
     * @returns {string} Formatted timestamp
     */
    secondsToTimestamp(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get thumbnail color based on video configuration
     * @param {Object} videoConfig - Video configuration
     * @returns {string} Color code
     */
    getThumbnailColor(videoConfig) {
        const { domain, type } = videoConfig;
        
        if (type === 'practice' || type === 'review') {
            return 'purple';
        }
        
        switch (domain) {
            case 'People': return 'green';
            case 'Process': return 'blue';
            case 'Business Environment': return 'orange';
            default: return 'purple';
        }
    }

    /**
     * Calculate upload schedule
     * @param {Object} videoConfig - Video configuration
     * @returns {Object} Upload schedule
     */
    calculateUploadSchedule(videoConfig) {
        const { week, day, dayNumber } = videoConfig;
        
        // This would integrate with the content calendar
        // For now, return a placeholder structure
        return {
            week,
            day,
            dayNumber,
            scheduledDate: null, // Would be calculated based on start date
            uploadTime: '09:00', // Default upload time
            timezone: 'UTC'
        };
    }

    // Additional helper methods would go here...
    getDayOrderInWeek(videoConfig) {
        const dayMap = {
            'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
            'Friday': 5, 'Saturday': 6, 'Sunday': 7
        };
        return dayMap[videoConfig.day] || 1;
    }

    getDomainOrder(videoConfig) {
        // This would calculate order within domain-specific playlists
        return videoConfig.dayNumber || 1;
    }

    getWorkGroupOrder(videoConfig) {
        // This would calculate order within work group playlists
        return videoConfig.week || 1;
    }

    getDefaultStudyTips(week, type) {
        const tips = {
            1: "Start with understanding the exam format before diving into content.",
            2: "Focus on the PMP mindset - think proactive, not reactive.",
            3: "Practice scenario-based thinking for People domain questions."
        };
        
        return tips[week] || "Review your notes daily and practice with scenarios.";
    }

    selectPrimaryKeywords(videoConfig) {
        return this.seoKeywords.primaryKeywords.slice(0, 3);
    }

    selectLongTailKeywords(videoConfig) {
        return this.seoKeywords.longTailKeywords.slice(0, 2);
    }

    selectDomainKeywords(videoConfig) {
        const { domain } = videoConfig;
        if (domain && this.seoKeywords.domainSpecificKeywords[domain.toLowerCase()]) {
            return this.seoKeywords.domainSpecificKeywords[domain.toLowerCase()].slice(0, 2);
        }
        return [];
    }

    calculateKeywordDensity(videoConfig) {
        // Placeholder for keyword density calculation
        return 2.5; // Target 2-3% keyword density
    }

    calculateSEOScore(videoConfig) {
        // Placeholder for SEO score calculation
        return 85; // Out of 100
    }

    getCompetitorInsights(videoConfig) {
        return this.seoKeywords.competitorAnalysis.gapOpportunities;
    }

    validateTimestamps(timestamps, durationMinutes) {
        const totalSeconds = durationMinutes * 60;
        const sections = Object.values(timestamps);
        
        if (sections.length === 0) {
            return {
                valid: false,
                totalDuration: totalSeconds,
                actualEnd: 0,
                sections: 0
            };
        }
        
        const lastSection = sections[sections.length - 1];
        
        return {
            valid: lastSection && lastSection.end <= totalSeconds,
            totalDuration: totalSeconds,
            actualEnd: lastSection ? lastSection.end : 0,
            sections: sections.length
        };
    }

    generateReviewTimestamps(durationMinutes) {
        const totalSeconds = durationMinutes * 60;
        
        return {
            hook: { start: 0, end: 30, duration: 30, label: "Week Overview" },
            objectives: { start: 30, end: 60, duration: 30, label: "Review Objectives" },
            concepts: { 
                start: 60, 
                end: totalSeconds - 240, 
                duration: totalSeconds - 300,
                label: "Key Concepts Review" 
            },
            integration: { 
                start: totalSeconds - 240, 
                end: totalSeconds - 120, 
                duration: 120, 
                label: "Integration Exercise" 
            },
            assessment: { 
                start: totalSeconds - 120, 
                end: totalSeconds - 60, 
                duration: 60, 
                label: "Week Assessment" 
            },
            preview: { 
                start: totalSeconds - 60, 
                end: totalSeconds, 
                duration: 60, 
                label: "Next Week Preview" 
            }
        };
    }

    generateTrailerTimestamps(durationMinutes) {
        const totalSeconds = durationMinutes * 60;
        
        return {
            hook: { start: 0, end: 30, duration: 30, label: "Career Transformation Promise" },
            benefits: { start: 30, end: 90, duration: 60, label: "Why PMP Matters" },
            approach: { start: 90, end: 180, duration: 90, label: "ECO-Based Precision" },
            mindset: { start: 180, end: 240, duration: 60, label: "PMP Mindset" },
            roadmap: { start: 240, end: 330, duration: 90, label: "13-Week Roadmap" },
            community: { start: 330, end: 390, duration: 60, label: "Community Support" },
            cta: { start: 390, end: totalSeconds, duration: totalSeconds - 390, label: "Subscribe & Engage" }
        };
    }
}

module.exports = VideoMetadataGenerator;