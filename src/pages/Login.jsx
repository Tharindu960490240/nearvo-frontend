import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail } from 'lucide-react';
import { homeFor, useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../components/Layout.jsx';
import { Alert, Field, IconInput, PasswordInput, Spinner } from '../components/ui.jsx';

const DEMO = [['Customer', 'customer@example.com'], ['Tradie', 'sam@example.com'], ['Admin', 'admin@example.com']];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const doLogin = async (email, password) => {
    setBusy(true);
    setError('');
    try {
      const u = await login(email, password);
      navigate(location.state?.from || homeFor(u), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout icon={LogIn} title="Welcome back" subtitle="Log in to Nearvo">
      <form className="stack" onSubmit={(e) => { e.preventDefault(); doLogin(form.email, form.password); }}>
        <Field label="Email" htmlFor="email">
          <IconInput icon={Mail} id="email" type="email" required autoComplete="email" autoFocus value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password">
          <PasswordInput id="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        {error && <Alert type="error">{error}</Alert>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy && <Spinner small white />}Log in</button>
        <p className="small muted center">New to Nearvo? <Link to="/register" state={location.state} className="bold">Create an account</Link></p>
        <div className="center">
          <button type="button" className="link-btn small" onClick={() => setShowDemo(!showDemo)}>{showDemo ? 'Hide demo accounts' : 'Try a demo account'}</button>
          {showDemo && (
            <>
              <div className="row mt-sm" style={{ justifyContent: 'center' }}>
                {DEMO.map(([label, email]) => <button key={email} type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => doLogin(email, 'Demo@1234')}>{label}</button>)}
              </div>
              <p className="tiny muted mt-sm">Demo password: Demo@1234 (demo data only)</p>
            </>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
