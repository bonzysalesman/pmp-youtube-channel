#!/usr/bin/env node

/**
 * Upload Automation System
 * Handles automated daily uploads with calendar-based scheduling
 */

const YouTubeAPIManager = require('./youtube-api-manager');
const ContentCalendarManager = require('./content-calendar-manager');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');

class UploadAutomation {
  constructor() {
    this.youtubeManager = new YouTubeAPIManager();
    this.calendarManager = new ContentCalendarManager();
    this.uploadQueue = [];
    this.isProcessing = false;
  }

  async initialize() {
    await this.youtubeManager.initialize();
    await this.calendarManager.initialize();
    console.log('Upload Automation System initialized');
  }

  /**
     * Schedule uploads for entire 13-week cycle
     */
  async scheduleFullCycle(startDate, videoDirectory, thumbnailDirectory) {
    console.log(`Scheduling full 13-week cycle starting ${startDate}`);
        
    const calendar = await this.calendarManager.generateContentCalendar();
    const schedules = [];
    const currentDate = new Date(startDate);
        
    for (const week of calendar) {
      for (const video of week.videos) {
        const videoFile = path.join(videoDirectory, `${video.id}.mp4`);
        const thumbnailFile = path.join(thumbnailDirectory, `${video.id}.png`);
                
        // Check if files exist
        if (!await fs.pathExists(videoFile)) {
          console.warn(`Video file not found: ${videoFile}`);
          continue;
        }
                
        const uploadTime = this.youtubeManager.getOptimalUploadTime(currentDate.getDay());
        const scheduledDateTime = new Date(currentDate);
        const [hours, minutes] = uploadTime.split(':');
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
        const schedule = {
          videoId: video.id,
          videoFile,
          thumbnailFile: await fs.pathExists(thumbnailFile) ? thumbnailFile : null,
          videoData: {
            ...video,
            scheduledPublishTime: scheduledDateTime.toISOString()
          },
          scheduledDate: currentDate.toISOString().split('T')[0],
          scheduledTime: uploadTime,
          status: 'scheduled'
        };
                
        schedules.push(schedule);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
        
    // Save schedule to file
    const scheduleFile = path.join('src/config', 'upload-schedule.json');
    await fs.writeJson(scheduleFile, schedules, { spaces: 2 });
        
    console.log(`✅ Scheduled ${schedules.length} videos for upload`);
    console.log(`📄 Schedule saved to: ${scheduleFile}`);
        
    return schedules;
  }

  /**
     * Process upload queue with rate limiting
     */
  async processUploadQueue() {
    if (this.isProcessing || this.uploadQueue.length === 0) {
      return;
    }
        
    this.isProcessing = true;
    console.log(`Processing ${this.uploadQueue.length} uploads in queue`);
        
    const results = [];
        
    while (this.uploadQueue.length > 0) {
      const uploadItem = this.uploadQueue.shift();
            
      try {
        console.log(`Uploading: ${uploadItem.videoData.title}`);
                
        const result = await this.youtubeManager.uploadVideo(
          uploadItem.videoFile,
          uploadItem.videoData,
          uploadItem.thumbnailFile
        );
                
        results.push({
          success: true,
          videoId: uploadItem.videoId,
          youtubeId: result.videoId,
          title: result.title,
          url: result.url
        });
                
        // Update calendar status
        await this.calendarManager.updateVideoStatus(
          uploadItem.videoId,
          'production_status',
          'published'
        );
                
        console.log(`✅ Successfully uploaded: ${result.title}`);
                
      } catch (error) {
        console.error(`❌ Failed to upload ${uploadItem.videoData.title}:`, error.message);
                
        results.push({
          success: false,
          videoId: uploadItem.videoId,
          title: uploadItem.videoData.title,
          error: error.message
        });
                
        // Update status to failed
        await this.calendarManager.updateVideoStatus(
          uploadItem.videoId,
          'production_status',
          'failed'
        );
      }
            
      // Rate limiting: wait 30 seconds between uploads
      if (this.uploadQueue.length > 0) {
        console.log('Waiting 30 seconds before next upload...');
        await this.delay(30000);
      }
    }
        
    this.isProcessing = false;
        
    // Save results
    const resultsFile = path.join('src/config', `upload-results-${Date.now()}.json`);
    await fs.writeJson(resultsFile, results, { spaces: 2 });
        
    console.log(`Upload batch completed. Results saved to: ${resultsFile}`);
    return results;
  }

  /**
     * Add video to upload queue
     */
  addToQueue(videoFile, videoData, thumbnailFile = null) {
    this.uploadQueue.push({
      videoId: videoData.id,
      videoFile,
      videoData,
      thumbnailFile,
      addedAt: new Date().toISOString()
    });
        
    console.log(`Added to queue: ${videoData.title} (Queue size: ${this.uploadQueue.length})`);
  }

  /**
     * Upload specific week's content
     */
  async uploadWeek(weekNumber, videoDirectory, thumbnailDirectory) {
    console.log(`Preparing to upload Week ${weekNumber} content`);
        
    const weekVideos = await this.getWeekVideos(weekNumber);
    const uploadBatch = [];
        
    for (const video of weekVideos) {
      const videoFile = path.join(videoDirectory, `${video.video_id}.mp4`);
      const thumbnailFile = path.join(thumbnailDirectory, `${video.video_id}.png`);
            
      if (await fs.pathExists(videoFile)) {
        uploadBatch.push({
          videoFile,
          videoData: this.convertDbVideoToUploadData(video),
          thumbnailFile: await fs.pathExists(thumbnailFile) ? thumbnailFile : null
        });
      } else {
        console.warn(`Video file not found: ${videoFile}`);
      }
    }
        
    if (uploadBatch.length === 0) {
      console.log('No videos found for upload');
      return [];
    }
        
    console.log(`Uploading ${uploadBatch.length} videos for Week ${weekNumber}`);
    return await this.youtubeManager.batchUpload(uploadBatch);
  }

  /**
     * Set up automated daily uploads using cron
     */
  setupDailyUploadSchedule() {
    // Schedule daily uploads at 8:30 AM
    cron.schedule('30 8 * * *', async () => {
      console.log('Running daily upload check...');
            
      try {
        const today = new Date().toISOString().split('T')[0];
        const scheduledUploads = await this.getScheduledUploadsForDate(today);
                
        if (scheduledUploads.length > 0) {
          console.log(`Found ${scheduledUploads.length} videos scheduled for today`);
                    
          for (const upload of scheduledUploads) {
            this.addToQueue(
              upload.videoFile,
              upload.videoData,
              upload.thumbnailFile
            );
          }
                    
          await this.processUploadQueue();
        } else {
          console.log('No videos scheduled for today');
        }
                
      } catch (error) {
        console.error('Error in daily upload schedule:', error.message);
      }
    });
        
    console.log('Daily upload schedule activated (8:30 AM daily)');
  }

  /**
     * Get scheduled uploads for specific date
     */
  async getScheduledUploadsForDate(date) {
    const scheduleFile = path.join('src/config', 'upload-schedule.json');
        
    if (!await fs.pathExists(scheduleFile)) {
      return [];
    }
        
    const schedule = await fs.readJson(scheduleFile);
    return schedule.filter(item => 
      item.scheduledDate === date && 
            item.status === 'scheduled'
    );
  }

  /**
     * Get week videos from database
     */
  async getWeekVideos(weekNumber) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM videos WHERE week_number = ? ORDER BY day_number';
      this.calendarManager.db.all(sql, [weekNumber], (err, rows) => {
        if (err) {reject(err);}
        else {resolve(rows);}
      });
    });
  }

  /**
     * Convert database video record to upload data format
     */
  convertDbVideoToUploadData(dbVideo) {
    const workGroup = this.calendarManager.getWorkGroupForWeek(dbVideo.week_number);
        
    return {
      id: dbVideo.video_id,
      week: dbVideo.week_number,
      day: dbVideo.day_number,
      title: dbVideo.title,
      type: dbVideo.video_type,
      duration: dbVideo.duration_minutes,
      workGroup: workGroup.name,
      domain: workGroup.domain,
      privacyStatus: 'public' // or 'private' for scheduled
    };
  }

  /**
     * Generate upload report
     */
  async generateUploadReport() {
    const summary = await this.calendarManager.getWeeklyProductionSummary();
    const workGroupProgress = await this.calendarManager.getWorkGroupProgress();
        
    const report = {
      generatedAt: new Date().toISOString(),
      totalVideos: summary.reduce((sum, week) => sum + week.total_videos, 0),
      publishedVideos: summary.reduce((sum, week) => sum + week.videos_published, 0),
      weeklyBreakdown: summary,
      workGroupProgress,
      queueStatus: {
        queueLength: this.uploadQueue.length,
        isProcessing: this.isProcessing
      }
    };
        
    const reportFile = path.join('src/config', `upload-report-${Date.now()}.json`);
    await fs.writeJson(reportFile, report, { spaces: 2 });
        
    console.log('Upload report generated:', reportFile);
    return report;
  }

  /**
     * Utility function for delays
     */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    await this.youtubeManager.close();
    await this.calendarManager.close();
  }
}

