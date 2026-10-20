import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo, IconMenu, IconClose } from './ui';
import { useStore } from '../store';

// Navigates home (or stays) and scrolls to a section.
export function useSectionNav() {
  const nav = useNavigate();
  const loc = useLocation();
  return (id) => {
    if (loc.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      nav('/', { state: { scroll: id } });
    }
  };
}

function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useStore();
  const section = useSectionNav();
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);

  const sec = (id, label) => (
    <a
      href={`#/`}
      onClick={(e) => {
        e.preventDefault();
        setOpen(false);
        section(id);
      }}
    >
      {label}
    </a>
  );
  const portal = user ? (user.role === 'client' ? '/portal' : '/staff') : '/login';

  return (
    <header className="site-header">
      <div className="wrap site-header-in">
        <Logo />
        <button type="button" className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>
        <nav aria-label="Main" className={`main-nav${open ? ' open' : ''}`}>
          <NavLink to="/" end>Home</NavLink><span className="sep" aria-hidden="true">|</span>
          <NavLink to="/about">About</NavLink><span className="sep" aria-hidden="true">|</span>
          {sec('areas', 'Practice Areas')}<span className="sep" aria-hidden="true">|</span>
          {sec('lawyers', 'Our Lawyers')}<span className="sep" aria-hidden="true">|</span>
          {sec('insights', 'Insights')}<span className="sep" aria-hidden="true">|</span>
          {sec('contact', 'Contact')}
          <Link to={portal} className="nav-login">{user ? (user.role === 'client' ? 'My portal' : 'Staff workspace') : 'Client login'}</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const section = useSectionNav();
  const link = (id, label) => (
    <a href="#/" onClick={(e) => { e.preventDefault(); section(id); }}>{label}</a>
  );
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-top">
          <Logo light size="sm" />
          <nav aria-label="Footer" className="foot-nav">
            <Link to="/about">About</Link>
            {link('areas', 'Practice Areas')}
            {link('lawyers', 'Our Lawyers')}
            {link('insights', 'Insights')}
            <Link to="/login">Client login</Link>
          </nav>
        </div>
        <div className="foot-bot">
          <span>© 2026 John &amp; Doe Legal · Barristers &amp; Solicitors of the Supreme Court of Nigeria</span>
          <span className="foot-legal">{link('faq', 'Privacy notice')}{link('faq', 'Terms')}</span>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const loc = useLocation();
  useEffect(() => {
    const id = loc.state?.scroll;
    if (id) {
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } else {
      window.scrollTo(0, 0);
    }
  }, [loc.pathname, loc.state]);

  // Fade sections in as they scroll into view.
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    const t = setTimeout(() => {
      document.querySelectorAll('.site .sec > .wrap > *, .site .cta-band .wrap, .site .statement p').forEach((el) => {
        if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('reveal'); io.observe(el); }
      });
    }, 80);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [loc.pathname]);
  return (
    <div className="site">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
