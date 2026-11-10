// Find and manage users: search by name, email, phone, business or ABN; suspend, restore, delete and more.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LuBadgeCheck as BadgeCheck,
  LuBan as Ban,
  LuEye as Eye,
  LuEyeOff as EyeOff,
  LuMailCheck as MailCheck,
  LuRefreshCw as RefreshCw,
  LuRotateCcw as RotateCcw,
  LuTrash2 as Trash2,
  LuUsers as Users,
} from 'react-icons/lu';
import { api } from '../../api.js';
import { formatAbn } from '../../australia.js';
import { UserAvatar } from '../../components/AppShell.jsx';
import { InlineLoader } from '../../components/LoadingSpinner.jsx';
import { Alert, Modal, Stars, useToast } from '../../components/ui.jsx';
import { ROLE_LABELS } from '../../const/navigation.js';
import { ActionDialog, AdminHeader, FilterBar, PagedList, dateTime, shortDate, usePagedList } from './common.jsx';

function StatusChips({ u }) {
  return (
    <>
      {u.suspended_at && <span className="chip chip-red">Suspended</span>}
      {!u.suspended_at && u.profile_paused_at && <span className="chip chip-amber">Profile paused</span>}
      {!(u.email_verified ?? u.email_verified_at) && <span className="chip chip-amber">Email not confirmed</span>}
    </>
  );
}

function UserDialog({ id, onClose, onChanged }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null);
  useEffect(() => {
    if (id && !data) api(`/admin/users/${id}`).then(setData).catch((e) => setError(e.message));
  }, [id, data]);

  const done = (msg, type = 'success') => { toast(msg, type); setData(null); onChanged(); };
  const post = (path, body) => api(`/admin/users/${id}/${path}`, { method: 'POST', body });

  const u = data?.user;
  const quick = async (fn, msg) => {
    try { const r = await fn(); done(typeof msg === 'function' ? msg(r) : msg); } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <Modal open={Boolean(id)} onClose={onClose} title={u ? (u.business_name || u.name) : 'User'} width={760}>
      {error && <Alert type="error">{error}</Alert>}
      {!u && !error && <InlineLoader compact />}
      {u && (
        <div className="stack">
          <div className="row wrap" style={{ gap: 14 }}>
            <UserAvatar user={u} size={52} />
            <div className="grow">
              <div className="row wrap"><span className="role-chip">{ROLE_LABELS[u.role]}</span><StatusChips u={u} /></div>
              <div className="small muted mt-xs">#{u.id} · joined {shortDate(u.created_at)} · last log-in {u.last_login_at ? dateTime(u.last_login_at) : 'never'}</div>
            </div>
          </div>

          <div className="info-grid">
            <div><span>Name</span>{u.name}</div>
            <div><span>Email</span><a href={`mailto:${u.email}`}>{u.email}</a></div>
            <div><span>Phone</span>{u.phone ? <a href={`tel:${u.phone.replace(/\s/g, '')}`}>{u.phone}</a> : '–'}</div>
            {u.role === 'tradie' && <>
              <div><span>ABN</span>{u.abn ? `${formatAbn(u.abn)} (${u.abn_status || 'unknown'}${u.abn_check === 'demo' ? ', demo' : ''})` : '–'}</div>
              <div><span>Registered name</span>{u.abn_entity_name || '–'}</div>
              <div><span>ABN last checked</span>{u.abn_checked_at ? shortDate(u.abn_checked_at) : '–'}</div>
              <div><span>Base</span>{u.suburb ? `${u.suburb} ${u.state} ${u.postcode}` : '–'}</div>
              <div><span>Licence (self-declared)</span>{u.licence_number || '–'}</div>
              <div><span>Rating</span>{u.review_count ? <><Stars value={u.avg_rating} size={13} /> {u.avg_rating} ({u.review_count})</> : 'No reviews'}</div>
            </>}
          </div>
          {(u.suspended_reason || u.paused_reason) && (
            <Alert type="warn">{u.suspended_reason ? `Suspended: ${u.suspended_reason}` : `Profile paused: ${u.paused_reason}`}</Alert>
          )}

          {u.role !== 'admin' && (
            <div className="row wrap">
              {u.suspended_at || u.profile_paused_at
                ? <button className="btn btn-success" onClick={() => quick(() => post('restore', {}), 'Account restored. They have been emailed.')}><RotateCcw size={16} />Restore</button>
                : <button className="btn btn-danger" onClick={() => setDialog('suspend')}><Ban size={16} />Suspend account</button>}
              {u.role === 'tradie' && !u.suspended_at && !u.profile_paused_at && (
                <button className="btn btn-outline" onClick={() => setDialog('pause')}><EyeOff size={16} />Pause profile only</button>
              )}
              {!u.email_verified_at && <button className="btn btn-outline" onClick={() => quick(() => post('resend-verification'), 'Confirmation email sent')}><MailCheck size={16} />Resend confirmation</button>}
              {u.role === 'tradie' && u.abn && u.abn_check !== 'demo' && (
                <button className="btn btn-outline" onClick={() => quick(() => post('recheck-abn'), (r) => (r.result === 'paused' ? 'ABN is no longer active, so the profile was paused' : r.result === 'ok' ? 'ABN is still active' : 'ABN Lookup did not answer. Try again later.'))}><RefreshCw size={16} />Re-check ABN</button>
              )}
              {u.role === 'tradie' && <Link to={`/tradies/${u.id}`} className="btn btn-ghost" target="_blank"><Eye size={16} />Public profile</Link>}
              <button className="btn btn-ghost red" style={{ marginLeft: 'auto' }} onClick={() => setDialog('delete')}><Trash2 size={16} />Delete</button>
            </div>
          )}

          {data.jobs.length > 0 && <Section title="Jobs posted">{data.jobs.map((j) => <Line key={j.id} to={`/jobs/${j.id}`} left={j.title} right={`${j.removed_at ? 'removed' : j.status} · ${shortDate(j.created_at)}`} />)}</Section>}
          {data.quotes.length > 0 && <Section title="Quotes sent">{data.quotes.map((q) => <Line key={q.id} to={`/jobs/${q.job_id}`} left={q.title} right={`$${q.amount} · ${q.status}`} />)}</Section>}
          {data.reviews.length > 0 && <Section title="Reviews">{data.reviews.map((r) => <Line key={r.id} left={<><Stars value={r.rating} size={12} /> {r.comment || <i className="muted">No comment</i>}</>} right={`${r.kind}${r.hidden_at ? ' · hidden' : ''}`} />)}</Section>}
          {data.reports.length > 0 && <Section title="Reports about this tradie">{data.reports.map((r) => <Line key={r.id} to="/admin/reports" left={`#${r.id} ${r.reason}`} right={r.status} />)}</Section>}
          {data.actions.length > 0 && <Section title="Admin history">{data.actions.map((a) => <Line key={a.id} left={a.summary + (a.note ? ` · "${a.note}"` : '')} right={`${a.admin_name} · ${dateTime(a.created_at)}`} />)}</Section>}
        </div>
      )}

      <ActionDialog open={dialog === 'suspend'} title="Suspend this account?" danger confirmLabel="Suspend" withNotify
        text="They won't be able to log in, and a tradie's profile is hidden from customers. You can restore it any time."
        onClose={() => setDialog(null)} onConfirm={async ({ note, notify }) => { await post('suspend', { reason: note, notify }); done('Account suspended'); }} />
      <ActionDialog open={dialog === 'pause'} title="Pause the public profile?" confirmLabel="Pause profile"
        text="The profile is hidden from customers and they can't quote, but they can still log in and fix things."
        onClose={() => setDialog(null)} onConfirm={async ({ note }) => { await post('pause-profile', { reason: note }); done('Profile paused'); }} />
      <ActionDialog open={dialog === 'delete'} title="Delete this account for good?" danger confirmLabel="Delete account" withNotify typeToConfirm="DELETE"
        text="Their account and personal details are deleted, with their jobs, quotes and reviews. This can't be undone. Use this for privacy requests or clear fakes."
        noteLabel="Note for the admin log (optional)"
        onClose={() => setDialog(null)} onConfirm={async ({ note, notify, confirm }) => {
          await api(`/admin/users/${id}`, { method: 'DELETE', body: { note, notify, confirm } });
          toast('Account deleted'); onChanged(); onClose();
        }} />
    </Modal>
  );
}

