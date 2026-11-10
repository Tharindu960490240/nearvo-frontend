// My account: name and phone (email shown, verified status). Uses PUT /api/auth/me.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LuKeyRound as KeyRound,
  LuTrash2 as Trash2,
  LuMail as Mail,
  LuPhone as Phone,
  LuSave as Save,
  LuShieldCheck as ShieldCheck,
  LuUserRound as UserRound,
} from 'react-icons/lu';
import { api } from '../api.js';
import { UserAvatar } from '../components/AppShell.jsx';
import PasswordRules from '../components/PasswordRules.jsx';
import { Alert, Modal, PasswordInput, Spinner, Switch, TextInput, showToast, useToast } from '../components/ui.jsx';
import { passwordOk, personalHints } from '../passwordRules.js';
import { ROLE_LABELS } from '../const/navigation.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useThemeMode } from '../context/ThemeContext.jsx';

function ChangePassword() {
  const { user, replaceToken } = useAuth();
  const hints = personalHints(user.name, user.email.split('@')[0], user.business_name);
  const toast = useToast();
  const [form, setForm] = useState({ current_password: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!passwordOk(form.password, hints)) return setError('Please choose a password that meets all the rules');
    setBusy(true);
    setError('');
    try {
      const r = await api('/auth/password', { method: 'PUT', body: form });
      replaceToken(r.token);
      setForm({ current_password: '', password: '' });
      toast('Password changed. Other devices have been logged out.');
    } catch (err) {
      setError(err.message); showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card card-pad mb">
      <div className="row mb"><KeyRound size={20} color="var(--brand)" /><h3>Change password</h3></div>
      <form className="stack" onSubmit={save}>
        <PasswordInput id="cur-pw" label="Current password" autoComplete="current-password" value={form.current_password}
          onChange={(e) => setForm({ ...form, current_password: e.target.value })} />
        <PasswordInput id="new-pw" label="New password" autoComplete="new-password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <PasswordRules password={form.password} hints={hints} />
        {error && <Alert type="error">{error}</Alert>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" disabled={busy || !form.current_password || !passwordOk(form.password, hints)}>
            {busy && <Spinner small white />}Change password
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await api('/auth/me', { method: 'DELETE', body: { password } });
      logout();
      toast('Your account has been deleted. Thanks for using Nearvo.', 'info');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message); showToast(err.message, 'error');
      setBusy(false);
    }
  };

  return (
    <div className="card card-pad mb" style={{ borderColor: 'var(--tint-red)' }}>
      <div className="row-between wrap">
        <div>
          <div className="row"><Trash2 size={20} color="var(--on-red)" /><h3>Delete my account</h3></div>
          <p className="small muted mt-xs">Removes your account and personal details for good.{user.role === 'customer' ? ' Your jobs and reviews are deleted too.' : user.role === 'tradie' ? ' Your profile, quotes and reviews are deleted too.' : ''}</p>
        </div>
        <button className="btn btn-danger" onClick={() => { setOpen(true); setPassword(''); setError(''); }}>Delete account</button>
      </div>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Delete your account?" width={460}
        actions={<>
          <button className="btn btn-outline" onClick={() => setOpen(false)} disabled={busy}>Keep my account</button>
          <button className="btn btn-danger-solid" onClick={remove} disabled={busy || !password}>{busy && <Spinner small white />}Delete for good</button>
        </>}>
        <div className="stack">
          <p className="muted">This can't be undone. Enter your password to confirm.</p>
          <PasswordInput id="del-pw" label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Alert type="error">{error}</Alert>}
        </div>
      </Modal>
    </div>
  );
}

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
      setError(err.message); showToast(err.message, 'error');
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

      <ChangePassword />

      {user.role === 'tradie' && (
        <div className="card card-pad row-between wrap mb">
          <div className="row"><ShieldCheck size={20} color="var(--brand)" /><span>ABN, services, prices and service area</span></div>
          <Link to="/tradie/profile" className="btn btn-outline">Edit tradie profile</Link>
        </div>
      )}
      <DeleteAccount />
    </div>
  );
}
