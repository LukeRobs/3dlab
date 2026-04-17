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
- Colors defined as named tokens in `tailwind.config.js` under `extend.colors` — no arbitrary hex values in components, no custom CSS variables

### 2.2 Color Palette

Colors are applied directly as Tailwind utility classes with `dark:` variants — no named tokens in `tailwind.config.js`, no custom CSS variables. Arbitrary hex values are used only where Tailwind's default palette has no equivalent (neon green and the dark surface shades).

| Role | Light class | Dark class |
|---|---|---|
| Page background | `bg-gray-50` | `dark:bg-[#0a0a0a]` |
| Card / panel | `bg-white` | `dark:bg-[#1a1a1a]` |
| Input / alternate surface | `bg-gray-50` | `dark:bg-[#111111]` |
| Border | `border-gray-200` | `dark:border-[#2a2a2a]` |
| Primary text | `text-gray-900` | `dark:text-gray-100` |
| Muted text | `text-gray-500` | `dark:text-gray-400` |
| Accent (buttons, prices) | `bg-green-600` / `text-green-600` | `dark:bg-[#39ff14]` / `dark:text-[#39ff14]` |
| Accent hover | `hover:bg-green-700` | `dark:hover:bg-[#2bcc0f]` |
| Text on accent bg | `text-white` | `dark:text-black` |

### 2.3 Typography

