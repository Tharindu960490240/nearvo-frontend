// Site-wide banner set by an admin. Visitors can close it; it comes back when the message changes.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuCircleCheck as CircleCheck, LuInfo as Info, LuMegaphone as Megaphone, LuTriangleAlert as TriangleAlert, LuX as X } from 'react-icons/lu';
import { api } from '../api.js';

const ICON = { info: Megaphone, warning: TriangleAlert, success: CircleCheck };
const DISMISS_KEY = 'nearvo_banner_closed';

export function AnnouncementBar({ a, onClose }) {
  const Icon = ICON[a.tone] || Info;
  const external = a.link_url && /^https?:\/\//.test(a.link_url);
  return (
    <div className={`announce announce-${a.tone || 'info'}`} role="status">
      <Icon size={18} />
      <span className="grow">
        {a.text}
        {a.link_url && (external
          ? <> <a href={a.link_url} target="_blank" rel="noreferrer">{a.link_label}</a></>
          : <> <Link to={a.link_url}>{a.link_label}</Link></>)}
      </span>
      {onClose && <button className="announce-x" onClick={onClose} aria-label="Close message"><X size={16} /></button>}
    </div>
  );
}

export default function Announcement() {
  const [a, setA] = useState(null);
  const [closed, setClosed] = useState(() => { try { return localStorage.getItem(DISMISS_KEY); } catch { return null; } });
  useEffect(() => { api('/announcement').then(setA).catch(() => {}); }, []);
  if (!a || closed === a.id) return null;
  const close = () => { try { localStorage.setItem(DISMISS_KEY, a.id); } catch { /* optional */ } setClosed(a.id); };
  return <AnnouncementBar a={a} onClose={close} />;
}
