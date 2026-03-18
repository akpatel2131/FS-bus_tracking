import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { AdminPage } from './pages/AdminPage/AdminPage';
import { BookingPage } from './pages/BookingPage/BookingPage';
import { HomePage } from './pages/HomePage/HomePage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { MyBookingsPage } from './pages/MyBookingsPage/MyBookingsPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';

// Route guard — redirects unauthenticated users to /login
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

// Admin-only guard
function RequireAdmin({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/booking/:id" element={<BookingPage />} />

        {/* Protected — any logged-in user */}
        <Route path="/bookings" element={
          <RequireAuth><MyBookingsPage /></RequireAuth>
        } />

        {/* Protected — admin only */}
        <Route path="/admin" element={
          <RequireAuth>
            <RequireAdmin><AdminPage /></RequireAdmin>
          </RequireAuth>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <AppRoutes />
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}