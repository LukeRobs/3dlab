# Frontend Redesign — Design Spec

**Date:** 2026-04-17  
**Project:** Loja Geek 3D — Product Management Platform  
**Scope:** Full visual redesign of the React/Vite/Tailwind frontend (public store + admin panel)

---

## 1. Design Philosophy

Dark premium aesthetic inspired by collector/geek merchandise stores (Iron Studios, Toyshow). Green neon accent on dark backgrounds transitions to solid green on light backgrounds. Mixed typography pairing (display + readable body). Full dark/light mode support across both the public store and the admin panel.

---

## 2. Design System

### 2.1 Dark/Light Mode Strategy

- Tailwind `darkMode: 'class'` in `tailwind.config.js`
- A `ThemeContext` React context manages the active theme
- `useTheme()` hook toggles the `dark` class on `document.documentElement`
- Preference persisted in `localStorage` under key `theme`
- On first visit, respects `prefers-color-scheme` media query
- All color classes use Tailwind `dark:` variants — no custom CSS variables

### 2.2 Color Palette

| Role | Light Mode | Dark Mode |
|---|---|---|
| Page background | `bg-gray-50` | `dark:bg-[#0a0a0a]` |
| Card / surface | `bg-white` | `dark:bg-[#1a1a1a]` |
| Secondary surface | `bg-gray-100` | `dark:bg-[#111111]` |
| Primary text | `text-gray-900` | `dark:text-gray-100` |
| Muted text | `text-gray-500` | `dark:text-gray-400` |
| Border | `border-gray-200` | `dark:border-[#2a2a2a]` |
| Accent (buttons, prices, highlights) | `green-600` (#16a34a) | `dark:[#39ff14]` (neon green) |
| Accent hover | `green-700` | `dark:[#2bcc0f]` |
| Accent text on accent bg | `text-white` (light) | `dark:text-black` (dark — neon bg needs dark text) |

### 2.3 Typography

- **Display / Headings:** Bebas Neue (Google Fonts) — H1, H2, hero titles, metric numbers
- **Body / UI:** Inter (Google Fonts) — all body text, labels, buttons, nav items
- Loaded via `<link>` in `index.html` with `rel="preconnect"` for performance
- Tailwind config: `fontFamily: { display: ['Bebas Neue', 'Impact', 'sans-serif'], sans: ['Inter', 'sans-serif'] }`

### 2.4 Spacing & Shape

- Card border-radius: `rounded-xl` (12px)
- Button border-radius: `rounded-lg` (8px)
- Input border-radius: `rounded-lg` (8px)
- Container max-width: `max-w-7xl mx-auto px-4`

### 2.5 Motion

- Card hover: `hover:scale-[1.02] transition-transform duration-200`
- Button press: `active:scale-95 transition-transform`
- Toast: slide-in from bottom-right, auto-dismiss after 2500ms
- Skeleton loaders: `animate-pulse bg-gray-200 dark:bg-[#2a2a2a]` on product cards during fetch

---

## 3. New / Modified Files

### 3.1 ThemeContext

**New file:** `frontend/src/lib/theme.jsx`

- Exports `ThemeProvider` and `useTheme()` hook
- State: `theme` = `'dark'` | `'light'`
- On mount: reads `localStorage.getItem('theme')` → fallback to `window.matchMedia('prefers-color-scheme: dark')`
- On change: writes to localStorage, toggles `dark` class on `document.documentElement`
- `ThemeProvider` wraps the app in `App.jsx` alongside `AuthProvider`

### 3.2 ThemeToggle Component

**New file:** `frontend/src/components/ThemeToggle.jsx`

- Simple button rendering sun icon (light mode) or moon icon (dark mode)
- Calls `useTheme().toggle()`
- Used in both Navbar and AdminLayout sidebar

---

## 4. Public Store

### 4.1 Navbar (`Navbar.jsx` — full rewrite)

**Desktop layout (single row, sticky, `backdrop-blur-md`):**
```
[Logo]     [Search bar - centered]     [Cart badge] [ThemeToggle] [Login/User menu]
```

**Mobile layout:**
```
[Logo]     [Lupa icon] [Cart badge] [Hamburguer]
```
- Mobile menu drawer slides down with nav links + theme toggle
- Search bar expands inline on mobile when lupa icon is tapped
- Cart badge: green pill with item count, hidden when 0
- Logo: "LOJA GEEK 3D" in Bebas Neue + small 3D printer SVG icon

**Search:** `GET /api/produtos?search=` (debounced 300ms), results shown as dropdown below bar with product name + price, clicking navigates to `/produto/:slug`

### 4.2 Hero Carousel (`HeroCarousel.jsx` — new component)

- Full-width, `h-[500px] md:h-[400px] sm:h-[280px]`
- Data: top 5 products ordered by `views_count DESC` (fetched from `/api/produtos?limit=5&sort=views`)
- Each slide:
  - Background: product `primary_image` with `object-cover`, overlay `bg-gradient-to-t from-black/80 via-black/30 to-transparent`
  - Bottom-left: category badge (small pill), product name in Bebas Neue `text-5xl`, price in accent green, CTA button "Ver Produto"
- Auto-play: 5s interval, pauses on hover
- Navigation: prev/next arrow buttons + dot indicators at bottom center
- Transition: `transition-opacity duration-700`

### 4.3 Catalog Page (`Catalog.jsx` — full rewrite)

**Layout:**
```
<Navbar />
<HeroCarousel />               ← new
<main max-w-7xl>
  <CategoryFilter />           ← redesigned as pills
  <p>{count} produtos</p>      ← new
  <ProductGrid />              ← responsive grid
</main>
<Footer />                     ← new
```

**ProductCard redesign:**
- `rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]`
- Image container: `aspect-[4/3] overflow-hidden` with `hover:scale-[1.02]` on the image itself
- Category badge: absolute top-left, small green pill
- Body: name in Inter semibold, muted category text, price in accent color in Inter bold
- "Adicionar" button: full-width, green accent background, text black (dark) / white (light)
- Skeleton state: pulsing gray blocks in same card shape while loading

**CategoryFilter redesign:**
- Horizontal scrollable row on mobile (hide scrollbar)
- Pills: `rounded-full px-4 py-1.5 text-sm font-medium border`
- Active: `bg-green-600 dark:bg-[#39ff14] text-white dark:text-black border-transparent`
- Inactive: `border-gray-300 dark:border-[#2a2a2a] hover:border-green-600`

### 4.4 ProductDetail Page (`ProductDetail.jsx` — full rewrite)

- 2-column grid `grid-cols-1 md:grid-cols-2 gap-10`
- Left: main image large + thumbnail strip below
- Right:
  - Category badge, product name in Bebas Neue `text-4xl`
  - Price in accent `text-3xl font-bold`
  - Description in Inter, muted color
  - Quantity selector: `-` / number / `+` in styled input group
  - "Adicionar ao Carrinho" button full-width, green, large
- Breadcrumb navigation: Home > Category > Product Name

### 4.5 Cart Page (`Cart.jsx` — redesign)

- Max-width `max-w-2xl` centered
- Each `CartItem`: horizontal flex card with image, name+price, qty controls, remove icon button (trash SVG)
- Order summary card on bottom: subtotal, "Finalizar Compra" button green full-width
- Empty state: centered illustration placeholder text + "Ver Catálogo" link

### 4.6 Login & Register Pages (redesign)

- Centered card `max-w-md`, `rounded-2xl shadow-xl bg-white dark:bg-[#1a1a1a]`
- Logo + title at top of card
- Inputs: full-width, `rounded-lg border dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111]`
- Focus: `ring-2 ring-green-500`
- Submit button: full-width green
- Link to other auth page below button

### 4.7 Footer (`Footer.jsx` — new component)

- Dark strip `bg-gray-900 dark:bg-[#0a0a0a]` with top border accent green
- Single row: store name left, "Feito com 💚" right
- Links: Home, Catálogo, Carrinho
- Visible on all public pages

---

## 5. Admin Panel

### 5.1 AdminLayout (`AdminLayout.jsx` — full rewrite)

**Desktop:**
- Sidebar fixed 240px: `bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2a2a2a]`
- Top: logo "ADMIN" Bebas Neue + logged-in user name
- NavLinks: icon + label, active state = left 3px green border + subtle bg tint
- Bottom: `ThemeToggle` button + "Sair" button

**Mobile:**
- Sidebar hidden by default, hamburger icon in top bar opens it as overlay drawer
- Overlay: `bg-black/50` backdrop, sidebar slides in from left

### 5.2 Dashboard (`Dashboard.jsx` — redesign)

- Greeting header: "Bom dia, Admin 👋" + current date
- 4 metric cards in `grid-cols-2 lg:grid-cols-4`:
  - Each: icon (SVG), label muted, big number in Bebas Neue, delta badge
  - Bg: `bg-white dark:bg-[#1a1a1a]` with border
- Tremor BarChart: override colors to match accent green
- Margin table: badge colors — `text-green-600` >40%, `text-yellow-500` 20-40%, `text-red-500` <20%

### 5.3 All Admin List Pages (Produtos, Materiais, Categorias, Pedidos)

- Page header: title left + action button right ("+ Novo Produto" etc.)
- Table: `bg-white dark:bg-[#1a1a1a] rounded-xl border dark:border-[#2a2a2a]`
- Row hover: subtle bg shift
- Action buttons: icon-only with tooltip (edit pencil, delete trash)
- Above table: inline search input (filters client-side)

### 5.4 Admin Pedidos (`admin/Pedidos.jsx` — redesign)

- Cards instead of table (already implemented, just restyled)
- Status badges: `rounded-full px-3 py-1 text-xs font-semibold`
  - Pending: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
  - Confirmed: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
  - Cancelled: `bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`

### 5.5 Configuracoes (`admin/Configuracoes.jsx` — redesign)

- Card layout, section headers with dividers
- Inputs styled consistently with rest of admin

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Key behaviors |
|---|---|---|
| default (mobile) | < 640px | 1-col product grid, collapsed navbar, hero 280px, admin sidebar hidden |
| `sm` | 640px | 2-col product grid, hero 400px |
| `md` | 768px | Full navbar, 3-col product grid, 2-col product detail |
| `lg` | 1024px | 4-col product grid, admin sidebar always visible |
| `xl` | 1280px | Max container width active |

---

## 7. Implementation Chunks

### Chunk 1 — Foundation
- Update `tailwind.config.js`: darkMode class, custom fonts, custom colors
- Update `index.html`: Google Fonts links (Bebas Neue + Inter)
- Create `frontend/src/lib/theme.jsx`: ThemeContext + useTheme
- Create `frontend/src/components/ThemeToggle.jsx`
- Update `App.jsx`: wrap with ThemeProvider
- Update `index.css`: minimal global resets

### Chunk 2 — Navbar + Hero + Footer
- Rewrite `Navbar.jsx`: search, cart badge, theme toggle, mobile drawer
- Create `HeroCarousel.jsx`: auto-play, dots, arrows, slide transition
- Create `Footer.jsx`

### Chunk 3 — Public Pages
- Rewrite `Catalog.jsx`: skeleton loaders, product count, new layout
- Rewrite `ProductCard.jsx` and `CategoryFilter.jsx`
- Rewrite `ProductDetail.jsx`: breadcrumb, gallery, specs section
- Rewrite `Cart.jsx`, `Login.jsx`, `Register.jsx`

### Chunk 4 — Customer + Admin Layout
- Rewrite `conta/Pedidos.jsx`
- Rewrite `AdminLayout.jsx`: mobile drawer, theme toggle, user name
- Rewrite `Dashboard.jsx`: greeting, metric cards, styled charts

### Chunk 5 — Admin Pages
- Rewrite `admin/Produtos.jsx` + `admin/ProdutoForm.jsx`
- Rewrite `admin/Materiais.jsx` + `admin/MaterialForm.jsx`
- Rewrite `admin/Categorias.jsx`
- Rewrite `admin/Pedidos.jsx`
- Rewrite `admin/Configuracoes.jsx`

---

## 8. Files Added / Modified

**New files:**
- `frontend/src/lib/theme.jsx`
- `frontend/src/components/ThemeToggle.jsx`
- `frontend/src/components/HeroCarousel.jsx`
- `frontend/src/components/Footer.jsx`
- `frontend/src/components/SkeletonCard.jsx`

**Modified files (full rewrite):**
- `frontend/tailwind.config.js`
- `frontend/index.html`
- `frontend/src/index.css`
- `frontend/src/App.jsx`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/ProductCard.jsx`
- `frontend/src/components/CategoryFilter.jsx`
- `frontend/src/components/CartItem.jsx`
- `frontend/src/components/AdminLayout.jsx`
- `frontend/src/pages/Catalog.jsx`
- `frontend/src/pages/ProductDetail.jsx`
- `frontend/src/pages/Cart.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/conta/Pedidos.jsx`
- `frontend/src/pages/admin/Dashboard.jsx`
- `frontend/src/pages/admin/Produtos.jsx`
- `frontend/src/pages/admin/ProdutoForm.jsx`
- `frontend/src/pages/admin/Materiais.jsx`
- `frontend/src/pages/admin/MaterialForm.jsx`
- `frontend/src/pages/admin/Categorias.jsx`
- `frontend/src/pages/admin/Pedidos.jsx`
- `frontend/src/pages/admin/Configuracoes.jsx`

---

## 9. Out of Scope

- No new backend changes
- No new routes or API endpoints
- No animation library (Framer Motion etc.) — Tailwind transitions only
- No image upload (URLs only, as per current implementation)
- No i18n changes — site remains in pt-BR
