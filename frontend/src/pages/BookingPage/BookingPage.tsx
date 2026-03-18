import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SeatMap } from '../../components/SeatMap/SeatMap';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import { usePolling } from '../../hooks/usePooling';
import { ErrorBox, Spinner } from '../../Tools/Common';
import type { Booking } from '../../types';
import './BookingPage.css';

const MAX_SEATS_PER_BOOKING = 6;

export function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    selectedTrip, seatMap, detailLoading, detailError,
    bookingLoading, bookingError,
    fetchTripDetail, refreshTripDetail,
    bookSeats, clearBookingState,
  } = useTrips();

  const [seatsNeeded, setSeatsNeeded]   = useState(1);
  const [selectedSeats, setSelected]    = useState<number[]>([]);
  const [mode, setMode]                 = useState<'auto' | 'manual'>('auto');
  const [confirmed, setConfirmed]       = useState<Booking | null>(null);

  // Fetch trip detail on mount
  useEffect(() => {
    if (id) fetchTripDetail(id);
    return () => { clearBookingState(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Deselect seats that got booked by another user during polling
  useEffect(() => {
    const nowBooked = seatMap.filter(s => s.isBooked).map(s => s.number);
    setSelected(prev => prev.filter(n => !nowBooked.includes(n)));
  }, [seatMap]);

  // Live polling every 8 s (only while on page, not after confirmed)
  usePolling(
    useCallback(() => { if (id && !confirmed) refreshTripDetail(id); }, [id, confirmed, refreshTripDetail]),
    8000,
    !!id && !confirmed
  );

  // When seatsNeeded changes in auto mode, clear manual selections
  useEffect(() => {
    if (mode === 'auto') setSelected([]);
  }, [seatsNeeded, mode]);

  const toggleSeat = useCallback((n: number) => {
    setSelected(prev => {
      if (prev.includes(n)) return prev.filter(x => x !== n);
      if (prev.length >= seatsNeeded) return prev; // Already capped
      return [...prev, n];
    });
  }, [seatsNeeded]);

  const handleBook = async () => {
    if (!id || !isAuthenticated) { navigate('/login', { state: { from: `/booking/${id}` } }); return; }

    try {
      const preferred = mode === 'manual' && selectedSeats.length === seatsNeeded
        ? selectedSeats : undefined;

      const booking = await bookSeats(id, seatsNeeded, preferred);
      setConfirmed(booking);
      // Refresh seat map after successful booking
      if (id) refreshTripDetail(id);
    } catch {
      // Error is in context — just scroll to it
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const trip = selectedTrip;

  if (detailLoading) return (
    <div className="page-wrap"><div className="container"><Spinner label="Loading trip…" /></div></div>
  );

  if (detailError || !trip) return (
    <div className="page-wrap"><div className="container" style={{ paddingTop: 32 }}>
      <ErrorBox message={detailError ?? 'Trip not found'} onRetry={() => id && fetchTripDetail(id)} />
      <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/')}>← Back to trips</button>
    </div></div>
  );

  const dep = new Date(trip.startTime);
  const pricePerSeat = trip.price;
  const total = pricePerSeat * seatsNeeded;
  const canBook = isAuthenticated && trip.availableSeats > 0 &&
    (mode === 'auto' || selectedSeats.length === seatsNeeded) &&
    !bookingLoading && !confirmed;

  /* ── Success screen ── */
  if (confirmed) {
    return (
      <div className="page-wrap">
        <div className="container">
          <div className="booking-success">
            <div className="booking-success__icon">🎉</div>
            <h2 className="booking-success__title">Booking Confirmed!</h2>
            <p style={{ color: 'var(--clr-text-2)', marginBottom: 6 }}>
              {trip.source} → {trip.destination} &nbsp;·&nbsp; {format(dep, 'dd MMM yyyy, HH:mm')}
            </p>
            <p style={{ color: 'var(--clr-text-2)', fontSize: 14, marginBottom: 14 }}>
              {confirmed.seatsBooked} seat{confirmed.seatsBooked !== 1 ? 's' : ''} &nbsp;·&nbsp; ₹{confirmed.totalAmount.toLocaleString()}
            </p>
            {confirmed.seatNumbers?.length > 0 && (
              <div className="booking-success__seats">
                {confirmed.seatNumbers.map(n => (
                  <span key={n} className="booking-success__seat-pill">Seat {n}</span>
                ))}
              </div>
            )}
            <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/bookings')}>View My Bookings →</button>
              <button className="btn btn-ghost" onClick={() => navigate('/')}>Book another trip</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main booking UI ── */
  return (
    <div className="booking-page">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, fontSize: 13, color: 'var(--clr-text-2)' }}>
          <Link to="/" style={{ color: 'var(--clr-text-3)' }}>Trips</Link>
          <span>›</span>
          <span>{trip.source} → {trip.destination}</span>
        </div>

        {/* Trip summary */}
        <div className="trip-info">
          <div className="trip-info__top">
            <div className="trip-info__route">
              <span className="trip-info__city">{trip.source}</span>
              <span className="trip-info__arrow">→</span>
              <span className="trip-info__city">{trip.destination}</span>
            </div>
            <div className="trip-info__stats">
              {[
                { label: 'Bus',      val: trip.busName },
                { label: 'Date',     val: format(dep, 'dd MMM yyyy') },
                { label: 'Departs',  val: format(dep, 'HH:mm'), amber: true },
                { label: 'Price',    val: `₹${trip.price} / seat`, amber: true },
              ].map(({ label, val, amber }) => (
                <div className="trip-info__stat" key={label}>
                  <span className="trip-info__stat-label">{label}</span>
                  <span className={`trip-info__stat-value${amber ? ' trip-info__stat-value--amber' : ''}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="trip-info__bottom">
            <span className="trip-info__seats-badge">
              {trip.availableSeats} / {trip.totalSeats} seats available
            </span>
            <span className="trip-info__poll-badge">
              <span className="trip-info__poll-dot" /> Live updates
            </span>
          </div>
        </div>

        {/* Error from booking */}
        {bookingError && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠</span>
            <div>
              <strong>Booking failed</strong>
              <p style={{ fontSize: 13, marginTop: 3 }}>{bookingError}</p>
            </div>
          </div>
        )}

        {trip.availableSeats === 0 ? (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>🚫</span>
            <div>
              <strong>Sold out</strong>
              <p style={{ fontSize: 13, marginTop: 3 }}>No seats available for this trip.</p>
            </div>
          </div>
        ) : (
          <div className="booking-page__grid">
            {/* Left — seat map */}
            <div>
              {/* Mode toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['auto', 'manual'] as const).map(m => (
                  <button
                    key={m}
                    className={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setMode(m); setSelected([]); }}
                  >
                    {m === 'auto' ? '⚡ Auto-assign' : '🎯 Pick seats'}
                  </button>
                ))}
              </div>

              {/* Seat count stepper */}
              <div className="seat-count-selector">
                <span className="seat-count-selector__label">Number of seats</span>
                <div className="seat-count-selector__controls">
                  <button
                    className="seat-count-btn"
                    onClick={() => setSeatsNeeded(n => Math.max(1, n - 1))}
                    disabled={seatsNeeded <= 1}
                  >−</button>
                  <span className="seat-count-selector__count">{seatsNeeded}</span>
                  <button
                    className="seat-count-btn"
                    onClick={() => setSeatsNeeded(n => Math.min(MAX_SEATS_PER_BOOKING, n + 1, trip.availableSeats))}
                    disabled={seatsNeeded >= Math.min(MAX_SEATS_PER_BOOKING, trip.availableSeats)}
                  >+</button>
                </div>
              </div>

              {/* Seat map (manual mode) */}
              {mode === 'manual' && seatMap.length > 0 && (
                <div className="card" style={{ padding: '20px 16px', marginTop: 8 }}>
                  <SeatMap
                    seatMap={seatMap}
                    selected={selectedSeats}
                    onToggle={toggleSeat}
                    maxSelect={seatsNeeded}
                    disabled={bookingLoading}
                  />
                </div>
              )}

              {mode === 'auto' && (
                <div className="alert alert-info" style={{ marginTop: 8 }}>
                  <span>⚡</span>
                  <span>Best available seats will be assigned automatically when you confirm.</span>
                </div>
              )}
            </div>

            {/* Right — summary panel */}
            <div>
              <div className="summary-panel">
                <h3 className="summary-panel__title">Booking summary</h3>

                <div className="summary-row">
                  <span>Route</span>
                  <span className="summary-row__val">{trip.source} → {trip.destination}</span>
                </div>
                <div className="summary-row">
                  <span>Departure</span>
                  <span className="summary-row__val" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {format(dep, 'dd MMM, HH:mm')}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Seats</span>
                  <span className="summary-row__val">{seatsNeeded}</span>
                </div>
                <div className="summary-row">
                  <span>Price per seat</span>
                  <span className="summary-row__val">₹{pricePerSeat}</span>
                </div>

                {mode === 'manual' && selectedSeats.length > 0 && (
                  <div className="summary-row">
                    <span>Selected</span>
                    <span className="summary-row__val" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {selectedSeats.sort((a,b) => a-b).join(', ')}
                    </span>
                  </div>
                )}

                <div className="summary-total">
                  <span className="summary-total__label">Total</span>
                  <span className="summary-total__amount">₹{total.toLocaleString()}</span>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginTop: 20 }}
                  disabled={!canBook}
                  onClick={handleBook}
                >
                  {bookingLoading
                    ? 'Confirming…'
                    : !isAuthenticated
                    ? 'Sign in to Book'
                    : mode === 'manual' && selectedSeats.length < seatsNeeded
                    ? `Select ${seatsNeeded - selectedSeats.length} more seat${seatsNeeded - selectedSeats.length !== 1 ? 's' : ''}`
                    : `Confirm ${seatsNeeded} Seat${seatsNeeded !== 1 ? 's' : ''} →`}
                </button>

                {!isAuthenticated && (
                  <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--clr-text-3)' }}>
                    <Link to={`/login`} state={{ from: `/booking/${id}` }} style={{ color: 'var(--clr-amber)' }}>
                      Sign in
                    </Link>{' '}or{' '}
                    <Link to="/register" style={{ color: 'var(--clr-amber)' }}>register</Link> to book
                  </p>
                )}

                <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--clr-text-3)', fontFamily: 'var(--font-mono)' }}>
                  🔒 Secured · Instant confirmation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}