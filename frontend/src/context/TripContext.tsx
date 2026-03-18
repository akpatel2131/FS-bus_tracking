import {
    createContext,
    useCallback,
    useContext, useReducer,
    type ReactNode,
} from 'react';
import { bookingsApi, tripsApi } from '../services/api';
import type {
    Booking,
    Pagination,
    SeatMapItem,
    Trip,
    TripFilters,
} from '../types';

// ─── State ────────────────────────────────────────────────────────────────────

interface TripState {
  // Trip list
  trips: Trip[];
  pagination: Pagination | null;
  tripsLoading: boolean;
  tripsError: string | null;
  filters: TripFilters;

  // Trip detail
  selectedTrip: Trip | null;
  seatMap: SeatMapItem[];
  detailLoading: boolean;
  detailError: string | null;

  // My bookings
  myBookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string | null;

  // Booking flow
  bookingLoading: boolean;
  bookingError: string | null;
  lastBooking: Booking | null;

  // Admin bookings
  adminBookings: Booking[];
  adminBookingsLoading: boolean;
}

const initialFilters: TripFilters = { source: '', destination: '', date: '' };

const initialState: TripState = {
  trips: [], pagination: null, tripsLoading: false, tripsError: null,
  filters: initialFilters,
  selectedTrip: null, seatMap: [], detailLoading: false, detailError: null,
  myBookings: [], bookingsLoading: false, bookingsError: null,
  bookingLoading: false, bookingError: null, lastBooking: null,
  adminBookings: [], adminBookingsLoading: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'TRIPS_LOADING' }
  | { type: 'TRIPS_OK'; trips: Trip[]; pagination: Pagination }
  | { type: 'TRIPS_ERR'; msg: string }
  | { type: 'SET_FILTERS'; filters: Partial<TripFilters> }
  | { type: 'DETAIL_LOADING' }
  | { type: 'DETAIL_OK'; trip: Trip; seatMap: SeatMapItem[] }
  | { type: 'DETAIL_ERR'; msg: string }
  | { type: 'DETAIL_REFRESH_SEATMAP'; seatMap: SeatMapItem[]; trip: Trip }
  | { type: 'MY_BOOKINGS_LOADING' }
  | { type: 'MY_BOOKINGS_OK'; bookings: Booking[] }
  | { type: 'MY_BOOKINGS_ERR'; msg: string }
  | { type: 'BOOKING_LOADING' }
  | { type: 'BOOKING_OK'; booking: Booking }
  | { type: 'BOOKING_ERR'; msg: string }
  | { type: 'BOOKING_CLEAR' }
  | { type: 'ADMIN_BOOKINGS_LOADING' }
  | { type: 'ADMIN_BOOKINGS_OK'; bookings: Booking[] }
  | { type: 'TRIP_ADDED'; trip: Trip }
  | { type: 'TRIP_DELETED'; id: string }
  | { type: 'BOOKING_CANCELLED'; id: string };

