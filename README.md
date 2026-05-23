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
