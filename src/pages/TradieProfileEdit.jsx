import InputAdornment from '@mui/material/InputAdornment';
import Slider from '@mui/material/Slider';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LuCamera as Camera,
  LuCircleCheck as CircleCheck,
  LuHammer as Hammer,
  LuMapPin as MapPin,
  LuMessageSquareReply as MessageSquareReply,
  LuPlus as Plus,
  LuStore as Store,
  LuTrash2 as Trash2,
} from 'react-icons/lu';
import { api, timeAgo, upload } from '../api.js';
import { localityLabel } from '../australia.js';
import { useAuth } from '../context/AuthContext.jsx';
import LocationInput from '../components/LocationInput.jsx';
import MapView from '../components/MapView.jsx';
import AbnField from '../components/AbnField.jsx';
import { TradieAvatar } from '../components/TradieBits.jsx';
import { Alert, IconTile, LoadingPage, Spinner, Stars, TextInput, showToast, useToast } from '../components/ui.jsx';

const UNITS = ['per hour', 'per job', 'per m²', 'on quote'];

function Section({ icon, title, subtitle, children }) {
  return (
    <section className="card card-pad mb-lg">
      <div className="row mb-lg" style={{ gap: 12 }}>
        <IconTile icon={icon} size={42} />
        <div><h3>{title}</h3>{subtitle && <p className="small muted">{subtitle}</p>}</div>
      </div>
      {children}
    </section>
  );
}

function ReviewReply({ review, onSaved }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(review.reply || '');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const save = async () => {
    setBusy(true);
    try {
      await api(`/reviews/${review.id}/reply`, { method: 'POST', body: { reply: text } });
      toast('Reply posted');
      setOpen(false);
      onSaved();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <div className="row"><Stars value={review.rating} size={14} /><span className="small bold">{review.customer_name}</span><span className="tiny muted">{timeAgo(review.created_at)} · {review.job_title}</span></div>
      {review.comment && <p className="small mt-xs">{review.comment}</p>}
      {review.reply && !open && <div className="reply" style={{ marginLeft: 0 }}><b className="tiny">Your reply:</b> {review.reply}</div>}
      {open ? (
        <div className="stack-sm mt-sm">
          <TextInput label="Your reply" multiline minRows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Thank the customer or respond politely to any concerns." />
          <div className="row"><button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy && <Spinner small white />}Post reply</button><button className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>Cancel</button></div>
        </div>
      ) : (
        <button className="link-btn small mt-xs" onClick={() => setOpen(true)}><MessageSquareReply size={14} style={{ verticalAlign: '-2px' }} /> {review.reply ? 'Edit reply' : 'Reply'}</button>
      )}
    </div>
  );
}

