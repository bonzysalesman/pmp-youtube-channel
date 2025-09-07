#!/bin/bash

# PMP YouTube Channel - MCP Integration Setup Script
# This script sets up the MCP server integrations and initializes the database

set -e  # Exit on any error

echo "🚀 Setting up PMP YouTube Channel MCP Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check for Python (required for uvx)
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        print_warning "Python is not installed. Some MCP servers may require Python."
    fi
    
    # Check for uv/uvx
    if ! command -v uvx &> /dev/null; then
        print_warning "uvx is not installed. Installing uv package manager..."
        
        # Install uv
        if command -v curl &> /dev/null; then
            curl -LsSf https://astral.sh/uv/install.sh | sh
            export PATH="$HOME/.cargo/bin:$PATH"
        elif command -v pip &> /dev/null; then
            pip install uv
        elif command -v pip3 &> /dev/null; then
            pip3 install uv
        else
            print_error "Cannot install uv. Please install it manually: https://docs.astral.sh/uv/getting-started/installation/"
            exit 1
        fi
        
        # Verify uvx is now available
        if ! command -v uvx &> /dev/null; then
            print_error "uvx installation failed. Please install manually."
            exit 1
        fi
    fi
    
    print_success "All requirements satisfied"
}

# Create necessary directories
create_directories() {
    print_status "Creating directory structure..."
    
    mkdir -p data
    mkdir -p logs
    mkdir -p .kiro/settings
    mkdir -p src/automation/mcp-integration
    mkdir -p src/config
    mkdir -p reports
    
    print_success "Directory structure created"
}

