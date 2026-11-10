import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuBriefcaseBusiness as BriefcaseBusiness,
  LuChevronRight as ChevronRight,
  LuClock as Clock,
  LuDollarSign as DollarSign,
  LuEye as Eye,
  LuMapPin as MapPin,
  LuReceiptText as ReceiptText,
  LuSquarePen as SquarePen,
  LuTrophy as Trophy,
} from 'react-icons/lu';
import { api, formatDistance, money, timeAgo } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CategoryTile } from '../components/CategoryIcon.jsx';
import { AMOUNT_TYPE_LABEL, JobStatusChip, QuoteStatusChip } from '../components/TradieBits.jsx';
import { Alert, Empty, Skeleton, Stat, Tabs } from '../components/ui.jsx';

export default function TradieDashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState(null);
  const [quotes, setQuotes] = useState(null);
  const [tab, setTab] = useState('leads');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user.profile_complete || user.suspended) { setLeads([]); setQuotes([]); return; }
    api('/jobs/leads').then(setLeads).catch((e) => setError(e.message));
    api('/quotes/mine').then(setQuotes).catch((e) => setError(e.message));
  }, [user.profile_complete, user.suspended]);

  const newLeads = leads?.filter((j) => !j.my_quote_id || j.my_quote_status === 'withdrawn') || [];
  const pending = quotes?.filter((q) => q.status === 'pending') || [];
  const won = quotes?.filter((q) => q.status === 'accepted') || [];
  const other = quotes?.filter((q) => ['declined', 'withdrawn'].includes(q.status)) || [];
  const loading = leads === null || quotes === null;
  const list = tab === 'quotes' ? [...pending, ...other] : won;

  return (
    <div className="container page">
      <div className="row-between wrap mb-lg">
        <div><h1>G'day, {user.name.split(' ')[0]}</h1><p className="muted">{user.business_name}</p></div>
        <div className="row">
          {user.profile_complete && <Link to={`/tradies/${user.id}`} className="btn btn-outline"><Eye size={17} />Public profile</Link>}
          <Link to="/tradie/profile" className="btn btn-primary"><SquarePen size={17} />Edit profile</Link>
        </div>
      </div>

      {user.suspended && <Alert type="error" className="mb">Your profile has been paused after a report. Customers can't see it right now. Please reply to our email or use the Report page to contact us.</Alert>}
      {!user.profile_complete && !user.suspended && (
        <Alert type="warn" className="mb" action={<Link to="/tradie/profile" className="btn btn-sm btn-outline">Finish profile</Link>}>
          Confirm your ABN, then add your base suburb, service area and at least one service to start seeing jobs.
        </Alert>
      )}
      {error && <Alert type="error" className="mb">{error}</Alert>}

      <div className="grid grid-4 mb-lg">
        <Stat icon={BriefcaseBusiness} label="New jobs near you" value={loading ? '–' : newLeads.length} />
        <Stat icon={ReceiptText} label="Quotes pending" value={loading ? '–' : pending.length} />
        <Stat icon={Trophy} label="Jobs won" value={loading ? '–' : won.length} />
        <Stat icon={DollarSign} label="Won (fixed prices)" value={loading ? '–' : money(won.filter((q) => q.amount_type !== 'per hour').reduce((s, q) => s + q.amount, 0))} />
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[
        ['leads', `New jobs${leads ? ` (${newLeads.length})` : ''}`],
        ['quotes', `My quotes${quotes ? ` (${pending.length + other.length})` : ''}`],
        ['won', `Jobs won${quotes ? ` (${won.length})` : ''}`],
      ]} />

      {loading && <div className="stack-sm"><Skeleton height={120} count={3} /></div>}

      {!loading && tab === 'leads' && (
        <div className="stack-sm">
          {newLeads.length === 0 && (
            <Empty icon={BriefcaseBusiness} title="No new jobs right now">
              We'll email you when a customer in your service area posts a job for your trades. A bigger service area means more jobs.
            </Empty>
          )}
          {newLeads.map((j) => (
            <Link key={j.id} to={`/jobs/${j.id}`} className="card card-hover card-link card-pad-sm">
              <div className="row row-top" style={{ gap: 16 }}>
                <CategoryTile icon={j.category_icon} size={52} />
                <div className="grow stack-xs">
                  <div className="row-between"><span className="bold">{j.title}</span><span className="tiny muted">{timeAgo(j.created_at)}</span></div>
                  <p className="small muted clamp-2">{j.description}</p>
                  <div className="row wrap mt-sm" style={{ gap: 6 }}>
                    <span className="chip chip-blue"><MapPin size={13} />{j.suburb} {j.state} · {formatDistance(j.distance_km)}</span>
                    <span className="chip"><Clock size={13} />{j.timing}</span>
                    <span className="chip"><DollarSign size={13} />{j.budget}</span>
                    <span className={`chip ${j.quote_count ? '' : 'chip-green'}`}>{j.quote_count ? `${j.quote_count} quote${j.quote_count === 1 ? '' : 's'} so far` : 'Be the first to quote'}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="muted" style={{ alignSelf: 'center' }} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && tab !== 'leads' && (
        <div className="stack-sm">
          {list.length === 0 && (
            <Empty icon={tab === 'won' ? Trophy : ReceiptText} title={tab === 'won' ? 'No jobs won yet' : 'No quotes yet'}>
              {tab === 'won' ? 'When a customer accepts your quote it will show here with their contact details.' : 'Find a job in the New jobs tab and send your first quote.'}
            </Empty>
          )}
          {list.map((q) => (
            <Link key={q.id} to={`/jobs/${q.job_id}`} className="card card-hover card-link card-pad-sm">
              <div className="row" style={{ gap: 14 }}>
                <CategoryTile icon={q.category_icon} size={48} />
                <div className="grow stack-xs">
                  <span className="bold ellipsis">{q.title}</span>
                  <span className="small muted ellipsis">{q.customer_first_name} · {q.suburb} {q.state} · quoted {timeAgo(q.created_at)}</span>
                  <div>{tab === 'won' ? <JobStatusChip status={q.job_status} /> : <QuoteStatusChip status={q.status} />}</div>
                </div>
                <div className="right"><div className="xbold blue-dark">{money(q.amount)}</div><div className="tiny muted">{AMOUNT_TYPE_LABEL[q.amount_type]}</div></div>
                <ChevronRight size={20} className="muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
