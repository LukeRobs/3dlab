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
| Auth | JWT (access token) |
| Monorepo | npm workspaces |

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
- **`admin`** — manages products, materials, settings, views dashboard

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
cost_calculated DECIMAL, is_active BOOLEAN DEFAULT true,
views_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

### `product_images`
```
id UUID PK, product_id UUID FK, url TEXT, is_primary BOOLEAN DEFAULT false
```

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

### `electricity_config` *(stored in `settings` table)*
Global key-value settings table used for electricity config, WhatsApp number, and store info.

### `settings`
```
key TEXT PK, value TEXT, updated_at TIMESTAMPTZ
```

Key entries:
- `whatsapp_number` — phone number for WhatsApp redirect
- `electricity_kwh_price` — price per kWh in BRL
- `printer_power_watts` — printer wattage
- `store_name`, `store_description`

### `cart_items`
```
id UUID PK, user_id UUID FK, product_id UUID FK,
quantity INTEGER, created_at TIMESTAMPTZ
```

### `orders`
```
id UUID PK, user_id UUID FK, status TEXT ('pending'|'confirmed'|'cancelled'),
total_price DECIMAL, whatsapp_message TEXT, created_at TIMESTAMPTZ
```

### `order_items`
```
id UUID PK, order_id UUID FK, product_id UUID FK,
quantity INTEGER, unit_price DECIMAL
```

### Cost Calculation Formula

```
material_cost  = SUM(quantity_grams × price_per_gram) for each product_material
electricity_cost = (print_time_minutes / 60) × (printer_power_watts / 1000) × kwh_price
cost_calculated = material_cost + electricity_cost
```

`cost_calculated` is recomputed and stored on the product whenever the product, its materials, or the electricity settings are updated.

---

## Frontend Routes

### Public (no auth required)

| Route | Description |
|---|---|
| `/` | Catalog — product grid with category filter |
| `/produto/:slug` | Product detail — images, price, add to cart |
| `/carrinho` | Cart — localStorage if guest, DB if logged in |
| `/login` | Customer login |
| `/cadastro` | Customer registration |

### Customer (role: customer)

| Route | Description |
|---|---|
| `/conta/pedidos` | Order history |

### Admin (role: admin)

| Route | Description |
|---|---|
| `/admin/dashboard` | Metrics dashboard (Tremor charts) |
| `/admin/produtos` | Product listing |
| `/admin/produtos/novo` | Create product |
| `/admin/produtos/:id` | Edit product |
| `/admin/materiais` | Materials listing |
| `/admin/materiais/novo` | Create material |
| `/admin/pedidos` | All orders |
| `/admin/configuracoes` | WhatsApp number, electricity, store info |

### Cart & Purchase Flow

```
1. Guest adds item → saved to localStorage
2. Clicks "Finalizar Compra" → not logged in?
3. Redirect to /login?redirect=/carrinho
4. After login → POST /api/carrinho/merge (localStorage → DB)
5. Back to /carrinho → customer confirms
6. POST /api/pedidos → order created, WhatsApp message generated
7. Browser opens wa.me link with pre-filled message
8. Order appears in /conta/pedidos
```

---

## API Endpoints

### Auth
```
POST /api/auth/register    — customer registration
POST /api/auth/login       — login for both roles, returns JWT
```

### Public Catalog
```
GET  /api/produtos         — list products (filter: category, search)
GET  /api/produtos/:slug   — product detail + increment views_count
GET  /api/categorias       — list categories
```

### Cart (customer auth)
```
GET    /api/carrinho           — get cart items
POST   /api/carrinho           — add item
PUT    /api/carrinho/:id       — update quantity
DELETE /api/carrinho/:id       — remove item
POST   /api/carrinho/merge     — merge localStorage cart into DB after login
```

### Orders (customer auth)
```
POST /api/pedidos              — create order, returns WhatsApp URL
GET  /api/pedidos              — customer order history
```

### Admin — Products
```
GET    /api/admin/produtos
POST   /api/admin/produtos
PUT    /api/admin/produtos/:id
DELETE /api/admin/produtos/:id
```

### Admin — Materials
```
GET    /api/admin/materiais
POST   /api/admin/materiais
PUT    /api/admin/materiais/:id
DELETE /api/admin/materiais/:id
```

### Admin — Dashboard & Config
```
GET /api/admin/dashboard       — metrics: top viewed, orders count, margins, total sales
GET /api/admin/pedidos         — all orders
GET /api/admin/configuracoes   — get settings
PUT /api/admin/configuracoes   — update settings
```

---

## Dashboard Metrics

| Metric | Source |
|---|---|
| Most viewed products | `products.views_count` |
| WhatsApp orders generated | COUNT of `orders` |
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
- localStorage cart parsed with try/catch — corrupted state resets silently
- Protected routes redirect to login preserving `?redirect` param

---

## Testing

### Backend
- Integration tests with real PostgreSQL database (Jest + Supertest)
- Coverage targets: auth flows, order creation, cost calculation, cart merge

### Frontend
- Manual testing in MVP phase
- No automated frontend tests initially

---

## Out of Scope (MVP)

- Payment processing (purchases close via WhatsApp)
- Admin-created customer accounts (customers self-register)
- Stock tracking per material
- Email notifications
- Post-processing materials (paint, primer) — add in future iteration
