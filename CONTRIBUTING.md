# Contributing to ShopEValley

## Code of Conduct

Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a clear bug report with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details

### Suggesting Features

1. Check if similar features exist
2. Provide clear use cases
3. Explain how it benefits users

### Code Contributions

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/description
   ```
3. Follow code style guidelines
4. Make commits with clear messages:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve issue"
   git commit -m "docs: update documentation"
   ```
5. Push to your fork
6. Create a pull request with description

## Development Guidelines

### TypeScript
- Use strict mode
- Define proper types for all variables
- Avoid using `any` type

### Components
- Keep components focused and single-responsibility
- Use meaningful names (PascalCase for components)
- Add PropTypes or TypeScript interfaces
- Document complex logic

### Styling
- Use Tailwind CSS utility classes
- Avoid inline styles
- Maintain consistency with existing styles

### Commits
- Write clear, descriptive commit messages
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for styling changes
  - `refactor:` for code refactoring
  - `test:` for tests
  - `chore:` for maintenance

### Pull Requests
- Provide clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Keep PRs focused and manageable

## Code Review Process

1. At least one review required
2. Address all feedback
3. Update PR based on comments
4. Squash commits before merge
5. Delete branch after merge

## Getting Help

- Check documentation in `/docs`
- Ask questions in discussions
- Tag maintainers if needed

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to ShopEValley! 🎉
