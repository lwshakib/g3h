# A2A Agentic Workflow Automation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.0+-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0+-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB?logo=react&logoColor=black)](https://react.dev/)

A powerful, full-stack workflow automation platform built with Next.js that enables users to create, manage, and execute intelligent automated workflows. Connect AI models (OpenAI, Anthropic, Google Gemini), external services (Slack, Discord), and triggers (Webhooks, Stripe, Google Forms) through a visual node-based editor.

## ✨ Key Features

- **Visual Workflow Editor**: Drag-and-drop interface built with React Flow for creating complex automation workflows
- **Multiple AI Integrations**: Connect to OpenAI, Anthropic Claude, and Google Gemini for intelligent processing
- **Flexible Triggers**: Start workflows manually, via webhooks, Stripe events, or Google Form submissions
- **Service Integrations**: Send notifications to Slack and Discord, make HTTP requests
- **Web Search**: Integrate Tavily for real-time web search capabilities
- **Credential Management**: Securely store and manage API keys for all your integrations
- **Execution History**: Track workflow runs with detailed logs and status monitoring
- **Background Processing**: Reliable workflow execution powered by Inngest

## 📱 App Demo

![App Demo](public/demo.png)


## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        UI["React 19 UI"]
        Editor["Visual Workflow Editor<br/>(React Flow)"]
        State["State Management<br/>(Zustand)"]
    end

    subgraph NextJS["⚡ Next.js 16 Application"]
        Pages["App Router Pages"]
        API["API Routes"]
        Actions["Server Actions"]
    end

    subgraph Auth["🔐 Authentication"]
        BetterAuth["BetterAuth"]
    end

    subgraph Background["⚙️ Background Jobs"]
        Inngest["Inngest<br/>Event-driven Functions"]
        Queue["Task Queue"]
    end

    subgraph Database["🗄️ Data Layer"]
        Prisma["Prisma ORM"]
        PG[(PostgreSQL)]
    end

    subgraph External["🌐 External Services"]
        AI["AI Providers<br/>(OpenAI, Anthropic, Gemini)"]
        Comms["Communication<br/>(Slack, Discord)"]
        Webhooks["Webhooks<br/>(Stripe, Google Forms)"]
        Search["Web Search<br/>(Tavily)"]
    end

    UI --> Pages
    Editor --> State
    State --> API
    Pages --> BetterAuth
    API --> BetterAuth
    API --> Inngest
    Inngest --> Queue
    Queue --> External
    API --> Prisma
    Inngest --> Prisma
    Prisma --> PG
    Webhooks --> API
```

## 🔄 Workflow Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as React UI
    participant API as Next.js API
    participant Inngest as Inngest Queue
    participant Executor as Node Executor
    participant External as External Services
    participant DB as PostgreSQL

    User->>UI: Trigger Workflow
    UI->>API: POST /api/workflows/[id]/execute
    API->>DB: Create Execution Record
    API->>Inngest: Queue Workflow Event
    API-->>UI: Return Execution ID

    loop For Each Node
        Inngest->>Executor: Execute Node
        Executor->>External: Call Service (AI/Slack/etc)
        External-->>Executor: Response
        Executor->>DB: Update Execution Status
        Executor-->>Inngest: Node Complete
    end

    Inngest->>DB: Mark Execution Complete
    UI->>API: Poll Status
    API-->>UI: Execution Result
```

## 📊 Data Model

```mermaid
erDiagram
    User ||--o{ Workflow : creates
    User ||--o{ Credential : owns
    Workflow ||--o{ Node : contains
    Workflow ||--o{ Connection : has
    Workflow ||--o{ Execution : tracks
    Node ||--o{ Connection : source
    Node ||--o{ Connection : target

    User {
        string id PK
        string userId UK
        string name
        string email UK
        string imageUrl
        datetime createdAt
        datetime updatedAt
    }

    Workflow {
        string id PK
        string userId FK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }

    Node {
        string id PK
        string workflowId FK
        string name
        enum type
        json data
        json position
        datetime createdAt
    }

    Connection {
        string id PK
        string workflowId FK
        string sourceNodeId FK
        string targetNodeId FK
        string sourceOutput
        string targetInput
    }

    Credential {
        string id PK
        string userId FK
        string name
        string description
        enum nodeType
        string apiKey
    }

    Execution {
        string id PK
        string workflowId FK
        enum status
        datetime startedAt
        datetime completedAt
        string error
        json result
        string triggerType
    }
```

## 🧩 Supported Node Types

```mermaid
mindmap
  root((Workflow<br/>Nodes))
    Triggers
      Manual Trigger
      Google Form Trigger
      Stripe Webhook Trigger
    AI Providers
      OpenAI
      Anthropic Claude
      Google Gemini
    Communication
      Slack
      Discord
    Utilities
      HTTP Request
      Tavily Web Search
```

## 🛠️ Tech Stack

