# AUXP Frontend Client

The frontend of the Collaborative Study Vault (AUXP) is a single-page application built using React and Vite, structured to deliver a fast, responsive, and interactive user experience.

---

## Tech Stack & Libraries

*   **Build Tool**: Vite (for rapid hot-reloads and optimized production builds)
*   **State Management**: Zustand (lightweight global state management)
*   **Routing**: React Router DOM (client-side declarative routing)
*   **Icons**: Lucide React
*   **Networking**: Axios (configured with custom interceptors and session credentials)
*   **Real-time Services**: Socket.io Client

---

## Client State Management (Zustand)

The client uses Zustand stores to manage global state and coordinate asynchronous API requests:

*   **Authentication Store (`useAuthStore`)**: Handles user login, registration, password updates, and profile edits. It enforces client-side name verification (character constraints and double-name checks) before making server requests to improve user feedback.
*   **Notification Store**: Manages the alert polling cycle and captures real-time backend notifications pushed over Socket.io, displaying them dynamically in the Navbar.
*   **Study Classroom Store**: Maintains active virtual study room configurations, whiteboard drawing paths, and collaborative task completions.

---

## Key Modules

### 1. Collaborative Whiteboard Canvas
*   Interactive drawing space rendering user drawing paths.
*   Mouse/Touch coordinates are recorded, serialized, and broadcast to other members through socket gateways to maintain synchronized views.

### 2. Gamified Profile Hub
*   Visualizes user experience levels (XP progression bar) and displays earned badges.
*   Enforces input restrictions to keep profiles authentic and compliant.

### 3. Moderation App & Concern Resolution
*   Specialized administrator views listing reported content and active appeals.
*   Provides actions to approve, hide, or revert items directly from the UI.

---

## Available Scripts

In the `client` directory, you can run:

### `npm run dev`
Runs the app in development mode at `http://localhost:5173`.

### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles assets and minifies JS/CSS for deployment.

### `npm run preview`
Locally previews the production build.

---

## Environment Configuration

Create a `.env` file in the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```
*(For production deployments, set this to your hosted backend API URL).*
