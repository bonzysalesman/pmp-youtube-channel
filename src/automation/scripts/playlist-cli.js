#!/usr/bin/env node

/**
 * Playlist Management CLI
 * Command-line interface for managing YouTube playlists
 */

const PlaylistManager = require('./playlist-manager');
const fs = require('fs-extra');
const path = require('path');

class PlaylistCLI {
  constructor() {
    this.manager = new PlaylistManager();
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      await this.manager.initialize();

      switch (command) {
      case 'create-all':
        await this.createAllPlaylists();
        break;
      case 'organize':
        await this.organizeVideos(args[1]);
        break;
      case 'update-descriptions':
        await this.updateDescriptions();
        break;
      case 'list':
        await this.listPlaylists();
        break;
      case 'add-video':
        await this.addVideoToPlaylist(args[1], args[2], args[3]);
        break;
      case 'export':
        await this.exportPlaylistData(args[1]);
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

  async createAllPlaylists() {
    console.log('🎬 Creating all playlists for PMP YouTube channel...\n');
        
    const playlists = await this.manager.createAllPlaylists();
        
    console.log('\n📊 Playlist Creation Summary:');
    console.log(`✅ Main Study Plan: ${playlists.main.title}`);
    console.log(`   URL: ${playlists.main.url}\n`);
        
    console.log('✅ Work Group Playlists:');
    Object.entries(playlists.workGroups).forEach(([group, data]) => {
      console.log(`   ${group}: ${data.title}`);
      console.log(`   URL: ${data.url}`);
    });
        
    console.log('\n✅ Domain Playlists:');
    Object.entries(playlists.domains).forEach(([domain, data]) => {
      console.log(`   ${domain}: ${data.title}`);
      console.log(`   URL: ${data.url}`);
    });
        
    console.log('\n✅ Content Type Playlists:');
    Object.entries(playlists.contentTypes).forEach(([type, data]) => {
      console.log(`   ${type}: ${data.title}`);
      console.log(`   URL: ${data.url}`);
    });
        
    console.log('\n🎯 Next Steps:');
    console.log('1. Upload your videos using the upload automation system');
    console.log('2. Run "npm run playlist organize <video-mappings.json>" to add videos to playlists');
    console.log('3. Use "npm run playlist update-descriptions" to add progress tracking');
  }

  async organizeVideos(mappingFile) {
    if (!mappingFile) {
      console.error('Usage: npm run playlist organize <video-mappings.json>');
      console.error('The mapping file should contain: {"video_id": "youtube_video_id", ...}');
      return;
    }

    if (!await fs.pathExists(mappingFile)) {
      console.error(`Mapping file not found: ${mappingFile}`);
      return;
    }

    console.log(`📋 Organizing videos into playlists using ${mappingFile}...\n`);
        
    const videoMappings = await fs.readJson(mappingFile);
    const videoCount = Object.keys(videoMappings).length;
        
    console.log(`Found ${videoCount} video mappings`);
        
    await this.manager.organizeVideosIntoPlaylists(videoMappings);
        
    console.log('\n✅ Video organization completed!');
    console.log('All videos have been added to their respective playlists:');
    console.log('• Main 13-Week Study Plan (chronological order)');
    console.log('• Work Group playlists (by weeks)');
    console.log('• Domain playlists (by content focus)');
    console.log('• Content Type playlists (by video type)');
  }

  async updateDescriptions() {
    console.log('📝 Updating playlist descriptions with progress tracking...\n');
        
    await this.manager.updatePlaylistDescriptions();
        
    console.log('✅ Playlist descriptions updated with current progress!');
    console.log('Descriptions now include:');
    console.log('• Current video count and completion percentage');
    console.log('• Work group specific progress');
    console.log('• Updated study guidance');
  }

  async listPlaylists() {
    const playlistFile = path.join('src/config', 'playlists.json');
        
    if (!await fs.pathExists(playlistFile)) {
      console.log('❌ No playlists found. Run "npm run playlist create-all" first.');
      return;
    }
        
    const playlists = await fs.readJson(playlistFile);
        
    console.log('📋 Current Playlists:\n');
        
    console.log('🎯 Main Playlist:');
    console.log(`   ${playlists.main.title}`);
    console.log(`   ID: ${playlists.main.id}`);
    console.log(`   URL: ${playlists.main.url}\n`);
        
    console.log('👥 Work Group Playlists:');
    Object.entries(playlists.workGroups).forEach(([group, data]) => {
      console.log(`   ${group}:`);
      console.log(`     Title: ${data.title}`);
      console.log(`     ID: ${data.id}`);
      console.log(`     URL: ${data.url}`);
    });
        
    console.log('\n📚 Domain Playlists:');
    Object.entries(playlists.domains).forEach(([domain, data]) => {
      console.log(`   ${domain}:`);
      console.log(`     Title: ${data.title}`);
      console.log(`     ID: ${data.id}`);
      console.log(`     URL: ${data.url}`);
    });
        
    console.log('\n🎬 Content Type Playlists:');
    Object.entries(playlists.contentTypes).forEach(([type, data]) => {
      console.log(`   ${type}:`);
      console.log(`     Title: ${data.title}`);
      console.log(`     ID: ${data.id}`);
      console.log(`     URL: ${data.url}`);
    });
  }

  async addVideoToPlaylist(playlistId, videoId, position) {
    if (!playlistId || !videoId) {
      console.error('Usage: npm run playlist add-video <playlist_id> <video_id> [position]');
      return;
    }

    console.log(`Adding video ${videoId} to playlist ${playlistId}...`);
        
    const pos = position ? parseInt(position) : null;
    await this.manager.addVideoToPlaylist(playlistId, videoId, pos);
        
    console.log('✅ Video added to playlist successfully!');
  }

  async exportPlaylistData(format = 'json') {
    const playlistFile = path.join('src/config', 'playlists.json');
        
    if (!await fs.pathExists(playlistFile)) {
      console.log('❌ No playlists found. Run "npm run playlist create-all" first.');
      return;
    }
        
    const playlists = await fs.readJson(playlistFile);
    const exportFile = path.join('src/config', `playlist-export.${format}`);
        
    if (format === 'csv') {
      // Export as CSV
      const csvData = [];
      csvData.push('Category,Name,Title,ID,URL');
            
      // Main playlist
      csvData.push([
        'Main',
        'Study Plan',
        `"${playlists.main.title}"`,
        playlists.main.id,
        playlists.main.url
      ].join(','));
            
      // Work group playlists
      Object.entries(playlists.workGroups).forEach(([group, data]) => {
        csvData.push([
          'Work Group',
          `"${group}"`,
          `"${data.title}"`,
          data.id,
          data.url
        ].join(','));
      });
            
      // Domain playlists
      Object.entries(playlists.domains).forEach(([domain, data]) => {
        csvData.push([
          'Domain',
          `"${domain}"`,
          `"${data.title}"`,
          data.id,
          data.url
        ].join(','));
      });
            
      // Content type playlists
      Object.entries(playlists.contentTypes).forEach(([type, data]) => {
        csvData.push([
          'Content Type',
          `"${type}"`,
          `"${data.title}"`,
          data.id,
          data.url
        ].join(','));
      });
            
      await fs.writeFile(exportFile, csvData.join('\n'));
    } else {
      // Export as JSON
      await fs.writeJson(exportFile, playlists, { spaces: 2 });
    }
        
    console.log(`✅ Playlist data exported to: ${exportFile}`);
  }

  showHelp() {
    console.log(`
🎬 Playlist Management CLI

Usage: npm run playlist <command> [options]

Commands:
  create-all                           Create all playlists (main, work groups, domains, types)
  organize <video-mappings.json>       Add videos to playlists using mapping file
  update-descriptions                  Update playlist descriptions with progress tracking
  list                                List all created playlists with IDs and URLs
  add-video <playlist_id> <video_id> [position]  Add single video to playlist
  export [format]                     Export playlist data (json|csv, default: json)

Examples:
  npm run playlist create-all
  npm run playlist organize video-mappings.json
  npm run playlist update-descriptions
  npm run playlist list
  npm run playlist add-video PLxxx... dQw4w9WgXcQ 0
  npm run playlist export csv

Video Mapping File Format:
{
  "w01_d1": "dQw4w9WgXcQ",
  "w01_d2": "oHg5SJYRHA0",
  ...
}

Playlist Structure:
• Main: Complete 13-week study plan (91 videos)
• Work Groups: 6 playlists by learning phases
• Domains: 3 playlists by PMP exam domains  
• Content Types: 4 playlists by video type
        `);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new PlaylistCLI();
  cli.run().catch(console.error);
}

module.exports = PlaylistCLI;