import { format } from 'date-fns';
import { StatusBadge } from '../../Tools/common';
import type { Booking, Trip } from '../../types';
import './BookingCard.css';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  cancellingId?: string;
}

export function BookingCard({ booking, onCancel, cancellingId }: BookingCardProps) {
  const trip = booking.trip as Trip;
  const isCancelling = cancellingId === booking._id;

  // trip may be a populated object or just a string id
  const tripName   = typeof trip === 'object' ? `${trip.source} → ${trip.destination}` : '—';
  const busName    = typeof trip === 'object' ? trip.busName : '—';
  const depTime    = typeof trip === 'object' ? format(new Date(trip.startTime), 'dd MMM yy, HH:mm') : '—';
  const price      = typeof trip === 'object' ? trip.price : 0;

  const canCancel = booking.status === 'CONFIRMED' && onCancel;

  return (
    <div className="card booking-card">
      <div className="booking-card__left">
        <div className="booking-card__route">
          {typeof trip === 'object'
            ? <>{trip.source} <span>→</span> {trip.destination}</>
            : '—'}
        </div>

        <div className="booking-card__meta">
          <div className="booking-card__meta-item">
            <span className="booking-card__meta-label">Bus</span>
            <span className="booking-card__meta-value">{busName}</span>
          </div>
          <div className="booking-card__meta-item">
            <span className="booking-card__meta-label">Departure</span>
            <span className="booking-card__meta-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{depTime}</span>
          </div>
          <div className="booking-card__meta-item">
            <span className="booking-card__meta-label">Seats</span>
            <span className="booking-card__meta-value">{booking.seatsBooked}</span>
          </div>
          <div className="booking-card__meta-item">
            <span className="booking-card__meta-label">Booked on</span>
            <span className="booking-card__meta-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {format(new Date(booking.createdAt), 'dd MMM yy')}
            </span>
          </div>
        </div>

        {/* Seat numbers */}
        {booking.seatNumbers?.length > 0 && (
          <div className="booking-card__seats">
            <span style={{ fontSize: 11, color: 'var(--clr-text-3)', fontFamily: 'var(--font-mono)', marginRight: 2 }}>SEATS</span>
            {booking.seatNumbers.map(n => (
              <span key={n} className="booking-card__seat-pill">{n}</span>
            ))}
          </div>
        )}

        {/* Failure reason */}
        {booking.status === 'FAILED' && booking.failureReason && (
          <p style={{ fontSize: 12, color: 'var(--clr-red)', marginTop: 8 }}>
            ✕ {booking.failureReason}
          </p>
        )}
      </div>

      <div className="booking-card__right">
        <StatusBadge status={booking.status} />
        <span className="booking-card__amount">₹{booking.totalAmount.toLocaleString()}</span>
        {canCancel && (
          <button
            className="btn btn-danger btn-sm"
            disabled={isCancelling}
            onClick={() => onCancel(booking._id)}
          >
            {isCancelling ? 'Cancelling…' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
}