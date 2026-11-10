import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LuFilePlus2 as FilePlus2,
  LuList as List,
  LuLocateFixed as LocateFixed,
  LuMap as MapIcon,
  LuUserRoundSearch as UserRoundSearch,
  LuX as X,
} from 'react-icons/lu';
import { api, getCurrentPosition } from '../api.js';
import { STATES, localityLabel, stateName } from '../australia.js';
import { useAuth } from '../context/AuthContext.jsx';
import TradieCard from '../components/TradieCard.jsx';
import LocationInput from '../components/LocationInput.jsx';
import MapView from '../components/MapView.jsx';
import { Alert, Empty, Skeleton, TextInput } from '../components/ui.jsx';

const useIsDesktop = () => {
  const [d, setD] = useState(() => window.matchMedia('(min-width: 901px)').matches);
  useEffect(() => {
    const m = window.matchMedia('(min-width: 901px)');
    const on = () => setD(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return d;
};

export default function FindTradies() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ results: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState('list');
  const isDesktop = useIsDesktop();

  const lat = params.get('lat');
  const lng = params.get('lng');
  const near = params.get('near') || '';
  const hasLoc = Boolean(lat && lng);
  const slug = params.get('category') || '';
  const category = categories.find((c) => c.slug === slug);
  const state = params.get('state');
  const page = Number(params.get('page') || 1);

  useEffect(() => { api('/categories').then(setCategories).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    setError('');
    const { near: _n, ...apiParams } = Object.fromEntries(params);
    api('/tradies', { params: apiParams }).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [params]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };
  const clearLocation = () => update({ lat: '', lng: '', near: '', sort: params.get('sort') === 'distance' ? '' : params.get('sort') });
  const setPlace = (p) => (p ? update({ lat: p.latitude.toFixed(5), lng: p.longitude.toFixed(5), near: localityLabel(p), state: '' }) : clearLocation());
  const useMyLocation = async () => {
    try {
      const p = await getCurrentPosition();
      update({ lat: p.lat.toFixed(5), lng: p.lng.toFixed(5), near: 'My location', state: '' });
    } catch (e) {
      setError(e.message);
    }
  };

  const chips = [
    category && [category.name, { category: '' }],
    hasLoc && [`Covers ${near || 'your location'}`, null],
    state && [stateName(state), { state: '' }],
    params.get('q') && [`"${params.get('q')}"`, { q: '' }],
  ].filter(Boolean);

  const heading = `${category ? `${category.name}s` : 'Tradies'}${near ? ` who cover ${near}` : state ? ` in ${stateName(state)}` : ' across Australia'}`;
  const postJob = `/jobs/new${slug ? `?category=${slug}` : ''}`;

  return (
    <>
      <div style={{ background: 'var(--card-color)', borderBottom: '1px solid var(--border-color)', padding: '20px 0' }}>
        <div className="container container-wide">
          <div className="grid" style={{ gridTemplateColumns: isDesktop ? '240px minmax(0, 420px) auto auto auto' : '1fr', alignItems: 'start', gap: 12 }}>
            <TextInput id="trade" label="Trade" value={slug} onChange={(e) => update({ category: e.target.value })}
              options={[['', 'All trades'], ...categories.map((c) => [c.slug, c.name])]} />
            <LocationInput id="loc" label="Job location" value={near} onSelect={setPlace} />
            {!hasLoc && (
              <TextInput id="state" label="State" value={state || ''} onChange={(e) => update({ state: e.target.value })}
                options={[['', 'All of Australia'], ...STATES.map((s) => [s.code, s.name])]} />
            )}
            <TextInput id="sort" label="Sort by" value={params.get('sort') || ''} onChange={(e) => update({ sort: e.target.value })}
              options={[
                ['', hasLoc ? 'Nearest first' : 'Best rated'],
                ...(hasLoc ? [['distance', 'Nearest first (distance)']] : []),
                ['rating', 'Best rated'], ['price', 'Lowest price'], ['experience', 'Most experienced'], ['newest', 'Newest on Nearvo'],
              ]} />
            {!hasLoc && <button className="btn btn-outline" style={{ height: 56 }} onClick={useMyLocation}><LocateFixed size={17} />Use my location</button>}
          </div>
        </div>
      </div>

      <div className="container container-wide page">
        <div className="row-between mb">
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>{heading}</h1>
            <p className="small muted mt-xs">
              {loading ? 'Searching…' : `${data.total} tradie${data.total === 1 ? '' : 's'} found`}
              {hasLoc && ' · only tradies whose service area includes this location'}
            </p>
          </div>
          <div className="mobile-only"><div className="row">
            <button className={`icon-btn ${view === 'list' ? 'btn-soft' : ''}`} onClick={() => setView('list')} aria-label="List view"><List size={18} /></button>
            <button className={`icon-btn ${view === 'map' ? 'btn-soft' : ''}`} onClick={() => setView('map')} aria-label="Map view"><MapIcon size={18} /></button>
          </div></div>
        </div>

        {chips.length > 0 && (
          <div className="row wrap mb">
            {chips.map(([label, clear]) => (
              <span key={label} className="chip chip-blue chip-lg">
                {label}
                <button className="chip-x" onClick={() => (clear ? update(clear) : clearLocation())} aria-label={`Remove ${label}`}><X size={15} /></button>
              </span>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => setParams(new URLSearchParams())}>Clear all</button>
          </div>
        )}
        {error && <Alert type="error" className="mb" onClose={() => setError('')}>{error}</Alert>}
        {(!user || user.role === 'customer') && (
          <Alert type="info" icon={FilePlus2} className="mb" action={<Link to={postJob} className="btn btn-primary btn-sm">Post a job</Link>}>
            <b>Save time:</b> post your job once and let local tradies send you quotes.
          </Alert>
        )}

        <div className="split-even">
          {(isDesktop || view === 'list') && (
            <div className="stack-sm">
              {loading && !data.results.length ? <Skeleton height={160} count={4} /> : data.results.map((t) => (
                <TradieCard key={t.id} tradie={t} active={t.id === activeId} onHover={setActiveId} highlightSlug={slug} />
              ))}
              {!loading && !data.results.length && (
                <Empty icon={UserRoundSearch} title={`No tradies found${near ? ` covering ${near}` : ''}`}
                  action={<div className="row" style={{ justifyContent: 'center' }}>
                    <Link to={postJob} className="btn btn-primary"><FilePlus2 size={17} />Post a job</Link>
                    <button className="btn btn-outline" onClick={() => setParams(new URLSearchParams())}>Clear filters</button>
                  </div>}>
                  Post your job anyway. New tradies join regularly and we'll let matching tradies know.
                </Empty>
              )}
              {data.pages > 1 && (
                <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
                  <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>Previous</button>
                  <span className="small muted">Page {page} of {data.pages}</span>
                  <button className="btn btn-outline btn-sm" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })}>Next</button>
                </div>
              )}
            </div>
          )}
          {(isDesktop || view === 'map') && (
            <div className="sticky">
              <MapView
                points={data.results.map((t) => ({ id: t.id, latitude: t.latitude, longitude: t.longitude, title: t.business_name, subtitle: `Based in ${t.suburb} ${t.state}`, to: `/tradies/${t.id}` }))}
                userLocation={hasLoc ? { lat: Number(lat), lng: Number(lng) } : null}
                activeId={activeId}
                height={isDesktop ? 600 : 460}
              />
              <p className="tiny muted mt-sm">Pins show where each tradie is based.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
