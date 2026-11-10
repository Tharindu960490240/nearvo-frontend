import InputAdornment from '@mui/material/InputAdornment';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  LuArrowLeft as ArrowLeft,
  LuCircleCheck as CircleCheck,
  LuClock as Clock,
  LuDollarSign as DollarSign,
  LuHandshake as Handshake,
  LuHourglass as Hourglass,
  LuMail as Mail,
  LuMapPin as MapPin,
  LuNavigation as Navigation,
  LuPartyPopper as PartyPopper,
  LuPhone as Phone,
  LuReceiptText as ReceiptText,
  LuStar as Star,
} from 'react-icons/lu';
import { api, formatDistance, money, timeAgo } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CategoryTile } from '../components/CategoryIcon.jsx';
import { AMOUNT_TYPE_LABEL, AbnBadge, JobStatusChip, QuoteStatusChip, TradieAvatar } from '../components/TradieBits.jsx';
import ReportButton from '../components/ReportDialog.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Alert, ConfirmDialog, Empty, LoadingPage, Spinner, StarInput, Stars, Stepper, TextInput, useToast } from '../components/ui.jsx';

const telHref = (p) => `tel:${p.replace(/[^\d+]/g, '')}`;
const STEP = { open: 1, assigned: 2, completed: 4 };

function ContactCard({ title, person, note }) {
  return (
    <div className="card card-pad card-success">
      <div className="row mb-sm"><Handshake size={22} color="var(--teal)" /><h3>{title}</h3></div>
      <div className="bold">{person.business_name || person.name}</div>
      {person.business_name && <div className="small muted">{person.name}</div>}
      <div className="row wrap mt">
        {person.phone && <a href={telHref(person.phone)} className="btn btn-success"><Phone size={17} />{person.phone}</a>}
        {person.email && <a href={`mailto:${person.email}`} className="btn btn-outline"><Mail size={17} />Email</a>}
      </div>
      {note && <p className="small muted mt">{note}</p>}
    </div>
  );
}

