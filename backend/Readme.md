# 🎟️ Ticket Booking System — Backend

A production-ready, high-concurrency ticket booking API built with **Node.js**, **Express.js**, and **MongoDB**. Simulates platforms like **RedBus** or **BookMyShow** with atomic seat reservation to prevent overbooking under concurrent load.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Concurrency Strategy](#concurrency-strategy)
- [Environment Variables](#environment-variables)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | MongoDB 6+ (via Mongoose 8) |
| Auth | JWT + bcryptjs |
| API Docs | Swagger UI (swagger-jsdoc) |
| Rate Limiting | express-rate-limit |

---

## ✨ Features

- **JWT Authentication** — Register, login, role-based access (user/admin)
- **Admin Trip Management** — Create, update, delete bus trips
- **Seat Booking** — Auto-assign or choose specific seat numbers
- **Concurrency-Safe** — MongoDB transactions + atomic `findOneAndUpdate` prevents overbooking
- **Booking Lifecycle** — `PENDING → CONFIRMED` or `FAILED` audit trail
- **Booking Cancellation** — Releases seats atomically back to the trip
- **Seat Map** — Visual per-trip seat availability
- **Pagination & Filtering** — On all list endpoints
- **Swagger Docs** — Full interactive API documentation at `/api/docs`
- **Rate Limiting** — Per-endpoint DDoS protection

---

## 📁 Project Structure

```
ticket-booking-system/
├── src/
│   ├── app.js                    # Express app, middleware, routes
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── swagger.js            # Swagger/OpenAPI config
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt, JWT)
│   │   ├── Trip.js               # Trip schema (seats, atomic)
│   │   └── Booking.js            # Booking schema (status lifecycle)
│   ├── controllers/
│   │   ├── authController.js     # register, login, getMe
│   │   ├── tripController.js     # CRUD for trips
│   │   └── bookingController.js  # bookSeats (concurrency core), cancel
│   ├── middleware/
│   │   └── auth.js               # protect + adminOnly middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   └── bookingRoutes.js
│   └── utils/
│       └── seed.js               # DB seeder (admin + sample trips)
├── .env
├── package.json
├── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally **or** a MongoDB Atlas connection string
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/akpatel2131/FS-bus_tracking.git
cd FS-bus_tracking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 🔗 Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get own profile |

### Trips

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/trips` | Public | List trips (filterable) |
| GET | `/api/trips/:id` | Public | Trip details + seat map |
| POST | `/api/trips` | Admin | Create trip |
| PUT | `/api/trips/:id` | Admin | Update trip |
| DELETE | `/api/trips/:id` | Admin | Delete trip |

**GET /api/trips query params:**
- `source` — filter by source city (partial match)
- `destination` — filter by destination city
- `date` — filter by date `YYYY-MM-DD`
- `minSeats` — minimum available seats required
- `page`, `limit` — pagination

### Bookings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | Private | Book seats (concurrency-safe) |
| GET | `/api/bookings/my` | Private | My booking history |
| GET | `/api/bookings/admin/all` | Admin | All bookings |
| GET | `/api/bookings/:id` | Private | Single booking |
| PATCH | `/api/bookings/:id/cancel` | Private | Cancel booking |

---

## 🔐 Authentication

All protected routes require a Bearer token:

```
Authorization: Bearer <JWT_TOKEN>
```

Get a token by calling `POST /api/auth/login`.

---

## ⚡ Concurrency Strategy

The booking system uses **two layers** to prevent overbooking:

### Layer 1 — Atomic MongoDB Update

```javascript
Trip.findOneAndUpdate(
  {
    _id: tripId,
    availableSeats: { $gte: numSeats },        // Guard: enough seats
    bookedSeatNumbers: { $nin: selectedSeats } // Guard: seats not taken
  },
  {
    $inc: { availableSeats: -numSeats },
    $push: { bookedSeatNumbers: { $each: selectedSeats } }
  }
)
```

If this returns `null`, the seats were already taken — booking is marked `FAILED`.

### Layer 2 — MongoDB ACID Transactions

The Trip update + Booking creation are wrapped in a session transaction. If anything fails after the seat is reserved, the entire operation rolls back — no phantom seat deductions.

### Layer 3 — HTTP Rate Limiting

Booking endpoint is rate-limited to **10 requests/minute per IP** to throttle bots and reduce DB pressure.