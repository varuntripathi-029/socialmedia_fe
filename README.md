# Social Media Frontend

This repository houses the frontend client of the Social Media platform, implemented using React, Vite, and Tailwind CSS. The application is built to deliver an interactive web experience featuring custom three-dimensional elements and particle effects.

## Engineering Challenges and Solutions

Building this interactive client presented several front-end and user experience challenges. Below is a summary of the issues encountered during development and how they were resolved.

### Click Interceptions and Input Blockage with Canvas Layers
Integrating raw canvas overlays, specifically the interactive WebGL-based pointer particle trail (GhostCursor), originally intercepted clicks and hover events across the DOM. Standard mouse interactions with navigation bars, buttons, and form inputs were obstructed.
* **Solution**: The canvas render node was styled with `pointer-events-none` and placed inside a strictly regulated layering layout using a negative z-index (`z-index: -1`). This positioned the visual trails above the global background elements but securely beneath the text nodes, interactive cards, and buttons, maintaining full click responsiveness.

### WebGL Render Performance and Cursor Lag
The reactive stardust particle backdrop (Antigravity), implemented via React Three Fiber, initially suffered from latency in mouse coordinate tracking. The InstancedMesh particles lagged heavily behind the actual cursor, leading to sluggish physical movement transitions.
* **Solution**: The internal pointer interpolation logic was refactored by increasing the pointer tracking dampening factor (smoothFactor) from a passive 0.05 to an active 0.35. Combined with accelerating the linear interpolation speed (lerpSpeed) in the ThreeJS clock frame loop from 0.06 to 0.20, the stardust rings and capsules now track cursor gestures in real time.

### Nested Viewport Height and Stacking Scrollbar Conflicts
Implementing the cascading feature card overlap (ScrollStack) using Lenis smooth scrolling introduced scroll viewport conflicts. When embedded within nested scrolling divs, the card stack would bind poorly, occasionally freezing viewport scroll triggers or rendering duplicate, ugly scrollbars.
* **Solution**: Refactored the core ScrollStack wrapper to support a native window scroll binding toggle (useWindowScroll={true}). The scroll height calculations were adapted to listen directly to window.scrollY. The internal scrollbar is completely disabled, and cards now fold seamlessly into each other based on global window scroll progress.

### Unused State Compile Warnings in Strict Build Pipelines
When compiling the application for production using Vite and strict TypeScript checks (tsc -b), the build pipeline failed due to unused variables and state parameters that remained from legacy, scroll-event-driven card decks.
* **Solution**: Cleaned up the codebase by removing unused scrolling states, hooks, and dimensional variables that were previously managing active card indices manually, making the pages fully compile-safe.

### BlurText Initial Visibility Blocking
Integrating the `BlurText` letter-by-letter blur/slide effect for the Hero and CTA sections resulted in invisible text on the initial load. A parent `motion.div` from Framer Motion forced the text opacity to `0` while waiting for scroll triggers, completely hiding the typography.
* **Solution**: Adjusted the parent opacity dependencies and utilized an `IntersectionObserver` within the `BlurText` component itself. The component now fires independently when entering the viewport, bypassing the conflicting outer scroll state constraints.

### Folder Capacity Limits and Scaling for Community Highlights
The `Folder` component (used to showcase community highlight images) was designed natively to support only 3 overlapping item layers. When attempting to insert 4 distinct highlight images, it clipped or threw out data, forcing us originally to render 4 disjointed small folders.
* **Solution**: The `Folder` component was functionally rewritten to accept larger item arrays and scaled up to 3.5x its default size as a single centralized UI element. The open-state click logic was mathematically recalculated to fan out all 4 highlight images symmetrically in a wide arc, rather than relying on its native 3-item strict limit.

### Integrating GlassIcons with SPA Routing
Using the `GlassIcons` component for the Sidebar navigation introduced conflicts with React Router. The component natively relied on simple array objects and standard `onClick` events, meaning standard `<Link>` components couldn't be easily nested without fundamentally breaking its stylistic generic types.
* **Solution**: Transitioned the navigation execution away from `<Link>` abstractions and bound the routing cleanly using `window.location.href` inside the custom `onClick` handler of the `GlassIcons` configuration array. This bridged the gap between complex UI library types and necessary application routing logic.

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **State Management**: Zustand
- **Animations & 3D**: Framer Motion, GSAP, React Three Fiber, and Three.js
- **API Fetching**: Axios
- **Authentication**: Google OAuth (@react-oauth/google)

