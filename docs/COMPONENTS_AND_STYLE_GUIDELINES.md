# Components and Style Guidelines

This document describes the main UI components and style conventions used in the Murugo Homes web app (`web/`).

## Table of Contents

1. [Design tokens](#design-tokens)
2. [Component overview](#component-overview)
3. [Style guidelines](#style-guidelines)
4. [Responsive behavior](#responsive-behavior)

---

## Design tokens

### Colors

- **Primary** – Used for links, key CTAs, and accents. Defined via CSS variables in `globals.css` and Tailwind `primary`.
- **Brand accent** – `#949DDB` (soft purple). Use for:
  - Primary CTA buttons (e.g. “Get Started”, “I want to list properties”, “Sign up”)
  - Selected states on registration role and property form options (e.g. “I'm looking for a property” / “I want to list properties”)
- **Rwanda palette** (optional) – `rwanda.blue`, `rwanda.yellow`, `rwanda.green` in `tailwind.config.ts` for thematic use.
- **Semantic** – `muted`, `destructive`, `border`, etc. from shadcn/ui theme.

### Typography

- **Fonts** – Geist Sans (variable `--font-geist-sans`), Geist Mono for code.
- **Headings** – Bold, tight tracking where needed. Use `tracking-tight` for large titles.
- **Section titles** – Uppercase + tracking for subsections, e.g. `text-lg font-semibold uppercase tracking-wider text-muted-foreground`.

### Spacing and radius

- **Sections** – `py-8 px-4` or `py-12 md:py-20 px-4` for page sections.
- **Containers** – `max-w-7xl mx-auto` for main content width.
- **Cards** – `rounded-xl` or `rounded-2xl`, `border`, `shadow-sm` for elevated blocks.
- **Badges / pills** – `rounded-full` for tags and status badges.

---

## Component overview

### Layout and navigation

| Component | Location | Purpose |
|----------|----------|---------|
| **SiteHeader** | `components/site-header.tsx` | Global sticky header: logo, nav (All properties, About us, Contact us), auth (Login / Sign up or Dashboard / Log out). Mobile hamburger menu. |
| **Guest CTA bar** | Rendered below header when not authenticated | Toggle-style CTA: “Looking for a property” (→ `/properties`) and “I want to list properties” (→ `/register?role=lister`). Styled with outline and brand button. |

### Property

| Component | Location | Purpose |
|----------|----------|---------|
| **PropertyCard** | `components/property/property-card.tsx` | Card for listing preview: image, price, title, location, beds/baths/size, “Listed by” link to lister profile, “View Details” button. |
| **PropertyFilters** | `components/property/property-filters.tsx` | Search bar + expandable filters: property type, transaction type, price, bedrooms, bathrooms, sort. Changing any filter resets pagination to page 1. |
| **PropertyGallery** | `components/property/property-gallery.tsx` | Image gallery on property detail page. |
| **ContactButton** | `components/property/contact-button.tsx` | Contact actions for the lister (e.g. call, email) when the user is authenticated. |

### UI primitives (shadcn-style)

- **Button** – `components/ui/button.tsx`. Use `variant="outline"` for secondary actions, default for primary. Brand CTAs use `className="bg-[#949DDB] hover:bg-[#949DDB]/90"`.
- **Card** – `components/ui/card.tsx`. Card, CardHeader, CardContent, CardFooter.
- **Input** – `components/ui/input.tsx`. Use with labels and optional leading icons (e.g. Search, Mail).
- **Dialog / ConfirmDialog** – For modals and confirmations.
- **Toaster** – Toast notifications via `useToast()`.

---

## Style guidelines

### Buttons

- **Primary CTA** – Solid brand color: `bg-[#949DDB] hover:bg-[#949DDB]/90`. Use for one main action per section (e.g. Sign up, Get Started, Submit).
- **Secondary** – `variant="outline"`. Use for “Back”, “Filters”, “View All”.
- **Ghost** – `variant="ghost"` for nav links and icon-only actions.
- **Size** – `size="sm"` in header/nav; `size="lg"` for hero or form submit.

### Badges and labels

- **Status / type badges** – Use `rounded-full`, small text (`text-xs`), and background by context:
  - **Featured** – `bg-primary text-white`.
  - **Coming soon** – `bg-amber-500 text-white` (e.g. app store badges).
  - **Profile type** (Individual / Commissioner / Company) – `bg-muted text-muted-foreground` or `bg-primary/15 text-primary` for Company.
- **Amenities** – Pill style: `rounded-full bg-primary/10 text-primary font-medium text-sm`.

### Cards and sections

- **Detail sections** (e.g. Description, Amenities, Details, Reviews) – Use a consistent section card:
  - `rounded-2xl border bg-card p-6 md:p-8 shadow-sm`
  - Section title: `text-lg font-semibold uppercase tracking-wider text-muted-foreground mb-3` or `mb-4`.

### Links

- **Inline links** – `text-primary hover:underline`.
- **Lister name** – Same style, link to `/listers/[id]` from property cards and property detail sidebar.

### Forms

- **Selected option** (e.g. property type, transaction type, amenities) – Button-like options get `#949DDB` background and white text when selected.
- **Labels** – `text-sm font-medium mb-2` above inputs.

---

## Responsive behavior

- **Header** – Desktop: horizontal nav; mobile: hamburger with dropdown (All properties, About us, Contact us, auth).
- **Guest CTA** – Wraps on small screens; “I'm” can be hidden on very small (e.g. `hidden sm:inline`).
- **Property grid** – 1 column on mobile, 2 on `md`, 3 on `lg`.
- **Property detail** – Main content and sidebar stack on small screens; sidebar becomes sticky on large.
- **Lister public page** – Profile block stacks (avatar + text); listings in responsive grid.
- **Partner logos** – Marquee animation; logos scale and have hover (grayscale → color, slight scale).

---

## Animation

- **Marquee** – Partner strip uses `animate-marquee` (30s linear infinite) in `tailwind.config.ts`.
- **Partner logo hover** – `transition-all duration-300 hover:scale-105`, grayscale to color.
- **Page transitions** – Optional; currently no global page transition.

---

## File reference

| Area | Path |
|------|------|
| Tailwind config | `web/tailwind.config.ts` |
| Global styles | `web/app/globals.css` |
| Landing images config | `web/lib/data/landing-images.ts` |
| API types | `web/lib/types/index.ts` |

For deployment and environment setup, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
