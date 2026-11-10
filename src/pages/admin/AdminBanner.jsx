// Site-wide announcement banner (e.g. "Maintenance tonight 10pm").
import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { AnnouncementBar } from '../../components/Announcement.jsx';
import { InlineLoader } from '../../components/LoadingSpinner.jsx';
import { Alert, Spinner, Switch, TextInput, showToast, useToast } from '../../components/ui.jsx';
import { AdminHeader } from './common.jsx';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function AdminBanner() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/admin/announcement').then((a) => setForm({ ...a, ends_at: toLocalInput(a.ends_at), link_url: a.link_url || '', link_label: a.link_label || '' }))
      .catch((e) => setError(e.message));
  }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api('/admin/announcement', { method: 'PUT', body: { ...form, ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null } });
      setForm({ ...form, active: r.active });
      toast(r.active ? 'Banner is live for everyone' : 'Banner turned off');
    } catch (err) {
      setError(err.message); showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page container-md">
      <AdminHeader title="Site banner" subtitle="A short message shown at the top of every page, e.g. planned maintenance or holiday hours." />
      {!form && !error && <InlineLoader compact />}
      {error && <Alert type="error" className="mb">{error}</Alert>}
      {form && (
        <form className="card card-pad stack" onSubmit={save}>
          <Switch checked={form.active} onChange={(v) => setForm({ ...form, active: v })}>Show the banner</Switch>
          <TextInput id="banner-text" label="Message" multiline minRows={2} maxLength={300} value={form.text} onChange={set('text')}
            help={`${form.text.length}/300 characters`} placeholder="e.g. Nearvo will be down for maintenance tonight from 10pm to 11pm AEDT." />
          <div className="form-row">
            <TextInput id="banner-tone" label="Style" value={form.tone} onChange={set('tone')} options={[['info', 'Information (blue)'], ['warning', 'Warning (amber)'], ['success', 'Good news (green)']]} />
            <TextInput id="banner-end" label="Hide automatically after (optional)" type="datetime-local" value={form.ends_at} onChange={set('ends_at')} />
          </div>
          <div className="form-row">
            <TextInput id="banner-url" label="Link (optional)" value={form.link_url} onChange={set('link_url')} placeholder="/terms or https://…" />
            <TextInput id="banner-label" label="Link text" value={form.link_label} onChange={set('link_label')} placeholder="Learn more" disabled={!form.link_url} />
          </div>
          {form.text && (
            <div>
              <div className="bold small mb-sm">Preview</div>
              <AnnouncementBar a={{ ...form, link_label: form.link_url ? form.link_label || 'Learn more' : null }} />
            </div>
          )}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" disabled={busy}>{busy && <Spinner small white />}Save</button>
          </div>
        </form>
      )}
    </div>
  );
}
