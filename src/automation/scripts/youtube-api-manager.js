/**
 * YouTube API Manager
 * Handles YouTube Data API v3 integration for automated uploads and scheduling
 */

const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
const ContentCalendarManager = require('./content-calendar-manager');

class YouTubeAPIManager {
    constructor() {
        this.youtube = null;
        this.auth = null;
        this.calendarManager = new ContentCalendarManager();
        
        // Domain-specific metadata configurations
        this.domainConfigs = {
            'People': {
                color: 'green',
                tags: ['PMP People Domain', 'Team Management', 'Leadership', 'Conflict Resolution'],
                category: '27', // Education category
                defaultLanguage: 'en'
            },
            'Process': {
                color: 'blue', 
                tags: ['PMP Process Domain', 'Project Management', 'Planning', 'Execution'],
                category: '27',
                defaultLanguage: 'en'
            },
            'Business Environment': {
                color: 'orange',
                tags: ['PMP Business Environment', 'Organizational Change', 'Compliance'],
                category: '27',
                defaultLanguage: 'en'
            },
            'Mixed': {
                color: 'purple',
                tags: ['PMP Exam Prep', 'Final Review', 'Practice Questions'],
                category: '27',
                defaultLanguage: 'en'
            }
        };
    }

    /**
     * Initialize YouTube API with OAuth2 authentication
     */
    async initialize() {
        try {
            // Load credentials from environment or config file
            const credentials = {
                client_id: process.env.YOUTUBE_CLIENT_ID,
                client_secret: process.env.YOUTUBE_CLIENT_SECRET,
                redirect_uri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
            };

            this.auth = new google.auth.OAuth2(
                credentials.client_id,
                credentials.client_secret,
                credentials.redirect_uri
            );

            // Load refresh token if available
            if (process.env.YOUTUBE_REFRESH_TOKEN) {
                this.auth.setCredentials({
                    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
                });
            }

            this.youtube = google.youtube({
                version: 'v3',
                auth: this.auth
            });

            await this.calendarManager.initialize();
            console.log('YouTube API Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize YouTube API:', error.message);
            throw error;
        }
    }

