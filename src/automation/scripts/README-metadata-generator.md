# Video Metadata and Description Generator

This system generates comprehensive video metadata including SEO-optimized descriptions, automatic timestamps, keyword targeting, and playlist assignments for the 13-week PMP certification YouTube channel.

## Features

### 🎯 Core Functionality

- **SEO-Optimized Descriptions**: Automatically generates descriptions with ECO task mapping and timestamps
- **Automatic Timestamps**: Creates 7-part video structure timestamps based on content type
- **Keyword Targeting**: Inserts relevant PMP exam keywords and long-tail variations
- **Playlist Assignment**: Automatically assigns videos to appropriate playlists based on content type and week structure

### 📊 Content Types Supported

- **Daily Study Videos** (15-18 min): 7-section structure with learning objectives and practice
- **Practice Sessions** (20-25 min): Scenario-based questions with detailed analysis
- **Review Sessions** (15-20 min): Weekly consolidation and assessment
- **Channel Trailers** (5-7 min): Introduction and program overview

### 🎨 Domain Color Coding

- **People Domain**: Green (#2ECC71) - Team building, leadership, stakeholder management
- **Process Domain**: Blue (#3498DB) - Planning, execution, monitoring, controlling
- **Business Environment**: Orange (#E67E22) - Strategy, compliance, organizational factors
- **Practice/Review**: Purple (#9B59B6) - Practice sessions and reviews

## Quick Start

### Generate All Video Metadata

```bash
npm run generate-metadata-all
```

### Generate Specific Week

```bash
npm run generate-metadata-week 1
```

### Generate by Content Type

```bash
node src/automation/scripts/generate-metadata.js --type daily-study
```

### Export for YouTube Upload

```bash
npm run export-youtube-batch
```

## Command Line Usage

### Basic Commands

```bash
# Generate all 91 videos
node generate-metadata.js --all

# Generate specific week (1-13)
node generate-metadata.js --week 5

# Generate by video type
node generate-metadata.js --type practice

# Generate by domain
node generate-metadata.js --domain People

# Generate specific day
node generate-metadata.js --day 15
```

### Export Options

```bash
# Export to CSV for analysis
node generate-metadata.js --export csv

# Export YouTube upload batch
node generate-metadata.js --export youtube

# Export complete JSON
node generate-metadata.js --export json
```

### Utility Commands

```bash
# Generate playlist configurations only
node generate-metadata.js --playlists

# Verbose output
node generate-metadata.js --week 1 --verbose

# Show help
node generate-metadata.js --help
```

## Generated Output Structure

```
src/generated/metadata/
├── individual/                 # Individual video metadata files
│   ├── day-01-daily-study.json
│   ├── day-02-daily-study.json
│   └── ...
├── batch/                      # Batch processing results
│   ├── upload-batch.json       # YouTube upload configuration
│   └── processing-log.json     # Processing statistics
├── playlists/                  # Playlist configurations
│   ├── playlist-config.json    # All playlist definitions
│   └── playlist-assignments.json
├── descriptions/               # Plain text descriptions
│   ├── day-01-daily-study.txt
│   └── ...
├── complete-metadata.json      # All video metadata
├── seo-analysis.json          # SEO performance analysis
└── video-metadata-export.csv  # Spreadsheet export
```

## Metadata Structure

Each video generates comprehensive metadata:

```json
{
  "basic": {
    "week": 1,
    "day": "Tuesday",
    "dayNumber": 1,
    "type": "daily-study",
    "title": "Day 1: PMP Exam 2024 Complete Overview",
    "duration": "15-18 minutes",
    "domain": "Mixed",
    "thumbnailColor": "purple",
    "uploadSchedule": { ... }
  },
  "seo": {
    "primaryKeywords": ["PMP exam prep", "PMP certification"],
    "longTailKeywords": ["13-week PMP study plan"],
    "seoScore": 85,
    "competitorAnalysis": [...]
  },
  "timestamps": {
    "structure": {
      "hook": { "start": 0, "end": 30, "label": "Hook & Introduction" },
      "objectives": { "start": 30, "end": 60, "label": "Learning Objectives" },
      "ecoConnection": { "start": 60, "end": 90, "label": "ECO Connection" },
      "mainContent": { "start": 90, "end": 810, "label": "Main Content" },
      "practice": { "start": 810, "end": 930, "label": "Practice Application" },
      "takeaways": { "start": 930, "end": 1050, "label": "Key Takeaways" },
      "preview": { "start": 1050, "end": 1080, "label": "Next Preview" }
    },
    "formatted": ["0:00 - Hook & Introduction", "0:30 - Learning Objectives", ...]
  },
  "description": "🎯 Day 1 of our 13-Week PMP Study Plan! ...",
  "playlists": [
    {
      "name": "13-Week PMP Study Plan - Complete Course",
      "id": "main-course",
      "order": 1,
      "priority": 1
    }
  ],
  "keywords": ["PMP exam prep", "PMP certification", ...],
  "hashtags": ["#PMPExam", "#PMPCertification", ...]
}
```

## 7-Part Video Structure

### Daily Study Videos (15-18 minutes)

1. **Hook** (0-30s): Attention-grabbing opener
2. **Learning Objectives** (30-60s): What viewers will learn
3. **ECO Connection** (60-90s): How content maps to exam
4. **Main Content** (8-12min): Core teaching with examples
5. **Practice Application** (2-4min): Scenario or questions
6. **Key Takeaways** (1-2min): Summary and action items
7. **Next Preview** (30s): Tomorrow's topic tease

### Practice Sessions (20-25 minutes)

1. **Hook** (0-30s): Practice challenge setup
2. **Objectives** (30-60s): Practice goals
3. **ECO Connection** (60-90s): Skills being practiced
4. **Scenario 1** (5-6min): First practice scenario
5. **Scenario 2** (5-6min): Second practice scenario
6. **Scenario 3** (5-6min): Third practice scenario
7. **Pattern Recognition** (2-3min): Common themes and principles
8. **Key Principles** (1-2min): Takeaways
9. **Next Session** (30s): Preview

## SEO Optimization

### Primary Keywords

- PMP exam prep
- PMP certification
- PMP study guide
- PMP exam 2024
- Project management certification

### Long-tail Keywords

- 13-week PMP study plan
- PMP exam preparation course
- Free PMP study materials
- How to pass PMP exam

### Domain-Specific Keywords

- **People**: Team management, stakeholder management, leadership
- **Process**: Project planning, risk management, quality management
- **Business**: Business value, organizational strategy, compliance

### Title Formulas

- `Day {{day}}: {{topic}} | PMP Exam Prep Week {{week}}`
- `{{topic}} Explained | PMP Certification Study Guide`
- `Week {{week}} {{topic}} | 13-Week PMP Study Plan`
- `PMP Practice: {{topic}} Scenarios | Exam Prep 2024`

## Playlist Management

### Automatic Playlist Assignment

Videos are automatically assigned to relevant playlists:

1. **Main Course Playlist**: All 91 videos in sequential order
2. **Weekly Playlists**: Week 1-13 groupings
3. **Domain Playlists**: People, Process, Business Environment
4. **Content Type Playlists**: Practice Sessions, Reviews
5. **Work Group Playlists**: Building Team, Starting Project, etc.

### Playlist Descriptions

Auto-generated descriptions with study guidance and progress tracking information.

## Integration with Existing Systems

### Content Calendar Integration

- Reads from `src/config/detailed-content-calendar.json`
- Processes all 13 weeks and 91 videos
- Maintains week themes and work group organization

### SEO Keywords Integration

- Uses `src/config/seo-keywords.json` for keyword targeting
- Applies domain-specific and content-type keywords
- Generates hashtag combinations

### Template System Integration

- Compatible with existing video script templates
- Uses template variables for dynamic content generation
- Maintains consistency with production workflow

## Examples and Testing

### Run Examples

```bash
npm run generate-metadata-examples
```

### Test Single Video

```javascript
const VideoMetadataGenerator = require("./video-metadata-generator");

const generator = new VideoMetadataGenerator();
await generator.loadConfigurations();

const metadata = generator.generateVideoMetadata({
  week: 1,
  dayNumber: 1,
  type: "daily-study",
  title: "Day 1: PMP Exam Overview",
  domain: "Mixed",
  ecoTasks: ["Understanding exam structure"],
});

console.log(metadata.description);
```

### Batch Processing

```javascript
const MetadataBatchProcessor = require("./metadata-batch-processor");

const processor = new MetadataBatchProcessor();
const weekVideos = await processor.processVideosByCriteria({ week: 1 });
const uploadBatch = processor.generateUploadBatch(weekVideos);
```

## Performance and Scalability

### Processing Speed

- Single video: ~50ms
- Full 91-video batch: ~5-10 seconds
- Includes validation and file I/O

### Memory Usage

- Efficient streaming for large batches
- Configurable output directory structure
- Automatic cleanup of temporary files

### Error Handling

- Graceful degradation for missing data
- Validation of required fields
- Detailed error logging and recovery

## Troubleshooting

### Common Issues

**Missing Configuration Files**

```bash
Error: Cannot find module 'seo-keywords.json'
```

Solution: Ensure all config files exist in `src/config/`

**Invalid Video Configuration**

```bash
Error: Missing required field 'type'
```

Solution: Verify video config includes all required fields

**Timestamp Validation Errors**

```bash
Warning: Video duration exceeds timestamp structure
```

Solution: Check duration format and adjust target length

### Debug Mode

```bash
node generate-metadata.js --week 1 --verbose
```

### Validation

```bash
# Validate all generated metadata
node -e "
const fs = require('fs-extra');
const metadata = fs.readJsonSync('src/generated/metadata/complete-metadata.json');
console.log('✓ Metadata validation passed');
console.log('Total videos:', metadata.summary.totalVideos);
"
```

## Contributing

### Adding New Video Types

1. Update `generateTimestamps()` method with new structure
2. Add type-specific keywords to SEO configuration
3. Create template in `src/templates/video-scripts/`
4. Update playlist assignment logic

### Extending SEO Features

1. Add keywords to `src/config/seo-keywords.json`
2. Update keyword selection logic in generator
3. Add new title formulas
4. Test with sample videos

### Custom Export Formats

1. Add export method to `MetadataBatchProcessor`
2. Update CLI with new export option
3. Add to package.json scripts
4. Document usage

## License

MIT License - See LICENSE file for details.
