#!/usr/bin/env node

const { Command } = require('commander');
const SEOOptimizationEngine = require('./seo-optimization-engine');
const SEOMonitoringSystem = require('./seo-monitoring-system');
const ABTestingFramework = require('./ab-testing-framework');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();

program
  .name('seo-cli')
  .description('SEO optimization and monitoring CLI for PMP YouTube channel')
  .version('1.0.0');

// Initialize systems
let seoEngine, seoMonitoring, abTesting;

async function initializeSystems() {
  try {
    seoEngine = new SEOOptimizationEngine();
    seoMonitoring = new SEOMonitoringSystem();
    abTesting = new ABTestingFramework();
    
    await Promise.all([
      seoEngine.initialize(),
      seoMonitoring.initialize(),
      abTesting.initializeFramework()
    ]);
    
    console.log('✅ SEO systems initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing SEO systems:', error.message);
    process.exit(1);
  }
}

// Keyword ranking tracking command
program
  .command('track-rankings')
  .description('Track keyword rankings for target keywords')
  .option('-k, --keywords <keywords>', 'Comma-separated list of keywords to track')
  .option('-o, --output <file>', 'Output file for results')
  .action(async (options) => {
    await initializeSystems();
    
    try {
      const keywords = options.keywords ? options.keywords.split(',').map(k => k.trim()) : null;
      console.log('🔍 Tracking keyword rankings...');
      
      const results = await seoMonitoring.trackKeywordRankings(keywords);
      
      console.log(`\n📊 Ranking Results (${results.length} keywords tracked):`);
      results.forEach(result => {
        if (result.error) {
          console.log(`❌ ${result.keyword}: Error - ${result.error}`);
        } else {
          console.log(`📈 ${result.keyword}: Position ${result.position} | CTR: ${(result.ctr * 100).toFixed(2)}% | Impressions: ${result.impressions}`);
        }
      });
      
      if (options.output) {
        await fs.writeJson(options.output, results, { spaces: 2 });
        console.log(`\n💾 Results saved to ${options.output}`);
      }
    } catch (error) {
      console.error('❌ Error tracking rankings:', error.message);
      process.exit(1);
    }
  });

// CTR monitoring command
program
  .command('monitor-ctr')
  .description('Monitor click-through rates and generate optimization alerts')
  .option('-d, --days <days>', 'Number of days to analyze', '7')
  .action(async (options) => {
    await initializeSystems();
    
    try {
      console.log('📊 Monitoring click-through rates...');
      
      const ctrData = await seoMonitoring.monitorClickThroughRates();
      
      console.log(`\n📈 CTR Analysis (${ctrData.length} keywords):`);
      ctrData.forEach(data => {
        const trendIcon = data.trend === 'improving' ? '📈' : data.trend === 'declining' ? '📉' : '➡️';
        console.log(`${trendIcon} ${data.keyword}: ${(data.averageCTR * 100).toFixed(2)}% (${data.trend}) | Position: ${data.currentPosition}`);
        
        if (data.recommendations.length > 0) {
          data.recommendations.forEach(rec => {
            console.log(`   💡 ${rec.priority.toUpperCase()}: ${rec.action} - ${rec.reason}`);
          });
        }
      });
      
      // Check for alerts
      const alerts = await seoMonitoring.getRecentAlerts(parseInt(options.days));
      if (alerts.length > 0) {
        console.log(`\n🚨 Recent Alerts (${alerts.length}):`);
        alerts.forEach(alert => {
          console.log(`⚠️  ${alert.type.toUpperCase()}: ${alert.message}`);
        });
      }
    } catch (error) {
      console.error('❌ Error monitoring CTR:', error.message);
      process.exit(1);
    }
  });

// Competitor analysis command
program
  .command('analyze-competitors')
  .description('Analyze competitors and identify trending topics')
  .option('-o, --output <file>', 'Output file for analysis results')
  .action(async (options) => {
    await initializeSystems();
    
    try {
      console.log('🔍 Analyzing competitors...');
      
      const [competitorAnalysis, trendingTopics] = await Promise.all([
        seoMonitoring.analyzeCompetitors(),
        seoMonitoring.identifyTrendingTopics()
      ]);
      
      console.log(`\n🏢 Competitor Analysis (${competitorAnalysis.length} competitors):`);
      competitorAnalysis.forEach(competitor => {
        console.log(`\n📊 ${competitor.name}:`);
        console.log(`   👥 Est. Subscribers: ${competitor.metrics.estimatedSubscribers.toLocaleString()}`);
        console.log(`   📹 Videos: ${competitor.metrics.videoCount}`);
        console.log(`   ⏱️  Avg Duration: ${Math.floor(competitor.metrics.averageViewDuration / 60)}m ${competitor.metrics.averageViewDuration % 60}s`);
        
        console.log(`   💪 Strengths: ${competitor.strengths.join(', ')}`);
        console.log(`   🎯 Opportunities: ${competitor.opportunities.join(', ')}`);
      });
      
      console.log(`\n🔥 Trending Topics (${trendingTopics.length}):`);
      trendingTopics.forEach(topic => {
        console.log(`📈 ${topic.topic}: ${topic.searchVolume} volume | ${topic.opportunity} opportunity`);
        console.log(`   💡 Suggestion: ${topic.suggestedContent}`);
      });
      
      if (options.output) {
        const analysisData = { competitorAnalysis, trendingTopics };
        await fs.writeJson(options.output, analysisData, { spaces: 2 });
        console.log(`\n💾 Analysis saved to ${options.output}`);
      }
    } catch (error) {
      console.error('❌ Error analyzing competitors:', error.message);
      process.exit(1);
    }
  });

