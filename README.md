# Collaborative Study Vault (AUXP)

The Collaborative Study Vault (AUXP) is a full-stack web application designed to facilitate student collaboration, academic discussion, and resource sharing. It provides a secure platform featuring real-time collaborative workspaces, gamified progression systems, resource voting, and robust administrative moderation controls.

---

## System Architecture

The application is built using a decoupled architecture, separating the client-side presentation layer from the server-side business logic and data storage.

*   **Frontend (client)**: React (Vite-powered), styled with Tailwind CSS and Vanilla CSS, with state managed globally using Zustand.
*   **Backend (server)**: Node.js with Express, providing RESTful API endpoints and real-time bidirectional communication via Socket.io.
*   **Database**: MongoDB hosted on MongoDB Atlas, managed through Mongoose schemas.
*   **Asset Storage**: Cloudinary integration with a local filesystem fallback for uploaded files and documents.

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
