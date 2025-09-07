# PMP YouTube Channel Automation System

A comprehensive automation system for launching and managing a successful PMP (Project Management Professional) exam preparation YouTube channel. This system implements a structured 13-week study plan aligned with PMI's Examination Content Outline (ECO).

## 🎯 Project Overview

This project automates the creation, scheduling, and management of educational content for PMP certification candidates. It includes:

- **91 structured videos** across 13 weeks
- **Automated content generation** using templates
- **SEO-optimized metadata** and descriptions
- **Color-coded thumbnail system** by domain
- **Upload scheduling** and batch processing
- **Community engagement** tools
- **Performance tracking** and analytics

## 📁 Project Structure

```
pmp-youtube-channel/
├── src/
│   ├── templates/
│   │   ├── video-scripts/          # Video script templates
│   │   ├── thumbnails/             # Thumbnail specifications
│   │   └── descriptions/           # Video description templates
│   ├── content/
│   │   ├── chunks/                 # 13-week structured content
│   │   └── cross-references/       # Content relationship mappings
│   ├── assets/
│   │   └── branding/              # Brand guidelines and assets
│   ├── automation/
│   │   └── scripts/               # Automation and import scripts
│   ├── config/                    # Configuration files
│   └── generated/                 # Generated content output
├── understrap-child-1.2.0/       # WordPress theme with course navigation
│   ├── includes/                  # PHP classes for course progression
│   ├── assets/                    # CSS/JS for navigation system
│   └── template-parts/            # Navigation components
├── wordpress/                     # WordPress integration files
├── .env.example                   # Environment variables template
├── package.json                   # Node.js dependencies
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm 8+
- YouTube Data API v3 access
- Google Cloud Platform account (for API keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bonzysalesman/pmp-youtube-channel.git
   cd pmp-youtube-channel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Validate environment setup**
   ```bash
   npm run validate-env
   ```

## 🔧 Configuration

### Required Environment Variables

- `YOUTUBE_API_KEY`: YouTube Data API v3 key
- `YOUTUBE_CHANNEL_ID`: Your YouTube channel ID
- `CHANNEL_NAME`: Your channel name
- `CHANNEL_EMAIL`: Channel contact email

### Optional Configuration

- Lead magnet URLs for free resources
- Email marketing integration
- Analytics tracking IDs
- Social media links
- Course platform integration

## 📝 Content Generation

### Generate Video Scripts

```bash
# Generate all 13 weeks of content
npm run generate-content all

# Generate specific week
npm run generate-content week 1
```

### WordPress Content Import

```bash
# Run complete Phase 1 setup (content import, navigation, dashboard)
node src/automation/scripts/phase1-setup.js

# Validate content structure before import
npm run validate-content

# Import content to WordPress (safe mode with validation)
npm run import-content-safe

# Test import system without actual import
npm run test-import
```

### Schedule Uploads

```bash
# Generate complete upload schedule
npm run schedule-uploads generate 2024-01-01

