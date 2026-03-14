# PMP WordPress Content Import Guide

This guide explains how to import the 13-week PMP course content into WordPress using the automated import system.

## Overview

The content import system transforms the structured markdown content from `src/content/chunks/` into WordPress posts with proper categorization, metadata, and relationships.

## Prerequisites

### Environment Setup

1. **WordPress Installation**: Ensure WordPress is running (Docker or local)
2. **Database Access**: MySQL/MariaDB connection with write permissions
3. **Environment Variables**: Configure database connection settings

Create a `.env` file with the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wordpress

# WordPress Configuration
SITE_URL=http://localhost:8080
WP_TABLE_PREFIX=wp_

# Optional: Import Settings
IMPORT_BATCH_SIZE=10
IMPORT_DELAY=1000
```

### Dependencies

Install required Node.js packages:

```bash
npm install mysql2 fs-extra dotenv
```

## Content Structure

The import system processes:

- **13 weeks** of structured content (week-01 through week-13)
- **Content chunks** with metadata headers
- **Cross-references** between content and videos
- **ECO task mappings** for certification alignment

### Content Format

Each content chunk follows this structure:

```markdown
# Title

**Week:** 1
**Domain:** Foundation
**ECO Tasks:** Task references
**Video References:** 
- 🎥 Video title
- 🎯 Practice session

**Estimated Reading Time:** 25 minutes
**Key Learning Outcomes:** 
- Outcome 1
- Outcome 2

---

## Main Content

Content body goes here...
```

## Import Process

### Step 1: Validate Content

Before importing, validate the content structure:

```bash
npm run validate-content
```

This checks:
- All 13 weeks are present
- Metadata format is correct
- Content length is appropriate
- Cross-references are valid
- No duplicate content exists

### Step 2: Test Import System

Before running the actual import, test the system:

```bash
npm run test-import
```

This performs:
- Content validation
- Metadata parsing tests
- Import simulation without database changes
- Comprehensive test report generation

### Step 3: Run Import

#### Safe Import (Recommended)
```bash
npm run import-content-safe
```

This runs validation first, then imports if validation passes.

#### Direct Import
```bash
node src/automation/scripts/content-import-wordpress.js
```

Imports content directly without validation (use with caution).

### Step 4: Verify Import

Check the import results:

1. **WordPress Admin**: Navigate to Posts → Lessons
2. **Import Report**: Check `src/generated/import-report.json`
3. **Database**: Verify posts in `wp_posts` table

## Import Features

### WordPress Integration

- **Custom Post Type**: Creates 'lesson' post type
- **Taxonomies**: Week-based and domain-based categories
- **Metadata**: Stores all chunk metadata as post meta
- **Cross-References**: Saves as WordPress options

### Content Processing

- **Metadata Extraction**: Parses structured headers
- **Content Cleaning**: Processes markdown content
- **Word Count**: Calculates reading time
- **Domain Classification**: Assigns content to PMP domains

### Database Structure

The import creates:

```sql
-- Posts table (wp_posts)
- post_title: Chunk title
- post_content: Main content
- post_type: 'lesson'
- post_status: 'publish'

-- Post metadata (wp_postmeta)
- week_number: 1-13
- domain: People/Process/Business Environment
- eco_tasks: JSON array
- video_references: JSON array
- estimated_read_time: Minutes
- word_count: Number of words

-- Taxonomies (wp_terms, wp_term_taxonomy)
- lesson_category: Week and domain categories
- lesson_tag: Content tags
```

## Configuration

### Import Settings

Edit `src/config/content-import-config.json`:

```json
{
  "import_settings": {
    "batch_size": 10,
    "delay_between_batches": 1000,
    "validate_before_import": true,
    "overwrite_existing": false,
    "import_cross_references": true
  },
  "validation": {
    "required_metadata": ["title", "week_number", "domain"],
    "max_content_length": 50000,
    "min_content_length": 500
  }
}
```

### Database Configuration

The system supports:
- **MySQL/MariaDB**: Primary database
- **Connection Pooling**: For performance
- **Transaction Support**: For data integrity

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
❌ Database connection failed: Access denied
```

**Solution**: Check database credentials in `.env` file

#### Missing Content
```
❌ Week structure validation failed: Missing weeks: 12, 13
```

**Solution**: Ensure all week directories exist in `src/content/chunks/`

#### Metadata Validation Errors
```
❌ chunk-01-intro.md: Missing required metadata: domain
```

**Solution**: Add missing metadata to chunk headers

#### Import Failures
```
❌ Error creating WordPress post: Table 'wp_posts' doesn't exist
```

**Solution**: Ensure WordPress is properly installed and database is accessible

### Validation Errors

Run validation to identify issues:

```bash
npm run validate-content
```

Common validation errors:
- Missing required metadata fields
- Invalid domain names
- Content too short/long
- Duplicate titles
- Missing cross-reference files

### Recovery Options

#### Partial Import Recovery
If import fails partway through:

1. Check `src/generated/import-report.json` for successful imports
2. Identify failed chunks from error log
3. Fix issues and re-run import (existing content won't be duplicated)

#### Complete Reset
To start fresh:

```sql
-- Remove imported lessons
DELETE FROM wp_posts WHERE post_type = 'lesson';
DELETE FROM wp_postmeta WHERE post_id NOT IN (SELECT ID FROM wp_posts);
DELETE FROM wp_term_relationships WHERE object_id NOT IN (SELECT ID FROM wp_posts);
```

## Advanced Usage

### Custom Post Types

The import system creates a 'lesson' post type. To customize:

1. Edit the post type configuration in the import script
2. Modify `createWordPressPost()` method
3. Update taxonomy assignments

### Batch Processing

For large imports, configure batch processing:

```json
{
  "import_settings": {
    "batch_size": 5,
    "delay_between_batches": 2000
  }
}
```

### Content Transformation

To modify content during import:

1. Edit `parseChunkMetadata()` method
2. Add content transformation logic
3. Update metadata extraction rules

## Integration with WordPress Theme

After import, the content integrates with the PMP theme:

- **Navigation**: Week-based course navigation
- **Progress Tracking**: User progress through lessons
- **Cross-References**: Links between content and videos
- **Search**: Full-text search across all lessons

## Monitoring and Analytics

The import system provides:

- **Import Reports**: Detailed success/failure logs
- **Validation Reports**: Content quality metrics
- **Performance Metrics**: Import speed and efficiency
- **Error Tracking**: Detailed error logs for debugging

## Next Steps

After successful import:

1. **Configure Navigation**: Set up course navigation menus
2. **Test User Flow**: Verify lesson progression works
3. **Set Up Progress Tracking**: Enable user progress features
4. **Configure SEO**: Optimize lesson URLs and metadata
5. **Enable Comments**: Allow user engagement on lessons

## Support

For issues or questions:

1. Check validation report for specific errors
2. Review import logs in `src/generated/`
3. Verify WordPress and database configuration
4. Test with a small subset of content first

The import system is designed to be robust and recoverable, with comprehensive validation and error reporting to ensure successful content migration.