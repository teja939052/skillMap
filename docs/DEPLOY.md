# Deploy — Skill Map

## Frontend → Vercel
```
Root: frontend
Build: npm run build
Output: dist
Env: VITE_API_URL=https://<render-api>/api/v1
```

## Backend → Render
```
Root: backend
Build: npm run build
Start: npm start
Env:
  NODE_ENV=production
  PORT=4000
  MONGO_URL=mongodb+srv://...
  DB_NAME=skillmap
  JWT_ACCESS_SECRET=<strong>
  JWT_REFRESH_SECRET=<strong>
  FRONTEND_URL=https://<vercel-url>
  REDIS_URL=redis://...
```

## Seed Demo
```
POST https://<api>/api/v1/demo/seed
POST https://<api>/api/v1/demo/reset
GET  https://<api>/api/v1/demo/status
Demo page: https://<vercel-url>/demo
```

## Verify
```
GET /api/v1/health
GET /api/v1/demo/status
Rahul 22A81A0501 AWS 32 → POST /interventions/:id/outcomes {postAssessmentAttemptId} → 71 → 89%
```

## Positioning
Architected to scale horizontally: stateless Express, indexed Mongo, modular domains. Not load-tested to 100k yet.
