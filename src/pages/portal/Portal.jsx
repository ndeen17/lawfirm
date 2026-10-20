import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Logo, Empty, Pill, pickFile } from '../../components/ui';
import DocViewer from '../../components/DocViewer';
import { useStore } from '../../store';
import { areaById, lawyerById } from '../../data/static';
import { greeting, isoDay } from '../../lib/dates';
import { initialsOf } from '../../lib/format';
import {
  CancelModal, DocumentsSection, InvoicesSection, MatterCard, MessagesPanel, NextAppointment, RescheduleModal, TeamCard, WaitingOnYou,
  apptTitle, canChange, useClientData,
} from './parts';

export function PortalLayout() {
  const { user, logout, db } = useStore();
  const nav = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'client') return <Navigate to="/staff" replace />;
  const unread = db.messages.filter((m) => m.clientId === user.id && m.from === 'staff' && !m.read).length;
  return (
    <div className="portal">
      <header className="portal-head">
        <div className="wrap portal-head-in">
          <Logo size="md" tagline={false} sub="CLIENT PORTAL" />
          <nav aria-label="Portal" className="portal-nav">
            <NavLink to="/portal" end>Overview</NavLink>
            <NavLink to="/portal/appointments">Appointments</NavLink>
            <NavLink to="/portal/documents">Documents</NavLink>
            <NavLink to="/portal/invoices">Invoices</NavLink>
            <NavLink to="/portal/messages">Messages{unread > 0 && <i className="nav-dot">{unread}</i>}</NavLink>
          </nav>
          <span className="who-menu">
            <span className="avatar">{initialsOf(user.name)}</span>
            <span className="who-name">{user.name}</span>
            <button type="button" className="link-btn" onClick={() => { logout(); nav('/'); }}>Sign out</button>
          </span>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export function Overview() {
  const { user } = useStore();
  const { upcoming, todos, matters, invoices } = useClientData();
  const [resched, setResched] = useState(null);
  const [signDoc, setSignDoc] = useState(null);
  const { db, signDocument, uploadDocument, toast } = useStore();
  const next = upcoming[0];
  const liveDoc = signDoc ? db.documents.find((d) => d.id === signDoc.id) : null;
  const upload = (doc) =>
    pickFile((f) => {
      uploadDocument({ clientId: user.id, matterId: doc.matterId, name: f.name, size: f.size, requestId: doc.id, by: 'client' });
      toast(`${doc.name} uploaded — thank you`);
    });
  const dueCount = invoices.filter((i) => i.status !== 'paid').length;

  return (
    <main className="wrap portal-main">
      <div className="stack-6">
        <h1 className="portal-h1">{greeting()}, {user.name.split(' ')[0]}</h1>
        <p className="lead">
          You have <strong>{todos.length} thing{todos.length === 1 ? '' : 's'} to do</strong>
          {dueCount > 0 && <> and <strong>{dueCount} invoice{dueCount === 1 ? '' : 's'} to pay</strong></>}, plus {upcoming.length} upcoming appointment{upcoming.length === 1 ? '' : 's'}.
        </p>
      </div>
      <div className="portal-cols">
        <div className="portal-left">
          {next ? (
            <NextAppointment appt={next} onReschedule={() => setResched(next)} />
          ) : (
            <section className="next-appt next-none">
              <div className="stack-6">
                <span className="next-t">No upcoming appointments</span>
                <span className="next-s">Book a follow-up with your lawyer whenever you’re ready.</span>
              </div>
              <Link to="/book" className="btn btn-accent">Book a consultation</Link>
            </section>
          )}
          <WaitingOnYou todos={todos} onSign={setSignDoc} onUpload={upload} />
          <MatterCard matter={matters[0]} />
          <DocumentsSection limit={4} />
        </div>
        <div className="portal-right">
          <TeamCard matter={matters[0]} />
          <MessagesPanel />
          <InvoicesSection compact />
        </div>
      </div>
      {resched && <RescheduleModal appt={resched} onClose={() => setResched(null)} />}
      {liveDoc && (
        <DocViewer doc={liveDoc} db={db} canSign onSign={(name) => { signDocument(liveDoc.id, name); toast('Engagement letter signed — thank you'); setSignDoc(null); }} onClose={() => setSignDoc(null)} />
      )}
    </main>
  );
}

export function AppointmentsPage() {
  const nav = useNavigate();
  const { upcoming, past } = useClientData();
  const [resched, setResched] = useState(null);
  const [cancel, setCancel] = useState(null);
  const row = (a, isPast) => {
    const area = areaById(a.areaId);
    return (
      <div key={a.id} className="appt-row">
        <div className="appt-date"><span>{isoDay(a.date)}</span><b>{a.time}</b></div>
        <div className="appt-b">
          <span className="appt-t">{apptTitle(a)}</span>
          <span className="appt-s">{area.bookName} · {a.dur} min · Ref {a.ref || a.id.slice(3, 9).toUpperCase()}</span>
        </div>
        <div className="appt-act">
          {isPast ? (
            <Pill tone={a.status === 'completed' ? 'ok' : 'neutral'}>{a.status === 'completed' ? 'Completed' : 'Past'}</Pill>
          ) : (
            <>
              {a.format === 'video' && <button type="button" className="btn btn-navy btn-sm" onClick={() => nav(`/call/${a.id}`)}>Join video call</button>}
              <button type="button" className="btn btn-outline btn-sm" disabled={!canChange(a)} onClick={() => setResched(a)}>Reschedule</button>
              <button type="button" className="link-btn" disabled={!canChange(a)} onClick={() => setCancel(a)}>Cancel</button>
            </>
          )}
        </div>
      </div>
    );
  };
  return (
    <main className="wrap portal-main">
      <div className="card-top card-top-c">
        <h1 className="portal-h1">Appointments</h1>
        <Link to="/book" className="btn btn-accent">Book another consultation</Link>
      </div>
      <section className="card">
        <h2 className="card-h">Upcoming</h2>
        {upcoming.length === 0 ? <Empty>No upcoming appointments.</Empty> : upcoming.map((a) => row(a, false))}
        {upcoming.some((a) => !canChange(a)) && <p className="muted-sm" style={{ marginTop: 12 }}>Appointments less than 24 hours away can’t be changed online — please call the office.</p>}
      </section>
      <section className="card">
        <h2 className="card-h">Past &amp; closed</h2>
        {past.length === 0 ? <Empty>Nothing here yet.</Empty> : past.map((a) => row(a, true))}
      </section>
      {resched && <RescheduleModal appt={resched} onClose={() => setResched(null)} />}
      {cancel && <CancelModal appt={cancel} onClose={() => setCancel(null)} />}
    </main>
  );
}

export function DocumentsPage() {
  return (
    <main className="wrap portal-main">
      <h1 className="portal-h1">Documents</h1>
      <DocumentsSection title="All documents" />
    </main>
  );
}

export function InvoicesPage() {
  return (
    <main className="wrap portal-main">
      <h1 className="portal-h1">Invoices</h1>
      <InvoicesSection />
    </main>
  );
}

export function MessagesPage() {
  const { matters } = useClientData();
  const lead = matters[0] ? lawyerById(matters[0].leadId) : null;
  return (
    <main className="wrap portal-main" style={{ maxWidth: 820 }}>
      <h1 className="portal-h1">Messages</h1>
      <p className="lead">{lead ? `Your conversation with ${lead.name} and team. We reply within one business day.` : 'Write to your legal team. We reply within one business day.'}</p>
      <MessagesPanel full />
    </main>
  );
}

