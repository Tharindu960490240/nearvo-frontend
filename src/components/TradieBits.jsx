// Reusable bits for showing tradies, jobs and quotes.
import { LuBadgeCheck as BadgeCheck } from 'react-icons/lu';
import { photoSrc } from '../api.js';

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export function TradieAvatar({ tradie, size = 64 }) {
  const src = photoSrc(tradie.photo_url);
  return (
    <span className="avatar avatar-sq" style={{ width: size, height: size, fontSize: size * 0.34, borderRadius: size > 90 ? 22 : 16 }}>
      {src ? <img src={src} alt={tradie.business_name} /> : initials(tradie.business_name)}
    </span>
  );
}

export function UserAvatar({ name = '', size = 40, soft }) {
  return (
    <span className={`avatar ${soft ? 'avatar-soft' : ''}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {name[0]?.toUpperCase()}
    </span>
  );
}

/** Shown when the ABN was confirmed with the Australian Business Register. */
export function AbnBadge({ tradie }) {
  if (!tradie.abn_active) return null;
  return (
    <span className="chip chip-teal" title="Active ABN confirmed with the Australian Business Register">
      <BadgeCheck size={15} /> ABN active
    </span>
  );
}

const JOB_STATUS = { open: ['Getting quotes', 'chip-blue'], assigned: ['Tradie hired', 'chip-amber'], completed: ['Completed', 'chip-green'], cancelled: ['Cancelled', ''] };
export const JobStatusChip = ({ status }) => {
  const [label, cls] = JOB_STATUS[status] || [status, ''];
  return <span className={`chip ${cls}`}>{label}</span>;
};

const QUOTE_STATUS = { pending: ['Awaiting decision', 'chip-blue'], accepted: ['Accepted', 'chip-green'], declined: ['Not selected', ''], withdrawn: ['Withdrawn', ''] };
export const QuoteStatusChip = ({ status }) => {
  const [label, cls] = QUOTE_STATUS[status] || [status, ''];
  return <span className={`chip ${cls}`}>{label}</span>;
};

export const AMOUNT_TYPE_LABEL = { fixed: 'fixed price', 'per hour': 'per hour', estimate: 'estimate' };
