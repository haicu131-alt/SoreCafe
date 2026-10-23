# Master Prompt — SORE-style Cafe Ordering Site

Use this prompt to generate a complete, designed-by-a-person static ordering site for an independent cafe. Replace the bracketed brief with your own details. Keep the structure, constraints, and acceptance tests.

---

## 1. Role and outcome

You are a senior product designer, frontend engineer, and copywriter working as one. Build a complete, responsive, static cafe ordering website — not a landing page, not a template, not a moodboard. Every page must be usable on a phone held in one hand while standing in a cafe.

The finished site should look like it came from a small design studio: quiet typography, a strict grid, real photography, specific copy, and no visible framework. It must not look or read like AI-generated filler.

Deliver plain HTML, CSS, and JavaScript with no build step. Do not use React, Vue, Svelte, Tailwind, Bootstrap, jQuery, or a CDN. All fonts, images, and libraries must be local.

---

## 2. Brief (editable)

- **Brand:** SORE — Kopi & Dapur
- **Meaning:** “sore” is late afternoon, the slow hour between work and dinner.
- **Place:** Bandung, Indonesia. A small neighborhood coffee shop with a kitchen, a long shared table, a glass room, and eight bar seats.
- **Hours:** 08.00–22.00, kitchen closes 21.00. Closed the first Monday of every month.
- **Audience:** people in the cafe, phone in hand, often on mobile data. They want to know what is good, what it costs, and whether the table number is correct.
- **Promise:** good coffee and simple food without ceremony. Prices include tax. No service charge.
- **Menu:** 30 items, split roughly 8 coffee, 6 non-coffee, 8 food, 8 snacks. Use specific Indonesian cafe dishes and drinks — not a generic international menu.

---

## 3. Non-negotiable experience

Build one continuous flow:

1. A printed QR card on each table opens the menu with the table number already set, for example `menu.html?meja=7`.
2. The guest browses, filters, searches, and adds items. A sticky cart appears on mobile once the cart has something in it.
3. The cart drawer and checkout never lose the table number. The guest adds their name, confirms the table, chooses dine-in or takeaway, and may leave a note.
4. Pressing pay builds a dynamic QRIS payload from the actual total, opens a payment dialog with the amount, merchant, order code, table, guest name, and a 15-minute countdown.
5. A clearly labelled demo action simulates a successful payment, saves the order, clears the cart, and opens a status page.
6. The status page shows the order code, items, total, table, name, and a calm time-based status: received, being prepared, ready.
7. Staff can open a separate page, enter a table number, preview the table card, download the QR as SVG, copy the table link, and print an A6 card.

Do not stop at showing a QR image. The whole path must work end to end, including validation, empty states, error states, and the case where the cart is empty.

---

## 4. Pages and required content

### `index.html` — home
- Full-bleed hero photograph with the brand name, one short line about the place, and two actions: view menu, find us.
- If a table number is present in storage or the URL, show it plainly. Do not make the guest hunt for it.
- Three signature items with real photos, names, one-line descriptions, and prices. Link to the full menu.
- A short “how to order” section: scan, choose, pay at the table.
- A room section with three photographs and honest captions. No stock-photo perfection.
- Address, hours, and a simple map. The map can be hand-drawn SVG; it must be legible and not depend on Google Maps.
- Footer with hours, address, Instagram placeholder, and photo credit.

### `menu.html` — menu and cart
- Read `?meja=N` and persist it. Show the table number in the page header or hero.
- Show all 30 items. Each card has a 4:5 photo, name, description, price, category, and an add button.
- Filters: all, coffee, non-coffee, food, snacks. Search by name or description. Show a count and an empty state that offers to clear filters.
- Cards must not jump when images load. Set width and height attributes and use lazy loading below the fold.
- Cart drawer: line items, quantity controls, remove, subtotal, tax note, checkout action. It must fit within the viewport, trap focus while open, close on Escape and backdrop click, and restore focus to the trigger.
- On mobile, a sticky cart bar shows item count, table, and subtotal. Do not let it cover the last row of the menu.
- Use a toast for “added to cart”, but hide it when the cart drawer opens so it never covers the total.

### `checkout.html` — details and payment
- If the cart is empty, show a composed empty state with a link back to the menu. Do not show a broken form.
- Collect name (required, trimmed, sensible length), table number (required, 1–30, prefilled), order type, and an optional note.
- Validate inline on submit, not while the guest is still typing. Move focus to the first invalid field. Explain the error in plain Indonesian.
- Order summary lists every line, quantity, line total, subtotal, tax note, and total. On mobile it sits below the form; on desktop it is sticky beside the form.
- The pay button is disabled while the cart is empty and shows a working state while the dialog is prepared.
- Payment dialog: QR, amount, merchant, order code, “Meja X · atas nama Y”, countdown, close, and a secondary demo action. The dialog must fit a 390 × 844 screen and scroll internally if the viewport is short.
- Escape user-entered names before inserting them into HTML.
- After simulated payment, save a complete order object and redirect to `status.html?order=CODE`.

