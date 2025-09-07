/**
 * Playlist Management System
 * Handles automatic playlist creation and management for work groups and domains
 */

const { google } = require('googleapis');
const ContentCalendarManager = require('./content-calendar-manager');
const fs = require('fs-extra');
const path = require('path');

class PlaylistManager {
    constructor() {
        this.youtube = null;
        this.auth = null;
        this.calendarManager = new ContentCalendarManager();
        
        // Playlist configurations
        this.playlistConfigs = {
            main: {
                title: '13-Week PMP Study Plan - Complete Series',
                description: this.generateMainPlaylistDescription(),
                privacyStatus: 'public',
                tags: ['PMP', 'Project Management', 'Certification', 'Study Plan']
            },
            workGroups: {
                'Building Team': {
                    title: 'PMP Building Team (Weeks 1-3) - People Domain',
                    description: this.generateWorkGroupDescription('Building Team', [1, 2, 3], 'People'),
                    privacyStatus: 'public',
                    tags: ['PMP People Domain', 'Team Building', 'Leadership']
                },
                'Starting Project': {
                    title: 'PMP Starting Project (Weeks 4-5) - Process Domain',
                    description: this.generateWorkGroupDescription('Starting Project', [4, 5], 'Process'),
                    privacyStatus: 'public',
                    tags: ['PMP Process Domain', 'Project Planning', 'Integration']
                },
                'Doing Work': {
                    title: 'PMP Doing Work (Weeks 6-8) - Process Domain',
                    description: this.generateWorkGroupDescription('Doing Work', [6, 7, 8], 'Process'),
                    privacyStatus: 'public',
                    tags: ['PMP Process Domain', 'Execution', 'Monitoring']
                },
                'Keeping Track': {
                    title: 'PMP Keeping Track (Weeks 9-10) - Process Domain',
                    description: this.generateWorkGroupDescription('Keeping Track', [9, 10], 'Process'),
                    privacyStatus: 'public',
                    tags: ['PMP Process Domain', 'Tracking', 'Control']
                },
                'Business Focus': {
                    title: 'PMP Business Focus (Week 11) - Business Environment',
                    description: this.generateWorkGroupDescription('Business Focus', [11], 'Business Environment'),
                    privacyStatus: 'public',
                    tags: ['PMP Business Environment', 'Organizational Change']
                },
                'Final Prep': {
                    title: 'PMP Final Prep (Weeks 12-13) - Exam Preparation',
                    description: this.generateWorkGroupDescription('Final Prep', [12, 13], 'Mixed'),
                    privacyStatus: 'public',
                    tags: ['PMP Exam Prep', 'Final Review', 'Practice Questions']
                }
            },
            domains: {
                'People': {
                    title: 'PMP People Domain (42%) - Complete Collection',
                    description: this.generateDomainDescription('People', 42),
                    privacyStatus: 'public',
                    tags: ['PMP People Domain', 'Team Management', 'Leadership']
                },
                'Process': {
                    title: 'PMP Process Domain (50%) - Complete Collection',
                    description: this.generateDomainDescription('Process', 50),
                    privacyStatus: 'public',
                    tags: ['PMP Process Domain', 'Project Management', 'Planning']
                },
                'Business Environment': {
                    title: 'PMP Business Environment (8%) - Complete Collection',
                    description: this.generateDomainDescription('Business Environment', 8),
                    privacyStatus: 'public',
                    tags: ['PMP Business Environment', 'Organizational Change']
                }
            },
            contentTypes: {
                'daily-study': {
                    title: 'PMP Daily Study Sessions - All Lessons',
                    description: 'Complete collection of daily 15-20 minute study sessions covering all PMP concepts.',
                    privacyStatus: 'public',
                    tags: ['PMP Daily Study', 'Study Sessions', 'PMP Lessons']
                },
                'practice': {
                    title: 'PMP Practice Sessions - Scenarios & Questions',
                    description: 'Weekly practice sessions with real-world scenarios and exam-style questions.',
                    privacyStatus: 'public',
                    tags: ['PMP Practice', 'Practice Questions', 'Exam Prep']
                },
                'review': {
                    title: 'PMP Weekly Reviews - Key Takeaways',
                    description: 'Weekly review sessions summarizing key concepts and preparing for the next week.',
                    privacyStatus: 'public',
                    tags: ['PMP Review', 'Weekly Summary', 'Key Takeaways']
                },
                'overview': {
                    title: 'PMP Weekly Overviews - Study Plan Structure',
                    description: 'Weekly overview videos introducing each week\'s focus and learning objectives.',
                    privacyStatus: 'public',
                    tags: ['PMP Overview', 'Study Plan', 'Weekly Introduction']
                }
            }
        };
    }

