# Little Panda Daycare

A sunny, colorful bilingual English/Spanish daycare website, family-tour booking flow, and staff dashboard. The public design uses a soft sky-blue, peach, and lilac palette, cut-paper photo masks, original toy illustrations, handwritten notes, and scalloped section edges. Copy is deliberately brief, with details kept in collapsed FAQs. Built with semantic HTML, CSS, and native JavaScript modules. No application framework, runtime dependencies, database, or account setup required.

## Run locally

Requires Node.js 20 or later.

```sh
npm run dev
```

Open http://localhost:5173.

- Home: `/#/`
- Our story and team: `/#/about`
- Programs: `/#/programs`
- A day here: `/#/day`
- Parent FAQs: `/#/faq`
- Contact: `/#/contact`
- Book a family tour: `/#/book`
- Staff dashboard: `/#/admin`
- Published newsletters: `/#/newsletters`
- Virtual tour: `/#/tour`

Use the EN / ES buttons to switch the entire public site, booking flow, or dashboard. Language preference persists in the browser.

## Public information pages

Every navigation destination renders a separate page view, including a visible Home link, instead of scrolling to homepage anchors. Hash URLs support direct links and browser back/forward on GitHub Pages without rewrite configuration. The active page is identified with `aria-current`. Language switching stays on the same page.

The About page includes Wanda Guerra’s background and ten staff names/roles from Honey Bear’s public staff page. Initials are used instead of fabricated or borrowed staff portraits. Programs summarizes the published age groups, educational support, and school transportation; the Contact page labels the existing Honey Bear address and number. A Day Here remains an illustrative routine, since the source did not provide exact hours. Source notes identify information used for the Little Panda demo. Text is maintained in `public-pages.js` and styles in `pages.css`.

## Demo walkthrough

1. Open **Staff demo** from the website footer.
2. Choose **Availability**. Set weekly days and one or more time windows per day (for example, 10 am–12 pm and 1 pm–3 pm), tour duration, and the buffer between tours, then save. Overlapping and too-short windows are rejected.
3. Block a date to demonstrate closures or holidays.
4. Open **Preview booking**. Families see open dates for the next 90 days, in America/Chicago time.
5. Choose a time and complete the form with sample contact details.
6. Download the `.ics` calendar invitation, or use **Manage this visit** to reschedule/cancel.
7. Return to the dashboard to see the new booking. Use search, status filters, and **View details**.
8. Use **Reset demo data** in the dashboard footer to start fresh.

Schedules, tour edits, newsletters, bookings, and the three clearly labeled sample families are stored in localStorage under `little-panda-demo-v1`. Data survives page refresh in the same browser and origin. Tabs on the same origin receive updates. Separate devices and browsers do not share data. Blocked dates preserve existing bookings; contact/reschedule those families separately in the demo.

## Newsletter publishing demo

Open **Newsletters** in the staff dashboard, then **New newsletter**. Write the title and content in the English and Español tabs; optional introductions and an illustrative cover photo are available. Preview the selected language, save a draft, and publish when both languages are ready.

Published editions appear under **Newsletters** on the public website. Saving a draft of an already-published edition preserves the current public version until **Publish changes** is clicked. **Unpublish** removes the public edition while retaining the draft; **Delete** removes both after confirmation. Text is rendered safely as plain paragraphs; HTML is not executed.

This remains a browser-local showcase. Publishing updates this browser's demo website, not a shared CMS or a mailing list; other visitors and devices cannot see these local editions. No email is sent. Production newsletter publishing needs authenticated staff access and shared storage, with an email service if email distribution is wanted.

Older single-window schedules and existing appointments are kept compatible; no reset is required when upgrading.

## Connected walkthrough demo

Open **Virtual tour** from the public navigation or homepage. Start outside the entrance, click the door to enter reception, then click the arch to reach the hallway. The blue classroom door, coral playroom door, and green garden door lead to their corresponding views. Interior views show the same colored doors and link back to the hallway. **Go back**, clickable breadcrumbs, **Turn back**, and **Start again** let visitors retrace their route. There is no room-gallery navigation or automatic next-room sequence.

