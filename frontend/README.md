# Frontend — Next.js (App Router) + TypeScript + Tailwind + GSAP

Clone of the Figma file **e-bike-figma** (design tokens, spacing, type scale and breakpoints taken 1:1 from Figma).

## Run
```bash
npm install
cp .env.example .env.local     # optional: set NEXT_PUBLIC_API_URL
npm run dev                    # http://localhost:3000
```

Images are served locally from `/public/images` and `/public/brand/`.

## Connect your backend (only these places)
| What | File |
|---|---|
| Base URL | `.env.local` → `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:5000/api`) |
| Route paths | `src/lib/api/endpoints.ts` |
| Fetch wrapper (cookies, errors, `{data}` unwrapping) | `src/lib/api/client.ts` |
| Types — map your model here | `src/lib/api/types.ts` |
| Services: products, cart, auth, orders/checkout, newsletter/contact | `src/lib/api/*.ts` |

Home page calls `getFeaturedMotorcycles()`. If the API is unset/unreachable it
falls back to the Figma sample data (`src/data/seed.ts`), so the UI never breaks.

## Change the brand / logo
Edit `src/config/brand.ts` (name, descriptor, city, tagline). To use your own
logo, put it in `public/brand/` and set `logoSrc: '/brand/logo.svg'`.

## Structure
```
src/
  app/                 layout.tsx, page.tsx (Home), globals.css
  components/
    layout/            Header, Footer, Logo, NewsletterForm
    home/              Hero(+GSAP), Metrics, Collection, Philosophy, Engineering,
                       Charging, Quote, Journal, Invitation
    ui/                Button, Eyebrow, Section, Photo (art-directed), ProductCard
    providers/         CartProvider (guest cart), ScrollReveal (GSAP)
  config/brand.ts      brand name + logo
  content/             static copy
  lib/api/             all backend access
  lib/gsap.ts          GSAP + ScrollTrigger registration
```

## Breakpoints
Mobile = Figma 390px frame (base styles). Desktop = Figma 1440px frame (`lg:` ≥ 1024px, content capped at 1440px).

## Status
- [x] Foundation, design tokens, fonts, API layer, cart state
- [x] Header + Footer (desktop & mobile)
- [x] Home (desktop & mobile) with GSAP hero entrance + scroll reveals
- [ ] Products, Product details, About, Contact, Cart, Checkout
