# Anthropic Design System for Murugo Homes

## Core Principles

### 1. **Minimalism with Purpose**
- Every element serves a clear function
- Remove unnecessary decoration
- Emphasize content over chrome
- Use whitespace generously

### 2. **Subtle Sophistication**
- Soft color palettes with muted tones
- Gentle gradients instead of flat colors
- Refined shadows for depth
- Smooth transitions and animations

### 3. **Typography Excellence**
- Clear hierarchy with size and weight
- Generous line height for readability
- Limited font sizes (scale of 6-8 sizes)
- Monospace for data/numbers when appropriate

### 4. **Thoughtful Spacing**
- Consistent spacing scale (4px base)
- Breathing room between sections
- Compact but not cramped
- Aligned to 8px grid

---

## Color Palette

### Neutrals (Warm Grays)
```css
--neutral-50: #fafaf9    /* Backgrounds */
--neutral-100: #f5f5f4   /* Subtle backgrounds */
--neutral-200: #e7e5e4   /* Borders */
--neutral-300: #d6d3d1   /* Disabled */
--neutral-400: #a8a29e   /* Placeholders */
--neutral-500: #78716c   /* Secondary text */
--neutral-600: #57534e   /* Body text */
--neutral-700: #44403c   /* Headings */
--neutral-800: #292524   /* Strong emphasis */
--neutral-900: #1c1917   /* Maximum contrast */
```

### Primary (Warm Orange/Amber)
```css
--primary-50: #fffbeb
--primary-100: #fef3c7
--primary-500: #f59e0b   /* Main brand color */
--primary-600: #d97706
--primary-700: #b45309
```

### Accent Colors
```css
--accent-blue: #3b82f6    /* Links, info */
--accent-green: #10b981   /* Success */
--accent-red: #ef4444     /* Error, urgent */
--accent-amber: #f59e0b   /* Warning */
```

---

## Typography Scale

### Font Families
- **Sans**: System font stack (Inter-like)
- **Mono**: Monospace for code/data

### Scale
```css
--text-xs: 0.75rem     /* 12px - Captions, labels */
--text-sm: 0.875rem    /* 14px - Secondary text */
--text-base: 1rem      /* 16px - Body text */
--text-lg: 1.125rem    /* 18px - Emphasized text */
--text-xl: 1.25rem     /* 20px - Small headings */
--text-2xl: 1.5rem     /* 24px - Section headings */
--text-3xl: 1.875rem   /* 30px - Page headings */
--text-4xl: 2.25rem    /* 36px - Hero headings */
```

### Line Heights
- Tight: 1.25 (headings)
- Normal: 1.5 (body)
- Relaxed: 1.75 (long-form content)

---

## Spacing Scale

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

---

## Component Patterns

### Cards
```css
background: white
border-radius: 12px
padding: 20-24px
box-shadow: 0 1px 3px rgba(0,0,0,0.05)
border: 1px solid neutral-200
hover: shadow-md, translate-y(-1px)
```

### Buttons

**Primary**
```css
background: linear-gradient(to-br, primary-500, primary-600)
color: white
padding: 10px 20px
border-radius: 8px
font-weight: 500
shadow: subtle
hover: brightness(110%)
```

**Secondary**
```css
background: neutral-100
color: neutral-700
border: 1px solid neutral-200
hover: background neutral-200
```

**Ghost**
```css
background: transparent
color: neutral-600
hover: background neutral-100
```

### Inputs
```css
background: neutral-50
border: 1px solid neutral-200
border-radius: 8px
padding: 10px 14px
focus: ring-2 ring-primary-200, border-primary-500
```

### Badges
```css
padding: 4px 10px
border-radius: 6px
font-size: 12px
font-weight: 500
background: subtle color variant
border: 1px solid matching color
```

---

## Layout Patterns

### Page Container
```css
max-width: 1280px
margin: 0 auto
padding: 24px (mobile) / 32px (desktop)
```

### Section Spacing
```css
margin-bottom: 48px (mobile) / 64px (desktop)
```

### Grid
```css
gap: 20px (mobile) / 24px (desktop)
columns: 1 (mobile) / 2-3 (tablet) / 3-4 (desktop)
```

---

## Micro-interactions

### Transitions
```css
duration: 200ms (fast) / 300ms (normal)
easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Hover States
- Lift: `transform: translateY(-2px)`
- Shadow: Increase shadow intensity
- Brightness: `filter: brightness(105%)`

### Focus States
- Ring: `ring-2 ring-primary-200`
- Outline: Remove default, use ring

---

## Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## Page-Specific Patterns

### Dashboard
- Sidebar: 240px wide, neutral-50 background
- Main content: White background, subtle shadow
- Stats cards: Gradient backgrounds, large numbers
- Charts: Muted colors, clean axes

### Messaging
- Conversation list: Compact, avatar + preview
- Chat area: Full height, sticky input
- Messages: Bubbles with subtle shadows
- Sent: Primary gradient, white text
- Received: Neutral-100, dark text

### Profile
- Avatar: Large, centered, subtle ring
- Info cards: Grouped by category
- Edit mode: Inline editing with save/cancel
- Actions: Ghost buttons, minimal

### Favorites
- Grid layout: Responsive columns
- Empty state: Centered, illustration + text
- Remove action: Subtle, confirm on hover

---

## Accessibility

### Contrast Ratios
- Body text: Minimum 4.5:1
- Large text: Minimum 3:1
- Interactive elements: Clear focus indicators

### Touch Targets
- Minimum: 44x44px
- Spacing: 8px between targets

### Motion
- Respect `prefers-reduced-motion`
- Disable animations when requested

---

## Implementation Notes

### Tailwind Classes
Use Tailwind's default classes where possible:
- `bg-neutral-50` instead of custom colors
- `rounded-xl` for 12px radius
- `shadow-sm` for subtle shadows
- `transition-all duration-300` for smooth animations

### Custom Components
Create reusable components for:
- Page headers
- Section containers
- Stat cards
- Empty states
- Loading skeletons

### Consistency
- Use the same patterns across all pages
- Maintain spacing consistency
- Keep color usage minimal
- Ensure responsive behavior

---

This design system provides a foundation for creating a cohesive, Anthropic-inspired interface across the entire Murugo Homes platform.
