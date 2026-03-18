import axios, { AxiosError } from 'axios';
import type {
  AuthApiResponse,
  AuthLoginPayload,
  AuthRegisterPayload,
  BookingApiResponse,
  BookingsListResponse,
  CreateBookingPayload,
  CreateTripPayload,
  MeApiResponse,
  TripApiResponse,
  TripDetailResponse,
  TripFilters,
  TripsListResponse,
} from '../types';

const BASE_URL = 'https://fs-bus-tracking.onrender.com/api';

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Inject JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise all error shapes → plain Error with message string
apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ─── Simple in-memory cache ───────────────────────────────────────────────────

interface CacheEntry<T> { data: T; expiresAt: number }
const _cache = new Map<string, CacheEntry<unknown>>();

function getCache<T>(key: string): T | null {
  const e = _cache.get(key) as CacheEntry<T> | undefined;
  if (!e || Date.now() > e.expiresAt) { _cache.delete(key); return null; }
  return e.data;
}
function setCache<T>(key: string, data: T, ttlMs: number) {
  _cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}
export function bustCache(pattern: string) {
  _cache.forEach((_, k) => { if (k.startsWith(pattern)) _cache.delete(k); });
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /api/auth/register */
  register: async (payload: AuthRegisterPayload): Promise<AuthApiResponse> => {
    const { data } = await apiClient.post<AuthApiResponse>('/auth/register', payload);
    return data;
  },

  /** POST /api/auth/login */
  login: async (payload: AuthLoginPayload): Promise<AuthApiResponse> => {
    const { data } = await apiClient.post<AuthApiResponse>('/auth/login', payload);
    return data;
  },

  /** GET /api/auth/me  (needs token) */
  getMe: async (): Promise<MeApiResponse> => {
    const { data } = await apiClient.get<MeApiResponse>('/auth/me');
    return data;
  },
};

// ─── Trips API ────────────────────────────────────────────────────────────────

export const tripsApi = {
  /** GET /api/trips?source=&destination=&date=&page=&limit= */
  getAll: async (
    filters: Partial<TripFilters> = {},
    page = 1,
    limit = 20
  ): Promise<TripsListResponse['data']> => {
    const qs = new URLSearchParams();
    if (filters.source)      qs.set('source', filters.source);
    if (filters.destination) qs.set('destination', filters.destination);
    if (filters.date)        qs.set('date', filters.date);
    qs.set('page', String(page));
    qs.set('limit', String(limit));

    const cacheKey = `trips:${qs.toString()}`;
    const hit = getCache<TripsListResponse['data']>(cacheKey);
    if (hit) return hit;

    const { data } = await apiClient.get<TripsListResponse>(`/trips?${qs}`);
    setCache(cacheKey, data.data, 30_000); // 30 s
    return data.data;
  },

  /** GET /api/trips/:id  → { trip, seatMap } */
  getById: async (id: string): Promise<TripDetailResponse['data']> => {
    const cacheKey = `trip:${id}`;
    const hit = getCache<TripDetailResponse['data']>(cacheKey);
    if (hit) return hit;

    const { data } = await apiClient.get<TripDetailResponse>(`/trips/${id}`);
    setCache(cacheKey, data.data, 10_000); // 10 s — short TTL (seats change)
    return data.data;
  },

  /** GET /api/trips/:id  force-fresh (used in polling) */
  getByIdFresh: async (id: string): Promise<TripDetailResponse['data']> => {
    bustCache(`trip:${id}`);
    return tripsApi.getById(id);
  },

  /** POST /api/trips  (admin only) */
  create: async (payload: CreateTripPayload): Promise<TripApiResponse> => {
    const { data } = await apiClient.post<TripApiResponse>('/trips', payload);
    bustCache('trips:');
    return data;
  },

  /** DELETE /api/trips/:id  (admin only) */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/trips/${id}`);
    bustCache('trips:');
    bustCache(`trip:${id}`);
  },
};

// ─── Bookings API ─────────────────────────────────────────────────────────────

export const bookingsApi = {
  /**
   * POST /api/bookings
   * Body: { tripId, seatsCount, preferredSeatNumbers? }
   */
  book: async (payload: CreateBookingPayload): Promise<BookingApiResponse> => {
    const { data } = await apiClient.post<BookingApiResponse>('/bookings', payload);
    // Invalidate seat cache for this trip so next load is fresh
    bustCache(`trip:${payload.tripId}`);
    bustCache('trips:');
    bustCache('my-bookings:');
    return data;
  },

  /** GET /api/bookings/my?page=&status= */
  getMyBookings: async (
    page = 1,
    status?: string
  ): Promise<BookingsListResponse['data']> => {
    const qs = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) qs.set('status', status);

    const cacheKey = `my-bookings:${qs.toString()}`;
    const hit = getCache<BookingsListResponse['data']>(cacheKey);
    if (hit) return hit;

    const { data } = await apiClient.get<BookingsListResponse>(`/bookings/my?${qs}`);
    setCache(cacheKey, data.data, 20_000);
    return data.data;
  },

  /** GET /api/bookings/admin/all?page= */
  getAllAdmin: async (page = 1): Promise<BookingsListResponse['data']> => {
    const { data } = await apiClient.get<BookingsListResponse>(
      `/bookings/admin/all?page=${page}&limit=30`
    );
    return data.data;
  },

  /** PATCH /api/bookings/:id/cancel */
  cancel: async (id: string): Promise<void> => {
    await apiClient.patch(`/bookings/${id}/cancel`);
    bustCache('my-bookings:');
    bustCache('trips:');
  },
};