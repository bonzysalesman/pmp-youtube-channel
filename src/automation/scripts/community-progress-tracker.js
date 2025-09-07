/**
 * Community Progress Tracker
 * Tracks and celebrates community member progress across all platforms
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class CommunityProgressTracker {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/community-progress.json');
        this.data = this.loadData();
        this.milestones = {
            days: [1, 3, 7, 14, 30, 60, 90],
            studyWeeks: [1, 3, 5, 7, 10, 13],
            engagementPoints: [10, 50, 100, 250, 500, 1000],
            achievements: [
                'first_comment', 'first_week_complete', 'consistent_learner', 
                'community_helper', 'study_champion', 'pmp_graduate'
            ]
        };
    }

    loadData() {
        if (fs.existsSync(this.dataPath)) {
            return fs.readJsonSync(this.dataPath);
        }
        return {
            members: {},
            celebrations: [],
            metrics: {
                totalMembers: 0,
                activeMembers: 0,
                completedProgram: 0,
                averageEngagement: 0
            },
            lastUpdated: moment().toISOString()
        };
    }

    saveData() {
        fs.ensureDirSync(path.dirname(this.dataPath));
        this.data.lastUpdated = moment().toISOString();
        fs.writeJsonSync(this.dataPath, this.data, { spaces: 2 });
    }

    /**
     * Register a new community member
     */
    registerMember(memberData) {
        const memberId = this.generateMemberId(memberData);
        
        this.data.members[memberId] = {
            id: memberId,
            name: memberData.name,
            email: memberData.email,
            platforms: memberData.platforms || [],
            joinDate: memberData.joinDate || moment().toISOString(),
            studyStartDate: memberData.studyStartDate || moment().toISOString(),
            currentWeek: 1,
            engagementPoints: 0,
            achievements: [],
            milestones: {
                daysActive: [],
                weeksCompleted: [],
                engagementLevels: []
            },
            activity: {
                lastActive: moment().toISOString(),
                totalComments: 0,
                totalWatchTime: 0,
                videosWatched: [],
                chaptersRead: []
            },
            preferences: {
                celebrationNotifications: true,
                progressReminders: true,
                weeklyCheckins: true
            }
        };

        this.updateMetrics();
        this.saveData();
        
        // Check for immediate milestones (first day)
        this.checkMilestones(memberId);
        
        return memberId;
    }

    /**
     * Update member progress
     */
    updateMemberProgress(memberId, progressData) {
        const member = this.data.members[memberId];
        if (!member) {
            throw new Error(`Member ${memberId} not found`);
        }

        // Update basic progress
        if (progressData.currentWeek) {
            member.currentWeek = Math.min(progressData.currentWeek, 13);
        }

        if (progressData.engagementPoints) {
            member.engagementPoints += progressData.engagementPoints;
        }

        // Update activity
        member.activity.lastActive = moment().toISOString();
        
        if (progressData.comment) {
            member.activity.totalComments++;
            member.engagementPoints += 5; // Points for commenting
        }

        if (progressData.videoWatched) {
            if (!member.activity.videosWatched.includes(progressData.videoWatched)) {
                member.activity.videosWatched.push(progressData.videoWatched);
                member.engagementPoints += 10; // Points for watching video
            }
        }

        if (progressData.chapterRead) {
            if (!member.activity.chaptersRead.includes(progressData.chapterRead)) {
                member.activity.chaptersRead.push(progressData.chapterRead);
                member.engagementPoints += 15; // Points for reading chapter
            }
        }

        if (progressData.watchTime) {
            member.activity.totalWatchTime += progressData.watchTime;
        }

        // Check for new milestones
        const newMilestones = this.checkMilestones(memberId);
        
        this.updateMetrics();
        this.saveData();

        return {
            member: member,
            newMilestones: newMilestones,
            totalEngagementPoints: member.engagementPoints
        };
    }

    /**
     * Check and award milestones for a member
     */
    checkMilestones(memberId) {
        const member = this.data.members[memberId];
        if (!member) return [];

        const newMilestones = [];
        const daysSinceJoin = moment().diff(moment(member.joinDate), 'days');

        // Check day milestones
        this.milestones.days.forEach(day => {
            if (daysSinceJoin >= day && !member.milestones.daysActive.includes(day)) {
                member.milestones.daysActive.push(day);
                newMilestones.push({
                    type: 'days_active',
                    value: day,
                    title: `${day} Day${day > 1 ? 's' : ''} Active`,
                    description: `Congratulations on being active for ${day} day${day > 1 ? 's' : ''}!`
                });
            }
        });

        // Check study week milestones
        this.milestones.studyWeeks.forEach(week => {
            if (member.currentWeek >= week && !member.milestones.weeksCompleted.includes(week)) {
                member.milestones.weeksCompleted.push(week);
                newMilestones.push({
                    type: 'study_week',
                    value: week,
                    title: `Week ${week} Complete`,
                    description: `Amazing progress! You've completed Week ${week} of the PMP study plan.`
                });
            }
        });

        // Check engagement point milestones
        this.milestones.engagementPoints.forEach(points => {
            if (member.engagementPoints >= points && !member.milestones.engagementLevels.includes(points)) {
                member.milestones.engagementLevels.push(points);
                newMilestones.push({
                    type: 'engagement_points',
                    value: points,
                    title: `${points} Engagement Points`,
                    description: `You've earned ${points} engagement points! Your dedication is inspiring.`
                });
            }
        });

        // Check special achievements
        this.checkSpecialAchievements(member, newMilestones);

        // Record celebrations for new milestones
        newMilestones.forEach(milestone => {
            this.recordCelebration(memberId, milestone);
        });

        return newMilestones;
    }

    /**
     * Check for special achievements
     */
    checkSpecialAchievements(member, newMilestones) {
        // First comment achievement
        if (member.activity.totalComments >= 1 && !member.achievements.includes('first_comment')) {
            member.achievements.push('first_comment');
            newMilestones.push({
                type: 'achievement',
                value: 'first_comment',
                title: 'First Comment',
                description: 'Welcome to the conversation! Your first comment shows you\'re engaged.'
            });
        }

        // Consistent learner (active for 7 consecutive days)
        if (this.isConsistentLearner(member) && !member.achievements.includes('consistent_learner')) {
            member.achievements.push('consistent_learner');
            newMilestones.push({
                type: 'achievement',
                value: 'consistent_learner',
                title: 'Consistent Learner',
                description: 'You\'ve been active for 7 consecutive days! Consistency is key to PMP success.'
            });
        }

        // Community helper (helped others with comments/responses)
        if (member.activity.totalComments >= 10 && !member.achievements.includes('community_helper')) {
            member.achievements.push('community_helper');
            newMilestones.push({
                type: 'achievement',
                value: 'community_helper',
                title: 'Community Helper',
                description: 'Thank you for being an active community member and helping others!'
            });
        }

        // Study champion (completed 10+ weeks)
        if (member.currentWeek >= 10 && !member.achievements.includes('study_champion')) {
            member.achievements.push('study_champion');
            newMilestones.push({
                type: 'achievement',
                value: 'study_champion',
                title: 'Study Champion',
                description: 'You\'re in the final stretch! 10 weeks of dedicated study shows true commitment.'
            });
        }

        // PMP graduate (completed all 13 weeks)
        if (member.currentWeek >= 13 && !member.achievements.includes('pmp_graduate')) {
            member.achievements.push('pmp_graduate');
            newMilestones.push({
                type: 'achievement',
                value: 'pmp_graduate',
                title: 'PMP Graduate',
                description: 'Congratulations! You\'ve completed the entire 13-week PMP study program!'
            });
        }
    }

    /**
     * Check if member is a consistent learner
     */
    isConsistentLearner(member) {
        // This would need more sophisticated tracking of daily activity
        // For now, simplified check based on engagement over time
        const daysSinceJoin = moment().diff(moment(member.joinDate), 'days');
        const expectedEngagement = daysSinceJoin * 5; // 5 points per day minimum
        return member.engagementPoints >= expectedEngagement && daysSinceJoin >= 7;
    }

    /**
     * Record a celebration
     */
    recordCelebration(memberId, milestone) {
        const celebration = {
            id: this.generateCelebrationId(),
            memberId: memberId,
            memberName: this.data.members[memberId]?.name || 'Unknown',
            milestone: milestone,
            timestamp: moment().toISOString(),
            platforms: this.data.members[memberId]?.platforms || [],
            celebrated: false
        };

        this.data.celebrations.push(celebration);
        return celebration.id;
    }

    /**
     * Get pending celebrations
     */
    getPendingCelebrations() {
        return this.data.celebrations.filter(c => !c.celebrated);
    }

    /**
     * Mark celebration as completed
     */
    markCelebrationCompleted(celebrationId, platforms = []) {
        const celebration = this.data.celebrations.find(c => c.id === celebrationId);
        if (celebration) {
            celebration.celebrated = true;
            celebration.celebratedOn = platforms;
            celebration.celebratedAt = moment().toISOString();
            this.saveData();
        }
    }

    /**
     * Get member progress summary
     */
    getMemberProgress(memberId) {
        const member = this.data.members[memberId];
        if (!member) return null;

        const daysSinceJoin = moment().diff(moment(member.joinDate), 'days');
        const progressPercentage = (member.currentWeek / 13) * 100;

        return {
            ...member,
            daysSinceJoin,
            progressPercentage,
            nextMilestone: this.getNextMilestone(member),
            recentActivity: this.getRecentActivity(memberId),
            celebrationHistory: this.getCelebrationHistory(memberId)
        };
    }

    /**
     * Get next milestone for member
     */
    getNextMilestone(member) {
        const nextDay = this.milestones.days.find(day => !member.milestones.daysActive.includes(day));
        const nextWeek = this.milestones.studyWeeks.find(week => !member.milestones.weeksCompleted.includes(week));
        const nextPoints = this.milestones.engagementPoints.find(points => !member.milestones.engagementLevels.includes(points));

        return {
            nextDay,
            nextWeek,
            nextPoints,
            pointsNeeded: nextPoints ? nextPoints - member.engagementPoints : 0
        };
    }

    /**
     * Get recent activity for member
     */
    getRecentActivity(memberId, days = 7) {
        const member = this.data.members[memberId];
        if (!member) return [];

        const cutoffDate = moment().subtract(days, 'days');
        
        // This would be enhanced with actual activity tracking
        return {
            commentsThisWeek: member.activity.totalComments, // Simplified
            videosWatchedThisWeek: member.activity.videosWatched.length, // Simplified
            engagementPointsThisWeek: member.engagementPoints // Simplified
        };
    }

    /**
     * Get celebration history for member
     */
    getCelebrationHistory(memberId) {
        return this.data.celebrations
            .filter(c => c.memberId === memberId)
            .sort((a, b) => moment(b.timestamp).diff(moment(a.timestamp)));
    }

    /**
     * Get overall metrics
     */
    async getMetrics() {
        this.updateMetrics();
        return this.data.metrics;
    }

    /**
     * Get celebrations for timeframe
     */
    async getCelebrations(timeframe = 'week') {
        const startDate = moment().subtract(1, timeframe);
        const celebrations = this.data.celebrations.filter(c => 
            moment(c.timestamp).isAfter(startDate)
        );

        return {
            count: celebrations.length,
            celebrations: celebrations,
            byType: this.groupCelebrationsByType(celebrations)
        };
    }

    /**
     * Group celebrations by type
     */
    groupCelebrationsByType(celebrations) {
        const grouped = {};
        celebrations.forEach(c => {
            const type = c.milestone.type;
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(c);
        });
        return grouped;
    }

    /**
     * Update overall metrics
     */
    updateMetrics() {
        const members = Object.values(this.data.members);
        const activeThreshold = moment().subtract(7, 'days');

        this.data.metrics = {
            totalMembers: members.length,
            activeMembers: members.filter(m => moment(m.activity.lastActive).isAfter(activeThreshold)).length,
            completedProgram: members.filter(m => m.currentWeek >= 13).length,
            averageEngagement: members.length > 0 
                ? members.reduce((sum, m) => sum + m.engagementPoints, 0) / members.length 
                : 0,
            averageWeek: members.length > 0
                ? members.reduce((sum, m) => sum + m.currentWeek, 0) / members.length
                : 0,
            totalCelebrations: this.data.celebrations.length,
            pendingCelebrations: this.data.celebrations.filter(c => !c.celebrated).length
        };
    }

    /**
     * Generate unique member ID
     */
    generateMemberId(memberData) {
        const base = memberData.email || memberData.name || 'anonymous';
        const hash = require('crypto').createHash('md5').update(base).digest('hex').substr(0, 8);
        return `member_${hash}_${Date.now()}`;
    }

    /**
     * Generate unique celebration ID
     */
    generateCelebrationId() {
        return `celebration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Export progress data
     */
    exportProgressData(timeframe = 'month') {
        const startDate = moment().subtract(1, timeframe);
        
        return {
            timeframe,
            startDate: startDate.toISOString(),
            endDate: moment().toISOString(),
            members: Object.values(this.data.members),
            celebrations: this.data.celebrations.filter(c => 
                moment(c.timestamp).isAfter(startDate)
            ),
            metrics: this.data.metrics
        };
    }
}

module.exports = CommunityProgressTracker;