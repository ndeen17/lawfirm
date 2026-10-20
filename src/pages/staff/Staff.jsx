import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Logo, Empty, Pill } from '../../components/ui';
import DocViewer, { InvoiceViewer } from '../../components/DocViewer';
import { useStore } from '../../store';
import { STAGES, areaById, lawyerById } from '../../data/static';
import { dateShort, greeting, isoDay, relativeDay, timeAgo, parseISO, daysUntil, dayShort } from '../../lib/dates';
import { initialsOf, invoiceTotal, naira } from '../../lib/format';
import { CancelModal, RescheduleModal, apptTitle, dueLabel } from '../portal/parts';
import { ApptMeta, NewInvoiceModal, OpenMatterModal, ShareDocModal, StagePanel, fmtTone, useStaffData } from './staffParts';

export function StaffLayout() {
  const { user, logout } = useStore();
  const nav = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'client') return <Navigate to="/portal" replace />;
  return (
    <div className="portal staff">
      <header className="portal-head">
        <div className="wrap portal-head-in">
          <Logo size="md" tagline={false} sub={user.role === 'partner' ? 'PARTNER WORKSPACE' : 'LAWYER WORKSPACE'} />
          <nav aria-label="Workspace" className="portal-nav">
            <NavLink to="/staff" end>Dashboard</NavLink>
            <NavLink to="/staff/diary">Diary</NavLink>
            <NavLink to="/staff/clients">Clients &amp; matters</NavLink>
            <NavLink to="/staff/invoices">Billing</NavLink>
            <InboxLink />
          </nav>
          <span className="who-menu">
            <span className="avatar avatar-navy">{initialsOf(user.name)}</span>
            <span className="who-name">{user.name}</span>
            <button type="button" className="link-btn" onClick={() => { logout(); nav('/'); }}>Sign out</button>
          </span>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

function InboxLink() {
  const { messages } = useStaffData();
  const unread = messages.filter((m) => m.from === 'client' && !m.read).length;
  return <NavLink to="/staff/messages">Inbox{unread > 0 && <i className="nav-dot">{unread}</i>}</NavLink>;
}

// ---------- shared appointment row with actions ----------
function ApptRow({ a, showLawyer, onOpenMatter }) {
  const { completeAppointment, toast } = useStore();
  const { clientById, db } = useStaffData();
  const nav = useNavigate();
  const [resched, setResched] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [open, setOpen] = useState(false);
  const client = clientById(a.clientId);
  const isNew = Date.now() - a.createdAt < 48 * 3600 * 1000 && a.status === 'confirmed';
  const upcoming = a.status === 'confirmed';
  const hasMatter = !!a.matterId && db.matters.some((m) => m.id === a.matterId);
  return (
    <div className="s-appt">
      <div className="s-appt-time"><span>{relativeDay(a.date)}</span><b>{a.time}</b></div>
      <div className="s-appt-b">
        <span className="s-appt-t">
          <Link to={`/staff/clients/${client.id}`}>{client.name}</Link>
          {isNew && <Pill tone="accent">New booking</Pill>}
          {a.status !== 'confirmed' && <Pill tone={fmtTone(a.status)}>{a.status[0].toUpperCase() + a.status.slice(1)}</Pill>}
        </span>
        <span className="s-appt-s"><ApptMeta a={a} /></span>
        {a.brief && (
          <button type="button" className="brief-toggle" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} client’s note</button>
        )}
        {open && <p className="brief">{a.brief}{a.deadlines ? ` — Deadlines: ${a.deadlines}` : ''}</p>}
      </div>
      <div className="s-appt-act">
        {upcoming && a.format === 'video' && <button type="button" className="btn btn-navy btn-sm" onClick={() => nav(`/call/${a.id}`)}>Start video call</button>}
        {upcoming && <button type="button" className="btn btn-outline btn-sm" onClick={() => { completeAppointment(a.id); toast('Consultation marked complete'); }}>Mark complete</button>}
        {a.status === 'completed' && !hasMatter && <button type="button" className="btn btn-accent btn-sm" onClick={() => onOpenMatter(a)}>Open matter</button>}
        {a.status === 'completed' && hasMatter && <Link to={`/staff/clients/${client.id}`} className="link-btn">View matter</Link>}
        {upcoming && <button type="button" className="link-btn" onClick={() => setResched(true)}>Reschedule</button>}
        {upcoming && <button type="button" className="link-btn" onClick={() => setCancel(true)}>Cancel</button>}
      </div>
      {resched && <RescheduleModal appt={a} onClose={() => setResched(false)} />}
      {cancel && <CancelModal appt={a} byStaff onClose={() => setCancel(false)} />}
    </div>
  );
}

