// Small UI building blocks. Form controls, dialogs and pop-up messages use Material UI
// (like AFC); icons come from react-icons.
import { createContext, forwardRef, useCallback, useContext, useState } from 'react';
import MuiAlert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Rating from '@mui/material/Rating';
import MuiSwitch from '@mui/material/Switch';
import MuiTab from '@mui/material/Tab';
import MuiTabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import CustomSnackbar from './CustomSnackbar.jsx';
import { InlineLoader } from './LoadingSpinner.jsx';
import {
  LuCircleAlert as CircleAlert,
  LuCircleCheck as CircleCheck,
  LuEye as Eye,
  LuEyeOff as EyeOff,
  LuInfo as Info,
  LuLock as Lock,
  LuStar as Star,
  LuTriangleAlert as TriangleAlert,
  LuX as X,
} from 'react-icons/lu';

export function Spinner({ small, white }) {
  return <CircularProgress size={small ? 16 : 34} thickness={small ? 5 : 4} color={white ? 'inherit' : 'primary'} aria-label="Loading" />;
}

export function LoadingPage({ text }) {
  return <InlineLoader text={text} />;
}

export function Skeleton({ height = 120, count = 1 }) {
  return Array.from({ length: count }).map((_, i) => <div key={i} className="skeleton" style={{ height }} />);
}

const ALERT_ICONS = { info: Info, success: CircleCheck, warn: TriangleAlert, error: CircleAlert };
const SEVERITY = { info: 'info', success: 'success', warn: 'warning', error: 'error' };
export function Alert({ type = 'info', icon, children, action, onClose, className = '' }) {
  const Icon = icon || ALERT_ICONS[type];
  return (
    <MuiAlert severity={SEVERITY[type] || 'info'} icon={<Icon size={20} />} className={`alert alert-${type} ${className}`}
      onClose={onClose} action={action} role={type === 'error' ? 'alert' : 'status'} variant="standard">
      {children}
    </MuiAlert>
  );
}

const star = (size) => <Star size={size} fill="currentColor" strokeWidth={0} />;

export function Stars({ value = 0, size = 16 }) {
  return (
    <Rating className="stars" value={Number(value) || 0} precision={0.5} readOnly size="small"
      icon={star(size)} emptyIcon={<Star size={size} fill="currentColor" strokeWidth={0} style={{ opacity: 0.25 }} />}
      aria-label={`${value} out of 5 stars`} sx={{ verticalAlign: 'middle' }} />
  );
}

export function StarInput({ value, onChange, size = 32, name = 'rating' }) {
  return (
    <Rating className="star-input" name={name} value={value || null} onChange={(_, v) => v && onChange(v)}
      icon={star(size)} emptyIcon={<Star size={size} fill="currentColor" strokeWidth={0} style={{ opacity: 0.25 }} />}
      sx={{ gap: 0.5 }} />
  );
}

export function Modal({ open, onClose, title, children, actions, width = 560 }) {
  return (
    <Dialog open={Boolean(open)} onClose={() => onClose?.()} fullWidth maxWidth={false}
      slotProps={{ paper: { sx: { maxWidth: width, m: 2, width: 'calc(100% - 32px)' } } }} aria-label={title}>
      {title && <DialogTitle sx={{ fontWeight: 800, pb: 1, pr: 6 }}>{title}</DialogTitle>}
      {onClose && (
        <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 10, top: 12 }}><X size={20} /></IconButton>
      )}
      <DialogContent sx={{ pt: title ? '4px !important' : 3 }}>{children}</DialogContent>
      {actions && <DialogActions className="modal-actions" sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>{actions}</DialogActions>}
    </Dialog>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Confirm', danger, onClose, onConfirm, busy }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={460}
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
    <MuiTabs value={value} onChange={(_, v) => onChange(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
      sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5, '& .MuiTab-root': { fontWeight: 600, minHeight: 48 } }}>
      {tabs.map(([key, label]) => <MuiTab key={key} value={key} label={label} className="tab" />)}
    </MuiTabs>
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
      <IconTile icon={icon} bg={warn ? 'var(--tint-amber)' : undefined} color={warn ? 'var(--on-amber)' : undefined} />
      <div>
        <div className="stat-value">{value ?? '–'}</div>
        <div className="small muted">{label}</div>
      </div>
    </div>
  );
}

