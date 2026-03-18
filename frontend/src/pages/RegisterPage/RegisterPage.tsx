import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../LoginPage/LoginPage.css';

interface FormState { name: string; email: string; password: string; confirm: string }
interface Errors    { name?: string; email?: string; password?: string; confirm?: string; api?: string }

export function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState<FormState>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]     = useState<Errors>({});
  const [submitting, setSub]    = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: undefined, api: undefined }));
  };

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Enter a valid email.';
    if (!form.password || form.password.length < 6)
      errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm)
      errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSub(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      setErrors(er => ({ ...er, api: (err as Error).message }));
    } finally {
      setSub(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo__icon">B</div>
          <span className="auth-logo__name">Bus<span>Go</span></span>
        </Link>

        <div className="card">
          <div className="auth-card__head">
            <h2 className="auth-card__title">Create account</h2>
            <p className="auth-card__sub">Join BusGo to start booking trips</p>
          </div>

          <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
            {errors.api && (
              <div className="alert alert-error"><span>⚠</span><span>{errors.api}</span></div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className={`form-input${errors.name ? ' is-error' : ''}`}
                placeholder="Jane Doe"
                value={form.name}
                onChange={set('name')}
                autoFocus
              />
              {errors.name && <span className="form-error">⚠ {errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className={`form-input${errors.email ? ' is-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className={`form-input${errors.password ? ' is-error' : ''}`}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
              />
              {errors.password && <span className="form-error">⚠ {errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                className={`form-input${errors.confirm ? ' is-error' : ''}`}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={set('confirm')}
                autoComplete="new-password"
              />
              {errors.confirm && <span className="form-error">⚠ {errors.confirm}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
              style={{ marginTop: 4 }}
            >
              {submitting ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <div className="auth-card__foot">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}