// API address. Forgiving about the setting: a trailing "/" is removed and "/api" is added to a
// full backend address that leaves it out (e.g. https://nearvo-backend.vercel.app -> .../api).
const BASE = (() => {
  let b = String(import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(b) && !/\/api$/i.test(b)) b += '/api';
  return b || '/api';
})();
// Where uploaded profile photos are served (the API host). Empty = same origin (Vite proxies /uploads in dev).
export const FILES_BASE = import.meta.env.VITE_FILES_URL || '';
export const TOKEN_KEY = 'nearvo_token';

const authHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function handle(res) {
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.code = data?.code;
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function api(path, { method = 'GET', body, params } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

export async function upload(path, formData) {
  const res = await fetch(new URL(BASE + path, window.location.origin), { method: 'POST', headers: authHeader(), body: formData });
  return handle(res);
}

/** Fetches a protected file (e.g. an ID document for admins) and returns an object URL. */
export async function fetchBlobUrl(path) {
  const res = await fetch(new URL(BASE + path, window.location.origin), { headers: authHeader() });
  if (!res.ok) throw new Error('Could not load file');
  return URL.createObjectURL(await res.blob());
}

export const photoSrc = (url) => (url ? (url.startsWith('http') ? url : FILES_BASE + url) : undefined);

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not supported by your browser'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Could not get your location. Please allow location access or type your suburb.')),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export const formatDistance = (km) =>
  km == null ? null : km < 1 ? `${Math.round(km * 1000)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;

export const money = (n) =>
  n == null ? '' : `$${Number(n).toLocaleString('en-AU', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const priceLabel = (s) => (s.price_unit === 'on quote' || s.price_from == null ? 'On quote' : `From ${money(s.price_from)} ${s.price_unit}`);

export function timeAgo(date) {
  const s = Math.max(1, Math.round((Date.now() - new Date(date)) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
