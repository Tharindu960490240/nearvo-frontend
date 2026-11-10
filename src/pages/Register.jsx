import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuHardHat as HardHat,
  LuHouse as House,
  LuMail as Mail,
  LuPhone as Phone,
  LuStore as Store,
  LuUser as User,
  LuUserPlus as UserPlus,
} from 'react-icons/lu';
import { homeFor, useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../components/Layout.jsx';
import AbnField from '../components/AbnField.jsx';
import PasswordRules from '../components/PasswordRules.jsx';
import { passwordOk, personalHints } from '../passwordRules.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Alert, CheckboxField, PasswordInput, Spinner, TextInput, showToast } from '../components/ui.jsx';

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
  const hints = personalHints(form.name, form.email.split('@')[0], form.business_name);

  const onAbr = (r) => {
    setAbr(r);
    // Pre-fill the business name from the register if the tradie hasn't typed one.
    if (r && r.source === 'abr') setForm((f) => (f.business_name ? f : { ...f, business_name: (r.business_names[0] || r.entity_name || '').slice(0, 150) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const stop = (m) => { setError(m); showToast(m, 'warning'); };
    if (role === 'tradie' && !abr) return stop('Please enter an active ABN or ACN. We check it with the Australian Business Register.');
    if (!passwordOk(form.password, hints)) return stop('Please choose a password that meets all the rules');
    if (!agree) return stop('Please agree to the Terms of Use and Privacy Policy');
    setBusy(true);
    setError('');
    try {
      const u = await register({ ...form, role, accept_terms: true });
      showToast(`Welcome to Nearvo, ${u.name.split(' ')[0]}! Check your email to confirm your address.`, 'success', { title: 'Account created' });
      navigate(location.state?.from && role === 'customer' ? location.state.from : homeFor(u), { replace: true });
    } catch (err) {
      setError(err.message); showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout icon={UserPlus} title="Create your account" subtitle="Free for customers and tradies">
      <form className="stack" onSubmit={submit}>
        <div className="role-pick" role="radiogroup" aria-label="Account type">
          {[
            ['customer', House, 'I need a tradie', 'Post jobs and get free quotes'],
            ['tradie', HardHat, "I'm a tradie", 'Find jobs near you and send quotes'],
          ].map(([key, Icon, title, text]) => (
            <button key={key} type="button" role="radio" aria-checked={role === key}
              className={`role-option ${role === key ? 'selected' : ''}`} onClick={() => setRole(key)}>
              <span className="role-icon"><Icon size={20} /></span>
              <span className="role-text"><span className="role-title">{title}</span><span className="role-sub">{text}</span></span>
              <span className="role-radio" aria-hidden="true" />
            </button>
          ))}
        </div>

        <TextInput label="Full name" icon={User} id="name" required autoComplete="name" value={form.name} onChange={set('name')} />
        {role === 'tradie' && (
          <>
            <AbnField value={form.abn} onChange={(v) => setForm((f) => ({ ...f, abn: v }))} onResult={onAbr} />
            <TextInput label="Business name" help="The name customers will see. You can change this later." icon={Store} id="bname" value={form.business_name} onChange={set('business_name')} />
          </>
        )}
        <TextInput label="Email" icon={Mail} id="email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
        <TextInput label={role === 'tradie' ? 'Mobile number' : 'Mobile number (optional)'} help={role === 'tradie' ? 'Shared only with customers who hire you' : 'Shared only with the tradie you hire'} icon={Phone} id="phone" type="tel" required={role === 'tradie'} autoComplete="tel" placeholder="0412 345 678" value={form.phone} onChange={set('phone')} />
        <PasswordInput label="Password" required id="password" autoComplete="new-password" minLength={8} value={form.password} onChange={set('password')} />
        <PasswordRules password={form.password} hints={hints} />
        <CheckboxField id="agree" checked={agree} onChange={setAgree}>
          <span>I agree to the <Link to="/terms" target="_blank">Terms of Use</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>{role === 'tradie' ? ', and confirm I hold any licences and insurance my work legally requires' : ''}.</span>
        </CheckboxField>
        {error && <Alert type="error">{error}</Alert>}
        <LoadingSpinner open={busy} text="Creating your account" />
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || (role === 'tradie' && !abr) || !agree || !passwordOk(form.password, hints)}>
          {busy && <Spinner small white />}{role === 'tradie' ? 'Join as a tradie' : 'Sign up'}
        </button>
        <p className="small muted center">Already have an account? <Link to="/login" state={location.state} className="bold">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}