## Setup and Local Development

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### 1. Installation

Install all required package dependencies:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root of the `fe` directory and configure the environment variables:

```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Start the Development Server

Start the Vite development server locally:

```bash
npm run dev
```

The application will be accessible at http://localhost:5173.

### 4. Build for Production

Compile and pack the application for production:

```bash
npm run build
```

## Visual Redesign: Dark Theme and Interaction Cleanup

Following the initial build, the client went through a focused redesign pass to move away from the original yellow-accented theme and the heavier WebGL decoration layer, in favor of a single, consistent dark interface. Below is a summary of the issues encountered during this pass and how they were resolved.

### Fragmented Color System Across Light and Dark Variants
The original theme defined its brand color as a single yellow OKLCH value (`oklch(0.87 0.18 95)`) duplicated across both the `:root` (light) and `.dark` blocks in `index.css`, while several pages layered additional hardcoded yellow values on top (`#fff3a6` page backgrounds, raw rgba yellow radial gradients on the Welcome page). This left color decisions scattered between a shadcn token layer and page-level one-off hex values, with no single source of truth.
* **Solution**: `index.css` was rewritten around eight explicit CSS variables (`--color-bg-main`, `--color-bg-card`, `--color-bg-card-hover`, `--color-text-primary`, `--color-text-secondary`, `--color-border-subtle`, `--color-spotify-green`, `--color-spotify-green-hover`) mapped to a Spotify-inspired dark palette. Every shadcn semantic token (`--background`, `--card`, `--primary`, `--border`, `--muted-foreground`, and so on) was repointed to these variables, which re-themed the app in one file since most components already consumed those tokens rather than raw Tailwind color utilities. Remaining page-level hardcoded colors (Welcome page gradients, the `Folder` accent, `ClickSpark`, event status badges, and the `GlassIcons` active-state gradient, which was still hardcoded to purple) were swept and remapped to the same palette.

### Light/Dark Toggle No Longer Matched the Design Direction
`themeStore.ts` persisted a user-toggled light/dark preference to `localStorage`, and both `Navbar.tsx` and `WelcomePage.tsx` rendered Sun/Moon toggle controls wired to it. Supporting a light variant meant every component needed both a light and a dark set of token values, which worked against the move to a single deliberate dark palette.
* **Solution**: The app was committed to dark mode only. `themeStore.ts` was simplified to always apply the `.dark` class, `index.html` now sets `class="dark"` directly on the `<html>` element to avoid a flash of unstyled theme on first paint, and the toggle controls were removed from `Navbar.tsx` and `WelcomePage.tsx` along with their now-unused Sun/Moon imports.

### GhostCursor and Antigravity No Longer Justified Their Cost
The WebGL pointer trail (`GhostCursor`, used on the Welcome page) and the reactive particle backdrop (`Antigravity`, rendered behind the entire authenticated app in `AppLayout.tsx`) had both already required dedicated performance tuning to keep pointer tracking responsive. With the redesign aiming for a calmer, more refined surface, the added rendering cost and visual noise of two persistent WebGL layers no longer matched the intended feel of the interface.
* **Solution**: Both components were removed outright rather than further tuned. `GhostCursor.tsx` and `Antigravity.tsx` were deleted, along with their imports and render blocks in `WelcomePage.tsx` and `AppLayout.tsx` respectively.

### ScrollStack Did Not Visually Read as a Stack
The Lenis-driven `ScrollStack` implementation computed pin/unpin windows and per-card translateY offsets against `window.scrollY`, but the resulting motion scaled and blurred cards in place without the cards actually overlapping on screen, so the "stacking" effect did not read as a stack of cards.
* **Solution**: `ScrollStack.tsx` was rebuilt around native CSS `position: sticky`. Each card wrapper sticks at an increasing `top` offset (`topOffset + index * stackOffset`), so later cards pin slightly lower than earlier ones and visibly slide over them, leaving a peek of each prior card's top edge exposed above the active one. A lightweight scroll listener still applies a small scale and brightness falloff to already-covered cards for depth, computed from each card's own sticky trigger point rather than a shared pin/unpin window. This dropped the dependency on Lenis for this component entirely.
