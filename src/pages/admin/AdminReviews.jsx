// All reviews: search, filter by stars, hide or show again. Ratings are recalculated automatically.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuEye as Eye, LuEyeOff as EyeOff, LuStar as Star } from 'react-icons/lu';
import { api } from '../../api.js';
import { Alert, Stars, useToast } from '../../components/ui.jsx';
import { ActionDialog, AdminHeader, FilterBar, PagedList, shortDate, usePagedList } from './common.jsx';

export default function AdminReviews() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [rating, setRating] = useState('');
  const [status, setStatus] = useState('');
  const [hiding, setHiding] = useState(null);
  const list = usePagedList('/admin/reviews', { q, rating, status });

  const show = async (r) => {
    try {
      await api(`/admin/reviews/${r.id}/show`, { method: 'POST' });
      toast('Review is visible again');
      list.reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div className="container page">
      <AdminHeader title="Reviews" subtitle="Hide reviews that break the rules. Don't hide honest negative reviews: that can mislead customers (ACCC)." />
      <FilterBar q={q} onQ={setQ} placeholder="Search review text, tradie or customer"
        filters={[
          { label: 'Stars', value: rating, onChange: setRating, options: [['', 'Any rating'], ['5', '5 stars'], ['4', '4 stars'], ['3', '3 stars'], ['2', '2 stars'], ['1', '1 star']] },
          { label: 'Status', value: status, onChange: setStatus, options: [['', 'All'], ['visible', 'Visible'], ['hidden', 'Hidden']] },
        ]} />
      <PagedList list={list} empty="No reviews match" emptyIcon={Star}>
        {(r) => (
          <div key={r.id} className="card admin-row" style={r.hidden_at ? { opacity: 0.75 } : undefined}>
            <div className="grow">
              <div className="row wrap">
                <Stars value={r.rating} size={14} />
                <b>{r.customer_name}</b><span className="muted small">about</span><Link to={`/tradies/${r.tradie_id}`} className="bold">{r.business_name}</Link>
                {r.hidden_at && <span className="chip chip-red">Hidden</span>}
              </div>
              <p className="small mt-xs">{r.comment || <i className="muted">No comment</i>}</p>
              {r.reply && <p className="small muted mt-xs">Reply: {r.reply}</p>}
              <div className="tiny muted mt-xs">{r.job_title} · {shortDate(r.created_at)}</div>
            </div>
            {r.hidden_at
              ? <button className="btn btn-outline btn-sm" onClick={() => show(r)}><Eye size={15} />Show</button>
              : <button className="btn btn-danger btn-sm" onClick={() => setHiding(r)}><EyeOff size={15} />Hide</button>}
          </div>
        )}
      </PagedList>
      <ActionDialog open={Boolean(hiding)} title="Hide this review?" danger confirmLabel="Hide review" noteLabel="Note for the admin log (optional)"
        text="It disappears from the tradie's profile and their rating is recalculated. You can show it again later."
        onClose={() => setHiding(null)}
        onConfirm={async ({ note }) => {
          await api(`/admin/reviews/${hiding.id}/hide`, { method: 'POST', body: { note } });
          const r = hiding;
          toast('Review hidden', 'success', { action: { label: 'Undo', onClick: () => show(r) } });
          list.reload();
        }} />
      <Alert type="info" className="mt-lg">Tip: if someone complains about a review, use their report in the Reports inbox so they get an email with the outcome.</Alert>
    </div>
  );
}
