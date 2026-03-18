import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [submitting, setSub]    = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, isLoading, navigate, from]);

  const validate = () => {
    if (!email.trim())        { setError('Email is required.');    return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email.'); return false; }
    if (!password)            { setError('Password is required.'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setSub(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSub(false);
    }
  };

  const fillUser  = () => { setEmail('alice@example.com');          setPassword('alice123');  setError(''); };
  const fillAdmin = () => { setEmail('admin@ticketbooking.com'); setPassword('Admin@123'); setError(''); };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo__icon">B</div>
          <span className="auth-logo__name">Bus<span>Go</span></span>
        </Link>

        <div className="card">
          <div className="auth-card__head">
            <h2 className="auth-card__title">Welcome back</h2>
            <p className="auth-card__sub">Sign in to book your seats</p>
          </div>

          {/* Quick fill buttons (demo) */}
          <div className="auth-card__demo">
            <span className="auth-card__demo-label">Quick fill:</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={fillUser}>👤 User</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={fillAdmin}>⚙ Admin</button>
          </div>

          <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="alert alert-error">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`form-input${error && !email ? ' is-error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`form-input${error && !password ? ' is-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
              style={{ marginTop: 4 }}
            >
              {submitting ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-card__foot">
            No account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}