Six coordinated fictional views are saved in `assets/walkthrough/`. They were generated with built-in image_gen from the reception master reference, then the hallway reference. The complete prompt set is in `assets/walkthrough/prompts.json`. JPEG copies are optimized for web delivery; adjacent views preload. Photo proportions are preserved on mobile so doorway arrows stay in the same place. The site labels the experience as an AI-generated fictional center, not real Little Panda premises or a 360° capture. Generated views approximate a consistent building but can contain small architectural differences.

In **Staff demo → Virtual tour**, edit a view in English and Español, choose a generated photo or upload a JPG/PNG/WebP, and add markers. Choose **Move to another view**, select the destination, set arrow direction and both labels, then position the arrow on the doorway by clicking the image or using arrow keys. **Show information** remains available for explanatory markers. Save updates this browser’s public walkthrough. The first visible view is the starting point; library order does not create connections. Hidden destinations are omitted from public arrows. Deleting a view removes inbound links. Old room-gallery edits remain preserved under the legacy `tourRooms` field; the connected walkthrough uses `walkthroughRooms`. Bookings and newsletters are untouched.

Tour edits and uploads stay in the current browser. Replace each fictional view with a frame from the real center’s walkthrough video when available, then reposition its arrows. Production editing needs authenticated staff access and shared photo storage.

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
npm run test:admin
npm run test:tour
npm run test:pages
```

The browser checks cover EN/ES switching, form submission, persistence, calendar download, rescheduling, cancellation, saved availability, date blocking, mobile navigation, and overflow at 390, 768, and 1440 pixels. Screenshots are written to the operating system's temporary directory. Scheduling unit tests cover conflicts, split windows, lunch breaks, overlap validation, legacy schedules, buffers, closures, past dates, Chicago time, and existing bookings after schedule changes. The walkthrough browser suite verifies branching doorway links, return paths, history, keyboard navigation, image alignment, uploads, bilingual destination editing, hiding/deleting destinations, legacy data preservation, and responsive layouts. The admin browser suite verifies newsletter drafts, bilingual validation, previews, publication, revision isolation, safe content rendering, persistence, unpublishing/deletion, and split availability at phone, tablet, and desktop widths.

## Content and assets

- Copy and program categories were informed by the Honey Bear Day Care public program and about pages. The new Little Panda programs, exact age ranges, classroom languages, staffing, partnerships, hours, address, and rates need owner approval before a real launch. No Honey Bear photographs were reused. No testimonials, ratings, licensing claims, or enrollment statistics were invented.
- The existing number **847-455-8687** is explicitly labeled as the Honey Bear family contact. Do not replace it with an invented new-center number.
- Stock photography is illustrative, not a representation of Little Panda children, teachers, or facilities. Replace with approved real photographs when available.
- `assets/classroom.jpg`: [Pexels photo 8613089](https://www.pexels.com/photo/8613089/) — teacher reading with children.
- `assets/learning.jpg`: [Pexels photo 3662667](https://www.pexels.com/photo/3662667/) — children playing with wooden blocks.
- `assets/child.jpg`: [Unsplash source](https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9) — child enjoying art.
- `assets/walkthrough/*.jpg`: six original AI-generated fictional facility views, with complete prompts in `assets/walkthrough/prompts.json`.
- `assets/logo.png`: original AI-generated Little Panda Daycare logo concept.
- `assets/favicon.svg`: original simple panda mark used as the favicon and small dashboard illustration.
- Fonts: Fredoka, Patrick Hand, and DM Sans, served by Google Fonts with local system fallbacks.

## Before production

This is an intentionally open presentation demo, not a production appointment system. It does not send email/SMS, authenticate staff, synchronize devices, or guarantee cross-device reservation exclusivity. Production needs a backend with atomic slot reservations, authenticated staff access, approved center details and photography, privacy/retention policies, email delivery, and a deployment-specific security review. Keep real parent/child personal data out of this demonstration.
