import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, CircleCheck, EyeOff, Flag, HardHat, Inbox, Pause, Star, Undo2, Users, X } from 'lucide-react';
import { api, timeAgo } from '../api.js';
import { formatAbn } from '../australia.js';
import { REPORT_REASONS } from '../components/ReportDialog.jsx';
import { Alert, Empty, Field, LoadingPage, Modal, Spinner, Stars, Stat, Tabs, useToast } from '../components/ui.jsx';

const REASON = Object.fromEntries(REPORT_REASONS.map(([k, v]) => [k, v.split(' (')[0]]));
const ACT_LABEL = { review: ['Hide review', EyeOff], tradie: ['Pause profile', Pause], job: ['Cancel job', X], other: ['Mark handled', CircleCheck] };
const ACTION_TEXT = { hide_review: 'Review hidden', pause_tradie: 'Profile paused', cancel_job: 'Job cancelled', noted: 'Handled', dismissed: 'Dismissed (left up)' };

function Target({ r }) {
  const t = r.target;
  if (!t) return <p className="small muted">{r.target_type === 'other' ? 'General complaint (no specific item)' : 'Item no longer exists'}</p>;
  if (r.target_type === 'review') {
    return (
      <div className="panel small">
        <div className="row"><Stars value={t.rating} size={14} /><b>{t.customer}</b> about <Link to={`/tradies/${t.tradie_id}`}>{t.business_name}</Link> {t.hidden && <span className="chip chip-red">hidden</span>}</div>
        <p className="mt-xs">{t.comment || <i className="muted">No comment</i>}</p>
        {t.reply && <p className="mt-xs muted">Reply: {t.reply}</p>}
      </div>
    );
  }
  if (r.target_type === 'tradie') {
    return (
      <div className="panel small">
        <Link to={`/tradies/${t.tradie_id}`} className="bold">{t.business_name}</Link> {t.suspended && <span className="chip chip-red">paused</span>}
        <div className="muted">{t.name} · {t.email}{t.abn ? ` · ABN ${formatAbn(t.abn)}` : ''}{t.abn_entity_name ? ` (${t.abn_entity_name})` : ''}</div>
      </div>
    );
  }
  return (
    <div className="panel small">
      <Link to={`/jobs/${r.target_id}`} className="bold">{t.title}</Link> <span className="chip">{t.status}</span>
      <p className="mt-xs clamp-2">{t.description}</p>
      <div className="muted">Posted by {t.customer}</div>
    </div>
  );
}

export default function Admin() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('open');
  const [reports, setReports] = useState(null);
  const [resolving, setResolving] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/admin/stats').then(setStats).catch((e) => setError(e.message));
    setReports(null);
    api('/admin/reports', { params: { status } }).then(setReports).catch((e) => setError(e.message));
  }, [status]);
  useEffect(load, [load]);

  const resolve = async () => {
    setBusy(true);
    try {
      await api(`/admin/reports/${resolving.report.id}/resolve`, { method: 'POST', body: { action: resolving.action, note } });
      toast(resolving.action === 'act' ? 'Action taken. The reporter has been emailed.' : 'Report dismissed. The reporter has been emailed.');
      setResolving(null);
      setNote('');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const undo = async (r) => {
    try {
      await api(`/admin/reports/${r.id}/undo`, { method: 'POST' });
      toast('Undone. The report is open again.');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <div className="container page">
      <h1>Admin</h1>
      <p className="muted mb-lg">Reports and complaints. Most days there's nothing to do. Aim to handle each report within 7 days.</p>
      {error && <Alert type="error" className="mb">{error}</Alert>}

      <div className="grid grid-3 mb-lg" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <Stat icon={Flag} label="Open reports" value={stats?.open_reports} warn={stats?.open_reports > 0} />
        <Stat icon={Users} label="Customers" value={stats?.customers} />
        <Stat icon={HardHat} label="Tradies" value={stats?.tradies} />
        <Stat icon={BriefcaseBusiness} label="Open jobs" value={stats?.open_jobs} />
        <Stat icon={Star} label="Reviews" value={stats?.reviews} />
      </div>

      <Tabs value={status} onChange={setStatus} tabs={[['open', 'To review'], ['actioned', 'Actioned'], ['dismissed', 'Dismissed']]} />
      {reports === null && <LoadingPage />}
      {reports?.length === 0 && <Empty icon={Inbox} title={status === 'open' ? 'All caught up' : 'Nothing here'}>{status === 'open' && 'No reports waiting.'}</Empty>}

      <div className="grid grid-2">
        {reports?.map((r) => {
          const [actLabel, ActIcon] = ACT_LABEL[r.target_type];
          const overdue = status === 'open' && r.age_days >= 5;
          return (
            <div key={r.id} className={`card card-pad stack-sm ${overdue ? 'card-warn' : ''}`}>
              <div className="row-between row-top">
                <div className="row wrap"><span className="chip chip-red"><Flag size={13} />{REASON[r.reason]}</span><span className="chip">{r.target_type}</span></div>
                <span className={`tiny ${overdue ? 'bold' : 'muted'}`} style={overdue ? { color: 'var(--orange)' } : undefined}>
                  #{r.id} · {timeAgo(r.created_at)}{overdue ? ' · respond soon' : ''}
                </span>
              </div>
              <p className="pre-line">{r.details}</p>
              <div className="tiny muted">From {r.reporter_name} · <a href={`mailto:${r.reporter_email}`}>{r.reporter_email}</a></div>
              <Target r={r} />
              {status === 'open' ? (
                <div className="row wrap">
                  <button className="btn btn-danger" onClick={() => setResolving({ report: r, action: 'act', label: actLabel })}><ActIcon size={16} />{actLabel}</button>
                  <button className="btn btn-outline" onClick={() => setResolving({ report: r, action: 'dismiss', label: 'Dismiss' })}>Dismiss</button>
                </div>
              ) : (
                <div className="row-between">
                  <span className="small"><b>{ACTION_TEXT[r.action] || r.action}</b> {r.resolved_at && timeAgo(r.resolved_at)}{r.admin_note ? ` · "${r.admin_note}"` : ''}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => undo(r)}><Undo2 size={15} />Undo</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={Boolean(resolving)} onClose={() => setResolving(null)} title={resolving ? `${resolving.label}?` : ''} width={480}
        actions={<>
          <button className="btn btn-outline" onClick={() => setResolving(null)}>Go back</button>
          <button className={`btn ${resolving?.action === 'act' ? 'btn-danger-solid' : 'btn-primary'}`} onClick={resolve} disabled={busy}>{busy && <Spinner small white />}{resolving?.label}</button>
        </>}>
        <p className="muted small mb">
          {resolving?.action === 'act'
            ? 'The content will be hidden from customers (you can undo this later). The person who reported it will be emailed.'
            : 'The content stays up. Only remove genuine reviews if they break the rules; removing honest negative reviews can mislead customers.'}
        </p>
        <Field label="Note to the reporter (optional)" htmlFor="note"><textarea id="note" className="textarea" style={{ minHeight: 80 }} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </Modal>
    </div>
  );
}
