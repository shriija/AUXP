# Collaborative Study Vault (AUXP)

The Collaborative Study Vault (AUXP) is a full-stack web application designed to facilitate student collaboration, academic discussion, and resource sharing. It provides a secure platform featuring real-time collaborative workspaces, gamified progression systems, resource voting, and robust administrative moderation controls.

---

## Deployment Links
*   **Live Web Application (Frontend)**: [https://auxp-chi.vercel.app](https://auxp-chi.vercel.app)
*   **Production API Server (Backend)**: [https://auxp-backend.onrender.com](https://auxp-backend.onrender.com)

---

## System Architecture & Tech Stack

The application is built using a decoupled architecture, separating the client-side presentation layer from the server-side business logic and data storage.

### Technology Stack
*   **Frontend**: React, Vite, Zustand (state management), Tailwind CSS & Vanilla CSS (styling), Axios (API client), Socket.io Client (real-time communication)
*   **Backend**: Node.js, Express, Socket.io (websockets), Google Auth Library (OAuth 2.0), JWT & Bcrypt (security)
*   **Database & Storage**: MongoDB Atlas, Mongoose (ODM), Cloudinary (cloud media hosting with local filesystem fallback)
*   **Deployment**: Vercel (Frontend), Render (Backend)

---

## Repository Structure

```text
AUXP/
├── client/                 # React frontend application (Vite) [See Client README](./client/README.md)
│   ├── src/
│   │   ├── components/     # UI components (Whiteboard, Chat, Navbar)
│   │   ├── pages/          # Page layouts (Login, Register, Dashboard)
│   │   ├── services/       # Axios API client connection
│   │   └── store/          # Zustand global stores (auth, notifications)
│   └── package.json
├── server/                 # Express backend server (Node.js) [See Server README](./server/README.md)
│   ├── controllers/        # Business logic controllers (rooms, auth, moderation)
│   ├── models/             # Mongoose database models (User, Classroom, Forum)
│   ├── routes/             # REST API endpoint route mappings
│   ├── scripts/            # Database backup and validation-bypass restore tools
│   └── server.js           # Server startup and socket handler
├── db-backup/              # Preloaded JSON database backups
└── req.http                # Professional API endpoint HTTP request tests
```

### Module Documentation
For specific details on implementation, state stores, backend routers, or database utilities, refer to the individual module files:
*   [Frontend Client Documentation](./client/README.md)
*   [Backend Server Documentation](./server/README.md)

---

## Core Features

### 1. Collaborative Classrooms & Whiteboards
*   **Real-time Interaction**: Students can join virtual study rooms where they communicate via Socket.io-driven chat messages.
*   **Synchronized Canvas**: Shared whiteboards allow users to draw collaboratively. Path coordinates are captured and broadcast to all connected members instantly.
*   **Host Session Control**: Hosts can extend classroom study session durations dynamically, with changes pushed in real time via websockets.
*   **Collaborative Todo Boards**: Dedicated shared task lists per classroom to track study goals and progress.

### 2. Academic Discussion Forum
*   **Threaded Discussions**: Users can create academic posts, reply to existing threads, and upload attachments.
*   **Image Attachments**: Supports single-image attachments processed securely via Cloudinary, falling back to local server storage if necessary.
*   **Guide Compliance**: Inputs are sanitized and subject to approval workflows to maintain academic integrity.

### 3. Resource Sharing & Gamification
*   **Knowledge Base**: A repository where students upload files, notes, and reference materials.
*   **Voting System**: Users can upvote and downvote resources, dynamically calculating utility scores.
*   **XP & Badge Progression**: Students earn Experience Points (XP) and unlock academic badges as they contribute, fostering healthy engagement.

### 4. Authentication & Security
*   **OAuth Integration**: Fully integrated Google OAuth flow for streamlined, secure registration and login.
*   **Input Sanitization**: Strict name verification rules enforced on both frontend and backend (requires at least 3 characters, alphabetic characters only, and both a first and last name structure).
*   **Password Management**: Cryptographically hashed passwords (via bcrypt) and secure JWT session handling.

### 5. Administrative Moderation & Appeals
*   **Flagging & Review**: Admins review, approve, edit, or reject content.
*   **Appeals Center**: Flagged or deleted content generates automated alerts, allowing students to submit appeal concerns that administrators can inspect and resolve.

---

## Creative Process & Technical Implementation

Throughout the development of AUXP, we focused on system stability, security, and developer efficiency. Key challenges resolved include:

*   **Cross-Origin Configuration**: Hardened CORS policies to permit secure cookie-based session handling (`withCredentials: true`) between the Vercel-hosted frontend and Render-hosted backend.
*   **Validation Synchronicity**: Implemented full name verification constraints on both the UI and API layers to block bad input early while maintaining descriptive user feedback.
*   **Migration Compatibility**: Developed a custom database backup/restore tool. To handle model updates where new fields were made mandatory, the restore script dynamically bypasses schema validations at runtime, ensuring legacy records import cleanly without manual database rewriting.

---

## Getting Started

### Prerequisites
*   Node.js (version 16 or higher)
*   MongoDB running locally or a MongoDB Atlas account

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/shriija/AUXP.git
   cd AUXP
   ```

2. Set up the backend server:
   ```bash
   cd server
   npm install
   # Create a .env file and define PORT, MONGODB_URI, JWT_SECRET, CLOUDINARY credentials, and GOOGLE_CLIENT_ID
   node server.js
   ```

3. Set up the frontend client:
   ```bash
   cd ../client
   npm install
   # Create a .env file and define VITE_API_URL
   npm run dev
   ```

---

## API Testing Utility

At the root of the repository, a `req.http` file is configured. If you are using a REST client extension (such as the VS Code REST Client extension), you can open this file and run the pre-configured requests directly against the API server. It contains sample configurations for:
*   User registration and login flows.
*   Public resource fetching.
*   Protected gamification voting (upvote/downvote).
