# SILAIGO Backend Changes — Order Workflow Redesign, Customer Tracking & WhatsApp Automation

This file documents every backend change required to fully deliver the
"SILAIGO Order Workflow Redesign, Customer Tracking & WhatsApp Automation"
brief. **None of this can be implemented in this repo** — this repo is the
Next.js frontend only. The real backend lives at `https://api.silaigo.com`
and is a separate codebase/service not present here. The frontend has
already been updated to call the new endpoints below; until the backend
implements them, those specific actions fail gracefully with a toast that
references this file.

Companion doc: `BACKEND_CHANGES_NEEDED.md` (earlier, unrelated admin-dashboard
iteration) — read that one too, some of its gaps (e.g. `orders/:id/notify`,
timeline population) are prerequisites for this feature set.

---

## 0. What already exists today (do not rebuild)

Confirmed from the frontend code:

- **Order model** has (at least) two independent status dimensions:
  - `orderStatus`: `PENDING | PLACED | PAYMENT_PENDING | PAYMENT_DONE | COMPLETED | CANCELLED` (payment/booking lifecycle).
  - `orderProcessingState` (production lifecycle, 10 values, in order):
    `ORDER_INITIATED → ORDER_PLACED → MATERIAL_DELIVERED_TO_WORKSHOP → ORDER_FULFILLED → CUTTING_END → STITCHING_END → PRODUCT_VERIFIED_OR_RECTIFIED → MATERIAL_PACKED → READY_FOR_DISPATCH → ORDER_COMPLETE`.
- **Roles**: `ADMIN`, `PICKUP_COORDINATOR` (Pickup Agent), `CUTTING` (Cutting Master), `STITCHING` (Tailor/Stitching Agent), `CUSTOMER`, `TAILOR` (legacy/unused in current UI).
- **Cutting/Stitching queues**: `ORDER_FULFILLED` = the cutting queue (order sits here until a Cutting Master advances it); `CUTTING_END` = cutting done / stitching queue trigger; assignment to a Stitching Agent happens via a "assign stitching agent" endpoint, then `STITCHING_END` marks stitching done.
- **Pickup system**: pickups are a separate entity with their own ID, schedule date/time, and are converted into orders by the Pickup Agent (`CreateOrder` flow, prefilled from `pickupId`). Do not touch this relationship.
- **Assignment**: cutting master + stitching agent assignment already has a working mechanism (`assignOrderToStitchingAgent`, cutting-master auto/manual logic implied by `teamMembersViaRole`). Preserve as-is.
- **Micro-events / "EventsOptions"**: a generic, role-scoped per-order checklist system already exists (`getRoleOrderOptions`, `addMicroEventToTimeLine`, `getMicroTaskTimeLine`) — this is likely already the intended plumbing for granular internal checkpoints. Backend team should confirm whether it already supports "Cutting Start" / "Stitching Start" style micro-events; if so, wire the frontend Start/End buttons to it instead of the local-only toggle described in section 3 below.
- **Notifications today**: SMS only via MSG91, triggered through `POST /orders/:id/notify` with `stage: picked_up | ready | dispatched | delivered` (per `BACKEND_CHANGES_NEEDED.md`, this endpoint doesn't exist yet either — it's a prerequisite).
- **PDF/Invoice generation**: already exists (Order Summary PDF + Invoice), not detailed further here since this repo only consumes/download-links them — reuse the existing generated file URLs, do not regenerate.
- **Homepage "Track Your Order"**: did **not** exist in this codebase snapshot. A new component (`TrackOrderSection`) has been added to the homepage frontend; it requires a new **public** endpoint (section 6).

---

## 1. New internal order lifecycle — status model & migration

### 1.1 Recommended internal enum (matches the brief, section 22)

```
PICKUP_CREATED            (Pickup entity only, not Order)
ORDER_CREATED
ORDER_FULFILLED
CUTTING_STARTED
CUTTING_ENDED
STITCHING_STARTED
STITCHING_ENDED
FINISHING_QC
READY_TO_DISPATCH
DELIVERED
RETURNED_FOR_ALTERATION
```

