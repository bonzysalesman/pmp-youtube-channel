/**
 * Lead Magnet Creation and Distribution System
 * Generates, tracks, and distributes lead magnets for PMP study content
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const PDFDocument = require('pdfkit');

class LeadMagnetSystem {
    constructor() {
        this.config = this.loadConfig();
        this.dataPath = path.join(__dirname, '../../data/lead-magnets.json');
        this.data = this.loadData();
        this.templatesPath = path.join(__dirname, '../../templates/lead-magnets');
        this.outputPath = path.join(__dirname, '../../generated/lead-magnets');
        
        this.pdfGenerator = new PDFGenerator();
        this.downloadTracker = new DownloadTracker();
        this.emailCapture = new EmailCaptureIntegration();
        this.performanceTracker = new LeadMagnetPerformanceTracker();
    }

    loadConfig() {
        const configPath = path.join(__dirname, '../../config/lead-magnet-config.json');
        if (fs.existsSync(configPath)) {
            return fs.readJsonSync(configPath);
        }
        return this.getDefaultConfig();
    }

    getDefaultConfig() {
        return {
            leadMagnets: {
                "13-week-study-calendar": {
                    title: "13-Week PMP Study Calendar",
                    description: "Complete day-by-day study plan with video schedule",
                    type: "calendar",
                    template: "study-calendar-template.json",
                    enabled: true,
                    targetAudience: "new_students",
                    estimatedValue: "$47"
                },
                "50-common-questions": {
                    title: "50 Most Common PMP Exam Questions",
                    description: "Practice questions with detailed explanations",
                    type: "practice_questions",
                    template: "practice-questions-template.json",
                    enabled: true,
                    targetAudience: "exam_prep",
                    estimatedValue: "$29"
                },
                "pmp-mindset-cheat-sheet": {
                    title: "PMP Mindset Cheat Sheet",
                    description: "Essential mindset principles for PMP success",
                    type: "reference_guide",
                    template: "mindset-cheat-sheet-template.json",
                    enabled: true,
                    targetAudience: "all_students",
                    estimatedValue: "$19"
                },
                "eco-task-checklist": {
                    title: "ECO Task Checklist",
                    description: "Complete checklist of all 27 ECO tasks with examples",
                    type: "checklist",
                    template: "eco-checklist-template.json",
                    enabled: true,
                    targetAudience: "advanced_students",
                    estimatedValue: "$39"
                }
            },
            distribution: {
                channels: ["youtube", "website", "email", "social"],
                deliveryMethods: ["instant_download", "email_delivery", "drip_sequence"],
                trackingEnabled: true,
                analyticsIntegration: true
            },
            emailCapture: {
                provider: "mailchimp",
                requireEmail: true,
                doubleOptIn: true,
                welcomeSequence: true,
                segmentation: true
            },
            branding: {
                colors: {
                    primary: "#2E86AB",
                    secondary: "#A23B72", 
                    accent: "#F18F01",
                    text: "#333333"
                },
                fonts: {
                    heading: "Montserrat",
                    body: "Open Sans"
                },
                logo: "pmp-study-logo.png"
            }
        };
    }

    loadData() {
        if (fs.existsSync(this.dataPath)) {
            return fs.readJsonSync(this.dataPath);
        }
        return {
            generated: [],
            downloads: [],
            emailCaptures: [],
            performance: {},
            lastUpdated: moment().toISOString()
        };
    }

    saveData() {
        fs.ensureDirSync(path.dirname(this.dataPath));
        this.data.lastUpdated = moment().toISOString();
        fs.writeJsonSync(this.data, this.data, { spaces: 2 });
    }

    /**
     * Generate all lead magnets
     */
    async generateAllLeadMagnets() {
        const results = [];
        
        for (const [magnetId, config] of Object.entries(this.config.leadMagnets)) {
            if (config.enabled) {
                try {
                    const result = await this.generateLeadMagnet(magnetId);
                    results.push(result);
                } catch (error) {
                    console.error(`Error generating ${magnetId}:`, error);
                    results.push({
                        magnetId,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        return results;
    }

    /**
     * Generate specific lead magnet
     */
    async generateLeadMagnet(magnetId) {
        const config = this.config.leadMagnets[magnetId];
        if (!config) {
            throw new Error(`Lead magnet ${magnetId} not found`);
        }

        const templateData = await this.loadTemplate(config.template);
        const generatedContent = await this.processTemplate(templateData, magnetId);
        
        const pdfPath = await this.pdfGenerator.generatePDF(generatedContent, magnetId);
        
        const magnetRecord = {
            id: this.generateMagnetId(),
            magnetId: magnetId,
            title: config.title,
            description: config.description,
            type: config.type,
            filePath: pdfPath,
            fileSize: await this.getFileSize(pdfPath),
            generatedAt: moment().toISOString(),
            version: this.calculateVersion(magnetId),
            downloadUrl: this.generateDownloadUrl(magnetId),
            trackingCode: this.generateTrackingCode(magnetId)
        };

        this.data.generated.push(magnetRecord);
        this.saveData();

        return {
            magnetId,
            success: true,
            filePath: pdfPath,
            downloadUrl: magnetRecord.downloadUrl,
            trackingCode: magnetRecord.trackingCode
        };
    }

    /**
     * Load template data
     */
    async loadTemplate(templateFile) {
        const templatePath = path.join(this.templatesPath, templateFile);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template ${templateFile} not found`);
        }
        return fs.readJsonSync(templatePath);
    }

    /**
     * Process template with dynamic data
     */
    async processTemplate(templateData, magnetId) {
        const processedData = { ...templateData };
        
        // Add dynamic content based on magnet type
        switch (magnetId) {
            case '13-week-study-calendar':
                processedData.content = await this.generateStudyCalendarContent();
                break;
            case '50-common-questions':
                processedData.content = await this.generatePracticeQuestionsContent();
                break;
            case 'pmp-mindset-cheat-sheet':
                processedData.content = await this.generateMindsetCheatSheetContent();
                break;
            case 'eco-task-checklist':
                processedData.content = await this.generateECOChecklistContent();
                break;
        }

        // Add common metadata
        processedData.metadata = {
            generatedDate: moment().format('MMMM Do, YYYY'),
            version: this.calculateVersion(magnetId),
            channelName: process.env.CHANNEL_NAME || 'PMP Study Channel',
            websiteUrl: process.env.WEBSITE_URL || 'https://example.com',
            ...processedData.metadata
        };

        return processedData;
    }

    /**
     * Generate study calendar content
     */
    async generateStudyCalendarContent() {
        const calendar = {
            title: "13-Week PMP Study Calendar",
            subtitle: "Your Complete Day-by-Day Study Plan",
            weeks: []
        };

        // Load content schedule
        const scheduleData = await this.loadContentSchedule();
        
        for (let week = 1; week <= 13; week++) {
            const weekData = scheduleData.weeks[`week-${week.toString().padStart(2, '0')}`];
            if (weekData) {
                calendar.weeks.push({
                    weekNumber: week,
                    title: weekData.title,
                    focus: weekData.focus,
                    days: this.generateWeekDays(weekData),
                    milestone: weekData.milestone,
                    practiceGoal: weekData.practiceGoal
                });
            }
        }

        return calendar;
    }

    /**
     * Generate practice questions content
     */
    async generatePracticeQuestionsContent() {
        return {
            title: "50 Most Common PMP Exam Questions",
            subtitle: "Practice Questions with Detailed Explanations",
            introduction: "These questions represent the most frequently tested concepts on the PMP exam, organized by domain.",
            sections: [
                {
                    domain: "People (42%)",
                    questions: this.generateDomainQuestions('people', 21)
                },
                {
                    domain: "Process (50%)",
                    questions: this.generateDomainQuestions('process', 25)
                },
                {
                    domain: "Business Environment (8%)",
                    questions: this.generateDomainQuestions('business', 4)
                }
            ],
            answerKey: "Detailed explanations and references included for each question"
        };
    }

    /**
     * Generate mindset cheat sheet content
     */
    async generateMindsetCheatSheetContent() {
        return {
            title: "PMP Mindset Cheat Sheet",
            subtitle: "Essential Principles for PMP Success",
            sections: [
                {
                    title: "Servant Leadership Mindset",
                    principles: [
                        "Put the team first, not yourself",
                        "Remove obstacles for your team",
                        "Facilitate rather than dictate",
                        "Develop team members' capabilities"
                    ]
                },
                {
                    title: "Stakeholder-Centric Approach",
                    principles: [
                        "Identify all stakeholders early",
                        "Understand their needs and expectations",
                        "Communicate proactively and transparently",
                        "Manage expectations continuously"
                    ]
                },
                {
                    title: "Value-Driven Delivery",
                    principles: [
                        "Focus on business value, not just deliverables",
                        "Deliver incrementally when possible",
                        "Measure success by outcomes, not outputs",
                        "Adapt to changing business needs"
                    ]
                },
                {
                    title: "Continuous Improvement",
                    principles: [
                        "Learn from every project phase",
                        "Encourage team feedback and innovation",
                        "Adapt processes based on lessons learned",
                        "Foster a culture of learning"
                    ]
                }
            ]
        };
    }

    /**
     * Generate ECO checklist content
     */
    async generateECOChecklistContent() {
        const ecoData = await this.loadECOData();
        
        return {
            title: "Complete ECO Task Checklist",
            subtitle: "All 27 Tasks with Examples and Key Points",
            introduction: "Use this checklist to ensure you understand every ECO task for the PMP exam.",
            domains: [
                {
                    name: "People Domain (42%)",
                    color: "#28a745",
                    tasks: ecoData.people.map(task => ({
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        keyPoints: task.keyPoints || [],
                        example: task.example || "",
                        checkboxes: [
                            "I understand the task description",
                            "I can identify real-world examples",
                            "I know the key enablers",
                            "I can apply this in scenarios"
                        ]
                    }))
                },
                {
                    name: "Process Domain (50%)",
                    color: "#007bff",
                    tasks: ecoData.process.map(task => ({
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        keyPoints: task.keyPoints || [],
                        example: task.example || "",
                        checkboxes: [
                            "I understand the task description",
                            "I can identify real-world examples", 
                            "I know the key enablers",
                            "I can apply this in scenarios"
                        ]
                    }))
                },
                {
                    name: "Business Environment Domain (8%)",
                    color: "#fd7e14",
                    tasks: ecoData.business.map(task => ({
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        keyPoints: task.keyPoints || [],
                        example: task.example || "",
                        checkboxes: [
                            "I understand the task description",
                            "I can identify real-world examples",
                            "I know the key enablers", 
                            "I can apply this in scenarios"
                        ]
                    }))
                }
            ]
        };
    }

    /**
     * Track lead magnet download
     */
    async trackDownload(magnetId, userInfo = {}) {
        const downloadRecord = {
            id: this.generateDownloadId(),
            magnetId: magnetId,
            userId: userInfo.userId || null,
            email: userInfo.email || null,
            source: userInfo.source || 'direct',
            referrer: userInfo.referrer || null,
            userAgent: userInfo.userAgent || null,
            ipAddress: userInfo.ipAddress || null,
            downloadedAt: moment().toISOString(),
            conversionPath: userInfo.conversionPath || []
        };

        this.data.downloads.push(downloadRecord);
        
        // Update performance metrics
        await this.performanceTracker.recordDownload(magnetId, downloadRecord);
        
        this.saveData();
        return downloadRecord.id;
    }

    /**
     * Capture email for lead magnet
     */
    async captureEmail(magnetId, emailData) {
        const captureRecord = {
            id: this.generateCaptureId(),
            magnetId: magnetId,
            email: emailData.email,
            firstName: emailData.firstName || null,
            lastName: emailData.lastName || null,
            source: emailData.source || 'lead_magnet',
            optInDate: moment().toISOString(),
            doubleOptIn: emailData.doubleOptIn || false,
            tags: this.generateEmailTags(magnetId),
            customFields: emailData.customFields || {}
        };

        this.data.emailCaptures.push(captureRecord);
        
        // Integrate with email service
        await this.emailCapture.addToList(captureRecord);
        
        // Trigger welcome sequence
        if (this.config.emailCapture.welcomeSequence) {
            await this.emailCapture.triggerWelcomeSequence(captureRecord);
        }

        this.saveData();
        return captureRecord.id;
    }

    /**
     * Generate email tags based on lead magnet
     */
    generateEmailTags(magnetId) {
        const baseTags = ['pmp_student', 'lead_magnet_subscriber'];
        const magnetConfig = this.config.leadMagnets[magnetId];
        
        if (magnetConfig) {
            baseTags.push(`magnet_${magnetId}`);
            baseTags.push(`audience_${magnetConfig.targetAudience}`);
            baseTags.push(`type_${magnetConfig.type}`);
        }

        return baseTags;
    }

    /**
     * Get lead magnet performance data
     */
    async getPerformanceData(magnetId = null, timeframe = 'month') {
        const startDate = moment().subtract(1, timeframe);
        
        let downloads = this.data.downloads.filter(d => 
            moment(d.downloadedAt).isAfter(startDate)
        );
        
        let emailCaptures = this.data.emailCaptures.filter(c => 
            moment(c.optInDate).isAfter(startDate)
        );

        if (magnetId) {
            downloads = downloads.filter(d => d.magnetId === magnetId);
            emailCaptures = emailCaptures.filter(c => c.magnetId === magnetId);
        }

        return {
            timeframe,
            startDate: startDate.toISOString(),
            endDate: moment().toISOString(),
            downloads: {
                total: downloads.length,
                bySource: this.groupBy(downloads, 'source'),
                byMagnet: this.groupBy(downloads, 'magnetId'),
                trend: this.calculateTrend(downloads, 'downloadedAt', timeframe)
            },
            emailCaptures: {
                total: emailCaptures.length,
                bySource: this.groupBy(emailCaptures, 'source'),
                byMagnet: this.groupBy(emailCaptures, 'magnetId'),
                conversionRate: downloads.length > 0 ? (emailCaptures.length / downloads.length) * 100 : 0,
                trend: this.calculateTrend(emailCaptures, 'optInDate', timeframe)
            },
            topPerformers: this.getTopPerformingMagnets(downloads, emailCaptures),
            conversionFunnel: this.calculateConversionFunnel(downloads, emailCaptures)
        };
    }

    /**
     * Get lead magnet dashboard data
     */
    async getDashboardData() {
        const performance = await this.getPerformanceData();
        
        return {
            summary: {
                totalMagnets: Object.keys(this.config.leadMagnets).length,
                activeMagnets: Object.values(this.config.leadMagnets).filter(m => m.enabled).length,
                totalDownloads: this.data.downloads.length,
                totalEmailCaptures: this.data.emailCaptures.length,
                overallConversionRate: this.data.downloads.length > 0 
                    ? (this.data.emailCaptures.length / this.data.downloads.length) * 100 
                    : 0
            },
            recentPerformance: performance,
            magnetStatus: this.getMagnetStatus(),
            upcomingTasks: this.getUpcomingTasks(),
            alerts: this.getPerformanceAlerts()
        };
    }

    /**
     * Get magnet status
     */
    getMagnetStatus() {
        return Object.entries(this.config.leadMagnets).map(([magnetId, config]) => {
            const generated = this.data.generated.find(g => g.magnetId === magnetId);
            const recentDownloads = this.data.downloads.filter(d => 
                d.magnetId === magnetId && 
                moment(d.downloadedAt).isAfter(moment().subtract(7, 'days'))
            ).length;

            return {
                magnetId,
                title: config.title,
                enabled: config.enabled,
                generated: !!generated,
                lastGenerated: generated?.generatedAt || null,
                recentDownloads,
                needsUpdate: this.needsUpdate(magnetId, generated)
            };
        });
    }

    /**
     * Check if magnet needs update
     */
    needsUpdate(magnetId, generated) {
        if (!generated) return true;
        
        // Check if generated more than 30 days ago
        if (moment().diff(moment(generated.generatedAt), 'days') > 30) {
            return true;
        }

        // Check if template has been modified
        const templatePath = path.join(this.templatesPath, this.config.leadMagnets[magnetId].template);
        if (fs.existsSync(templatePath)) {
            const templateStats = fs.statSync(templatePath);
            if (moment(templateStats.mtime).isAfter(moment(generated.generatedAt))) {
                return true;
            }
        }

        return false;
    }

    // Helper methods
    async loadContentSchedule() {
        const schedulePath = path.join(__dirname, '../../config/detailed-content-calendar.json');
        if (fs.existsSync(schedulePath)) {
            return fs.readJsonSync(schedulePath);
        }
        return { weeks: {} };
    }

    async loadECOData() {
        const ecoPath = path.join(__dirname, '../../config/pmi-eco-data.json');
        if (fs.existsSync(ecoPath)) {
            const data = fs.readJsonSync(ecoPath);
            return {
                people: data.domains.people.tasks,
                process: data.domains.process.tasks,
                business: data.domains.business.tasks
            };
        }
        return { people: [], process: [], business: [] };
    }

    generateWeekDays(weekData) {
        return [
            { day: 'Monday', type: 'Overview', content: weekData.monday || 'Week overview and objectives' },
            { day: 'Tuesday', type: 'Lesson', content: weekData.tuesday || 'Core concepts' },
            { day: 'Wednesday', type: 'Lesson', content: weekData.wednesday || 'Deep dive' },
            { day: 'Thursday', type: 'Lesson', content: weekData.thursday || 'Application' },
            { day: 'Friday', type: 'Lesson', content: weekData.friday || 'Integration' },
            { day: 'Saturday', type: 'Practice', content: weekData.saturday || 'Practice session' },
            { day: 'Sunday', type: 'Review', content: weekData.sunday || 'Week review' }
        ];
    }

    generateDomainQuestions(domain, count) {
        // This would generate actual practice questions
        // For now, return placeholder structure
        const questions = [];
        for (let i = 1; i <= count; i++) {
            questions.push({
                number: i,
                question: `Sample ${domain} domain question ${i}`,
                options: ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D'],
                correctAnswer: 'A',
                explanation: `Explanation for ${domain} question ${i}`,
                ecoTask: `T${i}`,
                difficulty: 'Medium'
            });
        }
        return questions;
    }

    async getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    calculateVersion(magnetId) {
        const existing = this.data.generated.filter(g => g.magnetId === magnetId);
        return `v${existing.length + 1}.0`;
    }

    generateDownloadUrl(magnetId) {
        const baseUrl = process.env.WEBSITE_URL || 'https://example.com';
        return `${baseUrl}/download/${magnetId}`;
    }

    generateTrackingCode(magnetId) {
        return `track_${magnetId}_${Date.now()}`;
    }

    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || 'unknown';
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }

    calculateTrend(data, dateField, timeframe) {
        const periods = timeframe === 'week' ? 7 : 30;
        const current = data.filter(item => 
            moment(item[dateField]).isAfter(moment().subtract(periods, 'days'))
        ).length;
        
        const previous = data.filter(item => 
            moment(item[dateField]).isBetween(
                moment().subtract(periods * 2, 'days'),
                moment().subtract(periods, 'days')
            )
        ).length;

        return previous > 0 ? ((current - previous) / previous) * 100 : 0;
    }

    getTopPerformingMagnets(downloads, emailCaptures) {
        const magnetPerformance = {};
        
        downloads.forEach(d => {
            if (!magnetPerformance[d.magnetId]) {
                magnetPerformance[d.magnetId] = { downloads: 0, captures: 0 };
            }
            magnetPerformance[d.magnetId].downloads++;
        });

        emailCaptures.forEach(c => {
            if (!magnetPerformance[c.magnetId]) {
                magnetPerformance[c.magnetId] = { downloads: 0, captures: 0 };
            }
            magnetPerformance[c.magnetId].captures++;
        });

        return Object.entries(magnetPerformance)
            .map(([magnetId, stats]) => ({
                magnetId,
                title: this.config.leadMagnets[magnetId]?.title || magnetId,
                downloads: stats.downloads,
                captures: stats.captures,
                conversionRate: stats.downloads > 0 ? (stats.captures / stats.downloads) * 100 : 0
            }))
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 5);
    }

    calculateConversionFunnel(downloads, emailCaptures) {
        return {
            impressions: downloads.length * 10, // Estimated
            downloads: downloads.length,
            emailCaptures: emailCaptures.length,
            conversionRates: {
                impressionToDownload: downloads.length > 0 ? (downloads.length / (downloads.length * 10)) * 100 : 0,
                downloadToEmail: downloads.length > 0 ? (emailCaptures.length / downloads.length) * 100 : 0
            }
        };
    }

    getUpcomingTasks() {
        const tasks = [];
        
        // Check for magnets that need updates
        Object.entries(this.config.leadMagnets).forEach(([magnetId, config]) => {
            if (config.enabled) {
                const generated = this.data.generated.find(g => g.magnetId === magnetId);
                if (this.needsUpdate(magnetId, generated)) {
                    tasks.push({
                        type: 'update_magnet',
                        magnetId,
                        title: `Update ${config.title}`,
                        priority: generated ? 'medium' : 'high',
                        dueDate: moment().add(7, 'days').toISOString()
                    });
                }
            }
        });

        return tasks;
    }

    getPerformanceAlerts() {
        const alerts = [];
        const recentDownloads = this.data.downloads.filter(d => 
            moment(d.downloadedAt).isAfter(moment().subtract(7, 'days'))
        );

        // Low download alert
        if (recentDownloads.length < 10) {
            alerts.push({
                type: 'low_downloads',
                severity: 'warning',
                message: `Only ${recentDownloads.length} downloads in the last 7 days`,
                suggestion: 'Consider promoting lead magnets more actively'
            });
        }

        // Low conversion rate alert
        const recentCaptures = this.data.emailCaptures.filter(c => 
            moment(c.optInDate).isAfter(moment().subtract(7, 'days'))
        );
        const conversionRate = recentDownloads.length > 0 ? (recentCaptures.length / recentDownloads.length) * 100 : 0;
        
        if (conversionRate < 30) {
            alerts.push({
                type: 'low_conversion',
                severity: 'warning',
                message: `Email conversion rate is ${Math.round(conversionRate)}% (target: 30%+)`,
                suggestion: 'Review email capture forms and incentives'
            });
        }

        return alerts;
    }

    // ID generators
    generateMagnetId() {
        return `magnet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateDownloadId() {
        return `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCaptureId() {
        return `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = LeadMagnetSystem;