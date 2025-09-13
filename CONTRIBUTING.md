# Contributing to Project Estimation Assistant

We welcome contributions to the Project Estimation Assistant! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/project-estimation-assistant.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Set up the development environment following the README instructions

## 📋 Development Setup

### Prerequisites
- Node.js 18+
- Flutter 3.0+
- Ollama (for local AI testing)

### Environment Setup
```bash
# Copy environment template
cp backend_api/.env.example backend_api/.env

# Install dependencies
cd backend_api && npm install
cd ../frontend_flutter && flutter pub get
```

## 🧪 Testing

### Backend Tests
```bash
cd backend_api
npm test
```

### Frontend Tests
```bash
cd frontend_flutter
flutter test
```

### Manual Testing
```bash
# Start the application
./start-app.sh

# Test all features:
# - Project estimation generation
# - Export functionality (CSV, XLSX, PDF)
# - Multi-provider LLM support
# - Mobile responsiveness
```

## 📝 Code Style

### Backend (TypeScript)
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Zod for validation schemas
- Include comprehensive error handling
- Add JSDoc comments for public APIs

### Frontend (Dart/Flutter)
- Follow Dart style guide
- Use Riverpod for state management
- Implement proper error boundaries
- Add widget tests for UI components
- Use responsive design patterns

## 🔧 Commit Guidelines

Use conventional commits with descriptive messages:

```bash
feat: add new estimation algorithm
fix: resolve export file encoding issue
docs: update API documentation
test: add unit tests for role mapping
refactor: improve LLM provider abstraction
```

## 🎯 Areas for Contribution

### High Priority
- **Mobile UI Improvements**: Enhanced touch interactions and responsive design
- **Additional LLM Providers**: Support for more AI services
- **Export Enhancements**: New formats and customizable templates
- **Performance Optimization**: Faster estimation generation

### Medium Priority
- **Internationalization**: Support for more languages
- **Advanced Analytics**: Historical estimation tracking
- **Integration APIs**: JIRA, GitHub, Slack integrations
- **Testing Coverage**: Increase test coverage to 90%+

### Documentation
- **API Documentation**: OpenAPI/Swagger specs
- **Video Tutorials**: Setup and usage guides
- **Architecture Docs**: System design documentation
- **Deployment Guides**: Production deployment instructions

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, Flutter version
2. **Steps to Reproduce**: Clear, numbered steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Logs**: Relevant error messages or logs

## 💡 Feature Requests

For new features, please provide:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other approaches considered
4. **Implementation Notes**: Technical considerations

## 🔍 Code Review Process

1. **Automated Checks**: All tests must pass
2. **Code Quality**: ESLint/Dart analyzer must pass
3. **Documentation**: Update relevant docs
4. **Testing**: Add tests for new functionality
5. **Review**: At least one maintainer approval required

## 📦 Release Process

1. **Version Bump**: Update version in package.json and pubspec.yaml
2. **Changelog**: Update CHANGELOG.md with new features/fixes
3. **Testing**: Run full test suite
4. **Documentation**: Update README if needed
5. **Release**: Create GitHub release with notes

## 🤝 Community Guidelines

- **Be Respectful**: Treat all contributors with respect
- **Be Constructive**: Provide helpful feedback
- **Be Patient**: Allow time for responses
- **Be Collaborative**: Work together towards solutions

## 📞 Getting Help

- **Issues**: Create a GitHub issue for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check README and docs first
- **Community**: Join our community channels

## 🏆 Recognition

Contributors will be recognized in:
- **README**: Contributors section
- **Releases**: Release notes acknowledgments
- **Documentation**: Author credits where applicable

Thank you for contributing to Project Estimation Assistant! 🎉
