# Project Structure

```
ticket-booking-frontend/
│
├── docs/                           # Documentation
│   ├── API.md                     # API documentation
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── QUICK_START.md             # Quick start guide
│
├── src/                           # Source code
│   ├── components/                # React components
│   │   ├── Admin/                # Admin-specific components
│   │   │   ├── CreateShow.tsx    # Form to create new shows
│   │   │   └── ShowList.tsx      # Display all shows (admin view)
│   │   │
│   │   ├── User/                 # User-specific components
│   │   │   ├── BookingPage.tsx   # Seat selection & booking page
│   │   │   └── ShowListUser.tsx  # Browse available shows (user view)
│   │   │
│   │   └── common/               # Shared/reusable components
│   │       ├── ErrorBoundary.tsx # Error boundary for error handling
│   │       └── LoadingSpinner.tsx # Loading indicator component
│   │
│   ├── context/                  # State management
│   │   └── AppContext.tsx        # Global app state (Context API)
│   │
│   ├── services/                 # API integration
│   │   └── api.ts                # API service layer (Axios setup)
│   │
│   ├── types/                    # TypeScript definitions
│   │   └── index.ts              # Type definitions and interfaces
│   │
│   ├── App.tsx                   # Main app component with routing
│   ├── index.tsx                 # Application entry point
│   └── index.css                 # Global styles
│
├── public/                       # Static assets (favicon, etc.)
│
├── .env.example                  # Environment variables template
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── README.md                    # Main documentation
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # TypeScript config for Vite
└── vite.config.ts               # Vite build configuration
```

## Component Hierarchy

```
App
├── Header (role switcher)
├── Routes
│   ├── Admin Mode
│   │   └── AdminDashboard
│   │       ├── Sidebar Navigation
│   │       └── Content Area
│   │           ├── CreateShow (route: /admin)
│   │           └── ShowList (route: /admin/shows)
│   │
│   └── User Mode
│       ├── ShowListUser (route: /)
│       └── BookingPage (route: /booking/:id)
│           ├── Seat Grid
│           └── Booking Summary
│
└── Footer
```

## Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Context API Method
    ↓
API Service Layer
    ↓
Backend API (Axios)
    ↓
Response Handling
    ↓
Context State Update
    ↓
Component Re-render
    ↓
UI Update
```

## State Management

```
AppContext (Global State)
├── shows[]              # All shows data
├── bookings[]           # User bookings
├── userRole             # ADMIN | USER
├── loading              # Loading state
├── error                # Error state
│
└── Methods
    ├── fetchShows()     # Fetch all shows
    ├── createShow()     # Create new show (admin)
    ├── bookSeats()      # Book seats (user)
    ├── setUserRole()    # Switch between admin/user
    └── clearError()     # Clear error messages
```

## Routing Structure

```
Public Routes (No Auth)
├── /                    → ShowListUser (User home)
├── /booking/:id         → BookingPage (Seat selection)
├── /admin               → CreateShow (Admin home)
└── /admin/shows         → ShowList (All shows admin view)
```

## API Endpoints Used

```
GET    /api/shows           # Fetch all shows
GET    /api/shows/:id       # Fetch specific show
POST   /api/shows           # Create new show (admin)
POST   /api/bookings        # Book seats (user)
GET    /api/bookings        # Fetch all bookings
```

## TypeScript Types

```typescript
// Core Types
- Show
- Booking
- CreateShowInput
- BookSeatsInput
- ApiError
- AppContextType

// Enums
- BookingStatus (PENDING, CONFIRMED, FAILED)
- UserRole (ADMIN, USER)
```

## Key Features by File

### CreateShow.tsx
- Form validation
- Error handling
- Success notifications
- Date/time picker
- Seat number input

### ShowList.tsx
- Display all shows
- Progress bars
- Refresh functionality
- Empty state handling

### ShowListUser.tsx
- Browse shows
- Availability indicators
- Navigation to booking

### BookingPage.tsx
- Interactive seat grid
- Real-time selection
- Email validation
- Booking status tracking
- Success/failure handling

### AppContext.tsx
- Global state management
- API call orchestration
- Error state management
- Loading state management

### api.ts
- Axios configuration
- Error transformation
- Type-safe API calls
- Timeout handling

## Style Architecture

```
CSS Variables (Theme)
├── Colors
│   ├── Primary (indigo/purple)
│   ├── Secondary (pink)
│   ├── Success (green)
│   ├── Error (red)
│   └── Warning (orange)
│
├── Backgrounds
│   ├── Main (dark)
│   ├── Card (elevated)
│   └── Hover states
│
├── Typography
│   ├── Text colors
│   └── Font weights
│
└── Layout
    ├── Border radius
    ├── Shadows
    └── Transitions
```

## Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main bundle
│   ├── index-[hash].css     # Styles
│   └── [vendor]-[hash].js   # Vendor chunks
│
└── index.html               # Entry point
```
