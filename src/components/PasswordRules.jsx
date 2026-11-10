import { LuCircle as Circle, LuCircleCheck as CircleCheck } from 'react-icons/lu';
import { PASSWORD_RULES, passwordStrength } from '../passwordRules.js';

const LEVELS = [null, 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const TONE = [null, 'bad', 'bad', 'warn', 'good', 'good'];

/**
 * Strength bar + live checklist, so people see how strong the password is and which rule is missing.
 * hints: words from the person's name/email that shouldn't be in the password (see personalHints()).
 */
export default function PasswordRules({ password = '', hints = [] }) {
  const s = passwordStrength(password, hints);
  const tone = TONE[s.level] || 'empty';
  const tip = !password ? null
    : s.personal ? { warn: true, text: "Don't use your name or email address in your password." }
    : s.common ? { warn: true, text: 'This is a very common password that is easy to guess. Try a phrase only you would know.' }
    : s.pattern ? { warn: true, text: 'Avoid repeated characters and sequences like 1234, abcd or qwerty.' }
    : s.level === 4 ? { text: 'Tip: 12 or more characters makes it much stronger.' }
    : null;
  return (
    <div className={`pw-rules pw-${tone}`}>
      <div className="pw-head">
        <span className="pw-title">Your password needs</span>
        {s.level > 0 && <span className="pw-level" aria-live="polite">Strength: {LEVELS[s.level]}</span>}
      </div>
      <div className="pw-meter" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={5}
        aria-valuenow={s.level} aria-valuetext={LEVELS[s.level] || 'Empty'}>
        {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= s.level ? 'on' : ''} />)}
      </div>
      <ul className="pw-list">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.key} className={`${ok ? 'ok' : ''} ${r.key === 'symbol' ? 'full' : ''}`}>
              {ok ? <CircleCheck size={16} /> : <Circle size={16} />}
              <span>{r.label}</span>
              <span className="sr-only">{ok ? ' (done)' : ' (needed)'}</span>
            </li>
          );
        })}
      </ul>
      {tip && <div className={`pw-tip ${tip.warn ? 'warn' : ''}`}>{tip.text}</div>}
    </div>
  );
}
