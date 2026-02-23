# Anthropic Theme - Implementation Guidelines

This document provides comprehensive guidelines for applying the Anthropic-inspired design system to all remaining pages of the Murugo Homes platform. The goal is to ensure consistency, quality, and a modern user experience across the entire application.

## Core Principles

- **Minimalism with Purpose**: Every element serves a function. Avoid decorative elements that don’t add value.
- **Subtle Sophistication**: Use soft colors, gentle gradients, and refined shadows to create a premium feel.
- **Typography Excellence**: Prioritize readability with a clear hierarchy, generous line heights, and proper spacing.
- **Thoughtful Spacing**: Use a consistent 4px-based scale for all padding, margins, and gaps.

## Design System Reference

For all color palettes, typography scales, and component styles, refer to the `ANTHROPIC_DESIGN_SYSTEM.md` document. This is the single source of truth for all UI elements.

## Page-Specific Guidelines

### 1. Property Listings Management (`/dashboard/listings`)

**Goal**: Create a clean, data-rich interface for listers to manage their properties efficiently.

- **Layout**: Use a table-based layout on desktop for easy scanning and a card-based layout on mobile.
- **Header**: Redesign the header with a clean title, descriptive subtitle, and a gradient primary button for "Add Property".
- **Summary Cards**: Use the established card style with gradient icons and bold typography for summary stats (Total, Pending, Available, Sold/Rented).
- **Filter Bar**: Redesign the filter bar with subtle background and clean buttons for each status.
- **Property List**: 
    - **Desktop**: Use a `<table>` with columns for Property, Status, Price, Views, and Actions.
    - **Mobile**: Use a list of redesigned `PropertyCardHorizontal` components.
- **Actions**: Use icon-only buttons with tooltips for Edit, Delete, and View actions to save space.
- **Dialogs**: Redesign all confirmation dialogs (Delete, Change Status) with the Anthropic theme (clean layout, gradient buttons).

### 2. New/Edit Listing Pages (`/dashboard/listings/new`, `.../[id]/edit`)

**Goal**: Create a multi-step form that is intuitive and easy to use.

- **Layout**: Use a multi-step wizard with a progress bar at the top.
- **Form Sections**: Break the form into logical sections (Basic Info, Location, Details, Media, etc.) with clear headings.
- **Input Fields**: Use the redesigned `Input` component with icons and proper labels.
- **Image Upload**: Create a drag-and-drop image uploader with preview thumbnails.
- **Buttons**: Use a gradient primary button for "Save & Continue" and a ghost button for "Back".

### 3. Static Pages (`/contact`, `/download`)

**Goal**: Apply the Anthropic theme to all static content pages for brand consistency.

- **Layout**: Use the same layout as the redesigned `/about` page with a centered header and card-based content sections.
- **Contact Page**: Redesign the contact form with icon-enhanced input fields and a gradient submit button.
- **Download Page**: Create a clean page with app store badges and a brief description of the mobile app.

### 4. Lister Profile Pages (`/listers/[id]`)

**Goal**: Create a professional, trustworthy profile page for property listers.

- **Layout**: Use a two-column layout with the lister’s profile information on the left and their properties on the right.
- **Profile Section**: Redesign the profile card with avatar, name, company, bio, and contact buttons.
- **Property List**: Use the redesigned `PropertyCardHorizontal` for the lister’s properties.

### 5. Mobile App (React Native)

**Goal**: Apply the Anthropic theme to all mobile app screens for a consistent cross-platform experience.

- **Components**: Create React Native versions of all redesigned components (Buttons, Inputs, Cards, etc.).
- **Screens**: Redesign all screens (Home, Favorites, Messages, Profile, etc.) to match the new web designs.
- **Navigation**: Ensure the bottom tab navigation and stack navigators are styled consistently with the Anthropic theme.

## Implementation Checklist

- [ ] **Property Listings Management**
    - [ ] Redesign main listings page (`/dashboard/listings`)
    - [ ] Redesign new listing page (`/dashboard/listings/new`)
    - [ ] Redesign edit listing page (`/dashboard/listings/[id]/edit`)
- [ ] **Static Pages**
    - [ ] Redesign contact page (`/contact`)
    - [ ] Redesign download page (`/download`)
- [ ] **Lister Profiles**
    - [ ] Redesign lister profile page (`/listers/[id]`)
- [ ] **Mobile App**
    - [ ] Create React Native design system components
    - [ ] Redesign all mobile app screens

By following these guidelines, your team can efficiently and consistently apply the Anthropic theme to the entire Murugo Homes platform.
