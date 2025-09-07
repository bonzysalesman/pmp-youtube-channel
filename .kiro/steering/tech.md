# Technology Stack & Build System

## Core Technologies

### Runtime & Framework
- **Node.js**: 16+ required (specified in package.json engines)
- **npm**: 8+ required for package management
- **JavaScript**: ES6+ with modern async/await patterns

### Key Dependencies
- **googleapis**: YouTube Data API v3 integration for video management
- **dotenv**: Environment variable management
- **node-cron**: Scheduled task automation
- **axios**: HTTP client for API requests
- **fs-extra**: Enhanced file system operations
- **moment**: Date/time manipulation for scheduling
- **handlebars**: Template engine for content generation

### Development Tools
- **nodemon**: Development server with auto-reload
- **jest**: Testing framework
- **eslint**: Code linting and style enforcement
- **prettier**: Code formatting

## Environment Configuration

### Required Environment Variables
```bash
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
CHANNEL_NAME=your_channel_name
CHANNEL_EMAIL=contact_email
```

### Optional Configuration
- YouTube OAuth credentials (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)
- Email marketing integration (EMAIL_API_KEY, EMAIL_LIST_ID)
- Analytics tracking (GOOGLE_ANALYTICS_ID)
- Social media links and affiliate configurations
- Cloud storage and CDN settings

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run in production
npm start

# Validate environment setup
npm run validate-env
```

### Content Generation
```bash
# Generate all 13 weeks of content
npm run generate-content all

# Generate specific week
npm run generate-content week 1

# Generate from calendar data
npm run generate-from-calendar
```

### Upload Management
```bash
# Generate complete upload schedule
npm run schedule-uploads generate 2024-01-01

# Generate specific week schedule
npm run schedule-uploads week 1 2024-01-01
```

### Code Quality
```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Architecture Patterns

### Configuration Management
- Centralized environment configuration in `src/config/environment.js`
- Validation of required vs optional environment variables
- Environment-specific behavior (development, production, test)
- Structured configuration objects for different service integrations

### Template System
- Handlebars-based templating for content generation
- Reusable templates for video scripts, descriptions, and metadata
- Variable substitution for dynamic content creation
- Batch processing capabilities for multiple content pieces

### Content Organization
- Structured folder hierarchy for different content types
- JSON configuration files for schedules, metadata, and settings
- Markdown templates for consistent content formatting
- Cross-reference mapping between videos and study materials

### API Integration
- YouTube Data API v3 for video management and analytics
- OAuth 2.0 flow for authenticated operations
- Rate limiting and error handling for API calls
- Batch operations for efficient API usage

## File Processing Conventions

### Naming Patterns
- Configuration files: kebab-case with descriptive names
- Template files: descriptive names with file type suffix
- Generated content: structured naming with week/day identifiers
- Scripts: action-verb naming (content-generator.js, upload-scheduler.js)

### Content Structure
- Week-based organization for study materials
- Domain-based categorization (People, Process, Business Environment)
- Cross-reference files in JSON format for mapping relationships
- Template inheritance for consistent formatting

## Security & Performance

### API Security
- Environment variable protection for sensitive keys
- OAuth token management for YouTube API access
- Rate limiting configuration for API calls
- Input validation for user-generated content

### Performance Optimization
- Batch processing for content generation
- Caching strategies for API responses
- Efficient file system operations
- Memory management for large content processing

## Development Guidelines

### Code Style
- Use ESLint configuration for consistent code style
- Prettier for automatic code formatting
- Async/await for asynchronous operations
- Descriptive variable and function names

### Error Handling
- Comprehensive error handling for API operations
- Graceful degradation for optional features
- Logging for debugging and monitoring
- Environment-specific error reporting

### Testing Strategy
- Jest for unit and integration testing
- Environment validation testing
- API integration testing with mocks
- Content generation testing with sample data