- **Display / Headings:** Bebas Neue (Google Fonts) — H1, H2, hero titles, metric numbers in dashboard
- **Body / UI:** Inter (Google Fonts) — all body text, labels, buttons, nav items
- Loaded via `<link>` in `index.html` with `rel="preconnect"` for performance
- Tailwind config additions:
```js
fontFamily: {
  display: ['Bebas Neue', 'Impact', 'sans-serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

### 2.4 Spacing & Shape

- Card border-radius: `rounded-xl` (12px)
- Button border-radius: `rounded-lg` (8px)
- Input border-radius: `rounded-lg` (8px)
- Container max-width: `max-w-7xl mx-auto px-4`

### 2.5 Motion

- Card hover: `hover:scale-[1.02] transition-transform duration-200`
- Button press: `active:scale-95 transition-transform`
- Toast: slide-in from bottom-right, auto-dismiss after 2500ms
- Skeleton loaders: `animate-pulse` blocks in `bg-gray-200 dark:bg-[#2a2a2a]` inside `<SkeletonCard />` while product data is loading

---

## 3. New / Modified Files

### 3.1 ThemeContext

**New file:** `frontend/src/lib/theme.jsx`

- Exports `ThemeProvider` and `useTheme()` hook
- State: `theme` = `'dark'` | `'light'`
- On mount: reads `localStorage.getItem('theme')` → fallback to `window.matchMedia('(prefers-color-scheme: dark)').matches`
- On change: writes to localStorage, adds/removes `dark` class on `document.documentElement`
- `ThemeProvider` wraps the app in `App.jsx` alongside `AuthProvider`

### 3.2 ThemeToggle Component

**New file:** `frontend/src/components/ThemeToggle.jsx`

- Button rendering sun icon (☀️) in dark mode and moon icon (🌙) in light mode
- Calls `useTheme().toggle()`
- Used in both Navbar (public) and AdminLayout sidebar (admin)

---

## 4. Public Store

### 4.1 Navbar (`Navbar.jsx` — full rewrite)

**Desktop layout (single row, sticky, `bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#2a2a2a]`):**
```
[Logo]     [Search bar - centered]     [Cart badge] [ThemeToggle] [Login/User menu]
```

**Mobile layout:**
```
[Logo]     [Lupa icon] [Cart badge] [ThemeToggle] [Hamburguer]
```
- Mobile menu: full-width drawer below navbar with nav links
- Search bar: expands inline on mobile when lupa icon is tapped; collapses on blur
- Cart badge: green pill with item count, hidden when 0
- Logo: "LOJA GEEK 3D" in Bebas Neue `text-2xl` + small SVG printer icon

**Search behavior:**
- Input calls `GET /api/produtos?search=<query>` (debounced 300ms) — the existing endpoint supports `search` param
- Results shown as absolute dropdown below the bar: product name + price + thumbnail
- Clicking a result navigates to `/produto/:slug` (the API returns a `slug` field for every product)
- Dropdown closes on outside click or Escape

### 4.2 Hero Carousel (`HeroCarousel.jsx` — new component)

- Full-width, `h-[500px] md:h-[400px] sm:h-[280px]`
- **Data source:** fetches `GET /api/produtos` (no sort param — endpoint orders by `created_at DESC`), then sorts client-side by `views_count DESC`, takes top 5. If fewer than 5 products exist, shows all of them.
- Each slide:
  - Background: product `primary_image` with `object-cover`, overlay `bg-gradient-to-t from-black/80 via-black/30 to-transparent`
  - Bottom-left content: category badge (small pill), product name in Bebas Neue `text-5xl md:text-4xl sm:text-3xl`, price in accent green `text-2xl`, CTA button "Ver Produto" → `/produto/:slug`
- Auto-play: 5 000ms interval, paused on hover and on touch
- Navigation: prev/next arrow buttons (hidden on mobile) + dot indicators at bottom-center
- Transition: `transition-opacity duration-700`
- If no products exist yet: renders a placeholder slide with a "Adicione produtos no painel admin" message

### 4.3 Catalog Page (`Catalog.jsx` — full rewrite)

**Layout:**
```
<Navbar />
<HeroCarousel />
<main max-w-7xl mx-auto px-4 py-10>
  <h2 class="font-display text-3xl mb-6">Catálogo</h2>
  <CategoryFilter />           ← redesigned
  <p class="text-sm text-muted mb-4">{count} produtos encontrados</p>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {isLoading ? (8x <SkeletonCard />) : products.map(<ProductCard />)}
  </div>
</main>
<Footer />
```

While `isLoading` is true, render 8 `<SkeletonCard />` placeholders in the same grid. `SkeletonCard` (`frontend/src/components/SkeletonCard.jsx`) mirrors `ProductCard` dimensions with `animate-pulse` gray blocks (image area + two text lines + button).

**ProductCard redesign (`ProductCard.jsx` — full rewrite):**
- `rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:scale-[1.02] transition-transform duration-200`
- Image: `aspect-[4/3] w-full object-cover`
- Category badge: absolute `top-2 left-2`, small pill `bg-green-600/90 text-white text-xs px-2 py-0.5 rounded-full`
- Body padding `p-4`: name in Inter `font-semibold text-base`, muted category text `text-sm`, price in `text-green-600 dark:text-[#39ff14] font-bold text-lg`
- "Adicionar" button: `w-full mt-3 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black font-semibold py-2 rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all`

**CategoryFilter redesign (`CategoryFilter.jsx` — full rewrite):**
- Horizontally scrollable row, hidden scrollbar (`overflow-x-auto scrollbar-hide`)
- Pills: `rounded-full px-4 py-1.5 text-sm font-medium border transition-colors`
- Active: `bg-green-600 dark:bg-[#39ff14] text-white dark:text-black border-transparent`
- Inactive: `border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-green-500`

### 4.4 ProductDetail Page (`ProductDetail.jsx` — full rewrite)

**Breadcrumb (above content):**
- `Home` → `/`
- Category name → `/?category=<category_slug>` (applies category filter on catalog)
- Product name → current page (not linked, just text)

**Layout:** `grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto px-4 py-10`

- **Left — Gallery:**
  - Main image: `rounded-xl object-cover w-full aspect-square`
  - Thumbnail strip: only rendered if `product.images` array has more than 1 entry. Uses the `images[]` array returned by `GET /api/produtos/:slug`. If only one image (or no `images` array), thumbnail strip is hidden.
  - Each thumbnail: `w-16 h-16 object-cover rounded-lg cursor-pointer border-2`, active border in accent color

- **Right — Info:**
  - Category badge (pill), product name in Bebas Neue `text-4xl`, price `text-3xl text-green-600 dark:text-[#39ff14] font-bold`
  - Description in Inter `text-gray-600 dark:text-gray-400` — field `description` is confirmed returned by `GET /api/produtos/:slug`; rendered only when truthy
  - Quantity selector: styled `−` / number / `+` button group
  - "Adicionar ao Carrinho" button: full-width, green, `py-4 text-lg font-semibold`

### 4.5 Cart Page (`Cart.jsx` — redesign)

- `max-w-2xl mx-auto px-4 py-10`
- Each `CartItem`: horizontal flex card `bg-white dark:bg-[#1a1a1a] rounded-xl border p-4 mb-3`
  - Image `w-20 h-20 rounded-lg object-cover`, name + price, qty controls, trash icon button
- Order summary card: `bg-white dark:bg-[#1a1a1a] rounded-xl border p-6`, subtotal row, "Finalizar Compra" button full-width green
- Empty state: centered text "Seu carrinho está vazio" + "Ver Catálogo" link button

### 4.6 Login & Register Pages (redesign)

- Full-page centered layout `min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]`
- Card `max-w-md w-full rounded-2xl shadow-xl bg-white dark:bg-[#1a1a1a] p-8`
- Logo + page title (Bebas Neue) at top of card
- Inputs: `w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none`
- Submit button: full-width green, same style as "Adicionar" in ProductCard

### 4.7 Customer Order History (`conta/Pedidos.jsx` — redesign)

- Page wrapped in `<Navbar />` + `<Footer />`
- `max-w-3xl mx-auto px-4 py-10`
- Page title in Bebas Neue `text-3xl`
- Each order: card `bg-white dark:bg-[#1a1a1a] rounded-xl border p-5 mb-4`
  - Header row: order ID (`#xxxxxxxx`) + date left, status badge right
  - Items list: `text-sm text-gray-600 dark:text-gray-400`, quantity × name — price
  - Footer row: total `font-semibold text-right`
- Status badges reuse same style as admin (Section 5.4):
  - Pending: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
  - Confirmed: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
  - Cancelled: `bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`
- Empty state: "Nenhum pedido ainda." centered text

### 4.8 Footer (`Footer.jsx` — new component)

- `bg-gray-900 dark:bg-[#0a0a0a] border-t-2 border-green-600 dark:border-[#39ff14]`
- Two-column: store name + tagline left, links right (Home, Catálogo, Carrinho)
- Bottom strip: "Feito com 💚" — emoji is intentional and by design
- Visible on all public pages

---

## 5. Admin Panel

### 5.1 AdminLayout (`AdminLayout.jsx` — full rewrite)

**Desktop (≥ 1024px):**
- Sidebar fixed `w-60` left: `bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2a2a2a]`
- Top: "ADMIN" in Bebas Neue + logged-in user name below in small muted text
- NavLinks: icon (SVG, 18px) + label, `px-4 py-2.5 text-sm font-medium`
- Active state: `border-l-[3px] border-green-600 dark:border-[#39ff14] bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-[#39ff14]`
- Bottom: `ThemeToggle` button + "Sair" button, separated by top border

**Mobile (< 1024px):**
- Top bar: logo + hamburger icon on right
- Sidebar hidden by default; hamburger opens it as overlay drawer from the left
- Overlay backdrop: `bg-black/50 fixed inset-0 z-40`
- Drawer: slides in from left `translate-x-0`, z-50, same contents as desktop sidebar
- Clicking backdrop or a nav link closes the drawer

### 5.2 Dashboard (`Dashboard.jsx` — redesign)

- Greeting: `"Bom dia, Admin 👋"` + current date in muted text below (Inter, `new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })`)
- 4 metric cards `grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8`:
  - Card: `bg-white dark:bg-[#1a1a1a] rounded-xl border p-5`
  - Icon (SVG 24px, accent colored) + label `text-sm text-gray-500`, number in Bebas Neue `text-4xl`, delta badge
- Tremor `BarChart`: pass `colors={['emerald']}` (closest named Tremor color to the accent green). The chart will use Tremor's emerald palette rather than exact neon green — this is acceptable for admin charts.
- Margin table: badge colors — `text-green-600 dark:text-[#39ff14]` >40%, `text-yellow-500` 20–40%, `text-red-500` <20%

### 5.3 All Admin List Pages (Produtos, Materiais, Categorias)

**Admin lists are not paginated — all records are fetched in a single API call**, making client-side search safe regardless of dataset size (appropriate for a small geek merchandise store).

- Page header: Bebas Neue title left + `"+ Novo"` action button right
- Above table: inline text input that filters the displayed rows client-side on `name` field
- Table container: `bg-white dark:bg-[#1a1a1a] rounded-xl border dark:border-[#2a2a2a] overflow-hidden`
- Header row: `bg-gray-50 dark:bg-[#111] text-xs uppercase tracking-wide text-gray-500`
- Data rows: `border-b dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222]`
- Action column: edit pencil icon + delete trash icon, icon buttons with `title` tooltip attribute

### 5.4 Admin Pedidos (`admin/Pedidos.jsx` — redesign)

- Cards layout (already implemented as cards, restyled):
  - Card: `bg-white dark:bg-[#1a1a1a] rounded-xl border dark:border-[#2a2a2a] p-5 mb-4`
  - Header row: order ID + customer name/email left, status badge + action buttons right
- Status badges (`rounded-full px-3 py-1 text-xs font-semibold`):
  - Pending: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
  - Confirmed: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
  - Cancelled: `bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`
- "Confirmar" / "Cancelar" buttons visible only when `status === 'pending'`

### 5.5 Configuracoes (`admin/Configuracoes.jsx` — redesign)

- Card `bg-white dark:bg-[#1a1a1a] rounded-xl border max-w-lg p-6`
- Section divider between store info fields and electricity/printer fields
- Inputs: same style as Login page inputs (consistent `rounded-lg border bg-gray-50 dark:bg-[#111] focus:ring-green-500`)
- Success banner: `bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg p-3`

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Key behaviors |
|---|---|---|
| default (mobile) | < 640px | 1-col product grid (`grid-cols-1`), hero 280px, collapsed navbar, admin sidebar hidden as drawer |
| `sm` | ≥ 640px | 2-col product grid (`sm:grid-cols-2`), hero 400px |
| `md` | ≥ 768px | Full navbar with centered search bar, 3-col product grid (`md:grid-cols-3`), 2-col product detail |
| `lg` | ≥ 1024px | 4-col product grid (`lg:grid-cols-4`), admin sidebar always visible (no drawer) |
| `xl` | ≥ 1280px | `max-w-7xl` container active |

Product grid class: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`

---

## 7. Implementation Chunks

### Chunk 1 — Foundation
- Update `tailwind.config.js`: `darkMode: 'class'`, font families, no extra color tokens needed (use inline Tailwind classes throughout)
- Update `index.html`: Google Fonts preconnect + link for Bebas Neue and Inter
- Update `frontend/src/index.css`: `scrollbar-hide` utility class
- Create `frontend/src/lib/theme.jsx`: ThemeContext + useTheme + ThemeProvider
- Create `frontend/src/components/ThemeToggle.jsx`
- Update `frontend/src/App.jsx`: wrap with ThemeProvider
- Commit: `chore: design system foundation — dark mode, fonts, ThemeContext`

### Chunk 2 — Navbar + Hero + Footer
- Rewrite `Navbar.jsx`: search dropdown, cart badge, theme toggle, mobile drawer
- Create `HeroCarousel.jsx`: auto-play, dots, arrows, client-side top-5 sort
- Create `Footer.jsx`
- Commit: `feat: redesigned navbar with search, hero carousel, footer`

### Chunk 3 — Public Pages
- Rewrite `Catalog.jsx`: skeleton loaders, product count, HeroCarousel, Footer
- Rewrite `ProductCard.jsx` and `CategoryFilter.jsx`
- Create `SkeletonCard.jsx`
- Rewrite `ProductDetail.jsx`: breadcrumb, gallery with thumbnail strip, specs
- Rewrite `Cart.jsx`, `Login.jsx`, `Register.jsx`
- Commit: `feat: redesigned public store pages`

### Chunk 4 — Customer + Admin Layout
- Rewrite `conta/Pedidos.jsx`
- Rewrite `AdminLayout.jsx`: mobile drawer, theme toggle, user name, icon navlinks
- Rewrite `Dashboard.jsx`: greeting, metric cards, Tremor emerald chart
- Commit: `feat: redesigned customer orders and admin layout + dashboard`

### Chunk 5 — Admin Pages
- Rewrite `admin/Produtos.jsx` + `admin/ProdutoForm.jsx`
- Rewrite `admin/Materiais.jsx` + `admin/MaterialForm.jsx`
- Rewrite `admin/Categorias.jsx`
- Rewrite `admin/Pedidos.jsx`
- Rewrite `admin/Configuracoes.jsx`
- Commit: `feat: redesigned admin management pages`

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

- No new backend changes or new API endpoints
- No animation library (Framer Motion etc.) — Tailwind transitions only
- No image upload (URLs only, as per current implementation)
- No i18n changes — site remains in pt-BR
- No new pages or routes