Assignment actions (`ASSIGN_TAILOR`, cutting-master assignment) and queue
placements (`PICKUP_AGENT_QUEUE`) must **not** become enum values — they are
actions/derived views, exactly as the brief requires.

### 1.2 Migration mapping (old → new), non-destructive

Add the new enum values **alongside** the old ones (do not delete old
values from the schema/enum — old orders must remain readable). Add a
migration that back-fills a new field, e.g. `order.internalStage`, computed
once from the existing `orderProcessingState` using this mapping, and keep
`orderProcessingState` as the system of record going forward for backward
compatibility with anything else reading it:

| Old `orderProcessingState`          | New `internalStage`      |
|--------------------------------------|---------------------------|
| ORDER_INITIATED, ORDER_PLACED         | ORDER_CREATED             |
| MATERIAL_DELIVERED_TO_WORKSHOP        | ORDER_FULFILLED (pending) |
| ORDER_FULFILLED                       | CUTTING_STARTED           |
| CUTTING_END                           | CUTTING_ENDED             |
| (no old equivalent — new)             | STITCHING_STARTED         |
| STITCHING_END                         | STITCHING_ENDED           |
| PRODUCT_VERIFIED_OR_RECTIFIED, MATERIAL_PACKED | FINISHING_QC     |
| READY_FOR_DISPATCH                    | READY_TO_DISPATCH         |
| ORDER_COMPLETE                        | DELIVERED                 |
| (no old equivalent — new)             | RETURNED_FOR_ALTERATION   |

Migration script requirements:
- Idempotent (safe to re-run).
- Runs as a one-off job over existing orders, writes `internalStage` without mutating `orderProcessingState`, `orderId`, `pickupId`, payment fields, PDFs/invoice URLs, or `timeLine`/audit history.
- Log a summary (count per resulting stage) for verification before considering it done.
- Historical orders that are already `ORDER_COMPLETE`/`CANCELLED` should map straight to `DELIVERED`/a terminal value and not re-enter any workflow.

### 1.3 New fields required on the Order document

```
whatsappOptIn: boolean                 // section 3 — checkbox at order creation
isReturnedForAlteration: boolean       // default false
alterationUrgency: 1 | 2 | 3 | null    // INTERNAL ONLY, never serialize to customer-facing responses
alterationHistory: [{ tailorId, urgency, assignedBy, assignedAt, returnedAt }]
cuttingStartedAt / cuttingEndedAt: ISO string | null
stitchingStartedAt / stitchingEndedAt: ISO string | null
promisedDeliveryAt: ISO string         // if not already present under another name — see section 5
delayNotifiedAt: ISO string | null     // dedupe flag, see section 5
reviewLinkSentAt: ISO string | null
```

Audit: continue appending to the existing order history/timeline mechanism
(`status`, `timestamp`, `performedBy`, `role`) for every transition above —
do not create a second parallel audit table.

---

## 2. New / changed APIs

All new endpoints below are already called from the frontend (see
`src/services/modules/orders.api.ts`) and fail gracefully with a toast
until implemented.

### 2.1 `POST /orders/:id/alteration`
Body: `{ tailorId: string, urgency: "1" | "2" | "3" }`
- Requires role `ADMIN` or `PICKUP_COORDINATOR`.
- Sets `isReturnedForAlteration=true`, `alterationUrgency=urgency`, assigns `tailorId`, appends to `alterationHistory`, sets `internalStage=RETURNED_FOR_ALTERATION` then immediately `STITCHING_STARTED` is NOT auto-set — tailor must still click Start Stitching (reuse existing stitching endpoints).
- Triggers the mandatory "Returned for Alteration" WhatsApp message (section 4.3), regardless of `whatsappOptIn`.
- Must **not** skip Cutting/Finishing & QC again — after alteration stitching ends, go straight to `READY_TO_DISPATCH` (reuse the existing stitching-end handler, but branch on `isReturnedForAlteration` to skip the Finishing & QC hop).

### 2.2 `POST /orders/:id/review-link`
- Requires role `ADMIN` or `PICKUP_COORDINATOR`.
- Only callable when order is `DELIVERED`/`ORDER_COMPLETE`.
- Generates/sends the review link via WhatsApp (or SMS if WhatsApp unavailable for that customer), sets `reviewLinkSentAt`.
- Purely manual — never triggered by any other event.

