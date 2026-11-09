import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { api } from '../api.js';
import { localityLabel } from '../australia.js';
import { Spinner } from './ui.jsx';

/**
 * Australian suburb / postcode autocomplete.
 * onSelect receives { id, name, state, postcode, latitude, longitude } or null when cleared.
 * bare = borderless input for use inside the search bar.
 */
export default function LocationInput({ value = '', onSelect, placeholder = 'Suburb or postcode', bare, id, required, label = 'Suburb or postcode' }) {
  const [text, setText] = useState(value);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hl, setHl] = useState(0);
  const boxRef = useRef(null);
  const reqId = useRef(0);

  useEffect(() => setText(value), [value]);

  useEffect(() => {
    const q = text.trim();
    if (q.length < 2 || q === value) { setItems([]); setLoading(false); return undefined; }
    const rid = ++reqId.current;
    setLoading(true);
    const t = setTimeout(() => {
      api('/suburbs', { params: { q } })
        .then((rows) => { if (rid === reqId.current) { setItems(rows); setHl(0); } })
        .catch(() => {})
        .finally(() => rid === reqId.current && setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [text, value]);

  useEffect(() => {
    const close = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const choose = (loc) => {
    setText(localityLabel(loc));
    setOpen(false);
    setItems([]);
    onSelect(loc);
  };

  const onKeyDown = (e) => {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHl((h) => (h + 1) % items.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHl((h) => (h - 1 + items.length) % items.length); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(items[hl]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  const input = (
    <input
      id={id}
      className={bare ? undefined : 'input'}
      value={text}
      placeholder={placeholder}
      aria-label={label}
      autoComplete="off"
      required={required}
      role="combobox"
      aria-expanded={open && items.length > 0}
      onChange={(e) => { setText(e.target.value); setOpen(true); if (!e.target.value.trim()) onSelect(null); }}
      onFocus={() => setOpen(true)}
      onKeyDown={onKeyDown}
    />
  );

  return (
    <div className="ac" ref={boxRef}>
      {bare ? input : (
        <div className="input-wrap" style={{ width: '100%' }}>
          <span className="input-icon"><MapPin size={18} color="var(--blue)" /></span>
          {input}
          {loading && <span className="input-end"><Spinner small /></span>}
        </div>
      )}
      {open && items.length > 0 && (
        <ul className="ac-menu" role="listbox">
          {items.map((l, i) => (
            <li key={l.id} role="option" aria-selected={i === hl} className={i === hl ? 'hl' : ''}
              onMouseEnter={() => setHl(i)} onMouseDown={(e) => { e.preventDefault(); choose(l); }}>
              <MapPin size={16} color="var(--blue)" />
              <span className="grow">{l.name}</span>
              <span className="small muted">{l.state} {l.postcode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
