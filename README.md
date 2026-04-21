# NightDrop

A NightDrop-style web app: partner hotels discount empty rooms as check-in time approaches, and last-minute travelers grab them. Built with Vite + React, Stripe test-mode for payments, and a dynamic discount engine that reacts to time-of-day and vacancy.

## What's in the box

- **Guest booking flow** — geolocation, tonight-only deal feed, hotel detail page, Stripe-powered checkout, confirmation.
- **Dynamic discount engine** (`src/lib/pricing.js`) — stacks a late-check-in discount (accrues from 6pm to 11pm) with a vacancy discount (kicks in above 30% empty). A floor keeps partners from going below their walk-in rate.
- **Hotel partner dashboard** at `/partners` — partners adjust vacancy and rack rate per hotel, tune network-wide discount rules, and see live bookings + revenue.
- **Marketing notifications** — whenever a hotel crosses a 25% discount, the app fires an in-app push toast so guests know to grab it.
- **Map + Waze directions** — a dark-themed Leaflet map on the home page pins every partner hotel colored by discount; hotel detail pages include a mini-map and `Drive with Waze / Google Maps / Apple Maps` deep-links that open turn-by-turn navigation.
- **Time simulator** — a slider on the homepage and dashboard fast-forwards the clock so you can demo the discount curve at any hour.

## Run it in VS Code

```bash
# 1. Install dependencies
npm install

# 2. (Optional but recommended) Add a Stripe publishable test key.
#    Grab one free at https://dashboard.stripe.com/test/apikeys
cp .env.example .env.local
#    Then edit .env.local and paste your pk_test_... key.

# 3. Start the dev server
npm run dev
```

Open http://localhost:5173. In VS Code you can also run `Run > Start Debugging` or the built-in **Debug: Open Link** once Vite is running.

### Stripe test card

Use `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP. Stripe's other test cards work too — see https://stripe.com/docs/testing.

If you don't add a Stripe key, the UI still works; the checkout page just shows a notice instead of the card form.

## Project layout

```
src/
  App.jsx                  router + layout
  main.jsx                 entry
  store.jsx                global app state (React context)
  index.css                design tokens + component styles
  data/
    hotels.js              seed partner inventory
  lib/
    pricing.js             discount engine + distance helper
    geolocation.js         wrapper around navigator.geolocation
  components/
    Nav.jsx
    HotelCard.jsx
    Toasts.jsx
    TimeSimulator.jsx
  pages/
    HomePage.jsx           hero + geolocated hotel grid
    HotelDetailPage.jsx    amenities, discount breakdown, price card
    CheckoutPage.jsx       Stripe Elements payment form
    ConfirmationPage.jsx   post-booking receipt
    PartnerDashboard.jsx   vacancy + pricing rule controls, KPIs, bookings
```

## How the discount engine works

`priceHotel(hotel, now, config)` returns:

```js
{
  rack: 389,          // the published nightly rate
  final: 257,         // what the guest pays
  totalPct: 0.34,     // total discount applied
  lateShare: 0.21,    // share from late check-in
  vacancyShare: 0.13, // share from unsold rooms
  reasons: [...]      // human-readable list for the UI
}
```

The two levers stack and are capped by `floorPct` (default 45%), so partners never leak below their walk-in floor. Everything is adjustable live from the partner dashboard.

## Productionization notes (not in this MVP)

- Move pricing to a server — the current engine runs on the client so a motivated user could tamper with prices.
- Create & confirm Stripe PaymentIntents server-side instead of PaymentMethods client-side.
- Persist hotels, inventory, and bookings in a real database (Postgres + Prisma, or Firestore).
- Replace the in-app toast "marketing" channel with actual push + email (OneSignal / Postmark / Customer.io).
- Add authentication for partner dashboard access (Auth0, Clerk, or Supabase Auth).

## License

MIT — do whatever you want, no warranty.
