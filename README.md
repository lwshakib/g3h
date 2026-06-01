# G3H — Node-Based Workflow Automation Platform

G3H is a high-performance, enterprise-grade node-based workflow automation platform designed to orchestrate visual diagrams and execution routes with seamless integrations (e.g. Gemini, OpenAI, Anthropic, Tavily, Slack, Stripe, and Discord). Built using a Next.js frontend, an Express/Node.js backend, and a PostgreSQL database.

---

## 🛠️ Technology Stack & Architecture

* **Frontend**: Next.js (Tailwind CSS, Turbopack, React, `@xyflow/react`)
* **Backend**: Node.js & Express (TypeScript, S3/R2 client storage, PostgreSQL pg pooling)
* **Monorepo Orchestration**: Turborepo, PNPM Workspaces
* **Shared UI Kit**: Shadcn/ui-inspired package (`packages/ui`)

---

## 🚀 Quickstart & Installation

To run G3H locally on your machine, follow these instructions.

### 1. Prerequisites
Ensure you have the following installed:
* **Node.js**: `v20` or higher
* **PNPM**: `v10` or higher
* **PostgreSQL**: Running instance or connection string
* **S3/Cloudflare R2**: Access key & credentials (for media storage/avatar upload)

### 2. Git Clone
```bash
git clone https://github.com/lwshakib/g3h.git
cd g3h
```

### 3. Installation
Install all package workspaces and monorepo dependencies:
```bash
pnpm install
```

### 4. Environment Configuration
Create local environment files for both workspaces:

#### Frontend (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Backend (`apps/server/.env`):
```env
# SERVER CONFIGURATION
NODE_ENV=development
PORT=8080
WEB_URL=http://localhost:3000

# DATABASE CONFIGURATION
DATABASE_URL=postgresql://postgres:password@localhost:5432/g3h

# AUTHENTICATION
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/v1/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/v1/auth/github/callback

# MEDIA STORAGE
AWS_ACCESS_KEY_ID=your-r2-access-key-id
AWS_SECRET_ACCESS_KEY=your-r2-secret-access-key
AWS_ENDPOINT=your-r2-endpoint-url
AWS_REGION=auto
AWS_S3_BUCKET_NAME=g3h-avatars
```

### 5. Infrastructure Setup (Database & Storage)
Setup the PostgreSQL database schemas and verify connection:
```bash
pnpm --filter server run infra:setup
```

---

## 💻 CLI Commands

The root workspace includes Turbo configurations to orchestrate parallel tasks across the entire monorepo:

### Running Development Servers
Start both the Next.js web application and the Express backend server concurrently:
```bash
pnpm run dev
```

### Production Build
Build all packages and applications for production optimization:
```bash
pnpm run build
```

### Code Formatting
Format the codebase using Prettier:
```bash
pnpm run format
```

### Formatting Verification
Verify formatting without modifying any files (perfect for continuous integration):
```bash
pnpm run format:check
```

### Linting
Validate codebase constraints with ESLint:
```bash
pnpm run lint
```

### TypeScript Validation
Run compile check to verify type safety:
```bash
pnpm run typecheck
```

---

## 📂 Repository Directory Structure

```text
├── apps
│   ├── server           # Express API Gateway & Controllers (Node.js/TS)
│   └── web              # React/Next.js Workflow UI Editor Client
├── packages
│   ├── eslint-config    # Shared ESLint configuration
│   ├── typescript-config# Shared compiler parameters
│   └── ui               # Tailwind CSS shared UI components & styles
├── package.json         # Workspace descriptors & main scripts
├── pnpm-workspace.yaml  # Workspace directory mappings
└── turbo.json           # Turborepo task pipeline mappings
```
