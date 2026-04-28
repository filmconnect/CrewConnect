# CrewConnect MVP — Claude Code Instructions

## Project Overview
CrewConnect is a portfolio and scheduling platform for freelance film crew professionals in the European film industry. This is the MVP build.

## Tech Stack
- **Framework**: Next.js 14 (App Router) — uses React 18 (NOT React 19)
- **Language**: TypeScript strict (no `any`, no `!` without comments)
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **Auth**: jose JWT + bcryptjs (custom, no NextAuth)
- **Styling**: Tailwind CSS with DM Sans font
- **File uploads**: @vercel/blob
- **PDF**: @react-pdf/renderer
- **Drag & drop**: @dnd-kit
- **Logging**: Pino + pino-pretty (dev)

## Critical: React 18 Compatibility
This project uses Next.js 14 which ships React 18. **`useActionState` does NOT exist in React 18.** 
- Use `useFormState` from `react-dom` instead
- Import: `import { useFormState } from "react-dom"`
- Signature is the same: `const [state, formAction] = useFormState(action, initialState)`
- For pending state, use `useFormStatus` from `react-dom`: `const { pending } = useFormStatus()`

## Commands
- `npm run dev` — Start dev server on localhost:3000
- `npm run build` — Production build
- `npx prisma db push` — Push schema to database
- `npm run db:seed` — Seed database with test data
- `npx prisma studio` — Visual database browser

## Test Accounts (after seed)
- marko@example.com / password123 (DP, Pro plan)
- ana@example.com / password123 (Sound Mixer, Free plan)

## Key Routes to Test
- `/` — Landing page
- `/auth/login` — Login
- `/auth/register` — Registration
- `/dashboard` — Schedule + Calendar (requires auth)
- `/dashboard/profile` — Edit profile + clips + credits
- `/dashboard/settings` — Account + invoice + booking link
- `/crew/marko-horvat` — Public profile
- `/crew/marko-horvat?key=x7k9m` — Private profile (availability + booking)
- `/book/marko-horvat` — Booking request form
- `/pro` — Pro upgrade page

## Architecture Conventions
- **Server Actions** for ALL mutations (never client-side fetch for mutations)
- Every action: `requireAuth()` → Zod validation → logic → `logger.info()` → return `{success, error?, data?}`
- **Money**: stored as INT cents in database, displayed via `formatEur(cents)` from `lib/format.ts`
- **Pino logger** imported in every server-side file
- `loading.tsx` and `error.tsx` for every route segment
- Dual-link routing: `/crew/[slug]` = public, `?key=bookingKey` = private mode

## Design System
- Primary: #111111, Gold: #DBA508, Confirmed: #1A8C5E, Danger: #C44B4B
- Buttons: border-radius 6px always
- Cards: border border-[#EEE] rounded-lg, NO shadows
- Labels: text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]
- Logo: "crew"(#111) + "connect"(#DBA508), DM Sans 700, italic

## File Structure
```
src/
├── actions/     # Server actions (auth, booking, clips, credits, crew, invoice, settings)
├── app/         # Next.js App Router pages
├── components/  # UI (Button, Input, Card, Badge, Modal), layout (Logo, Navbar), crew, dashboard, invoice
├── lib/         # Utilities (auth, prisma, logger, format, slug, availability, embed, confirmation-id)
├── types/       # Shared TypeScript interfaces
└── middleware.ts # Auth middleware for /dashboard/*
```

## Known Issues to Fix
- `useActionState` must be replaced with `useFormState` from `react-dom` in ALL client components
- Files affected: login/page.tsx, register/page.tsx, forgot-password/page.tsx, reset-password/page.tsx, ProfileForm.tsx, ClipsSection.tsx, CreditsSection.tsx, AddBookingModal.tsx, BookingForm.tsx, AccountSection.tsx, InvoiceSection.tsx, InvoiceActions.tsx
- For `isPending` (loading state), use a separate Submit button component with `useFormStatus`

## Business Rules
- Plan limits: free = 3 clips / 10 credits, pro = 5 clips / unlimited credits
- Availability strip: 14 days including weekends, 3 colors (available/booked/pending)
- Producer contact details: hidden until booking accepted
- confirmationId format: CC-YYYY-NNNNN (global counter)
- invoiceNumber format: INV-YYYY-NNNNN (per-user counter)
- Booking key regeneration: immediate, no grace period
