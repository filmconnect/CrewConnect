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

### 3. Seed test producers
```powershell
npx tsx prisma/seed-producers.ts
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
