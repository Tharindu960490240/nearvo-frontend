// Role dashboard (AFC style): greeting, role chip, a few live numbers, then one card per menu item.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuArrowRight as ArrowRight,
  LuBadgeCheck as BadgeCheck,
  LuBriefcaseBusiness as BriefcaseBusiness,
  LuCircleCheck as CircleCheck,
  LuClipboardList as ClipboardList,
  LuFlag as Flag,
  LuHardHat as HardHat,
  LuMessageSquareQuote as MessageSquareQuote,
  LuTrophy as Trophy,
  LuUsers as Users,
} from 'react-icons/lu';
import { api } from '../api.js';
import AdminAlerts from '../components/AdminAlerts.jsx';
import { Alert, Stat } from '../components/ui.jsx';
import { navFor, ROLE_LABELS } from '../const/navigation.js';
import { useAuth } from '../context/AuthContext.jsx';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function useStats(user) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let live = true;
    const done = (s) => live && setStats(s);
    if (user.role === 'customer') {
      api('/jobs/mine').then((jobs) => done([
        { icon: ClipboardList, label: 'Open jobs', value: jobs.filter((j) => j.status === 'open').length },
        { icon: MessageSquareQuote, label: 'Quotes received', value: jobs.filter((j) => j.status === 'open').reduce((n, j) => n + (j.quote_count || 0), 0) },
        { icon: HardHat, label: 'Tradies hired', value: jobs.filter((j) => j.status === 'assigned').length },
        { icon: CircleCheck, label: 'Jobs completed', value: jobs.filter((j) => j.status === 'completed').length },
      ])).catch(() => done([]));
    } else if (user.role === 'tradie' && user.profile_complete && !user.suspended) {
      Promise.all([api('/jobs/leads'), api('/quotes/mine')]).then(([leads, quotes]) => done([
        { icon: BriefcaseBusiness, label: 'New jobs near you', value: leads.filter((l) => !l.my_quote_id).length },
        { icon: MessageSquareQuote, label: 'Quotes waiting', value: quotes.filter((q) => q.status === 'pending').length },
        { icon: Trophy, label: 'Jobs won', value: quotes.filter((q) => q.status === 'accepted').length },
      ])).catch(() => done([]));
    } else if (user.role === 'admin') {
      api('/admin/stats').then((s) => done([
        { icon: Flag, label: 'Open reports', value: s.open_reports, warn: s.open_reports > 0 },
        { icon: HardHat, label: 'Tradies', value: s.tradies },
        { icon: Users, label: 'Customers', value: s.customers },
        { icon: ClipboardList, label: 'Open jobs', value: s.open_jobs },
      ])).catch(() => done([]));
    } else done([]);
    return () => { live = false; };
  }, [user]);
  return stats;
}

export default function Dashboard() {
  const { user } = useAuth();
  const stats = useStats(user);
  const cards = navFor(user).filter((i) => !i.home);
  const firstName = user.name.split(' ')[0];

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <span className="role-chip">{ROLE_LABELS[user.role]}</span>
        <h1>{greeting()}, {firstName}</h1>
        <p className="muted">
          {user.role === 'customer' && 'Post a job, compare quotes from local tradies and hire the one you like.'}
          {user.role === 'tradie' && 'Find jobs in your area, send quotes and manage your profile.'}
          {user.role === 'admin' && 'Review reports and keep Nearvo safe and fair.'}
        </p>
      </div>

      {user.role === 'tradie' && user.suspended && (
        <Alert type="error" className="mb">Your profile is paused, so it is hidden from customers. Please contact us.</Alert>
      )}
      {user.role === 'tradie' && !user.suspended && !user.profile_complete && (
        <Alert type="warn" className="mb" action={<Link to="/tradie/profile" className="btn btn-sm btn-primary">Finish profile</Link>}>
          Add your ABN, base suburb and at least one service so customers can find you and you can see jobs.
        </Alert>
      )}
      {user.role === 'tradie' && user.profile_complete && (
        <div className="row small muted mb"><BadgeCheck size={16} color="var(--on-teal)" /> ABN checked with the Australian Business Register</div>
      )}

      {stats?.length > 0 && (
        <div className={`grid grid-${stats.length} mb-lg`}>
          {stats.map((s) => <Stat key={s.label} {...s} />)}
        </div>
      )}

      {user.role === 'admin' && <AdminAlerts />}

      <div className="dashboard-grid">
        {cards.map((c) => (
          <Link key={c.path} to={c.path} className="dashboard-card">
            <span className="dashboard-icon"><c.icon size={22} /></span>
            <ArrowRight size={18} className="dashboard-arrow" />
            <h3>{c.label}</h3>
            <p>{c.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
