import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Logo, Modal } from '../../components/ui';
import { useStore } from '../../store';
import { DEMO_PASSWORD } from '../../data/seed';

const DEMOS = [
  { label: 'Client', name: 'Ngozi Adebayo', email: 'ngozi.adebayo@example.com', note: 'Upcoming consultation, an engagement letter to sign, an invoice to pay' },
  { label: 'Lawyer', name: 'Halima Yusuf', email: 'halima@harborvale.legal', note: 'Senior Associate · her own diary, clients and matters' },
  { label: 'Partner', name: 'Adaeze Okafor', email: 'adaeze@harborvale.legal', note: 'Managing Partner · whole-firm view and billing' },
];

export default function Login() {
  const { user, login, toast } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);

  if (user) return <Navigate to={user.role === 'client' ? '/portal' : '/staff'} replace />;

  const submit = (e) => {
    e.preventDefault();
    const u = login(email, password);
    if (!u) return setError('That email and password don’t match. Try one of the demo accounts below.');
    nav(u.role === 'client' ? '/portal' : '/staff');
  };

  return (
    <div className="login-page">
      <div className="login-wrap">
        <div className="login-top"><Logo size="md" /></div>
        <div className="login-grid">
          <form className="login-card" onSubmit={submit} noValidate>
            <h1 className="h1-sm">Sign in</h1>
            <p className="lead lead-sm">Clients: your private portal. Staff: your workspace.</p>
            <div className="field">
              <label htmlFor="le">Email</label>
              <input id="le" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div className="field">
              <label htmlFor="lp">Password</label>
              <input id="lp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error && <span className="field-error">{error}</span>}
            <button type="submit" className="btn btn-navy btn-block">Sign in</button>
            <div className="login-links">
              <button type="button" className="link-btn" onClick={() => setForgot(true)}>Forgot password?</button>
              <Link to="/book">New here? Book a consultation</Link>
            </div>
          </form>

          <div className="demo-card">
            <span className="eyebrow-sm">DEMO ACCOUNTS</span>
            <p className="muted-sm">Click an account to fill the form. Password for all: <b>{DEMO_PASSWORD}</b></p>
            {DEMOS.map((d) => (
              <button key={d.email} type="button" className="demo-acct" onClick={() => { setEmail(d.email); setPassword(DEMO_PASSWORD); setError(''); }}>
                <span className="demo-role">{d.label}</span>
                <span className="demo-main"><strong>{d.name}</strong><span>{d.email}</span><em>{d.note}</em></span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {forgot && (
        <Modal title="Reset your password" onClose={() => setForgot(false)} footer={<button type="button" className="btn btn-navy" onClick={() => { setForgot(false); toast('Reset link sent (demo)'); }}>Send reset link</button>}>
          <p className="modal-lead">Enter your email and we’ll send a reset link. (In this demo no email is sent — use the demo accounts instead.)</p>
          <div className="field"><label htmlFor="fe">Email</label><input id="fe" type="email" defaultValue={email} /></div>
        </Modal>
      )}
    </div>
  );
}
