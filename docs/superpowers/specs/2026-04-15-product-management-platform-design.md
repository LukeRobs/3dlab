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

**Security note:** Storing JWT in localStorage is vulnerable to XSS. This is an accepted MVP trade-off. A future iteration should migrate to httpOnly cookies or add a refresh token strategy.

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
id UUID PK, product_id UUID FK, url TEXT, is_primary BOOLEAN DEFAULT false
```

Images are stored as URLs. In MVP, admins provide URLs directly (external hosting or a local `/uploads` folder served by Express). No file upload infrastructure required in MVP. Display order of non-primary images follows insertion order (no explicit `sort_order` field in MVP).

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

Orders are created with `status: 'pending'`. Admin can transition to `confirmed` or `cancelled` via the admin panel.

### `order_items`
```
id UUID PK, order_id UUID FK, product_id UUID FK,
quantity INTEGER, unit_price DECIMAL
```

### Cost Calculation Formula

```
material_cost    = SUM(quantity_grams × price_per_gram) for each product_material
electricity_cost = (print_time_minutes / 60) × (printer_power_watts / 1000) × kwh_price
cost_calculated  = material_cost + electricity_cost
```

`cost_calculated` is recomputed and stored on the product row in three cases:
1. Product is saved (create or update)
2. A `product_materials` row is added, updated, or removed for that product
3. `PUT /api/admin/configuracoes` updates electricity settings — triggers a **synchronous bulk recalculation** of `cost_calculated` for all products before returning the response

**MVP note:** The bulk recalculation on settings change is synchronous and acceptable for MVP given the small catalog size. If the catalog grows to hundreds of products this should move to a background job.

### WhatsApp Message Template

When `POST /api/pedidos` creates an order, the `whatsapp_message` field is generated from:

```
Olá! Gostaria de fazer um pedido:

{order_items: "- {quantity}x {product_name} — R$ {unit_price}\n"}

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

Delete actions are available directly from listing pages via an inline button on each row (products, materials, categories). No separate delete route is needed.

### Cart & Purchase Flow

```
1. Guest adds item → saved to localStorage
2. Logged-in user adds item → POST /api/carrinho writes directly to DB (no localStorage used)
3. Guest clicks "Finalizar Compra" → redirect to /login?redirect=/carrinho
4. /login page shows link to /cadastro for new customers
5. After login/register → POST /api/carrinho/merge (localStorage → DB, quantities summed on conflict)
6. Back to /carrinho → customer reviews and confirms
7. POST /api/pedidos → order_items created from cart_items, cart_items deleted, WhatsApp message generated
8. Browser opens wa.me link with pre-filled message
9. Order appears in /conta/pedidos
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
GET  /api/produtos         — list active products (filter: ?category=slug, ?search=term)
GET  /api/produtos/:slug   — product detail + increment views_count
                             Response: product fields, images[], product_materials[]
                             with material name and quantity_grams (no cost fields)
GET  /api/categorias       — list categories (id, name, slug)
```

The admin categories listing (`GET /api/admin/categorias`) returns the same shape as the public endpoint. The admin frontend uses the public `GET /api/categorias` for read-only listing and the admin endpoints only for mutations (POST/PUT/DELETE).

### Cart (customer auth)
```
GET    /api/carrinho           — get cart items (DB only, for logged-in users)
POST   /api/carrinho           — add item to DB cart; increments quantity if product already exists
PUT    /api/carrinho/:id       — update quantity
DELETE /api/carrinho/:id       — remove item
POST   /api/carrinho/merge     — merge localStorage cart into DB after login;
                                 quantities summed on conflict (same product already in DB cart)
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
DELETE /api/admin/produtos/:id
GET    /api/admin/produtos/:id       — full product: all fields + images[] + product_materials[]
```

Full product response (single GET, PUT response):
- All product fields including `cost_calculated`, `print_time_minutes`
- `images[]` (id, url, is_primary)
- `product_materials[]` (material_id, name, type, price_per_gram, quantity_grams)

### Admin — Product Materials
```
POST   /api/admin/produtos/:id/materiais          — assign material to product {material_id, quantity_grams}
PUT    /api/admin/produtos/:id/materiais/:matId   — update quantity_grams; triggers cost recalc
DELETE /api/admin/produtos/:id/materiais/:matId   — remove material from product; triggers cost recalc
```

### Admin — Product Images
```
POST   /api/admin/produtos/:id/images            — add image URL {url}
DELETE /api/admin/produtos/:id/images/:imgId     — remove image
PUT    /api/admin/produtos/:id/images/:imgId     — set as primary (clears other is_primary flags)
```

Images are URL strings provided by the admin. MVP does not require file upload handling.

### Admin — Materials
```
GET    /api/admin/materiais
POST   /api/admin/materiais
PUT    /api/admin/materiais/:id
DELETE /api/admin/materiais/:id
```

### Admin — Categories
```
GET    /api/admin/categorias
POST   /api/admin/categorias
PUT    /api/admin/categorias/:id
DELETE /api/admin/categorias/:id
```

### Admin — Orders
```
GET /api/admin/pedidos              — all orders with order_items included per order
GET /api/admin/pedidos/:id          — single order detail with order_items
PUT /api/admin/pedidos/:id          — update status ('pending'→'confirmed' or 'cancelled')
```

### Admin — Users
```
POST /api/admin/usuarios            — create a new admin user (role: 'admin')
```

### Admin — Dashboard & Config
```
GET /api/admin/dashboard       — metrics: top viewed, orders count, margins, total sales
GET /api/admin/configuracoes   — get all settings
PUT /api/admin/configuracoes   — update settings + trigger bulk cost recalculation
```

---

## Dashboard Metrics

| Metric | Source |
|---|---|
| Most viewed products | `products.views_count` ORDER BY DESC LIMIT 10 |
| WhatsApp orders generated | COUNT of `orders` WHERE status != 'cancelled' |
| Cost vs selling price (margin) | `(price - cost_calculated) / price × 100` per product |
| Total sales value | SUM of `orders.total_price` WHERE status != 'cancelled' |

---

## Error Handling

### Backend
- Global error middleware returns `{ error: "message" }` with appropriate HTTP status
- Input validation on all routes before DB access
- 401 for expired/missing JWT, 403 for insufficient role

### Frontend
- API errors shown as toast notifications
- localStorage cart parsed with try/catch — corrupted state resets silently to empty cart
- Protected routes redirect to login preserving `?redirect` param

---

## Testing

### Backend
- Integration tests with real PostgreSQL database (Jest + Supertest)
- Coverage targets: auth flows, order creation and cart clearing, cost calculation, cart merge

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
- XSS-hardened token storage (httpOnly cookies) — deferred post-MVP
