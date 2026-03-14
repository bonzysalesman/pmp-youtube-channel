/**
 * Content Calendar Management System
 * Manages 91 structured videos across 13 weeks with work group organization
 * and production pipeline tracking
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

class ContentCalendarManager {
    constructor(dbPath = 'data/pmp-content.db') {
        this.dbPath = dbPath;
        this.db = null;
        this.workGroups = {
            'Building Team': { weeks: [1, 2, 3], color: 'green', domain: 'People' },
            'Starting Project': { weeks: [4, 5], color: 'blue', domain: 'Process' },
            'Doing Work': { weeks: [6, 7, 8], color: 'blue', domain: 'Process' },
            'Keeping Track': { weeks: [9, 10], color: 'blue', domain: 'Process' },
            'Business Focus': { weeks: [11], color: 'orange', domain: 'Business Environment' },
            'Final Prep': { weeks: [12, 13], color: 'purple', domain: 'Mixed' }
        };
        
        this.weeklyStructure = {
            1: { type: 'overview', duration: 18, title: 'Week Overview' },
            2: { type: 'daily-study', duration: 15, title: 'Daily Lesson' },
            3: { type: 'daily-study', duration: 15, title: 'Daily Lesson' },
            4: { type: 'daily-study', duration: 15, title: 'Daily Lesson' },
            5: { type: 'daily-study', duration: 15, title: 'Daily Lesson' },
            6: { type: 'practice', duration: 25, title: 'Practice Session' },
            7: { type: 'review', duration: 20, title: 'Week Review' }
        };
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Connected to content calendar database');
                    resolve();
                }
            });
        });
    }

    /**
     * Generate complete 13-week content calendar with 91 videos
     */
    async generateContentCalendar() {
        const calendar = [];
        let videoCount = 0;

        for (let week = 1; week <= 13; week++) {
            const workGroup = this.getWorkGroupForWeek(week);
            const weekData = {
                week,
                workGroup: workGroup.name,
                domain: workGroup.domain,
                color: workGroup.color,
                videos: []
            };

            // Generate 7 videos per week
            for (let day = 1; day <= 7; day++) {
                const dayStructure = this.weeklyStructure[day];
                const video = {
                    id: `w${week.toString().padStart(2, '0')}_d${day}`,
                    week,
                    day,
                    type: dayStructure.type,
                    title: this.generateVideoTitle(week, day, dayStructure),
                    duration: dayStructure.duration,
                    workGroup: workGroup.name,
                    domain: workGroup.domain,
                    color: workGroup.color,
                    status: 'planned',
                    scriptStatus: 'pending',
                    productionStatus: 'planning',
                    thumbnailStatus: 'pending'
                };
                
                weekData.videos.push(video);
                videoCount++;
            }
            
            calendar.push(weekData);
        }

        console.log(`Generated calendar with ${videoCount} videos across 13 weeks`);
        return calendar;
    }

    /**
     * Get work group information for a specific week
     */
    getWorkGroupForWeek(week) {
        for (const [groupName, groupData] of Object.entries(this.workGroups)) {
            if (groupData.weeks.includes(week)) {
                return { name: groupName, ...groupData };
            }
        }
        return { name: 'Unknown', domain: 'Mixed', color: 'gray', weeks: [] };
    }

    /**
     * Generate video title based on week, day, and structure
     */
    generateVideoTitle(week, day, dayStructure) {
        const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayName = dayNames[day];
        
        switch (dayStructure.type) {
            case 'overview':
                return `Week ${week} Overview: ${this.getWeekTheme(week)} | PMP Exam Prep`;
            case 'daily-study':
                return `Day ${((week - 1) * 7) + day}: ${this.getDailyTopic(week, day)} | PMP Study Week ${week}`;
            case 'practice':
                return `Week ${week} Practice: ${this.getWeekTheme(week)} Scenarios | PMP Exam Prep`;
            case 'review':
                return `Week ${week} Review: ${this.getWeekTheme(week)} Key Takeaways | PMP Study Plan`;
            default:
                return `Week ${week} Day ${day}: PMP Study Content`;
        }
    }

    /**
     * Get theme for a specific week
     */
    getWeekTheme(week) {
        const themes = {
            1: 'PMP Foundations & Mindset',
            2: 'Team Building & Conflict Management',
            3: 'Team Performance & Virtual Teams',
            4: 'Leadership & Collaboration',
            5: 'Project Integration & Methodology',
            6: 'Scope, Schedule & Resources',
            7: 'Quality, Risk & Communications',
            8: 'Stakeholders, Procurement & Artifacts',
            9: 'Execution, Changes & Value',
            10: 'Issues, Knowledge & Compliance',
            11: 'Business Environment & Change',
            12: 'Process Domain Review',
            13: 'Final Exam Preparation'
        };
        return themes[week] || `Week ${week} Content`;
    }

    /**
     * Get daily topic for specific week and day
     */
    getDailyTopic(week, day) {
        // This would be expanded with actual topic mapping
        const topics = {
            1: ['PMP Exam Overview', 'Mindset Fundamentals', 'Study Strategy', 'ECO Introduction'],
            2: ['Team Basics', 'Conflict Management', 'Negotiation Skills', 'Empowerment'],
            3: ['Team Performance', 'Virtual Teams', 'Training & Development', 'Mentoring'],
            // ... continue for all weeks
        };
        
        const weekTopics = topics[week] || [`Topic ${day-1}`, `Topic ${day}`, `Topic ${day+1}`, `Topic ${day+2}`];
        return weekTopics[day - 2] || `Week ${week} Content`;
    }

    /**
     * Insert calendar data into database
     */
    async insertCalendarToDatabase(calendar) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                const stmt = this.db.prepare(`
                    INSERT OR REPLACE INTO videos (
                        video_id, week_number, day_number, title, duration_minutes,
                        video_type, script_status, production_status, thumbnail_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                let insertCount = 0;
                calendar.forEach(week => {
                    week.videos.forEach(video => {
                        stmt.run([
                            video.id,
                            video.week,
                            video.day,
                            video.title,
                            video.duration,
                            video.type,
                            video.scriptStatus,
                            video.productionStatus,
                            video.thumbnailStatus
                        ], (err) => {
                            if (err) {
                                console.error('Error inserting video:', err);
                            } else {
                                insertCount++;
                            }
                        });
                    });
                });

                stmt.finalize((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`Inserted ${insertCount} videos into database`);
                        resolve(insertCount);
                    }
                });
            });
        });
    }

    /**
     * Update video production status
     */
    async updateVideoStatus(videoId, statusType, newStatus) {
        const validStatusTypes = ['script_status', 'production_status', 'thumbnail_status'];
        if (!validStatusTypes.includes(statusType)) {
            throw new Error(`Invalid status type: ${statusType}`);
        }

        return new Promise((resolve, reject) => {
            const sql = `UPDATE videos SET ${statusType} = ?, updated_at = CURRENT_TIMESTAMP WHERE video_id = ?`;
            this.db.run(sql, [newStatus, videoId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Updated ${videoId} ${statusType} to ${newStatus}`);
                    resolve(this.changes);
                }
            });
        });
    }

    /**
     * Get videos by production status
     */
    async getVideosByStatus(statusType, status) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM videos WHERE ${statusType} = ? ORDER BY week_number, day_number`;
            this.db.all(sql, [status], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get weekly production summary
     */
    async getWeeklyProductionSummary() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    week_number,
                    COUNT(*) as total_videos,
                    SUM(CASE WHEN script_status = 'final' THEN 1 ELSE 0 END) as scripts_complete,
                    SUM(CASE WHEN production_status = 'published' THEN 1 ELSE 0 END) as videos_published,
                    SUM(CASE WHEN thumbnail_status = 'approved' THEN 1 ELSE 0 END) as thumbnails_ready
                FROM videos 
                GROUP BY week_number 
                ORDER BY week_number
            `;
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get work group progress summary
     */
    async getWorkGroupProgress() {
        const summary = {};
        
        for (const [groupName, groupData] of Object.entries(this.workGroups)) {
            const weekList = groupData.weeks.join(',');
            const progress = await new Promise((resolve, reject) => {
                const sql = `
                    SELECT 
                        COUNT(*) as total_videos,
                        SUM(CASE WHEN production_status = 'published' THEN 1 ELSE 0 END) as published,
                        SUM(CASE WHEN script_status = 'final' THEN 1 ELSE 0 END) as scripts_ready
                    FROM videos 
                    WHERE week_number IN (${weekList})
                `;
                this.db.get(sql, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            summary[groupName] = {
                ...groupData,
                ...progress,
                completionRate: progress.published / progress.total_videos * 100
            };
        }
        
        return summary;
    }

    /**
     * Schedule video uploads with optimal timing
     */
    async scheduleUploads(startDate, timeSlot = '09:00') {
        const calendar = await this.generateContentCalendar();
        const schedules = [];
        
        let currentDate = new Date(startDate);
        
        calendar.forEach(week => {
            week.videos.forEach(video => {
                const scheduleDate = new Date(currentDate);
                schedules.push({
                    videoId: video.id,
                    scheduledDate: scheduleDate.toISOString().split('T')[0],
                    scheduledTime: timeSlot,
                    week: video.week,
                    day: video.day,
                    title: video.title,
                    workGroup: video.workGroup
                });
                
                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            });
        });
        
        return schedules;
    }

    async close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = ContentCalendarManager;