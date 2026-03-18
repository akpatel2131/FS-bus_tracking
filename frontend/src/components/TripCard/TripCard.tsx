import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '../../types';
import './TripCard.css';

interface TripCardProps {
  trip: Trip;
  hideAction?: boolean;
}

export function TripCard({ trip, hideAction = false }: TripCardProps) {
  const navigate = useNavigate();

  const pct   = Math.round(((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100);
  const isFull    = trip.availableSeats === 0;
  const almostFull = !isFull && trip.availableSeats <= 5;
  const seatsColor = isFull ? 'red' : almostFull ? 'amber' : 'green';
  const barColor   = isFull ? 'var(--clr-red)' : almostFull ? 'var(--clr-amber)' : 'var(--clr-teal)';

  const dep = new Date(trip.startTime);

  return (
    <div
      className={`card card-hover trip-card${isFull ? ' trip-card--soldout' : ''}`}
      onClick={() => navigate(`/booking/${trip._id}`)}
    >
      {/* Route + price */}
      <div className="trip-card__header">
        <div className="trip-card__route">
          <div className="trip-card__city">
            <span className="trip-card__dot" />
            <span className="trip-card__city-name">{trip.source}</span>
          </div>
          <div className="trip-card__arrow">
            <div className="trip-card__line" />
            <span className="trip-card__arrow-icon">→</span>
            <div className="trip-card__line" />
          </div>
          <div className="trip-card__city">
            <span className="trip-card__dot trip-card__dot--dest" />
            <span className="trip-card__city-name">{trip.destination}</span>
          </div>
        </div>

        <div className="trip-card__price">
          <span className="trip-card__price-amount">₹{trip.price}</span>
          <span className="trip-card__price-label">per seat</span>
        </div>
      </div>

      <div className="divider trip-card__divider" />

      {/* Details */}
      <div className="trip-card__details">
        <div className="trip-card__detail">
          <span className="trip-card__detail-label">Bus</span>
          <span className="trip-card__detail-value">{trip.busName}</span>
        </div>
        <div className="trip-card__detail">
          <span className="trip-card__detail-label">Date</span>
          <span className="trip-card__detail-value trip-card__detail-value--time">
            {format(dep, 'dd MMM yy')}
          </span>
        </div>
        <div className="trip-card__detail">
          <span className="trip-card__detail-label">Departs</span>
          <span className="trip-card__detail-value trip-card__detail-value--time">
            {format(dep, 'HH:mm')}
          </span>
        </div>
        <div className="trip-card__detail">
          <span className="trip-card__detail-label">Seats left</span>
          <span className={`trip-card__detail-value trip-card__detail-value--${seatsColor}`}>
            {isFull ? 'Sold out' : `${trip.availableSeats} / ${trip.totalSeats}`}
          </span>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="trip-card__occ">
        <div className="trip-card__occ-track">
          <div
            className="trip-card__occ-fill"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <span className="trip-card__occ-label">{pct}% full</span>
      </div>

      {/* CTA */}
      {!hideAction && (
        <div className="trip-card__footer">
          {isFull ? (
            <button className="btn btn-secondary btn-full" disabled>Sold Out</button>
          ) : (
            <button
              className="btn btn-primary btn-full"
              onClick={(e) => { e.stopPropagation(); navigate(`/booking/${trip._id}`); }}
            >
              View Seats →
            </button>
          )}
        </div>
      )}
    </div>
  );
}