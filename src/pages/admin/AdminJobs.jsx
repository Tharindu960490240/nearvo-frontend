// All jobs: search, filter by status, remove spam/rule-breaking jobs (and restore them).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuBriefcaseBusiness as Briefcase, LuRotateCcw as RotateCcw, LuTrash2 as Trash2 } from 'react-icons/lu';
import { api } from '../../api.js';
import { CategoryTile } from '../../components/CategoryIcon.jsx';
import { useToast } from '../../components/ui.jsx';
import { ActionDialog, AdminHeader, FilterBar, PagedList, shortDate, usePagedList } from './common.jsx';

const STATUS_CHIP = { open: 'chip-blue', assigned: 'chip-teal', completed: 'chip-green', cancelled: '' };

export default function AdminJobs() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [removing, setRemoving] = useState(null);
  const list = usePagedList('/admin/jobs', { q, status });

  const restore = async (j) => {
    try {
      await api(`/admin/jobs/${j.id}/restore`, { method: 'POST' });
      toast('Job restored and open again');
      list.reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div className="container page">
      <AdminHeader title="Jobs" subtitle="Every job posted. Remove spam or jobs that break the rules; you can restore them later." />
      <FilterBar q={q} onQ={setQ} placeholder="Search title, description, customer, suburb or job #"
        filters={[{ label: 'Status', value: status, onChange: setStatus, options: [['', 'All jobs'], ['open', 'Open'], ['assigned', 'Hired'], ['completed', 'Completed'], ['cancelled', 'Cancelled'], ['removed', 'Removed by admin']] }]} />
      <PagedList list={list} empty="No jobs match" emptyIcon={Briefcase}>
        {(j) => (
          <div key={j.id} className="card admin-row">
            <CategoryTile icon={j.category_icon} size={42} />
            <div className="grow">
              <div className="row wrap">
                <Link to={`/jobs/${j.id}`} className="bold">{j.title}</Link>
                <span className={`chip ${STATUS_CHIP[j.status]}`}>{j.removed_at ? 'removed' : j.status === 'assigned' ? 'hired' : j.status}</span>
              </div>
              <div className="small muted clamp-2">{j.description}</div>
              <div className="tiny muted">#{j.id} · {j.category_name} · {j.suburb} {j.state} {j.postcode} · by {j.customer_name} · {shortDate(j.created_at)} · {j.quote_count} quote{j.quote_count === 1 ? '' : 's'}</div>
            </div>
            {j.status === 'open' && <button className="btn btn-danger btn-sm" onClick={() => setRemoving(j)}><Trash2 size={15} />Remove</button>}
            {j.removed_at && j.status === 'cancelled' && <button className="btn btn-outline btn-sm" onClick={() => restore(j)}><RotateCcw size={15} />Restore</button>}
          </div>
        )}
      </PagedList>
      <ActionDialog open={Boolean(removing)} title={`Remove "${removing?.title}"?`} danger confirmLabel="Remove job" withNotify notifyLabel="Email the customer"
        text="The job is closed and any quotes are declined. You can restore it later." noteLabel="Reason (shown to the customer)"
        onClose={() => setRemoving(null)}
        onConfirm={async ({ note, notify }) => {
          await api(`/admin/jobs/${removing.id}/remove`, { method: 'POST', body: { note, notify } });
          const job = removing;
          toast('Job removed', 'success', { action: { label: 'Undo', onClick: () => restore(job) } });
          list.reload();
        }} />
    </div>
  );
}
