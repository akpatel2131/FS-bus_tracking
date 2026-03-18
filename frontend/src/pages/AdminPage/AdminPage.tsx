import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import { EmptyState, ErrorBox, PageHeader, Spinner } from '../../Tools/common';
import type { CreateTripPayload } from '../../types';
import './AdminPage.css';

interface FormState {
  busName: string; source: string; destination: string;
  startTime: string; totalSeats: string; price: string;
}
interface FormErrors {
  busName?: string; source?: string; destination?: string;
  startTime?: string; totalSeats?: string; price?: string; api?: string;
}

const EMPTY: FormState = { busName: '', source: '', destination: '', startTime: '', totalSeats: '40', price: '' };

export function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    trips, tripsLoading, tripsError, fetchTrips,
    createTrip, deleteTrip,
    adminBookings, adminBookingsLoading, fetchAdminBookings,
  } = useTrips();

  const [form, setForm]       = useState<FormState>(EMPTY);
  const [errors, setErrors]   = useState<FormErrors>({});
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [tab, setTab]         = useState<'trips' | 'bookings'>('trips');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'admin') { navigate('/'); return; }
    if (trips.length === 0) fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (tab === 'bookings' && adminBookings.length === 0) fetchAdminBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const set = (f: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(v => ({ ...v, [f]: e.target.value }));
    setErrors(er => ({ ...er, [f]: undefined, api: undefined }));
    setSuccess('');
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.busName.trim())    errs.busName     = 'Bus name is required.';
    if (!form.source.trim())     errs.source      = 'Source city is required.';
    if (!form.destination.trim()) errs.destination = 'Destination is required.';
    if (!form.startTime)         errs.startTime   = 'Start time is required.';
    else if (new Date(form.startTime) <= new Date()) errs.startTime = 'Start time must be in the future.';
    const seats = parseInt(form.totalSeats);
    if (isNaN(seats) || seats < 1 || seats > 100) errs.totalSeats = 'Seats must be 1–100.';
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0)  errs.price = 'Enter a valid price.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSuccess('');
    try {
      const payload: CreateTripPayload = {
        busName:     form.busName.trim(),
        source:      form.source.trim(),
        destination: form.destination.trim(),
        startTime:   new Date(form.startTime).toISOString(),
        totalSeats:  parseInt(form.totalSeats),
        price:       parseFloat(form.price),
      };
      const trip = await createTrip(payload);
      setSuccess(`✓ Trip "${trip.busName}" created successfully!`);
      setForm(EMPTY);
    } catch (err) {
      setErrors(er => ({ ...er, api: (err as Error).message }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete trip "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteTrip(id);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  // Minimum datetime for the date picker (now)
  const minDateTime = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString().slice(0, 16);

  return (
    <div className="page-wrap admin-page">
      <div className="container">
        <PageHeader
          title="Admin Panel"
          subtitle="Manage trips and view all bookings"
          action={
            <span className="badge badge-info">
              ⚙ {user?.name}
            </span>
          }
        />

        <div className="admin-grid">
          {/* ── Create trip form ── */}
          <div className="create-form">
            <div className="create-form__header">
              <h3 className="create-form__title">Create new trip</h3>
              <p className="create-form__sub">All fields required</p>
            </div>

            <form className="create-form__body" onSubmit={handleCreate} noValidate>
              {errors.api && (
                <div className="alert alert-error"><span>⚠</span><span>{errors.api}</span></div>
              )}
              {success && (
                <div className="alert alert-success"><span>✓</span><span>{success}</span></div>
              )}

              <div className="form-group">
                <label className="form-label">Bus Name</label>
                <input className={`form-input${errors.busName ? ' is-error' : ''}`}
                  placeholder="e.g. Sharma Travels Express"
                  value={form.busName} onChange={set('busName')} />
                {errors.busName && <span className="form-error">⚠ {errors.busName}</span>}
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">From</label>
                  <input className={`form-input${errors.source ? ' is-error' : ''}`}
                    placeholder="Mumbai"
                    value={form.source} onChange={set('source')} />
                  {errors.source && <span className="form-error">⚠ {errors.source}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">To</label>
                  <input className={`form-input${errors.destination ? ' is-error' : ''}`}
                    placeholder="Pune"
                    value={form.destination} onChange={set('destination')} />
                  {errors.destination && <span className="form-error">⚠ {errors.destination}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Departure Date & Time</label>
                <input type="datetime-local" className={`form-input${errors.startTime ? ' is-error' : ''}`}
                  min={minDateTime}
                  value={form.startTime} onChange={set('startTime')} />
                {errors.startTime && <span className="form-error">⚠ {errors.startTime}</span>}
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Total Seats</label>
                  <input type="number" className={`form-input${errors.totalSeats ? ' is-error' : ''}`}
                    min={1} max={100}
                    value={form.totalSeats} onChange={set('totalSeats')} />
                  {errors.totalSeats && <span className="form-error">⚠ {errors.totalSeats}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹ / seat)</label>
                  <input type="number" className={`form-input${errors.price ? ' is-error' : ''}`}
                    min={0} placeholder="350"
                    value={form.price} onChange={set('price')} />
                  {errors.price && <span className="form-error">⚠ {errors.price}</span>}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={saving} style={{ marginTop: 4 }}>
                {saving ? 'Creating…' : '+ Create Trip'}
              </button>
            </form>
          </div>

          {/* ── Right panel ── */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['trips', 'bookings'] as const).map(t => (
                <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTab(t)}>
                  {t === 'trips' ? '🚌 All Trips' : '📋 All Bookings'}
                </button>
              ))}
            </div>

            {/* Trips tab */}
            {tab === 'trips' && (
              <>
                <div className="admin-trips-header">
                  <span className="admin-trips-header__title">
                    Trips ({trips.length})
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => fetchTrips()}>↻</button>
                </div>

                {tripsLoading && <Spinner label="Loading trips…" />}
                {!tripsLoading && tripsError && <ErrorBox message={tripsError} onRetry={fetchTrips} />}
                {!tripsLoading && !tripsError && trips.length === 0 && (
                  <EmptyState icon="🚌" title="No trips yet" desc="Create your first trip using the form." />
                )}
                {!tripsLoading && trips.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {trips.map(trip => (
                      <div key={trip._id} className="admin-trip-row">
                        <div className="admin-trip-row__info">
                          <div className="admin-trip-row__route">
                            {trip.source} → {trip.destination}
                          </div>
                          <div className="admin-trip-row__meta">
                            {trip.busName} &nbsp;·&nbsp;
                            {format(new Date(trip.startTime), 'dd MMM yy, HH:mm')} &nbsp;·&nbsp;
                            {trip.availableSeats}/{trip.totalSeats} seats &nbsp;·&nbsp;
                            ₹{trip.price}
                          </div>
                        </div>
                        <div className="admin-trip-row__actions">
                          <span className={`badge ${trip.availableSeats === 0 ? 'badge-failed' : 'badge-confirmed'}`}>
                            {trip.availableSeats === 0 ? 'Full' : 'Open'}
                          </span>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={deleting === trip._id}
                            onClick={() => handleDelete(trip._id, trip.busName)}
                          >
                            {deleting === trip._id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Bookings tab */}
            {tab === 'bookings' && (
              <>
                <div className="admin-trips-header">
                  <span className="admin-trips-header__title">
                    All Bookings ({adminBookings.length})
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={fetchAdminBookings}>↻</button>
                </div>

                {adminBookingsLoading && <Spinner label="Loading bookings…" />}
                {!adminBookingsLoading && adminBookings.length === 0 && (
                  <EmptyState icon="📋" title="No bookings yet" />
                )}
                {!adminBookingsLoading && adminBookings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {adminBookings.map(b => {
                      const trip = b.trip as import('../../types').Trip;
                      const user = b.user as import('../../types').User;
                      return (
                        <div key={b._id} className="admin-trip-row">
                          <div className="admin-trip-row__info">
                            <div className="admin-trip-row__route">
                              {typeof trip === 'object' ? `${trip.source} → ${trip.destination}` : '—'}
                            </div>
                            <div className="admin-trip-row__meta">
                              {typeof user === 'object' ? user.name : '—'} &nbsp;·&nbsp;
                              {b.seatsBooked} seat{b.seatsBooked !== 1 ? 's' : ''} &nbsp;·&nbsp;
                              ₹{b.totalAmount} &nbsp;·&nbsp;
                              {format(new Date(b.createdAt), 'dd MMM yy')}
                            </div>
                          </div>
                          <span className={`badge badge-${b.status.toLowerCase()}`}>
                            {b.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}