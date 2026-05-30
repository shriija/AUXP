# AUXP Backend Server

The backend server of the Collaborative Study Vault (AUXP) is a RESTful API and WebSocket server built using Node.js, Express, and MongoDB. It manages data persistence, authentication, asset uploads, and real-time collaborative workspaces.

---

## Tech Stack & Core Libraries

*   **Runtime Environment**: Node.js
*   **Web Framework**: Express
*   **Database Management**: MongoDB & Mongoose
*   **Real-time Communication**: Socket.io
*   **Authentication**: JSON Web Tokens (JWT) & Bcrypt (password hashing)
*   **Media Processing**: Cloudinary SDK (cloud asset storage)
*   **OAuth**: Google Auth Library

---

## Directory Structure

*   **`server.js`**: Entry point of the application. Initializes database connections, configures CORS origins, establishes HTTP/WebSocket servers, and mounts routers.
*   **`controllers/`**: Contains core request handler controllers:
    *   `auth.controller.js`: Handles credentials, Google OAuth, profile management, and input sanitization.
    *   `classroom.controller.js`: Manages study rooms, messages, whiteboard snapshots, and session timer expansions.
    *   `forum.controller.js` & `resource.controller.js`: Coordinates threads, replies, file uploads, and gamified upvote scoring.
    *   `admin.controller.js`: Manages content moderation, guideline compliance, and resolving student appeals.
*   **`models/`**: Defines database schemas (User, Classroom, ForumPost, ForumReply, Resource, Notification, Concern, Vote).
*   **`middleware/`**: Enforces system boundaries (e.g., authentication verification, admin checks, rate limiting).
*   **`scripts/`**: Houses utility scripts:
    *   `backup.js`: Queries the database and saves collections to localized JSON format.
    *   `restore.js`: Clears existing tables and seeds database instances bypassing validations to allow legacy records to compile.

---

## Socket.io Real-time Events

The server hosts a WebSocket server to process real-time interactions:

*   `join_classroom`: Registers connection to specific classroom namespaces.
*   `send_message`: Processes chat messages and broadcasts them to members.
*   `draw`: Receives coordinate segments (stroke configurations, paths) and relays them to synchronize canvasses.
*   `extend_session`: Allows hosts to extend classroom sessions, notifying all connected clients of the new end time.

---

## Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_token

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## Administrative Commands

### Database Backup
Saves all collections to `./db-backup/` as JSON files:
```bash
node server/scripts/backup.js
```

### Database Restoration
Restores collections using files in `./db-backup/`. It automatically bypasses runtime required-field validators to ensure older development assets load successfully:
```bash
node server/scripts/restore.js
```