### 2.3 `GET /orders/track/:orderId` (PUBLIC, no auth)
- Returns **only** customer-safe fields:
  ```json
  {
    "orderId": "04SS0805",
    "processingState": "ORDER_FULFILLED",
    "isReturnedForAlteration": false,
    "pickupScheduledLabel": "20 Aug 2026, 10:00–12:00 PM"
  }
  ```
- MUST NOT return: customer PII beyond the order id itself, assignee names, urgency, internal notes/timestamps, payment details, addresses.
- Rate-limit this endpoint (public, no auth) to prevent order-ID enumeration abuse.
- 404 if the order id doesn't exist (frontend already handles this gracefully).

### 2.4 `POST /orders/:id/notify` (prerequisite, from BACKEND_CHANGES_NEEDED.md)
- Needed for the "Delivered" mandatory payment confirmation used by the new Pickup Agent "Delivered" action, and should be extended to send over WhatsApp (see section 4).

### 2.5 Cutting Master auto/manual assignment
- On `ORDER_FULFILLED` (order becomes eligible for production): if exactly one **active** `CUTTING` user exists, auto-assign; if multiple, leave unassigned and surface it in an admin "needs cutting-master" queue (no new customer-facing status); if zero, keep the order visible in an internal "unassigned" admin queue — never silently drop it.
- No new "Cutting Assigned" status — assignment is a field on the order (`cuttingMasterId`), not a stage.

---

## 3. Granular Cutting/Stitching "Started" states

The current backend only tracks a single "queued" state per phase
(`ORDER_FULFILLED` for cutting, "assigned" for stitching) and a single
"ended" state (`CUTTING_END`, `STITCHING_END`) — there's no persisted
"Started" timestamp. The frontend currently fakes this with a **local
(browser-only) toggle** (see `RoleQueueView.tsx`) purely for UX affordance;
it is not persisted or auditable.

**To do properly**: add `POST /orders/:id/cutting/start` and
`POST /orders/:id/stitching/start` (or reuse the existing micro-event
system in section 0 if it already supports this) that set
`cuttingStartedAt`/`stitchingStartedAt` and fire the optional WhatsApp
"Cutting Started" / "Stitching Started" messages (section 4.4). Once these
exist, replace the frontend's local-storage toggle with a real API call —
no other frontend changes needed.

---

## 4. WhatsApp notification system

### 4.1 Channel selection
Reuse the existing MSG91 integration (already used for SMS) — MSG91 also
offers a WhatsApp Business API product; alternatively use whichever
WhatsApp provider is already wired into the backend per the user's
confirmation that "WhatsApp is already integrated." Route all messages in
this spec through that single provider/template system — do not build a
second parallel notification path.

### 4.2 Mandatory events (send regardless of `whatsappOptIn`)

| Event | Trigger | Content |
|---|---|---|
| Pickup Created | Admin creates/schedules a pickup | Pickup Agent name, date, time window, location |
| Order Created | Pickup Agent creates the order | Attach existing Order Summary PDF + Invoice (reuse existing generated file URLs — do not regenerate) |
| Returned for Alteration | `POST /orders/:id/alteration` | Fixed copy: "Sorry, your order could not be completed correctly on the first attempt. We are taking it back for alteration." — no assignee/urgency/internal detail |
| Delivered | Pickup Agent marks Delivered | Delivery + payment confirmation using existing payment/invoice data |
| Delay | Deadline exceeded (section 5) | "There has been a delay with your order. Our team will get back to you shortly." |

### 4.3 Optional events (send only if `whatsappOptIn === true`)

| Event | Trigger | Content |
|---|---|---|
| Cutting Started | `cuttingStartedAt` set | "Your order has now moved to cutting." |
| Stitching Started | `stitchingStartedAt` set | "Your order is now being stitched." |
| QC Done / Ready to Dispatch | `internalStage → READY_TO_DISPATCH` | "Your order has passed QC and is ready to dispatch." |

No message for Finishing & QC as a separate step — the single
"QC Done / Ready to Dispatch" message covers it.

### 4.4 Review link
Never automatic. Only via `POST /orders/:id/review-link` (section 2.2).

