#!/usr/bin/env node

/**
 * Upload Scheduler Script
 * Manages YouTube upload scheduling and metadata optimization
 */

const fs = require('fs');
const path = require('path');

class UploadScheduler {
  constructor() {
    this.configPath = path.join(__dirname, '../../config/upload-schedule.json');
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.channelId = process.env.YOUTUBE_CHANNEL_ID;
  }

  /**
   * Load upload schedule configuration
   */
  loadSchedule() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error('Error loading upload schedule:', error.message);
      return null;
    }
  }

  /**
   * Calculate optimal upload time based on audience analytics
   */
  calculateOptimalUploadTime(baseDate, contentType) {
    const schedule = {
      'daily-study': { hour: 6, minute: 0 }, // 6:00 AM
      'practice': { hour: 12, minute: 0 },   // 12:00 PM  
      'review': { hour: 18, minute: 0 }      // 6:00 PM
    };

    const uploadTime = new Date(baseDate);
    const timeSlot = schedule[contentType] || schedule['daily-study'];
    
    uploadTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
    
    return uploadTime;
  }

  /**
   * Generate upload metadata for YouTube API
   */
  generateUploadMetadata(videoData) {
    return {
      snippet: {
        title: videoData.title,
        description: videoData.description,
        tags: videoData.keywords,
        categoryId: '27', // Education category
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en'
      },
      status: {
        privacyStatus: 'public',
        publishAt: videoData.scheduledTime.toISOString(),
        selfDeclaredMadeForKids: false
      },
      recordingDetails: {
        recordingDate: new Date().toISOString()
      }
    };
  }

  /**
   * Create batch upload schedule for a week
   */
  createWeeklySchedule(weekNumber, startDate) {
    const schedule = [];
    const weekData = this.loadWeekContent(weekNumber);
    
    if (!weekData) {
      console.error(`No content data found for week ${weekNumber}`);
      return [];
    }

    // Monday: Week Overview
    const mondayDate = new Date(startDate);
    schedule.push({
      date: mondayDate,
      contentType: 'daily-study',
      title: `Week ${weekNumber} Overview: ${weekData.theme}`,
      videoFile: `week-${weekNumber}/monday-overview.mp4`,
      scheduledTime: this.calculateOptimalUploadTime(mondayDate, 'daily-study')
    });

    // Tuesday-Friday: Daily Lessons
    for (let day = 2; day <= 5; day++) {
      const lessonDate = new Date(startDate);
      lessonDate.setDate(lessonDate.getDate() + (day - 1));
      
      schedule.push({
        date: lessonDate,
        contentType: 'daily-study',
        title: `Day ${day}: ${weekData.days[day - 1].topic}`,
        videoFile: `week-${weekNumber}/day-${day}-lesson.mp4`,
        scheduledTime: this.calculateOptimalUploadTime(lessonDate, 'daily-study')
      });
    }

    // Saturday: Practice Session
    const saturdayDate = new Date(startDate);
    saturdayDate.setDate(saturdayDate.getDate() + 5);
    schedule.push({
      date: saturdayDate,
      contentType: 'practice',
      title: `Week ${weekNumber} Practice: ${weekData.practiceTheme}`,
      videoFile: `week-${weekNumber}/saturday-practice.mp4`,
      scheduledTime: this.calculateOptimalUploadTime(saturdayDate, 'practice')
    });

    // Sunday: Weekly Review
    const sundayDate = new Date(startDate);
    sundayDate.setDate(sundayDate.getDate() + 6);
    schedule.push({
      date: sundayDate,
      contentType: 'review',
      title: `Week ${weekNumber} Review & Next Week Preview`,
      videoFile: `week-${weekNumber}/sunday-review.mp4`,
      scheduledTime: this.calculateOptimalUploadTime(sundayDate, 'review')
    });

    return schedule;
  }

  /**
   * Load week content data
   */
  loadWeekContent(weekNumber) {
    try {
      const contentPath = path.join(__dirname, `../../config/week-${weekNumber}-content.json`);
      return JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    } catch (error) {
      console.error(`Error loading week ${weekNumber} content:`, error.message);
      return null;
    }
  }

  /**
   * Save upload schedule to file
   */
  saveSchedule(schedule, weekNumber) {
    const outputPath = path.join(__dirname, `../../generated/upload-schedule-week-${weekNumber}.json`);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(schedule, null, 2));
    console.log(`Upload schedule saved to ${outputPath}`);
  }

  /**
   * Generate complete 13-week upload schedule
   */
  generateFullSchedule(startDate) {
    const fullSchedule = [];
    const baseDate = new Date(startDate);

    for (let week = 1; week <= 13; week++) {
      const weekStartDate = new Date(baseDate);
      weekStartDate.setDate(baseDate.getDate() + ((week - 1) * 7));
      
      const weekSchedule = this.createWeeklySchedule(week, weekStartDate);
      fullSchedule.push({
        week: week,
        startDate: weekStartDate,
        uploads: weekSchedule
      });
    }

    // Save complete schedule
    const outputPath = path.join(__dirname, '../../generated/complete-upload-schedule.json');
    fs.writeFileSync(outputPath, JSON.stringify(fullSchedule, null, 2));
    
    console.log('Complete 13-week upload schedule generated!');
    console.log(`Total videos scheduled: ${fullSchedule.reduce((total, week) => total + week.uploads.length, 0)}`);
    
    return fullSchedule;
  }

  /**
   * Validate upload schedule for conflicts
   */
  validateSchedule(schedule) {
    const conflicts = [];
    const uploadTimes = new Map();

    schedule.forEach(week => {
      week.uploads.forEach(upload => {
        const timeKey = upload.scheduledTime.toISOString();
        if (uploadTimes.has(timeKey)) {
          conflicts.push({
            time: timeKey,
            videos: [uploadTimes.get(timeKey), upload.title]
          });
        } else {
          uploadTimes.set(timeKey, upload.title);
        }
      });
    });

    if (conflicts.length > 0) {
      console.warn('Schedule conflicts detected:');
      conflicts.forEach(conflict => {
        console.warn(`  ${conflict.time}: ${conflict.videos.join(' vs ')}`);
      });
    }

    return conflicts.length === 0;
  }
}

// CLI usage
if (require.main === module) {
  const scheduler = new UploadScheduler();
  
  const command = process.argv[2];
  const startDate = process.argv[3];

  switch (command) {
    case 'generate':
      if (!startDate) {
        console.error('Please specify start date: node upload-scheduler.js generate 2024-01-01');
        process.exit(1);
      }
      scheduler.generateFullSchedule(startDate);
      break;
    
    case 'week':
      const weekNumber = process.argv[3];
      const weekStartDate = process.argv[4];
      if (!weekNumber || !weekStartDate) {
        console.error('Usage: node upload-scheduler.js week <number> <start-date>');
        process.exit(1);
      }
      const weekSchedule = scheduler.createWeeklySchedule(parseInt(weekNumber), weekStartDate);
      scheduler.saveSchedule(weekSchedule, weekNumber);
      break;
    
    default:
      console.log('Usage:');
      console.log('  node upload-scheduler.js generate <start-date>     # Generate full 13-week schedule');
      console.log('  node upload-scheduler.js week <num> <start-date>   # Generate specific week');
  }
}

module.exports = UploadScheduler;