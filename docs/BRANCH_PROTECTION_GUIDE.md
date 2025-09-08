# Branch Protection and Workflow Guide

This document outlines the branch protection rules and workflow requirements for the PMP YouTube Channel project.

## Branch Protection Rules

### Main Branch Protection

The `main` branch is protected with the following rules:

- **Required Status Checks**: All CI checks must pass
  - `ci/lint` - Code linting validation
  - `ci/test` - Test suite execution
  - `ci/security-scan` - Security vulnerability scanning
- **Required Pull Request Reviews**: 1 approving review required
- **Dismiss Stale Reviews**: Enabled - reviews are dismissed when new commits are pushed
- **Require Code Owner Reviews**: Enabled - code owners must approve changes
- **Require Conversation Resolution**: All conversations must be resolved
- **Restrict Force Pushes**: Disabled - force pushes are not allowed
- **Allow Deletions**: Disabled - branch cannot be deleted

### Develop Branch Protection

The `develop` branch has lighter protection:

- **Required Status Checks**: Basic CI checks must pass
  - `ci/lint` - Code linting validation
  - `ci/test` - Test suite execution
- **Required Pull Request Reviews**: 1 approving review required
- **Dismiss Stale Reviews**: Disabled - allows for iterative development
- **Require Code Owner Reviews**: Disabled - more flexible for development
- **Restrict Force Pushes**: Disabled - force pushes are not allowed

## Branch Naming Conventions

All branches must follow these naming patterns:

### Feature Branches
```
feature/PMP-123-implement-youtube-api
feature/PMP-456-add-content-generator
```

### Bug Fix Branches
```
bugfix/PMP-789-fix-upload-timeout
hotfix/PMP-101-critical-security-fix
```

### Other Branch Types
```
docs/update-readme
config/setup-eslint
test/add-integration-tests
refactor/cleanup-automation
chore/update-dependencies
```

### Branch Naming Rules
- Use kebab-case for descriptions
- Include Linear task ID for feature/bugfix/hotfix branches
- Keep descriptions concise but descriptive
- Use appropriate prefixes for branch types

## Pull Request Requirements

### PR Template Completion

All pull requests must complete the PR template with:

- **Summary**: Clear description of changes
- **Type of Change**: Select appropriate change type
- **Linear Task Reference**: Include Linear task ID (PMP-XXX)
- **Changes Made**: List specific changes
- **Testing**: Describe testing performed
- **Code Quality Checklist**: Complete all applicable items
- **Documentation**: Update relevant documentation

### Required Checkboxes

At minimum, these checkboxes must be checked:
- [ ] Self-review of code completed
- [ ] Code follows project style guidelines
- [ ] All existing tests pass

### Linear Task Integration

Every PR must reference a Linear task:
- Include task ID in PR title, description, or branch name
- Use format: `PMP-123`
- Link provides traceability between development and project management

## Automated Labeling System

The system automatically applies labels based on:

### File Changes
- `documentation` - Changes to .md files or docs/
- `github-actions` - Changes to .github/workflows/
- `configuration` - Changes to config files
- `automation` - Changes to automation scripts
- `content` - Changes to content or templates
- `testing` - Changes to test files
- `wordpress` - Changes to PHP or WordPress files
- `docker` - Changes to Docker configuration

### PR Content
- `bug` - Contains keywords: fix, bug, error, issue
- `enhancement` - Contains keywords: feat, feature, enhance, improve
- `breaking-change` - Contains keywords: breaking, major, remove
- `security` - Contains keywords: security, vulnerability, auth
- `performance` - Contains keywords: perf, optimize, speed
- `refactor` - Contains keywords: refactor, clean, restructure

### Size Labels
- `size/XS` - < 10 lines changed
- `size/S` - 10-30 lines changed
- `size/M` - 30-100 lines changed
- `size/L` - 100-500 lines changed
- `size/XL` - > 500 lines changed

### Priority Labels
- `priority/high` - Contains: urgent, critical, hotfix
- `priority/medium` - Contains: important, priority
- `priority/low` - Default for other PRs

### Status Labels
- `status/wip` - Contains: wip, work in progress, draft
- `status/ready-for-review` - Contains: ready for review, please review
- `needs-linear-reference` - Missing Linear task reference
- `needs-template-completion` - PR template not completed
- `merge-conflict` - PR has merge conflicts

## Validation Workflows

### Branch Naming Validation
- Validates branch names against approved patterns
- Fails CI if branch name doesn't follow conventions
- Provides guidance on correct naming patterns

### PR Template Validation
- Checks for required template sections
- Ensures checkboxes are marked
- Validates Linear task references
- Adds labels for missing requirements

### Merge Conflict Detection
- Automatically detects merge conflicts
- Adds appropriate labels
- Provides resolution guidance

## Code Ownership

The CODEOWNERS file defines review requirements:

- **Global**: All changes require maintainer review
- **GitHub Actions**: DevOps team review required
- **Automation**: Automation team review required
- **WordPress**: WordPress team review required
- **Documentation**: Docs team review required
- **Security Files**: Security team review required

## Best Practices

### For Contributors
1. Always create feature branches from `develop`
2. Use descriptive branch names with Linear task IDs
3. Complete the PR template thoroughly
4. Ensure all CI checks pass before requesting review
5. Respond to review feedback promptly
6. Keep PRs focused and reasonably sized

### For Reviewers
1. Review code quality and maintainability
2. Verify test coverage and quality
3. Check security implications
4. Ensure documentation is updated
5. Validate Linear task alignment
6. Provide constructive feedback

### For Maintainers
1. Enforce branch protection rules consistently
2. Monitor automated labeling accuracy
3. Update validation rules as needed
4. Maintain CODEOWNERS file
5. Review and approve workflow changes

## Troubleshooting

### Common Issues

**Branch Name Validation Failed**
- Check branch name against approved patterns
- Include Linear task ID for feature/bugfix branches
- Use kebab-case for descriptions

**PR Template Validation Issues**
- Complete all required sections
- Mark appropriate checkboxes
- Include Linear task reference

**Merge Conflicts**
- Sync branch with latest base branch changes
- Resolve conflicts in affected files
- Push resolved changes

**Missing Required Reviews**
- Ensure code owners have approved
- Check that all required reviewers have approved
- Verify all conversations are resolved

### Getting Help

- Check this documentation first
- Review GitHub Actions workflow logs
- Ask in project discussions
- Contact maintainers for complex issues