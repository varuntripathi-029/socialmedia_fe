# Social Media Frontend

This is the frontend application for the Social Media platform, built with React, Vite, and Tailwind CSS. The interface is designed to be highly interactive, featuring modern animations and 3D elements.

🚀 **Live Deployment:** [https://socialmedia-fe-beta.vercel.app](https://socialmedia-fe-beta.vercel.app)

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling & UI:** 
  - Tailwind CSS v4
  - Shadcn UI / Radix primitives
  - Lucide React (Icons)
- **State Management:** Zustand
- **Routing:** React Router v7
- **Animations & 3D:** 
  - Framer Motion
  - GSAP
  - React Three Fiber / Drei / Three.js
- **API & Data Fetching:** Axios
- **Authentication:** Google OAuth (`@react-oauth/google`)

## ✨ Key Features

- **Authentication:** Secure login with Email/Password and Google OAuth integration.
- **Dynamic Feed:** View and interact with posts (likes, comments).
- **Event Discovery & Creation:** Discover local events, view event details, and RSVP. Features a highly interactive event creation flow.
- **Profiles:** User pages displaying avatars, posts, followers, and following.
- **Notifications:** In-app updates for likes, comments, follows, and event activity.
- **Rich Experience:** Fluid animations with Framer Motion and GSAP, plus immersive 3D interactions using React Three Fiber.

## 🚀 Setup & Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Installation

Clone the repository and install the dependencies:

```bash
cd fe
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the `fe` directory and add the necessary environment variables. Example variables might include:

```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Running the Development Server

Start the Vite development server:

```bash
npm run dev
```

The app will typically be available at `http://localhost:5173`.

### 4. Build for Production

To create an optimized production build:

```bash
npm run build
```

You can preview the production build locally using:

```bash
npm run preview
```

## 📁 Project Structure

- `src/api/` - Axios configuration and API service functions.
- `src/assets/` - Static files, images, and fonts.
- `src/components/` - Reusable UI components (buttons, modals, layout).
- `src/config/` - App-wide configurations and constants.
- `src/lib/` - Utility libraries and Shadcn utility functions (`utils.ts`).
- `src/pages/` - Top-level route components (Feed, Profile, Events, Auth).
- `src/store/` - Zustand state slices.
- `src/types/` - TypeScript interface and type definitions.
- `src/utils/` - Helper functions.
