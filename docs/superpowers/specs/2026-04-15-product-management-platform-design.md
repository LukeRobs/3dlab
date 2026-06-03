# Product Management Platform — Design Spec

**Date:** 2026-04-15
**Status:** Approved

## Overview

A full-stack product management platform for a 3D-printed geek merchandise business. The system has two distinct faces: a public product catalog where customers browse and initiate purchases via WhatsApp, and a protected admin panel where the team manages products, raw materials, costs, and views business metrics.

## Business Context

- Products are 3D-printed geek items (miniatures, figures, accessories, decorations)
- Sales are finalized through WhatsApp — the platform generates a pre-filled message and redirects the customer
- Cost tracking covers raw material consumption (filament/resin by weight) and electricity usage
- Small team to start, expected to scale

---

## Architecture

### Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Frontend | React + Vite + Tremor |
| Auth | JWT (access token, 7-day expiry, stored in localStorage) |
| Monorepo | npm workspaces |

**Security note (MVP trade-off):** Storing JWT in localStorage is vulnerable to XSS. Because admin users share the same frontend origin as the public catalog, a successful XSS attack on the public surface could expose admin tokens. Compensating controls required in MVP:
- Strict input validation and output escaping on all user-controlled content
- No `dangerouslySetInnerHTML` in the frontend
- Strict CORS policy
- All admin routes protected by both auth middleware and role guard

Future iteration should migrate to httpOnly cookies with refresh tokens.

### Admin Account Bootstrap

The first admin user is created via a DB seed script (`backend/src/db/seed-admin.js`) that inserts a user with `role: 'admin'` directly. Subsequent admin accounts are created by an existing admin through `POST /api/admin/usuarios`. There is no public registration path for admins.

### Repository Structure

```
/
├── backend/
│   ├── src/
│   │   ├── routes/       # auth, produtos, materiais, pedidos, carrinho, admin, dashboard
│   │   ├── db/           # pg client, migrations
│   │   └── middleware/   # JWT auth, role guard, error handler
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # public catalog + admin pages
│   │   ├── components/   # shared UI components
│   │   └── lib/          # API client, auth context, cart helpers
│   └── package.json
└── package.json          # workspace root
```

### User Roles

Two roles share a single `users` table, differentiated by `role` field:

- **`customer`** — browses catalog, manages cart, views order history
- **`admin`** — manages products, categories, materials, settings, views dashboard

---

## Data Model

### `users`
```
id UUID PK, name TEXT, email TEXT UNIQUE, password_hash TEXT,
role TEXT ('customer'|'admin'), created_at TIMESTAMPTZ
```

### `categories`
```
id UUID PK, name TEXT, slug TEXT UNIQUE
```

### `products`
```
id UUID PK, name TEXT, slug TEXT UNIQUE, description TEXT,
price DECIMAL, category_id UUID FK, print_time_minutes INTEGER,
cost_calculated DECIMAL DEFAULT 0, is_active BOOLEAN DEFAULT true,
views_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

`cost_calculated` initializes to `0`. A product can be saved with no materials assigned; the cost will be `0` until materials are added.

### `product_images`
```
id UUID PK, product_id UUID FK, url TEXT,
is_primary BOOLEAN DEFAULT false,
sort_order INTEGER NOT NULL DEFAULT 0,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

Images are returned ordered by `is_primary DESC, sort_order ASC, created_at ASC`. In MVP, admins provide URLs directly (external hosting or a local `/uploads` folder served by Express). No file upload infrastructure required in MVP.

### `materials`
```
id UUID PK, name TEXT, type TEXT ('filament'|'resin'),
price_per_gram DECIMAL, created_at TIMESTAMPTZ
```

### `product_materials`
```
product_id UUID FK, material_id UUID FK, quantity_grams DECIMAL
PRIMARY KEY (product_id, material_id)
```

### `settings`
Global key-value table used for electricity config, WhatsApp number, and store info.

```
key TEXT PK, value TEXT, updated_at TIMESTAMPTZ
```

Key entries:
- `whatsapp_number` — phone number for WhatsApp redirect (digits only, e.g. `5511999999999`)
- `electricity_kwh_price` — price per kWh in BRL
- `printer_power_watts` — printer wattage
- `store_name`, `store_description`

### `cart_items`
```
id UUID PK, user_id UUID FK, product_id UUID FK,
quantity INTEGER, created_at TIMESTAMPTZ,
UNIQUE (user_id, product_id)
```

The unique constraint on `(user_id, product_id)` ensures no duplicate rows per product per user. Adding the same product again increments quantity via `ON CONFLICT DO UPDATE`.

### `orders`
```
id UUID PK, user_id UUID FK, status TEXT ('pending'|'confirmed'|'cancelled') DEFAULT 'pending',
total_price DECIMAL, whatsapp_message TEXT, created_at TIMESTAMPTZ
```

**Order lifecycle:** Orders created by `POST /api/pedidos` represent **checkout intents** — the customer initiated the flow and was redirected to WhatsApp, but may not have sent the message. An order stays `pending` until the team confirms customer contact via WhatsApp and updates the status to `confirmed`. Only `confirmed` orders count as actual sales in dashboard metrics.

