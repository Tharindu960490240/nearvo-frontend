import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Building2, CircleAlert, CircleCheck } from 'lucide-react';
import { api } from '../api.js';
import { formatAbn } from '../australia.js';
import { Spinner } from './ui.jsx';

const digits = (s) => String(s || '').replace(/[\s-]/g, '');

/**
 * ABN / ACN input that checks the number with ABN Lookup (through our API) as the user types.
 * onResult(result | null): the confirmed business details, or null while not valid.
 * confirmed: details already stored for this number (no new lookup needed).
 */
export default function AbnField({ value, onChange, onResult, confirmed, required = true, label = 'ABN or ACN' }) {
  const [state, setState] = useState(confirmed ? 'ok' : 'idle');
  const [result, setResult] = useState(confirmed || null);
  const [error, setError] = useState('');
  const reqId = useRef(0);

  useEffect(() => {
    const n = digits(value);
    if (confirmed && (n === confirmed.abn || n === confirmed.acn)) {
      setState('ok'); setResult(confirmed); setError(''); onResult?.(confirmed);
      return undefined;
    }
    setResult(null);
    onResult?.(null);
    if (n.length !== 9 && n.length !== 11) { setState(n ? 'typing' : 'idle'); setError(''); return undefined; }
    const rid = ++reqId.current;
    setState('loading');
    const t = setTimeout(() => {
      api('/abr/lookup', { params: { number: n } })
        .then((r) => { if (rid !== reqId.current) return; setState('ok'); setResult(r); onResult?.(r); })
        .catch((e) => { if (rid !== reqId.current) return; setState('error'); setError(e.message); });
    }, 400);
    return () => clearTimeout(t);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const help = state === 'error' ? error
    : state === 'loading' ? 'Checking with ABN Lookup…'
    : state === 'typing' ? 'Enter all 11 digits of your ABN (or 9 for a company ACN)'
    : 'We check this with the Australian Business Register';

  return (
    <div className="field">
      <label htmlFor="abn">{label}{required && <span className="req">*</span>}</label>
      <div className="input-wrap">
        <span className="input-icon"><Building2 size={18} /></span>
        <input id="abn" className={`input has-end ${state === 'error' ? 'invalid' : state === 'ok' ? 'valid' : ''}`}
          value={value} onChange={(e) => onChange(e.target.value)} inputMode="numeric" autoComplete="off" placeholder="e.g. 51 824 753 556" />
        <span className="input-end">
          {state === 'loading' && <Spinner small />}
          {state === 'ok' && <CircleCheck size={20} color="var(--teal)" />}
          {state === 'error' && <CircleAlert size={20} color="var(--red)" />}
        </span>
      </div>
      <span className={`help ${state === 'error' ? 'error' : ''}`}>{help}</span>
      {state === 'ok' && result && (
        <div className="alert alert-success" style={{ padding: '10px 14px' }}>
          <BadgeCheck size={20} />
          <div className="alert-body">
            {result.source === 'checksum' || result.source === 'demo' ? (
              <span className="small">ABN format is valid{result.source === 'checksum' ? " (live ABN Lookup isn't set up on this server yet)" : ''}.</span>
            ) : (
              <>
                <div className="bold">{result.entity_name}</div>
                <div className="tiny">
                  ABN {formatAbn(result.abn)} · {result.status}{result.gst_registered ? ' · GST registered' : ''}{result.state ? ` · ${result.state} ${result.postcode || ''}` : ''}
                </div>
                {result.business_names?.length > 0 && <div className="tiny">Trading as: {result.business_names.slice(0, 3).join(', ')}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
