import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Pill, Portrait, IconSend, pickFile, Empty } from '../../components/ui';
import SlotPicker from '../../components/SlotPicker';
import DocViewer, { InvoiceViewer } from '../../components/DocViewer';
import { PaymentModal } from '../../components/Pay';
import { useStore } from '../../store';
import { FORMATS, STAGES, areaById, lawyerById, SUPPORT } from '../../data/static';
import { addMinutes, dateShort, daysUntil, dow, dayShort, isoDay, midnight, parseISO, timeAgo, iso, monthShort } from '../../lib/dates';
import { invoiceTotal, naira, initialsOf } from '../../lib/format';

export function useClientData() {
  const { db, user } = useStore();
  const id = user.id;
  const today = iso(midnight());
  const appts = db.appointments.filter((a) => a.clientId === id && a.status !== 'cancelled').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = appts.filter((a) => a.date >= today && a.status === 'confirmed');
  const past = appts.filter((a) => !(a.date >= today && a.status === 'confirmed')).reverse();
  const docs = db.documents.filter((d) => d.clientId === id).sort((a, b) => b.ts - a.ts);
  const invoices = db.invoices.filter((i) => i.clientId === id).sort((a, b) => b.issued - a.issued);
  const matters = db.matters.filter((m) => m.clientId === id);
  const messages = db.messages.filter((m) => m.clientId === id).sort((a, b) => a.ts - b.ts);
  const todos = [
    ...docs.filter((d) => d.status === 'needs-signature').map((d) => ({ type: 'sign', doc: d })),
    ...docs.filter((d) => d.status === 'requested').map((d) => ({ type: 'upload', doc: d })),
  ];
  return { db, user, appts, upcoming, past, docs, invoices, matters, messages, todos };
}

export function apptTitle(a) {
  const f = FORMATS.find((x) => x.id === a.format);
  return `${f.label} with ${lawyerById(a.lawyerId).name}`;
}

export function dueLabel(inv) {
  if (inv.status === 'paid') return `Paid ${dateShort(new Date(inv.paidAt))}`;
  const n = daysUntil(inv.due);
  if (n < 0) return `Overdue · was due ${dateShort(parseISO(inv.due))}`;
  return `Due ${dateShort(parseISO(inv.due))}`;
}

// ---------- Appointment actions ----------
export function RescheduleModal({ appt, onClose }) {
  const { db, rescheduleAppointment, toast } = useStore();
  const [sel, setSel] = useState({ date: appt.date, time: appt.time });
  const save = () => {
    if (!sel.date || !sel.time) return;
    if (rescheduleAppointment(appt.id, sel.date, sel.time)) {
      toast(`Rescheduled to ${isoDay(sel.date)}, ${sel.time}`);
      onClose();
    } else toast('That time was just taken — please pick another', 'warn');
  };
  return (
    <Modal
      title="Reschedule consultation"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Keep current time</button>
          <button type="button" className="btn btn-accent" onClick={save} disabled={!sel.time}>Confirm new time</button>
        </>
      }
    >
      <p className="modal-lead">{apptTitle(appt)} · currently {isoDay(appt.date)}, {appt.time}. Free to reschedule up to 24 hours before.</p>
      <SlotPicker lawyerIds={[appt.lawyerId]} appointments={db.appointments} value={sel} onChange={setSel} ignoreApptId={appt.id} />
    </Modal>
  );
}

export function CancelModal({ appt, onClose, byStaff }) {
  const { cancelAppointment, toast } = useStore();
  return (
    <Modal
      title="Cancel consultation"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Keep it</button>
          <button type="button" className="btn btn-danger" onClick={() => { cancelAppointment(appt.id); toast('Consultation cancelled'); onClose(); }}>Yes, cancel</button>
        </>
      }
    >
      <p className="modal-lead">
        {byStaff ? 'Cancel' : 'Cancel your'} {apptTitle(appt)} on {isoDay(appt.date)} at {appt.time}? {byStaff ? 'The client will be notified and refunded.' : 'Your consultation fee will be refunded to the original payment method within 3 working days.'}
      </p>
    </Modal>
  );
}