### `order_items`
```
id UUID PK, order_id UUID FK, product_id UUID FK,
quantity INTEGER, unit_price DECIMAL
```

### Delete Rules

Deletes must validate references before mutating:

- **Categories:** Block delete if any product references the category. Return 409 with a clear message.
- **Materials:** Block delete if any `product_materials` row references the material. Return 409.
- **Products:** If the product has `order_items` history, set `is_active = false` (soft delete) instead of hard deleting. Hard delete is only permitted when no dependent rows exist.

### Cost Calculation Formula

```
material_cost    = SUM(quantity_grams * price_per_gram) for each product_material
electricity_cost = (print_time_minutes / 60) * (printer_power_watts / 1000) * kwh_price
cost_calculated  = material_cost + electricity_cost
```

`cost_calculated` is recomputed and stored on the product row in four cases:
1. Product is saved (create or update)
2. A `product_materials` row is added, updated, or removed for that product
3. `PUT /api/admin/configuracoes` updates electricity settings — triggers synchronous bulk recalculation of all products
4. `PUT /api/admin/materiais/:id` updates `price_per_gram` — triggers synchronous recalculation of all products linked to that material

**MVP note:** Synchronous bulk recalculations (cases 3 and 4) are acceptable for MVP given the small catalog. If the catalog grows to hundreds of products these should move to background jobs.

### WhatsApp Message Template

When `POST /api/pedidos` creates an order, the `whatsapp_message` field is generated from:

```
Ola! Gostaria de fazer um pedido:

- {quantity}x {product_name} - R$ {unit_price}
(repeated for each order item)

Total: R$ {total_price}
Pedido #{order_id_short}
```

`order_id_short` is the first 8 characters of the order UUID. The message is URL-encoded and appended to `https://wa.me/{whatsapp_number}?text=...`.

---

## Frontend Routes

### Public (no auth required)

| Route | Description |
|---|---|
| `/` | Catalog — product grid with category filter |
| `/produto/:slug` | Product detail — images, price, add to cart |
| `/carrinho` | Cart — localStorage if guest, DB if logged in |
| `/login` | Customer login — includes link to `/cadastro` |
| `/cadastro` | Customer registration — includes link to `/login` |

When a guest clicks "Finalizar Compra" they are redirected to `/login?redirect=/carrinho`. The login page shows a visible link to `/cadastro` for new customers so they can register within the purchase funnel.

### Customer (role: customer)

| Route | Description |
|---|---|
| `/conta/pedidos` | Order history |

### Admin (role: admin)

| Route | Description |
|---|---|
| `/admin/dashboard` | Metrics dashboard (Tremor charts) |
| `/admin/produtos` | Product listing — edit and delete inline |
| `/admin/produtos/novo` | Create product |
| `/admin/produtos/:id` | Edit product (includes material assignment and image management) |
| `/admin/materiais` | Materials listing — edit and delete inline |
| `/admin/materiais/novo` | Create material |
| `/admin/materiais/:id` | Edit material |
| `/admin/categorias` | Categories listing — create, edit, delete inline |
| `/admin/pedidos` | All orders with line items — status update inline |
| `/admin/configuracoes` | WhatsApp number, electricity, store info |

Delete actions are available directly from listing pages via an inline button on each row (products, materials, categories). Blocked deletes return an error toast explaining why.

### Cart & Purchase Flow

```
1. Guest adds item -> saved to localStorage
2. Logged-in user adds item -> POST /api/carrinho writes directly to DB
3. Guest clicks "Finalizar Compra" -> redirect to /login?redirect=/carrinho
4. /login page shows link to /cadastro for new customers
5. After login/register -> POST /api/carrinho/merge (localStorage -> DB, quantities summed on conflict)
6. Back to /carrinho -> customer reviews and confirms
7. POST /api/pedidos -> order created (status: pending), cart_items cleared, WhatsApp message generated
8. Browser opens wa.me link with pre-filled message
9. Order appears in /conta/pedidos as "pending"
10. Admin confirms via WhatsApp contact -> updates status to "confirmed" in /admin/pedidos
```

---

## API Endpoints

### Auth
```
POST /api/auth/register    — customer registration
POST /api/auth/login       — login for both roles, returns JWT (7-day expiry)
```

### Public Catalog
```
GET  /api/produtos              — list active products (filter: ?category=slug, ?search=term)
GET  /api/produtos/:slug        — product detail (no side effects)
                                   Response: product fields, images[], product_materials[]
                                   with material name and quantity_grams (no cost fields)
POST /api/produtos/:slug/view   — increment views_count (called by frontend on detail page load)
GET  /api/categorias            — list categories (id, name, slug)
```

Using a dedicated `POST /api/produtos/:slug/view` endpoint keeps the GET idempotent and prevents view inflation from browser prefetching, crawlers, and retries.

### Cart (customer auth)
```
GET    /api/carrinho           — get cart items (DB only, for logged-in users)
POST   /api/carrinho           — add item to DB cart; increments quantity if product already exists
PUT    /api/carrinho/:id       — update quantity
DELETE /api/carrinho/:id       — remove item
POST   /api/carrinho/merge     — merge localStorage cart into DB after login;
                                  quantities summed on conflict
```

