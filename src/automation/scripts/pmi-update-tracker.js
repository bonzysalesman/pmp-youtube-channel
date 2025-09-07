/**
 * PMI Update Tracker
 * Monitors PMI standard updates and flags affected content for revision
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const axios = require('axios');

class PMIUpdateTracker {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/pmi-updates.json');
        this.data = this.loadData();
        this.sources = this.loadSources();
        this.lastCheckTime = this.data.lastCheck || moment().subtract(1, 'week').toISOString();
    }

    loadData() {
        if (fs.existsSync(this.dataPath)) {
            return fs.readJsonSync(this.dataPath);
        }
        return {
            updates: [],
            lastCheck: null,
            trackedSources: [],
            affectedContent: [],
            notifications: []
        };
    }

    loadSources() {
        return {
            pmiWebsite: {
                url: 'https://www.pmi.org',
                endpoints: [
                    '/pmbok-guide-standards',
                    '/certifications/project-management-pmp',
                    '/learning/library'
                ],
                checkFrequency: 'weekly',
                priority: 'high'
            },
            ecoUpdates: {
                url: 'https://www.pmi.org/certifications/project-management-pmp/earn-the-pmp/pmp-exam-preparation/pmp-examination-content-outline',
                checkFrequency: 'monthly',
                priority: 'critical'
            },
            pmbok: {
                url: 'https://www.pmi.org/pmbok-guide-standards/foundational/PMBOK',
                checkFrequency: 'quarterly',
                priority: 'high'
            },
            standards: {
                url: 'https://www.pmi.org/pmbok-guide-standards',
                checkFrequency: 'monthly',
                priority: 'medium'
            }
        };
    }

    /**
     * Check for PMI updates across all sources
     */
    async checkForUpdates() {
        const updates = [];
        const checkTime = moment().toISOString();

        try {
            // Check each source
            for (const [sourceName, sourceConfig] of Object.entries(this.sources)) {
                if (this.shouldCheckSource(sourceName, sourceConfig)) {
                    const sourceUpdates = await this.checkSource(sourceName, sourceConfig);
                    updates.push(...sourceUpdates);
                }
            }

            // Process and store updates
            const processedUpdates = this.processUpdates(updates);
            this.data.updates.push(...processedUpdates);
            this.data.lastCheck = checkTime;

            // Clean old updates (keep last 6 months)
            this.cleanOldUpdates();

            this.saveData();

            return processedUpdates;

        } catch (error) {
            console.error('Error checking PMI updates:', error);
            return [];
        }
    }

    /**
     * Check if source should be checked based on frequency
     */
    shouldCheckSource(sourceName, sourceConfig) {
        const lastCheck = this.getLastSourceCheck(sourceName);
        if (!lastCheck) return true;

        const frequency = sourceConfig.checkFrequency;
        const checkInterval = this.getCheckInterval(frequency);
        
        return moment().diff(moment(lastCheck), 'hours') >= checkInterval;
    }

    /**
     * Get check interval in hours based on frequency
     */
    getCheckInterval(frequency) {
        const intervals = {
            'daily': 24,
            'weekly': 168,
            'monthly': 720,
            'quarterly': 2160
        };
        return intervals[frequency] || 168; // Default to weekly
    }

    /**
     * Get last check time for specific source
     */
    getLastSourceCheck(sourceName) {
        const sourceChecks = this.data.trackedSources.find(s => s.name === sourceName);
        return sourceChecks?.lastCheck || null;
    }

    /**
     * Check specific source for updates
     */
    async checkSource(sourceName, sourceConfig) {
        const updates = [];

        try {
            // For demo purposes, simulate checking different types of updates
            // In production, this would involve web scraping, RSS feeds, or API calls
            
            if (sourceName === 'ecoUpdates') {
                const ecoUpdates = await this.checkECOUpdates(sourceConfig);
                updates.push(...ecoUpdates);
            } else if (sourceName === 'pmbok') {
                const pmbokUpdates = await this.checkPMBOKUpdates(sourceConfig);
                updates.push(...pmbokUpdates);
            } else if (sourceName === 'standards') {
                const standardUpdates = await this.checkStandardUpdates(sourceConfig);
                updates.push(...standardUpdates);
            } else {
                const generalUpdates = await this.checkGeneralUpdates(sourceName, sourceConfig);
                updates.push(...generalUpdates);
            }

            // Update source check time
            this.updateSourceCheckTime(sourceName);

        } catch (error) {
            console.error(`Error checking ${sourceName}:`, error);
        }

        return updates;
    }

    /**
     * Check ECO updates (most critical)
     */
    async checkECOUpdates(sourceConfig) {
        const updates = [];

        // Simulate ECO update detection
        // In production, would parse PMI's ECO page for changes
        const simulatedUpdates = [
            // Example updates - in production these would be detected from actual sources
        ];

        return simulatedUpdates.map(update => ({
            ...update,
            source: 'ecoUpdates',
            priority: 'critical',
            type: 'eco_change'
        }));
    }

    /**
     * Check PMBOK updates
     */
    async checkPMBOKUpdates(sourceConfig) {
        const updates = [];

        // Simulate PMBOK update detection
        // In production, would check for new PMBOK versions, errata, etc.
        
        return updates.map(update => ({
            ...update,
            source: 'pmbok',
            priority: 'high',
            type: 'pmbok_change'
        }));
    }

    /**
     * Check standard updates
     */
    async checkStandardUpdates(sourceConfig) {
        const updates = [];

        // Simulate standards update detection
        // In production, would check PMI standards library
        
        return updates.map(update => ({
            ...update,
            source: 'standards',
            priority: 'medium',
            type: 'standard_change'
        }));
    }

    /**
     * Check general PMI website updates
     */
    async checkGeneralUpdates(sourceName, sourceConfig) {
        const updates = [];

        // Simulate general update detection
        // In production, would check RSS feeds, news sections, etc.
        
        return updates.map(update => ({
            ...update,
            source: sourceName,
            priority: sourceConfig.priority,
            type: 'general_update'
        }));
    }

    /**
     * Process raw updates into structured format
     */
    processUpdates(rawUpdates) {
        return rawUpdates.map(update => ({
            id: this.generateUpdateId(),
            title: update.title,
            description: update.description,
            source: update.source,
            type: update.type,
            priority: update.priority,
            detectedAt: moment().toISOString(),
            url: update.url,
            affectedAreas: this.identifyAffectedAreas(update),
            impactLevel: this.assessImpactLevel(update),
            actionRequired: this.determineActionRequired(update),
            status: 'new'
        }));
    }

    /**
     * Identify areas affected by update
     */
    identifyAffectedAreas(update) {
        const areas = [];
        const content = (update.title + ' ' + update.description).toLowerCase();

        // Domain mapping
        if (this.containsKeywords(content, ['leadership', 'team', 'stakeholder', 'communication'])) {
            areas.push('people_domain');
        }
        if (this.containsKeywords(content, ['planning', 'schedule', 'budget', 'risk', 'quality'])) {
            areas.push('process_domain');
        }
        if (this.containsKeywords(content, ['compliance', 'organizational', 'business', 'value'])) {
            areas.push('business_domain');
        }

        // Content type mapping
        if (this.containsKeywords(content, ['exam', 'certification', 'test'])) {
            areas.push('exam_content');
        }
        if (this.containsKeywords(content, ['process', 'methodology', 'framework'])) {
            areas.push('methodology_content');
        }

        return areas.length > 0 ? areas : ['general'];
    }

    /**
     * Assess impact level of update
     */
    assessImpactLevel(update) {
        if (update.priority === 'critical' || update.type === 'eco_change') {
            return 'high';
        }
        if (update.priority === 'high' || update.type === 'pmbok_change') {
            return 'medium';
        }
        return 'low';
    }

    /**
     * Determine action required for update
     */
    determineActionRequired(update) {
        const actions = [];

        if (update.type === 'eco_change') {
            actions.push('review_all_content');
            actions.push('update_eco_mapping');
            actions.push('revise_affected_videos');
        } else if (update.type === 'pmbok_change') {
            actions.push('review_process_content');
            actions.push('update_references');
        } else if (update.impactLevel === 'high') {
            actions.push('content_review');
            actions.push('accuracy_check');
        } else {
            actions.push('monitor');
        }

        return actions;
    }

    /**
     * Get content affected by updates
     */
    async getAffectedContent(updateId) {
        const update = this.data.updates.find(u => u.id === updateId);
        if (!update) return [];

        // This would analyze content against the update
        // For now, return placeholder logic
        const affectedContent = [];

        // Check content based on affected areas
        for (const area of update.affectedAreas) {
            const contentInArea = await this.findContentByArea(area);
            affectedContent.push(...contentInArea);
        }

        return affectedContent;
    }

    /**
     * Find content by area
     */
    async findContentByArea(area) {
        // This would search through content database/files
        // For now, return placeholder
        return [];
    }

    /**
     * Create update notification
     */
    createNotification(update, affectedContent = []) {
        const notification = {
            id: this.generateNotificationId(),
            updateId: update.id,
            title: `PMI Update Alert: ${update.title}`,
            message: this.generateNotificationMessage(update, affectedContent),
            priority: update.priority,
            createdAt: moment().toISOString(),
            recipients: this.getNotificationRecipients(update),
            channels: this.getNotificationChannels(update),
            status: 'pending'
        };

        this.data.notifications.push(notification);
        this.saveData();

        return notification;
    }

    /**
     * Generate notification message
     */
    generateNotificationMessage(update, affectedContent) {
        let message = `A ${update.priority} priority update has been detected from ${update.source}:\n\n`;
        message += `${update.description}\n\n`;
        
        if (affectedContent.length > 0) {
            message += `Affected content (${affectedContent.length} items):\n`;
            affectedContent.slice(0, 5).forEach(content => {
                message += `- ${content.title || content.id}\n`;
            });
            if (affectedContent.length > 5) {
                message += `... and ${affectedContent.length - 5} more items\n`;
            }
        }

        message += `\nRecommended actions:\n`;
        update.actionRequired.forEach(action => {
            message += `- ${this.formatAction(action)}\n`;
        });

        if (update.url) {
            message += `\nSource: ${update.url}`;
        }

        return message;
    }

    /**
     * Format action for display
     */
    formatAction(action) {
        const actionMap = {
            'review_all_content': 'Review all educational content for accuracy',
            'update_eco_mapping': 'Update ECO task mappings',
            'revise_affected_videos': 'Revise affected video content',
            'review_process_content': 'Review process-related content',
            'update_references': 'Update PMI standard references',
            'content_review': 'Conduct content accuracy review',
            'accuracy_check': 'Perform accuracy validation',
            'monitor': 'Monitor for further developments'
        };
        return actionMap[action] || action;
    }

    /**
     * Get notification recipients based on update
     */
    getNotificationRecipients(update) {
        const recipients = ['content_manager', 'quality_assurance'];
        
        if (update.priority === 'critical') {
            recipients.push('project_manager', 'sme_team');
        }
        
        return recipients;
    }

    /**
     * Get notification channels based on update
     */
    getNotificationChannels(update) {
        const channels = ['email'];
        
        if (update.priority === 'critical') {
            channels.push('slack', 'sms');
        } else if (update.priority === 'high') {
            channels.push('slack');
        }
        
        return channels;
    }

    /**
     * Update source check time
     */
    updateSourceCheckTime(sourceName) {
        let sourceRecord = this.data.trackedSources.find(s => s.name === sourceName);
        if (!sourceRecord) {
            sourceRecord = { name: sourceName, lastCheck: null, checkCount: 0 };
            this.data.trackedSources.push(sourceRecord);
        }
        
        sourceRecord.lastCheck = moment().toISOString();
        sourceRecord.checkCount++;
    }

    /**
     * Clean old updates
     */
    cleanOldUpdates() {
        const cutoffDate = moment().subtract(6, 'months');
        this.data.updates = this.data.updates.filter(update => 
            moment(update.detectedAt).isAfter(cutoffDate)
        );
    }

    /**
     * Save data to file
     */
    saveData() {
        fs.ensureDirSync(path.dirname(this.dataPath));
        fs.writeJsonSync(this.dataPath, this.data, { spaces: 2 });
    }

    // Helper methods
    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    generateUpdateId() {
        return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get update summary for dashboard
     */
    getUpdateSummary() {
        const recentUpdates = this.data.updates.filter(u => 
            moment(u.detectedAt).isAfter(moment().subtract(30, 'days'))
        );

        return {
            totalUpdates: this.data.updates.length,
            recentUpdates: recentUpdates.length,
            criticalUpdates: recentUpdates.filter(u => u.priority === 'critical').length,
            pendingActions: recentUpdates.filter(u => u.status === 'new').length,
            lastCheck: this.data.lastCheck,
            nextCheck: this.calculateNextCheck(),
            bySource: this.groupUpdatesBySource(recentUpdates),
            byPriority: this.groupUpdatesByPriority(recentUpdates)
        };
    }

    calculateNextCheck() {
        // Calculate when next check should occur based on source frequencies
        const nextChecks = Object.entries(this.sources).map(([name, config]) => {
            const lastCheck = this.getLastSourceCheck(name);
            const interval = this.getCheckInterval(config.checkFrequency);
            return moment(lastCheck || 0).add(interval, 'hours');
        });

        return moment.min(nextChecks).toISOString();
    }

    groupUpdatesBySource(updates) {
        const grouped = {};
        updates.forEach(update => {
            grouped[update.source] = (grouped[update.source] || 0) + 1;
        });
        return grouped;
    }

    groupUpdatesByPriority(updates) {
        const grouped = {};
        updates.forEach(update => {
            grouped[update.priority] = (grouped[update.priority] || 0) + 1;
        });
        return grouped;
    }
}

module.exports = PMIUpdateTracker;