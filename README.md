# Little Panda Daycare

A polished bilingual English/Spanish daycare website, family-tour booking flow, and staff dashboard. Built with semantic HTML, CSS, and native JavaScript modules. No application framework, runtime dependencies, database, or account setup required.

## Run locally

Requires Node.js 20 or later.

```sh
npm run dev
```

Open http://localhost:5173.

- Website: `/#/`
- Book a family tour: `/#/book`
- Staff dashboard: `/#/admin`

Use the EN / ES buttons to switch the entire public site, booking flow, or dashboard. Language preference persists in the browser.

## Demo walkthrough

1. Open **Staff demo** from the website footer.
2. Choose **Availability**. Set weekly days/hours, tour duration, and the buffer between tours, then save.
3. Block a date to demonstrate closures or holidays.
4. Open **Preview booking**. Families see open dates for the next 90 days, in America/Chicago time.
5. Choose a time and complete the form with sample contact details.
6. Download the `.ics` calendar invitation, or use **Manage this visit** to reschedule/cancel.
7. Return to the dashboard to see the new booking. Use search, status filters, and **View details**.
8. Use **Reset demo data** in the dashboard footer to start fresh.

Schedules, bookings, and the three clearly labeled sample families are stored in localStorage under `little-panda-demo-v1`. Data survives page refresh in the same browser and origin. Tabs on the same origin receive updates. Separate devices and browsers do not share data. Blocked dates preserve existing bookings; contact/reschedule those families separately in the demo.

## Build and test

```sh
npm test
npm run build
```

`dist/` is a complete static build that can be served on any static host. Hash-based navigation does not require server rewrites. Do not open `index.html` using `file://`; ES modules need HTTP.

Browser regression script (requires Playwright and its Chromium browser):

```sh
npm install
npx playwright install chromium
# In a separate terminal: npm run dev
npm run test:browser
```

The browser checks cover EN/ES switching, form submission, persistence, calendar download, rescheduling, cancellation, saved availability, date blocking, mobile navigation, and overflow at 390, 768, and 1440 pixels. Screenshots are written to the operating system's temporary directory. Scheduling unit tests cover conflicts, buffers, closures, past dates, Chicago time, and existing bookings after schedule changes.

## Content and assets

- Copy and program categories were informed by the Honey Bear Day Care public program and about pages. The new Little Panda programs, exact age ranges, classroom languages, staffing, partnerships, hours, address, and rates need owner approval before a real launch. No Honey Bear photographs were reused. No testimonials, ratings, licensing claims, or enrollment statistics were invented.
- The existing number **847-455-8687** is explicitly labeled as the Honey Bear family contact. Do not replace it with an invented new-center number.
- Stock photography is illustrative, not a representation of Little Panda children, teachers, or facilities. Replace with approved real photographs when available.
- `assets/classroom.jpg`: [Pexels photo 8613089](https://www.pexels.com/photo/8613089/) — teacher reading with children.
- `assets/learning.jpg`: [Pexels photo 3662667](https://www.pexels.com/photo/3662667/) — children playing with wooden blocks.
- `assets/child.jpg`: [Unsplash source](https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9) — child enjoying art.
- `assets/logo.png`: original AI-generated Little Panda Daycare logo concept.
- `assets/favicon.svg`: original simple panda mark used in the compact website wordmark.
- Fonts: Fredoka and DM Sans, served by Google Fonts with local system fallbacks.

## Before production

This is an intentionally open presentation demo, not a production appointment system. It does not send email/SMS, authenticate staff, synchronize devices, or guarantee cross-device reservation exclusivity. Production needs a backend with atomic slot reservations, authenticated staff access, approved center details and photography, privacy/retention policies, email delivery, and a deployment-specific security review. Keep real parent/child personal data out of this demonstration.
