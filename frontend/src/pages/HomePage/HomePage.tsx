import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripCard } from '../../components/TripCard/TripCard';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import { EmptyState, ErrorBox, Spinner } from '../../Tools/Common';
import './HomePage.css';

export function HomePage() {
  const { trips, tripsLoading, tripsError, pagination, filters,
          fetchTrips, setFilters } = useTrips();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [localSource, setLocalSource] = useState(filters.source);
  const [localDest,   setLocalDest]   = useState(filters.destination);
  const [localDate,   setLocalDate]   = useState(filters.date);

  // Fetch on mount only if trips list is empty (avoids re-fetch on back navigation)
  useEffect(() => {
    if (trips.length === 0) fetchTrips(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(() => {
    const f = { source: localSource.trim(), destination: localDest.trim(), date: localDate };
    setFilters(f);
    fetchTrips(f);
  }, [localSource, localDest, localDate, setFilters, fetchTrips]);

  const handleClear = () => {
    setLocalSource(''); setLocalDest(''); setLocalDate('');
    const f = { source: '', destination: '', date: '' };
    setFilters(f);
    fetchTrips(f);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const hasFilters = localSource || localDest || localDate;

  return (
    <div className="page-wrap">
      {/* Hero */}
      <div className="home-hero">
        <div className="container">
          <p className="home-hero__eyebrow">● Live availability</p>
          <h1 className="home-hero__title">
            Book your bus<br />ticket in <span>seconds</span>
          </h1>
          <p className="home-hero__sub">
            Browse available trips, pick your seats, and confirm your booking instantly.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Filter bar */}
        <div className="filter-bar">
          <div className="form-group">
            <label className="form-label">From</label>
            <input
              className="form-input"
              placeholder="e.g. Mumbai"
              value={localSource}
              onChange={e => setLocalSource(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <input
              className="form-input"
              placeholder="e.g. Pune"
              value={localDest}
              onChange={e => setLocalDest(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={localDate}
              onChange={e => setLocalDate(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }} className="filter-bar__btn">
            <button className="btn btn-primary" onClick={handleSearch} disabled={tripsLoading}>
              {tripsLoading ? '…' : 'Search'}
            </button>
            {hasFilters && (
              <button className="btn btn-ghost" onClick={handleClear} title="Clear filters">✕</button>
            )}
          </div>
        </div>

        {/* Stats */}
        {!tripsLoading && trips.length > 0 && (
          <div className="stats-strip">
            <div className="stats-strip__item">
              <span className="stats-strip__val">{pagination?.total ?? trips.length}</span>
              <span className="stats-strip__label">Trips available</span>
            </div>
            <div className="stats-strip__item">
              <span className="stats-strip__val">
                {trips.reduce((s, t) => s + t.availableSeats, 0).toLocaleString()}
              </span>
              <span className="stats-strip__label">Seats open</span>
            </div>
            <div className="stats-strip__item">
              <span className="stats-strip__val">
                ₹{Math.min(...trips.map(t => t.price))}
              </span>
              <span className="stats-strip__label">Lowest fare</span>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="trips-section__header">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
            {hasFilters ? 'Search results' : 'Available trips'}
          </h2>
          {trips.length > 0 && (
            <span className="trips-section__count">{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* States */}
        {tripsLoading && <Spinner label="Finding trips…" />}

        {!tripsLoading && tripsError && (
          <ErrorBox message={tripsError} onRetry={() => fetchTrips(filters)} />
        )}

        {!tripsLoading && !tripsError && trips.length === 0 && (
          <EmptyState
            icon="🚌"
            title="No trips found"
            desc={hasFilters ? 'Try adjusting your search filters.' : 'No trips available right now.'}
            action={hasFilters ? { label: 'Clear filters', onClick: handleClear } : undefined}
          />
        )}

        {!tripsLoading && !tripsError && trips.length > 0 && (
          <>
            <div className="grid-auto">
              {trips.map(trip => (
                <TripCard key={trip._id} trip={trip} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36, flexWrap: 'wrap' }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`btn btn-sm ${page === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => fetchTrips(filters, page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA for non-logged-in users */}
        {!isAuthenticated && trips.length > 0 && (
          <div style={{
            marginTop: 40, padding: '28px 24px',
            background: 'var(--clr-amber-dim)',
            border: '1px solid var(--clr-amber-ring)',
            borderRadius: 'var(--r-lg)',
            textAlign: 'center',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
              Ready to book?
            </h3>
            <p style={{ color: 'var(--clr-text-2)', marginBottom: 18, fontSize: 14 }}>
              Create a free account to book seats and manage your trips.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Create account →
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/login')}>
                Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}