### `status.html` — order status
- Read the order code from the query string and look it up in local storage.
- If missing, show a calm empty state with a link to the menu.
- Show a vertical timeline with three steps. The active step is based on elapsed time since the order was saved: under 2 minutes received, 2–8 minutes preparing, over 8 minutes ready.
- Show order details, table, guest name, note if present, and total.
- Offer “back to menu” and “order again” actions without duplicating the cart accidentally.
- State clearly that this is a demo status, not a live kitchen display, in a small note that does not ruin the design.

### `tentang.html` — about
- A story with a point of view, not a history essay. Why the place exists, what it refuses to do, how it sources coffee.
- One wide interior photograph, one ingredient photograph, one kitchen photograph.
- A short set of principles or facts with numbers that feel real: seats, opening year, roaster, litres of water, etc.
- Links to the menu and the room page.

### `ruang.html` — the room
- An asymmetric photo grid: six images with captions that describe how the room feels and when to sit there.
- Notes on noise, light, power outlets, wifi, and large tables. These are the details guests actually need.
- No carousel. No autoplay video. No image hover zoom that breaks touch.

### `qr.html` — staff table cards
- A small utility page, visually consistent with the customer site but clearly for staff.
- Form: table number (1–30), generate. Show validation for out-of-range values.
- Preview an A6 card: brand, "Pindai untuk membuka menu", QR, table number, short instruction, and the address. Keep the URL outside the card, in small type for staff.
- Actions: download SVG, copy link, print card. The download must produce a real SVG, not a screenshot.
- The QR must encode the current site origin plus `menu.html?meja=N`. When served from localhost it will encode localhost — state this in the operator README and do not pretend otherwise.
- Print CSS: A6 portrait, no browser headers, no margins, background graphics on. The preview must fit a phone screen.
- The table card must not show the customer cart or table chip from the shared header. Hide those elements on this page.

---

## 5. Visual direction

Aim for a small printed menu that happens to be a website.

- **Palette:** paper `#F3EDE3`, paper-2 `#EDE4D6`, ink `#1C1813`, muted `#6E6559`, line `#D8CCBA`, line-dark `#B9AB96`, accent `#A64B2A`, olive `#5C6247`.
- **Type:** Fraunces for display and headings; Inter for body, labels, and UI. Self-host both. Use a restrained scale, tight display leading, and wide uppercase labels with generous letter spacing.
- **Layout:** a 12-column desktop grid, generous outer margins, thin rules, square corners. Cards are flat on paper with a hairline border. Avoid drop shadows except for modal layers.
- **Images:** warm, natural light, real food and real rooms. Use a consistent aspect ratio per role: 4:5 menu cards, 3:2 editorial, 1:1 detail. Apply a subtle warm grade where needed; do not over-filter.
- **Details:** no gradients, no glassmorphism, no floating blobs, no generic icon set, no emoji. Use simple inline SVG icons only where they clarify an action.
- **Motion:** short, functional transitions (120–220 ms). Respect `prefers-reduced-motion`. No scroll-jacking, no parallax, no reveal-on-scroll that hides content.
- **Voice:** calm, specific, slightly dry. Short sentences. No exclamation marks. No “elevate your experience”, “culinary journey”, “handcrafted with love”, or “nestled in the heart of”. Name real things: the roaster, the glass room, the eight bar seats, the fact that the kitchen closes at nine.

---

## 6. Technical specification

### Stack
- Static HTML5, one shared CSS file, small JavaScript files loaded with `defer`.
- No modules required; plain IIFEs are fine.
- No external requests at runtime. Fonts, images, and QR library are local.
- Vendor `qrcode-generator` 1.4.4 (MIT) or an equivalent local library. Keep the license notice.

### Shared state
Use `localStorage` with namespaced keys:
- `sore.cart.v1` — object map of item id to quantity, for example `{ "es-kopi-susu": 2 }`
- `sore.meja` — table number as a number
- `sore.nama` — guest name
- `sore.orders.v1` — array of order objects

Cart operations must be centralized in one small module exposed as `window.SORE`: read, add, set quantity, remove, subtotal, count, clear. Every page uses the same functions. Do not re-implement cart math in the checkout page.

### Menu data
Keep menu data in one file. Each item:
```js
{ id, nama, kategori, harga, deskripsi, img, tag? }
```
Prices are integers in rupiah and include tax. Format with `Intl.NumberFormat('id-ID')` or a small equivalent that produces `Rp28.000`.

### Dynamic QRIS
Build an EMVCo TLV payload:
- `00` payload format indicator `01`
- `01` point of initiation `12` for dynamic
- `26` merchant account information with `00` GUID `ID.CO.QRIS.WWW`, `01` merchant PAN, `02` merchant ID, `03` merchant criteria
- `52` MCC `5812`
- `53` currency `360`
- `54` transaction amount, integer rupiah
- `58` country `ID`
- `59` merchant name
- `60` city
- `61` postal code
- `62` additional data with order ID
- `63` CRC16-CCITT (poly `0x1021`, init `0xFFFF`) computed over the payload including `6304`

