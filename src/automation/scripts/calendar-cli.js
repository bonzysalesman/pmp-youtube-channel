#!/usr/bin/env node

/**
 * Content Calendar CLI Tool
 * Command-line interface for managing the 13-week content calendar
 */

const ContentCalendarManager = require('./content-calendar-manager');
const fs = require('fs-extra');
const path = require('path');

class CalendarCLI {
    constructor() {
        this.manager = new ContentCalendarManager();
    }

    async run() {
        const args = process.argv.slice(2);
        const command = args[0];

        try {
            await this.manager.initialize();

            switch (command) {
                case 'generate':
                    await this.generateCalendar();
                    break;
                case 'status':
                    await this.showStatus(args[1]);
                    break;
                case 'update':
                    await this.updateStatus(args[1], args[2], args[3]);
                    break;
                case 'schedule':
                    await this.scheduleUploads(args[1], args[2]);
                    break;
                case 'summary':
                    await this.showSummary();
                    break;
                case 'export':
                    await this.exportCalendar(args[1]);
                    break;
                default:
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        } finally {
            await this.manager.close();
        }
    }

    async generateCalendar() {
        console.log('Generating 13-week content calendar...');
        const calendar = await this.manager.generateContentCalendar();
        await this.manager.insertCalendarToDatabase(calendar);
        
        console.log('\n📅 Content Calendar Generated Successfully!');
        console.log(`✅ ${calendar.length} weeks planned`);
        console.log(`✅ ${calendar.reduce((total, week) => total + week.videos.length, 0)} videos scheduled`);
        
        // Show work group breakdown
        console.log('\n📊 Work Group Breakdown:');
        const workGroups = {};
        calendar.forEach(week => {
            const group = week.workGroup;
            if (!workGroups[group]) {
                workGroups[group] = { weeks: [], videos: 0 };
            }
            workGroups[group].weeks.push(week.week);
            workGroups[group].videos += week.videos.length;
        });
        
        Object.entries(workGroups).forEach(([group, data]) => {
            console.log(`  ${group}: Weeks ${data.weeks.join(', ')} (${data.videos} videos)`);
        });
    }

    async showStatus(filter) {
        if (filter) {
            const videos = await this.manager.getVideosByStatus('production_status', filter);
            console.log(`\n📹 Videos with status: ${filter}`);
            videos.forEach(video => {
                console.log(`  Week ${video.week_number} Day ${video.day_number}: ${video.title}`);
            });
        } else {
            const summary = await this.manager.getWeeklyProductionSummary();
            console.log('\n📊 Weekly Production Status:');
            console.log('Week | Total | Scripts | Published | Thumbnails');
            console.log('-----|-------|---------|-----------|----------');
            summary.forEach(week => {
                console.log(
                    `${week.week_number.toString().padStart(4)} | ` +
                    `${week.total_videos.toString().padStart(5)} | ` +
                    `${week.scripts_complete.toString().padStart(7)} | ` +
                    `${week.videos_published.toString().padStart(9)} | ` +
                    `${week.thumbnails_ready.toString().padStart(10)}`
                );
            });
        }
    }

    async updateStatus(videoId, statusType, newStatus) {
        if (!videoId || !statusType || !newStatus) {
            console.error('Usage: npm run calendar update <video_id> <status_type> <new_status>');
            console.error('Status types: script_status, production_status, thumbnail_status');
            return;
        }

        await this.manager.updateVideoStatus(videoId, statusType, newStatus);
        console.log(`✅ Updated ${videoId} ${statusType} to ${newStatus}`);
    }

    async scheduleUploads(startDate, timeSlot = '09:00') {
        if (!startDate) {
            console.error('Usage: npm run calendar schedule <start_date> [time_slot]');
            console.error('Example: npm run calendar schedule 2024-01-01 09:00');
            return;
        }

        console.log(`📅 Scheduling uploads starting ${startDate} at ${timeSlot}...`);
        const schedules = await this.manager.scheduleUploads(startDate, timeSlot);
        
        // Save schedule to file
        const scheduleFile = path.join('src/config', 'upload-schedule.json');
        await fs.writeJson(scheduleFile, schedules, { spaces: 2 });
        
        console.log(`✅ Generated upload schedule for ${schedules.length} videos`);
        console.log(`📄 Schedule saved to: ${scheduleFile}`);
        
        // Show first week as preview
        console.log('\n📋 First Week Preview:');
        schedules.slice(0, 7).forEach(schedule => {
            console.log(`  ${schedule.scheduledDate} ${schedule.scheduledTime}: ${schedule.title}`);
        });
    }

    async showSummary() {
        console.log('\n📊 Content Calendar Summary\n');
        
        // Weekly summary
        const weeklySummary = await this.manager.getWeeklyProductionSummary();
        const totalVideos = weeklySummary.reduce((sum, week) => sum + week.total_videos, 0);
        const totalPublished = weeklySummary.reduce((sum, week) => sum + week.videos_published, 0);
        const totalScripts = weeklySummary.reduce((sum, week) => sum + week.scripts_complete, 0);
        
        console.log('📈 Overall Progress:');
        console.log(`  Total Videos: ${totalVideos}`);
        console.log(`  Scripts Complete: ${totalScripts} (${Math.round(totalScripts/totalVideos*100)}%)`);
        console.log(`  Videos Published: ${totalPublished} (${Math.round(totalPublished/totalVideos*100)}%)`);
        
        // Work group progress
        console.log('\n🎯 Work Group Progress:');
        const workGroupProgress = await this.manager.getWorkGroupProgress();
        Object.entries(workGroupProgress).forEach(([group, data]) => {
            console.log(`  ${group}:`);
            console.log(`    Weeks: ${data.weeks.join(', ')}`);
            console.log(`    Videos: ${data.published}/${data.total_videos} published (${Math.round(data.completionRate)}%)`);
            console.log(`    Domain: ${data.domain} (${data.color} theme)`);
        });
    }

    async exportCalendar(format = 'json') {
        const calendar = await this.manager.generateContentCalendar();
        const exportFile = path.join('src/config', `content-calendar.${format}`);
        
        if (format === 'csv') {
            // Export as CSV
            const csvData = [];
            csvData.push('Week,Day,Video ID,Title,Type,Duration,Work Group,Domain,Status');
            
            calendar.forEach(week => {
                week.videos.forEach(video => {
                    csvData.push([
                        video.week,
                        video.day,
                        video.id,
                        `"${video.title}"`,
                        video.type,
                        video.duration,
                        `"${video.workGroup}"`,
                        video.domain,
                        video.status
                    ].join(','));
                });
            });
            
            await fs.writeFile(exportFile, csvData.join('\n'));
        } else {
            // Export as JSON
            await fs.writeJson(exportFile, calendar, { spaces: 2 });
        }
        
        console.log(`✅ Calendar exported to: ${exportFile}`);
    }

    showHelp() {
        console.log(`
📅 Content Calendar Management CLI

Usage: npm run calendar <command> [options]

Commands:
  generate                    Generate complete 13-week calendar and insert to database
  status [filter]            Show production status (optionally filter by status)
  update <id> <type> <status> Update video status
  schedule <date> [time]      Generate upload schedule starting from date
  summary                     Show comprehensive calendar summary
  export [format]             Export calendar (json|csv, default: json)

Examples:
  npm run calendar generate
  npm run calendar status planning
  npm run calendar update w01_d1 production_status recording
  npm run calendar schedule 2024-01-01 09:00
  npm run calendar summary
  npm run calendar export csv

Status Types:
  script_status: pending, draft, review, final
  production_status: planning, recording, editing, published
  thumbnail_status: pending, draft, approved
        `);
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new CalendarCLI();
    cli.run().catch(console.error);
}

module.exports = CalendarCLI;