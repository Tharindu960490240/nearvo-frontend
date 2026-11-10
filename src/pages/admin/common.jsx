// Shared pieces for the admin screens: page header, search/filter bar, paged lists, reason dialog.
import { useCallback, useEffect, useRef, useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import { LuSearch as Search } from 'react-icons/lu';
import { api } from '../../api.js';
import { Alert, CheckboxField, Empty, Modal, Spinner, TextInput } from '../../components/ui.jsx';
import { InlineLoader } from '../../components/LoadingSpinner.jsx';

export function AdminHeader({ title, subtitle, action }) {
  return (
    <div className="row-between wrap mb-lg row-top">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted mt-xs">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Search box + optional dropdown filters, in one row (wraps on phones). */
export function FilterBar({ q, onQ, placeholder = 'Search', filters = [] }) {
  return (
    <div className="filter-bar mb">
      <TextInput value={q} onChange={(e) => onQ(e.target.value)} placeholder={placeholder}
        slotProps={{ htmlInput: { 'aria-label': placeholder }, input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> } }} />
      {filters.map((f) => (
        <TextInput key={f.label} label={f.label} value={f.value} onChange={(e) => f.onChange(e.target.value)} options={f.options} />
      ))}
    </div>
  );
}

/**
 * Loads a paged admin list ({ items, more }) and reloads when the filters change.
 * Search text is debounced so typing doesn't send a request per key.
 */
export function usePagedList(path, filters) {
  const [items, setItems] = useState(null);
  const [more, setMore] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const key = JSON.stringify(filters);
  const reqId = useRef(0);

  const load = useCallback((p = 0) => {
    const rid = ++reqId.current;
    if (p === 0) setItems(null); else setLoadingMore(true);
    setError('');
    return api(path, { params: { ...JSON.parse(key), page: p } })
      .then((d) => {
        if (rid !== reqId.current) return;
        setItems((old) => (p === 0 ? d.items : [...(old || []), ...d.items]));
        setMore(d.more);
        setPage(p);
      })
      .catch((e) => rid === reqId.current && setError(e.message))
      .finally(() => rid === reqId.current && setLoadingMore(false));
  }, [path, key]);

  useEffect(() => {
    const t = setTimeout(() => load(0), 250);
    return () => clearTimeout(t);
  }, [load]);

  return { items, more, error, loadingMore, reload: () => load(0), loadMore: () => load(page + 1), setItems };
}

export function PagedList({ list, empty, emptyIcon, children }) {
  if (list.error) return <Alert type="error">{list.error}</Alert>;
  if (list.items === null) return <InlineLoader compact />;
  if (!list.items.length) return <Empty icon={emptyIcon} title={empty} />;
  return (
    <>
      <div className="admin-list">{list.items.map(children)}</div>
      {list.more && (
        <div className="center mt">
          <button className="btn btn-outline" onClick={list.loadMore} disabled={list.loadingMore}>{list.loadingMore && <Spinner small />}Show more</button>
        </div>
      )}
    </>
  );
}

/**
 * Confirm an admin action with an optional reason/note and "email them" tick box.
 * onConfirm({ note, notify, confirm }) should return a promise.
 */
export function ActionDialog({ open, title, text, noteLabel = 'Reason (optional)', confirmLabel, danger, withNotify, notifyLabel = 'Email them about this', typeToConfirm, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setNote(''); setNotify(true); setTyped(''); setError(''); setBusy(false); } }, [open]);

  const go = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm({ note, notify, confirm: typed });
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  const blocked = typeToConfirm && typed.trim().toUpperCase() !== typeToConfirm;

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={title} width={480}
      actions={<>
        <button className="btn btn-outline" onClick={onClose} disabled={busy}>Go back</button>
        <button className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'}`} onClick={go} disabled={busy || blocked}>{busy && <Spinner small white />}{confirmLabel}</button>
      </>}>
      <div className="stack">
        {text && <p className="muted">{text}</p>}
        {noteLabel && <TextInput id="action-note" label={noteLabel} multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} />}
        {withNotify && <CheckboxField id="action-notify" checked={notify} onChange={setNotify}>{notifyLabel}</CheckboxField>}
        {typeToConfirm && <TextInput id="action-type" label={`Type ${typeToConfirm} to confirm`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />}
        {error && <Alert type="error">{error}</Alert>}
      </div>
    </Modal>
  );
}

export const shortDate = (d) => (d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
export const dateTime = (d) => (d ? new Date(d).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '–');
