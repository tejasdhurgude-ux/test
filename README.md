# Sahyadri Billing System

React + TypeScript + Vite billing app for Sahyadri fireworks: product search, cart, customer checkout, saving to Google Sheets (via Apps Script), and WhatsApp bill sharing. Staff sign in with Firebase Authentication.

> Nothing here is "working" against Firebase or Sheets until you complete the setup below and test it yourself. Unit tests cover search, cart, totals, validation, duplicate-submission prevention and route protection, but not live Firebase/Apps Script calls.

## 1. Run locally
```bash
npm install
cp .env.example .env     # fill in after step 2 and 4
npm run dev              # http://localhost:5173
npm test                 # Vitest + React Testing Library
npm run build            # type-check + production build into dist/
```

## 2. Firebase Authentication
1. Create a project at https://console.firebase.google.com.
2. Build > Authentication > Get started > enable **Email/Password**. Leave self-registration off: the app has no sign-up screen. Add staff under Authentication > Users > Add user.
3. Project settings > General > Your apps > Web app (`</>`). Copy `apiKey`, `authDomain`, `projectId`, `appId` into `.env` (`VITE_FIREBASE_*`). These are public identifiers, not secrets.
4. Authentication > Settings > Authorized domains: add your production domain later (step 6).

Security note: a protected React route only controls the UI. Real enforcement is the Apps Script verifying the Firebase ID token and a staff allowlist on every save.

## 3. Google Sheet
Create a blank Google Sheet and copy its ID (the long string in the URL between `/d/` and `/edit`). The script creates the **Bills** and **Bill Items** tabs and headers on first save.

## 4. Apps Script
1. In the Sheet: Extensions > Apps Script. Replace the code with `apps-script/Code.gs`.
2. Project Settings > Script properties, add:
   - `SHEET_ID`: the Sheet ID
   - `FIREBASE_API_KEY`: same web API key as in `.env`
   - `STAFF_EMAILS`: comma-separated emails allowed to bill (must match Firebase users)
3. Deploy > New deployment > type **Web app**: Execute as **Me**, Who has access **Anyone**. Authorize when prompted. Copy the `/exec` URL into `VITE_APPS_SCRIPT_URL`.
4. After editing the script later, use Deploy > Manage deployments > Edit > New version (the URL stays the same).

**Execution identity and access.** The script runs as you (the owner), so it can write to your Sheet; callers never get Sheet access. "Anyone" is required because Apps Script web apps cannot validate Firebase sign-ins themselves, so the browser can't use Google's own login for this. That makes the URL public, so the script rejects every request without a valid Firebase ID token (verified against Google's Identity Toolkit) from an allowlisted email. Totals and prices are recomputed from the catalogue inside the script; client totals are ignored. Retrying a bill with the same bill ID returns the saved result instead of writing a duplicate.

Limitations: the catalogue is duplicated in `Code.gs` and `src/data/products.ts`, so change both when prices change. Apps Script quotas and latency (1-3 s) apply. If you outgrow this, move the check to Cloud Functions/Firebase with Firestore (Admin SDK verifies tokens natively).

## 5. Build
```bash
npm run build
```

## 6. Deploy (free static hosting)
Options: **Firebase Hosting** (`npm i -g firebase-tools && firebase login && firebase init hosting` with public dir `dist`, SPA rewrite yes, then `firebase deploy`; `firebase.json` is included) or **Cloudflare Pages** (connect the GitHub repo, build `npm run build`, output `dist`). Set the five `VITE_*` variables in the host's settings before building.

Check the provider's current terms for commercial use before relying on it: free tiers differ (for example, Vercel's Hobby plan is restricted to non-commercial use). After deploying, add the live domain to Firebase Authorized domains.

## 7. Test on a second device
Open the deployed URL on a phone, sign in with a staff account, add products, create a bill with a real phone number you own, confirm a new row appears in both tabs, then tap Share on WhatsApp. WhatsApp only prefills the message; the operator must press send, and the app never claims it was delivered. Retry the same bill (e.g. by going offline mid-save) and confirm no duplicate row appears.

## Notes
- Search: case-insensitive, AND across tokens, each token matches the start of a word in name or packaging (`src/utils/searchProducts.ts`). Filtering is derived, not stored in state.
- Discounts are not implemented (the column exists in the Sheet, always 0).
- Cart persists in `sessionStorage` so a refresh or failed save doesn't lose it; it clears after a successful save or on logout.
