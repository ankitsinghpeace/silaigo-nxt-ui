# SILAIGO — Order Workflow Redesign, Customer Tracking & WhatsApp Automation

## Architecture reality check (read first)
This repo is the **Next.js frontend only**. The real production backend
lives at `https://api.silaigo.com` (separate codebase, not in this repo),
backed by a real production MongoDB with real customer/order data.
`/app/backend/server.py` here is a pod-only FastAPI reverse-proxy shim
(forwards `/api/*` to the real backend) so the preview works — it is not
the real backend and gets wiped whenever the pod resets (recreate it +
the `/app/frontend -> /app` symlink + `package.json` `start` script
(`next dev`) + `.env.development` `NEXT_PUBLIC_API_URL=/api` if the app
won't boot in a fresh session).

## Original ask
Redesign SILAIGO's order status system into a simplified internal
lifecycle (Pickup Created → Order Created → Order Fulfilled → Cutting
Started/Ended → Assign Tailor → Stitching Started/Ended → Finishing & QC →
Ready to Dispatch → Delivered, with a "Returned for Alteration" branch),
add a customer WhatsApp opt-in checkbox, mandatory vs optional WhatsApp
notifications, a public homepage "Track Your Order" widget with a
customer-safe status model, manual/optional review-link, internal-only
alteration urgency (1/2/3), and preserve all existing functionality/roles/
historical orders. Full backend implementation is out of reach in this
repo — documented instead in `/app/memory/be_changes2.md`.

## What's been implemented (2026-08-16)
**Frontend only** (backend changes fully spec'd in `be_changes2.md`):
- Simplified 7-step visual "Order Progress" stepper (`OrderStatusStepper.tsx`)
  in the admin order detail modal, grouping the existing 10
  `orderProcessingState` values without changing the underlying enum.
- Customer-safe status mapper (`lib/customerStatusMap.ts`) + presentational
  `CustomerStatusStepper.tsx`, used on the new homepage **Track Your Order**
  widget (`TrackOrderSection.tsx`, public — calls `GET /orders/track/:id`,
  which doesn't exist on the backend yet, fails gracefully) and on the
  logged-in customer `OrderDetailsPage.tsx` (renders only if backend starts
  returning `orderProcessingState`).
- New Pickup Agent "Ready to Dispatch" queue tab (`DispatchQueueView.tsx`)
  with real "Delivered" action (existing processing-state + notify APIs)
  and "Returned for Alteration" (`AlterationDialog.tsx`: tailor + internal
  urgency 1/2/3) + "Send Review Link" (manual/optional) — the latter two
  call new backend endpoints (`/orders/:id/alteration`,
  `/orders/:id/review-link`) that don't exist yet; UI fails gracefully with
  a toast pointing to `be_changes2.md`.
- Cutting/Stitching queue (`RoleQueueView.tsx`): added a local-only (not
  persisted) "Start Cutting/Stitching" → "End Cutting/Stitching" two-step
  affordance ahead of real backend support for a persisted "Started" state.
- "Customer wants WhatsApp updates" checkbox added to the order-creation
  cart-checkout form (`CartCheckout.tsx`, both `CartCheckout` and
  `CartCheckoutForm`), defaults to checked, flows into `customerData.whatsappOptIn`.
- Fixed a pre-existing, unrelated but blocking bug: `Index.tsx` (homepage)
  was a `"use client"` component directly rendering async Server Components
  (`HeroCarousel`, etc.) — invalid in Next.js App Router, broke hydration
  for the entire homepage (all click/typing handlers silently dead).
  Converted `Index.tsx` into an async Server Component (removed dead
  `useState`/`useRandomPopup` wiring that was already disabled/unused);
  homepage interactivity — including the new Track widget — now works.
- Tested via testing_agent (frontend-only, admin login, non-destructive):
  all new UI verified rendering correctly with no regressions to existing
  Processing State / Order Status / Assign Agent selects, Pin-to-Top, SMS
  notify buttons. One real bug found (Track button hydration) — fixed and
  self-verified afterward with a fresh screenshot.

## Known gaps (see be_changes2.md for full spec)
- No backend endpoints yet for: alteration assignment, review-link send,
  public order tracking, WhatsApp sending (mandatory + optional events),
  delay-notification job, persisted Cutting/Stitching "Started" timestamps,
  `whatsappOptIn` persistence, `internalStage` migration.
- Could not test the alteration/delivered/review-link buttons against a
  live order because no real order currently sits in `READY_FOR_DISPATCH`.

## Test credentials
See `/app/memory/test_credentials.md` — only ADMIN credentials available;
no dedicated PICKUP_COORDINATOR/CUTTING/STITCHING test accounts exist.

## Backlog / next steps
- P0: Backend team implements `be_changes2.md` (migration, new endpoints, WhatsApp sending, delay job).
- P1: Once backend adds persisted Cutting/Stitching "Started" timestamps, swap `RoleQueueView`'s local-storage toggle for the real API call.
- P1: Once backend adds `orderProcessingState`/tracking fields to the public/customer APIs, no further frontend change needed — mappers already handle it.
- P2: Split `OrdersPage.tsx` (2800+ lines) into per-tab files for maintainability (flagged by testing agent, not done this session — no functional impact).
