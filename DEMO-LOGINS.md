# John & Doe Legal — Demo Logins

Front-end only demo. All data is fake and lives in the browser (localStorage), so nothing is sent anywhere.

**Password for every account: `demo1234`**

Sign in at `/#/login` (the "Client login" link in the site header). On that page you can click any demo account to auto-fill it.

## Client portal

| Name | Email | What they have |
|---|---|---|
| **Ngozi Adebayo** (main demo client) | ngozi.adebayo@example.com | Video consultation tomorrow, engagement letter to sign, valid ID to upload, ₦376,250 retainer to pay, unread message |
| Emeka Nwosu | emeka.nwosu@example.com | Property matter (land purchase), in-office consultation today |
| Aisha Bello | aisha.bello@example.com | Employment claim, overdue invoice |
| Tolu Martins | tolu@martinsfoods.example.com | Brand-new booking, no matter opened yet |

## Staff workspace

| Name | Email | Role |
|---|---|---|
| **Halima Yusuf** | halima@harborvale.legal | Lawyer — sees only her own diary, clients, matters |
| Chidi Eze | chidi@harborvale.legal | Lawyer (property & immigration) |
| **Adaeze Okafor** | adaeze@harborvale.legal | Partner — whole-firm view and billing totals |
| Tunde Bakare | tunde@harborvale.legal | Partner |

## Demo helpers

- **"Demo" pill (bottom-left)** — jump between the public site, client portal, lawyer and partner views without signing in/out, and **Reset demo data**.
- Payment: a test card is pre-filled; no real payment is taken. Bank transfer / USSD just need a click to confirm.
- Booking as a new person creates a portal account automatically (password `demo1234`) and signs them in.
- Open the client portal and the lawyer workspace in **two browser tabs** — changes sync between them.

## Suggested walkthrough (end to end)

1. **Public site** → Home → pick a practice area → *Book a consultation*. Go through the 4 steps (use "Fill with demo details" on step 4), pay with the test card.
2. Confirmation page → **Go to client portal**. The new appointment, receipt and welcome message are there.
3. Sign in as **Ngozi** → *Review & sign* the engagement letter (matter moves to "Preparing papers"), upload the requested ID, pay the retainer (receipt appears in Documents), reschedule the appointment, send a message, join the video call.
4. Switch (Demo pill) to **Halima** → dashboard shows the new activity; reply in *Inbox*; open Ngozi's file → post a matter update / advance the stage, share a document, request a document, issue a new invoice.
5. In *Diary*, **Mark complete** on a consultation → **Open matter** → the client instantly gets an engagement letter and ID request in their portal.
6. Switch to **Adaeze** (partner) → *Billing* shows firm-wide totals; *Mark paid* on the overdue invoice.

## Run it

```
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ (hash routing — works on any static host)
```
