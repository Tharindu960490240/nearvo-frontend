import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuChevronRight as ChevronRight,
  LuClipboardList as ClipboardList,
  LuFilePlus2 as FilePlus2,
  LuHardHat as HardHat,
  LuMapPin as MapPin,
  LuReceiptText as ReceiptText,
} from 'react-icons/lu';
import { api, timeAgo } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CategoryTile } from '../components/CategoryIcon.jsx';
import { JobStatusChip } from '../components/TradieBits.jsx';
import { Alert, Empty, Skeleton, Tabs } from '../components/ui.jsx';

const FILTERS = {
  active: (j) => j.status === 'open' || j.status === 'assigned',
  done: (j) => j.status === 'completed',
  cancelled: (j) => j.status === 'cancelled',
};

export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');

  useEffect(() => { api('/jobs/mine').then(setJobs).catch((e) => setError(e.message)); }, []);

  const count = (k) => (jobs ? ` (${jobs.filter(FILTERS[k]).length})` : '');
  const shown = jobs?.filter(FILTERS[tab]) || [];
  const needsAction = (j) => (j.status === 'open' && j.quote_count > 0) || j.status === 'assigned';

  return (
    <div className="container container-md page">
      <div className="row-between wrap mb-lg">
        <div><h1>G'day, {user.name.split(' ')[0]}</h1><p className="muted">Your jobs and quotes</p></div>
        <Link to="/jobs/new" className="btn btn-primary btn-lg"><FilePlus2 size={18} />Post a job</Link>
      </div>
      {error && <Alert type="error" className="mb">{error}</Alert>}

      <Tabs value={tab} onChange={setTab} tabs={[['active', `Active${count('active')}`], ['done', `Completed${count('done')}`], ['cancelled', `Cancelled${count('cancelled')}`]]} />

      {jobs === null && <div className="stack-sm"><Skeleton height={104} count={3} /></div>}
      {jobs && shown.length === 0 && (
        <Empty icon={ClipboardList} title={tab === 'active' ? 'No active jobs' : 'Nothing here yet'}
          action={tab === 'active' && <Link to="/jobs/new" className="btn btn-primary"><FilePlus2 size={17} />Post your first job</Link>}>
          {tab === 'active' && 'Post a job and local tradies will send you quotes.'}
        </Empty>
      )}

      <div className="stack-sm">
        {shown.map((j) => (
          <Link key={j.id} to={`/jobs/${j.id}`} className={`card card-hover card-link card-pad-sm ${needsAction(j) ? 'card-accent' : ''}`}>
            <div className="row" style={{ gap: 16 }}>
              <CategoryTile icon={j.category_icon} size={52} />
              <div className="grow stack-xs">
                <div className="row wrap"><span className="bold">{j.title}</span><JobStatusChip status={j.status} /></div>
                <div className="row small muted"><MapPin size={14} /><span className="ellipsis">{j.category_name} · {j.suburb} {j.state} · posted {timeAgo(j.created_at)}</span></div>
                <div className="mt-xs">
                  {j.status === 'open' && (
                    <span className={`chip ${j.quote_count ? 'chip-blue' : ''}`}><ReceiptText size={14} />
                      {j.quote_count ? `${j.quote_count} quote${j.quote_count === 1 ? '' : 's'} to compare` : 'Waiting for quotes'}
                    </span>
                  )}
                  {j.status === 'assigned' && <span className="chip chip-amber"><HardHat size={14} />{j.assigned_business_name} · mark complete when done</span>}
                  {j.status === 'completed' && j.assigned_business_name && <span className="small muted">Done by {j.assigned_business_name}</span>}
                </div>
              </div>
              <ChevronRight size={20} className="muted" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