# Initialize database
initialize_database() {
    print_status "Initializing database..."
    
    if [ -f "data/database-schema.sql" ]; then
        # Create SQLite database
        if command -v sqlite3 &> /dev/null; then
            sqlite3 data/pmp-content.db < data/database-schema.sql
            print_success "Database initialized with schema"
        else
            print_warning "sqlite3 not found. Database will be created when first accessed."
        fi
    else
        print_warning "Database schema file not found. Skipping database initialization."
    fi
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# PMP YouTube Channel Environment Configuration

# GitHub Integration (optional)
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=pmp-youtube-channel

# Database Configuration
DATABASE_PATH=./data/pmp-content.db

# MCP Server Configuration
FASTMCP_LOG_LEVEL=ERROR

# Content Generation Settings
CONTENT_GENERATION_BATCH_SIZE=3
AUTO_GITHUB_RELEASE=true
RUN_QA_BY_DEFAULT=true

# Analytics Configuration
ANALYTICS_ENABLED=true
HEALTH_CHECK_INTERVAL=300000

# Learning Progress Tracking
MEMORY_BANK_PATH=./data/pmp-learning-memory
ADAPTIVE_LEARNING_ENABLED=true

# Notification Settings (optional)
SLACK_WEBHOOK_URL=
EMAIL_NOTIFICATIONS_ENABLED=false
EOF
        print_success "Environment file created (.env)"
        print_warning "Please update the .env file with your actual configuration values"
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Install npm dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_status "Creating package.json..."
        cat > package.json << EOF
{
  "name": "pmp-youtube-channel",
  "version": "1.0.0",
  "description": "13-Week PMP Certification Journey - Content Management System",
  "main": "src/automation/scripts/enhanced-content-generator.js",
  "scripts": {
    "start": "node src/automation/mcp-integration/orchestrator.js",
    "generate-content": "node src/automation/scripts/enhanced-content-generator.js",
    "setup-mcp": "node scripts/setup-mcp-services.js",
    "health-check": "node scripts/health-check.js",
    "generate-week": "node scripts/generate-week.js",
    "batch-generate": "node scripts/batch-generate.js",
    "analytics-report": "node scripts/analytics-report.js",
    "test": "echo \\"No tests specified yet\\"",
    "lint": "echo \\"No linting configured yet\\""
  },
  "keywords": [
    "pmp",
    "project-management",
    "certification",
    "youtube",
    "content-generation",
    "mcp"
  ],
  "author": "PMP Content Team",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^16.0.0",
    "sqlite3": "^5.1.0",
    "axios": "^1.6.0",
    "moment": "^2.29.0",
    "handlebars": "^4.7.0",
    "fs-extra": "^11.0.0",
    "node-cron": "^3.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
EOF
    fi
    
    # Install dependencies
    npm install
    print_success "npm dependencies installed"
}

# Test MCP server connections
test_mcp_connections() {
    print_status "Testing MCP server connections..."
    
    # Test each MCP server
    local servers=("mcp-task-manager-server" "mcp-database-server" "github-mcp-server" "memory-bank-mcp" "filesystem-mcp-server")
    
    for server in "${servers[@]}"; do
        print_status "Testing $server..."
        
        # Try to run the server with --help to verify it's available
        if uvx "$server@latest" --help &> /dev/null; then
            print_success "$server is available"
        else
            print_warning "$server may not be available or may need first-time setup"
        fi
    done
}

# Create utility scripts
create_utility_scripts() {
    print_status "Creating utility scripts..."
    
    # Create health check script
    cat > scripts/health-check.js << 'EOF'
#!/usr/bin/env node

const MCPOrchestrator = require('../src/automation/mcp-integration/orchestrator');

async function runHealthCheck() {
    const orchestrator = new MCPOrchestrator();
    
    try {
        console.log('🏥 Running health check...');
        await orchestrator.initialize();
        const healthReport = await orchestrator.checkServiceHealth();
        
        console.log('\n📊 Health Report:');
        console.log(`Overall Status: ${healthReport.overall_status}`);
        
        for (const [service, status] of Object.entries(healthReport.services)) {
            const emoji = status.status === 'healthy' ? '✅' : '❌';
            console.log(`${emoji} ${service}: ${status.status}`);
        }
        
        process.exit(healthReport.overall_status === 'healthy' ? 0 : 1);
    } catch (error) {
        console.error('❌ Health check failed:', error);
        process.exit(1);
    }
}

runHealthCheck();
EOF

    # Create week generation script
    cat > scripts/generate-week.js << 'EOF'
#!/usr/bin/env node

const MCPOrchestrator = require('../src/automation/mcp-integration/orchestrator');

async function generateWeek() {
    const weekNumber = parseInt(process.argv[2]);
    
    if (!weekNumber || weekNumber < 1 || weekNumber > 13) {
        console.error('❌ Please provide a valid week number (1-13)');
        console.log('Usage: npm run generate-week <week_number>');
        process.exit(1);
    }
    
    const orchestrator = new MCPOrchestrator();
    
    try {
        await orchestrator.initialize();
        const result = await orchestrator.executeContentWorkflow(weekNumber);
        
        console.log(`✅ Week ${weekNumber} content generated successfully!`);
        console.log(`   Chunks: ${result.results.content.chunks.length}`);
        console.log(`   Videos: ${result.results.content.videos.length}`);
        console.log(`   Duration: ${result.workflow.duration_minutes.toFixed(1)} minutes`);
        
    } catch (error) {
        console.error(`❌ Failed to generate Week ${weekNumber}:`, error);
        process.exit(1);
    }
}

generateWeek();
EOF

    # Create batch generation script
    cat > scripts/batch-generate.js << 'EOF'
#!/usr/bin/env node

const MCPOrchestrator = require('../src/automation/mcp-integration/orchestrator');

async function batchGenerate() {
    const startWeek = parseInt(process.argv[2]);
    const endWeek = parseInt(process.argv[3]);
    
    if (!startWeek || !endWeek || startWeek < 1 || endWeek > 13 || startWeek > endWeek) {
        console.error('❌ Please provide valid week numbers');
        console.log('Usage: npm run batch-generate <start_week> <end_week>');
        process.exit(1);
    }
    
    const orchestrator = new MCPOrchestrator();
    
    try {
        await orchestrator.initialize();
        const result = await orchestrator.executeBatchWorkflow(startWeek, endWeek, {
            delay: 2000, // 2 second delay between weeks
            stopOnError: false
        });
        
        console.log(`✅ Batch generation completed!`);
        console.log(`   Successful weeks: ${result.summary.successful_weeks}`);
        console.log(`   Failed weeks: ${result.summary.failed_weeks}`);
        console.log(`   Total chunks: ${result.summary.total_chunks}`);
        console.log(`   Total videos: ${result.summary.total_videos}`);
        
    } catch (error) {
        console.error('❌ Batch generation failed:', error);
        process.exit(1);
    }
}

batchGenerate();
EOF

    # Make scripts executable
    chmod +x scripts/health-check.js
    chmod +x scripts/generate-week.js
    chmod +x scripts/batch-generate.js
    
    print_success "Utility scripts created"
}

# Create README for MCP integration
create_documentation() {
    print_status "Creating documentation..."
    
    cat > MCP-INTEGRATION-README.md << 'EOF'
# MCP Integration for PMP YouTube Channel

This document explains how to use the Model Context Protocol (MCP) integrations for the PMP YouTube Channel content management system.

## Overview

The MCP integration provides:
- **Task Management**: Automated task creation and tracking
- **Content Analytics**: Performance monitoring and metrics
- **Learning Progress**: Personalized learning path tracking
- **GitHub Workflows**: Automated content publishing and version control
- **Memory Bank**: Persistent learning data and recommendations

## Quick Start

1. **Setup**: Run the setup script
   ```bash
   ./scripts/setup-mcp-integration.sh
   ```

2. **Configure**: Update the `.env` file with your settings

3. **Health Check**: Verify all services are working
   ```bash
   npm run health-check
   ```

4. **Generate Content**: Create content for a specific week
   ```bash
   npm run generate-week 10
   ```

## Available Commands

### Content Generation
- `npm run generate-week <week_number>` - Generate content for a specific week
- `npm run batch-generate <start_week> <end_week>` - Generate content for multiple weeks
- `npm run generate-content` - Run the enhanced content generator

### System Management
- `npm run health-check` - Check the health of all MCP services
- `npm run analytics-report` - Generate analytics report
- `npm start` - Start the MCP orchestrator

### Development
- `npm test` - Run tests (when implemented)
- `npm run lint` - Run code linting (when configured)

## MCP Servers Used

1. **Task Manager Server** (`mcp-task-manager-server`)
   - Manages content creation tasks
   - Tracks progress and deadlines
   - Provides project organization

2. **Database Server** (`mcp-database-server`)
   - Stores content analytics
   - Tracks user progress
   - Manages performance metrics

3. **GitHub Server** (`github-mcp-server`)
   - Automates content publishing
   - Manages version control
   - Creates releases and issues

4. **Memory Bank** (`memory-bank-mcp`)
   - Stores learning progress
   - Provides personalized recommendations
   - Maintains user preferences

5. **Filesystem Server** (`filesystem-mcp-server`)
   - Manages content files
   - Handles file operations
   - Provides secure file access

## Configuration

### Environment Variables
Update `.env` with your configuration:

```bash
# GitHub Integration
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=your_repo_name

# Database
DATABASE_PATH=./data/pmp-content.db

# MCP Settings
FASTMCP_LOG_LEVEL=ERROR
```

### MCP Server Configuration
The MCP servers are configured in `.kiro/settings/mcp.json`. Each server can be:
- Enabled/disabled
- Configured with specific parameters
- Set up with auto-approval for certain operations

## Usage Examples

### Generate Week 10 Content
```bash
npm run generate-week 10
```

### Generate Content for Weeks 10-13
```bash
npm run batch-generate 10 13
```

### Check System Health
```bash
npm run health-check
```

### Generate Analytics Report
```bash
npm run analytics-report
```

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**
   - Ensure `uvx` is installed: `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - Verify server availability: `uvx mcp-task-manager-server@latest --help`

2. **Database Connection Issues**
   - Check database file permissions
   - Verify SQLite is installed
   - Run database initialization script

3. **GitHub Integration Issues**
   - Verify GitHub token has correct permissions
   - Check repository access
   - Ensure repository exists

4. **Memory Bank Issues**
   - Check memory bank directory permissions
   - Verify disk space availability
   - Clear memory bank if corrupted

### Getting Help

1. Check the logs in the `logs/` directory
2. Run health check to identify specific issues
3. Review MCP server documentation
4. Check GitHub issues for known problems

## Development

### Adding New MCP Servers
1. Add server configuration to `.kiro/settings/mcp.json`
2. Create integration module in `src/automation/mcp-integration/`
3. Update orchestrator to include new service
4. Add tests and documentation

### Customizing Workflows
1. Modify workflow definitions in orchestrator
2. Add new workflow types as needed
3. Update event handling for new workflows
4. Test thoroughly before deployment

## Security Considerations

- Keep GitHub tokens secure and rotate regularly
- Use environment variables for sensitive data
- Limit MCP server permissions to minimum required
- Regularly update MCP servers to latest versions
- Monitor access logs for unusual activity

## Performance Optimization

- Use batch operations when possible
- Implement caching for frequently accessed data
- Monitor memory usage during large operations
- Optimize database queries and indexes
- Use appropriate delays between operations
EOF

    print_success "Documentation created (MCP-INTEGRATION-README.md)"
}

# Main setup function
main() {
    echo "🎯 PMP YouTube Channel - MCP Integration Setup"
    echo "=============================================="
    
    check_requirements
    create_directories
    setup_environment
    install_dependencies
    initialize_database
    create_utility_scripts
    test_mcp_connections
    create_documentation
    
    echo ""
    echo "🎉 MCP Integration setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update the .env file with your configuration"
    echo "2. Run 'npm run health-check' to verify everything is working"
    echo "3. Try generating content with 'npm run generate-week 1'"
    echo "4. Read MCP-INTEGRATION-README.md for detailed usage instructions"
    echo ""
    echo "Happy content creating! 🚀"
}

# Run main function
main "$@"
EOF