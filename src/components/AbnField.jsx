import { useEffect, useRef, useState } from 'react';
import {
  LuBadgeCheck as BadgeCheck,
  LuBuilding2 as Building2,
  LuCircleAlert as CircleAlert,
  LuCircleCheck as CircleCheck,
} from 'react-icons/lu';
import { api } from '../api.js';
import { formatAbn } from '../australia.js';
import { Alert, Spinner, TextInput } from './ui.jsx';

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
    <div className="stack-sm">
      <TextInput id="abn" label={label} required={required} icon={Building2} value={value} onChange={(e) => onChange(e.target.value)}
        inputMode="numeric" autoComplete="off" placeholder="e.g. 51 824 753 556" error={state === 'error' ? error : ''}
        help={state === 'error' ? undefined : help} color={state === 'ok' ? 'success' : 'primary'} focused={state === 'ok' ? true : undefined}
        end={state === 'loading' ? <Spinner small /> : state === 'ok' ? <CircleCheck size={20} color="var(--on-teal)" />
          : state === 'error' ? <CircleAlert size={20} color="var(--on-red)" /> : null} />
      {state === 'ok' && result && (
        <Alert type="success" icon={BadgeCheck}>
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
        </Alert>
      )}
    </div>
  );
}