function reducer(s: TripState, a: Action): TripState {
  switch (a.type) {
    case 'TRIPS_LOADING':    return { ...s, tripsLoading: true, tripsError: null };
    case 'TRIPS_OK':         return { ...s, trips: a.trips, pagination: a.pagination, tripsLoading: false };
    case 'TRIPS_ERR':        return { ...s, tripsLoading: false, tripsError: a.msg };
    case 'SET_FILTERS':      return { ...s, filters: { ...s.filters, ...a.filters } };
    case 'DETAIL_LOADING':   return { ...s, detailLoading: true, detailError: null };
    case 'DETAIL_OK':        return { ...s, selectedTrip: a.trip, seatMap: a.seatMap, detailLoading: false };
    case 'DETAIL_ERR':       return { ...s, detailLoading: false, detailError: a.msg };
    case 'DETAIL_REFRESH_SEATMAP': return { ...s, seatMap: a.seatMap, selectedTrip: a.trip };
    case 'MY_BOOKINGS_LOADING': return { ...s, bookingsLoading: true, bookingsError: null };
    case 'MY_BOOKINGS_OK':   return { ...s, myBookings: a.bookings, bookingsLoading: false };
    case 'MY_BOOKINGS_ERR':  return { ...s, bookingsLoading: false, bookingsError: a.msg };
    case 'BOOKING_LOADING':  return { ...s, bookingLoading: true, bookingError: null, lastBooking: null };
    case 'BOOKING_OK':       return { ...s, bookingLoading: false, lastBooking: a.booking };
    case 'BOOKING_ERR':      return { ...s, bookingLoading: false, bookingError: a.msg };
    case 'BOOKING_CLEAR':    return { ...s, bookingError: null, lastBooking: null };
    case 'ADMIN_BOOKINGS_LOADING': return { ...s, adminBookingsLoading: true };
    case 'ADMIN_BOOKINGS_OK': return { ...s, adminBookings: a.bookings, adminBookingsLoading: false };
    case 'TRIP_ADDED':       return { ...s, trips: [a.trip, ...s.trips] };
    case 'TRIP_DELETED':     return { ...s, trips: s.trips.filter(t => t._id !== a.id) };
    case 'BOOKING_CANCELLED':
      return {
        ...s,
        myBookings: s.myBookings.map(b =>
          b._id === a.id ? { ...b, status: 'FAILED' as const } : b
        ),
      };
    default: return s;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface TripContextValue extends TripState {
  fetchTrips: (filters?: Partial<TripFilters>, page?: number) => Promise<void>;
  fetchTripDetail: (id: string) => Promise<void>;
  refreshTripDetail: (id: string) => Promise<void>;
  fetchMyBookings: () => Promise<void>;
  fetchAdminBookings: () => Promise<void>;
  bookSeats: (tripId: string, seatsCount: number, preferred?: number[]) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  setFilters: (f: Partial<TripFilters>) => void;
  clearBookingState: () => void;
  createTrip: (payload: import('../types').CreateTripPayload) => Promise<Trip>;
  deleteTrip: (id: string) => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchTrips = useCallback(async (
    filters: Partial<TripFilters> = {},
    page = 1
  ) => {
    dispatch({ type: 'TRIPS_LOADING' });
    try {
      const res = await tripsApi.getAll(filters, page);
      dispatch({ type: 'TRIPS_OK', trips: res.trips, pagination: res.pagination });
    } catch (err) {
      dispatch({ type: 'TRIPS_ERR', msg: (err as Error).message });
    }
  }, []);

  const fetchTripDetail = useCallback(async (id: string) => {
    dispatch({ type: 'DETAIL_LOADING' });
    try {
      const res = await tripsApi.getById(id);
      dispatch({ type: 'DETAIL_OK', trip: res.trip, seatMap: res.seatMap });
    } catch (err) {
      dispatch({ type: 'DETAIL_ERR', msg: (err as Error).message });
    }
  }, []);

  // Used by polling — bypasses cache
  const refreshTripDetail = useCallback(async (id: string) => {
    try {
      const res = await tripsApi.getByIdFresh(id);
      dispatch({ type: 'DETAIL_REFRESH_SEATMAP', seatMap: res.seatMap, trip: res.trip });
    } catch { /* silent — don't disrupt UI on poll fail */ }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    dispatch({ type: 'MY_BOOKINGS_LOADING' });
    try {
      const res = await bookingsApi.getMyBookings();
      dispatch({ type: 'MY_BOOKINGS_OK', bookings: res.bookings });
    } catch (err) {
      dispatch({ type: 'MY_BOOKINGS_ERR', msg: (err as Error).message });
    }
  }, []);

  const fetchAdminBookings = useCallback(async () => {
    dispatch({ type: 'ADMIN_BOOKINGS_LOADING' });
    try {
      const res = await bookingsApi.getAllAdmin();
      dispatch({ type: 'ADMIN_BOOKINGS_OK', bookings: res.bookings });
    } catch { dispatch({ type: 'ADMIN_BOOKINGS_OK', bookings: [] }); }
  }, []);

  const bookSeats = useCallback(async (
    tripId: string,
    seatsCount: number,
    preferred?: number[]
  ): Promise<Booking> => {
    dispatch({ type: 'BOOKING_LOADING' });
    try {
      const res = await bookingsApi.book({
        tripId,
        seatsCount,
        preferredSeatNumbers: preferred?.length ? preferred : undefined,
      });
      dispatch({ type: 'BOOKING_OK', booking: res.data.booking });
      return res.data.booking;
    } catch (err) {
      const msg = (err as Error).message;
      dispatch({ type: 'BOOKING_ERR', msg });
      throw new Error(msg);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    await bookingsApi.cancel(bookingId);
    dispatch({ type: 'BOOKING_CANCELLED', id: bookingId });
  }, []);

  const setFilters = useCallback((f: Partial<TripFilters>) => {
    dispatch({ type: 'SET_FILTERS', filters: f });
  }, []);

  const clearBookingState = useCallback(() => {
    dispatch({ type: 'BOOKING_CLEAR' });
  }, []);

  const createTrip = useCallback(async (
    payload: import('../types').CreateTripPayload
  ): Promise<Trip> => {
    const res = await tripsApi.create(payload);
    dispatch({ type: 'TRIP_ADDED', trip: res.data.trip });
    return res.data.trip;
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    await tripsApi.delete(id);
    dispatch({ type: 'TRIP_DELETED', id });
  }, []);

  return (
    <TripContext.Provider value={{
      ...state,
      fetchTrips, fetchTripDetail, refreshTripDetail,
      fetchMyBookings, fetchAdminBookings,
      bookSeats, cancelBooking,
      setFilters, clearBookingState,
      createTrip, deleteTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrips(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips must be used inside <TripProvider>');
  return ctx;
}