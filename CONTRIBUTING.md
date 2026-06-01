# Contributing to G3H

Thank you for your interest in contributing to G3H! We want to make contributing to this repository as easy and secure as possible. Please follow these guidelines to get started.

---

## 🛠️ Local Development & Setup Workflow

### 1. Fork and Clone the Repository
Start by forking the main `g3h` repository to your personal GitHub account. Then, clone the fork to your local workspace:

```bash
git clone https://github.com/YOUR_USERNAME/g3h.git
cd g3h
```

### 2. Configure Upstream Remote
Establish upstream tracking to receive updates from the primary repository:

```bash
git remote add upstream https://github.com/lwshakib/g3h.git
```

To sync your fork with the upstream `main` branch periodically:
```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 3. Installation
Install project workspace dependencies using `pnpm`:

```bash
pnpm install
```

---

## 🌿 Branching Strategy & Naming Conventions

Always create a new feature branch from `main` before writing code:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/your-bugfix-name
```

### Naming Conventions:
* `feature/` for new systems or components (e.g. `feature/slack-integration`)
* `bugfix/` for resolving existing issues (e.g. `bugfix/avatar-upload-crash`)
* `refactor/` for modifying structure without changing feature behaviors
* `docs/` for guideline changes or comment fixes

---

## 🧼 Code Quality & Style Guide

Before proposing changes, ensure that your code satisfies all repository quality guidelines:

### Code Formatting
Ensure all files are styled according to the Prettier config:
```bash
pnpm run format
```

Verify formatting is valid (without modifying files):
```bash
pnpm run format:check
```

### Code Validation (Linting)
Ensure your changes pass all syntax checks:
```bash
pnpm run lint
```

### Type Safety
Verify that all types compile correctly without `any` overrides or compile warnings:
```bash
pnpm run typecheck
```

### Complete Local Verification
To ensure everything compiles successfully, run a production compilation locally:
```bash
pnpm run build
```

---

## 🚀 Creating Pull Requests

When you are ready to propose your changes:

1. **Commit and Push**: Commit your changes with concise and descriptive commit messages, and push the branch to your fork:
   ```bash
   git add .
   git commit -m "feat: implement Slack trigger actions in workflow editor"
   git push origin feature/your-feature-name
   ```
2. **Open Pull Request**: Go to the primary `g3h` repository on GitHub. You should see a prompt to open a Pull Request.
3. **Use the Template**: Fill out the pull request template completely, summarizing your changes and checking off the verification checklist.
4. **Address Feedback**: Core developers may review your changes and propose adjustments. Be responsive to reviews, apply updates to your branch, and push them. They will automatically sync with the active Pull Request!
