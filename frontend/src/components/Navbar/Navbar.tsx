import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const active = (path: string) =>
    location.pathname === path ? 'navbar__link navbar__link--active' : 'navbar__link';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
            <div className="navbar__logo-icon">B</div>
            <span className="navbar__logo-name">Bus<span>Go</span></span>
          </Link>

          {/* Desktop links */}
          <div className="navbar__links">
            <Link to="/" className={active('/')}>Trips</Link>
            {isAuthenticated && (
              <Link to="/bookings" className={active('/bookings')}>My Bookings</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className={`${active('/admin')} navbar__link--admin`}>
                ⚙ Admin
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="navbar__right">
            {isAuthenticated ? (
              <>
                <span className="navbar__user-name">{user?.name}</span>
                {user?.role === 'admin' && (
                  <span className="navbar__role-badge">ADMIN</span>
                )}
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-ghost btn-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}

            {/* Hamburger */}
            <button
              className="navbar__hamburger"
              onClick={() => setOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span className={`navbar__bar ${open ? 'navbar__bar--open-1' : ''}`} />
              <span className={`navbar__bar ${open ? 'navbar__bar--open-2' : ''}`} />
              <span className={`navbar__bar ${open ? 'navbar__bar--open-3' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="navbar__mobile">
          <Link to="/" className="navbar__mobile-link" onClick={() => setOpen(false)}>Trips</Link>
          {isAuthenticated && (
            <Link to="/bookings" className="navbar__mobile-link" onClick={() => setOpen(false)}>
              My Bookings
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar__mobile-link navbar__mobile-link--amber" onClick={() => setOpen(false)}>
              ⚙ Admin Panel
            </Link>
          )}
          {isAuthenticated ? (
            <button
              className="navbar__mobile-link navbar__mobile-link--danger"
              style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: '11px 4px', fontSize: 15 }}
              onClick={handleLogout}
            >
              Sign out
            </button>
          ) : (
            <>
              <Link to="/login"    className="navbar__mobile-link" onClick={() => setOpen(false)}>Sign in</Link>
              <Link to="/register" className="navbar__mobile-link navbar__mobile-link--amber" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}