The QR is generated from the payload, not from a static image. Include the order code in tag `62` so the payment can be reconciled.

**Demo honesty:** use placeholder merchant data and say so in the operator README. A structurally valid QRIS payload is not a working payment. Real use requires merchant credentials from a PJSP/acquirer, server-side transaction creation, webhook verification, and a backend order store. Do not imply that scanning the demo QR moves money.

### Table QR
Generate from `window.location` at the time the staff page is used:
```js
base.replace(/qr\.html$/, "menu.html") + "?meja=" + n
```
Do not hard-code a domain. Warn the operator, in the README, that localhost QR codes are useless on a phone.

### Server
Include a zero-dependency Node static server so the site can be run without Python:
```powershell
node serve.js
```
It should serve the folder on `127.0.0.1:4173`, handle query strings, set sane MIME types, return 404 for missing files, and refuse path traversal. Do not add a framework.

### Responsive and performance
- Test at 390 × 844 and 1440 × 1000. Also check 360 px width.
- No horizontal overflow at any breakpoint.
- Dialogs use `max-height: calc(100dvh - 24px)` and scroll internally.
- Hero image eager; everything below the fold lazy with explicit dimensions.
- Total page weight should stay reasonable. Compress JPEGs; do not ship 5 MB images.
- Keyboard: skip link, visible `:focus-visible`, focus trap in dialog and drawer, Escape closes overlays.
- Semantic landmarks, one `h1` per page, labels tied to inputs, `aria-live` for the toast.

---

## 7. Copy rules

- Write in Indonesian unless the brief says otherwise.
- Be specific. “Espresso, susu segar, gula aren. Gelas 300 ml.” beats “a delightful blend”.
- No emojis, no exclamation marks, no stacked adjectives.
- Do not explain the obvious in the UI. A button says “Tambah”, not “Click here to add this item to your cart”.
- Empty states are written, not decorative: say what happened and what to do next.
- Demo limitations belong in the README and in one small note on the status page. Do not clutter the customer flow with technical caveats.
- The staff page can be plainer and more utilitarian than the customer pages. It still uses the same type and colors.

---

## 8. Acceptance tests

Do not deliver until all of these pass:

1. `index.html`, `menu.html`, `checkout.html`, `status.html`, `tentang.html`, `ruang.html`, `qr.html` all load with zero console errors.
2. `menu.html?meja=7` shows table 7 and persists it through checkout.
3. Adding two different items updates the cart count, subtotal, drawer, and sticky bar.
4. Refreshing the menu preserves the cart and table.
5. Checkout blocks an empty name or an invalid table, focuses the first error, and accepts a valid name.
6. The QRIS dialog shows the exact total, table, and guest name; the QR is a real rendered QR; the countdown starts at 15:00.
7. Simulated payment saves an order, clears the cart, redirects to status, and the status page finds the order by code.
8. Status changes from received to preparing to ready based on time, without a server.
9. The staff page generates a card for table 1 and 30; download produces an SVG; copy link produces `menu.html?meja=N`.
10. Print preview is A6 portrait with no clipped QR and no browser header text.
11. At 390 px there is no horizontal scroll; the drawer, dialog, and QR card fit.
12. At 1440 px the menu grid and checkout summary do not stretch into unreadable line lengths.
13. No CDN requests, no external fonts, no missing images, no placeholder “lorem ipsum”.
14. The README explains how to run the site, how the demo QRIS differs from production, and how to generate QR cards from a deployed URL.

---

## 9. Output contract

Return a complete project, not fragments:

```
index.html
menu.html
checkout.html
status.html
tentang.html
ruang.html
qr.html
serve.js
README.md
assets/css/main.css
assets/js/app.js
assets/js/data.js
assets/js/menu.js
assets/js/checkout.js
assets/js/qris.js
assets/js/qr.js
assets/js/status.js
assets/js/vendor/qrcode.js
assets/fonts/...
assets/img/...
```

Every file must be complete and runnable. No “add your images here” placeholders. No `TODO`. No explanation before the code. If an asset cannot be generated, use a local, license-clear substitute and say so in the README.

---

## 10. Reuse notes

To adapt this prompt to another cafe:

- Replace the brand, neighborhood, hours, and story.
- Keep the page set and the flow; they are the product.
- Rebuild the menu with local dishes and real prices. Keep the category counts close to 8/6/8/8 so the grid stays balanced.
- Change the palette and type pairing if the brand demands it, but keep the paper-and-ink discipline and the square, hairline card language.
- Replace the demo QRIS merchant block only with credentials you are authorized to use. Keep the payload builder and CRC check.
- Re-run every acceptance test after changing the brand, menu, or QR data.