export function canChange(appt) {
  const start = new Date(`${appt.date}T${appt.time}:00`);
  return start - Date.now() > 24 * 3600 * 1000;
}

// ---------- Next appointment hero ----------
export function NextAppointment({ appt, onReschedule }) {
  const nav = useNavigate();
  const { toast } = useStore();
  const d = parseISO(appt.date);
  const n = daysUntil(appt.date);
  const when = n === 0 ? 'TODAY' : n === 1 ? 'IN 1 DAY' : `IN ${n} DAYS`;
  const area = areaById(appt.areaId);
  const end = addMinutes(appt.time, appt.dur);
  return (
    <section id="appts" className="next-appt">
      <div className="next-l">
        <div className="next-date"><span>{dow(d)}</span><b>{d.getDate()}</b><em>{monthShort(d)}</em></div>
        <div className="stack-6">
          <span className="eyebrow-sm eyebrow-sm-light">NEXT APPOINTMENT · {when}</span>
          <span className="next-t">{apptTitle(appt)}</span>
          <span className="next-s">{appt.time} – {end} WAT · {area.bookName}</span>
        </div>
      </div>
      <div className="next-btns">
        {appt.format === 'video' && <button type="button" className="btn btn-accent" onClick={() => nav(`/call/${appt.id}`)}>Join video call</button>}
        {appt.format === 'office' && <button type="button" className="btn btn-accent" onClick={() => toast('Directions sent to your WhatsApp')}>Get directions</button>}
        {appt.format === 'phone' && <button type="button" className="btn btn-accent" onClick={() => toast('Our team will call you at the scheduled time')}>How the call works</button>}
        <button type="button" className="btn btn-outline-light" onClick={onReschedule} disabled={!canChange(appt)} title={canChange(appt) ? '' : 'Less than 24 hours away — please call the office'}>Reschedule</button>
      </div>
    </section>
  );
}

// ---------- To-do list ----------
export function WaitingOnYou({ todos, onSign, onUpload }) {
  return (
    <section className="card">
      <h2 className="card-h">Waiting on you</h2>
      {todos.length === 0 && <Empty>You’re all caught up — nothing needs your attention.</Empty>}
      {todos.map((t, i) => (
        <div key={t.doc.id} className={`todo${i === 0 ? ' todo-first' : ''}`}>
          <span className="todo-b">
            <span className="todo-t">{t.type === 'sign' ? `Sign your ${t.doc.name.toLowerCase().includes('engagement') ? 'engagement letter' : 'document'}` : `Upload ${t.doc.name === 'Valid ID' ? 'a valid ID' : t.doc.name.toLowerCase()}`}</span>
            <span className="todo-d">{t.type === 'sign' ? 'Sets out the scope of work and fees for your matter' : t.doc.note || 'Requested by your lawyer'}</span>
          </span>
          {t.type === 'sign' ? (
            <button type="button" className="btn btn-navy btn-sm" onClick={() => onSign(t.doc)}>Review &amp; sign</button>
          ) : (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => onUpload(t.doc)}>Upload</button>
          )}
        </div>
      ))}
    </section>
  );
}

// ---------- Matter progress ----------
export function MatterCard({ matter }) {
  if (!matter) {
    return (
      <section className="card stack-14">
        <h2 className="card-h" style={{ marginBottom: 0 }}>Your matter</h2>
        <p className="muted-p">Your matter will appear here once your lawyer opens it after your consultation. You’ll see progress, updates and next steps in one place.</p>
      </section>
    );
  }
  const latest = matter.updates[0];
  return (
    <section className="card stack-22">
      <div className="card-top">
        <h2 className="card-h" style={{ marginBottom: 0 }}>Your matter: {matter.title}</h2>
        <span className="muted-sm">{matter.id}</span>
      </div>
      <ol className="tracker">
        {STAGES.map((s, i) => (
          <li key={s}>
            <span className={`tracker-bar${i < matter.stage ? ' t-done' : i === matter.stage ? ' now' : ''}`} />
            <span className={`tracker-l${i === matter.stage ? ' now' : i > matter.stage ? ' later' : ''}`}>{s}</span>
          </li>
        ))}
      </ol>
      {latest && (
        <p className="update"><b>Latest update · {dateShort(new Date(latest.ts))}</b> — {latest.text}</p>
      )}
    </section>
  );
}

