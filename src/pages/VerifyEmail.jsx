import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleAlert, MailCheck } from 'lucide-react';
import { api } from '../api.js';
import { homeFor, useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../components/Layout.jsx';
import { LoadingPage } from '../components/ui.jsx';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const { user, refresh } = useAuth();
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // avoid a double submit in React StrictMode
    started.current = true;
    api('/auth/verify-email', { method: 'POST', body: { token: params.get('token') || '' } })
      .then(() => { setState('ok'); refresh().catch(() => {}); })
      .catch((e) => { setState('error'); setMessage(e.message); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'loading') return <LoadingPage />;
  const next = user ? homeFor(user) : '/login';
  return state === 'ok' ? (
    <AuthLayout icon={MailCheck} title="Email confirmed" subtitle="Thanks! Your account is ready to go.">
      <Link to={next} className="btn btn-primary btn-lg btn-block">{user ? (user.role === 'customer' ? 'Go to my jobs' : 'Continue') : 'Log in'}</Link>
    </AuthLayout>
  ) : (
    <AuthLayout icon={CircleAlert} title="Link not valid" subtitle={message}>
      <Link to={next} className="btn btn-primary btn-block">{user ? 'Continue' : 'Log in'}</Link>
    </AuthLayout>
  );
}