// ---------- Dashboard ----------
export function Dashboard() {
  const { user, all, appts, matters, invoices, messages, docs, clientById, today, db } = useStaffData();
  const nav = useNavigate();
  const [openMatter, setOpenMatter] = useState(null);
  const todays = appts.filter((a) => a.date === today && a.status === 'confirmed');
  const upcoming = appts.filter((a) => a.date >= today && a.status === 'confirmed').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const newBookings = appts.filter((a) => a.status === 'confirmed' && Date.now() - a.createdAt < 48 * 3600 * 1000).length;
  const openMatters = matters.filter((m) => m.stage < 4).length;
  const outstanding = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + invoiceTotal(i), 0);
  const collected = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + invoiceTotal(i), 0);
  const unreadMsgs = messages.filter((m) => m.from === 'client' && !m.read);
  const toMatter = appts.filter((a) => a.status === 'completed' && !a.matterId);
  const awaitingSig = docs.filter((d) => d.status === 'needs-signature');
  const overdue = invoices.filter((i) => i.status !== 'paid' && daysUntil(i.due) < 0);
  const attention = [
    ...toMatter.map((a) => ({ k: 'm' + a.id, text: `Open a matter for ${clientById(a.clientId).name} (consultation completed)`, action: () => setOpenMatter(a), label: 'Open matter' })),
    ...unreadMsgs.reduce((acc, m) => (acc.find((x) => x.k === 'c' + m.clientId) ? acc : [...acc, { k: 'c' + m.clientId, text: `Unread message from ${clientById(m.clientId).name}`, action: () => nav('/staff/messages', { state: { clientId: m.clientId } }), label: 'Reply' }]), []),
    ...awaitingSig.map((d) => ({ k: d.id, text: `${clientById(d.clientId).name} hasn’t signed “${d.name}”`, action: () => nav(`/staff/clients/${d.clientId}`), label: 'View' })),
    ...overdue.map((i) => ({ k: i.id, text: `${i.id} (${clientById(i.clientId).name}) is overdue — ${naira(invoiceTotal(i))}`, action: () => nav('/staff/invoices'), label: 'Billing' })),
  ];
  const activity = db.activity.slice(0, 8);

  return (
    <main className="wrap portal-main">
      <div className="stack-6">
        <h1 className="portal-h1">{greeting()}, {user.name.split(' ')[0]}</h1>
        <p className="lead">{all ? 'Whole-firm view across all four lawyers.' : `Your diary, clients and matters.`} {todays.length} consultation{todays.length === 1 ? '' : 's'} today.</p>
      </div>

      <div className="tiles">
        <div className="tile"><span>Today’s consultations</span><b>{todays.length}</b></div>
        <div className="tile"><span>New bookings (48h)</span><b>{newBookings}</b></div>
        <div className="tile"><span>Open matters</span><b>{openMatters}</b></div>
        <div className="tile"><span>Outstanding fees</span><b>{naira(outstanding)}</b></div>
        {all && <div className="tile"><span>Collected to date</span><b>{naira(collected)}</b></div>}
      </div>

      <div className="portal-cols">
        <div className="portal-left">
          <section className="card">
            <div className="card-top card-top-c"><h2 className="card-h" style={{ marginBottom: 0 }}>Coming up</h2><Link to="/staff/diary" className="link-btn">Full diary</Link></div>
            {upcoming.length === 0 && <Empty>Nothing booked. New bookings from the website appear here instantly.</Empty>}
            {upcoming.slice(0, 5).map((a) => (<ApptRow key={a.id} a={a} onOpenMatter={setOpenMatter} />))}
          </section>
          <section className="card">
            <h2 className="card-h">Active matters</h2>
            {matters.length === 0 && <Empty>No matters yet.</Empty>}
            {matters.map((m) => (
              <Link key={m.id} to={`/staff/clients/${m.clientId}`} className="matter-row">
                <span className="matter-b"><span className="s-appt-t">{m.title}</span><span className="s-appt-s">{clientById(m.clientId).name} · {m.id} · {lawyerById(m.leadId).name}</span></span>
                <Pill tone="neutral">{STAGES[m.stage]}</Pill>
              </Link>
            ))}
          </section>
        </div>
        <div className="portal-right">
          <section className="card">
            <h2 className="card-h card-h-sm">Needs attention</h2>
            {attention.length === 0 && <Empty>All clear.</Empty>}
            {attention.map((t, i) => (
              <div key={t.k} className={`todo${i === 0 ? ' todo-first' : ''}`}>
                <span className="todo-b"><span className="todo-d" style={{ color: '#1C2B4B' }}>{t.text}</span></span>
                <button type="button" className="btn btn-outline btn-sm" onClick={t.action}>{t.label}</button>
              </div>
            ))}
          </section>
          <section className="card">
            <h2 className="card-h card-h-sm">Recent activity</h2>
            <ul className="activity">
              {activity.map((a) => (<li key={a.id}><span>{a.text}</span><em>{timeAgo(a.ts)}</em></li>))}
            </ul>
          </section>
        </div>
      </div>
      {openMatter && <OpenMatterModal appt={openMatter} onClose={() => setOpenMatter(null)} onDone={() => nav(`/staff/clients/${openMatter.clientId}`)} />}
    </main>
  );
}

