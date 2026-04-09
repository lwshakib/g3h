<p align="left">
  <img src="public/logo.svg" alt="Axonix Logo" width="40" height="40" style="margin-right: 12px; vertical-align: middle;">
  <h1 style="display: inline-block; vertical-align: middle; margin: 0;">Axonix Web Portal</h1>
</p>

This is the primary frontend for the Axonix ecosystem. It provides an intuitive, high-performance interface for building, managing, and monitoring agentic workflows.

---

## 🔥 Key Features

- **Visual Workflow Builder**: A drag-and-drop editor powered by `@xyflow/react` for designing complex node-based logic.
- **Real-time Monitoring**: Live status updates for workflow executions using Server-Sent Events (SSE).
- **Authentication**: Secure sign-in/up flows with Google and GitHub OAuth integration.
- **Environment Management**: Interface for managing project variables and credentials.
- **Responsive Settings**: Personalized user profiles and application settings.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State & Logic**: [React](https://react.dev/), [Lucide Icons](https://lucide.dev/)
- **Flow Engine**: [@xyflow/react](https://reactflow.dev/)

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file in this directory based on [`.env.example`](file:///d:/axonix/apps/web/.env.example):

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 2. Development
From the root of the monorepo, run:
```bash
pnpm run dev --filter web
```
Or run directly from this directory:
```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `(auth)/`: Authentication routes (Sign-in, Sign-up, Verification).
  - `(main)/`: Core application routes (Home, Workflows, Settings).
- `components/`: Local UI components specific to the web portal.
- `lib/`: Utility functions and services (e.g., `auth-client.ts`).
- `public/`: Static assets including the project logo and icons.

---

## 📄 License
Maintained by **lwshakib**.