/** Label + help text around a custom control (Material UI text fields carry their own label). */
export function Field({ label, required, help, error, children, htmlFor }) {
  return (
    <div className="field">
      {label && <label htmlFor={htmlFor}>{label}{required && <span className="req"> *</span>}</label>}
      {children}
      {error ? <span className="help error">{error}</span> : help && <span className="help">{help}</span>}
    </div>
  );
}

export function Switch({ checked, onChange, children }) {
  return (
    <FormControlLabel control={<MuiSwitch checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />}
      label={children} sx={{ ml: 0, '& .MuiFormControlLabel-label': { fontWeight: 500 } }} />
  );
}

export function CheckboxField({ id, checked, onChange, children }) {
  return (
    <FormControlLabel className="check-field"
      control={<Checkbox id={id} size="small" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />}
      label={children}
      sx={{ alignItems: 'flex-start', m: 0, gap: 1.25,
        '& .MuiCheckbox-root': { p: 0, mt: '1px' },
        '& .MuiFormControlLabel-label': { fontSize: '0.9rem', lineHeight: 1.5 } }} />
  );
}

/* ---------- Text inputs (Material UI) ---------- */
const HTML_INPUT_PROPS = ['minLength', 'maxLength', 'min', 'max', 'step', 'inputMode', 'pattern'];

/**
 * Material UI text field with an optional react-icon at the start and any node at the end.
 * Accepts normal <input> attributes (minLength, inputMode, ...) and passes them to the input.
 * options: [[value, label]] turns it into a dropdown.
 */
export const TextInput = forwardRef(function TextInput(
  { icon: Icon, end, help, error, options, slotProps = {}, children, ...rest }, ref
) {
  const htmlInput = { ...(slotProps.htmlInput || {}) };
  for (const k of HTML_INPUT_PROPS) if (rest[k] !== undefined) { htmlInput[k] = rest[k]; delete rest[k]; }
  const input = { ...(slotProps.input || {}) };
  if (Icon) input.startAdornment = <InputAdornment position="start"><Icon size={18} /></InputAdornment>;
  if (end) input.endAdornment = <InputAdornment position="end">{end}</InputAdornment>;
  const isSelect = Boolean(options);
  const shrink = Icon || rest.placeholder || rest.type === 'date' || isSelect;
  return (
    <TextField inputRef={ref} {...rest} select={isSelect || rest.select} error={Boolean(error)} helperText={error || help}
      slotProps={{
        ...slotProps, htmlInput, input,
        ...(isSelect ? { select: { displayEmpty: true, MenuProps: { slotProps: { paper: { sx: { maxHeight: 360 } } } }, ...(slotProps.select || {}) } } : {}),
        inputLabel: { ...(slotProps.inputLabel || {}), ...(shrink ? { shrink: true } : {}) },
      }}>
      {isSelect ? options.map(([v, l, disabled]) => <MenuItem key={v} value={v} disabled={Boolean(disabled)}>{l}</MenuItem>) : children}
    </TextField>
  );
});

export function PasswordInput({ id, value, onChange, autoComplete, minLength, required = true, label = 'Password', help }) {
  const [show, setShow] = useState(false);
  return (
    <TextInput id={id} label={label} icon={Lock} type={show ? 'text' : 'password'} value={value} onChange={onChange}
      autoComplete={autoComplete} minLength={minLength} required={required} help={help}
      end={<IconButton edge="end" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </IconButton>} />
  );
}

export function IconInput(props) {
  return <TextInput {...props} />;
}

export { Button };

/* ---------- Toasts (AFC-style CustomSnackbar) ---------- */
// toast(message, type = 'success', { action: { label, onClick }, title })
// type: 'success' | 'error' | 'warning' | 'info'
const ToastContext = createContext(() => {});
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [open, setOpen] = useState(false);
  const show = useCallback((message, type = 'success', opts = {}) => {
    setToast({ message, severity: type === 'warn' ? 'warning' : type, ...opts, key: Date.now() });
    setOpen(true);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <CustomSnackbar key={toast.key} open={open} severity={toast.severity} message={toast.message} title={toast.title}
          action={toast.action} onClose={() => setOpen(false)} />
      )}
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
