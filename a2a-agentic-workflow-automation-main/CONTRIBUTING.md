# Contributing to A2A Agentic Workflow Automation

Thank you for your interest in contributing! We welcome all forms of contributions, including bug reports, bug fixes, documentation improvements, and feature requests.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Code Review Process](#code-review-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/lwshakib/a2a-agentic-workflow-automation.git
   cd a2a-agentic-workflow-automation
   ```
3. **Set up** the development environment (see Development Setup below)
4. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-short-description
   ```
5. **Make your changes** following our coding standards
6. **Test** your changes thoroughly
7. **Commit** your changes with a clear commit message
8. **Push** your branch to your fork
9. **Open a Pull Request** against the `main` branch

## Development Setup

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Pull Request Process

1. Ensure your code passes all tests and linting checks
2. Update the documentation as needed
3. Include unit tests for new features
4. Ensure your branch is up to date with the latest changes from `main`
5. Submit your pull request with a clear description of the changes

## Coding Standards

- Follow the existing code style (2 spaces for indentation, single quotes for strings, etc.)
- Write clear, self-documenting code with appropriate comments
- Keep functions small and focused on a single responsibility
- Add TypeScript types where applicable
- Follow the project's ESLint and Prettier configurations

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Example:

```
feat(auth): add login functionality

- Add login form component
- Implement authentication service
- Add login/logout functionality

Closes #123
```

## Reporting Issues

When reporting issues, please include:

- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser/OS version
- Any relevant error messages or logs

## Feature Requests

For feature requests, please:

1. Explain the feature you'd like to see
2. Describe why this feature would be valuable
3. Include any relevant use cases or examples

## Code Review Process

1. A maintainer will review your PR and provide feedback
2. Address any feedback and push your changes
3. Once approved, your PR will be merged by a maintainer

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE).

---

Thank you for helping improve this project! Your contributions are greatly appreciated.
