# OSTAS — Overcrowd Source Traffic Alert System

Real-time, crowd-sourced traffic alerting for Indian commuters.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- A [Turso](https://turso.tech) free account (SQLite)
- A [MapTiler](https://maptiler.com) free account (for map tiles)
- An [ImageKit](https://imagekit.io) free account

---

### Backend Setup

```bash
cd backend
cp .env.example .env   # Fill in your credentials
npm install
npm start
```

**Seed demo data:**

```bash
node utils/seed.js
```

**Backend `.env` variables:**

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_token
JWT_ACCESS_SECRET=change_me_super_secret
JWT_REFRESH_SECRET=change_me_another_secret
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yourID
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
NODE_ENV=development
```

---

### Frontend Setup

```bash
cd frontend
cp .env.example .env   # Add your MapTiler Key
npm install
npm run dev
```

**Frontend `.env` variables:**

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_MAPTILER_KEY=your_maptiler_key   ← your MapTiler API Key
```

---

## 🔑 Demo Credentials (after seeding)

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | <admin@ostas.com>   | Admin@1234 |
| User  | <rahul@test.com>    | Test@1234  |
| User  | <priya@test.com>    | Test@1234  |
| User  | <amit@test.com>     | Test@1234  |

---

## 📡 API Reference

| Method | Endpoint                         | Auth Required |
|--------|----------------------------------|---------------|
| POST   | /api/v1/auth/register            | ❌            |
| POST   | /api/v1/auth/login               | ❌            |
| POST   | /api/v1/auth/logout              | ❌            |
| POST   | /api/v1/auth/refresh             | 🍪 Cookie     |
| GET    | /api/v1/auth/me                  | 🔐 JWT        |
| GET    | /api/v1/reports                  | ❌            |
| POST   | /api/v1/reports                  | 🔐 JWT        |
| GET    | /api/v1/reports/:id              | ❌            |
| PATCH  | /api/v1/reports/:id              | 🔐 JWT        |
| DELETE | /api/v1/reports/:id              | 🔐 JWT        |
| PATCH  | /api/v1/reports/:id/resolve      | 🔐 JWT        |
| POST   | /api/v1/reports/:id/upvote       | 🔐 JWT        |
| GET    | /api/v1/alerts                   | 🔐 JWT        |
| POST   | /api/v1/feedback                 | ❌            |
| GET    | /api/v1/admin/stats              | 👑 Admin      |
| GET    | /api/v1/admin/reports            | 👑 Admin      |
| DELETE | /api/v1/admin/reports/:id        | 👑 Admin      |
| PATCH  | /api/v1/admin/reports/:id/flag   | 👑 Admin      |
| PATCH  | /api/v1/admin/reports/:id/resolve| 👑 Admin      |
| GET    | /api/v1/admin/users              | 👑 Admin      |
| PATCH  | /api/v1/admin/users/:id/ban      | 👑 Admin      |
| PATCH  | /api/v1/admin/users/:id/promote  | 👑 Admin      |
| GET    | /api/v1/admin/logs               | 👑 Admin      |
| GET    | /api/v1/admin/feedback           | 👑 Admin      |
| PATCH  | /api/v1/admin/feedback/:id/read  | 👑 Admin      |

---

## 🔌 Socket.io Events

| Event             | Direction       | Payload                      |
|-------------------|-----------------|------------------------------|
| `newReport`       | Server → Client | `{ report }`                 |
| `reportResolved`  | Server → Client | `{ reportId }`               |
| `reportExpired`   | Server → Client | `{ reportId }`               |
| `reportDeleted`   | Server → Client | `{ reportId }`               |
| `voteUpdate`      | Server → Client | `{ reportId, upvotes }`      |

---

## 🗂 Project Structure

```text
traffic/
├── backend/
│   ├── config/           imagekit.js, socket.js
│   ├── controllers/      authController, reportController, voteController,
│   │                     alertController, adminController, feedbackController
│   ├── db/               index.js (Turso + Drizzle), schema.js
│   ├── jobs/             expireReports.js (node-cron)
│   ├── middleware/        auth, upload, validate, rateLimiter, errorHandler
│   ├── routes/           auth, report, alert, admin, feedback
│   ├── services/         notificationService, reportService
│   ├── utils/            jwt, logger, uuid, seed
│   ├── validations/      authValidation, reportValidation, feedbackValidation
│   ├── drizzle.config.js
│   ├── server.js          ← Entry point
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/          axiosInstance, authApi, reportApi, alertApi, adminApi, feedbackApi
    │   ├── components/   layout/, map/, reports/, alerts/, admin/, ui/
    │   ├── context/      AuthContext, SocketContext
    │   ├── hooks/        useAuth, useSocket, useGeolocation, useReports,
    │   │                  useAlerts, useToast, useDebounce
    │   ├── pages/        Login, Register, Dashboard, Report, Admin,
    │   │                  Contact, About, Help, NotFound
    │   ├── store/        reportStore (Zustand)
    │   └── utils/        constants, mapHelpers, timeHelpers, validators
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## 🌐 Deployment

### Backend → Render

1. Create a new Web Service
2. Connect your GitHub repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all env variables from `.env.example`

### Frontend → Vercel

1. Import project
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_MAPTILER_KEY` env vars

### Free-tier deployment guide

- See `DEPLOYMENT.md` for a complete free-only setup using Render (backend) + Vercel (frontend).
- A Render Blueprint config is included at `render.yaml`.
