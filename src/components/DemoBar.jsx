import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const VIEWS = [
  { label: 'Public website', sub: 'Visitor, signed out', to: '/', userId: null },
  { label: 'Client portal', sub: 'Ngozi Adebayo', to: '/portal', userId: 'u_ngozi' },
  { label: 'Lawyer workspace', sub: 'Halima Yusuf · Senior Associate', to: '/staff', userId: 'u_halima' },
  { label: 'Partner view', sub: 'Adaeze Okafor · Managing Partner', to: '/staff', userId: 'u_adaeze' },
];

export default function DemoBar() {
  const [open, setOpen] = useState(false);
  const { loginAs, logout, resetDemo, toast } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  if (loc.pathname.startsWith('/call')) return null;

  const go = (v) => {
    if (v.userId) loginAs(v.userId);
    else logout();
    setOpen(false);
    nav(v.to);
  };
  const reset = () => {
    if (!window.confirm('Reset all demo data back to the starting state?')) return;
    resetDemo();
    setOpen(false);
    nav('/');
    toast('Demo data reset');
  };

  return (
    <div className="demobar no-print">
      {open && (
        <div className="demobar-menu">
          <span className="demobar-title">Jump to a view</span>
          {VIEWS.map((v) => (
            <button key={v.label} type="button" onClick={() => go(v)}>
              <strong>{v.label}</strong>
              <span>{v.sub}</span>
            </button>
          ))}
          <button type="button" className="demobar-reset" onClick={reset}>Reset demo data</button>
        </div>
      )}
      <button type="button" className="demobar-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="demobar-dot" /> Demo
      </button>
    </div>
  );
}