// ---------- Documents ----------
export function DocRow({ doc, last, onOpen, onSign, onUpload }) {
  const status = {
    'needs-signature': <Pill tone="warn">Needs signature</Pill>,
    signed: <Pill tone="ok">Signed</Pill>,
    received: <Pill tone="neutral">Received</Pill>,
    shared: <Pill tone="neutral">Shared</Pill>,
    requested: <Pill tone="warn">Requested</Pill>,
  }[doc.status];
  const by = doc.by === 'you' ? 'Uploaded by you' : doc.by === 'system' ? 'Generated' : `Shared by ${doc.by}`;
  return (
    <div className={`doc-row${last ? ' last' : ''}`}>
      <span className={`doc-kind${doc.fileKind === 'PDF' ? ' pdf' : ''}`}>{doc.fileKind}</span>
      <span className="doc-b">
        <button type="button" className="doc-name" onClick={() => (doc.status === 'requested' ? onUpload(doc) : onOpen(doc))}>{doc.name}</button>
        <span className="doc-sub">{by} · {dateShort(new Date(doc.ts))}</span>
      </span>
      {status}
      {doc.status === 'needs-signature' && <button type="button" className="btn btn-navy btn-sm" onClick={() => onSign(doc)}>Review &amp; sign</button>}
      {doc.status === 'requested' && <button type="button" className="btn btn-outline btn-sm" onClick={() => onUpload(doc)}>Upload</button>}
      {doc.status === 'generated' && <button type="button" className="link-btn" onClick={() => onOpen(doc)}>Download</button>}
      {['received', 'signed', 'shared'].includes(doc.status) && <button type="button" className="link-btn" onClick={() => onOpen(doc)}>View</button>}
    </div>
  );
}

// Self-contained documents UI used on overview & the documents tab.
export function DocumentsSection({ limit, title = 'Documents' }) {
  const { db, user, signDocument, uploadDocument, toast } = useStore();
  const { docs, matters } = useClientData();
  const [viewing, setViewing] = useState(null);
  const shown = limit ? docs.slice(0, limit) : docs;
  const live = viewing ? db.documents.find((d) => d.id === viewing.id) : null;

  const upload = (requestDoc) =>
    pickFile((f) => {
      uploadDocument({ clientId: user.id, matterId: requestDoc?.matterId || matters[0]?.id || null, name: requestDoc ? f.name : f.name, size: f.size, requestId: requestDoc?.id, by: 'client' });
      toast(requestDoc ? `${requestDoc.name} uploaded` : 'File uploaded');
    });
  const sign = (name) => {
    signDocument(live.id, name);
    toast('Engagement letter signed — thank you');
  };

  return (
    <section id="docs" className="card">
      <div className="card-top card-top-c">
        <h2 className="card-h" style={{ marginBottom: 0 }}>{title}</h2>
        <button type="button" className="link-btn" onClick={() => upload(null)}>Upload file</button>
      </div>
      {shown.length === 0 && <Empty>No documents yet. Upload a file or wait for your lawyer to share one.</Empty>}
      {shown.map((d, i) => (
        <DocRow key={d.id} doc={d} last={i === shown.length - 1} onOpen={setViewing} onSign={setViewing} onUpload={upload} />
      ))}
      {limit && docs.length > limit && <Link to="/portal/documents" className="more-link">View all {docs.length} documents →</Link>}
      {live && <DocViewer doc={live} db={db} canSign onSign={sign} onClose={() => setViewing(null)} />}
    </section>
  );
}