| Category            | Technology                                |
| ------------------- | ----------------------------------------- |
| **Framework**       | Next.js 16 (App Router)                   |
| **Language**        | TypeScript 5                              |
| **Frontend**        | React 19, React Flow, Zustand             |
| **Styling**         | Tailwind CSS 4, shadcn/ui, Motion         |
| **Database**        | PostgreSQL, Prisma ORM 7                  |
| **Authentication**  | BetterAuth                                |
| **Background Jobs** | Inngest                                   |
| **AI SDKs**         | Vercel AI SDK (OpenAI, Anthropic, Google) |
| **Validation**      | Zod 4                                     |
| **Forms**           | React Hook Form                           |
| **Notifications**   | Sonner                                    |

## 📦 Prerequisites

- **Node.js** 18.0.0 or later
- **npm** (v9+), **yarn** (v1.22+), or **pnpm**
- **PostgreSQL** database
- **BetterAuth** configured with Google OAuth
- **Inngest** account for background jobs
- (Optional) API keys for AI providers (OpenAI, Anthropic, Google)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/lwshakib/a2a-agentic-workflow-automation.git
cd a2a-agentic-workflow-automation
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/workflow_automation"

# BetterAuth Configuration
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Inngest
INNGEST_SIGNING_KEY=...
INNGEST_EVENT_KEY=...

# AI Providers (Optional - users add their own via credentials)
# OPENAI_API_KEY=...
# ANTHROPIC_API_KEY=...
# GOOGLE_GENERATIVE_AI_API_KEY=...
```

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Start Development Server

**Option A: Run services separately**

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Inngest dev server
npm run inngest:dev
```

**Option B: Run all services with mprocs**

```bash
npm run dev:all
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
a2a-agentic-workflow-automation/
├── prisma/
│   ├── migrations/           # Database migrations
│   └── schema.prisma         # Prisma schema definition
├── public/                   # Static assets
│   ├── logos/                # Integration logos
│   └── favicon_io/           # Favicons
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (dashboard)/      # Dashboard pages
│   │   │   ├── (editor)/     # Workflow editor
│   │   │   └── (rest)/       # Credentials, executions, workflows
│   │   └── api/              # API routes
│   │       ├── credentials/  # Credential CRUD
│   │       ├── executions/   # Execution management
│   │       ├── inngest/      # Inngest webhook
│   │       ├── webhooks/     # External webhooks
│   │       └── workflows/    # Workflow CRUD & execution
│   ├── components/           # Shared components
│   │   ├── react-flow/       # Flow editor components
│   │   └── ui/               # shadcn/ui components
│   ├── features/             # Feature modules
│   │   ├── editor/           # Workflow editor
│   │   ├── executions/       # Execution nodes
│   │   │   └── components/   # Node implementations
│   │   │       ├── openai/
│   │   │       ├── anthropic/
│   │   │       ├── gemini/
│   │   │       ├── slack/
│   │   │       ├── discord/
│   │   │       ├── http-request/
│   │   │       └── tavily/
│   │   └── triggers/         # Trigger nodes
│   │       └── components/
│   │           ├── manual-trigger/
│   │           ├── google-form-trigger/
│   │           └── stripe-trigger/
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and helpers
│   ├── inngest/              # Inngest functions
│   ├── actions/              # Server actions
│   ├── validators/           # Zod schemas
│   └── context/              # React contexts
├── generated/                # Generated files
│   └── prisma/               # Generated Prisma client
├── .env.example              # Example environment variables
├── mprocs.yaml               # Multi-process runner config
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## 📜 Available Scripts

| Script                   | Description                        |
| ------------------------ | ---------------------------------- |
| `npm run dev`            | Start Next.js development server   |
| `npm run build`          | Create production build            |
| `npm start`              | Start production server            |
| `npm run lint`           | Run ESLint                         |
| `npm run inngest:dev`    | Start Inngest dev server           |
| `npm run ngrok:dev`      | Start ngrok tunnel (for webhooks)  |
| `npm run dev:all`        | Run all services with mprocs       |
| `npm run migrate:dev`    | Run Prisma migrations (dev)        |
| `npm run migrate:deploy` | Run Prisma migrations (production) |

## 🔧 Adding New Node Types

To add a new node type:

1. **Define the enum** in `prisma/schema.prisma`:

   ```prisma
   enum NodeType {
     // ... existing types
     MY_NEW_NODE
   }
   ```

2. **Create the node component** in `src/features/executions/components/my-new-node/`:

   ```
   my-new-node/
   ├── actions.ts    # Server actions
   ├── dialog.tsx    # Configuration dialog
   ├── executor.ts   # Execution logic
   └── node.tsx      # Visual node component
   ```

3. **Register the executor** in `src/features/executions/lib/executor-registry.ts`

4. **Run migrations**: `npm run migrate:dev`

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to learn how you can help improve this project.

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [BetterAuth](https://better-auth.com/) - Authentication and user management
- [Inngest](https://www.inngest.com/) - Background job processing
- [React Flow](https://reactflow.dev/) - Node-based workflow editor
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful icons
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI provider integrations

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/lwshakib">Shakib Khan</a>
</p>