### 4.5 Implementation notes
- Persist `whatsappOptIn` from order creation (section 6) on the order (and/or customer profile, since the brief says "against the order/customer").
- Every send should be logged (event type, timestamp, success/failure) on the order for support/debugging, without exposing that log to the customer.
- Template content above should live in one place (e.g. a `whatsappTemplates` config) so copy changes don't require code changes.

---

## 5. Delay notifications

- Use whichever field currently represents the promised/committed
  date-time (the frontend order list uses `appointmentDate` for "next
  delivery" — confirm on the backend whether this is the same field as the
  customer-committed delivery date, or if there's a distinct
  `promisedDeliveryAt`/`committedAt` field. **Do not invent a new deadline
  field if one already exists** — audit the schema first).
- Run a scheduled job (e.g. every 15–30 min) that finds orders where
  `now > promisedDeliveryAt` and `internalStage` is not yet
  `READY_TO_DISPATCH`/`DELIVERED`, and `delayNotifiedAt IS NULL`.
- Send the delay WhatsApp message, then set `delayNotifiedAt = now()` so
  the same deadline never re-fires (dedupe requirement, section 19 of the
  brief). If the order later gets a **new** promised date (e.g. after
  alteration), reset `delayNotifiedAt` to null so a genuinely new deadline
  can still trigger once.
- This must fire even when `whatsappOptIn === false`.

---

## 6. WhatsApp opt-in checkbox

- Frontend already sends `whatsappOptIn: boolean` inside the order-creation
  payload (`customerData.whatsappOptIn`) from `CartCheckout.tsx` /
  `CartCheckoutForm` (used by `CreateOrder.tsx`), defaulting to `true`.
- Backend: persist this field on order creation; if the customer already
  exists, consider also storing it on the customer profile as a
  cross-order default, but the order-level field is the source of truth
  for "was WhatsApp opted-in for this specific order."
- This flag must **never** suppress the mandatory events in section 4.2.

---

## 7. Role permissions (confirm/enforce server-side)

| Role | New/changed permissions needed |
|---|---|
| ADMIN | Manual cutting-master assignment when >1 active; Finishing & QC → Ready to Dispatch; assign alteration tailor; view `alterationUrgency`/timestamps; everything Pickup Agent/Cutting/Stitching can do |
| PICKUP_COORDINATOR | Mark Delivered; `POST /orders/:id/alteration` (assign tailor + urgency); `POST /orders/:id/review-link`; read `whatsappOptIn` on their orders |
| CUTTING | Start/End cutting (section 3); assign stitching agent after Cutting Ended (existing) |
| STITCHING | Start/End stitching (section 3) |
| Public (no auth) | `GET /orders/track/:orderId` only, customer-safe fields |

Do not expose `alterationUrgency`, tailor/cutting-master identity,
internal notes, or internal timestamps through any customer-facing or
public endpoint — enforce this via a dedicated serializer for the public
tracking endpoint, not by trusting the frontend to hide fields.

---

## 8. Edge cases to implement server-side

- **Zero active Cutting Masters**: order stays in an internal
  "unassigned cutting" admin queue; never silently lost.
- **Alteration**: `STITCHING_END` handler must branch on
  `isReturnedForAlteration` to skip Finishing & QC and go straight to
  `READY_TO_DISPATCH`.
- **Same-time Pickup + Order Created**: store both timestamps
  independently even if identical to the second.
- **Historical orders**: `internalStage` migration (section 1.2) must
  leave every existing order queryable/renderable; do not fail order reads
  for orders created before this migration.

---

## 9. Suggested implementation order for the backend team

1. Schema migration (section 1) — additive only, ship first, verify with the mapping log.
2. `POST /orders/:id/notify` (WhatsApp-capable) — unblocks Delivered + Pickup Created + Order Created messages.
3. `POST /orders/:id/alteration`, `POST /orders/:id/review-link` — unblocks the two new frontend buttons already shipped.
4. Cutting/Stitching "Started" persistence (section 3) — replaces the frontend's local-only toggle.
5. `GET /orders/track/:orderId` (public) — unblocks the homepage widget already shipped.
6. Delay job (section 5) — lowest urgency, but must dedupe from day one.
