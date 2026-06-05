# CrewConnect Producers + AI — Installation Guide

## Files in this package

### Replace existing (2 files):
- `prisma/schema.prisma` — REPLACES existing (adds Producer models at the end)
- `src/middleware.ts` — REPLACES existing (adds producer route protection)

### New files (19 files):
- `prisma/seed-producers.ts` — seed script for test producers
- `src/lib/ai/types.ts` — AI domain types
- `src/lib/ai/scoring.ts` — 7-factor match engine
- `src/lib/ai/parse.ts` — LLM brief parser (Anthropic API)
- `src/lib/ai/recommend.ts` — collaborative filtering
- `src/lib/producer-auth.ts` — producer session management
- `src/actions/producers.ts` — server actions (request, signin, signout, save)
- `src/app/producers/layout.tsx` — layout with CSS import
- `src/app/producers/producers.css` — producer-specific styles
- `src/app/producers/page.tsx` — gate/landing page
- `src/app/producers/request/page.tsx` — request access form
- `src/app/producers/signin/page.tsx` — sign in form
- `src/app/producers/home/page.tsx` — producer dashboard
- `src/app/producers/search/page.tsx` — AI search page
- `src/app/api/producers/search/route.ts` — search API endpoint
- `src/components/producers/ProducerShell.tsx` — header/shell
- `src/components/producers/MatchCard.tsx` — result card with chips
- `src/components/producers/MatchRing.tsx` — score ring SVG
- `src/components/producers/ForProducersLink.tsx` — link/banner for crew pages

## Installation steps (PowerShell)

### 1. Extract files
Unzip into project root. It will place files in correct directories.

### 2. Push Prisma schema
```powershell
npx prisma db push
```

### 3. Seed test producers + demo crew
```powershell
npm run db:seed:producers
```
This inserts 3 producer accounts (eva, marco, pending) and 20 demo crew
profiles (5 DPs, 3 gaffers, 2 sound mixers, 2 editors, 2 drone ops, 2
camera ops, 2 1st ADs, 1 colorist, 1 steadicam op) with credits. It is
idempotent — re-running upserts producers and refreshes the seed-tagged
crew data without touching user-added credits or the existing real
`marko-horvat` profile.

To seed both the original crew test accounts (`marko@example.com`,
`ana@example.com`) and the producer + demo crew in one go:
```powershell
npm run db:seed:all
```

### 4. Add ANTHROPIC_API_KEY (optional, for AI parsing)
Add to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Without it, the keyword fallback parser works — just less smart.

### 5. Test
```powershell
npm run dev
```
- Visit http://localhost:3000/producers — gate page
- Visit http://localhost:3000/producers/request — request access
- Visit http://localhost:3000/producers/signin — sign in as eva@serviceplan.com / producer123
- Visit http://localhost:3000/producers/search — AI search

### 6. Deploy
```powershell
git add .
git commit -m "feat: Producers area + AI matching engine"
git push origin main
```
Add `ANTHROPIC_API_KEY` to Vercel Environment Variables if using LLM parsing.

### 7. Seed the production database

The AI search route always reads from the DB — there is no in-route
fallback. Production needs the same 20 demo crew + 3 test producers to
return useful results, so run the seed once against the prod Neon DB:

1. Copy `DATABASE_URL` from Vercel → Project → Settings → Environment
   Variables (the Neon pooled URL). Optionally also `DIRECT_URL`.
2. From your local checkout, run the seed with that URL inlined:
   ```powershell
   $env:DATABASE_URL = "<prod-neon-pooled-url>"
   $env:DIRECT_URL   = "<prod-neon-direct-url>"
   npm run db:seed:producers
   Remove-Item Env:DATABASE_URL, Env:DIRECT_URL
   ```
3. The script logs `19 created, 1 updated, 20 total` for crew and the
   three producers. Re-run any time to refresh the seed-tagged data.

If you prefer the Vercel CLI flow (`vercel env pull .env.production`),
just point the script at that env file: `npx dotenv-cli -e .env.production -- npm run db:seed:producers`.
