# Deploy to Render

The root `render.yaml` creates a Node web service and PostgreSQL database. Express serves the built React app and `/api` on the same HTTPS origin.

1. Commit and push the deployment changes to your GitHub repository. Never commit `.env`, runtime logs, or `.postgres-runtime` (local database files). Removal of previously tracked runtime files is staged; local copies are preserved. This cleanup does not remove files from earlier Git history.
2. Sign in at https://dashboard.render.com and select **New > Blueprint**.
3. Connect `Shakz04/Fitness_Optimizer`, select the branch containing `render.yaml`, and review the resources before deploying.
4. Render generates `JWT_SECRET` and wires `DATABASE_URL` automatically. Optionally add `GEMINI_API_KEY` in the web service environment for AI features. Keep secrets server-side; no `VITE_` secret variables.
5. Deploy and wait for the web service to become healthy. Open its `https://...onrender.com` URL and create your own account.

Build: `npm ci --include=dev && npm run build`

Start: `npm run db:deploy && npm run prisma:seed && npm start`

Startup applies committed migrations and seeds foods idempotently. Production seeding does not create a demo user. The free service runs migrations at startup because pre-deploy commands require a paid service. For a paid service, move migration/seeding commands to `preDeployCommand` and use `npm start` as the start command.

The Blueprint selects free plans for a trial deployment. Render's free PostgreSQL database expires after 30 days; upgrade or use an existing persistent PostgreSQL database for ongoing use. See https://render.com/docs/free.

Verify `/api/health`, `/api/foods`, signup/login, and refreshing an application route. Production database failures never fall back to temporary memory storage.

Local production preview (PowerShell), after building and configuring `.env`:

```powershell
$env:NODE_ENV = 'production'
$env:PORT = '4001'
npm start
```

Open http://localhost:4001. Use a random `JWT_SECRET` of at least 32 characters. The normal `npm run dev` workflow still uses ports 5173 and 4000.

References: https://render.com/docs/blueprint-spec and https://render.com/docs/deploy-prisma-orm
