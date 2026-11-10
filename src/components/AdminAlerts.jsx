// "Needs a look" list (possible spam, scams, overdue reports, automatic ABN pauses) + daily tools.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuCircleCheck as CircleCheck, LuMail as Mail, LuRefreshCw as RefreshCw, LuShieldAlert as ShieldAlert } from 'react-icons/lu';
import { api } from '../api.js';
import { InlineLoader } from './LoadingSpinner.jsx';
import { Spinner, useToast } from './ui.jsx';

const TONE = { error: 'chip-red', warning: 'chip-amber', info: 'chip-blue' };

export default function AdminAlerts() {
  const toast = useToast();
  const [alerts, setAlerts] = useState(null);
  const [busy, setBusy] = useState('');
  useEffect(() => { api('/admin/alerts').then(setAlerts).catch(() => setAlerts([])); }, []);

  const run = async (key, path, msg) => {
    setBusy(key);
    try {
      const r = await api(path, { method: 'POST' });
      toast(msg(r));
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="card card-pad mb-lg">
      <div className="row-between wrap mb">
        <div className="row"><ShieldAlert size={20} color="var(--brand)" /><h3>Needs a look</h3></div>
        <div className="row wrap">
          <button className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => run('sum', '/admin/daily/summary', (r) => `Summary emailed: "${r.subject}"`)}>
            {busy === 'sum' ? <Spinner small /> : <Mail size={15} />}Email me the summary now
          </button>
          <button className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => run('abn', '/admin/daily/abn-check', (r) => `ABN re-check: ${r.checked} checked, ${r.paused} paused`)}>
            {busy === 'abn' ? <Spinner small /> : <RefreshCw size={15} />}Re-check ABNs now
          </button>
        </div>
      </div>
      {alerts === null && <InlineLoader compact />}
      {alerts?.length === 0 && (
        <div className="row muted"><CircleCheck size={18} color="var(--on-green)" />Nothing unusual. Spam, scam and overdue-report checks all look fine.</div>
      )}
      <div className="stack-sm">
        {alerts?.map((a, i) => (
          <div key={i} className="alert-line">
            <span className={`chip ${TONE[a.level]}`}>{a.level === 'error' ? 'Act soon' : a.level === 'warning' ? 'Check' : 'FYI'}</span>
            <div className="grow">
              <div className="bold small">{a.title}</div>
              <div className="tiny muted">{a.text}</div>
            </div>
            <Link className="btn btn-ghost btn-sm" to={a.link || `/admin/users?open=${a.user_id}`}>Open</Link>
          </div>
        ))}
      </div>
      <p className="tiny muted mt">A summary email is sent to ADMIN_EMAIL every morning, and ABNs are re-checked with the ABR automatically (every tradie at least monthly).</p>
    </div>
  );
}
