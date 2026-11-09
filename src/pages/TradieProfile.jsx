import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, Building2, Calendar, CircleCheck, History, Info, MapPin, ReceiptText, Star } from 'lucide-react';
import { api, priceLabel, timeAgo } from '../api.js';
import { formatAbn } from '../australia.js';
import { useAuth } from '../context/AuthContext.jsx';
import MapView from '../components/MapView.jsx';
import ReportButton from '../components/ReportDialog.jsx';
import { CategoryTile } from '../components/CategoryIcon.jsx';
import { AbnBadge, TradieAvatar, UserAvatar } from '../components/TradieBits.jsx';
import { Alert, IconTile, LoadingPage, Stars } from '../components/ui.jsx';

function Fact({ icon, value, label }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <IconTile icon={icon} size={40} />
      <div><div className="xbold">{value}</div><div className="tiny muted">{label}</div></div>
    </div>
  );
}

export default function TradieProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [t, setT] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setT(null);
    api(`/tradies/${id}`).then(setT).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="container container-md page"><Alert type="error">{error}</Alert></div>;
  if (!t) return <LoadingPage />;

  const mainSlug = t.services[0]?.slug;
  const canRequest = !user || user.role === 'customer';
  const counts = [5, 4, 3, 2, 1].map((n) => t.reviews.filter((r) => r.rating === n).length);

  const quoteCard = (
    <div className="card card-pad card-accent">
      <h3>Need {t.business_name}?</h3>
      <p className="small muted mt-sm mb">
        Post your job and invite quotes. {t.business_name} will see it if your suburb is within {t.service_radius_km} km of {t.suburb}.
      </p>
      {canRequest ? (
        <Link to={`/jobs/new?category=${mainSlug}&tradie=${t.id}`} className="btn btn-primary btn-lg btn-block"><ReceiptText size={18} />Get a quote</Link>
      ) : (
        <Alert type="info">Log in as a customer to request quotes.</Alert>
      )}
      <p className="tiny muted mt">Contact details are shared once you accept a quote.</p>
    </div>
  );

  return (
    <div className="container page">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> /
        {mainSlug && <><Link to={`/tradies?category=${mainSlug}`}>{t.services[0].name}s</Link> /</>}
        <span className="ellipsis" style={{ color: 'var(--navy)', maxWidth: 220 }}>{t.business_name}</span>
      </nav>

      <div className="card mb-lg">
        <div className="card-strip" />
        <div className="card-pad row row-top wrap" style={{ gap: 24 }}>
          <TradieAvatar tradie={t} size={124} />
          <div className="grow stack-sm" style={{ minWidth: 240 }}>
            <div className="row wrap"><AbnBadge tradie={t} /></div>
            <h1>{t.business_name}</h1>
            <div className="row">
              <Stars value={t.avg_rating} size={18} />
              <span className="muted">{t.review_count ? `${t.avg_rating.toFixed(1)} · ${t.review_count} review${t.review_count === 1 ? '' : 's'}` : 'No reviews yet'}</span>
            </div>
            <div className="row small muted"><MapPin size={16} />Based in {t.suburb} {t.state} {t.postcode} · travels up to {t.service_radius_km} km</div>
            <div className="row wrap mt" style={{ gap: 28 }}>
              {t.years_experience != null && <Fact icon={History} value={`${t.years_experience} yrs`} label="Experience" />}
              <Fact icon={CircleCheck} value={t.jobs_completed} label="Jobs on Nearvo" />
              <Fact icon={Calendar} value={new Date(t.created_at).getFullYear()} label="Member since" />
            </div>
          </div>
        </div>
      </div>

      <div className="split">
        <div className="stack-lg">
          <div className="mobile-only">{quoteCard}</div>

          {t.bio && <div className="card card-pad"><h3 className="mb-sm">About</h3><p className="pre-line">{t.bio}</p></div>}

          <div className="card card-pad">
            <h3 className="mb">Services & prices</h3>
            <div className="list-divided">
              {t.services.map((s) => (
                <div key={s.category_id} className="row" style={{ gap: 14 }}>
                  <CategoryTile icon={s.icon} size={44} />
                  <span className="bold grow">{s.name}</span>
                  <span className="chip chip-blue">{priceLabel(s)}</span>
                </div>
              ))}
            </div>
            <p className="tiny muted mt">Prices are set by the tradie and are a guide only. Your quote will depend on the job.</p>
          </div>

          <div className="card card-pad">
            <h3 className="mb">Reviews</h3>
            {t.review_count > 0 && (
              <div className="row mb-lg" style={{ gap: 24 }}>
                <div className="center" style={{ minWidth: 96 }}>
                  <div style={{ fontSize: '2.6rem', fontWeight: 800 }}>{t.avg_rating.toFixed(1)}</div>
                  <Stars value={t.avg_rating} size={15} />
                  <div className="tiny muted">{t.review_count} review{t.review_count === 1 ? '' : 's'}</div>
                </div>
                <div className="grow stack-xs">
                  {counts.map((c, i) => (
                    <div key={i} className="row tiny" style={{ gap: 6 }}>
                      <span style={{ width: 10 }}>{5 - i}</span><Star size={12} fill="var(--amber)" strokeWidth={0} />
                      <span className="bar"><span style={{ width: `${(c / t.reviews.length) * 100}%` }} /></span>
                      <span className="muted" style={{ width: 16, textAlign: 'right' }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {t.reviews.length === 0 && <p className="muted">No reviews yet. Reviews come from customers who hired {t.business_name} through Nearvo.</p>}
            <div className="list-divided">
              {t.reviews.map((r) => (
                <div key={r.id}>
                  <div className="row" style={{ gap: 12 }}>
                    <UserAvatar name={r.customer_name} soft />
                    <div className="grow">
                      <div className="bold">{r.customer_name}</div>
                      <div className="row small"><Stars value={r.rating} size={14} /><span className="muted">{timeAgo(r.created_at)}</span></div>
                    </div>
                    <span className="chip chip-green desktop-only"><CircleCheck size={13} />Hired on Nearvo</span>
                  </div>
                  {r.comment && <p className="mt-sm" style={{ marginLeft: 52 }}>{r.comment}</p>}
                  <div className="row tiny muted wrap" style={{ marginLeft: 52, marginTop: 4 }}>
                    <span>{r.category_name} · {r.job_title} · {r.suburb}</span>
                    <ReportButton targetType="review" targetId={r.id} />
                  </div>
                  {r.reply && (
                    <div className="reply">
                      <div className="tiny bold blue-dark mb-sm">Reply from {t.business_name}</div>
                      {r.reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stack-lg sticky">
          <div className="desktop-only">{quoteCard}</div>
          <div>
            <MapView points={[{ id: t.id, latitude: t.latitude, longitude: t.longitude }]} circle={{ latitude: t.latitude, longitude: t.longitude, km: t.service_radius_km }} height={280} />
            <p className="tiny muted mt-sm">The shaded area shows where {t.business_name} travels to.</p>
          </div>
          <div className="card card-pad-sm stack-sm small">
            {t.abn && (
              <div className="row row-top">
                <Building2 size={17} className="muted" />
                <div>
                  ABN <a href={`https://abr.business.gov.au/ABN/View?abn=${t.abn}`} target="_blank" rel="noreferrer">{formatAbn(t.abn)}</a>
                  {t.abn_active ? ' · Active' : ''}{t.abn_gst_registered ? ' · GST registered' : ''}
                  {t.abn_entity_name && <div className="tiny muted">Registered to {t.abn_entity_name}</div>}
                </div>
              </div>
            )}
            {t.licence_number && (
              <div className="row row-top">
                <BadgeCheck size={17} className="muted" />
                <div>Licence no. {t.licence_number}<div className="tiny muted">Provided by the tradie, not checked by Nearvo. Check it with your state's licensing authority.</div></div>
              </div>
            )}
            <div className="row"><Info size={17} className="muted" /><ReportButton targetType="tradie" targetId={t.id} label="Report this profile" className="link-btn small" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
