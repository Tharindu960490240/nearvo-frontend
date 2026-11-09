import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { HardHat, House, Mail, Phone, Store, User, UserPlus } from 'lucide-react';
import { homeFor, useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../components/Layout.jsx';
import AbnField from '../components/AbnField.jsx';
import { Alert, Field, IconInput, PasswordInput, Spinner } from '../components/ui.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'tradie' ? 'tradie' : 'customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', business_name: '', abn: '' });
  const [abr, setAbr] = useState(null);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onAbr = (r) => {
    setAbr(r);
    // Pre-fill the business name from the register if the tradie hasn't typed one.
    if (r && r.source === 'abr') setForm((f) => (f.business_name ? f : { ...f, business_name: (r.business_names[0] || r.entity_name || '').slice(0, 150) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (role === 'tradie' && !abr) return setError('Please enter an active ABN or ACN. We check it with the Australian Business Register.');
    if (!agree) return setError('Please agree to the Terms of Use and Privacy Policy');
    setBusy(true);
    setError('');
    try {
      const u = await register({ ...form, role, accept_terms: true });
      navigate(location.state?.from && role === 'customer' ? location.state.from : homeFor(u), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout icon={UserPlus} title="Create your account" subtitle="Free for customers and tradies">
      <form className="stack" onSubmit={submit}>
        <div className="grid grid-2" style={{ gap: 10 }}>
          <button type="button" className={`choice ${role === 'customer' ? 'selected' : ''}`} onClick={() => setRole('customer')}>
            <House size={22} color={role === 'customer' ? 'var(--blue)' : 'var(--slate)'} />
            <span><span className="bold">I need a tradie</span><br /><span className="tiny muted">Post jobs & get quotes</span></span>
          </button>
          <button type="button" className={`choice ${role === 'tradie' ? 'selected' : ''}`} onClick={() => setRole('tradie')}>
            <HardHat size={22} color={role === 'tradie' ? 'var(--blue)' : 'var(--slate)'} />
            <span><span className="bold">I'm a tradie</span><br /><span className="tiny muted">Find jobs & send quotes</span></span>
          </button>
        </div>

        <Field label="Full name" required htmlFor="name"><IconInput icon={User} id="name" required autoComplete="name" value={form.name} onChange={set('name')} /></Field>
        {role === 'tradie' && (
          <>
            <AbnField value={form.abn} onChange={(v) => setForm((f) => ({ ...f, abn: v }))} onResult={onAbr} />
            <Field label="Business name" htmlFor="bname" help="The name customers will see. You can change this later.">
              <IconInput icon={Store} id="bname" value={form.business_name} onChange={set('business_name')} />
            </Field>
          </>
        )}
        <Field label="Email" required htmlFor="email"><IconInput icon={Mail} id="email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} /></Field>
        <Field label={role === 'tradie' ? 'Mobile number' : 'Mobile number (optional)'} required={role === 'tradie'} htmlFor="phone"
          help={role === 'tradie' ? 'Shared only with customers who hire you' : 'Shared only with the tradie you hire'}>
          <IconInput icon={Phone} id="phone" type="tel" required={role === 'tradie'} autoComplete="tel" placeholder="0412 345 678" value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Password" required htmlFor="password" help="At least 8 characters">
          <PasswordInput id="password" autoComplete="new-password" minLength={8} value={form.password} onChange={set('password')} />
        </Field>
        <label className="checkbox">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I agree to the <Link to="/terms" target="_blank">Terms of Use</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>{role === 'tradie' ? ', and confirm I hold any licences and insurance my work legally requires' : ''}.</span>
        </label>
        {error && <Alert type="error">{error}</Alert>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || (role === 'tradie' && !abr) || !agree}>
          {busy && <Spinner small white />}{role === 'tradie' ? 'Join as a tradie' : 'Sign up'}
        </button>
        <p className="small muted center">Already have an account? <Link to="/login" state={location.state} className="bold">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}
