# M-zee — Chemistry education website (Class 8–12)

No npm packages needed. Requires only Node.js 18+.

    node server.js          # or: npm start

- Website: http://localhost:3000
- Admin:   http://localhost:3000/admin  (user `admin`, password `mzee123` — change it in Settings)

## Selling flow (WhatsApp)
1. Student taps **Enquire** -> saved in Admin > Enquiries (and opens WhatsApp).
2. Student pays you directly.
3. Admin > Students & Access -> add the student -> tick what they bought.
4. It appears in their **My Library** (videos play, notes download; protected, owners only).

## Admin tips
- Products: pick a type; the form shows only the fields that type needs.
- Videos: upload to YouTube as *Unlisted* and paste the link (best), or upload small MP4s.
- Website Content: contact info, colours, banner, hero text, FAQs, testimonials, counters.
- Settings: change password, download backup, clear demo data.

## Data & hosting
Everything lives in `data/` (db.json, uploads/, private/). Back this folder up.
Host on any Node host (Render, Railway, VPS). Env vars: PORT, DATA_DIR. Use a persistent disk for the data folder.
