// "Forgot password" (asks for an email) and "Reset password" (opened from the emailed link).
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LuKeyRound as KeyRound, LuMail as Mail, LuMailCheck as MailCheck } from 'react-icons/lu';
import { api } from '../api.js';
import { AuthLayout } from '../components/Layout.jsx';
import PasswordRules from '../components/PasswordRules.jsx';
import { Alert, PasswordInput, Spinner, TextInput, showToast, useToast } from '../components/ui.jsx';
import { passwordOk } from '../passwordRules.js';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email } });
      showToast('If that email has an account, a reset link is on its way.', 'info', { title: 'Check your email' });
      setSent(true);
    } catch (err) {
      setError(err.message); showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout icon={MailCheck} title="Check your email" subtitle={`If ${email} has a Nearvo account, we've sent a link to reset the password.`}>
        <div className="stack">
          <p className="small muted center">The link works for 1 hour. Not there? Check your spam folder, or try again in a few minutes.</p>
          <Link to="/login" className="btn btn-primary btn-block">Back to log in</Link>
        </div>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout icon={KeyRound} title="Forgot your password?" subtitle="Enter your email and we'll send you a link to choose a new one.">
      <form className="stack" onSubmit={submit}>
        <TextInput id="email" label="Email" icon={Mail} type="email" required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <Alert type="error">{error}</Alert>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy && <Spinner small white />}Send reset link</button>
        <p className="small muted center"><Link to="/login" className="bold">Back to log in</Link></p>
      </form>
    </AuthLayout>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!passwordOk(password)) return setError('Please choose a password that meets all the rules');
    setBusy(true);
    setError('');
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, password } });
      toast('Password changed. You can log in with your new password now.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message); showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return (
      <AuthLayout icon={KeyRound} title="Link not valid" subtitle="This reset link is incomplete or broken.">
        <Link to="/forgot-password" className="btn btn-primary btn-block">Ask for a new link</Link>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout icon={KeyRound} title="Choose a new password" subtitle="You'll be logged out everywhere else.">
      <form className="stack" onSubmit={submit}>
        <PasswordInput id="password" label="New password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <PasswordRules password={password} />
        {error && <Alert type="error" action={/expired|invalid/i.test(error) ? <Link to="/forgot-password" className="btn btn-sm btn-outline">New link</Link> : null}>{error}</Alert>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || !passwordOk(password)}>{busy && <Spinner small white />}Save new password</button>
      </form>
    </AuthLayout>
  );
}
