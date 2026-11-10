// My account: name and phone (email shown, verified status). Uses PUT /api/auth/me.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuMail as Mail,
  LuPhone as Phone,
  LuSave as Save,
  LuShieldCheck as ShieldCheck,
  LuUserRound as UserRound,
} from 'react-icons/lu';
import { api } from '../api.js';
import { UserAvatar } from '../components/AppShell.jsx';
import { Alert, Spinner, Switch, TextInput, useToast } from '../components/ui.jsx';
import { ROLE_LABELS } from '../const/navigation.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useThemeMode } from '../context/ThemeContext.jsx';

export default function Account() {
  const { user, refresh } = useAuth();
  const { mode, toggle } = useThemeMode();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/me', { method: 'PUT', body: form });
      await refresh();
      toast('Your details were saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container container-md page">
      <h1>My account</h1>
      <p className="muted mt-xs mb-lg">Your contact details{user.role === 'tradie' ? '. Business details live in your tradie profile.' : '.'}</p>

      <div className="card card-pad mb">
        <div className="row mb-lg" style={{ gap: 14 }}>
          <UserAvatar user={user} size={56} />
          <div className="grow">
            <h3 className="ellipsis">{user.business_name || user.name}</h3>
            <span className="role-chip mt-xs" style={{ marginTop: 6 }}>{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
        <form className="stack" onSubmit={save}>
          <div className="form-row">
            <TextInput id="acc-name" label="Your name" icon={UserRound} required value={form.name} onChange={set('name')} autoComplete="name" />
            <TextInput id="acc-phone" label="Mobile number" icon={Phone} value={form.phone} onChange={set('phone')} inputMode="tel"
              autoComplete="tel" placeholder="0412 345 678" required={user.role === 'tradie'}
              help={user.role === 'tradie' ? 'Shown to customers who hire you' : 'Only shared with a tradie you hire'} />
          </div>
          <TextInput id="acc-email" label="Email address" icon={Mail} value={user.email} disabled
            help={user.email_verified ? 'Confirmed' : 'Not confirmed yet - check your inbox for the link'} />
          {error && <Alert type="error">{error}</Alert>}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" disabled={busy}>{busy ? <Spinner small white /> : <Save size={17} />}Save changes</button>
          </div>
        </form>
      </div>

      <div className="card card-pad mb">
        <h3 className="mb-sm">Appearance</h3>
        <Switch checked={mode === 'dark'} onChange={toggle}>Dark mode</Switch>
      </div>

      {user.role === 'tradie' && (
        <div className="card card-pad row-between wrap">
          <div className="row"><ShieldCheck size={20} color="var(--brand)" /><span>ABN, services, prices and service area</span></div>
          <Link to="/tradie/profile" className="btn btn-outline">Edit tradie profile</Link>
        </div>
      )}
    </div>
  );
}
