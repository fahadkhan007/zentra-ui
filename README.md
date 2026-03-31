<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<h1 align="center">Zentra — AI Health Assistant Frontend</h1>

<p align="center">
  A conversational AI health companion powered by a LangGraph RAG agent, ML-based obesity risk analysis, and a polished dashboard experience.
  
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat** | Streaming chat sessions with a RAG-powered Gemini agent personalised to your health profile |
| 📊 **Health Analysis** | ML-predicted obesity risk displayed on a premium animated speedometer gauge |
| 💪 **Health Profile** | View and edit your full health data — diet, activity, lifestyle habits |
| 👤 **My Profile** | Account info card with BMI snapshot, lifestyle stats, and health summary |
| 🔐 **Auth** | JWT-based signup / login / logout with persistent sessions via `localStorage` |
| 🌙 **Dark / Light mode** | One-click theme toggle with system preference support |
| 📱 **Responsive** | Mobile-first layout with a collapsible sidebar |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| State | Zustand (auth store + persistent sessions) |
| Forms | React Hook Form + Zod |
| HTTP | Axios (with request/response interceptors) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |

---

## 🗂️ Project Structure

```
src/
├── api/
│   └── client.ts          # Axios instance + all API service calls
├── components/            # Reusable UI components
├── pages/
│   ├── LandingPage.tsx    # Marketing / hero page
│   ├── LoginPage.tsx      # Sign-in form
│   ├── RegisterPage.tsx   # Sign-up form with password strength
│   ├── OnboardingPage.tsx # Multi-step health profile setup
│   ├── DashboardPage.tsx  # Main shell: sidebar + view router
│   ├── ResultsPage.tsx    # ML prediction + speedometer gauge
│   ├── ProfilePage.tsx    # Full health data editor
│   └── AccountPage.tsx    # User identity + health snapshot
├── routes/
│   └── ProtectedRoute.tsx # Auth guard HOC
├── store/
│   └── authStore.ts       # Zustand auth store (persisted)
├── App.tsx                # Route definitions
└── main.tsx               # Entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment variables

Create `.env.local` in this directory (see `.env.example`):

```env
VITE_API_BASE_URL=https://zentra-ai.up.railway.app
```

> If `VITE_API_BASE_URL` is not set, the client defaults to the Railway deployment URL.

---

## 🏗️ Build for Production

```bash
npm run build       # outputs to /dist
npm run preview     # preview the production build locally
```

---

## ☁️ Deployment (Vercel)

The frontend is configured for zero-config Vercel deployment.  
`vercel.json` includes a rewrite rule that forwards all paths to `index.html`, enabling React Router's client-side routing.

**Vercel settings:**

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variable | `VITE_API_BASE_URL` = your Railway URL |

> **Important:** After deploying, add your Vercel domain to the FastAPI `allow_origins` CORS list and redeploy the backend.

---

## 🔌 API Integration

All API calls live in `src/api/client.ts`. The Axios instance automatically:
- Attaches the Bearer token from `localStorage` on every request
- Redirects to `/login` on any `401 Unauthorized` response

| Service | Endpoints |
|---|---|
| `authApi` | `signup`, `login`, `logout`, `me` |
| `profileApi` | `create`, `get`, `update` |
| `predictApi` | `run` (triggers ML obesity prediction) |
| `chatApi` | `listSessions`, `createSession`, `getSession`, `sendMessage`, `renameSession`, `deleteSession` |

---

## 📄 License

This project is for educational and portfolio purposes.