// Generate comprehensive SEO report
program
  .command('generate-report')
  .description('Generate comprehensive SEO monitoring report')
  .option('-o, --output <file>', 'Output file for report', 'seo-report.json')
  .action(async (options) => {
    await initializeSystems();
    
    try {
      console.log('📋 Generating comprehensive SEO report...');
      
      const report = await seoMonitoring.generateSEOReport();
      
      console.log('\n📊 SEO Report Summary:');
      console.log(`📈 Keywords Tracked: ${report.summary.totalKeywordsTracked}`);
      console.log(`🎯 Average Position: ${report.summary.averagePosition.toFixed(1)}`);
      console.log(`👆 Average CTR: ${(report.summary.averageCTR * 100).toFixed(2)}%`);
      console.log(`🏢 Competitors Analyzed: ${report.summary.competitorsAnalyzed}`);
      
      console.log('\n🏆 Top Performing Keywords:');
      report.keywordPerformance.topPerforming.forEach(keyword => {
        console.log(`   📈 ${keyword.keyword}: Position ${keyword.position} | CTR: ${(keyword.ctr * 100).toFixed(2)}%`);
      });
      
      console.log('\n⚠️  Keywords Needing Improvement:');
      report.keywordPerformance.needsImprovement.forEach(keyword => {
        console.log(`   📉 ${keyword.keyword}: Position ${keyword.position} | CTR: ${(keyword.ctr * 100).toFixed(2)}%`);
      });
      
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`   ${rec.priority.toUpperCase()}: ${rec.action} (${rec.impact} impact)`);
      });
      
      await fs.writeJson(options.output, report, { spaces: 2 });
      console.log(`\n💾 Full report saved to ${options.output}`);
    } catch (error) {
      console.error('❌ Error generating report:', error.message);
      process.exit(1);
    }
  });

// Optimize video content
program
  .command('optimize-video')
  .description('Optimize video content for SEO')
  .option('-i, --input <file>', 'Input JSON file with video data')
  .option('-o, --output <file>', 'Output file for optimization results')
  .requiredOption('-t, --topic <topic>', 'Video topic')
  .option('-w, --week <week>', 'Week number', '1')
  .option('-d, --day <day>', 'Day number', '1')
  .option('--domain <domain>', 'Domain (people, process, business)', 'process')
  .action(async (options) => {
    await initializeSystems();
    
    try {
      let videoData;
      
      if (options.input) {
        videoData = await fs.readJson(options.input);
      } else {
        videoData = {
          topic: options.topic,
          week: parseInt(options.week),
          day: parseInt(options.day),
          domain: options.domain,
          contentType: 'daily'
        };
      }
      
      console.log(`🎯 Optimizing video: ${videoData.topic}`);
      
      const optimization = await seoEngine.optimizeVideoContent(videoData);
      
      console.log('\n📝 Title Optimization:');
      optimization.optimized.title.slice(0, 3).forEach((title, index) => {
        console.log(`   ${index + 1}. ${title.title} (Score: ${title.optimizationScore}/100)`);
      });
      
      console.log('\n📄 Description Optimization:');
      console.log(`   SEO Score: ${optimization.optimized.description.seoScore}/100`);
      console.log(`   Keyword Density: ${(optimization.optimized.description.keywordDensity * 100).toFixed(2)}%`);
      
      console.log('\n🏷️  Tags:');
      console.log(`   ${optimization.optimized.tags.tags.join(', ')}`);
      
      console.log('\n🖼️  Thumbnail Variations:');
      optimization.optimized.thumbnail.variations.forEach((thumb, index) => {
        console.log(`   ${index + 1}. ${thumb.style}: ${thumb.text} (${thumb.backgroundColor})`);
      });
      
      console.log('\n💡 Recommendations:');
      optimization.recommendations.forEach(rec => {
        console.log(`   ${rec.priority.toUpperCase()}: ${rec.action} - ${rec.reason}`);
      });
      
      if (options.output) {
        await fs.writeJson(options.output, optimization, { spaces: 2 });
        console.log(`\n💾 Optimization results saved to ${options.output}`);
      }
    } catch (error) {
      console.error('❌ Error optimizing video:', error.message);
      process.exit(1);
    }
  });

program.parse();