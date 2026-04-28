# CrewConnect MVP — Deploy Checklist

## 1. Neon (PostgreSQL)

- [ ] Create production project at [neon.tech](https://neon.tech)
- [ ] Copy **pooled** connection string → `DATABASE_URL`
- [ ] Copy **direct** connection string → `DIRECT_URL`
- [ ] Ensure SSL is enabled (`?sslmode=require` in URL)

## 2. Vercel

- [ ] Import repo from GitHub
- [ ] Framework preset: **Next.js** (auto-detected)
- [ ] Root directory: `./` (or `crewconnect/` if monorepo)
- [ ] Set all environment variables:

```
DATABASE_URL=postgresql://...?sslmode=require
DIRECT_URL=postgresql://...?sslmode=require
JWT_SECRET=<openssl rand -hex 32>
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=<from Google Console>
GOOGLE_CLIENT_SECRET=<from Google Console>
BLOB_READ_WRITE_TOKEN=<from Vercel Storage → Blob>
LOG_LEVEL=info
```

- [ ] Deploy and verify build succeeds

## 3. Google OAuth

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] Add production redirect URI: `https://your-domain.vercel.app/auth/google`
- [ ] Ensure `openid`, `email`, `profile` scopes are enabled
- [ ] Test: login → Google → callback → dashboard

## 4. Vercel Blob

- [ ] In Vercel dashboard → Storage → Create Blob Store
- [ ] Copy `BLOB_READ_WRITE_TOKEN` to Vercel env vars
- [ ] Test: upload avatar on profile page

## 5. Database Setup

```bash
# Push schema to production
npx prisma db push

# Seed with test data (only if empty — remove for real production)
npm run db:seed
```

## 6. Custom Domain (optional)

- [ ] Add custom domain in Vercel → Settings → Domains
- [ ] Update `NEXT_PUBLIC_BASE_URL` to match
- [ ] Update Google OAuth redirect URI to match
- [ ] DNS: add CNAME record pointing to `cname.vercel-dns.com`

## 7. Smoke Test Checklist

Run through these flows on production:

- [ ] Landing page loads with correct content
- [ ] **Registration**: name + role + country + email + password → dashboard
- [ ] **Login**: email + password → dashboard
- [ ] **Google OAuth**: login → Google → callback → dashboard
- [ ] **Profile edit**: update bio, add clip, add credit, upload avatar
- [ ] **Public profile**: visit `/crew/[slug]` → sees portfolio, no availability
- [ ] **Private profile**: visit `/crew/[slug]?key=[key]` → sees availability strip + "Request to book"
- [ ] **Booking request**: fill form on `/book/[slug]` → sent confirmation
- [ ] **Accept request**: dashboard → pending alert → View details → Accept → confirmation ID generated
- [ ] **Contact reveal**: after accept, producer email/phone visible on request detail
- [ ] **Calendar**: bookings show as colored circles on correct dates
- [ ] **Settings**: update account, regenerate booking key, save invoice details
- [ ] **Invoice**: generate invoice from accepted booking, download PDF
- [ ] **404 page**: visit `/nonexistent` → custom 404

## 8. Post-Deploy

- [ ] Verify sitemap at `/sitemap.xml`
- [ ] Verify robots at `/robots.txt`
- [ ] Check Vercel logs for any errors
- [ ] Set up Vercel Analytics (optional)
- [ ] Submit sitemap to Google Search Console