    async initialize() {
        try {
            // Initialize YouTube API (same as YouTubeAPIManager)
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
            console.log('Playlist Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Playlist Manager:', error.message);
            throw error;
        }
    }

    /**
     * Create all playlists for the channel
     */
    async createAllPlaylists() {
        const createdPlaylists = {};
        
        try {
            // Create main study plan playlist
            console.log('Creating main study plan playlist...');
            createdPlaylists.main = await this.createPlaylist(this.playlistConfigs.main);
            
            // Create work group playlists
            console.log('Creating work group playlists...');
            createdPlaylists.workGroups = {};
            for (const [groupName, config] of Object.entries(this.playlistConfigs.workGroups)) {
                createdPlaylists.workGroups[groupName] = await this.createPlaylist(config);
                await this.delay(1000); // Rate limiting
            }
            
            // Create domain playlists
            console.log('Creating domain playlists...');
            createdPlaylists.domains = {};
            for (const [domainName, config] of Object.entries(this.playlistConfigs.domains)) {
                createdPlaylists.domains[domainName] = await this.createPlaylist(config);
                await this.delay(1000);
            }
            
            // Create content type playlists
            console.log('Creating content type playlists...');
            createdPlaylists.contentTypes = {};
            for (const [typeName, config] of Object.entries(this.playlistConfigs.contentTypes)) {
                createdPlaylists.contentTypes[typeName] = await this.createPlaylist(config);
                await this.delay(1000);
            }
            
            // Save playlist IDs to file
            const playlistFile = path.join('src/config', 'playlists.json');
            await fs.writeJson(playlistFile, createdPlaylists, { spaces: 2 });
            
            console.log(`✅ Created ${Object.keys(createdPlaylists).length} playlist categories`);
            console.log(`📄 Playlist IDs saved to: ${playlistFile}`);
            
            return createdPlaylists;
            
        } catch (error) {
            console.error('Error creating playlists:', error.message);
            throw error;
        }
    }

    /**
     * Create a single playlist
     */
    async createPlaylist(config) {
        try {
            const response = await this.youtube.playlists.insert({
                part: ['snippet', 'status'],
                requestBody: {
                    snippet: {
                        title: config.title,
                        description: config.description,
                        tags: config.tags,
                        defaultLanguage: 'en'
                    },
                    status: {
                        privacyStatus: config.privacyStatus
                    }
                }
            });
            
            const playlistId = response.data.id;
            console.log(`✅ Created playlist: ${config.title} (${playlistId})`);
            
            return {
                id: playlistId,
                title: config.title,
                url: `https://www.youtube.com/playlist?list=${playlistId}`
            };
            
        } catch (error) {
            console.error(`Error creating playlist "${config.title}":`, error.message);
            throw error;
        }
    }

