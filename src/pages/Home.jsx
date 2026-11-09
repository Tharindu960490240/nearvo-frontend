import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, CircleCheck, FilePlus2, Flag, Handshake, HardHat, Hammer, MessageSquareReply, ReceiptText, Search, Star,
} from 'lucide-react';
import { api } from '../api.js';
import { localityLabel } from '../australia.js';
import { useAuth } from '../context/AuthContext.jsx';
import TradieCard from '../components/TradieCard.jsx';
import LocationInput from '../components/LocationInput.jsx';
import { CategoryTile } from '../components/CategoryIcon.jsx';
import { Alert, IconTile, Skeleton } from '../components/ui.jsx';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState(null);
  const [slug, setSlug] = useState('');
  const [place, setPlace] = useState(null);
  const [top, setTop] = useState(null);
  const [states, setStates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/categories').then(setCategories).catch(() => setCategories([]));
    api('/tradies', { params: { sort: 'rating', limit: 6 } }).then((d) => setTop(d.results)).catch(() => setTop([]));
    api('/states').then(setStates).catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    if (!slug && !place) return setError('Choose a trade or your suburb to search');
    const p = new URLSearchParams();
    if (slug) p.set('category', slug);
    if (place) { p.set('lat', place.latitude.toFixed(5)); p.set('lng', place.longitude.toFixed(5)); p.set('near', localityLabel(place)); }
    navigate(`/tradies?${p}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="pill"><BadgeCheck size={16} color="var(--blue)" /> Every tradie's ABN is checked with the ABR</span>
          <h1>Find a local <span className="blue">tradie</span>, fast</h1>
          <p className="hero-sub">
            Plumbers, electricians, painters, cleaners and more. Post your job for free, compare quotes from tradies near you, and choose who you hire.
          </p>

          <form className="searchbar" onSubmit={search}>
            <label className="searchbar-part">
              <Hammer size={20} />
              <select aria-label="What trade do you need" value={slug} onChange={(e) => { setSlug(e.target.value); setError(''); }} className={slug ? '' : 'placeholder'}>
                <option value="">What trade do you need?</option>
                {categories?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
            <div className="searchbar-part">
              <LocationInput bare placeholder="Your suburb or postcode" onSelect={(p) => { setPlace(p); setError(''); }} />
            </div>
            <button className="btn btn-primary btn-lg"><Search size={18} />Find tradies</button>
          </form>
          {error && <Alert type="info" className="mt" onClose={() => setError('')}>{error}</Alert>}

          {user?.role !== 'tradie' && (
            <div className="row wrap mt-lg" style={{ gap: 12 }}>
              <span className="muted bold">Don't want to search?</span>
              <Link to={slug ? `/jobs/new?category=${slug}` : '/jobs/new'} className="btn btn-outline"><FilePlus2 size={17} />Post a job and get free quotes</Link>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <div><h2>Popular trades</h2><p className="muted mt-xs">Tap a trade to see local tradies, their prices and reviews</p></div>
          </div>
          <div className="grid grid-5">
            {categories === null ? <Skeleton height={140} count={10} /> : categories.map((c) => (
              <Link key={c.id} to={`/tradies?category=${c.slug}`} className="card card-hover card-link card-pad-sm center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '22px 12px' }}>
                <CategoryTile icon={c.icon} size={52} />
                <span className="bold">{c.name}</span>
                <span className="small muted">{c.tradie_count} tradie{c.tradie_count === 1 ? '' : 's'}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head"><div><h2>How Nearvo works</h2><p className="muted mt-xs">Get the job done in three simple steps</p></div></div>
          <div className="grid grid-3">
            {[
              [FilePlus2, 'Post your job', "Tell us what you need and where. It takes two minutes and it's free."],
              [ReceiptText, 'Compare quotes', 'Local tradies who cover your suburb send quotes. Compare prices and reviews.'],
              [Handshake, 'Hire & review', "Accept the quote you like, get their contact details, and leave a review when it's done."],
            ].map(([Icon, title, text], i) => (
              <div key={title} className="card card-pad row row-top" style={{ gap: 16 }}>
                <IconTile icon={Icon} size={48} />
                <div className="stack-xs">
                  <span className="eyebrow">Step {i + 1}</span>
                  <h3>{title}</h3>
                  <p className="small muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>Top-rated tradies</h2>
            <Link to="/tradies?sort=rating" className="btn btn-ghost">See all <ArrowRight size={17} /></Link>
          </div>
          <div className="grid grid-3">
            {top === null ? <Skeleton height={170} count={6} /> : top.map((t) => <TradieCard key={t.id} tradie={t} />)}
          </div>
          {top?.length === 0 && <p className="muted">No tradies have joined yet. <Link to="/register?role=tradie">Be the first!</Link></p>}
        </section>

        <section className="section card card-pad">
          <h2>What we check, and what we don't</h2>
          <p className="muted mt-xs mb-lg">We want you to know exactly what the information on Nearvo means.</p>
          <div className="grid grid-3">
            {[
              [BadgeCheck, 'ABN checked', 'Every tradie needs an active ABN, checked automatically with the Australian Business Register.', 'var(--teal)', 'var(--teal-bg)'],
              [Star, 'Reviews from real jobs', 'Only customers who hired a tradie through Nearvo can review them. Tradies can reply publicly.', 'var(--orange)', 'var(--orange-bg)'],
              [Flag, 'Report a problem', 'Anyone can report a review or profile. We look at every report, usually within 7 days.', 'var(--red)', 'var(--red-bg)'],
            ].map(([Icon, title, text, color, bg]) => (
              <div key={title} className="row row-top" style={{ gap: 14 }}>
                <IconTile icon={Icon} color={color} bg={bg} />
                <div><h4>{title}</h4><p className="small muted mt-xs">{text}</p></div>
              </div>
            ))}
          </div>
          <Alert type="info" className="mt-lg" icon={MessageSquareReply}>
            Nearvo doesn't check trade licences or insurance. Before work starts, ask your tradie for their licence and insurance details and check them with your state's licensing authority, especially for plumbing, gas, electrical and building work.
          </Alert>
        </section>

        {states.length > 0 && (
          <section className="section">
            <h2 className="mb">Tradies across Australia</h2>
            <div className="row wrap">
              {states.map((s) => <Link key={s.code} to={`/tradies?state=${s.code}`} className="chip chip-outline chip-lg">{s.name} · {s.tradie_count}</Link>)}
            </div>
          </section>
        )}

        {!user && (
          <section className="cta-band">
            <div>
              <span className="row bold small" style={{ opacity: 0.9 }}><HardHat size={18} /> FOR TRADIES</span>
              <h2 className="mt-sm">Get more local jobs</h2>
              <div className="stack-sm mt">
                {['See jobs posted in your service area', 'Quote only on the jobs you want', 'Build your reputation with reviews from real jobs'].map((t) => (
                  <span key={t} className="row"><CircleCheck size={18} />{t}</span>
                ))}
              </div>
            </div>
            <Link to="/register?role=tradie" className="btn btn-white btn-lg">Join as a tradie</Link>
          </section>
        )}
      </div>
    </>
  );
}
