# Dispatcher Dashboard

A front-end prototype for dispatchers managing an active fleet shift. The interface prioritizes Hours of Service (HOS) exceptions, explains what is at risk, and gives the dispatcher a clear next action.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Useful commands

```bash
npm run test       # HOS calculation and urgency-order tests
npm run lint       # Static code checks
npm run typecheck  # TypeScript checks
npm run build      # Production build
```

## Demo scenarios

- **Alex Rivera** is already over the 11-hour drive limit.
- **Maya Chen** has 20 minutes of drive time left and cannot finish the assigned route legally.
- **Jordan Brooks** is approaching the limit with a projected route overrun.
- **Priya Shah** is on break, showing that remaining drive time is paused rather than a wall-clock countdown.
- **Marcus Green** is offline, and **Elena Garcia** has no HOS data.
- Select alerts for batch reassignment, open a driver to reassign or review HOS, and dismiss alerts once handled.
- Open any driver to review the daily duty timeline, load impact, next legal action, and nearby reassignment options.

## Data model

`src/data/fleet.json` is a static operational snapshot with:

- 50 drivers
- 50 trucks
- 45 active routes
- 1,000 delivery stops

The JSON is intentionally large enough to demonstrate the information strategy: aggregate the shift, sort exceptions by urgency, show only drivers needing attention by default, and make the full dataset searchable.

The committed fixture can be recreated with:

```bash
node scripts/generate-fleet-data.mjs
```

## Code tour

- `src/types/fleet.ts` — the plain TypeScript data model.
- `src/domain/hos.ts` — pure HOS calculations, severity rules, freshness rules, and sorting.
- `src/App.tsx` — small pieces of UI state and derived filtering.
- `src/components/dashboard/` — dashboard sections and the driver detail panel.
- `src/domain/hos.test.ts` — tests for the business rules.

The app uses a fixed snapshot time so every walkthrough starts with the same scenarios. Drive time remaining, severity, stop time, and projected route risk are computed from the duty logs and route estimates rather than written into the UI data.
