# HABITAT.

Every dream deserves an address.

[Production site](https://vishalsinghbhadoriya.github.io/habitat-real-estate/) · [Source repository](https://github.com/vishalSinghBhadoriya/habitat-real-estate)

HABITAT is an Indian real estate marketplace built with React, Vite, strict TypeScript, React Router, Tailwind CSS and custom CSS. It uses Redux Toolkit, TanStack Query, React Hook Form, Zod, react-i18next, Leaflet and optional Supabase.

## Run locally

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

The site starts in demonstration mode with fictional inventory across 14 cities. Discover properties by URL-backed filters, browse the map, save favourites, compare up to four listings, inspect illustrative plans, visualize plots, and calculate EMI, rent and acquisition costs. The listing wizard can preview entered data in this mode.

## Connect Supabase

Follow the [Dashboard setup guide](supabase/SETUP.md) for the SQL Editor scripts, Authentication settings, and end-to-end verification.

1. Create a Supabase project and apply the migrations under `supabase/migrations` in timestamp order with the Supabase CLI or SQL editor.
2. Copy `.env.example` to `.env.local`. Set the project URL and its browser-safe publishable key. Restart Vite after changing environment variables.
3. Enable email authentication and set the site URL. Add localhost and production URLs ending in `/dashboard` and `/reset-password` to the allowed Auth redirect URLs.
4. Create two test accounts to verify owner and visitor workflows against your project. Register, confirm email, create a draft, upload photographs and publish. Use the second account for a save, enquiry and visit request.

The Auth session controls owner access. Published listings appear in discovery, and private drafts appear in My listings. The wizard supports up to eight photographs and one floor plan in JPEG, PNG, WebP or AVIF, at up to 8 MB per file. Owners can delete listings from My listings, receive enquiries, and review visit requests in the dashboard. See [Architecture](ARCHITECTURE.md) for database and image access details.

## Checks

```sh
npm run lint
npm run typecheck
npm run test
npm run build
```

With a running local Supabase stack, use `supabase test db` for the pgTAP authorization suite.

With Vite running in demo mode and Microsoft Edge installed, run `node scripts/browser-smoke.mjs` for the local Playwright smoke checks. Set `HABITAT_TEST_URL` to use the production preview server.

## Deploy

HABITAT targets GitHub Pages with a repository subpath. Vite emits a matching `404.html` that loads the SPA at the original address, including query strings and authentication fragments. Native view transitions and animated floor-plan highlights work where supported, with reduced-motion styling.

1. In the GitHub repository, go to **Settings → Secrets and variables → Actions → Variables → New repository variable**. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from your existing project. The build requires both public settings. Keep service-role and database credentials in Supabase.
2. In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. In Supabase, open **Authentication → URL Configuration**. Add `https://vishalsinghbhadoriya.github.io/habitat-real-estate/dashboard` and `https://vishalsinghbhadoriya.github.io/habitat-real-estate/reset-password` to **Redirect URLs**. Set **Site URL** to `https://vishalsinghbhadoriya.github.io/habitat-real-estate/` for production. Keep the local development callback entries for local testing.
4. Push to `main` or use **Actions → Deploy HABITAT to GitHub Pages → Run workflow**. The workflow installs locked dependencies, builds and deploys `dist`.

Preview the subpath locally with `npm run build -- --mode github-pages` and `npm run preview -- --mode github-pages`. Open the preview origin at `/habitat-real-estate/`.

Supabase's default email service delivers to authorized project-team addresses. Keep email confirmation enabled and configure custom SMTP before inviting external users.

Configure Vercel for Vite, use `npm run build` with output directory `dist`, and configure the same Supabase environment variables. `vercel.json` provides client-side route fallback. Use the deployed canonical origin to generate a sitemap containing the public route list and published slug URLs. The HTML includes basic Open Graph metadata and a hero image.

## Known limitations

Hindi coverage currently centres on navigation and search. The architectural gallery uses separate illustrative studies. Listing plans, dimensions beyond headline area, and optional property documentation fields need more data entry support. Live moderation, upload content inspection, abandoned-file cleanup, account-level abuse monitoring, legal text review and production map tile capacity need operational work. WhatsApp appears when an owner explicitly opts to publish an Indian mobile number. A copy-message action is also available. See [Assets](ASSETS.md) for provenance.
