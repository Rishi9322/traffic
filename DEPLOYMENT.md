# OSTAS Free-Tier Deployment (Render + Vercel)

This guide uses only free plans.

## 1) Push repository to GitHub

Run from project root:

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

If a remote already exists, run:

```bash
git remote set-url origin <your-github-repo-url>
git push -u origin main
```

---

## 2) Deploy Backend to Render (Free)

### Option A: Render Blueprint (recommended)

1. Go to Render Dashboard → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render auto-detects `render.yaml`
4. In environment variables, set all `sync: false` secrets:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `IMAGEKIT_PUBLIC_KEY`
   - `IMAGEKIT_PRIVATE_KEY`
   - `IMAGEKIT_URL_ENDPOINT`
   - `CLIENT_ORIGIN` (set this after Vercel URL is known)
5. Deploy service
6. Verify health check: `https://<render-service>.onrender.com/health`

### Option B: Manual Web Service

1. New Web Service → Connect repo
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add env vars from `backend/.env.example`
6. Set `NODE_ENV=production`

---

## 3) Deploy Frontend to Vercel (Hobby)

1. Go to Vercel → **Add New Project**
2. Import the same GitHub repository
3. Set Root Directory to `frontend`
4. Framework preset: `Vite`
5. Add environment variables:
   - `VITE_API_URL=https://<render-service>.onrender.com/api/v1`
   - `VITE_SOCKET_URL=https://<render-service>.onrender.com`
   - `VITE_MAPTILER_KEY=<your-maptiler-key>`
   - ⚠️ Never use a Render Deploy Hook URL (`https://api.render.com/deploy/...`) for `VITE_API_URL` or `VITE_SOCKET_URL`
6. Deploy and copy the production URL

---

## 4) Finish CORS + Socket setup

Back in Render service env vars, update:

- `CLIENT_ORIGIN=https://<your-vercel-app>.vercel.app`
   - Use only the site origin (no path): `https://traffic-one-woad.vercel.app`
   - ❌ Wrong: `https://traffic-one-woad.vercel.app/login`

Then redeploy backend.

---

## 5) Validate production

- Backend health endpoint works
- Frontend loads map tiles
- Login/Register works
- Create report works
- Real-time events (`newReport`, `voteUpdate`) appear across two browser tabs

---

## 6) Free-tier caveats

- Render free web service may sleep after inactivity
- Cold starts can delay first API response
- Free map/image/database plans have monthly quotas