# Generate specific week schedule
npm run schedule-uploads week 1 2024-01-01
```

## 🎨 Content Structure

### Weekly Format
- **Monday**: Week Overview
- **Tuesday-Friday**: Daily Study Lessons (15-20 min)
- **Saturday**: Practice Session (20-25 min)
- **Sunday**: Weekly Review (15-20 min)

### Video Structure (7-Section Format)
1. **Hook** (0-30s): Attention-grabbing opening
2. **Learning Objectives** (30-60s): What viewers will learn
3. **ECO Connection** (60-90s): Mapping to exam content outline
4. **Main Content** (8-12 min): Core lesson material
5. **Practice Application** (2-4 min): Hands-on scenarios
6. **Key Takeaways** (1-2 min): Summary points
7. **Next Preview** (30s): Tomorrow's topic

### Domain Color Coding
- **People (42%)**: Green (#2ECC71)
- **Process (50%)**: Blue (#3498DB)
- **Business Environment (8%)**: Orange (#E67E22)
- **Practice/Review**: Purple (#9B59B6)

## 📊 13-Week Study Plan

### Work Groups
1. **Building Team** (Weeks 1-3): Team formation, leadership
2. **Starting Project** (Weeks 4-5): Initiation, planning
3. **Doing Work** (Weeks 6-8): Execution, monitoring
4. **Keeping Track** (Weeks 9-10): Performance, changes
5. **Business Focus** (Week 11): Organizational strategy
6. **Final Prep** (Weeks 12-13): Exam strategies, review

## 🎯 Growth Targets

### Subscriber Milestones
- **Month 1**: 500 subscribers
- **Month 3**: 2,000 subscribers  
- **Month 6**: 10,000 subscribers

### Engagement Goals
- **Watch Time Retention**: 50%+
- **Comments per Video**: 20+
- **Response Time**: <2 hours (first 3 months)

## 🔄 Automation Features

### Content Creation
- Template-based script generation
- Automated thumbnail creation
- SEO-optimized descriptions
- Batch content processing

### Upload Management
- Scheduled daily uploads
- Metadata optimization
- Playlist organization
- Performance tracking

### Community Engagement
- Automated welcome comments
- Response time tracking
- Lead magnet distribution
- Email list integration

## 📈 Monetization Strategy

### Phase 1 (Months 1-2): Value First
- Focus on subscriber growth
- Build community trust
- Establish expertise
- No direct promotion

### Phase 2 (Months 3-4): Soft Promotion
- Introduce study guides
- Soft course mentions
- Affiliate partnerships
- Email list building

### Phase 3 (Months 5-6+): Full Monetization
- Course sales
- Premium memberships
- Corporate training
- Live cohorts

## 🛠️ Development

### Available Scripts

- `npm start`: Run the main application
- `npm run dev`: Development mode with auto-reload
- `npm run generate-content`: Generate video content
- `npm run schedule-uploads`: Create upload schedules
- `npm run validate-content`: Validate content structure and integrity
- `npm run import-content-safe`: Import content to WordPress with validation
- `npm run test-import`: Test import system without actual import
- `node src/automation/scripts/phase1-setup.js`: Complete Phase 1 WordPress setup
- `npm test`: Run test suite
- `npm run lint`: Code linting
- `npm run format`: Code formatting

### Testing

```bash
npm test
```

### Code Quality

```bash
npm run lint
npm run format
```

## 📋 Requirements Mapping

This system addresses the following requirements from the specification:

- **Requirement 7.1**: Structured weekly format and content calendar
- **Requirement 7.3**: Batch recording and scheduling systems
- **SEO Optimization**: Keyword targeting and discoverability
- **Community Engagement**: Response management and lead generation
- **Professional Branding**: Consistent visual identity and thumbnails

## 🚀 **Current Status**

✅ **Repository Setup Complete**
- Initial codebase committed (541 files)
- GitHub repository configured
- Issues created for implementation tasks
- Development environment ready

### **Active Issues**
- [#5 Phase 1: WordPress Content Import and Setup](https://github.com/bonzysalesman/pmp-youtube-channel/issues/5) 🔴 Critical
- [#6 Navigation System Configuration](https://github.com/bonzysalesman/pmp-youtube-channel/issues/6) 🟡 High  
- [#7 YouTube API Integration](https://github.com/bonzysalesman/pmp-youtube-channel/issues/7) 🟡 High
- [#8 User Dashboard and Progress Tracking](https://github.com/bonzysalesman/pmp-youtube-channel/issues/8) 🟡 High
- [#9 SEO Optimization and Content Generation](https://github.com/bonzysalesman/pmp-youtube-channel/issues/9) 🟢 Medium

### **Next Steps**
1. Run Phase 1 setup: `node src/automation/scripts/phase1-setup.js`
2. Configure environment variables for YouTube API
3. Set up WordPress development environment
4. Begin content import and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🔗 Related Resources

- [PMI Examination Content Outline](https://www.pmi.org/certifications/project-management-pmp)
- [YouTube Creator Academy](https://creatoracademy.youtube.com/)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Built for PMP success** 🎓 **Powered by automation** ⚡ **Designed for growth** 📈