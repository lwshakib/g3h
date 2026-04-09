<p align="left">
  <img src="../web/public/logo.svg" alt="Axonix Logo" width="40" height="40" style="margin-right: 12px; vertical-align: middle;">
  <h1 style="display: inline-block; vertical-align: middle; margin: 0;">Axonix Server Engine</h1>
</p>

The Axonix Server is the central processing unit of the ecosystem. It manages high-concurrency workflow executions, stateful data persistence, and secure multi-provider authentication.

---

## 🏗️ Core Responsibilities

- **Workflow Execution**: Orchesrating node-based logic through a sequential execution engine.
- **SSE Status Streaming**: Providing live progress updates to the frontend via Server-Sent Events.
- **Authentication**: Managing session lifecycle and OAuth overrides via Passport.js.
- **Data Persistence**: Interfacing with PostgreSQL (Neon) for workflow and user metadata.
- **Logging**: Structured, environment-aware logging powered by Winston.

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (managed by Neon)
- **Logging**: [Winston](https://github.com/winstonjs/winston)
- **Security**: [Passport.js](https://www.passportjs.org/)

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file in this directory based on [`.env.example`](file:///d:/axonix/apps/server/.env.example). You will need:
- `DATABASE_URL` (Postgres)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`
- `RESEND_API_KEY` (for system emails)

### 2. Development
From the root of the monorepo:
```bash
pnpm run dev --filter server
```
Or run directly from this directory:
```bash
pnpm dev
```

The server will be available at [http://localhost:8080](http://localhost:8080).

---

## 📁 Source Overview

- `src/controllers/`: Business logic for workflows, authentication, and execution cycles.
- `src/services/`: Integration layers for database (Postgres) and external APIs.
- `src/middlewares/`: Security and validation layers.
- `src/app.ts`: Entry point and middleware orchestration.
- `src/envs.ts`: Typed environment variable management.

---

## 📄 License
Maintained by **lwshakib**.
