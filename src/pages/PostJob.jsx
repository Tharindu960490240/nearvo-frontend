import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuArrowLeft as ArrowLeft,
  LuArrowRight as ArrowRight,
  LuCircleCheck as CircleCheck,
  LuInfo as Info,
  LuSend as Send,
} from 'react-icons/lu';
import { api } from '../api.js';
import { localityLabel } from '../australia.js';
import { useAuth } from '../context/AuthContext.jsx';
import LocationInput from '../components/LocationInput.jsx';
import { CategoryTile } from '../components/CategoryIcon.jsx';
import { Alert, Spinner, Stepper, TextInput } from '../components/ui.jsx';

const STEPS = ['Trade', 'Job details', 'Location & timing'];

function kmBetween(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude), dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState({ budgets: [], timings: [] });
  const [invited, setInvited] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ category_id: '', title: '', description: '', budget: 'Not sure', timing: "I'm flexible" });
  const [place, setPlace] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/categories').then((cats) => {
      setCategories(cats);
      const pre = cats.find((c) => c.slug === params.get('category'));
      if (pre) { setForm((f) => ({ ...f, category_id: pre.id })); setStep(1); }
    }).catch(() => {});
    api('/options').then(setOptions).catch(() => {});
    if (params.get('tradie')) api(`/tradies/${params.get('tradie')}`).then(setInvited).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const category = categories.find((c) => c.id === form.category_id);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const coverage = useMemo(() => {
    if (!invited || !place) return null;
    const km = kmBetween(invited, place);
    return { km, covered: km <= invited.service_radius_km };
  }, [invited, place]);

  const validate = () => {
    if (step === 0 && !form.category_id) return 'Please choose the type of tradie you need';
    if (step === 1 && form.title.trim().length < 5) return 'Please give your job a short title (at least 5 characters)';
    if (step === 1 && form.description.trim().length < 20) return 'Please describe the job in a bit more detail (at least 20 characters)';
    if (step === 2 && !place) return 'Please choose the suburb where the job is';
    return '';
  };
  const next = () => { const m = validate(); setError(m); if (!m) setStep(step + 1); };
  const submit = async () => {
    const m = validate();
    if (m) return setError(m);
    setSaving(true);
    setError('');
    try {
      const { id } = await api('/jobs', { method: 'POST', body: { ...form, suburb_id: place.id } });
      navigate(`/jobs/${id}?posted=1`);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="container container-md page">
      <h1>Post a job</h1>
      <p className="muted mt-xs mb-lg">Free and no obligation. Local tradies who cover your suburb will send you quotes.</p>

      {!user.email_verified && <Alert type="warn" className="mb">Please confirm your email address before posting. Check your inbox for the link.</Alert>}
      {invited && (
        <Alert type="info" icon={Info} className="mb">
          You're getting a quote from <b>{invited.business_name}</b>. They'll see your job if it's within {invited.service_radius_km} km of {invited.suburb}.
          {coverage && (coverage.covered
            ? <> Good news: <b>{place.name}</b> is {Math.round(coverage.km)} km away, inside their area.</>
            : <> Heads up: <b>{place.name}</b> is {Math.round(coverage.km)} km away, outside their area. Other local tradies can still quote.</>)}
        </Alert>
      )}

      <div className="mb-lg"><Stepper steps={STEPS} active={step} /></div>

      <div className="card card-pad">
        {step === 0 && (
          <>
            <h3 className="mb">What type of tradie do you need?</h3>
            <div className="grid grid-4" style={{ gap: 12 }}>
              {categories.map((c) => (
                <button key={c.id} type="button" className={`choice choice-col ${form.category_id === c.id ? 'selected' : ''}`}
                  onClick={() => { setForm((f) => ({ ...f, category_id: c.id })); setError(''); }}>
                  <CategoryTile icon={c.icon} size={44} />
                  <span className="bold small">{c.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <div className="stack">
            <div className="row" style={{ gap: 12 }}>
              {category && <CategoryTile icon={category.icon} size={40} />}
              <h3>Tell {category ? `the ${category.name.toLowerCase()}` : 'tradies'} about the job</h3>
            </div>
            <TextInput label="Job title" help="A short summary tradies will see first" required id="title" maxLength={150} value={form.title} onChange={set('title')} placeholder="e.g. Fix leaking kitchen tap" />
            <TextInput label="Describe the job" help={`${form.description.trim().length} characters · at least 20. Don't include your phone number or street address here.`} required multiline minRows={6} id="desc" value={form.description} onChange={set('description')}
                placeholder="What needs doing? Include sizes, materials, access details and anything else that helps tradies quote accurately." />
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <h3>Where and when?</h3>
            <LocationInput id="sub" required value={place ? localityLabel(place) : ''} onSelect={setPlace} label="Job suburb or postcode"
              help="Only your suburb is shown to tradies. You share your address with the tradie you hire." />
            <div className="form-row">
              <TextInput id="timing" label="When do you need it done?" value={form.timing} onChange={set('timing')} options={options.timings.map((t) => [t, t])} />
              <TextInput id="budget" label="Rough budget" value={form.budget} onChange={set('budget')} options={options.budgets.map((b) => [b, b])} />
            </div>
            <div className="panel">
              <div className="eyebrow">Summary</div>
              <div className="bold mt-xs">{form.title}</div>
              <div className="small muted">{category?.name} · {place ? localityLabel(place) : 'No suburb yet'} · {form.timing} · {form.budget}</div>
            </div>
          </div>
        )}

        {error && <Alert type="error" className="mt-lg">{error}</Alert>}

        <div className="row-between mt-xl">
          {step > 0
            ? <button className="btn btn-outline" onClick={() => { setStep(step - 1); setError(''); }}><ArrowLeft size={17} />Back</button>
            : <Link to="/my-jobs" className="btn btn-outline">Cancel</Link>}
          {step < 2
            ? <button className="btn btn-primary btn-lg" onClick={next}>Continue<ArrowRight size={17} /></button>
            : <button className="btn btn-primary btn-lg" onClick={submit} disabled={saving || !user.email_verified}>{saving ? <Spinner small white /> : <Send size={17} />}{saving ? 'Posting…' : 'Post job'}</button>}
        </div>
      </div>

      <div className="row wrap mt-lg" style={{ justifyContent: 'center', gap: 24 }}>
        {['Free to post', 'No obligation to hire', 'Your phone number stays private'].map((t) => (
          <span key={t} className="row small muted"><CircleCheck size={16} color="var(--green)" />{t}</span>
        ))}
      </div>
    </div>
  );
}
