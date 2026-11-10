import { Link } from 'react-router-dom';
import { LuMapPin as MapPin, LuNavigation as Navigation } from 'react-icons/lu';
import { CategoryIcon } from './CategoryIcon.jsx';
import { AbnBadge, TradieAvatar } from './TradieBits.jsx';
import { Stars } from './ui.jsx';
import { formatDistance, priceLabel } from '../api.js';

export default function TradieCard({ tradie: t, active, onHover, highlightSlug }) {
  const services = highlightSlug ? [...t.services].sort((a, b) => (b.slug === highlightSlug) - (a.slug === highlightSlug)) : t.services;
  return (
    <Link
      to={`/tradies/${t.id}`}
      className="card card-hover card-link card-pad-sm"
      style={active ? { borderColor: 'var(--blue)', boxShadow: 'var(--shadow)' } : undefined}
      onMouseEnter={() => onHover?.(t.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="row row-top" style={{ gap: 16 }}>
        <TradieAvatar tradie={t} size={72} />
        <div className="grow stack-xs">
          <div className="row-between">
            <h4 className="ellipsis">{t.business_name}</h4>
            {t.distance_km != null && <span className="chip chip-blue"><Navigation size={13} />{formatDistance(t.distance_km)}</span>}
          </div>
          <div className="row small">
            <Stars value={t.avg_rating} size={15} />
            <span className="muted">{t.review_count ? `${t.avg_rating.toFixed(1)} (${t.review_count} review${t.review_count === 1 ? '' : 's'})` : 'No reviews yet'}</span>
          </div>
          <div className="row small muted">
            <MapPin size={14} />
            <span className="ellipsis">Based in {t.suburb} {t.state} · travels up to {t.service_radius_km} km</span>
          </div>
          <div className="row wrap mt-sm" style={{ gap: 6 }}>
            {services.slice(0, 3).map((s) => (
              <span key={s.category_id} className={`chip chip-outline ${s.slug === highlightSlug ? 'chip-blue' : ''}`}>
                <CategoryIcon icon={s.icon} size={14} /> {s.name} · {priceLabel(s)}
              </span>
            ))}
            <AbnBadge tradie={t} />
          </div>
        </div>
      </div>
    </Link>
  );
}
