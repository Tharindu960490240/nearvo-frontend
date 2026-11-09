export const STATES = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NT', name: 'Northern Territory' },
];

export const stateName = (code) => STATES.find((s) => s.code === code)?.name || code;

// Centre of Australia, zoomed out to show the whole country.
export const AU_CENTER = [-26.5, 134.5];
export const AU_ZOOM = 4;

export const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 250];
export const DEFAULT_RADIUS = 25;

export const localityLabel = (l) => `${l.name} ${l.state} ${l.postcode}`;

export const formatAddress = (b) =>
  [b.address, [b.city, b.state, b.postcode].filter(Boolean).join(' ')].filter(Boolean).join(', ');

export const formatAbn = (abn) =>
  abn ? `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8)}` : '';
