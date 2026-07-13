# Eurotherapy Sign-Up Form

Offline-capable tablet sign-up form for Eurotherapy show events.
Built by JH Technical Solutions.

**Live at:** `https://eurotherapy.jhtechnicalsolutions.co.uk` (temporary hosting on JH Technical Solutions' domain + GitHub, until Eurotherapy take it in-house).

---

## How it works

- Hosted on **GitHub Pages** from this repo (`JH-TechSol/eurotherapy-signup`), auto-deploys on every push to `main`
- Works fully **offline** — service worker caches the page on first load
- Sign-ups save to the tablet's **localStorage** when offline
- Auto-syncs to a **Google Sheet** when connectivity returns
- Consultant selects today's **show** on first open — tagged to all sign-ups that session
- The service worker is network-first for the page itself, so pushed updates reach tablets automatically whenever they have signal; assets stay cache-first for instant offline loads
- Sync entries carry an **Entry ID**; the Google Apps Script skips IDs it has already stored, so flaky WiFi at a show can't create duplicate rows

---

## Initial setup

### Step 1 — Google Sheet backend (one time, ~10 minutes)

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet
2. Name it **Eurotherapy Signups**
3. Click **Extensions → Apps Script**
4. Delete all existing code, paste the entire contents of `google-apps-script.js`
5. Click **Save** (floppy disk icon), name the project anything
6. Click **Deploy → New deployment**
7. Set:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy** — copy the **Web App URL** (looks like `https://script.google.com/macros/s/ABC.../exec`)
9. Open `index.html` and replace this line:
   ```
   const SYNC_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
   ```
   with your actual URL, then commit and push.

> **Note:** the form POSTs to the script with `Content-Type: text/plain`. This is deliberate — Apps Script web apps can't answer CORS preflight requests, and `application/json` would trigger one. Don't "fix" it back.

### Step 2 — GitHub Pages (already done)

The repo lives at `JH-TechSol/eurotherapy-signup`. Every push to `main` deploys via the `Deploy to GitHub Pages` workflow (`.github/workflows/deploy-pages.yml`) — usually live within ~30 seconds.

Fallback URL (always works, no DNS needed): `https://jh-techsol.github.io/eurotherapy-signup/`

### Step 3 — Custom subdomain

DNS for `jhtechnicalsolutions.co.uk`:

```
Type:    CNAME
Name:    eurotherapy
Target:  jh-techsol.github.io
```

Then in the repo → **Settings → Pages → Custom domain** → enter `eurotherapy.jhtechnicalsolutions.co.uk` and tick **Enforce HTTPS** once the certificate is issued (usually a few minutes).

---

## Fully Kiosk Browser setup (on each tablet)

1. Install **Fully Kiosk Browser** from Google Play (free)
2. Open Fully Kiosk → Settings → **Start URL:**
   ```
   https://eurotherapy.jhtechnicalsolutions.co.uk
   ```
3. Settings → **Kiosk Mode** → Enable
4. Settings → **Keep Screen On** → Enable
5. Settings → **Motion Detection** → Auto-reload on motion (optional, good for show stand)
6. Settings → **Admin PIN** → Set a PIN (e.g. 1234) — this is what you use to exit kiosk mode
7. To exit kiosk mode at any time: swipe down from top → tap padlock icon → enter PIN

**To load it the first time:** make sure the tablet has WiFi, open the URL — the service worker will cache everything locally. After that it works offline.

---

## Updating the shows list

Open `index.html` and find this section near the top of the `<script>` block:

```javascript
const SHOWS = [
  "IHS 2026",
  "Royal Cornwall Show",
  "Badminton Horse Trials",
  // Add new shows here
];
```

Add or remove shows, commit and push to `main` — GitHub Pages auto-deploys within ~30 seconds. Next time the tablet has signal and opens the page, it picks up the update (the service worker fetches the page network-first).

---

## Viewing the data

Open the **Eurotherapy Signups** Google Sheet. Data columns:

| Timestamp | First Name | Last Name | Email | Phone | Conditions | Email Consent | Show / Event | Entry ID |

When Zoho Campaigns is ready for Andrea, export the sheet as CSV and import directly into Campaigns (the Entry ID column can be dropped on import — it's only used for de-duplication).

---

## Offline behaviour

- First load with WiFi: service worker caches the full page
- Subsequent opens: loads from cache instantly (no signal needed)
- Sign-ups: saved to localStorage on device immediately
- Back online: auto-syncs all queued entries to Google Sheet
- Manual sync: tap "Sync Now" in the top-right of the form
- Queue count: displayed in the header bar ("3 entries waiting to sync")

---

## Moving to permanent hosting later

The site is a plain static folder — any static host works (Cloudflare Pages, Netlify, Eurotherapy's own hosting). Point the host at the repo root, no build step. If the URL changes, update the Start URL in Fully Kiosk on each tablet and let it load once with WiFi. The `_headers` file contains cache-control rules for Cloudflare Pages if that route is taken.

---

## Troubleshooting

**Form not loading offline:** Make sure the tablet visited the URL at least once with WiFi before going to the event.

**Data not syncing:** Check the SYNC_URL in index.html is set correctly and the Google Apps Script is deployed as "Anyone" access.

**How to exit Fully Kiosk:** Swipe down from the top of the screen → padlock icon → enter admin PIN.

**Lost the admin PIN:** Uninstall and reinstall Fully Kiosk (data in localStorage is preserved on Android — it survives app reinstall as long as you don't factory reset).

---

*Built by JH Technical Solutions — jake@jhtechnicalsolutions.co.uk*