// ---------- Invoices ----------
export function InvoicesSection({ compact }) {
  const { db, payInvoice, toast } = useStore();
  const { invoices } = useClientData();
  const [paying, setPaying] = useState(null);
  const [viewing, setViewing] = useState(null);
  const due = invoices.filter((i) => i.status !== 'paid');
  const live = viewing ? db.invoices.find((i) => i.id === viewing) : null;
  return (
    <section id="bills" className="card">
      <h2 className="card-h">Invoices</h2>
      {invoices.length === 0 && <Empty>No invoices yet.</Empty>}
      {invoices.map((inv, i) => (
        <div key={inv.id} className={`inv-row${i === invoices.length - 1 ? ' last' : ''}`}>
          <button type="button" className="inv-b" onClick={() => setViewing(inv.id)}>
            <span className="inv-t">{inv.id} · {inv.desc}</span>
            <span className={`inv-s${inv.status !== 'paid' ? ' due' : ''}`}>{dueLabel(inv)}</span>
          </button>
          <span className="inv-amt">{naira(invoiceTotal(inv))}</span>
          {!compact && inv.status !== 'paid' && <button type="button" className="btn btn-accent btn-sm" onClick={() => setPaying(inv)}>Pay</button>}
        </div>
      ))}
      {due.length > 0 && (
        <button type="button" className="btn btn-accent btn-block" style={{ marginTop: 14 }} onClick={() => setPaying(due[0])}>
          Pay {naira(invoiceTotal(due[0]))}
        </button>
      )}
      {paying && (
        <PaymentModal
          title={`Pay ${paying.id}`}
          amount={invoiceTotal(paying)}
          description={`${paying.desc} · ${paying.lines[0].desc}`}
          onClose={() => setPaying(null)}
          onPaid={(method) => { payInvoice(paying.id, method); toast(`Payment received — receipt for ${paying.id} added to your documents`); setPaying(null); }}
        />
      )}
      {live && <InvoiceViewer inv={live} db={db} onClose={() => setViewing(null)} />}
    </section>
  );
}

// ---------- Team ----------
export function TeamCard({ matter }) {
  const lawyer = matter ? lawyerById(matter.leadId) : null;
  return (
    <section className="card stack-16">
      <h2 className="card-h card-h-sm" style={{ marginBottom: 0 }}>Your legal team</h2>
      {lawyer ? (
        <>
          <div className="team-mini"><Portrait initials={lawyer.initials} /><span><span className="tm-n">{lawyer.name}</span><span className="tm-r">Lead lawyer</span></span></div>
          <div className="team-mini"><Portrait initials={SUPPORT[0].initials} /><span><span className="tm-n">{SUPPORT[0].name}</span><span className="tm-r">Paralegal</span></span></div>
        </>
      ) : (
        <p className="muted-p">Your team is assigned when your matter opens. Until then, your consultation lawyer is your point of contact.</p>
      )}
    </section>
  );
}

// ---------- Messages ----------
export function MessagesPanel({ full }) {
  const { user, sendMessage, markRead, toast } = useStore();
  const { messages } = useClientData();
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const unread = messages.filter((m) => m.from === 'staff' && !m.read).length;
  const shown = full ? messages : messages.slice(-2);

  useEffect(() => {
    if (full) markRead(user.id, 'client');
  }, [full, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (full) endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [full, messages.length]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({ clientId: user.id, text: text.trim(), from: 'client', senderName: user.name });
    markRead(user.id, 'client');
    setText('');
    toast('Message sent');
  };

  return (
    <section id="msgs" className="card stack-14">
      <div className="card-top card-top-c">
        <h2 className="card-h card-h-sm" style={{ marginBottom: 0 }}>Messages</h2>
        {unread > 0 && <span className="badge-new">{unread} new</span>}
      </div>
      {messages.length === 0 && <Empty>No messages yet. Write to your legal team below.</Empty>}
      <div className={full ? 'thread' : 'stack-10'}>
        {shown.map((m) => (
          <div key={m.id} className={`msg${m.from === 'client' ? ' msg-me' : ''}`}>
            <span className="msg-h">{m.from === 'client' ? 'You' : m.senderName} · {timeAgo(m.ts)}</span>
            <span className="msg-t">{m.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="reply">
        <label htmlFor={full ? 'reply-full' : 'reply'} className="label-sm">Reply</label>
        <div className="reply-row">
          <input id={full ? 'reply-full' : 'reply'} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" />
          <button type="submit" className="send-btn" aria-label="Send message"><IconSend size={18} stroke="#fff" /></button>
        </div>
      </form>
      {!full && <Link to="/portal/messages" className="more-link">Open conversation →</Link>}
    </section>
  );
}

export { initialsOf, dayShort };