// ---------- Diary ----------
export function Diary() {
  const { appts, all, today } = useStaffData();
  const nav = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [openMatter, setOpenMatter] = useState(null);
  const list = useMemo(() => {
    const sorted = [...appts].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (tab === 'upcoming') return sorted.filter((a) => a.status === 'confirmed' && a.date >= today);
    if (tab === 'completed') return sorted.filter((a) => a.status === 'completed' || (a.status === 'confirmed' && a.date < today)).reverse();
    return sorted.filter((a) => a.status === 'cancelled').reverse();
  }, [appts, tab, today]);
  const groups = list.reduce((m, a) => ((m[a.date] = m[a.date] || []).push(a), m), {});
  return (
    <main className="wrap portal-main">
      <div className="card-top card-top-c"><h1 className="portal-h1">Diary</h1><span className="muted-sm">{all ? 'All lawyers' : 'Your consultations'}</span></div>
      <div className="tabs" role="tablist">
        {[['upcoming', 'Upcoming'], ['completed', 'Completed'], ['cancelled', 'Cancelled']].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'tab-sel' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {list.length === 0 && <section className="card"><Empty>Nothing here.</Empty></section>}
      {Object.entries(groups).map(([date, items]) => (
        <section key={date} className="card">
          <h2 className="card-h card-h-sm">{dayShort(parseISO(date))} <span className="muted-sm">· {relativeDay(date)}</span></h2>
          {items.map((a) => (<ApptRow key={a.id} a={a} showLawyer={all} onOpenMatter={setOpenMatter} />))}
        </section>
      ))}
      {openMatter && <OpenMatterModal appt={openMatter} onClose={() => setOpenMatter(null)} onDone={() => nav(`/staff/clients/${openMatter.clientId}`)} />}
    </main>
  );
}

// ---------- Clients list ----------
export function Clients() {
  const { clients, matters, appts, invoices, messages, today } = useStaffData();
  return (
    <main className="wrap portal-main">
      <h1 className="portal-h1">Clients &amp; matters</h1>
      <section className="card">
        {clients.length === 0 && <Empty>No clients yet.</Empty>}
        {clients.map((c, i) => {
          const ms = matters.filter((m) => m.clientId === c.id);
          const next = appts.filter((a) => a.clientId === c.id && a.status === 'confirmed' && a.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
          const owed = invoices.filter((x) => x.clientId === c.id && x.status !== 'paid').reduce((s, x) => s + invoiceTotal(x), 0);
          const unread = messages.filter((m) => m.clientId === c.id && m.from === 'client' && !m.read).length;
          return (
            <Link key={c.id} to={`/staff/clients/${c.id}`} className={`client-row${i === clients.length - 1 ? ' last' : ''}`}>
              <span className="avatar">{initialsOf(c.name)}</span>
              <span className="client-b">
                <span className="s-appt-t">{c.name} {unread > 0 && <span className="badge-new">{unread} new</span>}</span>
                <span className="s-appt-s">{ms.length ? ms.map((m) => `${m.title} (${STAGES[m.stage]})`).join(' · ') : 'No matter yet'}</span>
              </span>
              <span className="client-meta">
                <span>{next ? `Next: ${relativeDay(next.date)} ${next.time}` : 'No upcoming'}</span>
                <span className={owed ? 'due' : ''}>{owed ? `${naira(owed)} outstanding` : 'Settled'}</span>
              </span>
            </Link>
          );
        })}
      </section>
    </main>
  );
}

// ---------- Client / matter workspace ----------
export function ClientPage() {
  const { id } = useParams();
  const { db, user, markInvoicePaid, sendMessage, markRead, toast } = useStore();
  const { clientById, appts, matters } = useStaffData();
  const [modal, setModal] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);
  const [viewInv, setViewInv] = useState(null);
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const client = clientById(id);
  const msgs = db.messages.filter((m) => m.clientId === id).sort((a, b) => a.ts - b.ts);
  useEffect(() => {
    markRead(id, 'staff');
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [id, msgs.length]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!client) return <Navigate to="/staff/clients" replace />;

  const myAppts = appts.filter((a) => a.clientId === id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const myMatters = matters.filter((m) => m.clientId === id);
  const docs = db.documents.filter((d) => d.clientId === id).sort((a, b) => b.ts - a.ts);
  const invs = db.invoices.filter((i) => i.clientId === id).sort((a, b) => b.issued - a.issued);
  const lead = myMatters[0];
  const liveDoc = viewDoc ? db.documents.find((d) => d.id === viewDoc) : null;
  const liveInv = viewInv ? db.invoices.find((i) => i.id === viewInv) : null;

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({ clientId: id, text: text.trim(), from: 'staff', senderName: user.name });
    setText('');
    toast('Message sent to client portal');
  };
  const statusPill = (d) => ({
    'needs-signature': <Pill tone="warn">Awaiting signature</Pill>, signed: <Pill tone="ok">Signed</Pill>, received: <Pill tone="neutral">Received</Pill>,
    shared: <Pill tone="neutral">Shared</Pill>, requested: <Pill tone="warn">Requested</Pill>, generated: <Pill tone="neutral">Generated</Pill>,
  }[d.status]);

  return (
    <main className="wrap portal-main">
      <nav className="crumbs"><Link to="/staff/clients">Clients &amp; matters</Link> &nbsp;/&nbsp; <span>{client.name}</span></nav>
      <div className="card-top card-top-c">
        <div className="stack-6">
          <h1 className="portal-h1">{client.name}</h1>
          <span className="muted-sm">{client.email} · {client.phone} · Reminders via {client.reminder}</span>
        </div>
        <div className="row-gap">
          <button type="button" className="btn btn-outline" onClick={() => setModal('request')}>Request document</button>
          <button type="button" className="btn btn-outline" onClick={() => setModal('share')}>Share document</button>
          <button type="button" className="btn btn-accent" onClick={() => setModal('invoice')}>New invoice</button>
        </div>
      </div>

      <div className="portal-cols">
        <div className="portal-left">
          {myMatters.length === 0 && (
            <section className="card stack-14">
              <h2 className="card-h" style={{ marginBottom: 0 }}>No matter yet</h2>
              <p className="muted-p">Once the consultation is complete, open a matter to send the engagement letter and start tracking progress.</p>
              {myAppts.find((a) => a.status === 'completed') && (
                <button type="button" className="btn btn-accent self-start" onClick={() => setModal({ open: myAppts.find((a) => a.status === 'completed') })}>Open matter</button>
              )}
            </section>
          )}
          {myMatters.map((m) => (
            <section key={m.id} className="card stack-14">
              <div className="card-top"><h2 className="card-h" style={{ marginBottom: 0 }}>{m.title}</h2><span className="muted-sm">{m.id} · {lawyerById(m.leadId).name}</span></div>
              <StagePanel matter={m} STAGES={STAGES} />
            </section>
          ))}

          <section className="card">
            <h2 className="card-h">Documents</h2>
            {docs.length === 0 && <Empty>No documents.</Empty>}
            {docs.map((d, i) => (
              <div key={d.id} className={`doc-row${i === docs.length - 1 ? ' last' : ''}`}>
                <span className={`doc-kind${d.fileKind === 'PDF' ? ' pdf' : ''}`}>{d.fileKind}</span>
                <span className="doc-b">
                  <button type="button" className="doc-name" onClick={() => setViewDoc(d.id)}>{d.name}</button>
                  <span className="doc-sub">{d.by === 'you' ? 'Uploaded by client' : d.by === 'system' ? 'Generated' : `Shared by ${d.by}`} · {dateShort(new Date(d.ts))}{d.signedName ? ` · signed by ${d.signedName}` : ''}</span>
                </span>
                {statusPill(d)}
                <button type="button" className="link-btn" onClick={() => setViewDoc(d.id)}>View</button>
              </div>
            ))}
          </section>

          <section className="card">
            <h2 className="card-h">Consultations</h2>
            {myAppts.length === 0 && <Empty>No consultations.</Empty>}
            {myAppts.map((a) => (
              <div key={a.id} className="s-appt">
                <div className="s-appt-time"><span>{isoDay(a.date)}</span><b>{a.time}</b></div>
                <div className="s-appt-b"><span className="s-appt-t">{apptTitle(a)}</span><span className="s-appt-s">{areaById(a.areaId).bookName} · {a.dur} min</span>{a.notes && <p className="brief">Notes: {a.notes}</p>}</div>
                <Pill tone={fmtTone(a.status)}>{a.status[0].toUpperCase() + a.status.slice(1)}</Pill>
              </div>
            ))}
          </section>
        </div>

        <div className="portal-right">
          <section className="card stack-14">
            <h2 className="card-h card-h-sm" style={{ marginBottom: 0 }}>Conversation</h2>
            {msgs.length === 0 && <Empty>No messages yet.</Empty>}
            <div className="thread thread-s">
              {msgs.map((m) => (
                <div key={m.id} className={`msg${m.from === 'staff' ? ' msg-me' : ''}`}>
                  <span className="msg-h">{m.from === 'staff' ? m.senderName : client.name} · {timeAgo(m.ts)}</span>
                  <span className="msg-t">{m.text}</span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="reply">
              <div className="reply-row">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${client.name.split(' ')[0]}…`} aria-label="Message" />
                <button type="submit" className="send-btn" aria-label="Send message">➤</button>
              </div>
            </form>
          </section>

          <section className="card">
            <h2 className="card-h card-h-sm">Invoices</h2>
            {invs.length === 0 && <Empty>No invoices.</Empty>}
            {invs.map((inv, i) => (
              <div key={inv.id} className={`inv-row${i === invs.length - 1 ? ' last' : ''}`}>
                <button type="button" className="inv-b" onClick={() => setViewInv(inv.id)}>
                  <span className="inv-t">{inv.id} · {inv.desc}</span>
                  <span className={`inv-s${inv.status !== 'paid' ? ' due' : ''}`}>{dueLabel(inv)}</span>
                </button>
                <span className="inv-amt">{naira(invoiceTotal(inv))}</span>
                {inv.status !== 'paid' && <button type="button" className="link-btn" onClick={() => { markInvoicePaid(inv.id); toast(`${inv.id} marked as paid`); }}>Mark paid</button>}
              </div>
            ))}
          </section>
        </div>
      </div>

      {modal === 'invoice' && <NewInvoiceModal clientId={id} matterId={lead?.id} onClose={() => setModal(null)} />}
      {modal === 'share' && <ShareDocModal client={client} matter={lead} onClose={() => setModal(null)} />}
      {modal === 'request' && <ShareDocModal mode="request" client={client} matter={lead} onClose={() => setModal(null)} />}
      {modal?.open && <OpenMatterModal appt={modal.open} onClose={() => setModal(null)} />}
      {liveDoc && <DocViewer doc={liveDoc} db={db} canSign={false} onSign={() => {}} onClose={() => setViewDoc(null)} />}
      {liveInv && <InvoiceViewer inv={liveInv} db={db} onClose={() => setViewInv(null)} />}
    </main>
  );
}

// ---------- Billing ----------
export function Billing() {
  const { invoices, clientById, all } = useStaffData();
  const { markInvoicePaid, toast, db } = useStore();
  const [modal, setModal] = useState(false);
  const [viewInv, setViewInv] = useState(null);
  const [filter, setFilter] = useState('all');
  const list = invoices.filter((i) => filter === 'all' || (filter === 'paid' ? i.status === 'paid' : i.status !== 'paid')).sort((a, b) => b.issued - a.issued);
  const paid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + invoiceTotal(i), 0);
  const due = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + invoiceTotal(i), 0);
  const overdue = invoices.filter((i) => i.status !== 'paid' && daysUntil(i.due) < 0).reduce((s, i) => s + invoiceTotal(i), 0);
  const live = viewInv ? db.invoices.find((i) => i.id === viewInv) : null;
  return (
    <main className="wrap portal-main">
      <div className="card-top card-top-c"><h1 className="portal-h1">Billing</h1><button type="button" className="btn btn-accent" onClick={() => setModal(true)}>New invoice</button></div>
      <div className="tiles">
        <div className="tile"><span>Collected</span><b>{naira(paid)}</b></div>
        <div className="tile"><span>Outstanding</span><b>{naira(due)}</b></div>
        <div className="tile"><span>Overdue</span><b className={overdue ? 'due' : ''}>{naira(overdue)}</b></div>
      </div>
      <div className="tabs" role="tablist">
        {[['all', 'All'], ['due', 'Outstanding'], ['paid', 'Paid']].map(([k, l]) => (<button key={k} type="button" role="tab" aria-selected={filter === k} className={filter === k ? 'tab-sel' : ''} onClick={() => setFilter(k)}>{l}</button>))}
      </div>
      <section className="card table-card">
        <table className="data-table">
          <thead><tr><th>Invoice</th><th>Client</th><th>Description</th><th>Status</th><th className="r">Amount</th><th /></tr></thead>
          <tbody>
            {list.map((inv) => {
              const od = inv.status !== 'paid' && daysUntil(inv.due) < 0;
              return (
                <tr key={inv.id}>
                  <td><button type="button" className="doc-name" onClick={() => setViewInv(inv.id)}>{inv.id}</button></td>
                  <td><Link to={`/staff/clients/${inv.clientId}`}>{clientById(inv.clientId).name}</Link></td>
                  <td>{inv.desc}</td>
                  <td>{inv.status === 'paid' ? <Pill tone="ok">Paid {dateShort(new Date(inv.paidAt))}</Pill> : <Pill tone={od ? 'warn' : 'neutral'}>{dueLabel(inv)}</Pill>}</td>
                  <td className="r">{naira(invoiceTotal(inv))}</td>
                  <td className="r">{inv.status !== 'paid' && <button type="button" className="link-btn" onClick={() => { markInvoicePaid(inv.id); toast(`${inv.id} marked as paid`); }}>Mark paid</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <Empty>No invoices match.</Empty>}
      </section>
      {all && <p className="muted-sm">Partners see billing for the whole firm; lawyers see only their own clients.</p>}
      {modal && <NewInvoiceModal onClose={() => setModal(false)} />}
      {live && <InvoiceViewer inv={live} db={db} onClose={() => setViewInv(null)} />}
    </main>
  );
}

// ---------- Inbox ----------
export function Inbox() {
  const { clients, messages, clientById } = useStaffData();
  const { user, sendMessage, markRead, toast } = useStore();
  const loc = useLocation();
  const [sel, setSel] = useState(loc.state?.clientId || null);
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const threads = clients
    .map((c) => {
      const ms = messages.filter((m) => m.clientId === c.id).sort((a, b) => a.ts - b.ts);
      return { c, ms, last: ms[ms.length - 1], unread: ms.filter((m) => m.from === 'client' && !m.read).length };
    })
    .filter((t) => t.ms.length)
    .sort((a, b) => b.last.ts - a.last.ts);
  const active = threads.find((t) => t.c.id === sel) || threads[0];
  useEffect(() => {
    if (active) markRead(active.c.id, 'staff');
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [active?.c.id, active?.ms.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    sendMessage({ clientId: active.c.id, text: text.trim(), from: 'staff', senderName: user.name });
    setText('');
    toast('Message sent to client portal');
  };
  return (
    <main className="wrap portal-main">
      <h1 className="portal-h1">Inbox</h1>
      <section className="inbox">
        <div className="inbox-list">
          {threads.length === 0 && <Empty>No conversations yet.</Empty>}
          {threads.map((t) => (
            <button key={t.c.id} type="button" className={`inbox-item${active?.c.id === t.c.id ? ' sel' : ''}`} onClick={() => setSel(t.c.id)}>
              <span className="avatar">{initialsOf(t.c.name)}</span>
              <span className="inbox-b"><span className="inbox-n">{t.c.name}{t.unread > 0 && <span className="badge-new">{t.unread}</span>}</span><span className="inbox-p">{t.last.text}</span></span>
              <em>{timeAgo(t.last.ts)}</em>
            </button>
          ))}
        </div>
        <div className="inbox-thread">
          {active ? (
            <>
              <div className="inbox-head"><b>{active.c.name}</b><Link to={`/staff/clients/${active.c.id}`} className="link-btn">Open client file</Link></div>
              <div className="thread thread-s">
                {active.ms.map((m) => (
                  <div key={m.id} className={`msg${m.from === 'staff' ? ' msg-me' : ''}`}>
                    <span className="msg-h">{m.from === 'staff' ? m.senderName : clientById(m.clientId).name} · {timeAgo(m.ts)}</span>
                    <span className="msg-t">{m.text}</span>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="reply"><div className="reply-row">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply…" aria-label="Reply" />
                <button type="submit" className="send-btn" aria-label="Send">➤</button>
              </div></form>
            </>
          ) : <Empty>Select a conversation.</Empty>}
        </div>
      </section>
    </main>
  );
}

