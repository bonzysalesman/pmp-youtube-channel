# Contributing to PMP YouTube Channel Automation System

Thank you for your interest in contributing to the PMP YouTube Channel Automation System! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community Guidelines](#community-guidelines)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- **Node.js**: Version 16+ required
- **npm**: Version 8+ required
- **Git**: For version control
- **YouTube API Key**: For testing YouTube integrations (optional for most contributions)

### Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/pmp-youtube-channel.git
   cd pmp-youtube-channel
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see Environment Configuration section)
   ```

4. **Validate Setup**
   ```bash
   npm run validate-env
   npm test
   ```

## Development Setup

### Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

#### Required for Development
```bash
NODE_ENV=development
```

#### Optional (for full functionality testing)
```bash
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
CHANNEL_NAME=your_channel_name
CHANNEL_EMAIL=contact_email
```

### Project Structure

```
pmp-youtube-channel/
├── src/                          # Main source code
│   ├── automation/              # Automation scripts and tools
│   ├── config/                  # Configuration files
│   ├── content/                 # Study materials and content
│   └── templates/               # Content templates
├── .github/                     # GitHub workflows and templates
├── docs/                        # Documentation
├── scripts/                     # Build and utility scripts
└── tests/                       # Test files
```

## Coding Standards

### JavaScript Style Guide

We use ESLint and Prettier for consistent code formatting:

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Code Style Requirements

1. **ES6+ Syntax**: Use modern JavaScript features
2. **Async/Await**: Prefer async/await over Promises and callbacks
3. **Descriptive Naming**: Use clear, descriptive variable and function names
4. **JSDoc Comments**: Document all public functions and classes
5. **Error Handling**: Implement comprehensive error handling

### Example Code Style

```javascript
/**
 * Generates video metadata for YouTube upload
 * @param {Object} contentData - The content data object
 * @param {string} contentData.title - Video title
 * @param {string} contentData.description - Video description
 * @returns {Promise<Object>} Generated metadata object
 * @throws {Error} When required fields are missing
 */
async function generateVideoMetadata(contentData) {
  try {
    if (!contentData.title || !contentData.description) {
      throw new Error('Title and description are required');
    }

    const metadata = {
      title: contentData.title,
      description: contentData.description,
      tags: await generateTags(contentData),
      thumbnail: await generateThumbnail(contentData)
    };

    return metadata;
  } catch (error) {
    console.error('Error generating video metadata:', error);
    throw error;
  }
}
```

### File Organization

- **Configuration**: Use `src/config/` for all configuration files
- **Templates**: Store reusable templates in `src/templates/`
- **Utilities**: Place utility functions in appropriate subdirectories
- **Tests**: Mirror source structure in test directories

## Testing Requirements

### Test Coverage

- **Minimum Coverage**: 80% code coverage required
- **Test Types**: Unit tests, integration tests, and end-to-end tests
- **Framework**: Jest for all testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- content-generator.test.js
```

### Writing Tests

1. **Test File Naming**: Use `.test.js` suffix
2. **Test Structure**: Follow Arrange-Act-Assert pattern
3. **Mocking**: Mock external dependencies (YouTube API, file system)
4. **Descriptive Names**: Use clear, descriptive test names

### Example Test

```javascript
describe('Content Generator', () => {
  describe('generateVideoScript', () => {
    it('should generate video script with correct structure', async () => {
      // Arrange
      const mockContentData = {
        week: 1,
        day: 1,
        topic: 'PMP Introduction',
        domain: 'People'
      };

      // Act
      const result = await generateVideoScript(mockContentData);

      // Assert
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('sections');
      expect(result.sections).toHaveLength(7);
      expect(result.title).toContain('PMP Introduction');
    });
  });
});
```

## Pull Request Process

### Before Submitting

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run validate-env
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(content): add video script generation for practice sessions
fix(upload): resolve timeout issue in batch upload process
docs(readme): update installation instructions
```

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Tests added for new functionality
- [ ] All tests pass
- [ ] Documentation updated (if applicable)
- [ ] No merge conflicts with main branch
- [ ] PR description clearly explains changes

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

## Issue Reporting

### Bug Reports

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- **Environment**: OS, Node.js version, npm version
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Additional Context**: Any other relevant information

### Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: Detailed description of the feature
- **Alternatives Considered**: Other solutions you've considered
- **Additional Context**: Any other relevant information

### Task Issues

Use the [task template](.github/ISSUE_TEMPLATE/task.md) for:

- Development tasks
- Documentation improvements
- Maintenance work
- Process improvements

## Community Guidelines

### Communication

- **Be Respectful**: Treat all community members with respect
- **Be Constructive**: Provide helpful, constructive feedback
- **Be Patient**: Remember that contributors have varying experience levels
- **Be Inclusive**: Welcome newcomers and help them get started

### Getting Help

- **Documentation**: Check existing documentation first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: Participate in code reviews to learn and help others

### Recognition

We recognize contributors through:

- **Contributor List**: Maintained in README.md
- **Release Notes**: Contributors mentioned in release notes
- **Special Recognition**: Outstanding contributions highlighted

## Development Workflow

### Branching Strategy

- **main**: Production-ready code
- **develop**: Integration branch for ongoing development
- **feature/***: Feature development branches
- **hotfix/***: Critical bug fixes
- **release/***: Release preparation branches

### Release Process

1. **Feature Development**: Work on feature branches
2. **Integration**: Merge to develop branch
3. **Testing**: Comprehensive testing on develop
4. **Release Preparation**: Create release branch
5. **Final Testing**: Last-minute fixes and testing
6. **Release**: Merge to main and tag release

### Continuous Integration

All pull requests trigger automated checks:

- **Linting**: ESLint validation
- **Testing**: Full test suite execution
- **Coverage**: Code coverage reporting
- **Security**: Dependency vulnerability scanning

## Resources

### Documentation

- [README.md](README.md) - Project overview and quick start
- [Architecture Documentation](docs/) - Detailed system architecture
- [API Documentation](docs/api/) - API reference (when available)

### Tools and Services

- **GitHub Actions**: CI/CD automation
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **YouTube API**: Video management integration

### Learning Resources

- [PMP Certification Guide](https://www.pmi.org/certifications/project-management-pmp)
- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Questions?

If you have questions not covered in this guide:

1. Check existing [GitHub Issues](https://github.com/your-repo/issues)
2. Search [GitHub Discussions](https://github.com/your-repo/discussions)
3. Create a new issue with the "question" label

Thank you for contributing to the PMP YouTube Channel Automation System!