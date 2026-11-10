// Footer, logo, email banner and the auth page frame.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuFlag as Flag, LuMailWarning as MailWarning, LuMapPin as MapPin } from 'react-icons/lu';
import { api } from '../api.js';
import { STATES } from '../australia.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert } from './ui.jsx';

export function Logo({ light }) {
  return (
    <span className={`brand ${light ? 'light' : ''}`}>
      <span className="brand-mark"><MapPin size={20} strokeWidth={2.5} /></span>
      Nearvo
    </span>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo light />
            <p className="mt">Find local tradies anywhere in Australia. Post a job, compare quotes, hire who you like.</p>
          </div>
          <div>
            <h4>Browse by state</h4>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, auto)', gap: '6px 16px', justifyContent: 'start' }}>
              {STATES.map((s) => <Link key={s.code} to={`/tradies?state=${s.code}`}>{s.code}</Link>)}
            </div>
          </div>
          <div className="stack-sm">
            <h4>Nearvo</h4>
            <Link to="/jobs/new">Post a job</Link>
            <Link to="/tradies">Find a tradie</Link>
            <Link to="/register?role=tradie">Join as a tradie</Link>
          </div>
          <div className="stack-sm">
            <h4>Help & legal</h4>
            <Link to="/report"><Flag size={13} style={{ verticalAlign: '-2px' }} /> Report content / complaints</Link>
            <Link to="/terms">Terms of Use</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Nearvo</span>
          <span>Nearvo is a platform that connects customers and independent tradies. Tradies are not employed by Nearvo.</span>
          <span className="tiny" style={{ opacity: 0.55 }}>Version {__NEARVO_BUILD__}</span>
        </div>
      </div>
    </footer>
  );
}

export function EmailBanner() {
  const { user, refresh } = useAuth();
  const [state, setState] = useState('idle');
  if (!user || user.email_verified) return null;
  const resend = async () => {
    setState('sending');
    try {
      const r = await api('/auth/resend-verification', { method: 'POST' });
      if (r.already) await refresh();
      setState('sent');
    } catch {
      setState('error');
    }
  };
  return (
    <div className="container container-wide mt">
      <Alert type="info" icon={MailWarning} action={
        <button className="btn btn-sm btn-outline" onClick={resend} disabled={state === 'sending' || state === 'sent'}>
          {state === 'sent' ? 'Email sent' : state === 'sending' ? 'Sending…' : 'Resend email'}
        </button>}>
        Please confirm your email address. We sent a link to <b>{user.email}</b>.
        {user.role === 'customer' ? ' You can post jobs once it is confirmed.' : user.role === 'tradie' ? ' You can send quotes once it is confirmed.' : ''}
        {state === 'error' && ' Could not send right now, please try again shortly.'}
      </Alert>
    </div>
  );
}

export function AuthLayout({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="auth-wrap">
      <div className="container container-sm">
        <div className="card card-pad" style={{ boxShadow: '0 18px 50px var(--shadow-color)' }}>
          {Icon && <span className="tile" style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: 16 }}><Icon size={26} /></span>}
          <h1 className="center" style={{ fontSize: '1.6rem' }}>{title}</h1>
          {subtitle && <p className="muted center mt-sm">{subtitle}</p>}
          <div className="mt-lg">{children}</div>
        </div>
      </div>
    </div>
  );
}
