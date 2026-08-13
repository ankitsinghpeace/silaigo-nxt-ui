# SILAIGO Admin — PRD / Memory

## Original problem statement
> i have my admin ui, in which is not working properly, there are multiple issues we need to resolve:
> 1. pagination, sorting, search and filter are not working on admin/customers and admin/orders
> 2. orders page order detail should be optimized: orders grouped by customer name (correct), clicking
>    a row should open a modal with tabs (one per order), each tab showing a good admin view of order,
>    specs, delivery date, payment summary, customisations, and managing assignee + order status in ONE tab.
> 3. Optimize the entire dashboard from a business perspective, mainly Orders and Customers, UI/UX and
>    functionality, no page breaks anywhere in admin.
>
> Follow-up (approved via ask_human, phased): customer demographics for repeat customers/leads on
> Customers page (YES), role-based queue dashboards for Cutting/Stitching sorted by delivery urgency (YES),
> SMS notifications at key order stages via existing MSG91 integration (YES, backend endpoint pending),
> broadcast/marketing messaging (SKIPPED — not requested this round).

## Architecture
- **This repo is a Next.js (App Router) FRONTEND ONLY app**, living at `/app` root (not `/app/frontend`).
  It calls a live external production backend at `https://api.silaigo.com` — there is no backend
  codebase here to modify.
- Environment shim (pod-only, not meant for the user's real repo):
  - `/app/backend/server.py` — a generic FastAPI reverse proxy forwarding all `/api/*` calls to
    `https://api.silaigo.com/*` server-side (avoids browser CORS from the preview domain, since the
    platform ingress intercepts `/api/*` to port 8001 before Next.js can apply its own rewrite).
  - `/app/frontend` — a symlink to `/app` (so the supervisor's fixed `directory=/app/frontend` resolves).
  - `package.json` `"start"` script changed to `"next dev -H 0.0.0.0 -p 3000"` for hot reload.
  - `.env.development`: `NEXT_PUBLIC_API_URL=/api` (relative, routed through the proxy above).
  - `next.config.ts`: added `allowedDevOrigins` for the preview domains.
  - `/frontend` and `/backend` added to `.gitignore` so these pod-only shims don't pollute the user's
    real GitHub repo structure.

## Core requirements (static)
- Admin roles: ADMIN, CUTTING, STITCHING, PICKUP_COORDINATOR (+ others). Order lifecycle:
  `ORDER_INITIATED → ORDER_PLACED → MATERIAL_DELIVERED_TO_WORKSHOP → ORDER_FULFILLED (cutting queue) →
  CUTTING_END (stitching queue) → STITCHING_END → PRODUCT_VERIFIED_OR_RECTIFIED → MATERIAL_PACKED →
  READY_FOR_DISPATCH → ORDER_COMPLETE`.

## What's been implemented (2026-08-13)
- **Root-caused and fixed** the pagination/search/sort/filter bug: `searchParams.toString()` was called
  on a plain object (from the `useRouter().query` compat hook), which always evaluated to the literal
  string `"[object Object]"` — so React Query never re-fetched on filter changes AND the actual API call
  received garbage params. Fixed in `OrdersPage.tsx`, `CustomersPage.tsx`, `ScheduledCallsPage.tsx`,
  `BlogList.tsx`, `BlogPage.tsx` by building a real query string via `new URLSearchParams(...)`.
  Verified end-to-end against live production data (filtering to "Order Completed" correctly narrowed
  409 orders to 1).
- **New `AdminOrderDetailView.tsx`** — replaces the old scattered 5-tab single-order modal and the
  `renderOrderManageControls + embedded customer-facing OrderDetailsPage` combo in the Customer View
  modal. One cohesive admin view per order: stat cards, style & customisations, delivery address,
  measurements, payment summary, and a "Manage Order" panel (processing state, order status, assign
  stitching agent, pin-to-top, SMS notify buttons, duplicate/delete/measurements actions), plus a
  collapsible timeline. Used identically in both the Customer-grouped modal (one tab per order) and the
  standalone single-order modal.
- **Customer demographics**: new `useCustomerOrderStats` hook (client-side aggregation over
  `/orders/all`, paginated) powers a new "Orders" column + "Repeat Customer" badge (2+ orders) on the
  Customers page.
- **Role-based queue dashboards**: new `RoleQueueView.tsx` + `orderStageConfig.ts` — a "Cutting Queue" /
  "Stitching Queue" tab in Orders page (visible to ADMIN/CUTTING/STITCHING) showing orders waiting on
  that stage, sorted by nearest delivery date, with urgency badges (Overdue/Xh left/Xd left) and a
  "Mark Done" action that advances the order to the next processing stage.
- **SMS notifications**: `notifyOrderApi` wired to "Notify Customer" buttons (Picked Up / Almost Ready /
  Out for Delivery / Delivered) in the manage panel — calls `POST /orders/:id/notify`, which does not
  exist on the backend yet (documented in `BACKEND_CHANGES_NEEDED.md`); fails gracefully with a toast
  until the user's backend team implements it (MSG91, already used for OTP).
- Fixed `AdminDashboard.tsx` requesting `limit=200` (backend caps at 100), which was breaking analytics.
- Full test pass via testing_agent (100% frontend success rate); reverted a real production order's
  status/pin state that got mutated during testing back to its original values.

## Backend changes needed (logged for user's backend team)
See `/app/memory/BACKEND_CHANGES_NEEDED.md`:
1. `/orders/all` list endpoint missing many fields (customerPhone, productName, prices, paymentStatus,
   orderStatus, pin state, etc.) — only the detail endpoint `/orders/:id` has them today.
2. `/auth/customers` missing aggregated order stats (orderCount, totalSpent, lastOrderDate).
3. New endpoint `POST /orders/:id/notify` for SMS stage updates (MSG91).
4. Nice-to-have: `processingState` filter param on `/orders/all` for efficient role queues at scale.

## Prioritized backlog / next tasks
- P1: Backend team to implement the 4 items above — once done, revisit Orders/Customers list-level
  metrics (Value/Payments cards currently show ₹0 due to missing list fields) and make customer
  demographics/queue filtering server-side instead of client-aggregated.
- P2: Pickup workflow with GPS directions for pickup coordinator (mentioned by user, needs backend +
  maps integration — not started).
- P2: Broadcast/marketing messaging to repeat customers/leads (explicitly skipped this round, backlog).
- P3: Delete-confirmation hardening (typed order-id confirm) before allowing delete on live production
  orders from the admin UI — flagged by testing agent as a nice safety improvement.
