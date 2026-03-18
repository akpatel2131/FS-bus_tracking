// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthRegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Backend: POST /api/auth/login  → { success, message, data: { token, user } }
// Backend: POST /api/auth/register → { success, message, data: { token, user } }
export interface AuthApiResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Backend: GET /api/auth/me → { success, data: { user } }
export interface MeApiResponse {
  success: boolean;
  data: { user: User };
}

// ─── Trip ──────────────────────────────────────────────────────────────────────

export interface Trip {
  _id: string;
  busName: string;
  source: string;
  destination: string;
  startTime: string;         // ISO string
  totalSeats: number;
  availableSeats: number;
  bookedSeatNumbers: number[];
  price: number;
  isActive: boolean;
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
}

export interface SeatMapItem {
  number: number;
  isBooked: boolean;
}

// Backend: GET /api/trips → { success, data: { trips, pagination } }
export interface TripsListResponse {
  success: boolean;
  data: {
    trips: Trip[];
    pagination: Pagination;
  };
}

// Backend: GET /api/trips/:id → { success, data: { trip, seatMap } }
export interface TripDetailResponse {
  success: boolean;
  data: {
    trip: Trip;
    seatMap: SeatMapItem[];
  };
}

// Backend: POST /api/trips (admin)
export interface CreateTripPayload {
  busName: string;
  source: string;
  destination: string;
  startTime: string;         // ISO string
  totalSeats: number;
  price: number;
}

export interface TripApiResponse {
  success: boolean;
  message: string;
  data: { trip: Trip };
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface Booking {
  _id: string;
  user: User | string;
  trip: Trip | string;
  seatsBooked: number;
  seatNumbers: number[];
  totalAmount: number;
  status: BookingStatus;
  failureReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

// Backend: POST /api/bookings → { tripId, seatsCount, preferredSeatNumbers? }
export interface CreateBookingPayload {
  tripId: string;
  seatsCount: number;
  preferredSeatNumbers?: number[];
}

// Backend: POST /api/bookings → { success, message, data: { booking } }
export interface BookingApiResponse {
  success: boolean;
  message: string;
  data: { booking: Booking };
}

// Backend: GET /api/bookings/my → { success, data: { bookings, pagination } }
export interface BookingsListResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    pagination: Pagination;
  };
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface TripFilters {
  source: string;
  destination: string;
  date: string;
}