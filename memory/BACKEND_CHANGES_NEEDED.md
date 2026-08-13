# Backend Changes Needed — SILAIGO Admin

This is a running log of backend (api.silaigo.com) changes required to fully
support the admin dashboard improvements. The frontend has been built to work
gracefully in their absence (showing "—"/best-effort values), but accuracy and
performance will improve once these land.

## 1. `GET /orders/all` (list endpoint) is missing fields

Confirmed via live testing: the list response only returns
`orderId, id, customerName, customerId, appointmentDate, appointmentTime,
orderDate, notes, orderProcessingState`.

It is **missing**: `customerPhone`, `customerEmail`, `productName`,
`productPrice`, `customPrice`, `paymentStatus`, `orderStatus`,
`assignedToStitchingAgentId`, `isPinned`, `pinPosition`, `couponCode`,
`timeLine`, `measurements`.

**Impact today:** Orders table/customer-view "Value", "Payments", price
columns, payment status, and pin state all show ₹0 / defaults on the list
page. The admin order modal works around this by calling
`GET /orders/:id` for full detail, but the **list & summary rows/metrics
cannot be fixed without this backend change.**

**Ask:** add the fields above to the `/orders/all` list projection (they
already exist on `GET /orders/:id`, so this should be a projection change,
not new data modelling).

## 2. `GET /auth/customers` is missing order stats

Missing: `orderCount`, `totalSpent`, `lastOrderDate` (or similar aggregated
fields) per customer.

**Impact today:** the Customers page "Orders"/"Repeat Customer" column is
computed **client-side** by paging through `/orders/all` (up to 800 orders)
and grouping by `customerId` — this is a stop-gap (`useCustomerOrderStats`
hook) and doesn't scale well, and there's no way to filter/sort customers
server-side by "has 2+ orders" (useful for lead follow-up lists).

**Ask:** add `orderCount`, `totalSpent`, `lastOrderDate` to the customer list
response (aggregation via `orders` collection keyed by `customerId`), and
ideally a `minOrders` query filter param.

## 3. New endpoint: `POST /orders/:id/notify`

The admin order view has "Notify Customer (SMS)" buttons for stages
`picked_up | ready | dispatched | delivered`, calling
`POST /orders/:id/notify` with body `{ stage }`. **This endpoint does not
exist yet** — the frontend call will fail with a friendly toast until it's
added.

**Ask:** implement using the existing MSG91 integration (already used for
OTP) — send a templated SMS to the order's customer phone based on `stage`.
No frontend changes will be needed once this exists.

## 4. Efficient role-based queues (Cutting/Stitching)

Today the Cutting/Stitching "queue" views fetch `orders/all?limit=100` and
filter client-side by `orderProcessingState` (`ORDER_FULFILLED` = cutting
queue, `CUTTING_END` = stitching queue). This works at current volume but
won't scale.

**Ask (nice-to-have):** support a `processingState` filter query param on
`/orders/all` for server-side filtering + pagination of role queues.

## 5. Broadcast / marketing messages — explicitly out of scope for now

Not building this per user's request (skipped in this iteration).