export default function TradieProfileEdit() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [place, setPlace] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [abnConfirmed, setAbnConfirmed] = useState(null);
  const [abnDemo, setAbnDemo] = useState(false);
  const [abr, setAbr] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoInput = useRef(null);

  const loadReviews = () => user.profile_complete && api(`/tradies/${user.id}`).then((t) => setReviews(t.reviews)).catch(() => {});

  useEffect(() => {
    api('/categories').then(setCategories).catch(() => {});
    api('/me/profile').then((p) => {
      setForm({
        business_name: p.business_name || '', bio: p.bio || '', years_experience: p.years_experience ?? '',
        abn: p.abn || '', licence_number: p.licence_number || '', service_radius_km: p.service_radius_km || 25,
        services: p.services.length ? p.services.map((s) => ({ category_id: s.category_id, price_from: s.price_from ?? '', price_unit: s.price_unit })) : [{ category_id: '', price_from: '', price_unit: 'per hour' }],
      });
      if (p.abn_verified_at && p.abn) setAbnConfirmed({ abn: p.abn, acn: p.acn, status: p.abn_status, entity_name: p.abn_entity_name, gst_registered: p.abn_gst_registered, business_names: [], source: p.abn_check });
      setAbnDemo(p.abn_check === 'demo');
      if (p.suburb_id) setPlace({ id: p.suburb_id, name: p.suburb, state: p.state, postcode: p.postcode, latitude: p.latitude, longitude: p.longitude });
      setPhoto(p.photo_url);
    }).catch((e) => setError(e.message));
    loadReviews();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!form) return error ? <div className="container container-md page"><Alert type="error">{error}</Alert></div> : <LoadingPage />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setService = (i, k, v) => setForm((f) => ({ ...f, services: f.services.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }));
  const usedIds = form.services.map((s) => Number(s.category_id));
  const abnOk = Boolean(abr) || (abnDemo && !form.abn);

  const checklist = [
    ['ABN confirmed', abnOk],
    ['Business details', Boolean(form.business_name && form.bio)],
    ['Base suburb & area', Boolean(place)],
    ['At least one service', form.services.some((s) => s.category_id)],
    ['Profile photo', Boolean(photo)],
  ];
  const progress = Math.round((checklist.filter((c) => c[1]).length / checklist.length) * 100);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!abnOk) return setError('Please enter an active ABN or ACN. We check it with the Australian Business Register.');
    setSaving(true);
    try {
      await api('/me/profile', {
        method: 'PUT',
        body: { ...form, suburb_id: place?.id, services: form.services.filter((s) => s.category_id).map((s) => ({ ...s, category_id: Number(s.category_id) })) },
      });
      const wasComplete = user.profile_complete;
      const me = await refresh();
      toast('Profile saved');
      if (!wasComplete && me.profile_complete) navigate('/tradie');
    } catch (err) {
      setError(err.message); showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const r = await upload('/me/photo', fd);
      setPhoto(r.photo_url);
      refresh();
      toast('Photo updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container container-md page">
      <h1>{user.profile_complete ? 'Your tradie profile' : 'Set up your tradie profile'}</h1>
      <p className="muted mt-xs mb-lg">This is what customers see when comparing quotes.</p>

      <div className="panel mb-lg">
        <div className="row-between"><span className="bold">Profile strength</span><span className="xbold blue">{progress}%</span></div>
        <div className="progress mt-sm"><span style={{ width: `${progress}%` }} /></div>
        <div className="row wrap mt" style={{ gap: 6 }}>
          {checklist.map(([label, done]) => <span key={label} className={`chip ${done ? 'chip-green' : 'chip-outline'}`}>{done && <CircleCheck size={14} />}{label}</span>)}
        </div>
      </div>

      <form onSubmit={save}>
        <Section icon={Store} title="Business details" subtitle="Who you are and why customers should hire you">
          <div className="row wrap mb-lg" style={{ gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <TradieAvatar tradie={{ business_name: form.business_name || user.name, photo_url: photo }} size={100} />
              <button type="button" className="icon-btn" onClick={() => photoInput.current.click()} disabled={uploading} aria-label="Change photo"
                style={{ position: 'absolute', right: -8, bottom: -8, background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)', borderRadius: '50%' }}>
                {uploading ? <Spinner small white /> : <Camera size={18} />}
              </button>
              <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPhoto} />
            </div>
            <p className="small muted grow">Add a clear photo of yourself or your logo. JPG, PNG or WebP up to 5 MB.</p>
          </div>
          <div className="stack">
            <AbnField value={form.abn} onChange={(v) => setForm((f) => ({ ...f, abn: v }))} onResult={setAbr} confirmed={abnConfirmed}
              required={!abnDemo} label={abnDemo ? 'ABN or ACN (demo account)' : 'ABN or ACN'} />
            <TextInput label="Business name" id="bn" required value={form.business_name} onChange={set('business_name')} />
            <TextInput label="About your business" multiline minRows={4} id="bio" value={form.bio} onChange={set('bio')} placeholder="What you specialise in, your experience, and what customers can expect." />
            <div className="form-row">
              <TextInput label="Years of experience" id="yrs" type="number" min="0" max="70" value={form.years_experience} onChange={set('years_experience')} />
              <TextInput label="Trade licence number (optional)" help="Shown on your profile as provided by you. Customers can check it with your state regulator." id="lic" value={form.licence_number} onChange={set('licence_number')} />
            </div>
          </div>
        </Section>

        <Section icon={Hammer} title="Services & prices" subtitle="The trades you offer and a starting price for each">
          <div className="stack-sm">
            {form.services.map((s, i) => (
              <div key={i} className="service-row" style={{ paddingTop: 6 }}>
                <TextInput label="Trade" size="small" value={s.category_id} onChange={(e) => setService(i, 'category_id', e.target.value)}
                  options={[['', 'Choose a trade…'], ...categories.map((c) => [c.id, c.name, usedIds.includes(c.id) && Number(s.category_id) !== c.id])]} />
                <TextInput label="Price from" size="small" type="number" min="0" disabled={s.price_unit === 'on quote'}
                  value={s.price_unit === 'on quote' ? '' : s.price_from} onChange={(e) => setService(i, 'price_from', e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />
                <TextInput label="Unit" size="small" value={s.price_unit} onChange={(e) => setService(i, 'price_unit', e.target.value)} options={UNITS.map((u) => [u, u])} />
                <button type="button" className="icon-btn" aria-label="Remove service" disabled={form.services.length === 1}
                  onClick={() => setForm((f) => ({ ...f, services: f.services.filter((_, j) => j !== i) }))}><Trash2 size={17} /></button>
              </div>
            ))}
            {form.services.length < 8 && (
              <div><button type="button" className="btn btn-ghost" onClick={() => setForm((f) => ({ ...f, services: [...f.services, { category_id: '', price_from: '', price_unit: 'per hour' }] }))}><Plus size={17} />Add another trade</button></div>
            )}
          </div>
        </Section>

        <Section icon={MapPin} title="Where you work" subtitle="You'll see jobs posted within your service area">
          <div className="stack">
            <LocationInput id="base" required value={place ? localityLabel(place) : ''} onSelect={setPlace} label="Your base suburb" />
            <div>
              <label className="bold small" id="radius-label">I travel up to <span className="blue">{form.service_radius_km} km</span></label>
              <div style={{ padding: '0 10px' }}>
                <Slider id="radius" aria-labelledby="radius-label" min={5} max={300} step={5} value={form.service_radius_km} valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v} km`} marks={[{ value: 5, label: '5 km' }, { value: 100, label: '100 km' }, { value: 200, label: '200 km' }, { value: 300, label: '300 km' }]}
                  onChange={(_, v) => setForm((f) => ({ ...f, service_radius_km: v }))} />
              </div>
            </div>
            {place && <MapView points={[{ id: 0, latitude: place.latitude, longitude: place.longitude }]} circle={{ latitude: place.latitude, longitude: place.longitude, km: form.service_radius_km }} height={260} />}
          </div>
        </Section>

        {error && <Alert type="error" className="mb">{error}</Alert>}
        <div className="row wrap mb-lg" style={{ justifyContent: 'flex-end' }}>
          {user.profile_complete && <Link to={`/tradies/${user.id}`} className="btn btn-outline btn-lg">View public profile</Link>}
          <button className="btn btn-primary btn-lg" disabled={saving}>{saving && <Spinner small white />}{user.profile_complete ? 'Save changes' : 'Save & start finding jobs'}</button>
        </div>
      </form>

      {reviews.length > 0 && (
        <Section icon={MessageSquareReply} title="Your reviews" subtitle="Reply publicly to thank customers or respond to feedback">
          <div className="list-divided">{reviews.map((r) => <ReviewReply key={r.id} review={r} onSaved={loadReviews} />)}</div>
          <p className="tiny muted mt">If you believe a review is fake or untrue, use the Report link on your public profile.</p>
        </Section>
      )}
    </div>
  );
}
