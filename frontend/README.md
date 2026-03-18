# BusGo — Ticket Booking Frontend

React + TypeScript frontend for the BusGo ticket booking system. Connects directly to the Node.js/Express/MongoDB backend API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | react-router-dom v6 |
| State | Context API + useReducer |
| HTTP | Axios (with in-memory cache) |
| Dates | date-fns |
| Build | Vite |
| Fonts | Syne, Inter, JetBrains Mono |

---

## Project Structure

```
src/
├── types/          # All TypeScript interfaces (exactly match backend)
├── services/
│   └── api.ts      # Axios client + authApi / tripsApi / bookingsApi + cache
├── context/
│   ├── AuthContext.tsx   # Auth state: login / register / logout / session restore
│   └── TripContext.tsx   # Trips + bookings global state, all API calls
├── hooks/
│   └── usePolling.ts     # Custom hook for live seat refresh
├── components/
│   ├── Navbar/           # Navbar.tsx + Navbar.css
│   ├── TripCard/         # TripCard.tsx + TripCard.css
│   ├── SeatMap/          # SeatMap.tsx + SeatMap.css (DOM manipulation)
│   ├── BookingCard/      # BookingCard.tsx + BookingCard.css
│   └── common/           # Spinner, ErrorBox, EmptyState, PageHeader, StatusBadge, Modal
├── pages/
│   ├── LoginPage/        # Login with quick-fill demo buttons
│   ├── RegisterPage/     # Full validation register
│   ├── HomePage/         # Trip listing + search filters + stats
│   ├── BookingPage/      # Seat map, auto/manual mode, polling, confirm
│   ├── MyBookingsPage/   # User booking history + cancel
│   └── AdminPage/        # Create trip form + admin trip list + all bookings
├── App.tsx               # Router + auth guards
├── main.tsx              # Entry point
└── index.css             # Global CSS variables, resets, utilities
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:5000`

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/ticket-booking-frontend.git
cd ticket-booking-frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the dev server
```bash
npm run dev
# → http://localhost:3000
```

### 4. Build for production
```bash
npm run build
npm run preview
```

---

## Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Trip listing with search filters |
| `/login` | Public | Sign in with JWT |
| `/register` | Public | Create account |
| `/booking/:id` | Public (book requires auth) | Seat map + booking |
| `/bookings` | Auth | My booking history + cancel |
| `/admin` | Admin only | Create trips, view all trips & bookings |

---

## Key Features

### Authentication
- JWT stored in `localStorage`, restored on mount via `GET /api/auth/me`
- Session persists across page refreshes
- Protected routes redirect to `/login` with `state.from` for post-login redirect
- Quick-fill demo buttons on login page (User / Admin credentials)

### Trip Browsing
- Filter by source, destination, and date
- Cached for 30s — no re-fetch on back-navigation
- Occupancy bar per trip card
- Pagination support

### Seat Booking
- **Auto mode**: backend assigns best available seats
- **Manual mode**: visual seat map with direct DOM manipulation for instant feedback
- Stepper control for selecting 1–6 seats
- Real-time seat availability via polling every 8s
- Booking lifecycle shown: PENDING → CONFIRMED / FAILED
- Concurrency errors shown clearly with retry guidance

### Admin Panel
- Create trip with full form validation (future-only datetime, seat range, price)
- Delete trips
- View all trips and bookings in tabbed interface

### Caching Strategy
- Trips list: 30s TTL
- Trip detail (seat map): 10s TTL (short — seats change frequently)
- My bookings: 20s TTL
- All caches busted on mutations (booking, cancel, create trip, delete trip)

---

## Assumptions

- Backend is running on `localhost:5000` (configurable via `VITE_API_URL`)
- Seed data provides: `alice@example.com / alice123` and `admin@ticketbooking.com / Admin@123`
- Seat map assumes a 2+2 bus layout (groups of 4 per row)
- Cancellation is only available for `CONFIRMED` bookings before trip departure

## Known Limitations

- No real payment flow (price is informational)
- No persistent notification system (toast alerts are inline)
- Admin cannot edit trips — only create/delete
- WebSocket not implemented; polling every 8s used instead