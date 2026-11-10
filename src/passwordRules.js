// Password rules shared by the sign-up form (the API checks the same rules in routes/auth.js).
export const PASSWORD_RULES = [
  { key: 'length', label: '8 or more characters', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'A capital letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'A small letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'A number (0–9)', test: (p) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'A symbol, e.g. @ $ ! % * ? &', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

export const passwordOk = (p) => PASSWORD_RULES.every((r) => r.test(p || ''));
