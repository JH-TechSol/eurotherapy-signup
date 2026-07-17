# Eurotherapy Email Sequence
## 3-email post-show automation

---

### ⚠️ PLACEHOLDER IMAGES — replace before sending

`email-assets/` currently holds generated placeholder graphics (teal box, labelled
"PRODUCT PHOTO PLACEHOLDER" / "SHOW PHOTO PLACEHOLDER") so the emails render fully
for preview. **Swap in the real photos before this goes live** — same filenames,
so no HTML changes needed. See the "Images used" list below for what each one
should show.

---

### Overview

| # | File | Send timing | Subject line |
|---|---|---|---|
| 1 | `email-1-immediate.html` | Immediately on list sync | Great to meet you at {{show_name}}, {{first_name}} |
| 2 | `email-2-day10.html` | Day 10 after sign-up | Still thinking it over, {{first_name}}? |
| 3 | `email-3-week6.html` | Day 42 (6 weeks) after sign-up | It's not too late, {{first_name}} |

---

### IMPORTANT — image hosting

The emails reference images from:
```
https://eurotherapy.jhtechnicalsolutions.co.uk/email-assets/
```

These image files are included in this repo (`email-assets/`, sibling to this `emails/` folder).
The repo auto-deploys to GitHub Pages on push, so the images are live at the URL above automatically — nothing extra to do.

**If the sign-up form is deployed to a different domain**, search-and-replace `eurotherapy.jhtechnicalsolutions.co.uk` across all three email files.

Images used:
- product-case.jpg — device in open carry case (Email 1)
- in-use-knee.jpg — device used on knee (Emails 1 & 3)
- show-demo-2.jpg — consultant demonstrating (Email 2)
- show-demo-1.jpg — consultant hand demo (Email 2)
- show-stand.jpg — product on show stand (Email 3)

All emails are ~21KB — safely under Gmail's 102KB clipping limit.

---

### Pricing shown

- Normal price: **£1,200 inc. VAT**
- Show offer: **£795** (excl. VAT — free UK delivery)

If the show price changes, search for `£795` and `£1,200` across the three files.

---

### Merge tags

| Tag | Pulls | Zoho Campaigns field |
|---|---|---|
| {{first_name}} | Subscriber's first name | First Name |
| {{show_name}} | Show they signed up at | Show / Event (custom field) |
| {{unsubscribe}} | Unsubscribe link | Auto-inserted |

---

### Zoho Campaigns automation setup (when ready)

1. Import contacts from the Google Sheet CSV into a list called "Show Sign-Ups"
2. Create custom field: "Show / Event" (text) — map the Show column on import
3. Create an Autoresponder series on that list:
   - Email 1 → immediately on subscription
   - Email 2 → 10 days after subscription
   - Email 3 → 42 days after subscription
4. Upload each HTML file as the email body (HTML Editor → paste code)
5. From name: Andrea — Eurotherapy
6. Reply-to: andrea@eurotherapy.co.uk
7. Send a test to yourself before activating

---

### Design notes

- Brand: Teal #99CFD2 / Coral #FD6251 / Deep teal #3d8a8e
- Font: Poppins (falls back to Arial where web fonts are blocked)
- Table-based layout for Outlook compatibility
- Mobile responsive
- Real customer testimonials from the Eurotherapy website

---

*Built by JH Technical Solutions for Eurotherapy*