    /**
     * Generate OAuth2 authorization URL for first-time setup
     */
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.force-ssl'
        ];

        return this.auth.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokens(code) {
        const { tokens } = await this.auth.getToken(code);
        this.auth.setCredentials(tokens);
        return tokens;
    }

    /**
     * Upload video with metadata based on calendar data
     */
    async uploadVideo(videoFile, videoData, thumbnailFile = null) {
        try {
            const domainConfig = this.domainConfigs[videoData.domain] || this.domainConfigs['Mixed'];
            
            // Prepare video metadata
            const videoMetadata = {
                snippet: {
                    title: videoData.title,
                    description: this.generateDescription(videoData),
                    tags: this.generateTags(videoData, domainConfig),
                    categoryId: domainConfig.category,
                    defaultLanguage: domainConfig.defaultLanguage,
                    defaultAudioLanguage: domainConfig.defaultLanguage
                },
                status: {
                    privacyStatus: videoData.privacyStatus || 'private', // Start as private
                    selfDeclaredMadeForKids: false,
                    embeddable: true,
                    license: 'youtube',
                    publicStatsViewable: true
                }
            };

            // Add scheduled publish time if provided
            if (videoData.scheduledPublishTime) {
                videoMetadata.status.publishAt = videoData.scheduledPublishTime;
                videoMetadata.status.privacyStatus = 'private'; // Must be private for scheduled publishing
            }

            // Upload video
            const uploadResponse = await this.youtube.videos.insert({
                part: ['snippet', 'status'],
                requestBody: videoMetadata,
                media: {
                    body: fs.createReadStream(videoFile)
                }
            });

            const videoId = uploadResponse.data.id;
            console.log(`Video uploaded successfully: ${videoId}`);

            // Upload thumbnail if provided
            if (thumbnailFile && fs.existsSync(thumbnailFile)) {
                await this.uploadThumbnail(videoId, thumbnailFile);
            }

            // Update database with YouTube video ID
            await this.updateVideoInDatabase(videoData.id, {
                youtube_video_id: videoId,
                production_status: 'published',
                published_date: new Date().toISOString().split('T')[0]
            });

            return {
                videoId,
                title: videoData.title,
                url: `https://www.youtube.com/watch?v=${videoId}`
            };

        } catch (error) {
            console.error('Error uploading video:', error.message);
            throw error;
        }
    }

    /**
     * Upload thumbnail for a video
     */
    async uploadThumbnail(videoId, thumbnailFile) {
        try {
            await this.youtube.thumbnails.set({
                videoId: videoId,
                media: {
                    body: fs.createReadStream(thumbnailFile)
                }
            });
            console.log(`Thumbnail uploaded for video: ${videoId}`);
        } catch (error) {
            console.error('Error uploading thumbnail:', error.message);
            throw error;
        }
    }

    /**
     * Generate video description with SEO optimization
     */
    generateDescription(videoData) {
        const workGroupEmoji = {
            'Building Team': '👥',
            'Starting Project': '🚀',
            'Doing Work': '⚡',
            'Keeping Track': '📊',
            'Business Focus': '🏢',
            'Final Prep': '🎯'
        };

        const emoji = workGroupEmoji[videoData.workGroup] || '📚';
        
        let description = `${emoji} ${videoData.title}\n\n`;
        
        // Add week and work group context
        description += `📅 Week ${videoData.week} of our 13-Week PMP Study Plan\n`;
        description += `🎯 Work Group: ${videoData.workGroup}\n`;
        description += `📖 Domain Focus: ${videoData.domain}\n\n`;
        
        // Add learning objectives based on video type
        switch (videoData.type) {
            case 'overview':
                description += `This week overview covers the essential concepts for ${videoData.workGroup.toLowerCase()}. `;
                break;
            case 'daily-study':
                description += `Today's lesson focuses on practical application of PMP concepts. `;
                break;
            case 'practice':
                description += `Practice session with real-world scenarios and exam-style questions. `;
                break;
            case 'review':
                description += `Week review summarizing key takeaways and preparing for next week. `;
                break;
        }
        
        description += `Perfect for PMP certification candidates following a structured study approach.\n\n`;
        
        // Add timestamps (placeholder - would be populated from actual video)
        description += `⏰ TIMESTAMPS:\n`;
        description += `00:00 Introduction\n`;
        description += `01:00 Learning Objectives\n`;
        description += `02:00 ECO Connection\n`;
        description += `03:00 Main Content\n`;
        if (videoData.duration >= 15) {
            description += `${videoData.duration - 5}:00 Practice Application\n`;
            description += `${videoData.duration - 2}:00 Key Takeaways\n`;
            description += `${videoData.duration - 1}:00 Next Preview\n`;
        }
        description += `\n`;
        
        // Add study resources
        description += `📚 STUDY RESOURCES:\n`;
        description += `• Complete 13-Week Study Plan: [Link to playlist]\n`;
        description += `• Study Guide PDF: [Link to download]\n`;
        description += `• Practice Questions: [Link to resource]\n`;
        description += `• Community Discord: [Link to community]\n\n`;
        
        // Add related content
        description += `🔗 RELATED VIDEOS:\n`;
        if (videoData.week > 1) {
            description += `• Previous Week: [Link to Week ${videoData.week - 1}]\n`;
        }
        if (videoData.week < 13) {
            description += `• Next Week: [Link to Week ${videoData.week + 1}]\n`;
        }
        description += `• ${videoData.domain} Domain Playlist: [Link to domain playlist]\n\n`;
        
        // Add hashtags
        description += `#PMPExam #ProjectManagement #PMPCertification #PMPStudyPlan #${videoData.domain.replace(' ', '')}Domain`;
        
        return description;
    }

    /**
     * Generate tags for SEO optimization
     */
    generateTags(videoData, domainConfig) {
        const baseTags = [
            'PMP exam prep',
            'PMP certification',
            'Project Management Professional',
            'PMI certification',
            'PMP study guide',
            '13 week study plan'
        ];
        
        const weekTags = [
            `Week ${videoData.week}`,
            `PMP Week ${videoData.week}`,
            videoData.workGroup.toLowerCase()
        ];
        
        const typeTags = {
            'overview': ['week overview', 'study plan overview'],
            'daily-study': ['daily lesson', 'PMP daily study', 'study session'],
            'practice': ['practice questions', 'PMP practice', 'exam practice'],
            'review': ['week review', 'study review', 'key takeaways']
        };
        
        const videoTypeTags = typeTags[videoData.type] || [];
        
        return [
            ...baseTags,
            ...domainConfig.tags,
            ...weekTags,
            ...videoTypeTags
        ].slice(0, 15); // YouTube allows max 15 tags
    }

    /**
     * Batch upload videos with scheduling
     */
    async batchUpload(uploadBatch) {
        const results = [];
        
        for (const item of uploadBatch) {
            try {
                console.log(`Uploading: ${item.videoData.title}`);
                const result = await this.uploadVideo(
                    item.videoFile,
                    item.videoData,
                    item.thumbnailFile
                );
                results.push({ success: true, ...result });
                
                // Add delay between uploads to respect rate limits
                await this.delay(2000);
                
            } catch (error) {
                console.error(`Failed to upload ${item.videoData.title}:`, error.message);
                results.push({ 
                    success: false, 
                    title: item.videoData.title,
                    error: error.message 
                });
            }
        }
        
        return results;
    }

    /**
     * Schedule daily uploads for 13-week cycle
     */
    async scheduleWeeklyUploads(weekNumber, startDate, videoFiles) {
        const weekVideos = await this.calendarManager.getVideosByWeek(weekNumber);
        const schedules = [];
        
        let currentDate = new Date(startDate);
        
        for (let i = 0; i < weekVideos.length; i++) {
            const video = weekVideos[i];
            const videoFile = videoFiles[i];
            
            if (!videoFile || !fs.existsSync(videoFile)) {
                console.warn(`Video file not found for ${video.title}`);
                continue;
            }
            
            // Schedule for 9 AM each day
            const scheduledTime = new Date(currentDate);
            scheduledTime.setHours(9, 0, 0, 0);
            
            const videoData = {
                ...video,
                scheduledPublishTime: scheduledTime.toISOString(),
                privacyStatus: 'private' // Required for scheduled publishing
            };
            
            schedules.push({
                videoData,
                videoFile,
                thumbnailFile: this.getThumbnailPath(video.id),
                scheduledDate: scheduledTime.toISOString().split('T')[0]
            });
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return schedules;
    }

    /**
     * Get optimal upload timing for maximum engagement
     */
    getOptimalUploadTime(dayOfWeek, timezone = 'America/New_York') {
        // Based on YouTube analytics best practices
        const optimalTimes = {
            1: '09:00', // Monday
            2: '10:00', // Tuesday  
            3: '10:00', // Wednesday
            4: '10:00', // Thursday
            5: '09:00', // Friday
            6: '11:00', // Saturday
            0: '14:00'  // Sunday
        };
        
        return optimalTimes[dayOfWeek] || '10:00';
    }

    /**
     * Update video information in database
     */
    async updateVideoInDatabase(videoId, updates) {
        // This would integrate with the ContentCalendarManager
        // For now, just log the update
        console.log(`Database update for ${videoId}:`, updates);
    }

    /**
     * Get thumbnail file path for video
     */
    getThumbnailPath(videoId) {
        return path.join('generated/thumbnails', `${videoId}.png`);
    }

    /**
     * Utility function to add delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get channel statistics
     */
    async getChannelStats() {
        try {
            const response = await this.youtube.channels.list({
                part: ['statistics', 'snippet'],
                mine: true
            });
            
            return response.data.items[0];
        } catch (error) {
            console.error('Error fetching channel stats:', error.message);
            throw error;
        }
    }

    /**
     * Get video analytics
     */
    async getVideoAnalytics(videoId) {
        try {
            const response = await this.youtube.videos.list({
                part: ['statistics', 'snippet'],
                id: [videoId]
            });
            
            return response.data.items[0];
        } catch (error) {
            console.error('Error fetching video analytics:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.calendarManager) {
            await this.calendarManager.close();
        }
    }
}

module.exports = YouTubeAPIManager;