// Password rules + strength, shared by sign-up, reset and change password.
// The API checks the same things (nearvo-backend/src/lib/passwords.js), so keep both files in step.

export const PASSWORD_RULES = [
  { key: 'length', label: '8 or more characters', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'A capital letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'A small letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'A number (0–9)', test: (p) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'A symbol, e.g. @ $ ! % * ? &', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

// Very common passwords and words, checked after removing numbers/symbols and undoing
// look-alike swaps, so "P@ssw0rd123!" counts as "password".
const COMMON = new Set([
  'password', 'passwd', 'qwerty', 'qwertyuiop', 'asdf', 'asdfgh', 'zxcvbn', 'letmein', 'welcome', 'admin', 'administrator',
  'iloveyou', 'monkey', 'dragon', 'football', 'baseball', 'soccer', 'sunshine', 'princess', 'trustno', 'master', 'shadow',
  'superman', 'batman', 'michael', 'jennifer', 'login', 'secret', 'changeme', 'default', 'abc', 'abcd', 'abcdef', 'test',
  'guest', 'user', 'hello', 'freedom', 'whatever', 'starwars', 'pokemon', 'summer', 'winter', 'spring', 'autumn',
  'nearvo', 'tradie', 'tradies', 'plumber', 'electrician', 'australia', 'aussie', 'sydney', 'melbourne', 'brisbane',
  'perth', 'adelaide', 'hobart', 'canberra', 'darwin',
]);
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's', '!': 'i' };
// Drop numbers/symbols stuck on the start or end ("Password123!"), undo look-alikes ("P@ssw0rd"), keep letters.
const baseWord = (p) => p.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '').replace(/[013457@$!]/g, (c) => LEET[c]).replace(/[^a-z]/g, '');
const SEQUENCES = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function hasPattern(p) {
  const s = p.toLowerCase();
  if (/(.)\1{2,}/.test(s)) return true; // aaa, 111
  return SEQUENCES.some((seq) => {
    for (let i = 0; i + 4 <= seq.length; i += 1) {
      const part = seq.slice(i, i + 4);
      if (s.includes(part) || s.includes([...part].reverse().join(''))) return true;
    }
    return false;
  });
}

/** Words from the person's name/email that shouldn't be in their password. */
export function personalHints(...values) {
  return values.flatMap((v) => String(v || '').toLowerCase().split(/[^a-z0-9]+/)).filter((w) => w.length >= 3);
}

/**
 * level: 0 (empty) to 5. common / personal / pattern explain what's weakening it.
 * ok: true when it may be used (all rules met and not common or personal).
 */
export function passwordStrength(p = '', hints = []) {
  const met = PASSWORD_RULES.filter((r) => r.test(p)).length;
  const base = baseWord(p);
  const lower = p.toLowerCase();
  const common = p.length > 0 && (COMMON.has(base) || COMMON.has(lower) || /^\d+$/.test(p) || base.length < 3);
  const personal = hints.some((h) => lower.includes(h) || (base && base === h));
  const pattern = hasPattern(p);
  let level = !p ? 0 : met <= 2 ? 1 : met === 3 ? 2 : met === 4 ? 3 : p.length >= 12 && !pattern ? 5 : 4;
  if (common || personal) level = Math.min(level, 2);
  else if (pattern) level = Math.min(level, 3);
  return { level, met, common, personal, pattern, ok: met === PASSWORD_RULES.length && !common && !personal };
}

export const passwordOk = (p, hints = []) => passwordStrength(p || '', hints).ok;
