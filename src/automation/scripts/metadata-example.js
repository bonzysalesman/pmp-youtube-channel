/**
 * Video Metadata Generator - Example Usage
 * 
 * This file demonstrates how to use the video metadata generator
 * for various scenarios and use cases.
 */

const VideoMetadataGenerator = require('./video-metadata-generator');
const MetadataBatchProcessor = require('./metadata-batch-processor');

async function runExamples() {
  console.log('🎬 Video Metadata Generator - Example Usage');
  console.log('===========================================\n');

  try {
    // Example 1: Generate metadata for a single daily study video
    await example1_SingleDailyStudyVideo();
        
    // Example 2: Generate metadata for a practice session
    await example2_PracticeSession();
        
    // Example 3: Generate metadata for a week of videos
    await example3_WeekOfVideos();
        
    // Example 4: Generate playlist assignments
    await example4_PlaylistAssignments();
        
    // Example 5: Generate SEO-optimized descriptions
    await example5_SEODescriptions();
        
    // Example 6: Batch processing with custom criteria
    await example6_BatchProcessing();
        
    console.log('\n✅ All examples completed successfully!');
        
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

/**
 * Example 1: Generate metadata for a single daily study video
 */
async function example1_SingleDailyStudyVideo() {
  console.log('📚 Example 1: Single Daily Study Video');
  console.log('-------------------------------------');
    
  const generator = new VideoMetadataGenerator();
  await generator.loadConfigurations();
    
  const videoConfig = {
    week: 2,
    day: 'Tuesday',
    dayNumber: 8,
    type: 'daily-study',
    title: 'Day 8: Team Ground Rules That Actually Work | Avoid Team Chaos',
    duration: '15-18 minutes',
    domain: 'People',
    workGroup: 'Building Team',
    content: 'Ground rule categories, facilitation techniques, enforcement',
    ecoTasks: ['Define team ground rules', 'Facilitate team charter creation'],
    learningObjectives: [
      'Create effective team ground rules',
      'Facilitate ground rule establishment sessions',
      'Enforce ground rules consistently and fairly'
    ],
    leadMagnet: 'Team Charter Template',
    communityQuestion: 'What ground rules work best for your teams?'
  };
    
  const metadata = generator.generateVideoMetadata(videoConfig);
    
  console.log(`✓ Generated metadata for: ${metadata.basic.title}`);
  console.log(`  • SEO Score: ${metadata.seo.seoScore}/100`);
  console.log(`  • Keywords: ${metadata.keywords.slice(0, 5).join(', ')}`);
  console.log(`  • Playlists: ${metadata.playlists.length}`);
  console.log(`  • Thumbnail Color: ${metadata.basic.thumbnailColor}`);
    
  // Show timestamp structure
  console.log('  • Timestamps:');
  Object.entries(metadata.timestamps.structure).forEach(([section, timing]) => {
    console.log(`    - ${timing.label}: ${Math.floor(timing.start/60)}:${(timing.start%60).toString().padStart(2,'0')} - ${Math.floor(timing.end/60)}:${(timing.end%60).toString().padStart(2,'0')}`);
  });
    
  console.log('');
}

/**
 * Example 2: Generate metadata for a practice session
 */
async function example2_PracticeSession() {
  console.log('🎯 Example 2: Practice Session Video');
  console.log('-----------------------------------');
    
  const generator = new VideoMetadataGenerator();
  await generator.loadConfigurations();
    
  const videoConfig = {
    week: 2,
    day: 'Saturday',
    type: 'practice',
    title: 'Week 2 Practice: People Domain Scenarios | Team Leadership',
    duration: '20-25 minutes',
    domain: 'People',
    workGroup: 'Building Team',
    ecoTasks: ['Manage conflict', 'Lead a team', 'Empower team members'],
    learningObjectives: [
      'Apply team leadership concepts through scenarios',
      'Practice conflict resolution techniques',
      'Build confidence in People domain questions'
    ]
  };
    
  const metadata = generator.generateVideoMetadata(videoConfig);
    
  console.log(`✓ Generated metadata for: ${metadata.basic.title}`);
  console.log('  • Practice Scenarios: 3 scenarios included');
  console.log(`  • Domain Focus: ${metadata.basic.domain}`);
  console.log(`  • Target Keywords: ${metadata.seo.primaryKeywords.join(', ')}`);
    
  // Show practice-specific timestamps
  console.log('  • Practice Structure:');
  const timestamps = metadata.timestamps.structure;
  if (timestamps.scenario1) {
    console.log(`    - Scenario 1: ${Math.floor(timestamps.scenario1.duration/60)} minutes`);
    console.log(`    - Scenario 2: ${Math.floor(timestamps.scenario2.duration/60)} minutes`);
    console.log(`    - Scenario 3: ${Math.floor(timestamps.scenario3.duration/60)} minutes`);
  }
    
  console.log('');
}

/**
 * Example 3: Generate metadata for a week of videos
 */
async function example3_WeekOfVideos() {
  console.log('📅 Example 3: Week of Videos');
  console.log('----------------------------');
    
  const batchProcessor = new MetadataBatchProcessor();
  const weekVideos = await batchProcessor.processVideosByCriteria({ week: 1 });
    
  console.log(`✓ Generated metadata for Week 1: ${weekVideos.length} videos`);
    
  weekVideos.forEach((video, index) => {
    console.log(`  ${index + 1}. ${video.basic.title}`);
    console.log(`     • Type: ${video.basic.type}`);
    console.log(`     • Duration: ${video.basic.duration}`);
    console.log(`     • Playlists: ${video.playlists.length}`);
  });
    
  console.log('');
}

/**
 * Example 4: Generate playlist assignments
 */
async function example4_PlaylistAssignments() {
  console.log('📋 Example 4: Playlist Assignments');
  console.log('----------------------------------');
    
  const generator = new VideoMetadataGenerator();
  await generator.loadConfigurations();
    
  const videoConfig = {
    week: 5,
    dayNumber: 29,
    type: 'daily-study',
    domain: 'Process',
    workGroup: 'Starting Project',
    title: 'Day 29: Project Integration Management',
    duration: '15-18 minutes'
  };
    
  const metadata = generator.generateVideoMetadata(videoConfig);
    
  console.log(`✓ Playlist assignments for: ${metadata.basic.title}`);
  metadata.playlists.forEach((playlist, index) => {
    console.log(`  ${index + 1}. ${playlist.name}`);
    console.log(`     • ID: ${playlist.id}`);
    console.log(`     • Order: ${playlist.order}`);
    console.log(`     • Priority: ${playlist.priority}`);
  });
    
  console.log('');
}

/**
 * Example 5: Generate SEO-optimized descriptions
 */
async function example5_SEODescriptions() {
  console.log('🔍 Example 5: SEO-Optimized Descriptions');
  console.log('----------------------------------------');
    
  const generator = new VideoMetadataGenerator();
  await generator.loadConfigurations();
    
  const videoConfig = {
    week: 3,
    dayNumber: 15,
    type: 'daily-study',
    title: 'Day 15: Risk Management Fundamentals | PMP Exam Prep',
    domain: 'Process',
    duration: '15-18 minutes',
    ecoTasks: ['Identify risks', 'Analyze risks', 'Plan risk responses'],
    learningObjectives: [
      'Understand risk management processes',
      'Learn risk identification techniques',
      'Practice risk analysis methods'
    ],
    studyTip: 'Focus on the difference between risks and issues'
  };
    
  const metadata = generator.generateVideoMetadata(videoConfig);
    
  console.log(`✓ SEO analysis for: ${metadata.basic.title}`);
  console.log(`  • SEO Score: ${metadata.seo.seoScore}/100`);
  console.log(`  • Primary Keywords: ${metadata.seo.primaryKeywords.join(', ')}`);
  console.log(`  • Long-tail Keywords: ${metadata.seo.longTailKeywords.join(', ')}`);
  console.log(`  • Hashtags: ${metadata.hashtags.slice(0, 5).join(' ')}`);
    
  // Show description preview
  console.log('\n  📝 Description Preview:');
  const descriptionLines = metadata.description.split('\n');
  descriptionLines.slice(0, 5).forEach(line => {
    console.log(`     ${line}`);
  });
  console.log('     ...');
    
  console.log('');
}

/**
 * Example 6: Batch processing with custom criteria
 */
async function example6_BatchProcessing() {
  console.log('⚡ Example 6: Batch Processing');
  console.log('-----------------------------');
    
  const batchProcessor = new MetadataBatchProcessor();
    
  // Process all practice sessions
  const practiceVideos = await batchProcessor.processVideosByCriteria({ 
    type: 'practice' 
  });
    
  console.log(`✓ Processed ${practiceVideos.length} practice session videos`);
    
  // Process all People domain videos
  const peopleVideos = await batchProcessor.processVideosByCriteria({ 
    domain: 'People' 
  });
    
  console.log(`✓ Processed ${peopleVideos.length} People domain videos`);
    
  // Process videos from weeks 1-3
  const earlyWeekVideos = await batchProcessor.processVideosByCriteria({ 
    dayRange: { min: 1, max: 21 } 
  });
    
  console.log(`✓ Processed ${earlyWeekVideos.length} videos from weeks 1-3`);
    
  // Generate upload batch for practice videos
  const uploadBatch = batchProcessor.generateUploadBatch(practiceVideos);
    
  console.log(`✓ Generated upload batch with ${uploadBatch.totalVideos} videos`);
  console.log(`  • Batch ID: ${uploadBatch.batchId}`);
  console.log('  • Category: Education (ID: 27)');
  console.log('  • Privacy: Public');
    
  console.log('');
}

/**
 * Utility function to demonstrate metadata structure
 */
function showMetadataStructure(metadata) {
  console.log('📊 Metadata Structure:');
  console.log(`  • Basic Info: ${Object.keys(metadata.basic).length} fields`);
  console.log(`  • SEO Data: ${Object.keys(metadata.seo).length} fields`);
  console.log(`  • Timestamps: ${Object.keys(metadata.timestamps.structure).length} sections`);
  console.log(`  • Keywords: ${metadata.keywords.length} keywords`);
  console.log(`  • Hashtags: ${metadata.hashtags.length} hashtags`);
  console.log(`  • Playlists: ${metadata.playlists.length} assignments`);
  console.log(`  • Description: ${metadata.description.length} characters`);
}

// Run examples if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  runExamples,
  example1_SingleDailyStudyVideo,
  example2_PracticeSession,
  example3_WeekOfVideos,
  example4_PlaylistAssignments,
  example5_SEODescriptions,
  example6_BatchProcessing
};