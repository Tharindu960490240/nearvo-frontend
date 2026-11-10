import { useState } from 'react';
import { LuFlag as Flag } from 'react-icons/lu';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, Modal, Spinner, TextInput, useToast } from './ui.jsx';

export const REPORT_REASONS = [
  ['defamatory', 'False or defamatory (untrue claims that harm someone)'],
  ['fake', 'Fake review or fake listing'],
  ['offensive', 'Offensive, abusive or discriminatory'],
  ['scam', 'Scam, fraud or safety concern'],
  ['privacy', 'Shares private information'],
  ['other', 'Something else'],
];

/** Report form usable by anyone, including people without an account. */
export function ReportForm({ targetType = 'other', targetId = null, onDone, onCancel }) {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ reason: '', details: '', name: user?.name || '', email: user?.email || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api('/reports', { method: 'POST', body: { ...form, target_type: targetType, target_id: targetId } });
      toast(`Thanks, we received your report (#${r.id}). We'll be in touch by email.`);
      onDone?.(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <TextInput id="reason" label="What's the problem?" required value={form.reason} onChange={set('reason')} options={REPORT_REASONS} />
      <TextInput id="details" label="Details" required multiline minRows={4} minLength={15} value={form.details} onChange={set('details')}
        help="Tell us what is wrong and, if it's about you or your business, why." />
      {!user && (
        <div className="form-row">
          <TextInput id="rname" label="Your name" required value={form.name} onChange={set('name')} autoComplete="name" />
          <TextInput id="remail" label="Your email" type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
        </div>
      )}
      {error && <Alert type="error">{error}</Alert>}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
        <button className="btn btn-primary" disabled={busy}>{busy ? <Spinner small white /> : <Flag size={16} />} Send report</button>
      </div>
    </form>
  );
}

/** Small "Report" link that opens the report form in a dialog. */
export default function ReportButton({ targetType, targetId, label = 'Report', className = 'link-btn small muted' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Flag size={13} /> {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Report this ${targetType === 'tradie' ? 'profile' : targetType}`} width={520}>
        <p className="muted small mb">We review every report, usually within 7 days, and email you the outcome.</p>
        <ReportForm targetType={targetType} targetId={targetId} onDone={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
