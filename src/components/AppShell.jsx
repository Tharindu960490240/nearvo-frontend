// AFC-style app shell: sticky top header + collapsible side menu (slide-out drawer on phones).
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import {
  LuChevronsLeft as ChevronsLeft,
  LuChevronsRight as ChevronsRight,
  LuChevronDown as ChevronDown,
  LuHardHat as HardHat,
  LuLayoutDashboard as LayoutDashboard,
  LuLogIn as LogIn,
  LuLogOut as LogOut,
  LuMenu as Menu,
  LuMoon as Moon,
  LuSquarePen as SquarePen,
  LuSun as Sun,
  LuUserPlus as UserPlus,
  LuUserRound as UserRound,
  LuUserRoundSearch as UserRoundSearch,
  LuX as X,
} from 'react-icons/lu';
import { photoSrc } from '../api.js';
import { navFor, ROLE_LABELS } from '../const/navigation.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useThemeMode } from '../context/ThemeContext.jsx';
import { Logo } from './Layout.jsx';

const TOGGLE_EVENT = 'nearvo:toggle-sidenav';
const COLLAPSE_KEY = 'sideNavCollapsed';

const GUEST_ITEMS = [
  { icon: UserRoundSearch, label: 'Find a tradie', path: '/tradies' },
  { icon: SquarePen, label: 'Post a job', path: '/jobs/new' },
  { icon: HardHat, label: 'For tradies', path: '/register?role=tradie' },
  { icon: LogIn, label: 'Log in', path: '/login', group: 'Account' },
  { icon: UserPlus, label: 'Sign up', path: '/register' },
];

export function UserAvatar({ user, size = 36 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {user?.photo_url ? <img src={photoSrc(user.photo_url)} alt="" /> : (user?.business_name || user?.name || '?')[0].toUpperCase()}
    </span>
  );
}

function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  const dark = mode === 'dark';
  return (
    <Tooltip title={dark ? 'Light mode' : 'Dark mode'}>
      <button className="icon-btn" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
        {dark ? <Sun size={19} /> : <Moon size={19} />}
      </button>
    </Tooltip>
  );
}

export function TopHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => setMenu(false), [location.pathname]);
  useEffect(() => {
    const close = (e) => !menuRef.current?.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const doLogout = () => { logout(); navigate('/'); };
  const canPost = !user || user.role === 'customer';

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn plain mobile-menu-icon" onClick={() => window.dispatchEvent(new Event(TOGGLE_EVENT))} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <Link to={user ? '/dashboard' : '/'} aria-label="Nearvo home"><Logo /></Link>
      </div>

      {!user && (
        <nav className="header-center" aria-label="Main">
          <NavLink to="/tradies" className="nav-item"><UserRoundSearch size={18} />Find a tradie</NavLink>
          <NavLink to="/register?role=tradie" className="nav-item"><HardHat size={18} />For tradies</NavLink>
        </nav>
      )}

      <div className="header-right">
        {canPost && <Link to="/jobs/new" className="btn btn-primary desktop-only"><SquarePen size={17} />Post a job</Link>}
        <ThemeToggle />
        {user ? (
          <div className="dropdown" ref={menuRef}>
            <button className="profile-btn" onClick={() => setMenu(!menu)} aria-label="Account menu" aria-expanded={menu}>
              <UserAvatar user={user} />
              <span className="profile-meta">
                <strong>{user.business_name || user.name}</strong>
                <span>{ROLE_LABELS[user.role]}</span>
              </span>
              <ChevronDown size={16} className="desktop-only" />
            </button>
            {menu && (
              <div className="dropdown-menu">
                <div className="dropdown-head">
                  <div className="bold ellipsis">{user.business_name || user.name}</div>
                  <div className="small muted ellipsis">{user.email}</div>
                </div>
                <Link to="/dashboard" className="dropdown-item"><LayoutDashboard size={17} />Dashboard</Link>
                <Link to="/account" className="dropdown-item"><UserRound size={17} />My account</Link>
                <button className="dropdown-item" onClick={doLogout}><LogOut size={17} />Sign out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-ghost desktop-only"><LogIn size={18} />Log in</Link>
        )}
      </div>
    </header>
  );
}

export function SideNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener(TOGGLE_EVENT, toggle);
    return () => window.removeEventListener(TOGGLE_EVENT, toggle);
  }, []);
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem(COLLAPSE_KEY, String(!c)); } catch { /* optional */ }
      return !c;
    });
  };

  const items = user ? navFor(user) : GUEST_ITEMS;
  const doLogout = () => { logout(); navigate('/'); };

  const item = (i) => {
    const content = (
      <NavLink key={i.path} to={i.path} end className={({ isActive }) => `sidenav-item ${isActive ? 'is-active' : ''}`}>
        <i.icon /><span className="sidenav-label">{i.label}</span>
      </NavLink>
    );
    return collapsed ? <Tooltip key={i.path} title={i.label} placement="right">{content}</Tooltip> : content;
  };

  return (
    <>
      <div className={`sidenav-backdrop ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidenav ${collapsed ? 'is-collapsed' : ''} ${open ? 'is-open' : ''} ${user ? '' : 'guest'}`} aria-label="Side menu">
        <div className="sidenav-mobile-head">
          {user ? (
            <div className="row" style={{ gap: 10, minWidth: 0 }}>
              <UserAvatar user={user} size={40} />
              <div className="grow"><strong className="ellipsis" style={{ display: 'block' }}>{user.business_name || user.name}</strong><span>{ROLE_LABELS[user.role]}</span></div>
            </div>
          ) : <Logo />}
          <button className="icon-btn plain" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="sidenav-list">
          {items.map((i) => (
            <div key={i.path}>
              {i.group && <div className="sidenav-group">{i.group}</div>}
              {item(i)}
            </div>
          ))}
        </nav>
        <div className="sidenav-footer">
          {user && (
            <button className="sidenav-item sidenav-signout" onClick={doLogout}>
              <LogOut /><span className="sidenav-label">Sign out</span>
            </button>
          )}
          {user && (
            <button className="sidenav-item sidenav-collapse" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}>
              {collapsed ? <ChevronsRight /> : <ChevronsLeft />}<span className="sidenav-label">Collapse menu</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