// CLI interface
if (require.main === module) {
  const automation = new UploadAutomation();
  const args = process.argv.slice(2);
  const command = args[0];
    
  automation.initialize().then(async () => {
    try {
      switch (command) {
      case 'schedule':
        await automation.scheduleFullCycle(
          args[1], // start date
          args[2] || 'videos', // video directory
          args[3] || 'generated/thumbnails' // thumbnail directory
        );
        break;
                    
      case 'upload-week':
        await automation.uploadWeek(
          parseInt(args[1]), // week number
          args[2] || 'videos', // video directory
          args[3] || 'generated/thumbnails' // thumbnail directory
        );
        break;
                    
      case 'start-scheduler':
        automation.setupDailyUploadSchedule();
        console.log('Daily upload scheduler started. Press Ctrl+C to stop.');
        break;
                    
      case 'report':
        await automation.generateUploadReport();
        break;
                    
      default:
        console.log(`
Upload Automation CLI

Usage: node upload-automation.js <command> [options]

Commands:
  schedule <start_date> [video_dir] [thumbnail_dir]  Schedule full 13-week cycle
  upload-week <week_number> [video_dir] [thumbnail_dir]  Upload specific week
  start-scheduler                                    Start daily upload scheduler
  report                                            Generate upload report

Examples:
  node upload-automation.js schedule 2024-01-01 ./videos ./thumbnails
  node upload-automation.js upload-week 1 ./videos ./thumbnails
  node upload-automation.js start-scheduler
  node upload-automation.js report
                    `);
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      await automation.close();
      if (command !== 'start-scheduler') {
        process.exit(0);
      }
    }
  });
}

module.exports = UploadAutomation;