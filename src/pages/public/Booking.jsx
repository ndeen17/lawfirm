import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo, IconLock, IconCheck, IconUpload, Field, pickFile } from '../../components/ui';
import SlotPicker from '../../components/SlotPicker';
import { PayForm, Processing, usePay } from '../../components/Pay';
import { useStore } from '../../store';
import { BOOKABLE_AREAS, FORMATS, areaById, lawyerById, lawyersForArea } from '../../data/static';
import { nextOpen, slotsFor } from '../../lib/availability';
import { dayShort, dowTitle, parseISO, relativeDay, addMinutes } from '../../lib/dates';
import { naira, fileSize } from '../../lib/format';
import { DEMO_PASSWORD } from '../../data/seed';

const STEP_LABELS = ['Your issue', 'Lawyer & format', 'Date & time', 'Details & payment'];
const DEMO_DETAILS = { name: 'Ngozi Adebayo', email: 'ngozi.adebayo@example.com', phone: '+234 803 000 0000', reminder: 'WhatsApp', deadlines: '' };

function icsFor(appt, area, lawyer) {
  const [y, m, d] = appt.date.split('-');
  const stamp = (t) => `${y}${m}${d}T${t.replace(':', '')}00`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Harbor & Vale Legal//Booking//EN', 'BEGIN:VEVENT',
    `UID:${appt.id}@harborvale.legal`, `DTSTAMP:${stamp('00:00')}`,
    `DTSTART:${stamp(appt.time)}`, `DTEND:${stamp(addMinutes(appt.time, appt.dur))}`,
    `SUMMARY:Consultation with ${lawyer.name} (${area.bookName})`, 'LOCATION:Harbor & Vale Legal', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export default function Booking() {
  const { db, user, bookConsultation, toast } = useStore();
  const loc = useLocation();
  const pre = loc.state || {};
  const [step, setStep] = useState(pre.areaId ? 2 : 1);
  const [areaId, setAreaId] = useState(pre.areaId || 'family');
  const [brief, setBrief] = useState('');
  const [lawyerId, setLawyerId] = useState(pre.lawyerId || 'first');
  const [format, setFormat] = useState(pre.format || 'video');
  const [sel, setSel] = useState({ date: pre.date || null, time: pre.time || null });
  const [details, setDetails] = useState({ name: '', email: '', phone: '', reminder: 'WhatsApp', deadlines: '' });
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const pay = usePay();

  const area = areaById(areaId);
  const candidates = useMemo(() => (lawyerId === 'first' ? lawyersForArea(areaId) : [lawyerById(lawyerId)]).filter(Boolean), [lawyerId, areaId]);
  const candidateIds = candidates.map((l) => l.id);
  const lawyerOptions = useMemo(() => lawyersForArea(areaId), [areaId]);

  // Prefill from the signed-in client.
  useEffect(() => {
    if (user?.role === 'client') {
      setDetails((d) => ({ ...d, name: d.name || user.name, email: d.email || user.email, phone: d.phone || user.phone || '', reminder: user.reminder || d.reminder }));
    }
  }, [user]);

  // Make sure there's always a valid date/time selected when entering step 3.
  const ensureSlot = (ids = candidateIds) => {
    if (sel.date && sel.time && slotsFor(ids, sel.date, db.appointments).some((s) => s.time === sel.time && s.status === 'open')) return sel;
    const n = nextOpen(ids, db.appointments);
    const next = n ? { date: n.date, time: n.time } : { date: null, time: null };
    setSel(next);
    return next;
  };
  useEffect(() => {
    if (step === 3) ensureSlot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const assigned = useMemo(() => {
    if (lawyerId !== 'first') return lawyerById(lawyerId);
    if (sel.date && sel.time) {
      const hit = slotsFor(candidateIds, sel.date, db.appointments).find((s) => s.time === sel.time && s.status === 'open');
      if (hit) return lawyerById(hit.lawyerId);
    }
    return null;
  }, [lawyerId, sel, candidateIds, db.appointments]);

  const lawyerLabel = lawyerId === 'first' ? (assigned ? `${assigned.name} (first available)` : 'First available lawyer') : lawyerById(lawyerId)?.name;
  const whenLabel = sel.date && sel.time ? `${dayShort(parseISO(sel.date))}, ${sel.time}` : 'Choose a time';
  const format_ = FORMATS.find((f) => f.id === format);

  const validate = () => {
    const e = {};
    if (details.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) e.email = 'Please enter a valid email address.';
    if (details.phone.replace(/\D/g, '').length < 7) e.phone = 'Please enter a phone number.';
    if (!consent) e.consent = 'Please confirm to continue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!sel.date || !sel.time) return toast('Please choose a time first', 'warn');
      setStep(4);
      return;
    }
    if (step === 4) {
      if (!validate() || !pay.validate()) return;
      setBusy(true);
      setTimeout(() => {
        const res = bookConsultation({ areaId, lawyerId, format, date: sel.date, time: sel.time, brief, details, files, payMethod: pay.method });
        setResult(res);
        setBusy(false);
        setStep(5);
        window.scrollTo(0, 0);
      }, 1700);
      return;
    }
    setStep(step + 1);
  };
  const back = () => setStep(Math.max(1, step - 1));
  const nextLabel = step === 4 ? `Pay ${naira(area.fee)} & confirm` : 'Continue';

  const download = () => {
    const a = result.appointment;
    const blob = new Blob([icsFor(a, area, lawyerById(a.lawyerId))], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'harbor-vale-consultation.ics';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const restart = () => {
    setStep(1); setResult(null); setSel({ date: null, time: null }); setBrief(''); setFiles([]); setLawyerId('first'); setAreaId('family');
    window.scrollTo(0, 0);
  };

  return (
    <div className="book-page">
      <header className="book-header">
        <div className="wrap book-header-in">
          <Logo size="md" />
          <span className="secure"><IconLock size={16} stroke="#A4512A" />Secure &amp; confidential booking</span>
        </div>
      </header>

      <main className="wrap book-main">
        {step < 5 && (
          <>
            <ol className="stepper" aria-label="Progress">
              {STEP_LABELS.map((l, i) => (
                <li key={l}>
                  <span className={`stepper-bar${step >= i + 1 ? ' on' : ''}`} />
                  <span className="stepper-l"><b>0{i + 1}</b>{l}</span>
                </li>
              ))}
            </ol>
            <div className="m-progress"><span className="muted-sm" style={{ letterSpacing: '0.16em', fontWeight: 600 }}>STEP 0{step} OF 04</span><div className="bar"><div style={{ width: `${step * 25}%` }} /></div></div>

            <div className="book-grid">
              <section className="book-card-main">
                {step === 1 && (
                  <div className="stack-28">
                    <div className="stack-8"><h1 className="h1-sm">What do you need help with?</h1><p className="lead lead-sm">Choose the closest match. You can explain more below.</p></div>
                    <div className="choice-grid">
                      {BOOKABLE_AREAS.map((a) => (
                        <button key={a.id} type="button" aria-pressed={areaId === a.id} className={`choice${areaId === a.id ? ' choice-sel' : ''}`} onClick={() => { setAreaId(a.id); setLawyerId('first'); }}>
                          <span className="choice-t">{a.bookName}</span>
                          <span className="choice-d">From {naira(a.fee)} · {a.dur} min</span>
                        </button>
                      ))}
                    </div>
                    <div className="field">
                      <label htmlFor="brief">Briefly, what’s happening? <span className="field-hint">(optional)</span></label>
                      <textarea id="brief" rows={3} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. My spouse and I have separated and I want to understand custody arrangements for our two children." />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="stack-28">
                    <div className="stack-8"><h1 className="h1-sm">Who would you like to speak with?</h1><p className="lead lead-sm">Lawyers who handle {area.bookName.toLowerCase()}.</p></div>
                    <div className="stack-10">
                      {[{ id: 'first', initials: '—', name: 'First available lawyer', role: 'Fastest option — we match you' }, ...lawyerOptions].map((l) => {
                        const ids = l.id === 'first' ? lawyerOptions.map((x) => x.id) : [l.id];
                        const n = nextOpen(ids, db.appointments);
                        const nLabel = n ? `${relativeDay(n.date) === 'Today' || relativeDay(n.date) === 'Tomorrow' ? relativeDay(n.date) : dowTitle(parseISO(n.date))} ${n.time}` : '';
                        const on = lawyerId === l.id;
                        return (
                          <button key={l.id} type="button" aria-pressed={on} className={`lawyer-opt${on ? ' choice-sel' : ''}`} onClick={() => setLawyerId(l.id)}>
                            <span className="lawyer-opt-ph">{l.initials}</span>
                            <span className="lawyer-opt-b"><span className="choice-t">{l.name}</span><span className="choice-d">{l.role || `${l.title} · ${l.langs.join(', ')}`}</span></span>
                            <span className="lawyer-opt-n">{nLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="stack-10">
                      <span className="label-md">How would you like to meet?</span>
                      <div className="choice-grid choice-grid-s">
                        {FORMATS.map((f) => (
                          <button key={f.id} type="button" aria-pressed={format === f.id} className={`choice${format === f.id ? ' choice-sel' : ''}`} onClick={() => setFormat(f.id)}>
                            <span className="choice-t">{f.name}</span><span className="choice-d">{f.note}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="stack-28">
                    <div className="stack-8"><h1 className="h1-sm">Pick a date and time</h1><p className="lead lead-sm">West Africa Time (WAT). Only open slots are shown.</p></div>
                    <SlotPicker lawyerIds={candidateIds} appointments={db.appointments} value={sel} onChange={setSel} />
                    <div className="hold">We’ll hold {sel.time || 'your slot'} for you for 10 minutes while you finish booking.</div>
                  </div>
                )}

                {step === 4 && (
                  <div className="stack-24">
                    <div className="stack-8">
                      <h1 className="h1-sm">Your details</h1>
                      <p className="lead lead-sm">Shared only with your lawyer. Takes about a minute.</p>
                      {!user && <button type="button" className="link-btn self-start" onClick={() => setDetails(DEMO_DETAILS)}>Fill with demo details</button>}
                    </div>
                    <div className="form-grid">
                      <Field label="Full name" htmlFor="fn" error={errors.name}><input id="fn" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} autoComplete="name" /></Field>
                      <Field label="Email" htmlFor="em" error={errors.email}><input id="em" type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} autoComplete="email" /></Field>
                      <Field label="Phone" htmlFor="ph" error={errors.phone}><input id="ph" type="tel" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} autoComplete="tel" /></Field>
                      <Field label="Send reminders by" htmlFor="rm">
                        <select id="rm" value={details.reminder} onChange={(e) => setDetails({ ...details, reminder: e.target.value })}>
                          <option>WhatsApp</option><option>SMS</option><option>Email only</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Any court dates or deadlines coming up?" htmlFor="q1">
                      <input id="q1" value={details.deadlines} onChange={(e) => setDetails({ ...details, deadlines: e.target.value })} placeholder="e.g. hearing on 5 November" />
                    </Field>
                    <div className="upload-box" role="button" tabIndex={0} onClick={() => pickFile((f) => setFiles((x) => [...x, f]))} onKeyDown={(e) => e.key === 'Enter' && pickFile((f) => setFiles((x) => [...x, f]))}>
                      <IconUpload size={22} stroke="#A4512A" sw={1.6} />
                      <span className="stack-2"><span className="label-md">Upload documents (optional)</span><span className="muted-sm">PDF, photos or Word files, up to 20 MB each</span></span>
                    </div>
                    {files.length > 0 && (
                      <ul className="file-list">
                        {files.map((f, i) => (
                          <li key={i}><span>{f.name} <em>{fileSize(f.size)}</em></span><button type="button" className="link-btn" onClick={() => setFiles(files.filter((_, j) => j !== i))}>Remove</button></li>
                        ))}
                      </ul>
                    )}
                    <PayForm pay={pay} amount={area.fee} />
                    <label className="check">
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                      <span>I understand booking a consultation doesn’t make Harbor &amp; Vale my lawyers until we sign an engagement letter, and I agree to the privacy notice.{errors.consent && <span className="field-error"> {errors.consent}</span>}</span>
                    </label>
                  </div>
                )}

                <div className="book-actions">
                  <span className="m-only m-summary"><b>{whenLabel}</b><span>{naira(area.fee)}</span></span>
                  <div className="book-actions-btns">
                    {step > 1 ? <button type="button" className="btn btn-ghost" onClick={back}>Back</button> : <Link to="/" className="cancel-link">Cancel</Link>}
                    <button type="button" className="btn btn-accent" onClick={next}>{nextLabel}</button>
                  </div>
                </div>
              </section>

              <aside className="summary" aria-label="Booking summary">
                <span className="eyebrow eyebrow-light eyebrow-tight"><span className="eyebrow-rule" />YOUR CONSULTATION</span>
                <div className="sum-rows">
                  <div><span>Issue</span><span>{area.bookName}</span></div>
                  <div><span>Lawyer</span><span>{lawyerLabel}</span></div>
                  <div><span>Format</span><span>{format_.name}</span></div>
                  <div><span>When</span><span>{whenLabel}</span></div>
                  <div><span>Duration</span><span>{area.dur} min</span></div>
                </div>
                <div className="sum-total"><span>Total</span><strong>{naira(area.fee)}</strong></div>
                <span className="sum-note">Free to reschedule up to 24 hours before. Your slot is held for 10 minutes while you book.</span>
              </aside>
            </div>
          </>
        )}

        {step === 5 && result && (
          <section className="done">
            <span className="done-tick"><IconCheck size={28} stroke="#A4512A" /></span>
            <h1>You’re booked</h1>
            <p className="lead">
              {FORMATS.find((f) => f.id === result.appointment.format).label} with {lawyerById(result.appointment.lawyerId).name} on {dayShort(parseISO(result.appointment.date))}, {result.appointment.time}. A confirmation and receipt are on their way to your email and WhatsApp.
            </p>
            <span className="muted-sm">Reference {result.appointment.ref} · Receipt {result.invoiceId}</span>
            {result.newAccount && (
              <div className="callout">
                <strong>Your client portal is ready.</strong>
                <span>We’ve created an account for <b>{result.user.email}</b>. Demo password: <b>{DEMO_PASSWORD}</b></span>
              </div>
            )}
            <ol className="done-steps">
              <li><b>01</b> Your lawyer reviews your answers and documents.</li>
              <li><b>02</b> Reminders arrive 24 hours and 1 hour before.</li>
              <li><b>03</b> The video link is in your confirmation and client portal.</li>
            </ol>
            <div className="done-btns">
              <Link to="/portal" className="btn btn-navy">Go to client portal</Link>
              <button type="button" className="btn btn-ghost" onClick={download}>Add to calendar</button>
              <button type="button" className="link-btn" onClick={restart}>Start over</button>
            </div>
          </section>
        )}
      </main>
      {busy && <Processing label="Confirming your booking…" />}
    </div>
  );
}