function QuoteCard({ q, canAccept, onAccept }) {
  const accepted = q.quote_status === 'accepted';
  return (
    <div className="card card-pad-sm" style={accepted ? { borderColor: 'var(--teal)', borderWidth: 2 } : undefined}>
      <div className="row row-top" style={{ gap: 14 }}>
        <TradieAvatar tradie={q} size={56} />
        <div className="grow stack-sm">
          <div className="row-between row-top">
            <div>
              <Link to={`/tradies/${q.id}`} className="bold" style={{ color: 'var(--navy)' }}>{q.business_name}</Link>
              <div className="row small"><Stars value={q.avg_rating} size={14} /><span className="muted">{q.review_count ? `${q.avg_rating.toFixed(1)} (${q.review_count})` : 'New'}</span></div>
            </div>
            <div className="right">
              <div className="price">{money(q.amount)}</div>
              <div className="tiny muted">{AMOUNT_TYPE_LABEL[q.amount_type]}</div>
            </div>
          </div>
          <div className="row wrap" style={{ gap: 6 }}>
            <AbnBadge tradie={q} />
            {q.distance_km != null && <span className="chip"><Navigation size={13} />{formatDistance(q.distance_km)} away</span>}
            {q.years_experience != null && <span className="chip">{q.years_experience} yrs experience</span>}
          </div>
          {q.message && <div className="quote-msg pre-line">{q.message}</div>}
          <div className="row-between">
            <span className="tiny muted">Quoted {timeAgo(q.quoted_at)}</span>
            {canAccept && q.quote_status === 'pending'
              ? <button className="btn btn-primary" onClick={() => onAccept(q)}><Handshake size={17} />Accept & hire</button>
              : <QuoteStatusChip status={q.quote_status} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewForm({ jobId, tradieName, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Please choose a star rating');
    setSaving(true);
    try {
      await api(`/jobs/${jobId}/review`, { method: 'POST', body: { rating, comment } });
      onDone();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };
  return (
    <form className="card card-pad card-warn stack-sm" onSubmit={submit}>
      <div className="row"><Star size={22} color="var(--amber)" fill="var(--amber)" /><h3>How did {tradieName} go?</h3></div>
      <p className="small muted">Your honest review helps other Aussies choose the right tradie. Stick to facts about your own experience.</p>
      <StarInput value={rating} onChange={setRating} />
      <TextInput id="review-comment" label="Your review" multiline minRows={3} placeholder="What went well? Anything they could improve?" value={comment} onChange={(e) => setComment(e.target.value)} />
      {error && <Alert type="error">{error}</Alert>}
      <div><button className="btn btn-primary" disabled={saving}>{saving && <Spinner small white />}Post review</button></div>
    </form>
  );
}

function QuoteForm({ job, onDone }) {
  const mine = job.my_quote;
  const [form, setForm] = useState({ amount: mine?.amount ?? '', amount_type: mine?.amount_type || 'fixed', message: mine?.message || '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(!mine || mine.status === 'withdrawn');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api(`/jobs/${job.id}/quotes`, { method: 'POST', body: form });
      setEditing(false);
      onDone(mine?.status === 'pending' ? 'Quote updated' : 'Quote sent! The customer has been notified.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const withdraw = async () => { await api(`/quotes/${mine.id}/withdraw`, { method: 'POST' }); onDone('Quote withdrawn'); };

  if (mine && !editing) {
    return (
      <div className="card card-pad card-accent stack-sm">
        <div className="row-between"><h3>Your quote</h3><QuoteStatusChip status={mine.status} /></div>
        <div><span className="price" style={{ fontSize: '2rem' }}>{money(mine.amount)}</span> <span className="muted">{AMOUNT_TYPE_LABEL[mine.amount_type]}</span></div>
        <p className="pre-line">{mine.message}</p>
        <span className="tiny muted">Sent {timeAgo(mine.updated_at)}</span>
        {mine.status === 'pending' && job.status === 'open' && (
          <div className="row"><button className="btn btn-outline" onClick={() => setEditing(true)}>Edit quote</button><button className="btn btn-danger" onClick={withdraw}>Withdraw</button></div>
        )}
        {mine.status === 'declined' && <Alert type="info">The customer chose another tradie this time.</Alert>}
      </div>
    );
  }
  if (!job.can_quote) return null;

  return (
    <form className="card card-pad stack" style={{ borderColor: 'var(--brand)', borderWidth: 2 }} onSubmit={submit}>
      <div className="row"><ReceiptText size={22} color="var(--blue)" /><h3>Send a quote</h3></div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 160px' }}>
        <TextInput id="amount" label="Price" type="number" min="1" step="0.01" required value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
        <TextInput id="atype" label="Type" value={form.amount_type} onChange={(e) => setForm({ ...form, amount_type: e.target.value })}
          options={[['fixed', 'Fixed price'], ['per hour', 'Per hour'], ['estimate', 'Estimate']]} />
      </div>
      <TextInput label="Message to the customer" multiline minRows={4} id="msg" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="What's included, when you're available, and why you're a good fit." />
      {error && <Alert type="error" action={/profile|ABN/i.test(error) ? <Link to="/tradie/profile" className="btn btn-sm btn-outline">Profile</Link> : null}>{error}</Alert>}
      <div className="row">
        <button className="btn btn-primary btn-lg" disabled={saving}>{saving && <Spinner small white />}{mine ? 'Update quote' : 'Send quote'}</button>
        {mine?.status === 'pending' && <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>}
      </div>
    </form>
  );
}

function Tips({ title, items, children }) {
  return (
    <div className="card card-pad">
      <h4>{title}</h4>
      <div className="stack-sm mt-sm">{items.map((t) => <span key={t} className="row small"><CircleCheck size={16} color="var(--blue)" />{t}</span>)}</div>
      {children}
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => { api(`/jobs/${id}`).then(setJob).catch((e) => setError(e.message)); }, [id]);
  useEffect(load, [load]);
  useEffect(() => { if (params.get('posted')) toast('Job posted! Local tradies are being notified.'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div className="container container-md page"><Alert type="error">{error}</Alert></div>;
  if (!job) return <LoadingPage />;

  const owner = job.viewer === 'owner';
  const tradieView = job.viewer === 'tradie';
  const hiredMe = tradieView && job.assigned_tradie_id === user.id;
  const hiredQuote = job.quotes?.find((q) => q.quote_status === 'accepted');

  const runConfirm = async () => {
    setBusy(true);
    try {
      if (confirm.type === 'accept') await api(`/quotes/${confirm.quote.quote_id}/accept`, { method: 'POST' });
      if (confirm.type === 'complete') await api(`/jobs/${job.id}/complete`, { method: 'POST' });
      if (confirm.type === 'cancel') await api(`/jobs/${job.id}/cancel`, { method: 'POST' });
      toast({ accept: `You hired ${confirm.quote?.business_name}! Their contact details are below.`, complete: 'Job marked as complete', cancel: 'Job cancelled' }[confirm.type]);
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const dialog = confirm && {
    accept: { title: `Hire ${confirm.quote?.business_name}?`, label: 'Hire', text: `You're accepting their quote of ${money(confirm.quote?.amount)} ${AMOUNT_TYPE_LABEL[confirm.quote?.amount_type] || ''}. Other tradies will be told you chose someone else, and you'll both get each other's contact details. Agree the final price and details directly with your tradie.` },
    complete: { title: 'Mark this job as complete?', label: 'Mark complete', text: "Only do this once the work is finished. You'll then be able to leave a review." },
    cancel: { title: 'Cancel this job?', label: 'Cancel job', text: 'Tradies will no longer be able to quote, and any quotes you received will be declined.', danger: true },
  }[confirm.type];

  return (
    <div className="container page">
      <Link to={owner ? '/my-jobs' : tradieView ? '/tradie' : '/admin'} className="btn btn-ghost mb"><ArrowLeft size={17} />{owner ? 'My jobs' : tradieView ? 'Back to jobs' : 'Admin'}</Link>

      <div className="card card-pad mb-lg">
        <div className="row row-top wrap" style={{ gap: 20 }}>
          <CategoryTile icon={job.category_icon} size={64} />
          <div className="grow stack-sm" style={{ minWidth: 240 }}>
            <div className="row wrap"><span className="chip chip-blue">{job.category_name}</span><JobStatusChip status={job.status} /></div>
            <h1>{job.title}</h1>
            <div className="row wrap small muted" style={{ gap: 18 }}>
              <span className="row"><MapPin size={16} />{job.suburb} {job.state} {job.postcode}{tradieView && job.distance_km != null ? ` · ${formatDistance(job.distance_km)} from you` : ''}</span>
              <span className="row"><Clock size={16} />{job.timing}</span>
              <span className="row"><DollarSign size={16} />Budget: {job.budget}</span>
            </div>
            <p className="pre-line mt-sm">{job.description}</p>
            <div className="row tiny muted wrap">
              <span>Posted {timeAgo(job.created_at)}{tradieView ? ` by ${job.customer.name.split(' ')[0]}` : ''}</span>
              {tradieView && <ReportButton targetType="job" targetId={job.id} label="Report this job" />}
            </div>
          </div>
        </div>
        {job.status !== 'cancelled' && <div className="mt-lg"><Stepper steps={['Posted', 'Quotes', 'Hired', 'Completed']} active={STEP[job.status]} /></div>}
      </div>

      {(owner || job.viewer === 'admin') && (
        <div className="split">
          <div className="stack">
            {job.status === 'completed' && owner && !job.review && job.hired && (
              <ReviewForm jobId={job.id} tradieName={job.hired.business_name} onDone={() => { toast('Thanks for your review!'); load(); }} />
            )}
            {job.review && (
              <Alert type="success" icon={PartyPopper}>
                You rated {job.hired?.business_name} <b>{job.review.rating} star{job.review.rating === 1 ? '' : 's'}</b>. Thanks for your review!
                {job.review.reply && <div className="mt-sm"><b>Their reply:</b> {job.review.reply}</div>}
              </Alert>
            )}
            <h2 style={{ fontSize: '1.4rem' }}>{job.status === 'open' ? `Quotes (${job.quotes.length})` : 'Quotes'}</h2>
            {job.quotes.length === 0 && (
              <Empty icon={Hourglass} title="Waiting for quotes">We've let local {job.category_name.toLowerCase()}s know. We'll email you when quotes arrive.</Empty>
            )}
            {job.quotes.map((q) => (
              <QuoteCard key={q.quote_id} q={q} canAccept={owner && job.status === 'open'} onAccept={(quote) => setConfirm({ type: 'accept', quote })} />
            ))}
          </div>
          <div className="stack sticky">
            {job.hired && <ContactCard title="Your tradie" person={job.hired} note={job.status === 'assigned' ? 'Get in touch to arrange a time. Mark the job complete once the work is done.' : null} />}
            {owner && job.status === 'assigned' && (
              <button className="btn btn-success btn-lg btn-block" onClick={() => setConfirm({ type: 'complete' })}><CircleCheck size={19} />Mark job as complete</button>
            )}
            {hiredQuote && job.status !== 'open' && <p className="small muted">Quoted price: <b>{money(hiredQuote.amount)}</b> {AMOUNT_TYPE_LABEL[hiredQuote.amount_type]}</p>}
            {owner && job.status === 'open' && (
              <Tips title="Tips for choosing" items={['Compare reviews, not just price', 'Ask for their licence and insurance details', 'Get the full price and scope in writing']}>
                <hr className="divider" />
                <button className="link-btn red" onClick={() => setConfirm({ type: 'cancel' })}>Cancel this job</button>
              </Tips>
            )}
          </div>
        </div>
      )}

      {tradieView && (
        <div className="split">
          <div className="stack">
            {hiredMe && <ContactCard title={job.status === 'completed' ? 'Job completed' : 'You got the job!'} person={job.customer}
              note={job.status === 'assigned' ? 'Contact the customer to arrange a time. They will mark the job complete when the work is done.' : null} />}
            {hiredMe && job.review && (
              <Alert type="success" icon={PartyPopper}>
                The customer rated you <b>{job.review.rating} star{job.review.rating === 1 ? '' : 's'}</b>{job.review.comment ? `: "${job.review.comment}"` : '.'}
                {' '}You can reply to it from your profile page.
              </Alert>
            )}
            <QuoteForm job={job} onDone={(msg) => { toast(msg); load(); }} />
            {!job.can_quote && !job.my_quote && job.status === 'open' && <Alert type="info">This job is outside your trades or service area.</Alert>}
          </div>
          <Tips title="Quoting tips" items={['Be clear about what the price includes', 'Mention when you can start', 'Keep it friendly and professional']}>
            <p className="small muted mt">The customer's contact details are shared with you if they accept your quote.</p>
          </Tips>
        </div>
      )}

      <ConfirmDialog open={Boolean(confirm)} title={dialog?.title} text={dialog?.text} confirmLabel={dialog?.label} danger={dialog?.danger}
        busy={busy} onClose={() => setConfirm(null)} onConfirm={runConfirm} />
      <LoadingSpinner open={busy} text="Saving" />
    </div>
  );
}