    /**
     * Add video to playlist
     */
    async addVideoToPlaylist(playlistId, videoId, position = null) {
        try {
            const requestBody = {
                snippet: {
                    playlistId: playlistId,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId
                    }
                }
            };
            
            if (position !== null) {
                requestBody.snippet.position = position;
            }
            
            await this.youtube.playlistItems.insert({
                part: ['snippet'],
                requestBody: requestBody
            });
            
            console.log(`Added video ${videoId} to playlist ${playlistId}`);
            
        } catch (error) {
            console.error(`Error adding video to playlist:`, error.message);
            throw error;
        }
    }

    /**
     * Organize videos into playlists based on calendar data
     */
    async organizeVideosIntoPlaylists(videoMappings) {
        const playlistFile = path.join('src/config', 'playlists.json');
        
        if (!await fs.pathExists(playlistFile)) {
            throw new Error('Playlists not found. Run createAllPlaylists() first.');
        }
        
        const playlists = await fs.readJson(playlistFile);
        const calendar = await this.calendarManager.generateContentCalendar();
        
        console.log('Organizing videos into playlists...');
        
        // Add videos to main playlist in chronological order
        let position = 0;
        for (const week of calendar) {
            for (const video of week.videos) {
                const youtubeVideoId = videoMappings[video.id];
                if (youtubeVideoId) {
                    await this.addVideoToPlaylist(playlists.main.id, youtubeVideoId, position);
                    position++;
                    await this.delay(500); // Rate limiting
                }
            }
        }
        
        // Add videos to work group playlists
        for (const week of calendar) {
            const workGroupPlaylist = playlists.workGroups[week.workGroup];
            if (workGroupPlaylist) {
                for (const video of week.videos) {
                    const youtubeVideoId = videoMappings[video.id];
                    if (youtubeVideoId) {
                        await this.addVideoToPlaylist(workGroupPlaylist.id, youtubeVideoId);
                        await this.delay(500);
                    }
                }
            }
        }
        
        // Add videos to domain playlists
        for (const week of calendar) {
            const domainPlaylist = playlists.domains[week.domain];
            if (domainPlaylist) {
                for (const video of week.videos) {
                    const youtubeVideoId = videoMappings[video.id];
                    if (youtubeVideoId) {
                        await this.addVideoToPlaylist(domainPlaylist.id, youtubeVideoId);
                        await this.delay(500);
                    }
                }
            }
        }
        
        // Add videos to content type playlists
        for (const week of calendar) {
            for (const video of week.videos) {
                const typePlaylist = playlists.contentTypes[video.type];
                const youtubeVideoId = videoMappings[video.id];
                if (typePlaylist && youtubeVideoId) {
                    await this.addVideoToPlaylist(typePlaylist.id, youtubeVideoId);
                    await this.delay(500);
                }
            }
        }
        
        console.log('✅ Videos organized into all playlists');
    }

    /**
     * Update playlist descriptions with progress tracking
     */
    async updatePlaylistDescriptions() {
        const playlistFile = path.join('src/config', 'playlists.json');
        const playlists = await fs.readJson(playlistFile);
        
        // Update main playlist with current progress
        const summary = await this.calendarManager.getWeeklyProductionSummary();
        const totalVideos = summary.reduce((sum, week) => sum + week.total_videos, 0);
        const publishedVideos = summary.reduce((sum, week) => sum + week.videos_published, 0);
        
        const updatedMainDescription = this.generateMainPlaylistDescription() + 
            `\n\n📊 CURRENT PROGRESS: ${publishedVideos}/${totalVideos} videos published (${Math.round(publishedVideos/totalVideos*100)}%)`;
        
        await this.updatePlaylistDescription(playlists.main.id, updatedMainDescription);
        
        // Update work group playlists with their specific progress
        const workGroupProgress = await this.calendarManager.getWorkGroupProgress();
        for (const [groupName, progress] of Object.entries(workGroupProgress)) {
            const playlist = playlists.workGroups[groupName];
            if (playlist) {
                const updatedDescription = this.generateWorkGroupDescription(
                    groupName, 
                    progress.weeks, 
                    progress.domain
                ) + `\n\n📊 PROGRESS: ${progress.published}/${progress.total_videos} videos published (${Math.round(progress.completionRate)}%)`;
                
                await this.updatePlaylistDescription(playlist.id, updatedDescription);
            }
        }
        
        console.log('✅ Updated playlist descriptions with progress tracking');
    }

    /**
     * Update playlist description
     */
    async updatePlaylistDescription(playlistId, newDescription) {
        try {
            await this.youtube.playlists.update({
                part: ['snippet'],
                requestBody: {
                    id: playlistId,
                    snippet: {
                        description: newDescription
                    }
                }
            });
            
            console.log(`Updated description for playlist ${playlistId}`);
            
        } catch (error) {
            console.error(`Error updating playlist description:`, error.message);
            throw error;
        }
    }

    /**
     * Generate main playlist description
     */
    generateMainPlaylistDescription() {
        return `🎯 Complete 13-Week PMP Certification Study Plan

This comprehensive playlist contains all 91 videos from our structured PMP exam preparation series. Follow along week by week to master all three domains of the PMP exam.

📚 WHAT YOU'LL LEARN:
• People Domain (42% of exam) - Weeks 1-4
• Process Domain (50% of exam) - Weeks 4-10  
• Business Environment (8% of exam) - Week 11
• Final Exam Preparation - Weeks 12-13

⏰ STUDY SCHEDULE:
• Monday: Week Overview (18 min)
• Tuesday-Friday: Daily Lessons (15 min each)
• Saturday: Practice Session (25 min)
• Sunday: Week Review (20 min)

🎯 WORK GROUP PROGRESSION:
1. Building Team (Weeks 1-3)
2. Starting Project (Weeks 4-5)
3. Doing Work (Weeks 6-8)
4. Keeping Track (Weeks 9-10)
5. Business Focus (Week 11)
6. Final Prep (Weeks 12-13)

📖 STUDY RESOURCES:
• Complete Study Guide PDF: [Link]
• Practice Question Bank: [Link]
• Study Calendar Template: [Link]
• Community Discord: [Link]

#PMPExam #ProjectManagement #PMPCertification #StudyPlan`;
    }

    /**
     * Generate work group playlist description
     */
    generateWorkGroupDescription(groupName, weeks, domain) {
        const weekList = weeks.join(', ');
        const emoji = {
            'Building Team': '👥',
            'Starting Project': '🚀',
            'Doing Work': '⚡',
            'Keeping Track': '📊',
            'Business Focus': '🏢',
            'Final Prep': '🎯'
        }[groupName] || '📚';
        
        return `${emoji} ${groupName} - PMP Study Plan

This playlist covers ${groupName.toLowerCase()} concepts from Week${weeks.length > 1 ? 's' : ''} ${weekList} of our 13-week PMP certification study plan.

🎯 DOMAIN FOCUS: ${domain}
📅 WEEKS COVERED: ${weekList}
🎥 VIDEO TYPES: Overviews, Daily Lessons, Practice Sessions, Reviews

📚 KEY CONCEPTS:
${this.getWorkGroupConcepts(groupName)}

🔗 RELATED PLAYLISTS:
• Complete 13-Week Study Plan
• ${domain} Domain Collection
• Practice Sessions Collection

#PMPExam #${domain.replace(' ', '')}Domain #${groupName.replace(' ', '')}`;
    }

    /**
     * Generate domain playlist description
     */
    generateDomainDescription(domain, percentage) {
        const emoji = {
            'People': '👥',
            'Process': '⚙️',
            'Business Environment': '🏢'
        }[domain] || '📚';
        
        return `${emoji} PMP ${domain} Domain (${percentage}% of Exam)

Complete collection of all videos covering the ${domain} domain from our 13-week PMP study plan.

📊 EXAM WEIGHT: ${percentage}% of PMP certification exam
🎯 FOCUS AREAS: ${this.getDomainFocusAreas(domain)}

📚 CONTENT INCLUDES:
• Conceptual explanations
• Real-world applications  
• Practice scenarios
• Exam strategies

🔗 STUDY PROGRESSION:
Follow the main 13-Week Study Plan playlist for optimal learning sequence.

#PMPExam #${domain.replace(' ', '')}Domain #ProjectManagement`;
    }

    /**
     * Get work group key concepts
     */
    getWorkGroupConcepts(groupName) {
        const concepts = {
            'Building Team': '• Team formation and development\n• Conflict management strategies\n• Leadership and empowerment\n• Communication fundamentals',
            'Starting Project': '• Project integration management\n• Methodology selection\n• Governance structures\n• Planning fundamentals',
            'Doing Work': '• Scope, schedule, and resource management\n• Quality and risk management\n• Communications planning\n• Stakeholder engagement',
            'Keeping Track': '• Project monitoring and control\n• Issue and knowledge management\n• Compliance and governance\n• Performance tracking',
            'Business Focus': '• Organizational change management\n• Business environment analysis\n• Value delivery\n• Strategic alignment',
            'Final Prep': '• Comprehensive domain review\n• Exam strategies and tips\n• Practice question techniques\n• Final preparation checklist'
        };
        
        return concepts[groupName] || '• Key PMP concepts and applications';
    }

    /**
     * Get domain focus areas
     */
    getDomainFocusAreas(domain) {
        const areas = {
            'People': 'Team leadership, conflict resolution, stakeholder management',
            'Process': 'Project planning, execution, monitoring, and closing',
            'Business Environment': 'Organizational factors, compliance, change management'
        };
        
        return areas[domain] || 'Core PMP concepts';
    }

    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        if (this.calendarManager) {
            await this.calendarManager.close();
        }
    }
}

module.exports = PlaylistManager;