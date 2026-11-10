// Trade categories: add, rename, change icon, hide/show - no code changes needed.
import { useEffect, useState } from 'react';
import { LuEye as Eye, LuEyeOff as EyeOff, LuPencil as Pencil, LuPlus as Plus, LuTags as Tags } from 'react-icons/lu';
import { api } from '../../api.js';
import { CATEGORY_ICON_KEYS, CategoryIcon, CategoryTile } from '../../components/CategoryIcon.jsx';
import { InlineLoader } from '../../components/LoadingSpinner.jsx';
import { Alert, Empty, Modal, Spinner, TextInput, showToast, useToast } from '../../components/ui.jsx';
import { AdminHeader } from './common.jsx';

function TradeDialog({ trade, icons, onClose, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState(trade?.name || '');
  const [icon, setIcon] = useState(trade?.icon || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isNew = !trade?.id;

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      if (isNew) await api('/admin/categories', { method: 'POST', body: { name, icon } });
      else await api(`/admin/categories/${trade.id}`, { method: 'PUT', body: { name, icon } });
      toast(isNew ? `"${name}" added` : 'Trade updated');
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
      showToast(e.message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={isNew ? 'Add a trade' : `Edit ${trade.name}`} width={560}
      actions={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={busy || name.trim().length < 2 || !icon}>{busy && <Spinner small white />}{isNew ? 'Add trade' : 'Save'}</button>
      </>}>
      <div className="stack">
        <TextInput id="trade-name" label="Trade name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pest Control"
          help={isNew ? 'Use the singular name people search for, e.g. "Plumber".' : 'Renaming keeps the same web address, so old links still work.'} />
        <div>
          <div className="bold small mb-sm">Icon</div>
          <div className="icon-picker" role="radiogroup" aria-label="Icon">
            {icons.filter((k) => CATEGORY_ICON_KEYS.includes(k)).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={icon === k} aria-label={k} title={k}
                className={`icon-pick ${icon === k ? 'selected' : ''}`} onClick={() => setIcon(k)}>
                <CategoryIcon icon={k} size={20} />
              </button>
            ))}
          </div>
        </div>
        {name && icon && (
          <div className="panel row"><CategoryTile icon={icon} size={44} /><b>{name}</b><span className="muted small">preview</span></div>
        )}
        {error && <Alert type="error">{error}</Alert>}
      </div>
    </Modal>
  );
}

export default function AdminTrades() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const load = () => api('/admin/categories').then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const toggle = async (c) => {
    try {
      await api(`/admin/categories/${c.id}`, { method: 'PUT', body: { name: c.name, icon: c.icon, hidden: !c.hidden_at } });
      toast(c.hidden_at ? `"${c.name}" is visible again` : `"${c.name}" is hidden`);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div className="container page container-md">
      <AdminHeader title="Trades" subtitle="The trades customers can choose. Hide a trade instead of deleting it: existing jobs and profiles keep it."
        action={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={17} />Add a trade</button>} />
      {error && <Alert type="error">{error}</Alert>}
      {!data && !error && <InlineLoader compact />}
      {data?.items.length === 0 && <Empty icon={Tags} title="No trades yet" />}
      <div className="admin-list">
        {data?.items.map((c) => (
          <div key={c.id} className="card admin-row" style={c.hidden_at ? { opacity: 0.7 } : undefined}>
            <CategoryTile icon={c.icon} size={42} />
            <div className="grow">
              <div className="row wrap"><b>{c.name}</b>{c.hidden_at && <span className="chip chip-amber">Hidden</span>}</div>
              <div className="tiny muted">{c.tradie_count} tradie{c.tradie_count === 1 ? '' : 's'} · {c.job_count} job{c.job_count === 1 ? '' : 's'} · /{c.slug}</div>
            </div>
            <button className="icon-btn" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}><Pencil size={16} /></button>
            <button className="btn btn-outline btn-sm" onClick={() => toggle(c)}>{c.hidden_at ? <><Eye size={15} />Show</> : <><EyeOff size={15} />Hide</>}</button>
          </div>
        ))}
      </div>
      {editing && <TradeDialog trade={editing.id ? editing : null} icons={data?.icons || []} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}