**Frontend cart logic:** The frontend checks auth state before calling any cart API. Guests write to localStorage only and never call `POST /api/carrinho`. Logged-in users write directly to the DB via the API and do not use localStorage.

### Orders (customer auth)
```
POST /api/pedidos              — create order from cart_items, clear cart_items, return WhatsApp URL
GET  /api/pedidos              — customer order history (includes order_items per order)
```

### Admin — Products
```
GET    /api/admin/produtos           — list: id, name, price, cost_calculated, is_active, views_count
POST   /api/admin/produtos           — create product
PUT    /api/admin/produtos/:id       — update product; recalculates cost_calculated
DELETE /api/admin/produtos/:id       — hard delete if no order history; soft delete (is_active=false) otherwise
GET    /api/admin/produtos/:id       — full product: all fields + images[] + product_materials[]
```

Full product response (single GET, PUT response):
- All product fields including `cost_calculated`, `print_time_minutes`
- `images[]` (id, url, is_primary, sort_order) ordered by `is_primary DESC, sort_order ASC, created_at ASC`
- `product_materials[]` (material_id, name, type, price_per_gram, quantity_grams)

### Admin — Product Materials
```
POST   /api/admin/produtos/:id/materiais          — assign material {material_id, quantity_grams}; triggers cost recalc
PUT    /api/admin/produtos/:id/materiais/:matId   — update quantity_grams; triggers cost recalc
DELETE /api/admin/produtos/:id/materiais/:matId   — remove material from product; triggers cost recalc
```

### Admin — Product Images
```
POST   /api/admin/produtos/:id/images            — add image {url, sort_order}
DELETE /api/admin/produtos/:id/images/:imgId     — remove image
PUT    /api/admin/produtos/:id/images/:imgId     — update is_primary or sort_order
```

Setting `is_primary: true` on one image clears the flag on all others for that product.

### Admin — Materials
```
GET    /api/admin/materiais
POST   /api/admin/materiais
PUT    /api/admin/materiais/:id    — if price_per_gram changes, triggers cost recalc for linked products
DELETE /api/admin/materiais/:id    — blocked if referenced by product_materials (409)
```

### Admin — Categories
```
GET    /api/admin/categorias
POST   /api/admin/categorias
PUT    /api/admin/categorias/:id
DELETE /api/admin/categorias/:id   — blocked if referenced by products (409)
```

### Admin — Orders
```
GET /api/admin/pedidos              — all orders with order_items included
GET /api/admin/pedidos/:id          — single order detail with order_items
PUT /api/admin/pedidos/:id          — update status ('pending'->'confirmed' or 'cancelled')
```

### Admin — Users
```
POST /api/admin/usuarios            — create a new admin user (role: 'admin')
```

### Admin — Dashboard & Config
```
GET /api/admin/dashboard       — metrics (see Dashboard Metrics section)
GET /api/admin/configuracoes   — get all settings
PUT /api/admin/configuracoes   — update settings; if electricity values change, triggers bulk cost recalc
```

---

## Dashboard Metrics

The dashboard distinguishes checkout funnel events from confirmed revenue.

| Metric | Definition | Source |
|---|---|---|
| Checkout intents created | All orders ever created | COUNT(orders) |
| Pending orders | Awaiting confirmation | COUNT(orders WHERE status = 'pending') |
| Confirmed orders | Team confirmed contact | COUNT(orders WHERE status = 'confirmed') |
| Cancelled orders | Cancelled by team | COUNT(orders WHERE status = 'cancelled') |
| Confirmed sales value | Revenue from confirmed orders | SUM(total_price WHERE status = 'confirmed') |
| Top viewed products | Most popular in catalog | products.views_count ORDER BY DESC LIMIT 10 |
| Product margin | Cost vs price per product | (price - cost_calculated) / price * 100 |

---

## Error Handling

### Backend
- Global error middleware returns `{ error: "message" }` with appropriate HTTP status
- Input validation on all routes before DB access
- 401 for expired/missing JWT, 403 for insufficient role
- 409 for blocked delete operations (referenced records)

### Frontend
- API errors shown as toast notifications
- localStorage cart parsed with try/catch — corrupted state resets silently to empty cart
- Protected routes redirect to login preserving `?redirect` param
- Blocked delete actions display the 409 error message from the API

---

## Testing

### Backend
- Integration tests with real PostgreSQL database (Jest + Supertest)
- Coverage targets: auth flows, order creation and cart clearing, cost calculation (all 4 recalculation triggers), cart merge, delete blocking rules

### Frontend
- Manual testing in MVP phase
- No automated frontend tests initially

---

## Out of Scope (MVP)

- Payment processing (purchases close via WhatsApp)
- Stock tracking per material
- Email notifications
- Post-processing materials (paint, primer) — add in future iteration
- File upload for product images (URLs only in MVP)
- JWT refresh tokens (7-day expiry, re-login required after expiry)
- httpOnly cookie auth — deferred post-MVP
- Background jobs for bulk cost recalculation — deferred if catalog stays small
