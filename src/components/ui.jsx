// Small UI building blocks (no UI library).
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CircleAlert, CircleCheck, Eye, EyeOff, Info, Lock, Star, TriangleAlert, X } from 'lucide-react';

export function Spinner({ small, white }) {
  return <span className={`spinner ${small ? 'spinner-sm' : ''} ${white ? 'spinner-white' : ''}`} role="status" aria-label="Loading" />;
}

export function LoadingPage() {
  return <div className="loading-page"><Spinner /></div>;
}

export function Skeleton({ height = 120, count = 1 }) {
  return Array.from({ length: count }).map((_, i) => <div key={i} className="skeleton" style={{ height }} />);
}

const ALERT_ICONS = { info: Info, success: CircleCheck, warn: TriangleAlert, error: CircleAlert };
export function Alert({ type = 'info', icon, children, action, onClose, className = '' }) {
  const Icon = icon || ALERT_ICONS[type];
  return (
    <div className={`alert alert-${type} ${className}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={20} />
      <div className="alert-body">{children}</div>
      {action}
      {onClose && <button className="link-btn" onClick={onClose} aria-label="Dismiss"><X size={18} /></button>}
    </div>
  );
}

export function Stars({ value = 0, size = 16 }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(rounded) ? 'on' : ''} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, size = 32 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-input" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={n <= (hover || value) ? 'on' : ''} onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-checked={value === n} role="radio">
          <Star size={size} fill="currentColor" strokeWidth={0} />
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, actions, width }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={width ? { maxWidth: width } : undefined}>
        {title && <h3 className="mb-sm">{title}</h3>}
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Confirm', danger, onClose, onConfirm, busy }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      actions={<>
        <button className="btn btn-outline" onClick={onClose}>Go back</button>
        <button className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
          {busy && <Spinner small white />}{confirmLabel}
        </button>
      </>}>
      <p className="muted">{text}</p>
    </Modal>
  );
}

export function Tabs({ value, onChange, tabs }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(([key, label]) => (
        <button key={key} role="tab" aria-selected={value === key} className={`tab ${value === key ? 'active' : ''}`} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ steps, active }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s} className={`step ${i < active ? 'done' : i === active ? 'active' : ''}`}>
          <span className="step-dot">{i < active ? <CircleCheck size={16} /> : i + 1}</span>
          {s}
        </div>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, title, children, action }) {
  return (
    <div className="empty">
      {Icon && <Icon size={52} strokeWidth={1.5} />}
      <h3>{title}</h3>
      {children && <p className="muted mt-sm">{children}</p>}
      {action && <div className="mt">{action}</div>}
    </div>
  );
}

export function IconTile({ icon: Icon, size = 44, color, bg }) {
  return (
    <span className="tile" style={{ width: size, height: size, color, background: bg }}>
      <Icon size={Math.round(size * 0.48)} />
    </span>
  );
}

export function Stat({ icon, label, value, warn }) {
  return (
    <div className={`card stat ${warn ? 'card-warn' : ''}`}>
      <IconTile icon={icon} bg={warn ? 'var(--orange-bg)' : undefined} color={warn ? 'var(--orange)' : undefined} />
      <div>
        <div className="stat-value">{value ?? '–'}</div>
        <div className="small muted">{label}</div>
      </div>
    </div>
  );
}

export function Field({ label, required, help, error, children, htmlFor }) {
  return (
    <div className="field">
      {label && <label htmlFor={htmlFor}>{label}{required && <span className="req">*</span>}</label>}
      {children}
      {error ? <span className="help error">{error}</span> : help && <span className="help">{help}</span>}
    </div>
  );
}

export function Switch({ checked, onChange, children }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-track" />
      {children}
    </label>
  );
}

/* ---------- Toasts ---------- */
const ToastContext = createContext(() => {});
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'success') => setToast({ message, type, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`} role="status">
          {toast.type === 'error' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
          {toast.message}
          <button onClick={() => setToast(null)} aria-label="Dismiss"><X size={16} /></button>
        </div>
      )}
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

export function PasswordInput({ id, value, onChange, autoComplete, minLength, required = true }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrap">
      <span className="input-icon"><Lock size={18} /></span>
      <input id={id} className="input has-end" type={show ? 'text' : 'password'} value={value} onChange={onChange}
        autoComplete={autoComplete} minLength={minLength} required={required} />
      <span className="input-end">
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </div>
  );
}

export function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="input-wrap">
      <span className="input-icon"><Icon size={18} /></span>
      <input className="input" {...props} />
    </div>
  );
}
