// Navbar, footer, logo, email banner and the auth page frame.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList, Flag, HardHat, Inbox, LogIn, LogOut, MailWarning, MapPin, Menu, SquarePen, UserPlus, UserRoundSearch, BriefcaseBusiness, X,
} from 'lucide-react';
import { api, photoSrc } from '../api.js';
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

function linksFor(user) {
  if (!user) return [['/tradies', 'Find a tradie', UserRoundSearch], ['/register?role=tradie', 'For tradies', HardHat]];
  if (user.role === 'tradie') return [['/tradie', 'Find work', BriefcaseBusiness], ['/tradie/profile', 'My profile', SquarePen]];
  if (user.role === 'admin') return [['/admin', 'Reports', Inbox], ['/tradies', 'Tradies', UserRoundSearch]];
  return [['/tradies', 'Find a tradie', UserRoundSearch], ['/my-jobs', 'My jobs', ClipboardList]];
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const links = linksFor(user);
  const showPostJob = !user || user.role === 'customer';

  useEffect(() => { setDrawer(false); setMenu(false); }, [location.pathname]);
  useEffect(() => {
    const close = (e) => !menuRef.current?.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const doLogout = () => { logout(); navigate('/'); };
  const avatar = (
    <span className="avatar" style={{ width: 38, height: 38, fontSize: 16 }}>
      {user?.photo_url ? <img src={photoSrc(user.photo_url)} alt="" /> : user?.name[0]?.toUpperCase()}
    </span>
  );

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" style={{ marginRight: 'auto', textDecoration: 'none' }}><Logo /></Link>
        <nav className="nav-links" aria-label="Main">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end className="nav-link"><Icon size={18} />{label}</NavLink>
          ))}
          {showPostJob && <Link to="/jobs/new" className="btn btn-primary" style={{ marginLeft: 6 }}><SquarePen size={17} />Post a job</Link>}
          {user ? (
            <div className="dropdown" ref={menuRef}>
              <button className="avatar-btn" onClick={() => setMenu(!menu)} aria-label="Account menu" aria-expanded={menu}>{avatar}</button>
              {menu && (
                <div className="dropdown-menu">
                  <div className="dropdown-head">
                    <div className="bold ellipsis">{user.business_name || user.name}</div>
                    <div className="small muted ellipsis">{user.email}</div>
                  </div>
                  {links.map(([to, label, Icon]) => (
                    <Link key={to} to={to} className="dropdown-item"><Icon size={17} />{label}</Link>
                  ))}
                  <button className="dropdown-item" onClick={doLogout}><LogOut size={17} />Log out</button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="nav-link"><LogIn size={18} />Log in</NavLink>
          )}
        </nav>
        <button className="icon-btn nav-toggle" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={20} /></button>
      </div>

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
          <aside className="drawer" aria-label="Menu">
            <div className="row-between mb"><Logo /><button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu"><X size={20} /></button></div>
            {user && (
              <div className="row mb" style={{ gap: 12 }}>
                {avatar}
                <div className="grow"><div className="bold ellipsis">{user.business_name || user.name}</div><div className="small muted ellipsis">{user.email}</div></div>
              </div>
            )}
            {showPostJob && <Link to="/jobs/new" className="btn btn-primary btn-block mb"><SquarePen size={17} />Post a job</Link>}
            {links.map(([to, label, Icon]) => <NavLink key={to} to={to} end className="nav-link"><Icon size={18} />{label}</NavLink>)}
            {!user && <NavLink to="/login" className="nav-link"><LogIn size={18} />Log in</NavLink>}
            {!user && <NavLink to="/register" className="nav-link"><UserPlus size={18} />Sign up</NavLink>}
            {user && <button className="nav-link" style={{ border: 0, background: 'none', cursor: 'pointer' }} onClick={doLogout}><LogOut size={18} />Log out</button>}
          </aside>
        </>
      )}
    </header>
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
    <div className="container mt">
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
    <div style={{ padding: '56px 0', background: 'radial-gradient(700px 300px at 50% 0%, var(--sky-200) 0%, transparent 70%)' }}>
      <div className="container container-sm">
        <div className="card card-pad" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {Icon && <span className="tile" style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: 16 }}><Icon size={26} /></span>}
          <h1 className="center" style={{ fontSize: '1.6rem' }}>{title}</h1>
          {subtitle && <p className="muted center mt-sm">{subtitle}</p>}
          <div className="mt-lg">{children}</div>
        </div>
      </div>
    </div>
  );
}
