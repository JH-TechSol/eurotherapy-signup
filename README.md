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

## Tablet setup — Route A: free (Chrome PWA + App pinning)

One-time, per tablet, with WiFi:

1. Open **Chrome** → `https://eurotherapy.jhtechnicalsolutions.co.uk` — let it load fully (caches for offline)
2. Chrome menu (⋮) → **Add to Home screen / Install app** — an "Eurotherapy" icon appears
3. Launch from the **icon** (not Chrome) — opens true fullscreen, no browser bar, no status bar
4. Settings → Security → **App pinning** (a.k.a. Screen pinning) → enable + **"Ask for PIN before unpinning"**; make sure the tablet has a screen-lock PIN
5. Settings → Display → **Screen timeout** → max/never; lock rotation to portrait
6. Test: submit a fake sign-up, watch it sync, delete the row from the Sheet

On show day: open the app → Recents → tap the app's icon on its card → **Pin**. Unpin with swipe-up-and-hold (or Back+Recents) + PIN.

---

## Tablet setup — Route B: Fully Kiosk Browser (PLUS licence ~€8.90/tablet one-time; all features free to trial)

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
const SHOW_SCHEDULE = [
  { name: "Great Yorkshire Show", start: "2026-07-14", end: "2026-07-17" },
  { name: "RWAS Royal Welsh Show", start: "2026-07-20", end: "2026-07-23" },
  { name: "Other", start: null, end: null }
];
```

The tablet **auto-selects the show whose dates cover today** — consultants never see the show picker on a scheduled day. Shows with `null` dates just appear in the manual dropdown. If no show matches today (or two overlap), the picker appears. "Change show" always allows a manual override, which wins for the rest of that day.

Add or edit shows, commit and push to `main` — GitHub Pages auto-deploys within ~30 seconds. Next time the tablet has signal and opens the page, it picks up the update (the service worker fetches the page network-first).

---

## Viewing the data

Open the **Eurotherapy Signups** Google Sheet. Data columns:

| Timestamp | First Name | Last Name | Email | Phone | Conditions | Email Consent | Show / Event | Sales Rep | Entry ID |

When Zoho Campaigns is ready for Andrea, export the sheet as CSV and import directly into Campaigns (the Entry ID column can be dropped on import — it's only used for de-duplication).

---

## Offline behaviour

- First load with WiFi: service worker caches the full page
- Subsequent opens: loads from cache instantly (no signal needed)
- Sign-ups: saved to localStorage on device immediately
- Back online: auto-syncs all queued entries to Google Sheet
- Manual sync: tap "Sync Now" in the top-right of the form
- Queue count: displayed in the header bar ("3 entries waiting to sync")

### Show-day routine

1. **Night before / morning of (with WiFi):** open the form once and let it load fully — this refreshes the cached page so the tablet has the latest shows list
2. **On the stand (no signal):** just use it. The header shows an amber "Offline" dot and counts queued entries — nothing else changes for the visitor
3. **Back on WiFi (end of day / back at base):** open the form — it syncs automatically the moment it detects a connection. Wait for the green "✓ N entries synced to sheet" toast and check the "waiting to sync" pill has disappeared, then spot-check the Google Sheet
4. If it doesn't sync by itself, tap **Sync Now** in the header

### Data safety

Queued entries are written to device storage the instant Register is tapped — **before** the success screen shows. They survive app crashes, force-closes, battery dying and reboots. The queue is only cleared after Google confirms the rows were written, and re-sends are de-duplicated, so a dropped connection mid-sync can't lose or double entries.

The queue does **NOT** survive: uninstalling Fully Kiosk, "Clear data/cache" on the app in Android settings, or a factory reset. **Never do any of those while the header shows entries waiting to sync** — get the tablet on WiFi and sync first.

---

## Moving to permanent hosting later

The site is a plain static folder — any static host works (Cloudflare Pages, Netlify, Eurotherapy's own hosting). Point the host at the repo root, no build step. If the URL changes, update the Start URL in Fully Kiosk on each tablet and let it load once with WiFi. The `_headers` file contains cache-control rules for Cloudflare Pages if that route is taken.

---

## Troubleshooting

**Form not loading offline:** Make sure the tablet visited the URL at least once with WiFi before going to the event.

**Data not syncing:** Check the SYNC_URL in index.html is set correctly and the Google Apps Script is deployed as "Anyone" access.

**How to exit Fully Kiosk:** Swipe down from the top of the screen → padlock icon → enter admin PIN.

**Lost the admin PIN:** Sync any queued entries first (get the tablet on WiFi, confirm the queue pill is gone), then uninstall and reinstall Fully Kiosk. **Reinstalling wipes the app's local data — any unsynced entries are lost**, which is why syncing first matters.

---

*Built by JH Technical Solutions — jake@jhtechnicalsolutions.co.uk*
