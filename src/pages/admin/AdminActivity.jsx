// Admin action log: who did what and when (including automatic ABN re-checks).
import { useState } from 'react';
import { LuHistory as History } from 'react-icons/lu';
import { AdminHeader, FilterBar, PagedList, dateTime, usePagedList } from './common.jsx';

export default function AdminActivity() {
  const [q, setQ] = useState('');
  const list = usePagedList('/admin/actions', { q });
  return (
    <div className="container page container-md">
      <AdminHeader title="Activity log" subtitle="Every admin action, kept as a record in case a decision is questioned later." />
      <FilterBar q={q} onQ={setQ} placeholder="Search the log" />
      <PagedList list={list} empty="Nothing logged yet" emptyIcon={History}>
        {(a) => (
          <div key={a.id} className="card admin-row log-row">
            <span className={`log-dot ${a.admin_id ? '' : 'system'}`} />
            <div className="grow">
              <div>{a.summary}</div>
              {a.note && <div className="small muted">Note: {a.note}</div>}
              <div className="tiny muted">{a.admin_name} · {dateTime(a.created_at)}</div>
            </div>
          </div>
        )}
      </PagedList>
    </div>
  );
}
