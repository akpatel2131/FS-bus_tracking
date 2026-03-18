import React from 'react';
import './Common.css';

/* ─── Spinner ────────────────────────────────────────────────────────────── */

interface SpinnerProps { label?: string; small?: boolean }

export function Spinner({ label = 'Loading...', small = false }: SpinnerProps) {
  if (small) return <div className="spinner spinner--sm" />;
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

/* ─── ErrorBox ───────────────────────────────────────────────────────────── */

interface ErrorBoxProps { message: string; onRetry?: () => void }

export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <div className="error-box">
      <div className="error-box__title">
        <span>⚠</span> Error
      </div>
      <p className="error-box__msg">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/* ─── EmptyState ─────────────────────────────────────────────────────────── */

interface EmptyStateProps {
  icon?: string;
  title: string;
  desc?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = '🔍', title, desc, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      {desc && <p className="empty-state__desc">{desc}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ─── PageHeader ─────────────────────────────────────────────────────────── */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

/* ─── StatusBadge ────────────────────────────────────────────────────────── */

type Status = 'PENDING' | 'CONFIRMED' | 'FAILED';

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { cls: string; icon: string; label: string }> = {
    CONFIRMED: { cls: 'badge-confirmed', icon: '✓', label: 'Confirmed' },
    PENDING:   { cls: 'badge-pending',   icon: '◎', label: 'Pending'   },
    FAILED:    { cls: 'badge-failed',    icon: '✕', label: 'Failed'    },
  };
  const { cls, icon, label } = map[status];
  return <span className={`badge ${cls}`}>{icon} {label}</span>;
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}