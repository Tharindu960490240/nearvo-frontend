// Business details shown on the Terms, Privacy and Report pages.
// Fill these in (or set them in .env) before launch.
export const SITE = {
  name: 'Nearvo',
  legalName: import.meta.env.VITE_LEGAL_NAME || '[Your business or company name]',
  abn: import.meta.env.VITE_BUSINESS_ABN || '[Your ABN]',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || '[support@yourdomain.com.au]',
  state: import.meta.env.VITE_BUSINESS_STATE || '[your state, e.g. Tasmania]',
  hostingLocation: import.meta.env.VITE_HOSTING_LOCATION || '[where your servers are, e.g. Sydney, Australia]',
  lastUpdated: import.meta.env.VITE_LEGAL_UPDATED || '[date]',
};
