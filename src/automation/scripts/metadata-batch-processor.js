/**
 * Metadata Batch Processor
 * 
 * Processes multiple videos and generates comprehensive metadata for the entire 13-week program
 * Handles batch generation, validation, and export of video metadata
 */

const fs = require('fs-extra');
const path = require('path');
const VideoMetadataGenerator = require('./video-metadata-generator');

class MetadataBatchProcessor {
    constructor() {
        this.generator = new VideoMetadataGenerator();
        this.outputDir = path.join(__dirname, '../../generated/metadata');
        this.ensureOutputDirectory();
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDirectory() {
        await fs.ensureDir(this.outputDir);
        await fs.ensureDir(path.join(this.outputDir, 'individual'));
        await fs.ensureDir(path.join(this.outputDir, 'batch'));
        await fs.ensureDir(path.join(this.outputDir, 'playlists'));
    }

    /**
     * Process all videos from the content calendar
     * @returns {Object} Complete metadata for all videos
     */
    async processAllVideos() {
        console.log('🚀 Starting batch metadata generation...');
        
        try {
            await this.generator.loadConfigurations();
            const contentCalendar = this.generator.contentCalendar;
            const allMetadata = {
                program: contentCalendar.program,
                videos: [],
                playlists: {},
                summary: {
                    totalVideos: 0,
                    byType: {},
                    byDomain: {},
                    byWeek: {}
                }
            };

            // Process each week
            for (const week of contentCalendar.weeks) {
                console.log(`📅 Processing Week ${week.week}: ${week.theme}`);
                
                const weekMetadata = await this.processWeek(week);
                allMetadata.videos.push(...weekMetadata.videos);
                
                // Merge playlist data
                Object.assign(allMetadata.playlists, weekMetadata.playlists);
                
                // Update summary
                this.updateSummary(allMetadata.summary, weekMetadata);
            }

            // Generate consolidated playlists
            allMetadata.consolidatedPlaylists = this.generateConsolidatedPlaylists(allMetadata.videos);

            // Save all metadata
            await this.saveAllMetadata(allMetadata);
            
            console.log('✅ Batch metadata generation complete!');
            console.log(`📊 Generated metadata for ${allMetadata.summary.totalVideos} videos`);
            
            return allMetadata;
            
        } catch (error) {
            console.error('❌ Error in batch processing:', error);
            throw error;
        }
    }

    /**
     * Process a single week's videos
     * @param {Object} week - Week configuration
     * @returns {Object} Week metadata
     */
    async processWeek(week) {
        const weekMetadata = {
            week: week.week,
            theme: week.theme,
            videos: [],
            playlists: {}
        };

        for (const video of week.videos) {
            try {
                const videoConfig = {
                    ...video,
                    week: week.week,
                    theme: week.theme,
                    workGroup: week.workGroup,
                    domain: week.domain || this.inferDomain(video),
                    color: week.color
                };

                const metadata = this.generator.generateVideoMetadata(videoConfig);
                
                // Add week context
                metadata.weekContext = {
                    week: week.week,
                    theme: week.theme,
                    workGroup: week.workGroup,
                    focus: week.focus
                };

                weekMetadata.videos.push(metadata);
                
                // Save individual video metadata
                await this.saveIndividualMetadata(metadata, videoConfig);
                
                console.log(`  ✓ Generated metadata for: ${videoConfig.title}`);
                
            } catch (error) {
                console.error(`  ❌ Error processing video: ${video.title}`, error);
            }
        }

        return weekMetadata;
    }

    /**
     * Process specific videos by criteria
     * @param {Object} criteria - Selection criteria
     * @returns {Array} Processed videos
     */
    async processVideosByCriteria(criteria = {}) {
        const { week, type, domain, dayRange } = criteria;
        
        await this.generator.loadConfigurations();
        const contentCalendar = this.generator.contentCalendar;
        const results = [];

        for (const weekData of contentCalendar.weeks) {
            // Skip if week filter doesn't match
            if (week && weekData.week !== week) continue;

            for (const video of weekData.videos) {
                // Apply filters
                if (type && video.type !== type) continue;
                if (domain && weekData.domain !== domain) continue;
                if (dayRange && (video.dayNumber < dayRange.min || video.dayNumber > dayRange.max)) continue;

                const videoConfig = {
                    ...video,
                    week: weekData.week,
                    theme: weekData.theme,
                    workGroup: weekData.workGroup,
                    domain: weekData.domain || this.inferDomain(video)
                };

                const metadata = this.generator.generateVideoMetadata(videoConfig);
                results.push(metadata);
            }
        }

        return results;
    }

    /**
     * Generate YouTube upload batch file
     * @param {Array} videos - Video metadata array
     * @returns {Object} Upload batch configuration
     */
    generateUploadBatch(videos) {
        const uploadBatch = {
            batchId: `pmp-upload-${Date.now()}`,
            created: new Date().toISOString(),
            totalVideos: videos.length,
            uploads: []
        };

        videos.forEach((video, index) => {
            const upload = {
                order: index + 1,
                title: video.basic.title,
                description: video.description,
                tags: video.keywords.slice(0, 10), // YouTube limit
                categoryId: '27', // Education category
                privacyStatus: 'public',
                publishAt: video.basic.uploadSchedule.scheduledDate,
                thumbnail: {
                    color: video.basic.thumbnailColor,
                    template: this.getThumbnailTemplate(video)
                },
                playlists: video.playlists.map(p => p.id),
                customThumbnail: `thumbnail_${video.basic.dayNumber || video.basic.week}.png`
            };

            uploadBatch.uploads.push(upload);
        });

        return uploadBatch;
    }

    /**
     * Generate playlist management data
     * @param {Array} videos - Video metadata array
     * @returns {Object} Playlist configuration
     */
    generateConsolidatedPlaylists(videos) {
        const playlists = {};

        // Collect all unique playlists
        videos.forEach(video => {
            video.playlists.forEach(playlist => {
                if (!playlists[playlist.id]) {
                    playlists[playlist.id] = {
                        id: playlist.id,
                        name: playlist.name,
                        description: this.generatePlaylistDescription(playlist),
                        videos: [],
                        privacy: 'public',
                        category: this.getPlaylistCategory(playlist)
                    };
                }
                
                playlists[playlist.id].videos.push({
                    videoId: video.basic.dayNumber || `${video.basic.week}-${video.basic.day}`,
                    title: video.basic.title,
                    order: playlist.order,
                    week: video.basic.week,
                    type: video.basic.type
                });
            });
        });

        // Sort videos in each playlist
        Object.values(playlists).forEach(playlist => {
            playlist.videos.sort((a, b) => a.order - b.order);
        });

        return playlists;
    }

    /**
     * Generate SEO analysis report
     * @param {Array} videos - Video metadata array
     * @returns {Object} SEO analysis
     */
    generateSEOAnalysis(videos) {
        const analysis = {
            overview: {
                totalVideos: videos.length,
                averageSEOScore: 0,
                keywordCoverage: {},
                titleOptimization: {}
            },
            keywords: {
                primary: {},
                longTail: {},
                domain: {}
            },
            recommendations: []
        };

        // Analyze keywords
        videos.forEach(video => {
            // Count keyword usage
            video.keywords.forEach(keyword => {
                analysis.keywords.primary[keyword] = (analysis.keywords.primary[keyword] || 0) + 1;
            });

            // Analyze SEO scores
            analysis.overview.averageSEOScore += video.seo.seoScore;
        });

        analysis.overview.averageSEOScore /= videos.length;

        // Generate recommendations
        analysis.recommendations = this.generateSEORecommendations(analysis);

        return analysis;
    }

    /**
     * Save all metadata to files
     * @param {Object} allMetadata - Complete metadata object
     */
    async saveAllMetadata(allMetadata) {
        // Save complete metadata
        await fs.writeJson(
            path.join(this.outputDir, 'complete-metadata.json'),
            allMetadata,
            { spaces: 2 }
        );

        // Save upload batch
        const uploadBatch = this.generateUploadBatch(allMetadata.videos);
        await fs.writeJson(
            path.join(this.outputDir, 'batch', 'upload-batch.json'),
            uploadBatch,
            { spaces: 2 }
        );

        // Save playlist configurations
        await fs.writeJson(
            path.join(this.outputDir, 'playlists', 'playlist-config.json'),
            allMetadata.consolidatedPlaylists,
            { spaces: 2 }
        );

        // Save SEO analysis
        const seoAnalysis = this.generateSEOAnalysis(allMetadata.videos);
        await fs.writeJson(
            path.join(this.outputDir, 'seo-analysis.json'),
            seoAnalysis,
            { spaces: 2 }
        );

        // Generate CSV export for spreadsheet analysis
        await this.generateCSVExport(allMetadata.videos);

        // Generate description files for easy copy-paste
        await this.generateDescriptionFiles(allMetadata.videos);
    }

    /**
     * Save individual video metadata
     * @param {Object} metadata - Video metadata
     * @param {Object} videoConfig - Video configuration
     */
    async saveIndividualMetadata(metadata, videoConfig) {
        const filename = this.generateFilename(videoConfig);
        const filepath = path.join(this.outputDir, 'individual', `${filename}.json`);
        
        await fs.writeJson(filepath, metadata, { spaces: 2 });
    }

    /**
     * Generate CSV export for analysis
     * @param {Array} videos - Video metadata array
     */
    async generateCSVExport(videos) {
        const csvHeaders = [
            'Week', 'Day', 'DayNumber', 'Type', 'Title', 'Duration', 'Domain',
            'Keywords', 'SEOScore', 'PlaylistCount', 'UploadDate'
        ];

        const csvRows = videos.map(video => [
            video.basic.week,
            video.basic.day,
            video.basic.dayNumber,
            video.basic.type,
            `"${video.basic.title}"`,
            video.basic.duration,
            video.basic.domain,
            `"${video.keywords.slice(0, 5).join(', ')}"`,
            video.seo.seoScore,
            video.playlists.length,
            video.basic.uploadSchedule.scheduledDate
        ]);

        const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        
        await fs.writeFile(
            path.join(this.outputDir, 'video-metadata-export.csv'),
            csvContent
        );
    }

    /**
     * Generate individual description files
     * @param {Array} videos - Video metadata array
     */
    async generateDescriptionFiles(videos) {
        const descriptionsDir = path.join(this.outputDir, 'descriptions');
        await fs.ensureDir(descriptionsDir);

        for (const video of videos) {
            const filename = this.generateFilename(video.basic);
            const filepath = path.join(descriptionsDir, `${filename}.txt`);
            
            await fs.writeFile(filepath, video.description);
        }
    }

    /**
     * Helper methods
     */
    generateFilename(videoConfig) {
        const { week, dayNumber, type, day } = videoConfig;
        
        if (dayNumber) {
            return `day-${dayNumber.toString().padStart(2, '0')}-${type}`;
        } else if (week && day) {
            return `week-${week.toString().padStart(2, '0')}-${day.toLowerCase()}-${type}`;
        } else {
            return `${type}-${Date.now()}`;
        }
    }

    inferDomain(video) {
        const { title, content, ecoTasks } = video;
        
        // Simple domain inference based on keywords
        const peopleKeywords = ['team', 'leadership', 'conflict', 'stakeholder', 'communication'];
        const processKeywords = ['planning', 'execution', 'monitoring', 'risk', 'quality', 'scope'];
        const businessKeywords = ['business', 'value', 'strategy', 'compliance', 'organizational'];
        
        const text = `${title} ${content || ''} ${(ecoTasks || []).join(' ')}`.toLowerCase();
        
        const peopleScore = peopleKeywords.reduce((score, keyword) => 
            score + (text.includes(keyword) ? 1 : 0), 0);
        const processScore = processKeywords.reduce((score, keyword) => 
            score + (text.includes(keyword) ? 1 : 0), 0);
        const businessScore = businessKeywords.reduce((score, keyword) => 
            score + (text.includes(keyword) ? 1 : 0), 0);
        
        if (peopleScore > processScore && peopleScore > businessScore) return 'People';
        if (processScore > businessScore) return 'Process';
        if (businessScore > 0) return 'Business Environment';
        
        return 'Mixed';
    }

    updateSummary(summary, weekMetadata) {
        summary.totalVideos += weekMetadata.videos.length;
        
        weekMetadata.videos.forEach(video => {
            // Count by type
            const type = video.basic.type;
            summary.byType[type] = (summary.byType[type] || 0) + 1;
            
            // Count by domain
            const domain = video.basic.domain;
            summary.byDomain[domain] = (summary.byDomain[domain] || 0) + 1;
            
            // Count by week
            const week = video.basic.week;
            summary.byWeek[week] = (summary.byWeek[week] || 0) + 1;
        });
    }

    generatePlaylistDescription(playlist) {
        const descriptions = {
            'main-course': 'Complete 13-week PMP certification preparation course. Follow this playlist in order for systematic exam preparation.',
            'practice-sessions': 'PMP practice scenarios and exam-style questions to test your knowledge and build confidence.',
            'weekly-reviews': 'Weekly review sessions to consolidate learning and prepare for the next week of study.'
        };
        
        return descriptions[playlist.id] || `${playlist.name} - Part of the comprehensive PMP exam preparation program.`;
    }

    getPlaylistCategory(playlist) {
        if (playlist.id.includes('practice')) return 'practice';
        if (playlist.id.includes('review')) return 'review';
        if (playlist.id.includes('domain')) return 'domain';
        if (playlist.id.includes('week')) return 'weekly';
        return 'general';
    }

    getThumbnailTemplate(video) {
        return {
            background: video.basic.thumbnailColor,
            text: video.basic.dayNumber ? `Day ${video.basic.dayNumber}` : `Week ${video.basic.week}`,
            subtitle: video.basic.domain || video.basic.type
        };
    }

    generateSEORecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.overview.averageSEOScore < 80) {
            recommendations.push('Consider improving keyword optimization across videos');
        }
        
        // Add more recommendation logic here
        
        return recommendations;
    }
}

module.exports = MetadataBatchProcessor;