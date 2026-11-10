import { LuCircle as Circle, LuCircleCheck as CircleCheck } from 'react-icons/lu';
import { PASSWORD_RULES } from '../passwordRules.js';

const LEVELS = ['Too weak', 'Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

/** Strength bar + live checklist under a password field. Each rule turns green once it's met. */
export default function PasswordRules({ password = '' }) {
  const met = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const level = met === PASSWORD_RULES.length ? 'strong' : met >= 3 ? 'fair' : 'weak';
  return (
    <div className={`pw-rules pw-${password ? level : 'empty'}`} aria-live="polite">
      <div className="pw-head">
        <span className="pw-title">Your password needs</span>
        {password && <span className="pw-level">{LEVELS[met]}</span>}
      </div>
      <div className="pw-meter" aria-hidden="true">
        {PASSWORD_RULES.map((r, i) => <span key={r.key} className={i < met ? 'on' : ''} />)}
      </div>
      <ul className="pw-list">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.key} className={ok ? 'ok' : ''}>
              {ok ? <CircleCheck size={16} /> : <Circle size={16} />}
              <span>{r.label}</span>
              <span className="sr-only">{ok ? ' (done)' : ' (needed)'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