const Section = ({ title, children }) => <div><h4 className="mb-sm">{title}</h4><div className="mini-list">{children}</div></div>;
const Line = ({ left, right, to }) => (
  <div className="mini-line">
    <span className="grow ellipsis">{to ? <Link to={to} target="_blank">{left}</Link> : left}</span>
    <span className="tiny muted">{right}</span>
  </div>
);

export default function AdminUsers() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [params, setParams] = useSearchParams();
  const open = Number(params.get('open')) || null;   // ?open=12 opens that user (used by alerts)
  const setOpen = (id) => setParams(id ? { open: String(id) } : {}, { replace: true });
  const list = usePagedList('/admin/users', { q, role, status });

  return (
    <div className="container page">
      <AdminHeader title="Users" subtitle="Find anyone by name, email, phone, business name or ABN." />
      <FilterBar q={q} onQ={setQ} placeholder="Search name, email, phone, business or ABN"
        filters={[
          { label: 'Type', value: role, onChange: setRole, options: [['', 'Everyone'], ['customer', 'Customers'], ['tradie', 'Tradies'], ['admin', 'Admins']] },
          { label: 'Status', value: status, onChange: setStatus, options: [['', 'Any status'], ['active', 'Active'], ['suspended', 'Suspended or paused'], ['unverified', 'Email not confirmed']] },
        ]} />
      <PagedList list={list} empty="No users match" emptyIcon={Users}>
        {(u) => (
          <button key={u.id} className="card admin-row admin-row-btn" onClick={() => setOpen(u.id)}>
            <UserAvatar user={u} size={42} />
            <div className="grow">
              <div className="row wrap"><b className="ellipsis">{u.business_name || u.name}</b><span className="chip chip-blue">{ROLE_LABELS[u.role]}</span><StatusChips u={u} /></div>
              <div className="small muted ellipsis">{u.business_name ? `${u.name} · ` : ''}{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
              <div className="tiny muted">
                Joined {shortDate(u.created_at)}
                {u.role === 'customer' && ` · ${u.jobs_posted} job${u.jobs_posted === 1 ? '' : 's'}`}
                {u.role === 'tradie' && ` · ${u.quotes_sent} quote${u.quotes_sent === 1 ? '' : 's'}`}
                {u.abn && <> · <BadgeCheck size={12} style={{ verticalAlign: '-2px' }} /> ABN {formatAbn(u.abn)}</>}
              </div>
            </div>
            <span className="btn btn-outline btn-sm desktop-only">Manage</span>
          </button>
        )}
      </PagedList>
      <UserDialog key={open} id={open} onClose={() => setOpen(null)} onChanged={list.reload} />
    </div>
  );
}
