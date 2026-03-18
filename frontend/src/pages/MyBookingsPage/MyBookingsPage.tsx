import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingCard } from '../../components/BookingCard/BookingCard';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import { EmptyState, ErrorBox, PageHeader, Spinner } from '../../Tools/common';
import type { BookingStatus } from '../../types';
import './MyBookingsPage.css';

const STATUS_FILTERS: { label: string; value: BookingStatus | 'ALL' }[] = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Pending',   value: 'PENDING'   },
  { label: 'Failed',    value: 'FAILED'    },
];

export function MyBookingsPage() {
  const { myBookings, bookingsLoading, bookingsError, fetchMyBookings, cancelBooking } = useTrips();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError,  setCancelError]  = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { state: { from: '/bookings' } }); return; }
    // Only fetch if list is empty (avoids re-fetch on tab switch)
    if (myBookings.length === 0) fetchMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this booking and release your seats?')) return;
    setCancellingId(id);
    setCancelError('');
    try {
      await cancelBooking(id);
    } catch (err) {
      setCancelError((err as Error).message);
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = activeFilter === 'ALL'
    ? myBookings
    : myBookings.filter(b => b.status === activeFilter);

  const confirmed  = myBookings.filter(b => b.status === 'CONFIRMED').length;
  const totalSpend = myBookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div className="page-wrap my-bookings-page">
      <div className="container">
        <PageHeader
          title="My Bookings"
          subtitle="Track and manage all your trip reservations"
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => fetchMyBookings()}>
              ↻ Refresh
            </button>
          }
        />

        {/* Summary strip */}
        {myBookings.length > 0 && (
          <div className="bookings-summary">
            <div className="bookings-summary__item">
              <span className="bookings-summary__val">{myBookings.length}</span>
              <span className="bookings-summary__label">Total bookings</span>
            </div>
            <div className="bookings-summary__item">
              <span className="bookings-summary__val" style={{ color: 'var(--clr-green)' }}>{confirmed}</span>
              <span className="bookings-summary__label">Confirmed</span>
            </div>
            <div className="bookings-summary__item">
              <span className="bookings-summary__val" style={{ color: 'var(--clr-amber)' }}>
                ₹{totalSpend.toLocaleString()}
              </span>
              <span className="bookings-summary__label">Total spent</span>
            </div>
          </div>
        )}

        {/* Status filter tabs */}
        <div className="bookings-filter">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`btn btn-sm ${activeFilter === f.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
              {f.value !== 'ALL' && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  background: 'rgba(255,255,255,.1)',
                  padding: '1px 5px', borderRadius: 3, marginLeft: 2,
                }}>
                  {myBookings.filter(b => b.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {cancelError && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>⚠</span><span>{cancelError}</span>
          </div>
        )}

        {bookingsLoading && <Spinner label="Loading bookings…" />}

        {!bookingsLoading && bookingsError && (
          <ErrorBox message={bookingsError} onRetry={fetchMyBookings} />
        )}

        {!bookingsLoading && !bookingsError && filtered.length === 0 && (
          <EmptyState
            icon="🎟"
            title="No bookings yet"
            desc="Book a trip to see your reservations here."
            action={{ label: 'Browse trips →', onClick: () => navigate('/') }}
          />
        )}

        {!bookingsLoading && !bookingsError && filtered.length > 0 && (
          <div className="bookings-list">
            {filtered.map(b => (
              <BookingCard
                key={b._id}
                booking={b}
                onCancel={handleCancel}
                cancellingId={cancellingId ?? undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}