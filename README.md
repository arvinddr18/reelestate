# 🏠 ReelEstate — Instagram-style Real Estate App

A full-stack Instagram-inspired real estate platform where sellers post property reels and buyers discover, save, and message sellers.

---

## 📁 Project Structure

```
reelestate/
├── client/          # React frontend (Vite + Tailwind CSS)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level page components
│       ├── context/      # React Context (Auth)
│       ├── services/     # Axios API calls
│       └── hooks/        # Custom React hooks
└── server/          # Node.js + Express backend
    ├── models/       # Mongoose schemas
    ├── routes/       # Express route definitions
    ├── controllers/  # Business logic
    ├── middleware/   # Auth, upload middleware
    └── utils/        # Helpers (Cloudinary, etc.)
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier works)

---

## 🚀 Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd reelestate

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Server Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/reelestate
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 3. Client Environment Variables

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run the App

```bash
# Terminal 1 — Start backend
cd server && npm run dev

# Terminal 2 — Start frontend
cd client && npm run dev
```

Open: http://localhost:5173

---

## 🔑 Key Features

| Feature | Details |
|---|---|
| Auth | JWT + HTTP-only cookie, role-based (buyer/seller/admin) |
| Feed | Infinite scroll, video auto-play on viewport entry |
| Posts | Video reels + image carousels with property details |
| Social | Like, comment, save, follow |
| Filter | By location (taluk/district/state), price range, type |
| Search | Keyword + hashtag search |
| Messaging | Real-time Socket.io chat |
| Admin | Dashboard to manage users & posts |

---

## 🛠 Tech Stack

**Frontend:** React 18, React Router v6, Tailwind CSS, Axios, Socket.io-client  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Multer, Cloudinary, Socket.io

---

## 📦 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/posts/feed | Get feed posts |
| POST | /api/posts | Create post |
| PUT | /api/posts/:id/like | Toggle like |
| POST | /api/posts/:id/comments | Add comment |
| GET | /api/users/:id | Get profile |
| POST | /api/users/:id/follow | Toggle follow |
| GET | /api/messages/:userId | Get chat messages |
| POST | /api/messages | Send message |
| GET | /api/admin/users | Admin: list users |
| DELETE | /api/admin/users/:id | Admin: delete user |
