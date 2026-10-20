import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

export function Logo({ to = '/', size = 'lg', light = false, tagline = true, sub }) {
  const w = size === 'lg' ? 40 : size === 'md' ? 36 : 26;
  const navy = light ? '#FFFFFF' : '#1C2B4B';
  const accent = light ? '#E3A27F' : '#A4512A';
  return (
    <Link to={to} className={`logo logo-${size}`} aria-label="Harbor & Vale Legal home">
      <svg width={w} height={Math.round((w * 34) / 40)} viewBox="0 0 40 34" aria-hidden="true">
        <polygon points="8,0 18,0 10,34 0,34" fill={navy} />
        <polygon points="22,0 32,0 24,34 14,34" fill={accent} />
        {!light && <polygon points="33,0 40,0 33,30 29,30" fill="#1C2B4B" opacity="0.35" />}
      </svg>
      <span className="logo-text">
        <span className="logo-name" style={{ color: navy }}>
          Harbor &amp; Vale <span style={{ color: accent }}>Legal</span>
        </span>
        {sub ? <span className="logo-tag">{sub}</span> : tagline && size === 'lg' ? <span className="logo-tag">FAMILY &nbsp;|&nbsp; PROPERTY &nbsp;|&nbsp; CORPORATE &nbsp;|&nbsp; DISPUTES</span> : null}
      </span>
    </Link>
  );
}

const I = ({ children, size = 18, stroke = 'currentColor', sw = 1.8, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
);
export const IconLock = (p) => (<I {...p}><rect x="4" y="11" width="16" height="10" rx="1" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></I>);
export const IconLeft = (p) => (<I {...p}><path d="M15 18l-6-6 6-6" /></I>);
export const IconRight = (p) => (<I {...p}><path d="M9 18l6-6-6-6" /></I>);
export const IconCheck = (p) => (<I {...p}><path d="M20 6L9 17l-5-5" /></I>);
export const IconUpload = (p) => (<I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></I>);
export const IconSend = (p) => (<I {...p}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></I>);
export const IconMenu = (p) => (<I {...p}><path d="M3 6h18M3 12h18M3 18h18" /></I>);
export const IconClose = (p) => (<I {...p}><path d="M18 6L6 18M6 6l12 12" /></I>);
export const IconMic = (p) => (<I {...p}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></I>);
export const IconCam = (p) => (<I {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></I>);
export const IconPhone = (p) => (<I {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></I>);

export function Eyebrow({ children, light, tight }) {
  return (
    <span className={`eyebrow${light ? ' eyebrow-light' : ''}${tight ? ' eyebrow-tight' : ''}`}>
      <span className="eyebrow-rule" />
      {children}
    </span>
  );
}

export function Portrait({ initials, w = 48, h = 58, dark = false, big = false }) {
  return (
    <span className={`portrait${dark ? ' portrait-dark' : ''}${big ? ' portrait-big' : ''}`} style={big ? undefined : { width: w, height: h }}>
      {initials}
    </span>
  );
}

export function Pill({ tone = 'neutral', children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function Modal({ title, onClose, children, wide, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          <IconCheck size={16} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}{hint && <span className="field-hint"> {hint}</span>}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}

// Opens a file picker and calls back with { name, size }
export function pickFile(onFile, accept = '.pdf,.png,.jpg,.jpeg,.doc,.docx') {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = () => {
    const f = input.files && input.files[0];
    if (f) onFile({ name: f.name, size: f.size });
  };
  input.click();
}
