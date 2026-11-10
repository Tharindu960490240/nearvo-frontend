import { LuCircle as Circle, LuCircleCheck as CircleCheck } from 'react-icons/lu';
import { PASSWORD_RULES } from '../passwordRules.js';

/** Live checklist under a password field: each rule turns green with a tick once it's met. */
export default function PasswordRules({ password = '' }) {
  return (
    <div className="pw-rules" aria-live="polite">
      <div className="pw-rules-title">Your password needs</div>
      <ul>
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
